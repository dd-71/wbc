import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdLeaderboard, MdEmojiEvents } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

const QuizResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("result");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resResult, resBoard] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/quiz/result/${id}`, { withCredentials: true }).catch(() => null),
          axios.get(`${process.env.REACT_APP_API_URL}/quiz/leaderboard/${id}`, { withCredentials: true }).catch(() => null),
        ]);
        if (resResult?.data?.data) setResult(resResult.data.data);
        if (resBoard?.data?.data) setLeaderboard(resBoard.data.data);
      } catch (err) {
        console.error("FetchResult Error:", err?.response?.status, err?.response?.data, err);
        toast.error("Failed to load result");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-4 border-primaryColor border-t-transparent rounded-full mx-auto mb-3" />
        Loading results...
      </div>
    );
  }

  const gradeColor = {
    "A+": "text-green-600",
    A: "text-green-500",
    B: "text-blue-500",
    C: "text-yellow-500",
    D: "text-orange-500",
    F: "text-red-500",
  };

  const rankBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="py-5  mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/quiz")} className="text-xl text-gray-500 hover:text-primaryColor">
          <MdArrowBack />
        </button>
        <h1 className="text-2xl font-semibold text-primaryColor">
          {result?.quiz?.title || "Quiz"} — Results
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("result")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === "result"
              ? "bg-primaryColor text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          My Result
        </button>
        <button
          onClick={() => setTab("leaderboard")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
            tab === "leaderboard"
              ? "bg-primaryColor text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <MdLeaderboard /> Leaderboard
        </button>
      </div>

      {/* Result Tab */}
      {tab === "result" && (
        <>
          {result ? (
            <div className="bg-white border rounded-lg p-6 shadow-sm text-center">
              <div className={`text-6xl font-bold mb-2 ${gradeColor[result.grade] || "text-gray-700"}`}>
                {result.grade}
              </div>
              <p className="text-3xl font-semibold text-gray-800 mb-1">
                {result.score} / {result.totalMarks}
              </p>
              <p className="text-lg text-gray-500 mb-4">{result.percentage}%</p>

              <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Score</p>
                  <p className="text-lg font-semibold">{result.score}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Total</p>
                  <p className="text-lg font-semibold">{result.totalMarks}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Percentage</p>
                  <p className="text-lg font-semibold">{result.percentage}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-10 text-center text-gray-500">
              No result found. You may not have attempted this quiz yet.
            </div>
          )}
        </>
      )}

      {/* Leaderboard Tab */}
      {tab === "leaderboard" && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Rank</th>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Score</th>
                <th className="p-3 text-left">Percentage</th>
                <th className="p-3 text-left">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaderboard.length ? (
                leaderboard.map((entry) => (
                  <tr key={entry.rank} className={`hover:bg-gray-50 ${entry.rank <= 3 ? "bg-yellow-50/30" : ""}`}>
                    <td className="p-3 font-semibold text-lg">{rankBadge(entry.rank)}</td>
                    <td className="p-3 font-medium">{entry.user?.fullName || entry.user?.username || "—"}</td>
                    <td className="p-3">{entry.score}/{entry.totalMarks}</td>
                    <td className="p-3">{entry.percentage}%</td>
                    <td className={`p-3 font-bold ${gradeColor[entry.grade] || ""}`}>{entry.grade}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No results yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuizResult;
