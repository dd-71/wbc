import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MdAdd, MdEdit, MdDelete, MdBolt, MdCheckCircle, MdSchedule,
  MdDrafts, MdUploadFile, MdTimer, MdGrade, MdOutlineQuiz,
  MdOpenInNew, MdUpdate, MdClose, MdPerson, MdArrowBack,
} from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import TestFormModal from "./TestFormModal";
import DeleteAlertModal from "../../common/DeleteAlertModal";
import CommonButton from "../../common/CommonButton";
import { useLockBodyScroll } from "./../../Hooks/useLockBodyScroll";

const API = process.env.REACT_APP_API_URL;

/* ─────────────────────────────────────────
   SKELETON COMPONENTS
───────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

const TestTabSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-8 w-32 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MarksSkeleton = () => (
  <>
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex justify-between items-center p-4 border-b border-slate-50 bg-white">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    ))}
  </>
);

/* ─────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────── */
const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon: MdDrafts,
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-400",
    badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  published: {
    label: "Live",
    icon: MdBolt,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
  },
  completed: {
    label: "Completed",
    icon: MdCheckCircle,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-400",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
};

const gradeColor = (grade) => {
  if (!grade) return "text-slate-400";
  if (grade === "A+" || grade === "A") return "text-emerald-600 font-bold";
  if (grade === "B") return "text-blue-600 font-semibold";
  if (grade === "C") return "text-amber-600 font-semibold";
  if (grade === "D") return "text-orange-500 font-semibold";
  return "text-rose-600 font-semibold";
};

/* ─────────────────────────────────────────
   COUNTDOWN HOOK
   Returns { remaining (seconds), expired }
   Starts from `durationMinutes` when `startsAt` is set.
   Works even on remount — calculates elapsed from startsAt.
───────────────────────────────────────── */
const useCountdown = (test) => {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (test.status !== "published" || !test.startsAt || !test.durationMinutes) {
      setRemaining(null);
      return;
    }

    const totalSeconds = test.durationMinutes * 60;
    const startMs = new Date(test.startsAt).getTime();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      const left = totalSeconds - elapsed;
      setRemaining(left <= 0 ? 0 : left);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [test.status, test.startsAt, test.durationMinutes]);

  return { remaining, expired: remaining !== null && remaining === 0 };
};

