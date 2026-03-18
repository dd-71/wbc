import React, { useEffect, useMemo, useState } from "react";
import {
  MdDelete,
  MdEdit,
  MdMoreVert,
  MdQuiz,
  MdVisibility,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import CommonButton from "../../components/common/CommonButton";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import CreateQuizModal from "../../components/AdminSideComponents/QuizManagement/CreateQuizModal";
import { useAuth } from "../../context/AuthProvider";
import { usePermission } from "../../components/Hooks/usePermissions";

/* Skeleton */
const QuizSkeleton = () =>
  [...Array(6)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));

const Quiz = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin } = useAuth();
  const isAdminUser = isSuperAdmin || isAdmin;

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [openAction, setOpenAction] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const domNode = useClickOutside(() => setOpenAction(null));
  const { can } = usePermission()

  /* Filters & Pagination */
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* Fetch quizzes */
  const fetchQuizzes = async () => {
    try {
      setLoading(true);

      const url = isAdminUser
        ? `${process.env.REACT_APP_API_URL}/quiz`
        : `${process.env.REACT_APP_API_URL}/quiz/available`;

      const { data } = await axios.get(url, { withCredentials: true });
      setQuizzes(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  /* Delete */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/quiz/${deleteId}`,
        { withCredentials: true }
      );
      toast.success("Quiz deleted");
      fetchQuizzes();
      setDeleteModal(false);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* Start attempt */
  const handleStart = async (quizId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/quiz/${quizId}/start`,
        {},
        { withCredentials: true }
      );
      navigate(`/quiz/${quizId}/attempt`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cannot start quiz");
    }
  };

  /* Filtered */
  const filtered = useMemo(() => {
    return quizzes.filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [quizzes, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++)
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const shouldOpenUp = (index) => {
    const rowPosition = index + 1;
    const rowsOnPage = paginated.length;
    return rowPosition > rowsOnPage - 2;
  };

  return (
    <div className="py-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">
          Quiz & Exam Management
        </h1>
        {
          can("create") &&
          <CommonButton label="+ Create Quiz" handler={() => setOpenModal(true)} />
        }

      </div>

      {/* SEARCH + PAGE SIZE */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          type="text"
          placeholder="Search quiz title"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="ml-auto px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Marks</th>
              <th className="p-3 text-left">Access</th>
              <th className="p-3 text-left">Status</th>
              {isAdminUser && <th className="p-3 text-center">Questions</th>}
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <QuizSkeleton />
            ) : paginated.length ? (
              paginated.map((q, index) => (
                <tr key={q._id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{q.title}</td>
                  <td className="p-3">{q.durationMinutes} min</td>
                  <td className="p-3">{q.totalMarks}</td>

                  {/* Paid / Free */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-semibold ${q.isPaid
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {q.isPaid ? "Paid" : "Free"}
                    </span>
                  </td>

                  {/* Active / Inactive */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-semibold ${q.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      {q.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {isAdminUser && (
                    <td className="p-3 text-center">{q.questionCount ?? "—"}</td>
                  )}

                  {/* ACTIONS */}
                  <td className="p-3 relative text-center">
                    <>
                      <button
                        onClick={() =>
                          setOpenAction(openAction === q._id ? null : q._id)
                        }
                        className="text-xl p-1.5 hover:bg-gray-200 duration-200 rounded-lg"
                      >
                        <MdMoreVert />
                      </button>

                      {openAction === q._id && (
                        <div
                          ref={domNode}
                          className={`absolute right-[6rem] z-20 bg-white border rounded-md shadow-lg w-36 text-xs ${shouldOpenUp(index) ? "bottom-8" : "top-8"}`}
                        >
                          {/* Questions */}
                          {
                            can("create") &&
                            <button
                              onClick={() => {
                                navigate(`/quiz/${q._id}/questions`);
                                setOpenAction(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                            >
                              <MdQuiz size={14} /> Questions
                            </button>

                          }

                          {/* Leaderboard */}
                          {/* <button
                            onClick={() => {
                              navigate(`/quiz/${q._id}/leaderboard`);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-purple-600 hover:bg-purple-50"
                          >
                            <MdVisibility size={14} /> Leaderboard
                          </button> */}

                          {/* Edit */}
                          {
                            can("edit") &&
                            <button
                              onClick={() => {
                                setEditQuiz(q);
                                setOpenModal(true);
                                setOpenAction(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 text-green-600 hover:bg-green-50"
                            >
                              <MdEdit size={14} /> Edit
                            </button>
                          }
                          {/* Delete */}
                          {
                            can("delete") &&
                            <button
                              onClick={() => {
                                setDeleteId(q._id);
                                setDeleteModal(true);
                                setOpenAction(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                            >
                              <MdDelete size={14} /> Delete
                            </button>
                          }
                        </div>
                      )}
                    </>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isAdminUser ? 7 : 6}
                  className="p-6 text-center text-gray-500"
                >
                  No quizzes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
            {filtered.length}
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Prev
            </button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={idx} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${currentPage === page
                    ? "bg-primaryColor text-white"
                    : "hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {openModal && (
        <CreateQuizModal
          editData={editQuiz}
          onSuccess={fetchQuizzes}
          onClose={() => {
            setOpenModal(false);
            setEditQuiz(null);
          }}
        />
      )}

      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Quiz"
        description="This will permanently delete the quiz, all questions and attempts."
        confirmText="Delete Quiz"
      />
    </div>
  );
};

export default Quiz;