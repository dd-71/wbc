import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdBook,
  MdAssignment,
  MdAttachment,
  MdStickyNote2,
  MdPictureAsPdf,
  MdVideoLibrary,
  MdLink,
  MdSlideshow,
  MdEditNote,
} from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const MATERIAL_ICONS = {
  pdf: MdPictureAsPdf,
  video: MdVideoLibrary,
  link: MdLink,
  slides: MdSlideshow,
};

const ViewClassPlanModal = ({ cls, plan, onClose }) => {
  const [animate, setAnimate] = useState(false);
  const domNode = useClickOutside(handleClose);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  function handleClose() {
    setAnimate(false);
    setTimeout(onClose, 250);
  }

  if (!plan) return null;

  return (
    <div
      className={`fixed inset-0 backdrop-blur-sm z-50 bg-primaryColor/20 flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-2xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* ── HEADER ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
              <MdEditNote className="text-primaryColor" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Class Plan Details
              </h2>
              <p className="text-xs text-blue-100 truncate max-w-xs">
                {cls.className} &mdash;{" "}
                {new Date(cls.classDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white hover:bg-gray-200 transition shrink-0"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6 space-y-6 text-sm">

          {/* Agenda */}
          {plan.agenda && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                Class Agenda
              </p>
              <div className="bg-slate-50 border rounded-lg px-3 py-2">
                {plan.agenda}
              </div>
            </div>
          )}

          {/* Topics */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <MdBook size={16} className="text-primaryColor" />
              Topics ({plan.topics?.length || 0})
            </p>

            {plan.topics?.length ? (
              <div className="space-y-2">
                {plan.topics.map((t, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <p className="font-medium text-gray-800">
                      {i + 1}. {t.title}
                    </p>
                    {t.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No topics added
              </p>
            )}
          </div>

          {/* Materials */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <MdAttachment size={16} className="text-primaryColor" />
              Study Materials
            </p>

            {plan.materials?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.materials.map((m, i) => {
                  const Icon = MATERIAL_ICONS[m.type] || MdLink;
                  return (
                    <a
                      key={i}
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                    >
                      <Icon
                        size={18}
                        className="text-primaryColor shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium truncate">
                          {m.title}
                        </p>
                        <p className="text-[10px] text-gray-400 capitalize">
                          {m.type}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No materials added
              </p>
            )}
          </div>

          {/* Homework */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <MdAssignment size={16} className="text-primaryColor" />
              Homework ({plan.homework?.length || 0})
            </p>

            {plan.homework?.length ? (
              <div className="space-y-2">
                {plan.homework.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-amber-50 border border-amber-100 rounded-lg"
                  >
                    <p className="font-medium text-gray-800">
                      {i + 1}. {h.title}
                    </p>
                    {h.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {h.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No homework assigned
              </p>
            )}
          </div>

          {/* Remarks */}
          {plan.remarks && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <MdStickyNote2 size={16} className="text-primaryColor" />
                Tutor Remarks
              </p>
              <div className="bg-slate-50 border rounded-lg px-3 py-2 italic text-gray-600">
                {plan.remarks}
              </div>
            </div>
          )}

          {/* Metadata */}
          <p className="text-[11px] text-gray-300 text-right">
            Last updated:{" "}
            {new Date(plan.updatedAt || plan.createdAt).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div className="sticky bottom-0 z-10 flex justify-end px-6 py-4 border-t bg-white rounded-br-3xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewClassPlanModal;
