import React, { useEffect, useState } from "react";
import { MdClose, MdVideoLibrary, MdPictureAsPdf, MdOpenInNew, MdCalendarMonth } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const ViewFreeMaterialModal = ({ material, onClose, open }) => {
  const [animate, setAnimate] = useState(false);
  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    if (open) setTimeout(() => setAnimate(true), 10);
  }, [open]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const isVideo = material?.type === "video";

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "—";

  const formatDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";

  // Extract YouTube embed URL if possible
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return null;
  };

  const embedUrl = isVideo ? getEmbedUrl(material?.videoLink) : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`w-full max-w-2xl mx-4 bg-white rounded-tl-3xl rounded-br-3xl shadow-xl transition-all duration-300 max-h-[90vh] flex flex-col ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              {isVideo ? (
                <MdVideoLibrary className="text-primaryColor" size={20} />
              ) : (
                <MdPictureAsPdf className="text-primaryColor" size={20} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Material Details</h2>
              <p className="text-xs text-gray-100">
                {isVideo ? "Video Resource" : "E-Note / PDF"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-white rounded-full hover:bg-gray-200 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* TYPE BADGE + TITLE */}
          <div className="p-4 bg-slate-50 rounded-xl border border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-xl font-semibold text-gray-800 leading-snug">{material?.title}</h3>
              <span
                className={`shrink-0 px-3 py-1 text-xs rounded-full font-semibold ${isVideo
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {isVideo ? "📹 Video" : "📄 E-Note"}
              </span>
            </div>
            {material?.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{material.description}</p>
            )}
          </div>

          {/* VIDEO EMBED OR LINK */}
          {isVideo && material?.videoLink && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MdVideoLibrary size={16} className="text-blue-500" /> Video
              </p>
              {embedUrl ? (
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm aspect-video">
                  <iframe
                    src={embedUrl}
                    title={material.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={material.videoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm font-medium hover:bg-blue-100 transition"
                >
                  <MdOpenInNew size={16} />
                  <span className="truncate">{material.videoLink}</span>
                </a>
              )}
            </div>
          )}

          {/* PDF LINK */}
          {!isVideo && material?.pdfUrl && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MdPictureAsPdf size={16} className="text-red-500" /> PDF File
              </p>
              <a
                href={material.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition group"
              >
                <MdPictureAsPdf size={28} className="text-red-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 group-hover:text-red-700 transition">
                    View / Download PDF
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{material.pdfUrl}</p>
                </div>
                <MdOpenInNew size={16} className="text-red-400 shrink-0" />
              </a>
            </div>
          )}

          {/* TIMESTAMPS */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <MdCalendarMonth size={12} /> Created
              </p>
              <p className="text-sm font-semibold text-gray-700">{formatDateTime(material?.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <MdCalendarMonth size={12} /> Last Updated
              </p>
              <p className="text-sm font-semibold text-gray-700">{formatDateTime(material?.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end items-center px-6 py-4 border-t bg-slate-50 rounded-br-3xl flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md text-sm transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFreeMaterialModal;