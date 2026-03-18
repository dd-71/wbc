import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdBook,
  MdAttachment,
  MdAssignment,
  MdStickyNote2,
  MdMenuBook,
  MdLink,
} from "react-icons/md";

import UpsertClassPlanModal from "../../AdminSideComponents/ClassPlan/UpsertClassPlanModal";
import DeleteAlertModal from "../../common/DeleteAlertModal";
import CommonButton from './../../common/CommonButton';
import { useLockBodyScroll } from "../../Hooks/useLockBodyScroll";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

const PlanTabSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
      <Skeleton className="h-5 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-3 w-16" />
      {[1, 2].map((i) => (
        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  </div>
);

const PlanTab = ({ classData, refresh }) => {
  const plan = classData.plan;

  const [upsertModal, setUpsertModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useLockBodyScroll(upsertModal || deleteModal);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/class-plan/${classData._id}`,
        { withCredentials: true }
      );
      toast.success("Plan deleted successfully");
      setDeleteModal(false);
      refresh();
    } catch (err) {
      toast.error("Failed to delete plan");
    } finally {
      setDeleting(false);
    }
  };

  if (!plan) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-5 shadow-inner">
            <MdMenuBook size={36} className="text-primaryColor/70" />
          </div>
          <p className="text-slate-700 font-semibold text-lg mb-1">No Class Plan Created Yet</p>
          <p className="text-slate-400 text-sm mb-7 text-center max-w-xs">
            Start planning topics, materials and tasks for this session.
          </p>
          <CommonButton handler={() => setUpsertModal(true)} label={'Create Class Plan'} icon={<MdAdd />} />
        </div>

        {upsertModal && (
          <UpsertClassPlanModal
            cls={classData}
            existingPlan={null}
            onClose={() => setUpsertModal(false)}
            onSuccess={() => { setUpsertModal(false); refresh(); }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <MdMenuBook size={17} className="text-violet-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 tracking-wide">Class Plan</h3>
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

        {plan.agenda && (
          <PlanSection title="Agenda" icon={MdBook} accentColor="violet">
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{plan.agenda}</p>
            </div>
          </PlanSection>
        )}

        {plan.topics?.length > 0 && (
          <PlanSection title="Topics to Cover" icon={MdBook} accentColor="indigo">
            <div className="space-y-2.5">
              {plan.topics.map((t, i) => (
                <div
                  key={i}
                  className="group bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl p-4 transition-all duration-150 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-indigo-500">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{t.title}</p>
                      {t.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PlanSection>
        )}

        {plan.materials?.length > 0 && (
          <PlanSection title="Study Materials" icon={MdAttachment} accentColor="sky">
            <div className="flex flex-wrap gap-2">
              {plan.materials.map((m, i) => (
                <a
                  key={i}
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 bg-sky-50 border border-sky-100 hover:border-sky-300 hover:bg-sky-100 px-3.5 py-2 rounded-xl transition-all duration-150 hover:shadow-sm"
                >
                  <MdLink size={13} /> {m.title}
                </a>
              ))}
            </div>
          </PlanSection>
        )}

        {plan.homework?.length > 0 && (
          <PlanSection title="Homework Assigned" icon={MdAssignment} accentColor="amber">
            <div className="space-y-2.5">
              {plan.homework.map((h, i) => (
                <div
                  key={i}
                  className="bg-amber-50 border border-amber-100 rounded-2xl p-4"
                >
                  <p className="font-semibold text-sm text-slate-800">{h.title}</p>
                  {h.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{h.description}</p>
                  )}
                </div>
              ))}
            </div>
          </PlanSection>
        )}

        {plan.remarks && (
          <PlanSection title="Tutor Remarks" icon={MdStickyNote2} accentColor="emerald">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed italic">"{plan.remarks}"</p>
            </div>
          </PlanSection>
        )}
      </div>

      {upsertModal && (
        <UpsertClassPlanModal
          cls={classData}
          existingPlan={plan}
          onClose={() => setUpsertModal(false)}
          onSuccess={() => { setUpsertModal(false); refresh(); }}
        />
      )}

      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Class Plan"
        description="Are you sure you want to delete this class plan? This action cannot be undone."
        confirmText="Delete Plan"
      />
    </>
  );
};

const ACCENT_COLORS = {
  violet: "text-violet-500 bg-violet-50",
  indigo: "text-indigo-500 bg-indigo-50",
  sky: "text-sky-500 bg-sky-50",
  amber: "text-amber-500 bg-amber-50",
  emerald: "text-emerald-500 bg-emerald-50",
};

const PlanSection = ({ title, icon: Icon, accentColor = "indigo", children }) => {
  const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;
  const [iconColor, bgColor] = accent.split(" ");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon size={14} className={iconColor} />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
      </div>
      {children}
    </div>
  );
};

const Section = ({ title, icon: Icon, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
      <Icon size={14} className="text-primaryColor" /> {title}
    </h4>
    {children}
  </div>
);

export { PlanTabSkeleton };
export default PlanTab;