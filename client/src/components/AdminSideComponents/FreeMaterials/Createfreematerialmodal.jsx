import React, { useEffect, useState } from "react";
import {
  MdClose, MdVideoLibrary, MdPictureAsPdf,
  MdDelete, MdLink, MdUpload,
} from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { cloudinary } from "../../../utils/cloudinary";

const API = process.env.REACT_APP_API_URL;

const CreateFreeMaterialModal = ({ onClose, editData, onSuccess, openCreate }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ── PDF state ── */
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState(editData?.pdfUrl ? "Existing PDF" : null);

  /* ── Video state ──
     "url"    = paste a YouTube / external link
     "upload" = upload a raw video file                */
  const [videoInputMode, setVideoInputMode] = useState(
    editData?.videoUrl ? "upload" : "url"
  );
  const [videoFile, setVideoFile] = useState(null);
  const [videoFileName, setVideoFileName] = useState(
    editData?.videoUrl ? "Existing Video" : null
  );

  const [formData, setFormData] = useState({
    type: editData?.type || "video",
    title: editData?.title || "",
    description: editData?.description || "",
    videoLink: editData?.videoLink || "",   // URL mode value
    videoUrl: editData?.videoUrl || "",    // Upload mode value (after Cloudinary)
    pdfUrl: editData?.pdfUrl || "",
  });

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, [openCreate]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* Switching material type resets all media fields */
  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, type, videoLink: "", videoUrl: "", pdfUrl: "" }));
    setPdfFile(null);
    setPdfName(null);
    setVideoFile(null);
    setVideoFileName(null);
    setVideoInputMode("url");
  };

  /* Switching video input mode clears the opposite mode's value */
  const handleVideoModeChange = (mode) => {
    setVideoInputMode(mode);
    if (mode === "url") {
      setVideoFile(null);
      setVideoFileName(null);
      setFormData((p) => ({ ...p, videoUrl: "" }));
    } else {
      setFormData((p) => ({ ...p, videoLink: "" }));
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed");
      return;
    }
    setVideoFile(file);
    setVideoFileName(file.name);
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    setPdfFile(file);
    setPdfName(file.name);
  };

  /* ── SUBMIT ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return toast.error("Title is required");

    if (formData.type === "video") {
      if (videoInputMode === "url" && !formData.videoLink.trim())
        return toast.error("Video link is required");
      if (videoInputMode === "upload" && !videoFile && !formData.videoUrl)
        return toast.error("Please upload a video file");
    }

    if (formData.type === "enote" && !pdfFile && !formData.pdfUrl)
      return toast.error("Please upload a PDF file");

    try {
      setLoading(true);


      let pdfUrl = formData.pdfUrl;
      let videoUrl = formData.videoUrl;

      /* Upload PDF */
      if (pdfFile) {
        try {
          const uploaded = await cloudinary(pdfFile);
          pdfUrl = uploaded.url;
        } catch {
          toast.error("Failed to upload PDF. Please try again.");
          setLoading(false);
          return;
        }
      }

      /* Upload video file */
      if (videoFile) {
        try {
          const uploaded = await cloudinary(videoFile);
          videoUrl = uploaded.url;
        } catch {
          toast.error("Failed to upload video. Please try again.");
          setLoading(false);
          return;
        }
      }

      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      if (formData.type === "video") {
        if (formData.videoLink) payload.videoLink = formData.videoLink.trim();
        if (videoUrl) payload.videoUrl = videoUrl;
      }

      if (formData.type === "enote") {
        if (pdfUrl) payload.pdfUrl = pdfUrl;
      }

      console.log("Payload to submit:", payload);

      const url = editData
        ? `${API}/free-material/${editData._id}`
        : `${API}/free-material`;

      const method = editData ? axios.put : axios.post;
      const res = await method(url, payload, { withCredentials: true });

      toast.success(res.data?.message || (editData ? "Material updated" : "Material created"));
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isVideo = formData.type === "video";
  const isEnote = formData.type === "enote";

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
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              {isVideo ? (
                <MdVideoLibrary className="text-primaryColor" size={20} />
              ) : (
                <MdPictureAsPdf className="text-primaryColor" size={20} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editData ? "Update Material" : "Add Free Material"}
              </h2>
              <p className="text-xs text-gray-100">
                {editData ? "Update material information" : "Add a new video or e-note"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white hover:bg-gray-200 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* ── BODY ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pt-6 space-y-5 text-sm">

          {/* MATERIAL TYPE TOGGLE */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Material Type *
            </p>
            <div className="flex border rounded-xl overflow-hidden w-fit">
              <button
                type="button"
                onClick={() => handleTypeChange("video")}
                className={`px-5 py-2.5 flex items-center gap-2 text-sm font-medium transition ${isVideo
                  ? "bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <MdVideoLibrary size={16} /> Video
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("enote")}
                className={`px-5 py-2.5 flex items-center gap-2 text-sm font-medium transition ${isEnote
                  ? "bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <MdPictureAsPdf size={16} /> E-Note
              </button>
            </div>
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Title *
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={isVideo ? "e.g. Introduction to React" : "e.g. Chapter 1 – Algebra Notes"}
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this material..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none resize-none"
            />
          </div>

          {/* ── VIDEO SECTION ── */}
          {isVideo && (
            <div>
              {/* Label + URL/Upload sub-toggle on same row */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Video *
                </label>
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleVideoModeChange("url")}
                    className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium transition ${videoInputMode === "url"
                      ? "bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    <MdLink size={13} /> Paste URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVideoModeChange("upload")}
                    className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium transition ${videoInputMode === "upload"
                      ? "bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    <MdUpload size={13} /> Upload File
                  </button>
                </div>
              </div>

              {/* ── URL mode ── */}
              {videoInputMode === "url" && (
                <div>
                  <input
                    name="videoLink"
                    value={formData.videoLink}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=... or any video URL"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  />
                  {formData.videoLink && (
                    <p className="text-xs text-slate-400 mt-1.5 truncate flex items-center gap-1">
                      <MdLink size={11} /> {formData.videoLink}
                    </p>
                  )}
                </div>
              )}

              {/* ── Upload mode ── */}
              {videoInputMode === "upload" && (
                <div>
                  {videoFileName ? (
                    /* File selected — show preview row */
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <MdVideoLibrary size={24} className="text-blue-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-700 truncate max-w-xs">
                            {videoFileName}
                          </p>
                          {formData.videoUrl && !videoFile && (
                            <a
                              href={formData.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primaryColor underline"
                            >
                              View existing video
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoFileName(null);
                          setFormData((p) => ({ ...p, videoUrl: "" }));
                        }}
                        className="p-1.5 rounded-full hover:bg-blue-100 text-blue-500 transition"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  ) : (
                    /* Drop zone */
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                      <MdVideoLibrary className="text-4xl text-blue-300 mb-1" />
                      <span className="text-sm text-gray-400">Click to upload video</span>
                      <span className="text-xs text-gray-300 mt-0.5">MP4, MOV, AVI, MKV etc.</span>
                      <input
                        type="file"
                        hidden
                        accept="video/*"
                        onChange={handleVideoUpload}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PDF SECTION ── */}
          {isEnote && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                PDF File *
              </label>
              {pdfName ? (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <MdPictureAsPdf size={24} className="text-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 truncate max-w-xs">{pdfName}</p>
                      {formData.pdfUrl && !pdfFile && (
                        <a
                          href={formData.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primaryColor underline"
                        >
                          View existing PDF
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      setPdfName(null);
                      setFormData((p) => ({ ...p, pdfUrl: "" }));
                    }}
                    className="p-1.5 rounded-full hover:bg-red-100 text-red-500 transition"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                  <MdPictureAsPdf className="text-4xl text-red-300 mb-1" />
                  <span className="text-sm text-gray-400">Click to upload PDF</span>
                  <span className="text-xs text-gray-300 mt-0.5">PDF files only</span>
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                  />
                </label>
              )}
            </div>
          )}

          {/* ── FOOTER ── */}
          <div className="sticky bottom-0 z-10 flex justify-end gap-3 pb-6 pt-4 border-t bg-white">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 flex items-center gap-1.5 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-70"
            >
              {loading && <FiLoader className="animate-spin" size={14} />}
              {loading
                ? editData ? "Updating..." : "Creating..."
                : editData ? "Update Material" : "Add Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFreeMaterialModal;