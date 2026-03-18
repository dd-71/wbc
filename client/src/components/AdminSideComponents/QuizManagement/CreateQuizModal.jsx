import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";
import { MdClose, MdQuiz } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { useAuth } from "../../../context/AuthProvider";

/* ─── Field Helpers ───────────────────────── */

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm ${className}`}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm resize-none ${className}`}
  />
);

/* ═══════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════ */

const CreateQuizModal = ({ editData, onSuccess, onClose }) => {
  const { branches, isSuperAdmin, user } = useAuth();
  const isEdit = !!editData;

  const [animate, setAnimate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 30,
    startTime: "",
    endTime: "",
    branch: isSuperAdmin ? "" : user?.branch?._id || "",
    isActive: true,
    isPaid: false,
  });

  const domNode = useClickOutside(handleClose);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        durationMinutes: editData.durationMinutes || 30,
        startTime: editData.startTime
          ? new Date(editData.startTime).toISOString().slice(0, 16)
          : "",
        endTime: editData.endTime
          ? new Date(editData.endTime).toISOString().slice(0, 16)
          : "",
        branch: isSuperAdmin
          ? editData.branch?._id || editData.branch || ""
          : user?.branch?._id || "",
        isActive: editData.isActive ?? true,
        isPaid: editData.isPaid ?? false,
      });
    }
  }, [editData]);

  function handleClose() {
    setAnimate(false);
    setTimeout(onClose, 250);
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.durationMinutes) {
      toast.error("Title and duration are required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        branch: form.branch || undefined,
      };

      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/quiz/${editData._id}`,
          payload,
          { withCredentials: true }
        );
        toast.success("Quiz updated successfully");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/quiz`,
          payload,
          { withCredentials: true }
        );
        toast.success("Quiz created successfully");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 backdrop-blur-sm z-50 bg-primaryColor/20 flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-lg max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdQuiz className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? "Edit Quiz" : "Create Quiz"}
              </h2>
              <p className="text-xs text-blue-100">
                Configure quiz details and settings
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

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pt-6 pb-2 space-y-5 text-sm"
        >
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              Title *
            </p>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              Description
            </p>
            <Textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                Duration (minutes) *
              </p>
              <Input
                name="durationMinutes"
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={handleChange}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                Branch {isSuperAdmin && "*"}
              </p>

              {isSuperAdmin ? (
                <select
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm"
                >
                  <option value="">Select Branch *</option>
                  {branches?.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.city}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 text-sm">
                  📍 {user?.branch?.city}
                </div>
              )}
            </div>
          </div>

          {/* START / END TIME */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                Start Time(Optional)
              </p>
              <Input
                name="startTime"
                type="datetime-local"
                value={form.startTime}
                onChange={handleChange}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                End Time(Optional)
              </p>
              <Input
                name="endTime"
                type="datetime-local"
                value={form.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* TOGGLES */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="accent-primaryColor"
              />
              Active
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isPaid"
                checked={form.isPaid}
                onChange={handleChange}
                className="accent-primaryColor"
              />
              Paid Quiz
            </label>
          </div>
        </form>

        {/* FOOTER */}
        <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-br-3xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 flex items-center gap-1.5 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-70 text-sm"
          >
            {saving && <FiLoader className="animate-spin" size={14} />}
            {saving
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Quiz"
                : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizModal;