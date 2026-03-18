import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdCalendarMonth,
  MdCancel,
  MdCheckCircle,
  MdEditNote,
  MdLock,
  MdPlayCircle,
  MdSchedule,
  MdSchool,
  MdSearch
} from "react-icons/md";
import UpsertClassPlanModal from "../../components/AdminSideComponents/ClassPlan/UpsertClassPlanModal";
import ViewClassPlanModal from "../../components/AdminSideComponents/ClassPlan/ViewClassPlanModal";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { useAuth } from "../../context/AuthProvider";
import { useLockBodyScroll } from './../../components/Hooks/useLockBodyScroll';

/* ─── helpers ─────────────────────────────────────────────── */
const STATUS_META = {
  draft: { label: "Draft", icon: MdEditNote, color: "text-slate-500", bg: "bg-slate-100" },
  scheduled: { label: "Scheduled", icon: MdSchedule, color: "text-blue-600", bg: "bg-blue-50" },
  ongoing: { label: "Ongoing", icon: MdPlayCircle, color: "text-amber-600", bg: "bg-amber-50" },
  completed: { label: "Completed", icon: MdCheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  cancelled: { label: "Cancelled", icon: MdCancel, color: "text-red-500", bg: "bg-red-50" },
  rescheduled: { label: "Rescheduled", icon: MdSchedule, color: "text-purple-600", bg: "bg-purple-50" },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });

const fmtMonth = (d) =>
  new Date(d).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const groupByMonth = (classes) => {
  const map = {};
  classes.forEach((c) => {
    const key = new Date(c.classDate).toISOString().slice(0, 7);
    if (!map[key]) map[key] = [];
    map[key].push(c);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
};

/* ─── skeleton ─────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2].map((g) => (
      <div key={g}>
        <div className="h-5 w-40 bg-slate-200 rounded mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

//status badge 
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color} ${meta.bg}`}>
      <Icon size={12} /> {meta.label}
    </span>
  );
};

// plan indicator
const PlanDot = ({ hasPlan }) =>
  hasPlan ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
      <MdCheckCircle size={11} /> Plan ready
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-dashed border-slate-300">
      No plan yet
    </span>
  );

// restricted view
const RestrictedView = ({ role }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center py-20">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primaryColor/10 to-primaryColor/5 flex items-center justify-center border border-primaryColor/10">
      <MdLock size={36} className="text-primaryColor/40" />
    </div>
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-1">Tutor Access Only</h2>
      <p className="text-slate-400 text-sm max-w-xs">
        Class plans are created and managed by tutors. As a{" "}
        <span className="font-medium capitalize">{role?.replace("-", " ")}</span>, you can view
        class plans from within individual class records.
      </p>
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-full border">
      <MdSchool size={14} /> Navigate to Batch → Course → Select a Class to view its class plan.
    </div>
  </div>
);

// CLASS CARD
const ClassCard = ({ cls, onPlan, onView, onDeletePlan }) => {
  const isToday = new Date(cls.classDate).toDateString() === new Date().toDateString();
  const isPast = new Date(cls.classDate) < new Date() && !isToday;

  return (
    <div
      className={`group relative flex items-center gap-4 bg-white rounded-xl border px-4 py-3.5 hover:shadow-md transition-all duration-200 ${isToday ? "border-primaryColor/30 shadow-sm ring-1 ring-primaryColor/10" : "border-slate-200"
        }`}
    >
      {/* date column */}
      <div
        className={`shrink-0 w-14 text-center rounded-lg py-2 ${isToday
          ? "bg-gradient-to-b from-primaryColor to-[#617cf5] text-white"
          : isPast
            ? "bg-slate-100 text-slate-400"
            : "bg-blue-50 text-blue-600"
          }`}
      >
        <p className="text-[10px] font-semibold uppercase leading-none mb-0.5">
          {new Date(cls.classDate).toLocaleDateString("en-IN", { weekday: "short" })}
        </p>
        <p className="text-xl font-bold leading-none">
          {new Date(cls.classDate).getDate()}
        </p>
        <p className="text-[9px] uppercase leading-none mt-0.5">
          {new Date(cls.classDate).toLocaleDateString("en-IN", { month: "short" })}
        </p>
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-semibold text-slate-800 text-sm truncate">{cls.className}</p>
          {isToday && (
            <span className="text-[10px] font-bold text-white bg-primaryColor px-1.5 py-0.5 rounded uppercase tracking-wide">
              Today
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={cls.status} />
          <PlanDot hasPlan={!!cls.plan} />
          {cls.slot && (
            <span className="text-xs text-slate-400">
              {cls.slot.startTime} – {cls.slot.endTime}
            </span>
          )}
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 shrink-0">
        {cls.plan ? (
          <>
            <button
              onClick={() => onView(cls)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
            >
              View Plan
            </button>
            <button
              onClick={() => onPlan(cls)}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDeletePlan(cls)}
              className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
            >
              Remove
            </button>
          </>
        ) : (
          <button
            onClick={() => onPlan(cls)}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-b from-primaryColor via-[#617cf5] to-primaryFadedColor hover:opacity-90 px-3 py-1.5 rounded-lg transition"
          >
            <MdAdd size={14} /> Add Plan
          </button>
        )}
      </div>
    </div>
  );
};

// MAIN PAGE
const ClassPlan = () => {
  const { user, role } = useAuth();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  /* filters */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");   // "YYYY-MM"

  /* modals */
  const [upsertModal, setUpsertModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeClass, setActiveClass] = useState(null);

  useLockBodyScroll(upsertModal || viewModal || deleteModal);

  /* ── fetch assigned classes ── */
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/class/get-classes/`,
        { withCredentials: true }
      );
      const list = data.data || [];
      setClasses(list);
    } catch {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    try {
      setDeleting(true);

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/class-plan/${activeClass._id}`,
        { withCredentials: true }
      );

      toast.success("Class plan deleted successfully");

      setDeleteModal(false);
      fetchClasses();

    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete plan");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (role === "tutor") fetchClasses();
  }, [role]);

  /* ── filter ── */
  const filtered = useMemo(() => {
    return classes.filter((c) => {
      const matchSearch = c.className?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter ? c.status === statusFilter : true;
      const matchMonth = monthFilter
        ? new Date(c.classDate).toISOString().slice(0, 7) === monthFilter
        : true;
      return matchSearch && matchStatus && matchMonth;
    });
  }, [classes, search, statusFilter, monthFilter]);

  /* ── grouped ── */
  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  /* ── unique months for filter ── */
  const availableMonths = useMemo(() => {
    const keys = [...new Set(classes.map((c) => new Date(c.classDate).toISOString().slice(0, 7)))];
    return keys.sort();
  }, [classes]);

  /* ── handlers ── */
  const openPlan = (cls) => { setActiveClass(cls); setUpsertModal(true); };
  const openView = (cls) => { setActiveClass(cls); setViewModal(true); };
  const openDelete = (cls) => { setActiveClass(cls); setDeleteModal(true); };

  const onPlanSaved = () => {
    setUpsertModal(false);
    fetchClasses();
  };
  // const onPlanDeleted = () => {
  //   setDeleteModal(false);
  //   fetchClasses();
  // };

  // stats
  const stats = useMemo(() => ({
    total: classes.length,
    planned: classes.filter(c => c.plan).length,
    today: classes.filter(
      (c) => new Date(c.classDate).toDateString() === new Date().toDateString()
    ).length,
    upcoming: classes.filter(
      (c) => new Date(c.classDate) > new Date()
    ).length,
  }), [classes]);

  // non-tutor view
  if (role !== "tutor") return (
    <div className="py-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-primaryColor to-[#617cf5] flex items-center justify-center shadow">
          <MdCalendarMonth size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-primaryColor leading-none">Class Plans</h1>
          <p className="text-xs text-slate-400 mt-0.5">Tutor class preparation workspace</p>
        </div>
      </div>
      <RestrictedView role={role} />
    </div>
  );

  return (
    <div className="py-5">
      {/* ── HEADER ── */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-primaryColor to-[#617cf5] flex items-center justify-center shadow">
            <MdCalendarMonth size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-primaryColor leading-none">My Class Plans</h1>
            <p className="text-xs text-slate-400 mt-0.5">Plan topics, materials & homework for your classes</p>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Classes", val: stats.total, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "Plans Created", val: stats.planned, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Today", val: stats.today, color: "text-primaryColor", bg: "bg-primaryColor/5" },
          { label: "Upcoming", val: stats.upcoming, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`rounded-xl border border-slate-200 ${bg} px-4 py-3`}>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class name..."
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 ring-primaryColor outline-none w-56"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Months</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {new Date(m + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>

        {(search || statusFilter || monthFilter) && (
          <button
            onClick={() => { setSearch(""); setStatusFilter(""); setMonthFilter(""); }}
            className="text-xs text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            Clear filters
          </button>
        )}

        <div className="ml-auto text-xs text-slate-400">
          {filtered.length} class{filtered.length !== 1 ? "es" : ""}
        </div>
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <MdCalendarMonth size={30} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No classes found</p>
          <p className="text-slate-400 text-sm">
            {search || statusFilter || monthFilter
              ? "Try adjusting your filters"
              : "You haven't been assigned any classes yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([monthKey, monthClasses]) => (
            <div key={monthKey}>
              {/* month header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <MdCalendarMonth size={16} className="text-primaryColor" />
                  <h2 className="font-semibold text-slate-700 text-sm">
                    {new Date(monthKey + "-01").toLocaleDateString("en-IN", {
                      month: "long", year: "numeric",
                    })}
                  </h2>
                </div>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400">{monthClasses.length} class{monthClasses.length !== 1 ? "es" : ""}</span>
              </div>

              {/* class cards */}
              <div className="space-y-2.5">
                {monthClasses.map((cls) => (
                  <ClassCard
                    key={cls._id}
                    cls={cls}
                    onPlan={openPlan}
                    onView={openView}
                    onDeletePlan={openDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODALS ── */}
      {upsertModal && activeClass && (
        <UpsertClassPlanModal
          cls={activeClass}
          existingPlan={activeClass.plan}
          onClose={() => setUpsertModal(false)}
          onSuccess={onPlanSaved}
        />
      )}

      {viewModal && activeClass && (
        <ViewClassPlanModal
          cls={activeClass}
          plan={activeClass.plan}
          onClose={() => setViewModal(false)}
          onEdit={() => { setViewModal(false); openPlan(activeClass); }}
        />
      )}

      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeletePlan}
        loading={deleting}
        title="Delete Class Plan"
        description="Are you sure you want to delete this class plan? This action cannot be undone."
        confirmText="Delete Plan"
      />

    </div>
  );
};

export default ClassPlan;