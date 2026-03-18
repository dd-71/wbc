import React, { useState } from "react";
import {
  MdLockOutline,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircleOutline,
} from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import axios from "axios";
import toast from "react-hot-toast";

// view: "reset" | "success"
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [view, setView] = useState("reset");
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    // if (newPassword.length < 6) {
    //   toast.error("Password must be at least 6 characters");
    //   return;
    // }
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/reset-password/${token}`,
        { newPassword }
      );
      toast.success(response.data.message || "Password reset successfully!");
      setView("success");
    } catch (error) {
      console.error("Reset password failed", error);
      toast.error(error.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1D1DA4] via-[#064585] to-[#1D1DA4]">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1D1DA4] via-[#064585] to-[#1D1DA4] opacity-0"></div>
        <div className="absolute w-[500px] h-[500px] bg-[#8cc441] rounded-full blur-[150px] opacity-80"></div>
        <div className="relative z-10 w-full">
          <img
            src={assets.login}
            alt="Admin Portal Illustration"
            className="w-full h-full object-cover drop-shadow-2xl"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#ffffff59] backdrop-blur-sm rounded-lg shadow-lg p-8">

          {view === "reset" && (
            <>
              <div className="text-center mb-8">
                <img src={assets.logo2} alt="logo" className="w-40 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-[#1D1DA4]">Reset Password</h2>
                <p className="text-gray-50 text-sm">Enter your new password below</p>
              </div>

              <form className="space-y-5" onSubmit={handleReset}>
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-50 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <MdLockOutline className="absolute left-3 top-4 text-gray-600" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1D1DA4] focus:outline-none transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showNew ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-50 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <MdLockOutline className="absolute left-3 top-4 text-gray-600" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1D1DA4] focus:outline-none transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirmPassword && (
                    <p className={`text-xs mt-1 ${newPassword === confirmPassword ? "text-[#8cc441]" : "text-red-300"}`}>
                      {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#1D1DA4] to-[#064585] hover:opacity-90 text-white py-2.5 rounded-lg font-semibold transition duration-300 shadow-lg"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {view === "success" && (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-5">
              {/* Animated success icon */}
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm shadow-lg">
                <div className="absolute inset-0 rounded-full bg-[#8cc441]/30 animate-ping"></div>
                <MdCheckCircleOutline className="text-5xl text-[#8cc441] relative z-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Password Reset!</h2>
                <p className="text-gray-100 text-sm leading-relaxed max-w-xs">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>

              <div className="w-full border-t border-white/20 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full bg-gradient-to-r from-[#1D1DA4] to-[#064585] hover:opacity-90 text-white py-2.5 rounded-lg font-semibold transition duration-300 shadow-lg"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-100 mt-8">
            © {new Date().getFullYear()} WBC Coaching Center
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;