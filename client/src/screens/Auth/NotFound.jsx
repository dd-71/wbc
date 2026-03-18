import React from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdErrorOutline } from "react-icons/md";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br fixed w-full from-indigo-50 via-white to-purple-50 flex items-center justify-center px-6">
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,300 C200,200 400,400 600,350 C800,300 1000,200 1200,250 C1350,300 1440,200 1440,200 L1440,0 L0,0 Z"
          fill="#6366F1"
          fillOpacity="0.08"
        />
        <path
          d="M0,500 C300,450 500,600 800,550 C1100,500 1300,650 1440,600 L1440,900 L0,900 Z"
          fill="#A855F7"
          fillOpacity="0.06"
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white rounded-2xl z-10 shadow-xl p-10 text-center"
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-primaryFadedColor/20 flex items-center justify-center mb-6">
          <MdErrorOutline className="text-primaryColor text-5xl" />
        </div>

        {/* 404 */}
        <h1 className="text-7xl font-extrabold text-primaryColor mb-2">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>

        <p className="text-gray-500 mb-8">
          The page you are trying to access does not exist or you do not
          have permission to view it.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md border text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <MdArrowBack />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-md bg-primaryColor text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
