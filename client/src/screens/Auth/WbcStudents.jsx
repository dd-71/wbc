import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdMoreVert,
  MdDelete,
  MdVisibility,
  MdSchool,
  MdPayment,
  MdFilterList,
} from "react-icons/md";
import { LuGraduationCap } from "react-icons/lu";
import CommonButton from "../../components/common/CommonButton";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import axios from "axios";
import toast from "react-hot-toast";
import { usePermission } from "../../components/Hooks/usePermissions";
import { useAuth } from "../../context/AuthProvider";
import { useLockBodyScroll } from "../../components/Hooks/useLockBodyScroll";
import PageHeader from "../../components/common/PageHeader";
import AddPaymentModal from "../../components/AdminSideComponents/LeadManagement/AddPaymentModal";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";

const API = process.env.REACT_APP_API_URL;

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
const StudentSkeleton = () =>
  [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 h-9 w-9 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-3"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));

/* ─────────────────────────────────────────
   ENROLLMENT BADGE
───────────────────────────────────────── */
const EnrollmentBadge = ({ enrollments }) => {
  if (!enrollments?.length) {
    return <span className="text-xs text-gray-400 italic">No enrollments</span>;
  }

  const activeCount = enrollments.filter((e) => e.status === "enrolled").length;
  const totalCount = enrollments.length;

  return (
    <div className="flex flex-col gap-0.5">
      {enrollments.slice(0, 2).map((e, i) => (
        <span key={i} className="text-xs text-gray-600 truncate max-w-[140px]" title={e.course?.courseName}>
          {e.course?.courseName || "—"}
        </span>
      ))}
      {totalCount > 2 && (
        <span className="text-[11px] text-primaryColor font-medium">+{totalCount - 2} more</span>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   PAYMENT STATUS BADGE
───────────────────────────────────────── */
const PaymentStatusBadge = ({ lead }) => {
  if (!lead) {
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">—</span>;
  }

  const totalPaid = lead.payments
    ?.filter((p) => p.type !== "refund")
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  if (totalPaid === 0) {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 font-medium">
        Unpaid
      </span>
    );
  }

  return (
    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
      ₹{totalPaid.toLocaleString()}
    </span>
  );
};

/* ─────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const config = {
    enrolled: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${config[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const WBCStudent = () => {
  const { branches, user } = useAuth();
  const navigate = useNavigate();
  const domNode = useClickOutside(() => setOpenAction(null));

  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);

  // action states
  const [openAction, setOpenAction] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  /* SEARCH & FILTER */
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [enrollmentFilter, setEnrollmentFilter] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { can } = usePermission();
  useLockBodyScroll(showDelete || showAddPayment);

  /* ── FETCH ── */
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/student/get-all`, {
        withCredentials: true,
      });
      setStudents(data.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ── DELETE ── */
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const { data } = await axios.delete(
        `${API}/student/${selectedStudent._id}`,
        { withCredentials: true }
      );
      toast.success(data?.message || "Student deleted successfully");
      fetchStudents();
      setShowDelete(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error?.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── FILTERED + PAGINATED DATA ── */
  const filteredStudents = useMemo(() => {
    return students?.filter((s) => {
      const matchSearch =
        s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        String(s.phoneNumber)?.includes(search) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.username?.toLowerCase().includes(search.toLowerCase());

      const matchBranch =
        branchFilter === "" || s.branch?._id === branchFilter;

      const matchStatus =
        statusFilter === "" || s.status === statusFilter;

      const matchEnrollment =
        enrollmentFilter === "" ||
        s.enrollments?.some((e) => e.course?._id === enrollmentFilter || e.batch?._id === enrollmentFilter);

      return matchSearch && matchBranch && matchStatus && matchEnrollment;
    });
  }, [students, search, branchFilter, statusFilter, enrollmentFilter]);

  const totalPages = Math.ceil((filteredStudents?.length || 0) / itemsPerPage);

  const paginatedStudents = filteredStudents?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const shouldOpenUp = (index) => {
    const rowsOnPage = paginatedStudents?.length;
    return index + 1 > rowsOnPage - 2;
  };

  /* ── SMART PAGINATION ── */
  const getPageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  /* ── STATS ── */
  const stats = useMemo(() => {
    if (!students) return { total: 0, enrolled: 0, pending: 0 };
    return {
      total: students.length,
      enrolled: students.filter((s) => s.status === "enrolled").length,
      pending: students.filter((s) => s.status === "pending").length,
    };
  }, [students]);

  return (
    <div className="py-5">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          icon={LuGraduationCap}
          title="Student Management"
          subtitle="View and manage all enrolled students"
        />
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 transition">
            Export
          </button>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      {!loading && students && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MdSchool size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Students</p>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <LuGraduationCap size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.enrolled}</p>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Enrolled</p>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <MdFilterList size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pending</p>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH & FILTER ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          type="text"
          placeholder="Search name, phone, email"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Status</option>
          <option value="enrolled">Enrolled</option>
          <option value="pending">Pending</option>
        </select>

        {user?.role?.roleName === "super-admin" && (
          <select
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.city}</option>
            ))}
          </select>
        )}

        {/* ITEMS PER PAGE */}
        <select
          value={itemsPerPage}
          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="ml-auto px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white border overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">Enrollments</th>
              <th className="p-3 text-left">Batch</th>
              <th className="p-3 text-left">Total Paid</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <StudentSkeleton />
            ) : paginatedStudents?.length > 0 ? (
              paginatedStudents.map((student, index) => (
                <tr key={student._id} className="hover:bg-gray-50 duration-300">
                  {/* Student info - clickable to view details */}
                  <td
                    className="p-3 cursor-pointer group"
                    title="View student details"
                    onClick={() => navigate(`/wbc-students/${student._id}`)}
                  >
                    <div className="flex items-center gap-2 hover:text-primaryColor transition-colors duration-150">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primaryColor/20 to-primaryColor/40 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primaryColor">
                          {student.fullName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 leading-tight group-hover:text-primaryColor">{student.fullName}</p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-gray-600">{student.phoneNumber}</td>

                  <td className="p-3 text-gray-600">{student.branch?.city || "—"}</td>

                  <td className="p-3">
                    <EnrollmentBadge enrollments={student.enrollments} />
                  </td>

                  <td className="p-3 text-gray-600 text-xs">
                    {student.enrollments?.[0]?.batch?.batchName || "—"}
                  </td>

                  <td className="p-3">
                    <PaymentStatusBadge lead={student.lead} />
                  </td>

                  <td className="p-3">
                    <StatusBadge status={student.status} />
                  </td>

                  <td className="p-3 text-gray-500 text-xs">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 text-right relative">
                    <button
                      onClick={() =>
                        setOpenAction(openAction === student._id ? null : student._id)
                      }
                      className="text-xl p-1.5 hover:bg-gray-200 duration-300 rounded-lg"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === student._id && (
                      <div
                        ref={domNode}
                        className={`absolute text-xs right-10 z-20 bg-white border rounded-md shadow-lg w-40
                          ${shouldOpenUp(index) ? "bottom-8" : "top-8"}`}
                      >
                        {/* View Details */}
                        {can("view") && (
                          <button
                            onClick={() => {
                              navigate(`/wbc-students/${student._id}`);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-slate-600 hover:bg-gray-100"
                          >
                            <MdVisibility size={14} /> View Details
                          </button>
                        )}

                        {/* Add Payment — only if student has a linked lead */}
                        {can("edit") && student.lead && (
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowAddPayment(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                          >
                            <MdPayment size={14} /> Add Payment
                          </button>
                        )}

                        {/* Delete */}
                        {can("delete") && (
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDelete(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                          >
                            <MdDelete size={14} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-10 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <LuGraduationCap size={36} className="text-gray-300" />
                    <p className="font-medium">No students found</p>
                    <p className="text-xs text-gray-300">
                      {search || branchFilter || statusFilter
                        ? "Try adjusting your filters"
                        : "No students have been created yet"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredStudents?.length)} of{" "}
            {filteredStudents?.length} students
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
                <span key={`ellipsis-${idx}`} className="px-3 py-1">...</span>
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

      {/* ── MODALS ── */}

      {/* Add Payment — reuses the same AddPaymentModal from leads.
          The modal expects a `lead` prop with _id + name + phoneNumber + interestedEnrollments.
          We pass student.lead directly since it's populated with those fields. */}
      {showAddPayment && selectedStudent?.lead && (
        <AddPaymentModal
          lead={selectedStudent.lead}
          onClose={() => {
            setShowAddPayment(false);
            setSelectedStudent(null);
          }}
          addModal={showAddPayment}
          onSuccess={() => {
            fetchStudents();
            setShowAddPayment(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Delete */}
      {showDelete && selectedStudent && (
        <DeleteAlertModal
          onClose={() => {
            setShowDelete(false);
            setSelectedStudent(null);
          }}
          open={showDelete}
          onConfirm={handleDelete}
          loading={deleteLoading}
          title="Delete Student"
          description={
            `Are you sure you want to delete ${selectedStudent.fullName}? ` +
            "This will permanently remove the student, their linked lead, all attendance records, quiz attempts, and homework status. This action cannot be undone."
          }
          confirmText="Delete Student"
        />
      )}
    </div>
  );
};

export default WBCStudent;