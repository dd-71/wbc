import React, { useEffect, useMemo, useState } from "react";
import { MdMoreVert, MdEdit, MdDelete, MdVisibility, MdViewModule, MdViewList } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

import CommonButton from "../../components/common/CommonButton";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import { useAuth } from "../../context/AuthProvider";
import { usePermission } from "../../components/Hooks/usePermissions";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import ViewCourseModal from "../../components/AdminSideComponents/CourseManagement/ViewCourseModal";
import CreateCourseModal from "../../components/AdminSideComponents/CourseManagement/CreateCourseModal";
import UpdateCourseStatusModal from "../../components/AdminSideComponents/CourseManagement/UpdateCourseStatusModal";
import CourseCardView from "../../components/AdminSideComponents/CourseManagement/CourseCardView";
import { useLockBodyScroll } from "../../components/Hooks/useLockBodyScroll";
import { Link } from "react-router-dom";

const CourseSkeleton = () => {
  return [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-10 w-16 bg-gray-200 rounded" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));
};

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAction, setOpenAction] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [updateStatusModal, setUpdateStatusModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  const domNode = useClickOutside(() => setOpenAction(null));
  useLockBodyScroll(openCreate);

  const { role, branches } = useAuth();
  const { can } = usePermission();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (branchFilter) params.branch = branchFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/course/all-courses/`,
        { params, withCredentials: true }
      );

      setCourses(data.data || []);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [branchFilter, statusFilter]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) =>
      c.courseName.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filteredCourses?.length / itemsPerPage);

  const paginatedCourses = filteredCourses?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const shouldOpenUp = (index) => {
    const rowPosition = index + 1;
    const rowsOnPage = paginatedCourses?.length;
    return rowPosition > rowsOnPage - 2;
  };

  // Smart pagination
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/course/${deleteId}`,
        { withCredentials: true }
      );
      toast.success("Course deleted");
      fetchCourses();
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">
          Course Management
        </h1>
        <div className="flex items-center gap-3">
          {/* VIEW TOGGLE */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm flex items-center gap-2 transition ${viewMode === "table"
                ? "from-primaryColor via-[#617cf5] to-primaryFadedColor bg-gradient-to-b text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              <MdViewList size={18} /> Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 text-sm flex items-center gap-2 transition ${viewMode === "card"
                ? "from-primaryColor via-[#617cf5] to-primaryFadedColor bg-gradient-to-b text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              <MdViewModule size={18} /> Cards
            </button>
          </div>

          {can("create") && (
            <CommonButton
              label="+ Create Course"
              handler={() => setOpenCreate(true)}
            />
          )}
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search course name"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

        {role === "super-admin" && (
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.city}
              </option>
            ))}
          </select>
        )}

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
        </select>


        {/* ITEMS PER PAGE */}
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
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* TABLE OR CARD VIEW */}
      {viewMode === "table" ? (
        <div className="bg-white border overflow-visible">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Banner</th>
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Branch</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <CourseSkeleton />
              ) : paginatedCourses?.length > 0 ? (
                paginatedCourses.map((c, index) => (
                  <tr key={c._id} className="hover:bg-gray-50 duration-300">
                    {/* BANNER */}
                    <td className="p-3">
                      {c.courseBannerImage ? (
                        <img
                          src={c.courseBannerImage}
                          alt="banner"
                          className="w-16 h-10 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-16 h-10 flex items-center justify-center bg-gray-100 text-gray-400 rounded border">
                          —
                        </div>
                      )}
                    </td>

                    {/* NAME */}
                    <td
                      onClick={() => {
                        setViewCourse(c);
                        setOpenView(true);
                      }}
                      className="font-medium text-gray-800 hover:text-primaryColor duration-300 cursor-pointer"
                    >
                      {c.courseName}
                    </td>

                    {/* BRANCH */}
                    <td className="p-3">{c.branch?.city}</td>

                    {/* PRICE */}
                    <td className="p-3">
                      {c.isPaid ? (
                        <div className="flex flex-col">
                          {/* FINAL PRICE */}
                          <span className="font-semibold text-gray-900">
                            ₹{Math.round(c.price * (1 - c.discount / 100))}
                          </span>

                          {/* ORIGINAL PRICE + DISCOUNT */}
                          {c.discount > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="line-through text-gray-400">
                                ₹{c.price}
                              </span>
                              <span className="text-green-600 font-medium">
                                {c.discount}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                          Free
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td
                      className="p-3 cursor-pointer"
                      title="change status"
                      onClick={() => {
                        if (can("edit")) {
                          setSelectedCourse(c);
                          setUpdateStatusModal(true);
                        }
                      }}
                    >
                      <span
                        className={`px-2 py-1 capitalize rounded-full text-xs font-medium ${c.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {c.status}
                      </span>

                    </td>

                    {/* ACTION */}
                    <td className="p-3 text-left relative">
                      <button
                        onClick={() =>
                          setOpenAction(openAction === c._id ? null : c._id)
                        }
                        className="text-xl p-1.5 hover:bg-gray-200 duration-300 rounded-lg"
                      >
                        <MdMoreVert />
                      </button>

                      {openAction === c._id && (
                        <div
                          ref={domNode}
                          className={`absolute text-xs -translate-x-32 z-20 bg-white border rounded-md shadow-lg w-32
                          ${shouldOpenUp(index) ? "bottom-8" : "top-8"}`}
                        >
                          {can("view") && (
                            <button
                              onClick={() => {
                                setViewCourse(c);
                                setOpenView(true);
                                setOpenAction(null);
                              }}
                              className="w-full px-3 py-2 text-slate-600 flex items-center gap-2 hover:bg-gray-100"
                            >
                              <MdVisibility /> View
                            </button>
                          )}
                          {can("edit") && (
                            <button
                              onClick={() => {
                                setEditCourse(c);
                                setOpenCreate(true);
                                setOpenAction(null);
                              }}
                              className="w-full px-3 py-2 flex text-green-600 items-center gap-2 hover:bg-gray-100"
                            >
                              <MdEdit /> Edit
                            </button>
                          )}
                          {can("delete") && (
                            <button
                              onClick={() => {
                                setDeleteId(c._id);
                                setDeleteModal(true);
                                setOpenAction(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                            >
                              <MdDelete /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARD VIEW */
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-40 rounded-t-xl" />
                <div className="bg-white p-4 space-y-3 rounded-b-xl border">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedCourses?.length > 0 ? (
          <CourseCardView
            courses={paginatedCourses}
            onView={(c) => {
              setViewCourse(c);
              setOpenView(true);
            }}
            onEdit={(c) => {
              setEditCourse(c);
              setOpenCreate(true);
            }}
            onDelete={(c) => {
              setDeleteId(c._id);
              setDeleteModal(true);
            }}
            onUpdateStatus={(c) => {
              setSelectedCourse(c);
              setUpdateStatusModal(true);
            }}
            openAction={openAction}
            setOpenAction={setOpenAction}
            domNode={domNode}
            can={can}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">No courses found</div>
        )
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredCourses?.length)} of{" "}
            {filteredCourses?.length} courses
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
                <span key={`ellipsis-${idx}`} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded
                    ${currentPage === page
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
      {openCreate && (
        <CreateCourseModal
          editData={editCourse}
          branches={branches}
          onSuccess={fetchCourses}
          onClose={() => {
            setOpenCreate(false);
            setEditCourse(null);
          }}
          openCreate={openCreate}
        />
      )}

      {openView && (
        <ViewCourseModal
          data={viewCourse}
          onClose={() => {
            setOpenView(false);
            setViewCourse(null);
          }}
        />
      )}

      {updateStatusModal && selectedCourse && (
        <UpdateCourseStatusModal
          course={selectedCourse}
          onClose={() => {
            setUpdateStatusModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={fetchCourses}
        />
      )}

      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Course"
        description="Are you sure you want to delete this course? Courses already used in batches cannot be deleted."
        confirmText="Delete Course"
      />
    </div>
  );
};

export default Course;