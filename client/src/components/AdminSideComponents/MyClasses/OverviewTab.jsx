import React from "react";
import {
  MdAccessTime,
  MdClass,
  MdPerson,
  MdLocationOn,
  MdGroup,
  MdCheckCircle,
  MdSchedule,
  MdPlayCircle,
  MdInfoOutline,
  MdBolt,
  MdMenuBook,
  MdOutlineAssignment,
  MdOutlinePeople,
  MdStar,
  MdTrendingUp,
  MdOutlineCalendarToday,
  MdOutlineTimer,
  MdDone,
  MdOutlineRoom,
} from "react-icons/md";

// SKELETON

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

const OverviewSkeleton = () => (
  <div className="space-y-5">
    <div className="rounded-2xl border border-slate-100 p-5 space-y-4">
      <Skeleton className="h-5 w-40" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  </div>
);

// STATUS CONFIG

const STATUS_CONFIG = {
  scheduled: {
    label: "Scheduled",
    icon: MdSchedule,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  ongoing: {
    label: "Ongoing",
    icon: MdPlayCircle,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
  },
  completed: {
    label: "Completed",
    icon: MdDone,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-400",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: MdInfoOutline,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-400",
    badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

// INFO CHIP

const InfoChip = ({ icon: Icon, label, value, gradient }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors duration-150">
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${gradient ||
        "bg-gradient-to-br from-primaryColor/10 to-primaryFadedColor/10"
        }`}
    >
      <Icon size={17} className="text-primaryColor" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-700 truncate">{value || "—"}</p>
    </div>
  </div>
);

// STAT PILL

const StatPill = ({ icon: Icon, label, value, color }) => {
  const colors = {
    slate: "bg-slate-50 border-slate-100 text-slate-700 [&_svg]:text-slate-400",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700 [&_svg]:text-emerald-400",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700 [&_svg]:text-indigo-400",
    amber: "bg-amber-50 border-amber-100 text-amber-700 [&_svg]:text-amber-400",
    rose: "bg-rose-50 border-rose-100 text-rose-700 [&_svg]:text-rose-400",
  };
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 flex flex-col items-center gap-1 ${colors[color]}`}
    >
      <Icon size={20} />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">
        {label}
      </p>
    </div>
  );
};

// SECTION CARD

const SectionCard = ({ icon: Icon, title, iconBg = "bg-indigo-50", iconColor = "text-indigo-500", children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-50">
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon size={15} className={iconColor} />
      </div>
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// TOPIC PILL

const TopicPill = ({ topic, index }) => {
  const colors = [
    "bg-violet-50 text-violet-700 border-violet-100",
    "bg-sky-50 text-sky-700 border-sky-100",
    "bg-emerald-50 text-emerald-700 border-emerald-100",
    "bg-amber-50 text-amber-700 border-amber-100",
    "bg-rose-50 text-rose-700 border-rose-100",
    "bg-indigo-50 text-indigo-700 border-indigo-100",
  ];
  return (
    <>
      <span
        title={typeof topic === "object" && topic.description ? topic.description : undefined}
        className={`inline-flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-full cursor-default ${colors[index % colors.length]
          }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" >
          {typeof topic === "object" ? topic.title || topic.name || "" : topic}
        </span>
      </span >
    </>
  );
};

// MAIN COMPONENT

const OverviewTab = ({ classData }) => {
  const plan = classData?.plan || null;

  if (!classData) return <OverviewSkeleton />;

  /* ── Helpers ── */
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      : "—";

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : null;

  // slot is populated: { startTime, endTime, slotName, ... }
  const slot = classData.slot || null;

  const getDuration = () => {
    if (!slot?.startTime || !slot?.endTime) return null;
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    const diff = Math.round((end - start) / 60000);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
  };

  const statusKey = classData.status?.toLowerCase() || "scheduled";
  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.scheduled;
  const duration = getDuration();

  const timeRange =
    slot?.startTime && slot?.endTime
      ? `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
      : slot?.slotName || slot?.name || classData.time || "—";

  return (
    <div className="space-y-5">

      {/* ── CLASS INFO GRID ── */}
      <SectionCard icon={MdInfoOutline} title="Class Details" iconBg="bg-blue-50" iconColor="text-blue-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoChip
            icon={MdOutlineCalendarToday}
            label="Date"
            value={formatDate(classData.classDate || classData.date)}
          />
          <InfoChip
            icon={MdAccessTime}
            label="Time"
            value={timeRange}
          />
          {classData.tutor && (
            <InfoChip
              icon={MdPerson}
              label="Tutor"
              value={
                typeof classData.tutor === "object"
                  ? classData.tutor?.fullName || classData.tutor?.name || "—"
                  : classData.tutor
              }
            />
          )}
          {(classData.room || classData.location) && (
            <InfoChip
              icon={MdOutlineRoom}
              label="Room / Location"
              value={
                typeof (classData.room || classData.location) === "object"
                  ? (classData.room || classData.location)?.name || "—"
                  : classData.room || classData.location
              }
            />
          )}
          {classData.branch && (
            <InfoChip
              icon={MdLocationOn}
              label="Branch"
              value={
                typeof classData.branch === "object"
                  ? classData.branch?.name ||
                  classData.branch?.branchName ||
                  classData.branch?.city ||
                  classData.branch?.dist ||
                  "—"
                  : classData.branch
              }
            />
          )}
          {classData.batch && (
            <InfoChip
              icon={MdGroup}
              label="Batch"
              value={
                typeof classData.batch === "object"
                  ? classData.batch?.name ||
                  classData.batch?.batchName ||
                  "—"
                  : classData.batch
              }
            />
          )}
        </div>
      </SectionCard>

      {/* ── CLASS PLAN SECTION ── */}
      {plan ? (
        <SectionCard
          icon={MdMenuBook}
          title="Class Plan"
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
        >
          <div className="space-y-4">
            {/* Topics */}
            {plan.topics?.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {plan.topics.map((topic, i) => (
                    <TopicPill key={i} topic={topic} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Agenda */}
            {plan.agenda && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Agenda
                </p>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                  {plan.agenda}
                </p>
              </div>
            )}

            {/* Objectives */}
            {plan.objectives?.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Objectives
                </p>
                <ul className="space-y-1.5">
                  {plan.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <MdCheckCircle
                        size={15}
                        className="text-emerald-400 mt-0.5 shrink-0"
                      />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials */}
            {plan.materials?.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Materials
                </p>
                <div className="flex flex-wrap gap-2">
                  {plan.materials.map((mat, i) => {
                    const matTitle = typeof mat === "object" ? mat.title || mat.name || "" : mat;
                    const matUrl = typeof mat === "object" ? mat.url : null;
                    const Tag = matUrl ? "a" : "span";
                    return (
                      <Tag
                        key={i}
                        {...(matUrl ? { href: matUrl, target: "_blank", rel: "noreferrer" } : {})}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium border px-2.5 py-1 rounded-lg transition ${matUrl ? "text-sky-600 bg-sky-50 border-sky-100 hover:bg-sky-100" : "text-slate-500 bg-slate-50 border-slate-100"}`}
                      >
                        <MdOutlineAssignment size={12} className={matUrl ? "text-sky-400" : "text-slate-400"} />
                        {matTitle}
                      </Tag>
                    );
                  })
                  }
                </div>
              </div>
            )}

            {/* Tutor Remarks */}
            {plan.remarks && (
              <div className="mt-1 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-1">
                  Tutor Remarks
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {plan.remarks}
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      ) : (
        /* No plan state */
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 flex flex-col items-center gap-2 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
            <MdMenuBook size={22} className="text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-500">No Class Plan Yet</p>
          <p className="text-xs text-slate-400 max-w-xs">
            The tutor hasn't added a class plan for this session.
          </p>
        </div>
      )}

      {/* ── QUICK STATS ── */}
      <SectionCard
        icon={MdTrendingUp}
        title="Quick Stats"
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
      >
        <div className="grid grid-cols-3 gap-3">
          <StatPill
            icon={MdOutlinePeople}
            label="Students"
            value={classData.studentCount ?? classData.totalStudents ?? "—"}
            color="indigo"
          />
          <StatPill
            icon={MdBolt}
            label="Tests"
            value={Array.isArray(classData.surpriseTests) ? classData.surpriseTests.length : "—"}
            color="amber"
          />
          <StatPill
            icon={MdStar}
            label="Homework"
            value={Array.isArray(classData.homework) ? classData.homework.length : "—"}
            color="emerald"
          />
        </div>
      </SectionCard>
    </div>
  );
};

export default OverviewTab;