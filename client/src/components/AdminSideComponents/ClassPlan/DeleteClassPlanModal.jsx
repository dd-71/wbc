import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdClose, MdWarning, MdDeleteForever } from "react-icons/md";

const DeleteClassPlanModal = ({ cls, onClose, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/class-plan/${cls._id}`,
        { withCredentials: true }
      );
      toast.success("Class plan removed");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete plan");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Remove Class Plan</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* body */}
        <div className="px-5 py-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <MdWarning size={28} className="text-red-500" />
          </div>
          <p className="text-sm text-slate-700 font-medium mb-1">
            Are you sure you want to remove this plan?
          </p>
          <p className="text-xs text-slate-400 mb-2">
            <span className="font-medium text-slate-600">{cls.className}</span>
          </p>
          <p className="text-xs text-slate-400">
            {new Date(cls.classDate).toLocaleDateString("en-IN", {
              weekday: "long", day: "2-digit", month: "long", year: "numeric",
            })}
          </p>
          <p className="text-xs text-red-400 mt-3 bg-red-50 rounded-lg px-3 py-2">
            This will permanently delete all topics, materials, and homework for this class.
          </p>
        </div>

        {/* footer */}
        <div className="px-5 pb-5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg transition"
          >
            <MdDeleteForever size={16} />
            {deleting ? "Removing..." : "Remove Plan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteClassPlanModal;