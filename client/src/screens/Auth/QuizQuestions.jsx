import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdDelete, MdArrowBack, MdAdd, MdSend, MdQuiz, MdExpandMore, MdExpandLess } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";

/* ─── empty question factory ──────────────────────────────── */
const emptyQuestion = () => ({
  _key: Math.random().toString(36).slice(2),  // local key for React
  questionText: "",
  options: [{ text: "" }, { text: "" }],
  correctIndex: 0,
  marks: 1,
  collapsed: false,
});

/* ─── single question card ────────────────────────────────── */
const QuestionCard = ({ q, index, total, onChange, onRemove }) => {
  const toggle = () => onChange({ ...q, collapsed: !q.collapsed });
  const hasText = q.questionText.trim().length > 0;
  const isValid =
    hasText &&
    q.options.length >= 2 &&
    q.options.every((o) => o.text.trim());

  const updateOption = (i, text) => {
    const opts = [...q.options];
    opts[i] = { text };
    onChange({ ...q, options: opts });
  };
  const addOption = () => onChange({ ...q, options: [...q.options, { text: "" }] });
  const removeOption = (i) => {
    if (q.options.length <= 2) return;
    const opts = q.options.filter((_, idx) => idx !== i);
    onChange({ ...q, options: opts, correctIndex: Math.min(q.correctIndex, opts.length - 1) });
  };

  return (
    <div className={`border rounded-xl bg-white overflow-hidden transition-shadow hover:shadow-sm ${isValid ? "border-slate-200" : "border-dashed border-slate-300"
      }`}>
      {/* card header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition"
        onClick={toggle}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isValid ? "bg-primaryColor text-white" : "bg-slate-200 text-slate-500"
            }`}>
            {index + 1}
          </span>
          <p className={`text-sm truncate ${hasText ? "text-slate-700 font-medium" : "text-slate-400"}`}>
            {hasText ? q.questionText : "Untitled question"}
          </p>
          {isValid && (
            <span className="hidden sm:inline-flex text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
              Ready
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">{q.marks} mk</span>
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
            >
              <MdDelete size={16} />
            </button>
          )}
          {q.collapsed ? <MdExpandMore size={18} className="text-slate-400" /> : <MdExpandLess size={18} className="text-slate-400" />}
        </div>
      </div>

      {/* card body */}
      {!q.collapsed && (
        <div className="px-4 py-4 space-y-4">
          {/* question text */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Question *
            </label>
            <textarea
              value={q.questionText}
              onChange={(e) => onChange({ ...q, questionText: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm resize-none placeholder:text-gray-400"
              placeholder="Enter question text..."
            />
          </div>

          {/* options */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Options * &nbsp;
              <span className="normal-case font-normal text-slate-400">(select the correct answer)</span>
            </label>

            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${q._key}`}
                    checked={q.correctIndex === oi}
                    onChange={() => onChange({ ...q, correctIndex: oi })}
                    className="accent-primaryColor shrink-0"
                  />
                  <input
                    value={opt.text}
                    onChange={(e) => updateOption(oi, e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primaryFadedColor outline-none ${q.correctIndex === oi
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-slate-50 focus:bg-white"
                      }`}
                    placeholder={`Option ${oi + 1}`}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(oi)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition shrink-0"
                    >
                      <MdDelete size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-xs text-primaryColor hover:text-primaryColor/80 font-medium flex items-center gap-1"
            >
              <MdAdd size={14} /> Add option
            </button>
          </div>

          {/* marks */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Marks</label>
            <input
              type="number"
              min={1}
              value={q.marks}
              onChange={(e) => onChange({ ...q, marks: Number(e.target.value) })}
              className="w-20 px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
const QuizQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  /* draft questions batch */
  const [drafts, setDrafts] = useState([emptyQuestion()]);

  /* delete modal */
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteQId, setDeleteQId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── fetch ── */
  const fetchQuiz = async () => {
    try {
      const { data } = await axios.get(`${API}/quiz`, { withCredentials: true });
      setQuiz((data.data || []).find((q) => q._id === id) || null);
    } catch { /* silent */ }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/quiz/${id}/questions`, { withCredentials: true });
      setQuestions(data.data || []);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    fetchQuestions();
  }, [id]);

  /* ── draft helpers ── */
  const updateDraft = (key, updated) =>
    setDrafts((prev) => prev.map((d) => (d._key === key ? { ...updated, _key: key } : d)));

  const removeDraft = (key) =>
    setDrafts((prev) => prev.filter((d) => d._key !== key));

  const addDraft = () =>
    setDrafts((prev) => [...prev, emptyQuestion()]);

  /* ── submit all drafts ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    for (let i = 0; i < drafts.length; i++) {
      const d = drafts[i];
      if (!d.questionText.trim())
        return toast.error(`Question ${i + 1}: text is required`);
      if (d.options.some((o) => !o.text.trim()))
        return toast.error(`Question ${i + 1}: all options must have text`);
    }

    const payload = drafts.map((d) => ({
      questionText: d.questionText.trim(),
      options: d.options,
      correctAnswerIndex: d.correctIndex,
      marks: d.marks,
    }));

    try {
      setAdding(true);
      await axios.post(`${API}/quiz/${id}/questions`, payload, { withCredentials: true });
      toast.success(`${payload.length} question${payload.length > 1 ? "s" : ""} added!`);
      setDrafts([emptyQuestion()]);
      fetchQuestions();
      fetchQuiz();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add questions");
    } finally {
      setAdding(false);
    }
  };

  /* ── delete existing question ── */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${API}/quiz/${id}/questions/${deleteQId}`, { withCredentials: true });
      toast.success("Question deleted");
      setDeleteModal(false);
      fetchQuestions();
      fetchQuiz();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const readyCount = drafts.filter(
    (d) => d.questionText.trim() && d.options.every((o) => o.text.trim())
  ).length;

  return (
    <div className="py-5">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/quiz")}
          className="p-1.5 text-gray-500 hover:text-primaryColor hover:bg-primaryColor/5 rounded-lg transition"
        >
          <MdArrowBack size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-primaryColor to-[#617cf5] flex items-center justify-center shadow shrink-0">
            <MdQuiz size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-primaryColor leading-none">
              {quiz?.title || "Quiz"} — Questions
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {questions.length} question{questions.length !== 1 ? "s" : ""} · {quiz?.totalMarks || 0} total marks
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT: ADD FORM ── */}
        <div className="">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-700">
                Add Questions
                {drafts.length > 1 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({readyCount}/{drafts.length} ready)
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={addDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primaryColor border border-primaryColor/30 hover:bg-primaryColor/5 rounded-lg transition"
              >
                <MdAdd size={14} /> Add another
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {drafts.map((d, idx) => (
                <QuestionCard
                  key={d._key}
                  q={d}
                  index={idx}
                  total={drafts.length}
                  onChange={(updated) => updateDraft(d._key, updated)}
                  onRemove={() => removeDraft(d._key)}
                />
              ))}
            </div>

            {/* submit row */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={addDraft}
                className="px-4 py-2 text-sm border border-dashed border-slate-300 text-slate-500 hover:border-primaryColor hover:text-primaryColor rounded-lg transition"
              >
                + Another Question
              </button>
              <button
                type="submit"
                disabled={adding || readyCount === 0}
                className="ml-auto flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor rounded-lg transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-60"
              >
                {adding ? <FiLoader className="animate-spin" size={15} /> : <MdSend size={15} />}
                {adding
                  ? "Saving..."
                  : `Submit ${drafts.length > 1 ? `${readyCount} Question${readyCount !== 1 ? "s" : ""}` : "Question"}`}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: EXISTING QUESTIONS ── */}
        <div className="">
          <div className="sticky top-4">
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              Existing Questions
              <span className="ml-2 text-xs font-normal text-slate-400">({questions.length})</span>
            </h2>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-xl" />
                ))
              ) : questions.length ? (
                questions.map((q, idx) => (
                  <div
                    key={q._id}
                    className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 leading-snug">
                          <span className="text-primaryColor font-bold mr-1">Q{idx + 1}.</span>
                          {q.questionText}
                        </p>
                        <div className="mt-1.5 space-y-0.5">
                          {q.options?.map((opt, oi) => (
                            <p
                              key={oi}
                              className={`text-xs px-2 py-0.5 rounded ${oi === q.correctAnswerIndex
                                ? "bg-emerald-50 text-emerald-700 font-semibold"
                                : "text-slate-500"
                                }`}
                            >
                              {String.fromCharCode(65 + oi)}. {opt.text}
                              {oi === q.correctAnswerIndex && " ✓"}
                            </p>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{q.marks} mark{q.marks !== 1 ? "s" : ""}</p>
                      </div>
                      <button
                        onClick={() => { setDeleteQId(q._id); setDeleteModal(true); }}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition shrink-0"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-300 text-sm border border-dashed rounded-xl">
                  No questions yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Question"
        description="Are you sure you want to delete this question? This cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default QuizQuestions;