import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";
import {
  MdClose,
  MdAdd,
  MdDelete,
  MdAssignment,
  MdAttachment,
  MdCalendarMonth,
  MdEditNote,
  MdDragIndicator,
} from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";

/* ─── INPUT HELPERS ─── */
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

/* ─── ATTACHMENT LIST ─── */
const AttachmentList = ({ items, onChange }) => {
  const add = () =>
    onChange([...items, { title: "", url: "" }]);

  const remove = (i) =>
    onChange(items.filter((_, idx) => idx !== i));

  const update = (i, key, val) =>
    onChange(
      items.map((item, idx) =>
        idx === i ? { ...item, [key]: val } : item
      )
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <MdAttachment size={16} className="text-primaryColor" />
          Attachments
        </p>

        <button
          type="button"
          onClick={add}
          className="px-3 py-1 text-xs bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded flex items-center gap-1"
        >
          <MdAdd size={13} /> Add
        </button>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border"
          >
            <MdDragIndicator
              size={16}
              className="text-slate-300 mt-2"
            />

            <div className="flex-1 grid gap-2">
              <Input
                placeholder="Attachment title"
                value={item.title}
                onChange={(e) =>
                  update(i, "title", e.target.value)
                }
              />
              <Input
                placeholder="URL"
                value={item.url}
                onChange={(e) =>
                  update(i, "url", e.target.value)
                }
              />
            </div>

            <button
              type="button"
              onClick={() => remove(i)}
              className="p-1.5 border rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400"
            >
              <MdDelete size={15} />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-xs border border-dashed rounded-lg bg-slate-50">
            No attachments added
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN MODAL
════════════════════════════════════════ */
const UpsertHomeworkModal = ({
  cls,
  existingHomework,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!existingHomework;

  const [animate, setAnimate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(
    existingHomework?.title || ""
  );
  const [description, setDescription] = useState(
    existingHomework?.description || ""
  );
  const [dueDate, setDueDate] = useState(
    existingHomework?.dueDate
      ? existingHomework.dueDate.slice(0, 10)
      : ""
  );
  const [attachments, setAttachments] = useState(
    existingHomework?.attachments || []
  );

  const domNode = useClickOutside(handleClose);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  function handleClose() {
    setAnimate(false);
    setTimeout(onClose, 250);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Homework title is required");
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/homework/${cls._id}`,
        { title, description, dueDate, attachments },
        { withCredentials: true }
      );

      toast.success(
        isEdit ? "Homework updated!" : "Homework assigned!"
      );

      onSuccess();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Failed to save homework"
      );
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
        className={`bg-white w-full max-w-xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate
          ? "scale-100 translate-y-0"
          : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdEditNote
                className="text-primaryColor"
                size={22}
              />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {isEdit
                ? "Update Homework"
                : "Assign Homework"}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white hover:bg-gray-200"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm"
        >
          {/* Title */}
          <div>
            <p className="text-sm font-medium mb-1">
              Homework Title *
            </p>
            <Input
              placeholder="Enter homework title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium mb-1">
              Description
            </p>
            <Textarea
              rows={3}
              placeholder="Explain the task..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>

          {/* Due Date */}
          <div>
            <p className="text-sm font-medium mb-1 flex items-center gap-1">
              <MdCalendarMonth size={15} /> Due Date
            </p>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
            />
          </div>

          {/* Attachments */}
          <AttachmentList
            items={attachments}
            onChange={setAttachments}
          />
        </form>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-br-3xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 flex items-center gap-1.5 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md text-sm"
          >
            {saving && (
              <FiLoader
                className="animate-spin"
                size={14}
              />
            )}
            {saving
              ? isEdit
                ? "Updating..."
                : "Assigning..."
              : isEdit
                ? "Update Homework"
                : "Assign Homework"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsertHomeworkModal;