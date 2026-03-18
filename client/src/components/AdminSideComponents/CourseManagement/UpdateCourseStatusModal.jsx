import React, { useEffect, useState } from "react";
import { MdClose, MdUpdate } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const UpdateCourseStatusModal = ({ course, onClose, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(course?.status || "draft");

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === course.status) {
      toast.error("Please select a different status");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.patch(
        `${process.env.REACT_APP_API_URL}/course/${course._id}/status`,
        { status },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Status updated successfully");
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    {
      value: "draft",
      label: "Draft",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    {
      value: "active",
      label: "Active",
      color: "bg-green-100 text-green-700 border-green-200",
    },
  ];


  return (
    <div
      className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-md max-h-[85vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdUpdate className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Update Status</h2>
              <p className="text-xs text-gray-100">Change course status</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white hover:bg-gray-200 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* COURSE INFO */}
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                {course.courseName}
              </p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                Current Status:{" "}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusOptions.find((s) => s.value === course.status)?.color
                    }`}
                >
                  {course.status}
                </span>
              </p>
            </div>

            {/* STATUS OPTIONS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select New Status *
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${status === option.value
                      ? "border-primaryColor bg-blue-50 shadow-md scale-[1.02]"
                      : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-5 h-5 text-primaryColor focus:ring-primaryColor cursor-pointer"
                    />
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${option.color}`}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* STICKY FOOTER */}
          <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-br-3xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || status === course.status}
              className="px-5 py-2.5 flex items-center gap-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-lg text-sm font-medium transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <FiLoader className="animate-spin" size={16} />}
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCourseStatusModal;