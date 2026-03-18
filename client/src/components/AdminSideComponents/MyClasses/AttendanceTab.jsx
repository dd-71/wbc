import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdIndeterminateCheckBox,
  MdPeople,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";

/* ───────── SKELETON ───────── */
const AttendanceSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
      <div className="h-5 bg-slate-200 rounded w-40" />
      <div className="flex gap-2">
        <div className="h-8 bg-slate-200 rounded-xl w-28" />
        <div className="h-8 bg-slate-200 rounded-xl w-28" />
      </div>
    </div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <div className="h-5 w-5 bg-slate-200 rounded" />
        <div className="w-9 h-9 bg-slate-200 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-slate-200 rounded w-36" />
          <div className="h-3 bg-slate-200 rounded w-24" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-slate-200 rounded-lg" />
          <div className="h-8 w-20 bg-slate-200 rounded-lg" />
        </div>
      </div>
    ))}
    <div className="flex justify-end pt-2">
      <div className="h-9 w-32 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

/* ───────── MAIN COMPONENT ───────── */
const AttendanceTab = ({ classData }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // selectedIds: Set of student _id strings checked for bulk action
  const [selectedIds, setSelectedIds] = useState(new Set());

  const classId = classData._id;

  /* ── FETCH ── */
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/attendance/class-students/${classId}`,
        { withCredentials: true }
      );
      setStudents(data.data);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  /* ── INDIVIDUAL TOGGLE ── */
  const toggleAttendance = (studentId, value) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, isPresent: value } : s))
    );
  };

  /* ── CHECKBOX SELECTION ── */
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = students.length > 0 && selectedIds.size === students.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < students.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s._id.toString())));
    }
  };

  /* ── BULK MARK ── */
  const bulkMark = (isPresent) => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one student");
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        selectedIds.has(s._id.toString()) ? { ...s, isPresent } : s
      )
    );
  };

  /* ── SAVE (bulk API) ── */
  const saveAttendance = async () => {
    try {
      setSaving(true);

      const attendances = students.map((s) => ({
        studentId: s._id,
        isPresent: s.isPresent ?? false,
      }));

      await axios.post(
        `${process.env.REACT_APP_API_URL}/attendance/bulk`,
        { classId, attendances },
        { withCredentials: true }
      );

      toast.success("Attendance saved successfully");
      setSelectedIds(new Set());
    } catch (err) {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  /* ── STATS ── */
  const presentCount = students.filter((s) => s.isPresent === true).length;
  const absentCount = students.filter((s) => s.isPresent === false).length;
  const unmarkedCount = students.filter((s) => s.isPresent === null).length;

  if (loading) return <AttendanceSkeleton />;

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-20 h-20 rounded-3xl bg-primaryColor/10 flex items-center justify-center mb-5 shadow-inner">
          <MdPeople size={36} className="text-primaryColor/70" />
        </div>
        <p className="text-slate-700 font-semibold text-lg mb-1">No Students Found</p>
        <p className="text-slate-400 text-sm text-center max-w-xs">
          No enrolled students found for this class.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── STATS BAR ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600 opacity-70 mt-0.5">Present</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-rose-700">{absentCount}</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-rose-600 opacity-70 mt-0.5">Absent</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-slate-500">{unmarkedCount}</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 opacity-70 mt-0.5">Unmarked</p>
        </div>
      </div>

      {/* ── TOOLBAR: select-all + bulk actions ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
        {/* Select All Checkbox */}
        <button
          onClick={toggleSelectAll}
          className="text-primaryFadedColor shrink-0"
          title={allSelected ? "Deselect all" : "Select all"}
        >
          {allSelected ? (
            <MdCheckBox size={22} />
          ) : someSelected ? (
            <MdIndeterminateCheckBox size={22} className="text-primaryColor" />
          ) : (
            <MdCheckBoxOutlineBlank size={22} className="text-slate-400" />
          )}
        </button>

        <span className="text-xs text-slate-500 font-medium flex-1">
          {selectedIds.size > 0
            ? `${selectedIds.size} student${selectedIds.size !== 1 ? "s" : ""} selected`
            : `${students.length} students`}
        </span>

        {/* Bulk action buttons — only shown when something is selected */}
        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => bulkMark(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <MdCheckCircle size={14} /> Mark Present
            </button>
            <button
              onClick={() => bulkMark(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              <MdCancel size={14} /> Mark Absent
            </button>
          </div>
        )}
      </div>

      {/* ── STUDENT ROWS ── */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {students.map((student, idx) => {
          const isSelected = selectedIds.has(student._id.toString());

          return (
            <div
              key={student._id}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors duration-100
                ${isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50"}
                ${idx !== students.length - 1 ? "border-b border-slate-50" : ""}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleSelect(student._id.toString())}
                className="shrink-0 text-primaryFadedColor"
              >
                {isSelected ? (
                  <MdCheckBox size={20} />
                ) : (
                  <MdCheckBoxOutlineBlank size={20} className="text-slate-300" />
                )}
              </button>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-slate-500">
                  {student.fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-700 text-sm leading-tight truncate">
                  {student.fullName}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{student.phoneNumber}</p>
              </div>

              {/* Individual Present / Absent buttons */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => toggleAttendance(student._id, true)}
                  className={`px-3.5 py-1.5 text-xs rounded-lg font-semibold transition-all duration-150 ${student.isPresent === true
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                    }`}
                >
                  Present
                </button>
                <button
                  onClick={() => toggleAttendance(student._id, false)}
                  className={`px-3.5 py-1.5 text-xs rounded-lg font-semibold transition-all duration-150 ${student.isPresent === false
                    ? "bg-rose-500 text-white shadow-sm shadow-rose-200"
                    : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                >
                  Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SAVE BUTTON ── */}
      <div className="flex justify-end pt-2">
        <button
          onClick={saveAttendance}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:shadow-md transition-all duration-200"
        >
          {saving ? <FiLoader className="animate-spin" size={15} /> : null}
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
};

export default AttendanceTab;