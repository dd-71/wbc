import React, { useEffect, useMemo, useState } from "react";
import { MdCheckCircle, MdCancel, MdFilterList } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

import CommonButton from "../../components/common/CommonButton";
import { useAuth } from "../../context/AuthProvider";
import { usePermission } from "../../components/Hooks/usePermissions";

/* ──────────── Skeleton Loader ──────────── */
const AttendanceSkeleton = () =>
  [...Array(8)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
    </tr>
  ));

/* ──────────── Main Component ──────────── */
const Attendance = () => {
  const { user, role, branches } = useAuth();
  const { can } = usePermission();

  const roleName = typeof role === "string" ? role : role?.roleName || "";
  const isSuperAdmin = roleName === "super-admin";
  const isTutor = roleName === "tutor";
  const isStaff = ["admin", "tutor", "marketing-staff"].includes(roleName);

  /* ---------- Attendance history ---------- */
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  /* ---------- Filters ---------- */
  const [dateFilter, setDateFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [search, setSearch] = useState("");

  /* ---------- Pagination ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* ---------- Mark Student Attendance (tutor) ---------- */
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentPresent, setStudentPresent] = useState(true);
  const [markingStudent, setMarkingStudent] = useState(false);

  /* ════════════════════════════════════════════════
     API CALLS
  ════════════════════════════════════════════════ */

  // Fetch attendance history
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (branchFilter) params.branch = branchFilter;

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/attendance/get-attendance`,
        { params, withCredentials: true }
      );
      setRecords(data.data || []);
    } catch {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  // Mark self-attendance (admin / tutor / marketing-staff)
  const handleMarkSelf = async () => {
    try {
      setMarking(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/attendance/mark-attendance`,
        { isPresent: true },
        { withCredentials: true }
      );
      toast.success("Your attendance marked successfully!");
      fetchAttendance();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark attendance");
    } finally {
      setMarking(false);
    }
  };

  // Mark student attendance (tutor)
  const handleMarkStudent = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudent) {
      toast.error("Please select a class and a student");
      return;
    }
    try {
      setMarkingStudent(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/attendance/mark-attendance`,
        {
          classId: selectedClass,
          studentId: selectedStudent,
          isPresent: studentPresent,
        },
        { withCredentials: true }
      );
      toast.success("Student attendance marked!");
      setSelectedClass("");
      setSelectedStudent("");
      setStudentPresent(true);
      fetchAttendance();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to mark student attendance"
      );
    } finally {
      setMarkingStudent(false);
    }
  };

  // Fetch classes (for tutor to select)
  const fetchClasses = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/class/get-classes`,
        { withCredentials: true }
      );
      setClasses(data.data || []);
    } catch {
      console.error("Failed to fetch classes");
    }
  };

  // Fetch students (for tutor to select)
  const fetchStudents = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/get-all-users`,
        { withCredentials: true }
      );
      const studentList = (data.data || []).filter((u) => {
        const r = u.role?.roleName || u.role;
        return r === "student";
      });
      setStudents(studentList);
    } catch {
      console.error("Failed to fetch students");
    }
  };

  /* ════════════════════════════════════════════════
     EFFECTS
  ════════════════════════════════════════════════ */
  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, branchFilter]);

  useEffect(() => {
    if (isTutor) {
      fetchClasses();
      fetchStudents();
    }
  }, [isTutor]);

  /* ════════════════════════════════════════════════
     FILTERED + PAGINATED DATA
  ════════════════════════════════════════════════ */
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (!search) return true;
      const name = r.user?.fullName || r.user?.username || "";
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [records, search]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Smart pagination numbers
  const getPageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <div className="py-5">
      {/* ───────── HEADER ───────── */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-primaryColor">
          Attendance Management
        </h1>

        {isStaff && (
          <CommonButton
            label={marking ? "Marking..." : "✓ Mark My Attendance"}
            handler={handleMarkSelf}
          />
        )}
      </div>

      {/* ───────── TUTOR: MARK STUDENT ATTENDANCE ───────── */}
      {isTutor && (
        <form
          onSubmit={handleMarkStudent}
          className="bg-white border rounded-lg p-5 mb-6 shadow-sm"
        >
          <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
            <MdFilterList className="text-primaryColor" />
            Mark Student Attendance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Class selector */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className} — #{c.classNumber}
                  {c.classDate &&
                    ` (${new Date(c.classDate).toLocaleDateString()})`}
                </option>
              ))}
            </select>

            {/* Student selector */}
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.fullName} ({s.username})
                </option>
              ))}
            </select>

            {/* Present / Absent toggle */}
            <select
              value={studentPresent ? "present" : "absent"}
              onChange={(e) => setStudentPresent(e.target.value === "present")}
              className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>

            {/* Submit */}
            <button
              type="submit"
              disabled={markingStudent}
              className="px-4 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-60"
            >
              {markingStudent ? "Marking..." : "Mark Attendance"}
            </button>
          </div>
        </form>
      )}

      {/* ───────── FILTERS ───────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search by name */}
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          type="text"
          placeholder="Search by name"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

        {/* Date filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        />

        {dateFilter && (
          <button
            onClick={() => {
              setDateFilter("");
              setCurrentPage(1);
            }}
            className="text-xs text-red-500 hover:underline"
          >
            Clear date
          </button>
        )}

        {/* Branch filter (superadmin only) */}
        {isSuperAdmin && (
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
          >
            <option value="">All Branches</option>
            {branches?.map((b) => (
              <option key={b._id} value={b._id}>
                {b.city}
              </option>
            ))}
          </select>
        )}

        {/* Items per page */}
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

      {/* ───────── TABLE ───────── */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">Marked By</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <AttendanceSkeleton />
            ) : paginatedRecords.length ? (
              paginatedRecords.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  {/* User */}
                  <td className="p-3 font-medium">
                    {r.user?.fullName || r.user?.username || "—"}
                  </td>

                  {/* Date */}
                  <td className="p-3">
                    {new Date(r.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Status Badge */}
                  <td className="p-3">
                    {r.isPresent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        <MdCheckCircle /> Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                        <MdCancel /> Absent
                      </span>
                    )}
                  </td>

                  {/* Class */}
                  <td className="p-3">
                    {r.class ? r.class.className || `#${r.class.classNumber}` : "—"}
                  </td>

                  {/* Branch */}
                  <td className="p-3">
                    {r.branch?.city || "—"}
                  </td>

                  {/* Marked By */}
                  <td className="p-3 text-gray-500">
                    {r.markedBy?.fullName || r.markedBy?.username || "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ───────── PAGINATION ───────── */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of{" "}
            {filteredRecords.length} records
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
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
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
    </div>
  );
};

export default Attendance;