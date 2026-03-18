import React, { useEffect, useState } from "react";
import { MdClose, MdUpdate } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const UpdateBatchStatusModal = ({ batch, onClose, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(batch?.status);

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const statusOptions = [
    { value: "upcoming", label: "Upcoming", color: "bg-blue-100 text-blue-700" },
    { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
    { value: "cancelled", label: "cancelled", color: "bg-gray-200 text-gray-700" },
    { value: "rescheduled", label: "Rescheduled", color: "bg-orange-100 text-orange-700" },
    { value: "completed", label: "Completed", color: "bg-purple-100 text-purple-700" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === batch.status) {
      return toast.error("Please select a different status");
    }

    try {
      setLoading(true);

      const res = await axios.patch(
        `${process.env.REACT_APP_API_URL}/batch/${batch._id}/status`,
        { status },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Batch status updated");
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}>
      <div
        ref={domNode}
        className={`bg-white w-full max-w-md rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <h2 className="text-lg font-semibold text-white">Update Batch Status</h2>
          <button onClick={handleClose} className="p-2 rounded-full bg-white">
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm font-semibold text-gray-800">{batch.batchName}</p>

          {statusOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${status === opt.value
                ? "border-primaryColor bg-blue-50"
                : "border-gray-200"
                }`}
            >
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={status === opt.value}
                onChange={(e) => setStatus(e.target.value)}
                className="w-4 h-4 text-primaryColor"
              />
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${opt.color}`}>
                {opt.label}
              </span>
            </label>
          ))}
        </form>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-br-3xl">
          <button onClick={handleClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 flex items-center gap-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md"
          >
            {loading && <FiLoader className="animate-spin" />}
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBatchStatusModal;
