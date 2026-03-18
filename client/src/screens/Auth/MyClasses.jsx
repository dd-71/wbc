import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdCalendarMonth,
  MdCancel,
  MdCheckCircle,
  MdEditNote,
  MdPlayCircle,
  MdSchedule,
  MdSearch,
} from "react-icons/md";


const STATUS_META = {
  draft: { label: "Draft", icon: MdEditNote, color: "text-slate-500", bg: "bg-slate-100" },
  scheduled: { label: "Scheduled", icon: MdSchedule, color: "text-blue-600", bg: "bg-blue-50" },
  ongoing: { label: "Ongoing", icon: MdPlayCircle, color: "text-amber-600", bg: "bg-amber-50" },
  completed: { label: "Completed", icon: MdCheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  cancelled: { label: "Cancelled", icon: MdCancel, color: "text-red-500", bg: "bg-red-50" },
  rescheduled: { label: "Rescheduled", icon: MdSchedule, color: "text-purple-600", bg: "bg-purple-50" },
};


const groupByMonth = (classes) => {
  const map = {};
  classes.forEach((c) => {
    const key = new Date(c.classDate).toISOString().slice(0, 7);
    if (!map[key]) map[key] = [];
    map[key].push(c);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
};


const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.draft;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color} ${meta.bg}`}
    >
      <Icon size={12} /> {meta.label}
    </span>
  );
};


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


const ClassCard = ({ cls, navigate }) => {
  const isToday =
    new Date(cls.classDate).toDateString() === new Date().toDateString();

  const isPast =
    new Date(cls.classDate) < new Date() && !isToday;

  return (
    <div
      className={`group relative flex items-center gap-4 bg-white rounded-xl border px-4 py-3.5 hover:shadow-md transition-all duration-200 ${isToday
        ? "border-primaryColor/30 shadow-sm ring-1 ring-primaryColor/10"
        : "border-slate-200"
        }`}
    >
      <div
        className={`shrink-0 w-14 text-center rounded-lg py-2 ${isToday
          ? "bg-gradient-to-b from-primaryColor to-[#617cf5] text-white"
          : isPast
            ? "bg-slate-100 text-slate-400"
            : "bg-blue-50 text-blue-600"
          }`}
      >
        <p className="text-[10px] font-semibold uppercase leading-none mb-0.5">
          {new Date(cls.classDate).toLocaleDateString("en-IN", {
            weekday: "short",
          })}
        </p>
        <p className="text-xl font-bold leading-none">
          {new Date(cls.classDate).getDate()}
        </p>
        <p className="text-[9px] uppercase leading-none mt-0.5">
          {new Date(cls.classDate).toLocaleDateString("en-IN", {
            month: "short",
          })}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-semibold text-slate-800 capitalize text-sm truncate">
            {cls.className} <span className="bg-primaryColor/20 px-2 rounded-full py-0.5 text-primaryColor">{cls.batch.batchName}</span>
          </p>

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

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate(`/my-classes/${cls._id}`)}
          className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-b from-primaryColor via-[#617cf5] to-primaryFadedColor hover:opacity-90 px-3 py-1.5 rounded-lg transition"
        >
          Open Class
        </button>
      </div>
    </div>
  );
};

/* ───────── SKELETON COMPONENTS ───────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const ClassCardSkeleton = () => (
  <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 px-4 py-3.5">
    {/* Date block */}
    <Skeleton className="shrink-0 w-14 h-[62px] rounded-lg" />

    {/* Content */}
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="h-4 w-44" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>

    {/* Button */}
    <Skeleton className="shrink-0 h-7 w-24 rounded-lg" />
  </div>
);

const MonthGroupSkeleton = ({ cardCount = 3 }) => (
  <div>
    {/* Month header */}
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex-1 h-px bg-slate-100" />
      <Skeleton className="h-3.5 w-16" />
    </div>

    {/* Cards */}
    <div className="space-y-2.5">
      {Array.from({ length: cardCount }).map((_, i) => (
        <ClassCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const MyClassesSkeleton = () => (
  <div className="py-5">
    {/* Page heading */}
    <div className="flex items-center gap-3 mb-6">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-52" />
      </div>
    </div>

    {/* Filter bar */}
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <Skeleton className="h-9 w-56 rounded-lg" />
      <Skeleton className="h-9 w-32 rounded-lg" />
      <Skeleton className="h-9 w-32 rounded-lg" />
      <Skeleton className="ml-auto h-4 w-16" />
    </div>

    {/* Month groups */}
    <div className="space-y-8">
      <MonthGroupSkeleton cardCount={3} />
      <MonthGroupSkeleton cardCount={2} />
    </div>
  </div>
);

/* ───────── MAIN COMPONENT ───────── */
const MyClasses = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");


  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/class/get-classes`,
        { withCredentials: true }
      );
      setClasses(data.data || []);
    } catch {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);


  const filtered = useMemo(() => {
    return classes.filter((c) => {
      const matchSearch = c.className
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus = statusFilter
        ? c.status === statusFilter
        : true;

      const matchMonth = monthFilter
        ? new Date(c.classDate).toISOString().slice(0, 7) === monthFilter
        : true;

      const matchBatch = batchFilter
        ? c.batch?._id === batchFilter
        : true;

      return matchSearch && matchStatus && matchMonth && matchBatch;
    });
  }, [classes, search, statusFilter, monthFilter, batchFilter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const availableBatches = useMemo(() => {
    const batchMap = new Map();

    classes.forEach((c) => {
      if (c.batch?._id) {
        batchMap.set(c.batch._id, c.batch.batchName);
      }
    });

    return Array.from(batchMap.entries());
  }, [classes]);

  const availableMonths = useMemo(() => {
    const keys = [
      ...new Set(
        classes.map((c) =>
          new Date(c.classDate).toISOString().slice(0, 7)
        )
      ),
    ];
    return keys.sort();
  }, [classes]);

  /* ───────── LOADING STATE ───────── */
  if (loading) {
    return <MyClassesSkeleton />;
  }

  return (
    <div className="py-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-primaryColor to-[#617cf5] flex items-center justify-center shadow">
          <MdCalendarMonth size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-primaryColor">
            My Classes
          </h1>
          <p className="text-xs text-slate-400">
            Prepare and manage your teaching sessions
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <MdSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class name..."
            className="pl-9 pr-4 py-2 border focus:ring-1 ring-primaryColor outline-none rounded-lg text-sm w-56"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border focus:ring-1 ring-primaryColor outline-none rounded-lg text-sm"
        >
          <option value="">All Status</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-3 py-2 border focus:ring-1 ring-primaryColor outline-none rounded-lg text-sm"
        >
          <option value="">All Months</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {new Date(m + "-01").toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </option>
          ))}
        </select>

        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="px-3 py-2 border focus:ring-1 ring-primaryColor outline-none rounded-lg text-sm"
        >
          <option value="">All Batches</option>
          {availableBatches.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <div className="ml-auto text-xs text-slate-400">
          {filtered.length} class{filtered.length !== 1 ? "es" : ""}
        </div>
      </div>

      <div className="space-y-8">
        {grouped.map(([monthKey, monthClasses]) => (
          <div key={monthKey}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <MdCalendarMonth size={16} className="text-primaryColor" />
                <h2 className="font-semibold text-slate-700 text-sm">
                  {new Date(monthKey + "-01").toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
              </div>
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">
                {monthClasses.length} classes
              </span>
            </div>

            <div className="space-y-2.5">
              {monthClasses.map((cls) => (
                <ClassCard
                  key={cls._id}
                  cls={cls}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyClasses;