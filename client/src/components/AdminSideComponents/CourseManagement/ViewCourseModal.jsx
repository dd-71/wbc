import React, { useEffect, useState } from "react";
import { MdClose, MdVisibility } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const ViewCourseModal = ({ data, onClose }) => {
  const [animate, setAnimate] = useState(false);
  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const getPaymentBadge = (isPaid) => {
    return isPaid ? (
      <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700">
        Paid
      </span>
    ) : (
      <span className="px-3 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-700">
        Free
      </span>
    );
  };


  if (!data) return null;

  const getStatusBadge = (status) => {
    const statusColors = {
      active: "bg-green-100 text-green-700",
      draft: "bg-yellow-100 text-yellow-700",
    };

    return (
      <span
        className={`px-3 py-1 text-sm rounded-full font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"
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
        className={`bg-white w-full max-w-3xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdVisibility className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Course Details
              </h2>
              <p className="text-xs text-gray-100">
                View complete course information
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* BANNER IMAGE */}
          {data.courseBannerImage && (
            <div className="rounded-xl overflow-hidden border-2 border-gray-200">
              <img
                src={data.courseBannerImage}
                alt={data.courseName}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* COURSE INFO CARD */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {data.courseName}
                </h3>
                <p className="text-sm text-gray-600">
                  📍 {data.branch?.city}, {data.branch?.state}
                </p>
              </div>
              <div className="flex items-center capitalize gap-2">
                {getStatusBadge(data.status)}
                {getPaymentBadge(data.isPaid)}
              </div>
            </div>

            {data.description && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700">{data.description}</p>
              </div>
            )}
          </div>

          {/* DETAILS GRID */}
          <div className="border rounded-xl p-4 bg-white space-y-3">
            <p className="text-sm font-semibold text-gray-700">💰 Pricing Details</p>

            {!data.isPaid ? (
              <p className="text-2xl font-bold text-purple-600">Free Course</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Original Price</span>
                  <span className="font-semibold text-gray-800">
                    ₹{data.price}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-red-500">
                    {data.discount}% OFF
                  </span>
                </div>

                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">Final Price</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{data.finalPrice}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SYLLABUS */}
          {data.syllabus && data.syllabus.length > 0 && (
            <div className="border rounded-xl p-4 bg-white">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                📚 Syllabus Topics
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.syllabus.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primaryColor text-white text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <p className="text-sm text-gray-800 flex-1">{topic}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADDITIONAL INFO */}
          <div className="border rounded-xl p-4 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600 mb-1">Created On</p>
                <p className="font-semibold text-gray-800">
                  {new Date(data.createdAt).toLocaleDateString()}
                </p>
              </div>

              {data.updatedAt && (
                <div>
                  <p className="text-gray-600 mb-1">Last Updated</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(data.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 z-10 flex justify-end px-6 py-4 border-t bg-white rounded-br-3xl">
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

export default ViewCourseModal;