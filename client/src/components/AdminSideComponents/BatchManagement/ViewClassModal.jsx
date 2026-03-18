import React, { useEffect, useState } from "react";
import { MdClose, MdVisibility } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const ViewClassModal = ({ data, onClose }) => {
  const [animate, setAnimate] = useState(false);
  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  if (!data) return null;

  const getStatusBadge = (status) => {
    const map = {
      draft: "bg-yellow-100 text-yellow-700",
      active: "bg-green-100 text-green-700",
      completed: "bg-purple-100 text-purple-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${map[status] || "bg-gray-100 text-gray-700"
          }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-2xl rounded-tl-3xl rounded-br-3xl shadow-xl transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdVisibility className="text-primaryColor" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Class Details
              </h2>
              <p className="text-xs text-gray-100">
                View class information
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 bg-white rounded-full hover:bg-gray-200 transition"
          >
            <MdClose />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5 text-sm">

          {/* Class Name */}
          <div>
            <p className="text-gray-500 text-xs mb-1">Class Name</p>
            <p className="font-semibold text-gray-800">
              {data.className}
            </p>
          </div>

          {/* Date */}
          <div>
            <p className="text-gray-500 text-xs mb-1">Class Date</p>
            <p className="font-semibold text-gray-800">
              {new Date(data.classDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Slot */}
          <div>
            <p className="text-gray-500 text-xs mb-1">Slot</p>
            <p className="font-semibold text-gray-800">
              {data.slot?.startTime} - {data.slot?.endTime}
            </p>
          </div>

          {/* Tutor */}
          <div>
            <p className="text-gray-500 text-xs mb-1">Tutor</p>
            <p className="font-semibold text-gray-800">
              {data.tutor?.fullName || "Not Assigned"}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-gray-500 text-xs mb-1">Status</p>
            {getStatusBadge(data.status)}
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end px-6 py-4 border-t bg-white rounded-br-3xl">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewClassModal;
