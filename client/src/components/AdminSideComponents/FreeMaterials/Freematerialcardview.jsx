import React from "react";
import { MdMoreVert, MdVisibility, MdEdit, MdDelete, MdVideoLibrary, MdPictureAsPdf, MdOpenInNew } from "react-icons/md";

const FreeMaterialCardView = ({
  materials,
  onView,
  onEdit,
  onDelete,
  openAction,
  setOpenAction,
  domNode,
  can,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map((m) => {
        const isVideo = m.type === "video";

        return (
          <div
            key={m._id}
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col"
          >
            {/* CARD BANNER */}
            <div
              className={`h-36 flex items-center justify-center relative ${isVideo
                ? "bg-gradient-to-br from-blue-50 to-indigo-100"
                : "bg-gradient-to-br from-red-50 to-rose-100"
                }`}
            >
              {isVideo ? (
                <MdVideoLibrary size={52} className="text-blue-300" />
              ) : (
                <MdPictureAsPdf size={52} className="text-red-300" />
              )}
              {/* TYPE BADGE */}
              <span
                className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-full ${isVideo
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {isVideo ? "📹 Video" : "📄 E-Note"}
              </span>

              {/* QUICK OPEN BUTTON */}
              {isVideo && m.videoLink && (
                <a
                  href={m.videoLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white shadow text-blue-600 transition"
                  title="Open video"
                >
                  <MdOpenInNew size={14} />
                </a>
              )}
              {!isVideo && m.pdfUrl && (
                <a
                  href={m.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white shadow text-red-600 transition"
                  title="Open PDF"
                >
                  <MdOpenInNew size={14} />
                </a>
              )}
            </div>

            {/* CARD BODY */}
            <div className="p-4 flex-1 flex flex-col">
              <h3
                onClick={() => onView(m)}
                className="font-semibold text-slate-800 text-sm leading-snug mb-1.5 cursor-pointer hover:text-primaryColor transition-colors line-clamp-2"
              >
                {m.title}
              </h3>

              {m.description && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                  {m.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span className="text-[11px] text-slate-400">
                  {new Date(m.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                {/* ACTION MENU */}
                <div className="relative">
                  <button
                    onClick={() => setOpenAction(openAction === m._id ? null : m._id)}
                    className="text-xl p-1 hover:bg-gray-100 rounded-lg transition"
                  >
                    <MdMoreVert size={18} />
                  </button>

                  {openAction === m._id && (
                    <div
                      ref={domNode}
                      className="absolute text-xs right-0 bottom-8 z-20 bg-white border rounded-md shadow-lg w-32"
                    >
                      {can("view") && (
                        <button
                          onClick={() => { onView(m); setOpenAction(null); }}
                          className="w-full px-3 py-2 text-slate-600 flex items-center gap-2 hover:bg-gray-100"
                        >
                          <MdVisibility size={14} /> View
                        </button>
                      )}
                      {can("edit") && (
                        <button
                          onClick={() => { onEdit(m); setOpenAction(null); }}
                          className="w-full px-3 py-2 flex text-green-600 items-center gap-2 hover:bg-gray-100"
                        >
                          <MdEdit size={14} /> Edit
                        </button>
                      )}
                      {can("delete") && (
                        <button
                          onClick={() => { onDelete(m); setOpenAction(null); }}
                          className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                        >
                          <MdDelete size={14} /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FreeMaterialCardView;