import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";
import { MdClose, MdPersonAdd } from "react-icons/md";
import { useAuth } from "../../../context/AuthProvider";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const CreateLeadModal = ({ onClose, addModal, onComplete, editLead }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { branches, user } = useAuth();
  const [batches, setBatches] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    whatsappNumber: "",
    collegeName: "",
    status: "pending",
    remarks: "",
    branch: user?.branch?._id || "",
    interestedEnrollments: [],
  });

  const [parents, setParents] = useState([
    {
      name: "",
      relation: "",
      phoneNumber: "",
      whatsappNumber: "",
      email: "",
      occupation: "",
    },
  ]);

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    if (addModal) setTimeout(() => setAnimate(true), 10);
  }, [addModal]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/batch/all/`,
        { withCredentials: true, params: { status: "upcoming,active" } }
      );
      setBatches(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch batches");
    }
  };

  useEffect(() => {
    if (editLead) {
      setFormData({
        name: editLead.name || "",
        email: editLead.email || "",
        phoneNumber: editLead.phoneNumber || "",
        gender: editLead.gender || "",
        whatsappNumber: editLead.whatsappNumber || "",
        collegeName: editLead.collegeName || "",
        status: editLead.status || "pending",
        remarks: editLead.remarks || "",
        branch: editLead.branch?._id || "",
        interestedEnrollments:
          editLead.interestedEnrollments?.map((en) => ({
            batch: en.batch?._id || en.batch,
            courses: en.courses.map((c) => c._id || c),
          })) || [],
      });

      if (editLead.parents && editLead.parents.length > 0) {
        setParents(editLead.parents);
      }
    }
  }, [editLead]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParentChange = (index, field, value) => {
    const newParents = [...parents];
    newParents[index][field] = value;
    setParents(newParents);
  };

  const addParent = () => {
    setParents([
      ...parents,
      {
        name: "",
        relation: "",
        phoneNumber: "",
        whatsappNumber: "",
        email: "",
        occupation: "",
      },
    ]);
  };

  const removeParent = (index) => {
    setParents(parents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const cleanedEnrollments = formData.interestedEnrollments
        .filter((en) => en.batch && en.courses.length > 0);

      const payload = {
        ...formData,
        interestedEnrollments: cleanedEnrollments,
        parents: parents.filter((p) => p.name && p.phoneNumber),
      };

      const url = editLead
        ? `${process.env.REACT_APP_API_URL}/lead/${editLead._id}`
        : `${process.env.REACT_APP_API_URL}/lead/create`;

      const method = editLead ? axios.put : axios.post;

      const response = await method(url, payload, { withCredentials: true });

      toast.success(response.data.message || "Lead saved successfully");
      onComplete();
      handleClose();
    } catch (err) {
      console.error("Lead save failed", err);
      toast.error(err.response?.data?.message || "Failed to save lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed py-10 inset-0 z-50 flex items-center justify-center
      bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={domNode}
        className={`w-full max-h-[90vh] overflow-y-auto max-w-4xl bg-white rounded-tl-3xl rounded-br-3xl  shadow-2xl
        transition-all duration-300
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center sticky top-0 justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdPersonAdd className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editLead ? "Update Lead" : "Create New Lead"}
              </h2>
              <p className="text-xs text-gray-100">
                {editLead ? "Update lead information" : "Add a new lead to the system"}
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 pt-6 space-y-6 text-sm">
          {/* BASIC INFO */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name *"
                className="col-span-2 w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />

              <input
                required
                name="phoneNumber"
                value={formData.phoneNumber}
                type="tel"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={handleChange}
                placeholder="Phone Number *"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />

              <input
                name="whatsappNumber"
                value={formData.whatsappNumber}
                type="tel"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={handleChange}
                placeholder="WhatsApp Number"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />

              <select
                required
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              >
                <option value="">Select Gender *</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="College Name"
                className="col-span-2 w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />
            </div>
          </div>

          {/* LEAD STATUS */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Lead Status
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <select
                required
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              >
                <option value="pending">Pending</option>
                <option value="interested">Interested</option>
                <option value="partially interested">Partially Interested</option>
                <option value="not interested">Not Interested</option>
              </select>

              {user?.role?.roleName === "super-admin" ? (
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                >
                  <option value="">Select Branch *</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.city} ({b.state})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700">
                  📍 {user?.branch?.city} ({user?.branch?.state})
                </div>
              )}

              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Remarks"
                rows={3}
                className="col-span-2 w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />
            </div>
          </div>

          {/* INTERESTED BATCHES & COURSES */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Interested Batches & Courses
              </h3>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    interestedEnrollments: [
                      ...prev.interestedEnrollments,
                      { batch: "", courses: [] },
                    ],
                  }))
                }
                className="text-xs text-primaryColor hover:underline"
              >
                + Add Batch
              </button>
            </div>

            {formData.interestedEnrollments.map((enrollment, index) => {
              const selectedBatch = batches.find(
                (b) => b._id === enrollment.batch
              );

              return (
                <div key={index} className="border p-4 rounded-lg bg-slate-50 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Batch {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...formData.interestedEnrollments];
                        updated.splice(index, 1);
                        setFormData({ ...formData, interestedEnrollments: updated });
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Batch Select */}
                  <select
                    required
                    value={enrollment.batch}
                    onChange={(e) => {
                      const updated = [...formData.interestedEnrollments];
                      updated[index].batch = e.target.value;
                      updated[index].courses = [];
                      setFormData({ ...formData, interestedEnrollments: updated });
                    }}
                    className="w-full mb-3 px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">Select Batch *</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.batchName}
                      </option>
                    ))}
                  </select>

                  {/* Courses Inside Batch */}
                  {selectedBatch?.courses?.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600">
                        Select Courses
                      </label>

                      {selectedBatch.courses.map((c) => (
                        <label
                          key={c.course._id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={enrollment.courses.includes(c.course._id)}
                            onChange={() => {
                              const updated = [...formData.interestedEnrollments];
                              const exists =
                                updated[index].courses.includes(c.course._id);

                              updated[index].courses = exists
                                ? updated[index].courses.filter(
                                  (id) => id !== c.course._id
                                )
                                : [...updated[index].courses, c.course._id];

                              setFormData({
                                ...formData,
                                interestedEnrollments: updated,
                              });
                            }}
                          />
                          <span>{c.course.courseName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PARENT INFO */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Parent/Guardian Information
              </h3>
              <button
                type="button"
                onClick={addParent}
                className="text-xs text-primaryColor hover:underline"
              >
                + Add Parent
              </button>
            </div>

            {parents.map((parent, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Parent {index + 1}
                  </span>
                  {parents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParent(index)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={parent.name}
                    onChange={(e) =>
                      handleParentChange(index, "name", e.target.value)
                    }
                    placeholder="Parent Name"
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  />

                  <select
                    value={parent.relation}
                    onChange={(e) =>
                      handleParentChange(index, "relation", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  >
                    <option value="">Relation</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>

                  <input
                    value={parent.phoneNumber}
                    onChange={(e) =>
                      handleParentChange(index, "phoneNumber", e.target.value)
                    }
                    placeholder="Phone Number"
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  />

                  <input
                    value={parent.whatsappNumber}
                    onChange={(e) =>
                      handleParentChange(index, "whatsappNumber", e.target.value)
                    }
                    placeholder="WhatsApp Number"
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  />

                  <input
                    type="email"
                    value={parent.email}
                    onChange={(e) =>
                      handleParentChange(index, "email", e.target.value)
                    }
                    placeholder="Email"
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  />

                  <input
                    value={parent.occupation}
                    onChange={(e) =>
                      handleParentChange(index, "occupation", e.target.value)
                    }
                    placeholder="Occupation"
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="flex justify-end items-center gap-3 py-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 flex items-center gap-1 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
            >{loading && <FiLoader className="animate-spin" />}
              {loading ? "Saving..." : editLead ? "Update Lead" : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeadModal;