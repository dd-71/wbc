import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { FaMoneyBillWave } from "react-icons/fa";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import axios from "axios";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";

const AddPaymentModal = ({ lead, onClose, addModal, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const [formData, setFormData] = useState({
    type: "course-payment",
    amount: "",
    mode: "cash",
    remarks: "",
  });

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    if (addModal) {
      setTimeout(() => setAnimate(true), 10);
      fetchSummary();
    }
  }, [addModal]);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/lead/payment-summary/${lead._id}`,
        { withCredentials: true }
      );
      setSummary(res.data.data);
    } catch (err) {
      console.error("Failed to fetch payment summary");
    }
  };

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

    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/lead/payment/${lead._id}`,
        formData,
        { withCredentials: true }
      );

      toast.success(response.data.message || "Payment added successfully");
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Payment failed", err);
      toast.error(err.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
      bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={domNode}
        className={`w-full max-w-md mx-4 bg-white rounded-tl-3xl rounded-br-3xl shadow-xl
        transition-all duration-300 max-h-[90vh] flex flex-col
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <FaMoneyBillWave className="text-primaryColor" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Add Payment</h2>
              <p className="text-xs text-gray-100">Record payment for {lead.name}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* LEAD INFO */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="font-semibold text-gray-800">{lead.name}</p>
            <p className="text-sm text-gray-600">{lead.phoneNumber}</p>
          </div>

          {/* PAYMENT SUMMARY */}
          {summary && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-sm">
              <p className="font-semibold text-blue-800 mb-2">Payment Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                <span>Enrollment Fee:</span>
                <span className="font-medium">₹{summary.enrollmentFee?.toLocaleString()}</span>
                <span>Total Course Price:</span>
                <span className="font-medium">₹{summary.totalCoursePrice?.toLocaleString()}</span>
                <span>Total Required:</span>
                <span className="font-medium">₹{summary.totalRequired?.toLocaleString()}</span>
                <span>Total Paid:</span>
                <span className="font-medium text-green-700">₹{summary.totalPaid?.toLocaleString()}</span>
                <span className="font-semibold">Remaining:</span>
                <span className="font-bold text-red-600">₹{summary.remaining?.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* PAYMENT TYPE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Type *
            </label>
            <select
              required
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none transition text-sm"
            >
              <option value="course-payment">Course Payment</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          {/* AMOUNT */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount *
            </label>
            <input
              required
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="1"
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none transition text-sm"
            />
            {summary && formData.type === "course-payment" && summary.remaining > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Max payable: ₹{summary.remaining?.toLocaleString()}
              </p>
            )}
          </div>

          {/* PAYMENT MODE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Mode *
            </label>
            <select
              required
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none transition text-sm"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>

          {/* REMARKS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Add any notes or remarks"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none transition text-sm resize-none"
            />
          </div>
        </form>

        {/* FOOTER */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t bg-white rounded-br-3xl flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 flex items-center gap-1 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md text-sm transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <FiLoader className="animate-spin" />}
            {loading ? "Processing..." : "Add Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;