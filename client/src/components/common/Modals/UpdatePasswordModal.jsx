import React, { useEffect, useState } from "react";
import { MdClose, MdLockOutline } from "react-icons/md";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const UpdatePasswordModal = ({ onClose }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    // if (formData.newPassword.length < 6) {
    //   toast.error("Password must be at least 6 characters");
    //   return;
    // }
    try {
      setLoading(true);
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/users/update-password`,
        { oldPassword: formData.oldPassword, newPassword: formData.newPassword },
        { withCredentials: true }
      );
      toast.success("Password updated successfully");
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 backdrop-blur-sm z-50 bg-primaryColor/10 flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-lg rounded-tl-3xl rounded-br-3xl transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdLockOutline className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Update Password</h2>
              <p className="text-xs text-gray-100">Change your account password</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white hover:bg-gray-200 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 text-sm">
          {/* Current Password */}
          <div className="relative">
            <MdLockOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              type={showOld ? "text" : "password"}
              placeholder="Current Password"
              required
              className="w-full pl-9 pr-10 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
            <button type="button" onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showOld ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <MdLockOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              required
              className="w-full pl-9 pr-10 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
            <button type="button" onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showNew ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <MdLockOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm New Password"
                required
                className="w-full pl-9 pr-10 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            {formData.confirmPassword && (
              <p
                className={`text-xs mt-1 ml-1 ${formData.newPassword === formData.confirmPassword
                  ? "text-green-500"
                  : "text-red-400"
                  }`}
              >
                {formData.newPassword === formData.confirmPassword
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 flex items-center gap-1 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
            >
              {loading && <FiLoader className="animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;