import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdAttachment,
  MdCalendarMonth,
  MdAssignment,
  MdPerson,
  MdCheckCircle,
  MdHourglassEmpty,
  MdRateReview,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdIndeterminateCheckBox,
} from "react-icons/md";
import { FiLoader } from "react-icons/fi";

import DeleteAlertModal from "../../common/DeleteAlertModal";
import UpsertHomeworkModal from "../ClassPlan/UpsertHomeworkModal";
import CommonButton from "../../common/CommonButton";

/* ───────── SKELETON COMPONENTS ───────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

const HomeworkSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
      <Skeleton className="h-5 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-48" />
        </div>
      ))}
    </div>
    <div>
      <Skeleton className="h-5 w-52 mb-4" />
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center p-4 border-b border-slate-50 bg-white">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ───────── STATUS CONFIG ───────── */
const STATUS_CONFIG = {
  pending: {
    icon: MdHourglassEmpty,
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  submitted: {
    icon: MdCheckCircle,
    label: "Submitted",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  "not-submitted": {
    icon: MdAssignment,
    label: "Not Submitted",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
  checked: {
    icon: MdRateReview,
    label: "Checked",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-400",
  },
};

const STATUS_OPTIONS = ["pending", "submitted", "not-submitted", "checked"];

/* ───────── MAIN COMPONENT ───────── */
const HomeworkTab = ({ classData }) => {
  const [homeworkData, setHomeworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [upsertModal, setUpsertModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // local student statuses (for optimistic bulk editing)
  const [studentStatuses, setStudentStatuses] = useState([]);

  // checkbox selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("pending");

  /* ───────── FETCH HOMEWORK ───────── */
  const fetchHomework = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/homework/${classData._id}/tutor`,
        { withCredentials: true }
      );
      const data = res.data.data;
      setHomeworkData(data);

      if (data?.students) {
        setStudentStatuses(
          data.students.map((s) => ({ ...s }))
        );
      }
    } catch (err) {
      setHomeworkData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  /* ───────── DELETE HOMEWORK ───────── */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/homework/${classData._id}`,
        { withCredentials: true }
      );
      toast.success("Homework deleted");
      setDeleteModal(false);
      fetchHomework();
    } catch {
      toast.error("Failed to delete homework");
    } finally {
      setDeleting(false);
    }
  };

  /* ───────── UPDATE SINGLE STUDENT STATUS (inline select) ───────── */
  const updateSingleStatus = async (studentId, status) => {
    // Optimistic local update
    setStudentStatuses((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/homework/${homeworkData.homework._id}/student/${studentId}`,
        { status },
        { withCredentials: true }
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
      // Revert on failure
      fetchHomework();
    }
  };

  /* ───────── CHECKBOX SELECTION ───────── */
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected =
    studentStatuses.length > 0 && selectedIds.size === studentStatuses.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < studentStatuses.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(studentStatuses.map((s) => s.studentId.toString())));
    }
  };

  /* ───────── BULK STATUS SAVE ───────── */
  const saveBulkStatus = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one student");
      return;
    }

    // Optimistically apply in UI
    setStudentStatuses((prev) =>
      prev.map((s) =>
        selectedIds.has(s.studentId.toString()) ? { ...s, status: bulkStatus } : s
      )
    );

    try {
      setBulkSaving(true);
      // Fire all updates in parallel
      await Promise.all(
        [...selectedIds].map((studentId) =>
          axios.put(
            `${process.env.REACT_APP_API_URL}/homework/${homeworkData.homework._id}/student/${studentId}`,
            { status: bulkStatus },
            { withCredentials: true }
          )
        )
      );
      toast.success(`Marked ${selectedIds.size} student${selectedIds.size !== 1 ? "s" : ""} as "${bulkStatus}"`);
      setSelectedIds(new Set());
    } catch {
      toast.error("Some updates failed, refreshing...");
      fetchHomework();
    } finally {
      setBulkSaving(false);
    }
  };

  if (loading) return <HomeworkSkeleton />;

  /* ───────── EMPTY STATE ───────── */
  if (!homeworkData?.homework) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-20 h-20 rounded-3xl bg-primaryColor/10 flex items-center justify-center mb-5 shadow-inner">
            <MdAssignment size={36} className="text-primaryColor/70" />
          </div>
          <p className="text-slate-700 font-semibold text-lg mb-1">No Homework Assigned Yet</p>
          <p className="text-slate-400 text-sm mb-7 text-center max-w-xs">
            Assign tasks for students to complete before the next session.
          </p>
          <CommonButton handler={() => setUpsertModal(true)} label={'Assign Homework'} icon={<MdAdd />} />
        </div>

        {upsertModal && (
          <UpsertHomeworkModal
            cls={classData}
            existingHomework={null}
            onClose={() => setUpsertModal(false)}
            onSuccess={() => { setUpsertModal(false); fetchHomework(); }}
          />
        )}
      </>
    );
  }

  const { homework } = homeworkData;

  /* Submission stats — computed from local state */
  const stats = {
    total: studentStatuses.length,
    submitted: studentStatuses.filter((s) => s.status === "submitted").length,
    checked: studentStatuses.filter((s) => s.status === "checked").length,
    pending: studentStatuses.filter((s) => s.status === "pending").length,
    notSubmitted: studentStatuses.filter((s) => s.status === "not-submitted").length,
  };

  return (
    <>
      <div className="space-y-6">
        {/* ── HEADER ── */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <MdAssignment size={17} className="text-indigo-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 tracking-wide">Homework Details</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setUpsertModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3.5 py-1.5 rounded-xl transition-all duration-150 hover:shadow-sm"
            >
              <MdEdit size={14} /> Edit
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3.5 py-1.5 rounded-xl transition-all duration-150 hover:shadow-sm"
            >
              <MdDelete size={14} /> Delete
            </button>
          </div>
        </div>

        {/* ── HOMEWORK INFO CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoCard label="Title" value={homework.title} accent="indigo" />

          {homework.description && (
            <InfoCard label="Description" value={homework.description} accent="slate" wide />
          )}

          {homework.dueDate && (
            <InfoCard
              label="Due Date"
              value={new Date(homework.dueDate).toLocaleDateString("en-IN", {
                weekday: "long", day: "2-digit", month: "long", year: "numeric",
              })}
              icon={MdCalendarMonth}
              accent="amber"
            />
          )}

          {homework.attachments?.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:col-span-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                <MdAttachment size={12} /> Attachments
              </p>
              <div className="flex flex-wrap gap-2">
                {homework.attachments.map((a, i) => (
                  <a
                    key={i}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-100 hover:border-indigo-300 px-3 py-1.5 rounded-lg hover:shadow-sm transition-all duration-150"
                  >
                    <MdAttachment size={12} /> {a.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SUBMISSION STATS ── */}
        <div className="grid grid-cols-4 gap-3">
          <StatPill label="Pending" value={stats.pending} color="amber" />
          <StatPill label="Submitted" value={stats.submitted} color="emerald" />
          <StatPill label="Not Submitted" value={stats.notSubmitted} color="rose" />
          <StatPill label="Checked" value={stats.checked} color="indigo" />
        </div>

        {/* ── STUDENTS TABLE ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MdPerson size={15} className="text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-700">Student Submission Status</h4>
            <span className="ml-auto text-xs text-slate-400 font-medium">
              {stats.total} student{stats.total !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ── TOOLBAR: select-all + bulk status ── */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl mb-2">
            {/* Select All */}
            <button
              onClick={toggleSelectAll}
              className="text-indigo-500 shrink-0"
              title={allSelected ? "Deselect all" : "Select all"}
            >
              {allSelected ? (
                <MdCheckBox size={22} />
              ) : someSelected ? (
                <MdIndeterminateCheckBox size={22} className="text-indigo-400" />
              ) : (
                <MdCheckBoxOutlineBlank size={22} className="text-slate-400" />
              )}
            </button>

            <span className="text-xs text-slate-500 font-medium flex-1">
              {selectedIds.size > 0
                ? `${selectedIds.size} student${selectedIds.size !== 1 ? "s" : ""} selected`
                : `${studentStatuses.length} students`}
            </span>

            {/* Bulk status controls — only when something selected */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-1 focus:ring-indigo-300 font-medium text-slate-700"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={saveBulkStatus}
                  disabled={bulkSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-60"
                >
                  {bulkSaving ? <FiLoader size={12} className="animate-spin" /> : null}
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* ── STUDENT ROWS ── */}
          <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {studentStatuses.map((s, idx) => {
              const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
              const isSelected = selectedIds.has(s.studentId.toString());

              return (
                <div
                  key={s.studentId}
                  className={`flex justify-between items-center px-4 py-3.5 transition-colors duration-100
                    ${isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50"}
                    ${idx !== studentStatuses.length - 1 ? "border-b border-slate-50" : ""}`}
                >
                  {/* Left: checkbox + avatar + info */}
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(s.studentId.toString())}
                      className="shrink-0 text-indigo-500"
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
                        {s.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 leading-tight">{s.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.email}</p>
                    </div>
                  </div>

                  {/* Right: inline status select */}
                  <div className="relative">
                    <div className={`flex items-center gap-1.5 px-1 py-0.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      <select
                        value={s.status}
                        onChange={(e) => updateSingleStatus(s.studentId, e.target.value)}
                        className={`text-xs font-medium bg-transparent border-none outline-none cursor-pointer pr-1 ${cfg.color}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {STATUS_CONFIG[opt].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {upsertModal && (
        <UpsertHomeworkModal
          cls={classData}
          existingHomework={homework}
          onClose={() => setUpsertModal(false)}
          onSuccess={() => { setUpsertModal(false); fetchHomework(); }}
        />
      )}

      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Homework"
        description="Are you sure you want to delete this homework?"
        confirmText="Delete"
      />
    </>
  );
};

/* ───────── SUB-COMPONENTS ───────── */
const ACCENT = {
  indigo: "text-indigo-500",
  amber: "text-amber-500",
  slate: "text-slate-400",
  rose: "text-rose-500",
};

const InfoCard = ({ label, value, icon: Icon, accent = "slate", wide }) => (
  <div className={`bg-slate-50 border border-slate-100 rounded-2xl p-4 ${wide ? "md:col-span-2" : ""}`}>
    <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1 ${ACCENT[accent]}`}>
      {Icon && <Icon size={11} />} {label}
    </p>
    <p className="text-sm text-slate-700 font-medium leading-relaxed">{value}</p>
  </div>
);

const StatPill = ({ label, value, color }) => {
  const colors = {
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    rose: "bg-rose-50 border-rose-100 text-rose-700",
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide opacity-70 mt-0.5">{label}</p>
    </div>
  );
};

export default HomeworkTab;