/* Format seconds → mm:ss or hh:mm:ss */
const formatCountdown = (secs) => {
  if (secs === null) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/* ─────────────────────────────────────────
   UPDATE TEST STATUS MODAL
───────────────────────────────────────── */
const UpdateTestStatusModal = ({ test, onClose, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(test?.status || "draft");

  useEffect(() => { setTimeout(() => setAnimate(true), 10); }, []);

  const handleClose = () => { setAnimate(false); setTimeout(onClose, 250); };

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Live / Published" },
    { value: "completed", label: "Completed" },
  ].filter((opt) => {
    if (test.status === "completed") return opt.value === "completed";
    if (test.status === "published") return opt.value !== "draft";
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === test.status) { toast.error("Please select a different status"); return; }
    try {
      setLoading(true);
      await axios.patch(
        `${API}/surprise-test/${test._id}/status`,
        { status },
        { withCredentials: true }
      );
      toast.success(status === "published" ? "Test is now live!" : "Test marked as completed");
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}>
      <div className={`bg-white w-full max-w-md rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdUpdate className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Update Test Status</h2>
              <p className="text-xs text-blue-100">Change the current test status</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full bg-white hover:bg-gray-200 transition">
            <MdClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm font-semibold text-gray-800 line-clamp-2">{test.title}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                Current Status:
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[test.status]?.badgeColor || ""}`}>
                  {STATUS_CONFIG[test.status]?.label || test.status}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select New Status *</label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${status === option.value ? "border-primaryColor bg-blue-50 shadow-md scale-[1.02]" : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"} ${option.value === test.status ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      disabled={option.value === test.status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-5 h-5 text-primaryColor focus:ring-primaryColor cursor-pointer"
                    />
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[option.value]?.badgeColor || ""}`}>
                      {option.label}
                    </span>
                    {option.value === "published" && (
                      <span className="text-xs text-slate-400 ml-auto">Starts timer immediately</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-br-3xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || status === test.status}
              className="px-5 py-2.5 flex items-center gap-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-lg text-sm font-medium transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <FiLoader className="animate-spin" size={16} />}
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// STUDENT MARKS PANEL

const StudentMarksPanel = ({ test, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localMarks, setLocalMarks] = useState({});

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const { data: res } = await axios.get(
        `${API}/surprise-test/${test._id}/student-marks`,
        { withCredentials: true }
      );
      setData(res.data);
      const initial = {};
      res.data.students.forEach((s) => {
        initial[s.studentId] = s.marksObtained ?? "";
      });
      setLocalMarks(initial);
    } catch {
      toast.error("Failed to load student marks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMarks(); }, [test._id]);

  const handleSaveAll = async () => {
    const payload = data.students.map((s) => ({
      studentId: s.studentId,
      marksObtained:
        localMarks[s.studentId] !== "" && localMarks[s.studentId] !== undefined
          ? Number(localMarks[s.studentId])
          : 0,
    }));

    try {
      setSaving(true);
      await axios.put(
        `${API}/surprise-test/${test._id}/student-marks/bulk`,
        { studentMarks: payload },
        { withCredentials: true }
      );
      toast.success("All marks saved successfully");
      fetchMarks();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const entered = data?.students?.filter((s) => s.isEntered).length || 0;
  const total = data?.students?.length || 0;
  const avgPct =
    entered > 0
      ? Math.round(
        data.students
          .filter((s) => s.isEntered)
          .reduce((sum, s) => sum + s.percentage, 0) / entered
      )
      : null;

  return (
    <div className="space-y-5">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition"
        >
          <MdArrowBack size={14} /> Back to Tests
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <MdPerson size={15} className="text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 leading-tight">Student Marks</h3>
            <p className="text-xs text-slate-400 leading-tight">{test.title}</p>
          </div>
        </div>
        {data?.test?.totalMarks > 0 && (
          <span className="ml-auto text-xs text-slate-400 font-medium">
            Total: <span className="text-slate-600 font-semibold">{data.test.totalMarks} marks</span>
          </span>
        )}
      </div>

      {/* ── STATS ── */}
      {!loading && data && (
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Total Students" value={total} color="slate" />
          <StatPill label="Marks Entered" value={entered} color="indigo" />
          <StatPill label="Avg Score" value={avgPct !== null ? `${avgPct}%` : "–"} color="emerald" />
        </div>
      )}

      {/* ── NOTE ── */}
      {!loading && data?.students?.length > 0 && (
        <p className="text-xs text-slate-400 italic flex items-center gap-1.5">
          <MdCheckCircle size={13} className="text-amber-400" />
          Students with empty marks will be saved as <span className="font-semibold text-slate-500">0</span> when you click Save All.
        </p>
      )}

      {/* ── STUDENT LIST ── */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <MarksSkeleton />
        ) : !data?.students?.length ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            No students enrolled in this class.
          </div>
        ) : (
          data.students.map((s, idx) => (
            <div
              key={s.studentId}
              className={`flex justify-between items-center px-4 py-3.5 bg-white transition-colors hover:bg-slate-50 ${idx !== data.students.length - 1 ? "border-b border-slate-50" : ""
                }`}
            >
              <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2.5">
                {s.isEntered && (
                  <>
                    <span className="text-xs text-slate-400">{s.percentage}%</span>
                    <span className={`text-sm min-w-[28px] text-center ${gradeColor(s.grade)}`}>
                      {s.grade}
                    </span>
                  </>
                )}
                <input
                  type="number"
                  min={0}
                  max={data.test.totalMarks || undefined}
                  value={localMarks[s.studentId] ?? ""}
                  onChange={(e) =>
                    setLocalMarks((m) => ({ ...m, [s.studentId]: e.target.value }))
                  }
                  placeholder="0"
                  className="w-20 border border-slate-200 rounded-xl px-2.5 py-1.5 text-sm text-center outline-none focus:ring-1 focus:ring-primaryFadedColor focus:border-primaryColor transition bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── SAVE ALL BUTTON ── */}
      {!loading && data?.students?.length > 0 && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-lg transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <FiLoader size={14} className="animate-spin" />
            ) : (
              <MdCheckCircle size={15} />
            )}
            {saving ? "Saving..." : "Save All Marks"}
          </button>
        </div>
      )}
    </div>
  );
};

const CountdownBadge = ({ test, onExpired }) => {
  const { remaining, expired } = useCountdown(test);
  const firedRef = useRef(false);

  useEffect(() => {
    if (expired && !firedRef.current) {
      firedRef.current = true;
      onExpired();
    }
  }, [expired, onExpired]);

  if (remaining === null) return null;

  const isLow = remaining <= 60;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap
        ${isLow
          ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
          : "bg-amber-50 border-amber-200 text-amber-700"
        }`}
    >
      <MdTimer size={12} className={isLow ? "text-rose-500" : "text-amber-500"} />
      {expired ? "Time's up!" : formatCountdown(remaining)}
    </span>
  );
};

