import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  // Fetch quiz data on mount
  useEffect(() => {
    const startQuiz = async () => {
      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/quiz/${id}/start`,
          {},
          { withCredentials: true }
        );
        setQuizData(data.data.quiz);
        setQuestions(data.data.questions || []);
        setTimeLeft(data.data.quiz.durationMinutes * 60);
      } catch (err) {
        console.error("StartQuiz Error:", err?.response?.status, err?.response?.data, err);
        toast.error(err?.response?.data?.message || "Cannot load quiz");
        navigate("/quiz");
      }
    };
    startQuiz();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null]);

  const formatTime = (secs) => {
    if (secs === null) return "--:--";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Select an answer
  const selectAnswer = (questionId, selectedIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  };

  // Submit
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      clearInterval(timerRef.current);

      const answersArray = Object.entries(answers).map(([question, selectedIndex]) => ({
        question,
        selectedIndex,
      }));

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/quiz/${id}/submit`,
        { answers: answersArray },
        { withCredentials: true }
      );

      toast.success(`Quiz submitted! Score: ${data.data.score}/${data.data.totalMarks}`);
      navigate(`/quiz/${id}/result`);
    } catch (err) {
      console.error("SubmitQuiz Error:", err?.response?.status, err?.response?.data, err);
      toast.error(err?.response?.data?.message || "Submit failed");
      setSubmitting(false);
    }
  }, [answers, id, submitting]);

  if (!quizData) {
    return (
      <div className="py-20 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-4 border-primaryColor border-t-transparent rounded-full mx-auto mb-3" />
        Loading quiz...
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="py-5 max-w-3xl mx-auto">
      {/* Header with timer */}
      <div className="flex justify-between items-center mb-6 bg-white border rounded-lg p-4 shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold text-primaryColor">{quizData.title}</h1>
          <p className="text-sm text-gray-500">
            {answeredCount}/{questions.length} answered · {quizData.totalMarks} marks
          </p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-mono font-bold ${timeLeft <= 60 ? "text-red-500 animate-pulse" : "text-gray-700"}`}>
            {formatTime(timeLeft)}
          </p>
          <p className="text-xs text-gray-400">Time remaining</p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        {questions.map((q, idx) => (
          <div key={q._id} className="bg-white border rounded-lg p-4">
            <p className="font-medium text-gray-800 mb-3">
              <span className="text-primaryColor mr-2">Q{idx + 1}.</span>
              {q.questionText}
              <span className="text-xs text-gray-400 ml-2">({q.marks} marks)</span>
            </p>
            <div className="space-y-2">
              {q.options?.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer border transition-all
                    ${answers[q._id] === oi
                      ? "border-primaryColor bg-primaryColor/5"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    checked={answers[q._id] === oi}
                    onChange={() => selectAnswer(q._id, oi)}
                    className="accent-primaryColor"
                  />
                  <span className="text-sm">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-between items-center bg-white border rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500">
          {questions.length - answeredCount} question(s) unanswered
        </p>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
};

export default QuizAttempt;
