import React, { useEffect, useState } from "react";
import { MdClose, MdVisibility } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import toast from "react-hot-toast";
import axios from "axios";
import EditBatchCourseModal from "./EditBatchCourseModal";

const ViewBatchModal = ({ data, onClose }) => {
  const [animate, setAnimate] = useState(false);
  const domNode = useClickOutside(() => handleClose());
  const [editCourse, setEditCourse] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  // console.log(data)

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm("Remove this course from batch?")) return;

    try {
      setRemoveLoading(true);
      // console.log(courseId)
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/batch/${data._id}/course/${courseId}`,
        { withCredentials: true }
      );

      toast.success("Course removed from batch");

      // remove locally for instant UI update
      data.courses = data.courses.filter(
        (c) => c.course._id !== courseId
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove course");
    } finally {
      setRemoveLoading(false);
    }
  };


  if (!data) return null;

  const getStatusBadge = (status) => {
    const statusColors = {
      upcoming: "bg-blue-100 text-blue-700",
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-200 text-gray-700",
      rescheduled: "bg-orange-100 text-orange-700",
      completed: "bg-purple-100 text-purple-700",
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
    <>
      <div
        className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
          }`}
      >
        <div
          ref={domNode}
          className={`bg-white w-full max-w-2xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
            }`}
        >
          {/* HEADER */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <MdVisibility className="text-primaryColor" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Batch Details</h2>
                <p className="text-xs text-gray-100">View complete batch information</p>
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
            {data.batchBannerImage && (
              <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                <img
                  src={data.batchBannerImage}
                  alt={data.batchName}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* BATCH INFO CARD */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {data.batchName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    📍 {data.branch?.city}, {data.branch?.state}
                  </p>
                </div>
                {getStatusBadge(data.status)}
              </div>

              {data.description && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700">{data.description}</p>
                </div>
              )}
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* START DATE */}
              <div className="border rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500 mb-1 font-medium">Start Date</p>
                <p className="text-base font-semibold text-gray-800">
                  📅 {new Date(data.startDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* END DATE */}
              <div className="border rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500 mb-1 font-medium">End Date</p>
                <p className="text-base font-semibold text-gray-800">
                  📅 {new Date(data.endDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* DURATION */}
              {data.duration && (
                <div className="border rounded-xl p-4 bg-white">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Duration</p>
                  <p className="text-base font-semibold text-gray-800">
                    ⏱️ {data.duration}
                  </p>
                </div>
              )}

              {/* BRANCH */}
              <div className="border rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500 mb-1 font-medium">Branch</p>
                <p className="text-base font-semibold text-gray-800">
                  🏢 {data.branch?.city || "N/A"}
                </p>
              </div>
            </div>

            {data.courses?.length > 0 && (
              <div className="border rounded-xl p-4 bg-white">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  📚 Courses in this Batch
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {data.courses.map((c, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border hover:bg-slate-100 transition"
                    >
                      {/* LEFT */}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {c.course?.courseName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tutor: {c.tutor?.fullName || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(c.startDate).toLocaleDateString()} →{" "}
                          {new Date(c.endDate).toLocaleDateString()}
                        </p>
                      </div>

                      {/* RIGHT ACTIONS */}
                      {/* <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditCourse(c)}
                          className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Edit
                        </button>

                        <button
                          disabled={removeLoading}
                          onClick={() => handleRemoveCourse(c.course._id)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div> */}
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

      {editCourse && (
        <EditBatchCourseModal
          batchId={data._id}
          courseData={editCourse}
          onClose={() => setEditCourse(null)}
          onSuccess={() => setEditCourse(null)}
        />
      )}

    </>
  );
};

export default ViewBatchModal;