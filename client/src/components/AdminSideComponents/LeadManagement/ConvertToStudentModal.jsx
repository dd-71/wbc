import React, { useEffect, useState } from "react";
import {
  MdClose, MdPersonAdd, MdCheckCircle, MdPhone,
  MdEmail,
  MdSchool,
  MdLocationOn,
  MdLibraryBooks,
  MdAttachMoney,
  MdLock,
  MdDescription,
  MdWarning,
  MdInfo
} from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import axios from "axios";
import toast from "react-hot-toast";

const CredentialsModal = ({ credentials, onClose }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4
      bg-black/60 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`w-full max-w-md bg-white rounded-tl-3xl rounded-br-3xl shadow-2xl
        max-h-[90vh] flex flex-col
        transition-all duration-300
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* SUCCESS HEADER - Fixed */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4 flex-shrink-0 bg-white rounded-tl-3xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg">
            <MdCheckCircle className="text-white" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Student Created Successfully!
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Please save these credentials for the student
          </p>
        </div>

        {/* CREDENTIALS - Scrollable */}
        <div className="px-6 overflow-y-auto flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 space-y-3">
            <div className="bg-white rounded-lg p-4 border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Username
              </p>
              <p className="text-base font-bold text-gray-800 break-all">
                {credentials.username}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Password
              </p>
              <p className="text-base font-bold text-gray-800 font-mono">
                {credentials.password}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Email
              </p>
              <p className="text-base font-bold text-gray-800 break-all">
                {credentials.email}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl">
            <p className="text-sm text-yellow-900 flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>
                <strong>Important:</strong> Make sure to save these credentials. They
                won't be shown again.
              </span>
            </p>
          </div>
        </div>

        {/* FOOTER - Fixed */}
        <div className="px-6 pb-6 pt-4 flex-shrink-0 bg-white rounded-br-3xl">
          <button
            onClick={handleClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ConvertToStudentModal = ({ lead, onClose, addModal, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const [formData, setFormData] = useState({
    enrollAmount: "",
    password: "",
  });

  const [useCustomPassword, setUseCustomPassword] = useState(false);

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    if (addModal) setTimeout(() => setAnimate(true), 10);
  }, [addModal]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (lead.status !== "interested") {
      toast.error("Only interested leads can be converted to students");
      return;
    }

    if (
      !lead.interestedEnrollments ||
      lead.interestedEnrollments.length === 0
    ) {
      toast.error("Please add interested batches & courses first");
      return;
    }

    const hasAtLeastOneCourse = lead.interestedEnrollments.some(
      (en) => en?.courses && en?.courses.length > 0
    );

    if (!hasAtLeastOneCourse) {
      toast.error("Please select at least one course inside a batch");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/lead/lead-to-student/${lead._id}`,
        formData,
        { withCredentials: true }
      );

      // Show credentials modal
      if (response.data.data) {
        setCredentials(response.data.data);
        setShowCredentials(true);
      } else {
        toast.success(
          response.data.message || "Lead converted to student successfully"
        );
        onSuccess();
        handleClose();
      }
    } catch (err) {
      console.error("Conversion failed", err);
      toast.error(err.response?.data?.message || "Failed to convert lead");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsClose = () => {
    setShowCredentials(false);
    onSuccess();
    handleClose();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700",
      interested: "bg-green-100 text-green-700",
      "partially interested": "bg-blue-100 text-blue-700",
      "not interested": "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-3 py-1 text-xs rounded-full font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"
          }`}
      >
        {status}
      </span>
    );
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      lead.status === "interested" &&
      lead.interestedEnrollments &&
      lead.interestedEnrollments.some(
        (en) => en?.courses && en?.courses.length > 0
      ) &&
      formData.enrollAmount &&
      Number(formData.enrollAmount) > 0
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center
        bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300
        ${animate ? "opacity-100" : "opacity-0"}`}
      >
        <div
          ref={domNode}
          className={`w-full max-w-4xl mx-4 bg-white rounded-tl-3xl rounded-br-3xl shadow-xl
          transition-all duration-300 max-h-[90vh] flex flex-col
          ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <MdPersonAdd className="text-primaryColor" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Convert to Student
                </h2>
                <p className="text-xs text-gray-100">
                  Create student account for {lead.name}
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

          {/* BODY - Scrollable */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
            <div className="space-y-5">
              {/* LEAD DETAILS CARD */}
              <div className="border-2 border-gray-100 rounded-xl p-5 bg-gradient-to-br from-slate-50 to-gray-50 hover:border-primaryColor/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-xl mb-2">
                      {lead.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="text-lg"><MdPhone className="text-primaryColor" size={18} /></span>
                        <span className="font-medium">{lead.phoneNumber}</span>
                      </p>
                      {lead.email && (
                        <p className="flex items-center gap-2">
                          <span className="text-lg"><MdEmail className="text-primaryColor" size={18} /></span>
                          <span className="font-medium break-all">{lead.email}</span>
                        </p>
                      )}
                      {lead.collegeName && (
                        <p className="flex items-center gap-2 md:col-span-2">
                          <span className="text-lg"><MdSchool className="text-primaryColor" size={18} /></span>
                          <span className="font-medium">{lead.collegeName}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-2 md:col-span-2">
                        <span className="text-lg"><MdLocationOn className="text-primaryColor" size={18} /></span>
                        <span className="font-medium">
                          {lead.branch?.city || "N/A"}, {lead.branch?.state || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(lead.status)}
                </div>
              </div>

              {/* INTERESTED COURSES */}
              {lead.interestedEnrollments &&
                lead.interestedEnrollments.length > 0 && (
                  <div className="border-2 border-gray-100 rounded-xl p-5 bg-white">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <MdLibraryBooks className="text-primaryColor" size={20} />
                      Interested Batches & Courses
                    </h4>

                    <div className="space-y-4">
                      {lead.interestedEnrollments.map((en, index) => (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 rounded-lg border"
                        >
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Batch: {en.batch?.batchName || "N/A"}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {en?.courses.map((course, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
                              >
                                {course.courseName || course}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* VALIDATION WARNINGS */}
              {lead.status !== "interested" && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-medium flex items-start gap-2">
                    <span className="text-lg"><MdWarning className="text-lg" /></span>
                    Lead status must be "interested" to convert
                  </p>
                </div>
              )}

              {(!lead.interestedEnrollments ||
                !lead.interestedEnrollments.some(
                  (en) => en?.courses && en?.courses.length > 0
                )) && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-800 font-medium flex items-start gap-2">
                      <span className="text-lg"><MdWarning className="text-lg" /></span>
                      Add interested batches & courses before converting
                    </p>
                  </div>
                )}

              {/* FORM INPUTS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ENROLLMENT AMOUNT */}
                <div className="border-2 border-gray-100 rounded-xl p-5 bg-white hover:border-primaryColor/30 transition-colors">
                  <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-lg"><MdAttachMoney className="text-primaryColor" size={20} /></span>
                    Enrollment Amount *
                  </label>
                  <input
                    required
                    type="number"
                    name="enrollAmount"
                    value={formData.enrollAmount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min="0"
                    className="w-full px-4 py-3 border-2 rounded-lg bg-slate-50 focus:bg-white focus:border-primaryColor outline-none transition text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Initial enrollment fee for the student(500)
                  </p>
                </div>

                {/* PASSWORD SECTION */}
                <div className="border-2 border-gray-100 rounded-xl p-5 bg-white hover:border-primaryColor/30 transition-colors">
                  <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-lg"><MdLock className="text-primaryColor" size={20} /></span>
                    Password Settings
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition border-2 border-transparent hover:border-primaryColor/20">
                    <input
                      type="checkbox"
                      checked={useCustomPassword}
                      onChange={(e) => {
                        setUseCustomPassword(e.target.checked);
                        if (!e.target.checked) {
                          setFormData((prev) => ({ ...prev, password: "" }));
                        }
                      }}
                      className="w-5 h-5 text-primaryColor focus:ring-primaryFadedColor rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-800">
                        Custom password
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {useCustomPassword ? "Enter below" : "Default: Welcome@123"}
                      </p>
                    </div>
                  </label>

                  {useCustomPassword && (
                    <div className="mt-3">
                      <input
                        required={useCustomPassword}
                        type="text"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter custom password"
                        minLength={6}
                        className="w-full px-4 py-3 border-2 rounded-lg bg-slate-50 focus:bg-white focus:border-primaryColor outline-none transition font-medium"
                      />
                      <p className="text-xs text-gray-500 mt-2">Minimum 6 characters</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AUTO-GENERATED PREVIEW */}
              <div className="border-2 border-blue-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
                <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-lg"><MdDescription className="text-primaryColor" size={20} /></span>
                  Generated Credentials Preview
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-xs font-semibold block mb-1">
                      Username:
                    </span>
                    <span className="font-mono font-bold text-gray-800 text-sm break-all">
                      {lead.name?.trim().replace(/\s+/g, "")}@WBC
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-xs font-semibold block mb-1">
                      Password:
                    </span>
                    <span className="font-mono font-bold text-gray-800 text-sm">
                      {useCustomPassword
                        ? formData.password || "••••••"
                        : "Welcome@123"}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-xs font-semibold block mb-1">
                      Email:
                    </span>
                    <span className="font-mono font-bold text-gray-800 text-sm break-all">
                      {lead.email ||
                        `${lead.name?.trim().replace(/\s+/g, "")}student@gmail.com`}
                    </span>
                  </div>
                </div>
              </div>

              {/* INFO NOTE */}
              <div className="p-4 bg-gradient-to-r from-slate-100 to-gray-100 border-2 border-slate-300 rounded-xl">
                <p className="text-xs text-gray-700 flex items-center gap-2">
                  <span className="text-base"><MdInfo className="text-lg" /></span>
                  <span>
                    <strong>Note:</strong>The student account will be created. Enrollment will happen after payment for selected batch & course.
                  </span>
                </p>
              </div>
            </div>
          </form>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50 rounded-br-3xl flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 border-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !isFormValid()}
              className="px-4 py-2.5 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Converting..." : "Convert to Student"}
            </button>
          </div>
        </div>
      </div>

      {/* CREDENTIALS MODAL */}
      {showCredentials && credentials && (
        <CredentialsModal
          credentials={credentials}
          onClose={handleCredentialsClose}
        />
      )}
    </>
  );
};

export default ConvertToStudentModal;