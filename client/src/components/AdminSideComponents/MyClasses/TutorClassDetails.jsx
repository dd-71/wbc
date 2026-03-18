import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdArrowBack,
  MdCalendarMonth,
  MdSchedule,
  MdSchool,
  MdEditNote,
  MdPlayCircle,
  MdCheckCircle,
  MdCancel,
  MdOutlineAssignment,
  MdPeople,
  MdMenuBook,
  MdBolt,
} from "react-icons/md";
import PlanTab from "./PlanTab";
import HomeworkTab from "./HomeworkTab";
import TestTab from "./TestTab";
import AttendanceTab from "./AttendanceTab";
import OverviewTab from "./OverviewTab";

const TABS = [
  { key: "overview", label: "Overview", icon: MdOutlineAssignment },
  { key: "plan", label: "Plan", icon: MdMenuBook },
  { key: "homework", label: "Homework", icon: MdOutlineAssignment },
  { key: "test", label: "Surprise Test", icon: MdBolt },
  { key: "attendance", label: "Attendance", icon: MdPeople },
];

const STATUS_META = {
  draft: { label: "Draft", color: "text-slate-500", bg: "bg-slate-100", dot: "bg-slate-400" },
  scheduled: { label: "Scheduled", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-400" },
  ongoing: { label: "Ongoing", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-400" },
  completed: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400" },
  cancelled: { label: "Cancelled", color: "text-rose-500", bg: "bg-rose-50", dot: "bg-rose-400" },
  rescheduled: { label: "Rescheduled", color: "text-purple-600", bg: "bg-purple-50", dot: "bg-purple-400" },
};

/* ───────── SKELETON ───────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

const TutorClassDetailsSkeleton = () => (
  <div className="py-6 space-y-5">
    {/* Header card */}
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
        <div className="space-y-3">
          <Skeleton className="h-7 w-64" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-5 w-48 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-36 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
    </div>

    {/* Tabs + content */}
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex border-b border-slate-100 bg-slate-50/60">
        {TABS.map((tab) => (
          <div key={tab.key} className="flex-1 py-4 flex justify-center">
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ───────── STATUS BADGE ───────── */
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.color} ${meta.bg}`}
      style={{ borderColor: "transparent" }}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

/* ───────── MAIN COMPONENT ───────── */
const TutorClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  /* ───────── FETCH CLASS WORKSPACE ───────── */
  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/class/${id}`,
        { withCredentials: true }
      );
      setClassData(data.data);
    } catch (err) {
      toast.error("Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  if (loading) return <TutorClassDetailsSkeleton />;

  if (!classData) {
    return (
      <div className="py-20 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
          <MdCancel size={28} className="text-rose-400" />
        </div>
        <p className="text-slate-500 font-medium">Class not found</p>
      </div>
    );
  }

  const isToday =
    new Date(classData.classDate).toDateString() === new Date().toDateString();

  // console.log(classData);

  return (
    <div className="py-6 space-y-5">
      
      {/* ───────── CLASS HEADER CARD ───────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
              >
                <MdArrowBack size={18} className="text-slate-600" />
              </button>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  {classData.className}
                </h1>

                {isToday && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    <MdBolt size={10} /> Today
                  </span>
                )}
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2">
              <MetaChip icon={MdCalendarMonth}>
                {new Date(classData.classDate).toLocaleDateString("en-IN", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric",
                })}
              </MetaChip>

              {classData.slot && (
                <MetaChip icon={MdSchedule}>
                  {classData.slot.startTime} – {classData.slot.endTime}
                </MetaChip>
              )}

              {classData.batch && (
                <MetaChip icon={MdSchool}>
                  {classData.batch.batchName}
                </MetaChip>
              )}
            </div>
          </div>

          {/* Right - Status */}
          <StatusBadge status={classData.status} />
        </div>
      </div>

      {/* ───────── TABS CARD ───────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[100px] flex flex-col items-center gap-1 py-3.5 px-2 text-xs font-medium transition-all duration-200 relative ${isActive
                  ? "text-primaryColor bg-white"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
                  }`}
              >
                <Icon size={16} className={isActive ? "text-primaryColor" : "text-slate-400"} />
                <span className="leading-none">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primaryColor via-[#617cf5] to-primaryFadedColor rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab classData={classData} />
            // <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            //   <MdOutlineAssignment size={40} className="opacity-30 mb-3" />
            //   <p className="text-sm font-medium">Overview Tab</p>
            // </div>
          )}

          {activeTab === "plan" && (
            <PlanTab classData={classData} refresh={fetchClassDetails} />
          )}

          {activeTab === "homework" && (
            <HomeworkTab classData={classData} refresh={fetchClassDetails} />
          )}

          {activeTab === "test" && (
            <TestTab classData={classData} refresh={fetchClassDetails} />
            // <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            //   <MdBolt size={40} className="opacity-30 mb-3" />
            //   <p className="text-sm font-medium">Surprise Test</p>
            // </div>
          )}

          {activeTab === "attendance" && (
            <AttendanceTab classData={classData} />
            // <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            //   <MdPeople size={40} className="opacity-30 mb-3" />
            //   <p className="text-sm font-medium">Attendance</p>
            // </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ───────── META CHIP ───────── */
const MetaChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg font-medium">
    <Icon size={13} className="text-slate-400 shrink-0" />
    {children}
  </span>
);

export default TutorClassDetails;