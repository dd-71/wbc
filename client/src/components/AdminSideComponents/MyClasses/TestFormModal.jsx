import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MdClose,
  MdBolt,
  MdAdd,
  MdDelete,
  MdQuestionAnswer,
  MdUploadFile,
  MdImage,
  MdCheckCircle,
} from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import { cloudinary } from "../../../utils/cloudinary";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const TestFormModal = ({ classId, existingTest, onClose, onSuccess }) => {
  const isEdit = !!existingTest;
  const domNode = useClickOutside(() => handleClose())

  const [animate, setAnimate] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Paper file upload state */
  const [paperFile, setPaperFile] = useState(null);
  const [paperPreviewName, setPaperPreviewName] = useState(
    existingTest?.paperUrl ? "Previously uploaded file" : null
  );
  const [uploadingPaper, setUploadingPaper] = useState(false);
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    title: existingTest?.title || "",
    durationMinutes: existingTest?.durationMinutes || 30,
    questionMode: existingTest?.questionMode || "manual",
    paperUrl: existingTest?.paperUrl || "",
    paperType: existingTest?.paperType || "pdf",
    totalMarks: existingTest?.totalMarks || "",
    questions: existingTest?.questions || [],
  });

  useEffect(() => {
    if (existingTest?.questions) {
      const normalizedQuestions = existingTest.questions.map((q) => ({
        ...q,
        options:
          q.type === "mcq"
            ? q.options && q.options.length > 0
              ? q.options
              : [
                { text: "", isCorrect: true },
                { text: "", isCorrect: false },
              ]
            : [],
      }));

      setForm((f) => ({
        ...f,
        questions: normalizedQuestions,
      }));
    }
  }, [existingTest]);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  /* ── Question helpers ── */
  const addQuestion = () =>
    setForm((f) => ({
      ...f,
      questions: [
        ...f.questions,
        {
          questionText: "",
          type: "mcq",
          marks: 1,
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ],
        },
      ],
    }));

  const removeQuestion = (qi) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.filter((_, i) => i !== qi),
    }));

  const updateQuestion = (qi, field, value) =>
    setForm((f) => {
      const qs = [...f.questions];
      qs[qi] = { ...qs[qi], [field]: value };
      return { ...f, questions: qs };
    });

  const updateOption = (qi, oi, field, value) =>
    setForm((f) => {
      const qs = [...f.questions];
      const opts = [...qs[qi].options];
      if (field === "isCorrect" && value === true) {
        opts.forEach((_, idx) => (opts[idx] = { ...opts[idx], isCorrect: idx === oi }));
      } else {
        opts[oi] = { ...opts[oi], [field]: value };
      }
      qs[qi] = { ...qs[qi], options: opts };
      return { ...f, questions: qs };
    });

  const addOption = (qi) =>
    setForm((f) => {
      const qs = [...f.questions];
      qs[qi].options = [...qs[qi].options, { text: "", isCorrect: false }];
      return { ...f, questions: qs };
    });

  const removeOption = (qi, oi) =>
    setForm((f) => {
      const qs = [...f.questions];
      qs[qi].options = qs[qi].options.filter((_, i) => i !== oi);
      return { ...f, questions: qs };
    });

  /* ── File select handler ── */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    /* Detect paper type from file */
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      toast.error("Only PDF or image files are allowed");
      return;
    }

    setPaperFile(file);
    setPaperPreviewName(file.name);
    setForm((f) => ({
      ...f,
      paperType: isPdf ? "pdf" : "image",
      paperUrl: "", // clear old URL until uploaded
    }));
  };

  const removePaperFile = () => {
    setPaperFile(null);
    setPaperPreviewName(null);
    setForm((f) => ({ ...f, paperUrl: "", paperType: "pdf" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.durationMinutes) return toast.error("Duration is required");

    if (form.questionMode === "manual" && form.questions.length === 0)
      return toast.error("Add at least one question");

    if (form.questionMode === "upload" && !form.totalMarks)
      return toast.error("Total marks is required");

    if (form.questionMode === "upload" && !paperFile && !form.paperUrl)
      return toast.error("Please upload a question paper");

    try {
      setSaving(true);

      let resolvedPaperUrl = form.paperUrl;

      /* Upload paper to Cloudinary if a new file was selected */
      if (form.questionMode === "upload" && paperFile) {
        try {
          setUploadingPaper(true);
          const uploaded = await cloudinary(paperFile);
          resolvedPaperUrl = uploaded.url;
          setForm((f) => ({ ...f, paperUrl: resolvedPaperUrl }));
        } catch {
          toast.error("Failed to upload paper. Please try again.");
          return;
        } finally {
          setUploadingPaper(false);
        }
      }

      const payload = {
        title: form.title,
        durationMinutes: Number(form.durationMinutes),
        questionMode: form.questionMode,
        ...(form.questionMode === "manual"
          ? { questions: form.questions }
          : {
            paperUrl: resolvedPaperUrl,
            paperType: form.paperType,
            totalMarks: Number(form.totalMarks),
          }),
      };

      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/surprise-test/${existingTest._id}`,
          payload,
          { withCredentials: true }
        );
        toast.success("Test updated");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/surprise-test/class/${classId}`,
          payload,
          { withCredentials: true }
        );
        toast.success("Test created as draft");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save test");
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving || uploadingPaper;

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
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <MdBolt className="text-primaryColor" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? "Edit Draft Test" : "Create Surprise Test"}
              </h2>
              <p className="text-xs text-blue-100">
                {isEdit
                  ? "Update test details"
                  : "Saved as draft — publish when ready"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full bg-white hover:bg-gray-100 transition"
          >
            <MdClose size={20} className="text-slate-600" />
          </button>
        </div>

        {/* ── BODY ── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pt-6 pb-2 space-y-5 text-sm"
        >
          {/* TEST TITLE */}
          <FormField label="Test Title *">
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Chapter 5 Quick Check"
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none transition"
            />
          </FormField>

          {/* DURATION */}
          <FormField label="Duration (minutes) *">
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((f) => ({ ...f, durationMinutes: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none transition"
            />
          </FormField>

          {/* QUESTION MODE — only on create */}
          {!isEdit && (
            <FormField label="Question Mode">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "manual", label: "Enter Questions", icon: MdQuestionAnswer },
                  { value: "upload", label: "Upload Paper", icon: MdUploadFile },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, questionMode: value }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${form.questionMode === value
                      ? "border-primaryColor bg-primaryColor/5 text-primaryColor"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50"
                      }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
            </FormField>
          )}

          {/* ── MANUAL QUESTIONS ── */}
          {form.questionMode === "manual" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Questions ({form.questions.length})
                </p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-3 py-1 text-xs bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded flex items-center gap-1 transition-all duration-500 hover:shadow-[0px_4px_10px_#424242]"
                >
                  <MdAdd size={14} /> Add Question
                </button>
              </div>

              {form.questions.length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm bg-slate-50">
                  No questions yet. Click "Add Question" to begin.
                </div>
              )}

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {form.questions.map((q, qi) => (
                  <div
                    key={qi}
                    className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50"
                  >
                    {/* Question row */}
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primaryColor/10 flex items-center justify-center text-[11px] font-bold text-primaryColor shrink-0">
                        {qi + 1}
                      </span>

                      <input
                        value={q.questionText}
                        onChange={(e) =>
                          updateQuestion(qi, "questionText", e.target.value)
                        }
                        placeholder="Enter question..."
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primaryFadedColor bg-white"
                      />

                      {/* QUESTION TYPE SELECT */}
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          updateQuestion(qi, "type", newType);

                          // If switching to subjective → remove options
                          if (newType === "subjective") {
                            updateQuestion(qi, "options", []);
                          }

                          // If switching to mcq → initialize options
                          if (newType === "mcq") {
                            updateQuestion(qi, "options", [
                              { text: "", isCorrect: true },
                              { text: "", isCorrect: false },
                            ]);
                          }
                        }}
                        className="border border-slate-200 rounded-lg px-2 py-2 text-xs bg-white outline-none"
                      >
                        <option value="mcq">MCQ</option>
                        <option value="subjective">Subjective</option>
                      </select>

                      <input
                        type="number"
                        min={1}
                        value={q.marks}
                        onChange={(e) =>
                          updateQuestion(qi, "marks", Number(e.target.value))
                        }
                        title="Marks"
                        className="w-16 border border-slate-200 rounded-lg px-2 py-2 text-sm text-center outline-none focus:ring-1 focus:ring-primaryFadedColor bg-white"
                      />

                      <button
                        type="button"
                        onClick={() => removeQuestion(qi)}
                        className="p-1.5 border rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 text-slate-400 transition"
                      >
                        <MdDelete size={15} />
                      </button>
                    </div>


                    {q.type === "mcq" && (
                      <div className="space-y-2 pl-8">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qi}`}
                              checked={opt.isCorrect}
                              onChange={() => updateOption(qi, oi, "isCorrect", true)}
                              className="accent-primaryColor"
                              title="Mark as correct answer"
                            />
                            <input
                              value={opt.text}
                              onChange={(e) =>
                                updateOption(qi, oi, "text", e.target.value)
                              }
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primaryFadedColor bg-white"
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qi, oi)}
                                className="text-slate-300 hover:text-rose-400 transition"
                              >
                                <MdDelete size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(qi)}
                          className="text-[11px] text-slate-400 hover:text-primaryColor flex items-center gap-1 transition mt-1"
                        >
                          <MdAdd size={12} /> Add option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── UPLOAD PAPER ── */}
          {form.questionMode === "upload" && (
            <div className="space-y-4">
              {/* File drop zone — matches course banner style */}
              <div className="border-2 border-dashed rounded-xl p-4 bg-slate-50">
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  Question Paper (PDF or Image) *
                </p>

                {paperPreviewName ? (
                  /* File selected / already uploaded */
                  <div className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primaryColor/10 flex items-center justify-center shrink-0">
                        {form.paperType === "pdf" ? (
                          <MdUploadFile size={20} className="text-primaryColor" />
                        ) : (
                          <MdImage size={20} className="text-primaryColor" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {paperPreviewName}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {form.paperType}
                          {form.paperUrl && (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-emerald-500">
                              <MdCheckCircle size={11} /> Uploaded
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePaperFile}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition shrink-0"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                ) : (
                  /* Empty — click to upload */
                  <label className="flex flex-col items-center justify-center h-36 cursor-pointer group">
                    <div className="w-14 h-14 rounded-2xl bg-primaryColor/10 flex items-center justify-center mb-3 group-hover:bg-primaryColor/15 transition">
                      <MdUploadFile size={28} className="text-primaryColor/60" />
                    </div>
                    <span className="text-slate-500 text-sm font-medium">
                      Click to upload paper
                    </span>
                    <span className="text-slate-400 text-xs mt-1">
                      PDF or image files accepted
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept=".pdf,image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>

              {/* Paper type override (auto-detected, but user can change) */}
              {paperPreviewName && (
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">
                    Paper Type
                  </label>
                  <select
                    value={form.paperType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, paperType: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  >
                    <option value="pdf">PDF</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              )}
              {form.questionMode === "upload" && (
                <FormField label="Total Marks *">
                  <input
                    type="number"
                    min={1}
                    value={form.totalMarks}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, totalMarks: e.target.value }))
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none transition"
                    placeholder="Enter total marks for this test"
                  />
                </FormField>
              )}
            </div>
          )}

          {/* spacer so content clears sticky footer */}
          <div className="h-2" />
        </form>

        {/* ── STICKY FOOTER ── */}
        <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-br-3xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={isBusy}
            className="px-4 py-2 flex items-center gap-1.5 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-70"
          >
            {isBusy && <FiLoader className="animate-spin" size={14} />}
            {uploadingPaper
              ? "Uploading paper..."
              : saving
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Test"
                  : "Save as Draft"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── small helper ── */
const FormField = ({ label, children }) => (
  <div>
    <p className="text-xs font-medium text-gray-700 mb-1.5">{label}</p>
    {children}
  </div>
);

export default TestFormModal;