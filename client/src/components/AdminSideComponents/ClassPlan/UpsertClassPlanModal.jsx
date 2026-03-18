import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";
import {
  MdClose,
  MdAdd,
  MdDelete,
  MdBook,
  MdAssignment,
  MdAttachment,
  MdStickyNote2,
  MdDragIndicator,
  MdEditNote,
} from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";

/* ─── field helpers ──────────────────────────────────────── */
const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm placeholder:text-gray-400 ${className}`}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm placeholder:text-gray-400 resize-none ${className}`}
  />
);

const MATERIAL_TYPES = ["pdf", "video", "link", "slides"];

/* ─── dynamic list section ───────────────────────────────── */
const DynamicList = ({ label, icon: Icon, items, onChange, fields }) => {
  const add = () => onChange([...items, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, key, val) =>
    onChange(items.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <Icon size={16} className="text-primaryColor" /> {label}
        </p>
        <button
          type="button"
          onClick={add}
          className="px-3 py-1 text-xs bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded flex items-center gap-1 transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
        >
          <MdAdd size={13} /> Add
        </button>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto px-0.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <MdDragIndicator size={16} className="text-slate-300 mt-2 shrink-0" />
            <div className="flex-1 grid gap-2">
              {fields.map((f) =>
                f.type === "select" ? (
                  <select
                    key={f.key}
                    value={item[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm"
                  >
                    <option value="">Select type</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <Textarea
                    key={f.key}
                    rows={2}
                    placeholder={f.placeholder}
                    value={item[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    key={f.key}
                    placeholder={f.placeholder}
                    value={item[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                  />
                )
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-1.5 border rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition mt-1 shrink-0"
            >
              <MdDelete size={15} />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-xs border border-dashed rounded-lg bg-slate-50">
            No {label.replace(" *", "").toLowerCase()} added yet
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════════ */
const UpsertClassPlanModal = ({ cls, existingPlan, onClose, onSuccess }) => {
  const isEdit = !!existingPlan;
  const [animate, setAnimate] = useState(false);
  const [saving, setSaving] = useState(false);

  /* form state */
  const [agenda, setAgenda] = useState(existingPlan?.agenda || "");
  const [remarks, setRemarks] = useState(existingPlan?.remarks || "");
  const [topics, setTopics] = useState(
    existingPlan?.topics?.length ? existingPlan.topics : [{ title: "", description: "" }]
  );
  const [materials, setMaterials] = useState(existingPlan?.materials || []);
  const [homework, setHomework] = useState(existingPlan?.homework || []);

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
    const validTopics = topics.filter((t) => t.title.trim());
    if (!validTopics.length) {
      toast.error("At least one topic with a title is required");
      return;
    }
    try {
      setSaving(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/class-plan/${cls._id}`,
        { topics: validTopics, agenda, materials, homework, tutorRemarks: remarks },
        { withCredentials: true }
      );
      toast.success(isEdit ? "Class plan updated!" : "Class plan created!");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save plan");
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
                {isEdit ? "Edit Class Plan" : "Create Class Plan"}
              </h2>
              <p className="text-xs text-blue-100 truncate max-w-xs">
                {cls.className} &mdash;{" "}
                {new Date(cls.classDate).toLocaleDateString("en-IN", {
                  weekday: "short", day: "2-digit", month: "short", year: "numeric",
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pt-5 pb-2 space-y-5 text-sm"
        >
          {/* agenda */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Class Agenda</p>
            <Textarea
              rows={2}
              placeholder="What will be covered in this class overall?"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />
          </div>

          {/* topics */}
          <DynamicList
            label="Topics *"
            icon={MdBook}
            items={topics}
            onChange={setTopics}
            fields={[
              { key: "title", placeholder: "Topic title", type: "text" },
              { key: "description", placeholder: "Brief description", type: "textarea" },
            ]}
          />

          {/* materials */}
          <DynamicList
            label="Study Materials"
            icon={MdAttachment}
            items={materials}
            onChange={setMaterials}
            fields={[
              { key: "title", placeholder: "Material title", type: "text" },
              { key: "url", placeholder: "URL / link", type: "text" },
              { key: "type", placeholder: "Type", type: "select", options: MATERIAL_TYPES },
            ]}
          />

          {/* homework */}
          <DynamicList
            label="Homework"
            icon={MdAssignment}
            items={homework}
            onChange={setHomework}
            fields={[
              { key: "title", placeholder: "Task title", type: "text" },
              { key: "description", placeholder: "Task description", type: "textarea" },
            ]}
          />

          {/* remarks */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MdStickyNote2 size={16} className="text-primaryColor" /> Tutor Remarks
            </p>
            <Textarea
              rows={3}
              placeholder="Personal notes, reminders, or observations for this class..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </form>

        {/* ── FOOTER ── */}
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
              ? isEdit ? "Updating..." : "Creating..."
              : isEdit ? "Update Plan" : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsertClassPlanModal;