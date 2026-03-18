import React, { useState } from "react";
import {
  MdOutlineMail,
  MdLockOutline,
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack,
  MdMarkEmailRead,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import axios from "axios";
import toast from "react-hot-toast";
import { setAuthData } from "../../utils/authStorage";
import { useAuth } from "../../context/AuthProvider";

// view: "login" | "forgot" | "forgot-success"
const Login = () => {
  const navigate = useNavigate();
  const { setUser, setRole, setPermissions } = useAuth();

  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  // ── Login ──────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/signin`,
        loginData,
        { withCredentials: true }
      );
      setAuthData(response.data.data);
      setUser(response.data.data.user);
      setRole(response.data.data.user?.role?.roleName);
      setPermissions(response.data?.user?.permissions?.permissions || []);
      toast.success(response.data.message);
      navigate("/");
    } catch (error) {
      console.error("Login failed", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/forgot-password`,
        { email: forgotEmail }
      );
      toast.success(response.data.message || "Reset email sent!");
      setView("forgot-success");
    } catch (error) {
      console.error("Forgot password failed", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    // ── LOGIN VIEW ─────────────────────────────────────────
    if (view === "login") {
      return (
        <>
          <div className="text-center mb-8">
            <img src={assets.logo2} alt="logo" className="w-40 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-[#1D1DA4]">Admin Login</h2>
            <p className="text-gray-50 text-sm">Sign in to access your dashboard</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-50 mb-1">
                Email Address
              </label>
              <div className="relative">
                <MdOutlineMail className="absolute left-3 top-4 text-gray-600" />
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1D1DA4] focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-50 mb-1">
                Password
              </label>
              <div className="relative">
                <MdLockOutline className="absolute left-3 top-4 text-gray-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1D1DA4] focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <div className="text-right text-sm">
              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-[#1D1DA4] font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1D1DA4] to-[#064585] hover:opacity-90 text-white py-2.5 rounded-lg font-semibold transition duration-300 shadow-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </>
      );
    }

    // ── FORGOT PASSWORD VIEW ───────────────────────────────
    if (view === "forgot") {
      return (
        <>
          <div className="text-center mb-8">
            <img src={assets.logo2} alt="logo" className="w-40 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-[#1D1DA4]">Forgot Password</h2>
            <p className="text-gray-50 text-sm">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleForgotPassword}>
            <div>
              <label className="block text-sm font-medium text-gray-50 mb-1">
                Email Address
              </label>
              <div className="relative">
                <MdOutlineMail className="absolute left-3 top-4 text-gray-600" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1D1DA4] focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1D1DA4] to-[#064585] hover:opacity-90 text-white py-2.5 rounded-lg font-semibold transition duration-300 shadow-lg"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => setView("login")}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-50 hover:text-white transition"
            >
              <MdArrowBack /> Back to Login
            </button>
          </form>
        </>
      );
    }

    // ── FORGOT SUCCESS VIEW ────────────────────────────────
    if (view === "forgot-success") {
      return (
        <div className="flex flex-col items-center justify-center text-center py-6 space-y-5">
          {/* Animated mail icon */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm shadow-lg">
            <div className="absolute inset-0 rounded-full bg-primaryColor/30 animate-ping"></div>
            <MdMarkEmailRead className="text-5xl text-primaryColor relative z-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Check Your Inbox!</h2>
            <p className="text-gray-100 text-sm leading-relaxed">
              We've sent a password reset link to
            </p>
            <p className="text-primaryColor font-semibold text-sm break-all">{forgotEmail}</p>
            <p className="text-gray-200 text-xs leading-relaxed max-w-xs pt-1">
              Click the link in the email to reset your password. The link will expire in{" "}
              <span className="font-semibold text-white">5 minutes</span>.
            </p>
          </div>

          <div className="w-full border-t border-white/20 pt-4 space-y-3">
            <p className="text-xs text-gray-200">Didn't receive the email?</p>
            <button
              type="button"
              onClick={() => {
                setForgotEmail("");
                setView("forgot");
              }}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-lg font-semibold transition duration-300 backdrop-blur-sm border border-white/30"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => setView("login")}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-200 hover:text-white transition"
            >
              <MdArrowBack /> Back to Login
            </button>
          </div>
        </div>
      );
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
          {renderForm()}
          <p className="text-center text-xs text-gray-100 mt-8">
            © {new Date().getFullYear()} WBC Coaching Center
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;














// import React, { useState } from "react";
// import {
//   MdOutlineMail,
//   MdLockOutline,
//   MdVisibility,
//   MdVisibilityOff,
// } from "react-icons/md";
// import { Link, useNavigate } from "react-router-dom";
// import { assets } from "../../assets/assets";
// import axios from "axios"
// import toast from "react-hot-toast";
// import { setAuthData } from "../../utils/authStorage";
// import { useAuth } from "../../context/AuthProvider";

// const Login = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     // rememberMe: false,
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { setUser, setRole, setPermissions } = useAuth();

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);
//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/signin`, formData, { withCredentials: true })
//       // console.log(response.data)
//       setAuthData(response.data.data);
//       setUser(response.data.data.user);
//       setRole(response.data.data.user?.role?.roleName);
//       setPermissions(response.data?.user?.permissions?.permissions || [])
//       toast.success(response.data.message)
//       navigate("/");
//     } catch (error) {
//       console.error("Login failed", error);
//       toast.error(error.response.data.message)
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-[#1D1DA4] via-[#064585] to-[#1D1DA4]">

//       {/* LEFT SIDE (ILLUSTRATION) */}
//       <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-visible">

//         {/* Gradient Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-tr from-[#1D1DA4] via-[#064585] to-[#1D1DA4] opacity-0"></div>

//         {/* Decorative Glow */}
//         <div className="absolute w-[500px] h-[500px] bg-[#8cc441] rounded-full blur-[150px] opacity-80"></div>

//         {/* Image */}
//         <div className="relative z-10 w-full">
//           <img
//             src={assets.login}
//             alt="Admin Portal Illustration"
//             className="w-full h-full object-cover drop-shadow-2xl"
//           />
//         </div>
//       </div>

//       {/* RIGHT SIDE (LOGIN FORM) */}
//       <div className="flex w-full lg:w-1/2 items-center justify-center p-6">

//         <div className="w-full max-w-md bg-[#ffffff59] backdrop-blur-sm rounded-lg shadow-lg p-8">
//           {/* Logo */}
//           <div className="text-center mb-8">
//             <img src={assets.logo2} alt="logo" className="w-40 mx-auto mb-3" />
//             <h2 className="text-2xl font-bold text-[#1D1DA4]">
//               Admin Login
//             </h2>
//             <p className="text-gray-50 text-sm">
//               Sign in to access your dashboard
//             </p>
//           </div>

//           {/* FORM */}
//           <form className="space-y-5" onSubmit={handleLogin}>

//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-50 mb-1">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <MdOutlineMail className="absolute left-3 top-4 text-gray-600" />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="Enter your email"
//                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg
//                 focus:ring-1 focus:ring-[#1D1DA4] focus:outline-none transition"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-50 mb-1">
//                 Password
//               </label>
//               <div className="relative">
//                 <MdLockOutline className="absolute left-3 top-4 text-gray-600" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="Enter your password"
//                   className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg
//                 focus:ring-1 focus:ring-[#1D1DA4] focus:outline-none transition"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-3 text-gray-400"
//                 >
//                   {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
//                 </button>
//               </div>
//             </div>

//             {/* Forgot */}
//             <div className="text-right text-sm">
//               <Link
//                 to="/forgot-password"
//                 className="text-[#1D1DA4] font-medium hover:underline"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-[#1D1DA4] to-[#064585]
//             hover:opacity-90 text-white py-2.5 rounded-lg
//             font-semibold transition duration-300 shadow-lg"
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>
//           </form>

//           <p className="text-center text-xs text-gray-100 mt-8">
//             © {new Date().getFullYear()} WBC Coaching Center
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