// TEST CARD

const TestCard = ({ test, onEdit, onDelete, onStatusChange, onViewMarks, onAutoComplete }) => {
  const cfg = STATUS_CONFIG[test.status] || STATUS_CONFIG.draft;
  const StatusIcon = cfg.icon;

  const totalMarks =
    test.questionMode === "manual"
      ? test.questions?.reduce((sum, q) => sum + (q.marks || 0), 0)
      : test.totalMarks;

  const isLive = test.status === "published";
  const isDraft = test.status === "draft";
  const isCompleted = test.status === "completed";

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : null;

  // Stable callback so CountdownBadge useEffect doesn't re-fire
  const handleExpired = useCallback(() => {
    onAutoComplete(test._id);
  }, [test._id, onAutoComplete]);

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-md">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
            <StatusIcon size={19} className={cfg.color} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm leading-tight">{test.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {test.questionMode === "manual"
                ? `${test.questions?.length || 0} questions`
                : "Uploaded paper"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}${isLive ? " animate-pulse" : ""}`} />
            {cfg.label}
          </span>
          {/* Live countdown badge */}
          {isLive && (
            <CountdownBadge test={test} onExpired={handleExpired} />
          )}
        </div>
      </div>

      {/* ── META ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        <MetaChip icon={MdTimer}>{test.durationMinutes} min</MetaChip>
        {totalMarks > 0 && <MetaChip icon={MdGrade}>{totalMarks} marks</MetaChip>}
        {test.questionMode === "upload" && (
          <MetaChip icon={MdUploadFile}>{test.paperType?.toUpperCase()}</MetaChip>
        )}
        {isLive && test.startsAt && (
          <MetaChip icon={MdSchedule}>
            {formatTime(test.startsAt)} – {formatTime(test.endsAt)}
          </MetaChip>
        )}
        {test.questionMode === "upload" && test.paperUrl && (
          <a
            href={test.paperUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-lg hover:bg-sky-100 transition"
          >
            <MdOpenInNew size={11} /> View Paper
          </a>
        )}
      </div>

      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {isDraft && (
          <>
            <ActionBtn icon={MdEdit} label="Edit" color="indigo" onClick={() => onEdit(test)} />
            <ActionBtn icon={MdUpdate} label="Update Status" color="emerald" onClick={() => onStatusChange(test)} />
            <ActionBtn icon={MdDelete} label="Delete" color="rose" onClick={() => onDelete(test._id)} />
          </>
        )}

        {isLive && (
          <ActionBtn icon={MdUpdate} label="Update Status" color="indigo" onClick={() => onStatusChange(test)} />
        )}

        {/* Enter Marks — only after completed */}
        {isCompleted && (
          <ActionBtn icon={MdPerson} label="Enter Marks" color="indigo" onClick={() => onViewMarks(test)} />
        )}

        {isCompleted && (
          <span className="text-xs text-slate-400 italic flex items-center gap-1 ml-1">
            <MdCheckCircle size={13} className="text-emerald-400" /> Completed
          </span>
        )}
      </div>
    </div>
  );
};

// MAIN — TestTab

const TestTab = ({ classData }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalTest, setModalTest] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [marksTarget, setMarksTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useLockBodyScroll(modalTest || statusTarget || deleteTarget);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API}/surprise-test/class/${classData._id}`,
        { withCredentials: true }
      );
      setTests(data.data || []);
    } catch {
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${API}/surprise-test/${deleteTarget}`,
        { withCredentials: true }
      );
      toast.success("Test deleted");
      setDeleteTarget(null);
      fetchTests();
    } catch {
      toast.error("Failed to delete test");
    } finally {
      setDeleting(false);
    }
  };

  /* Auto-complete when countdown hits zero */
  const handleAutoComplete = useCallback(async (testId) => {
    try {
      await axios.patch(
        `${API}/surprise-test/${testId}/status`,
        { status: "completed" },
        { withCredentials: true }
      );
      toast.success("Test time is up — marked as completed");
      fetchTests();
    } catch {
      // Silently retry on next tick via refetch; don't toast to avoid noise
      fetchTests();
    }
  }, []);

  const stats = {
    draft: tests.filter((t) => t.status === "draft").length,
    published: tests.filter((t) => t.status === "published").length,
    completed: tests.filter((t) => t.status === "completed").length,
  };

  if (loading) return <TestTabSkeleton />;

  if (marksTarget) {
    return (
      <StudentMarksPanel
        test={marksTarget}
        onBack={() => setMarksTarget(null)}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* ── HEADER ── */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <MdBolt size={17} className="text-indigo-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 tracking-wide">Surprise Tests</h3>
          </div>
          <button
            onClick={() => setModalTest({})}
            className="px-3 flex items-center gap-1 py-1.5 text-sm bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
          >
            <MdAdd size={15} /> Create Test
          </button>
        </div>

        {/* ── STATS ── */}
        {tests.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <StatPill label="Draft" value={stats.draft} color="slate" />
            <StatPill label="Live" value={stats.published} color="emerald" />
            <StatPill label="Completed" value={stats.completed} color="indigo" />
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-20 h-20 rounded-3xl bg-primaryColor/10 flex items-center justify-center mb-5 shadow-inner">
              <MdOutlineQuiz size={36} className="text-primaryColor/70" />
            </div>
            <p className="text-slate-700 font-semibold text-lg mb-1">No Tests Created Yet</p>
            <p className="text-slate-400 text-sm mb-7 text-center max-w-xs">
              Create a surprise test to assess your students instantly.
            </p>
            <CommonButton handler={() => setModalTest({})} icon={<MdAdd size={16} />} label="Create First Test" />
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                onEdit={(t) => setModalTest(t)}
                onDelete={(id) => setDeleteTarget(id)}
                onStatusChange={(t) => setStatusTarget(t)}
                onViewMarks={(t) => setMarksTarget(t)}
                onAutoComplete={handleAutoComplete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {modalTest !== null && (
        <TestFormModal
          classId={classData._id}
          existingTest={modalTest._id ? modalTest : null}
          onClose={() => setModalTest(null)}
          onSuccess={() => { setModalTest(null); fetchTests(); }}
        />
      )}

      {statusTarget && (
        <UpdateTestStatusModal
          test={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => { setStatusTarget(null); fetchTests(); }}
        />
      )}

      <DeleteAlertModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Surprise Test"
        description="Are you sure you want to delete this test? This action cannot be undone."
        confirmText="Delete Test"
      />
    </>
  );
};

/* ─────────────────────────────────────────
   SHARED SUB-COMPONENTS
───────────────────────────────────────── */
const MetaChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
    <Icon size={12} className="text-slate-400 shrink-0" />
    {children}
  </span>
);

const StatPill = ({ label, value, color }) => {
  const colors = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide opacity-70 mt-0.5">{label}</p>
    </div>
  );
};

const ACTION_COLORS = {
  indigo: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100",
  emerald: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100",
  rose: "text-rose-500 bg-rose-50 hover:bg-rose-100 border-rose-100",
};

const ActionBtn = ({ icon: Icon, label, color = "indigo", onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-xl transition-all duration-150 hover:shadow-sm ${ACTION_COLORS[color]}`}
  >
    <Icon size={13} /> {label}
  </button>
);

export default TestTab;