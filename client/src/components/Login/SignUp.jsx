import React, { useState } from "react";
import {
  MdOutlineMail,
  MdLockOutline,
  MdVisibility,
  MdVisibilityOff,
  MdPersonOutline,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

const roles = [
  { label: "Super Admin", value: "superadmin" },
  { label: "Admin", value: "admin" },
  { label: "Tutor", value: "tutor" },
  { label: "Marketing Staff", value: "marketing-staff" },
];

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        {/* LOGO */}
        <div className="text-center mb-6">
          <img src={assets.logo} alt="logo" className="w-36 mx-auto" />
          <p className="text-sm text-slate-500 mt-1">
            Create your account
          </p>
        </div>

        <form className="space-y-4">
          {/* ROW 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <MdPersonOutline className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-1 focus:ring-primaryFadedColor focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <MdPersonOutline className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-1 focus:ring-primaryFadedColor focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <MdOutlineMail className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-1 focus:ring-primaryFadedColor focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gender
              </label>
              <select className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-primaryFadedColor focus:outline-none">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* ROLE */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>

            <button
              type="button"
              onClick={() => setRoleOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-white
    focus:ring-1 focus:ring-primaryFadedColor focus:outline-none"
            >
              <span className={selectedRole ? "text-slate-800" : "text-slate-400"}>
                {selectedRole
                  ? roles.find((r) => r.value === selectedRole)?.label
                  : "Select role"}
              </span>

              <svg
                className={`w-4 h-4 transition-transform ${roleOpen ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {roleOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.value);
                      setRoleOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition
            ${selectedRole === role.value
                        ? "bg-primaryFadedColor/20 text-primaryColor"
                        : "hover:bg-slate-100"
                      }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* PASSWORDS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <MdLockOutline className="absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-1 focus:ring-primaryFadedColor focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <MdLockOutline className="absolute left-3 top-3 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-1 focus:ring-primaryFadedColor focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-3 text-slate-400"
                >
                  {showConfirmPassword ? (
                    <MdVisibilityOff />
                  ) : (
                    <MdVisibility />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* TERMS */}
          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span className="text-slate-600">
              I agree to the{" "}
              <span className="text-primaryColor font-medium cursor-pointer">
                Terms
              </span>{" "}
              &{" "}
              <span className="text-primaryColor font-medium cursor-pointer">
                Privacy Policy
              </span>
            </span>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-gradient-to-t from-primaryFadedColor to-primaryColor hover:bg-gradient-to-b text-white py-2.5 rounded-md font-semibold transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primaryColor font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
