import React from "react";
import { MdMoreVert, MdEdit, MdDelete, MdVisibility, MdUpdate, MdImage, MdMyLocation } from "react-icons/md";
import { Link } from "react-router-dom";

const CourseCardView = ({
  courses,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
  openAction,
  setOpenAction,
  domNode,
  can,
}) => {
  const getStatusBadge = (status) => {
    const statusColors = {
      active: "bg-green-100 text-green-700 border-green-200",
      draft: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200"
          }`}
      >
        {status}
      </span>
    );
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {courses?.map((course) => (
        <div
          // onClick={() => onView(course)}
          key={course._id}
          className="bg-white shadow-xl rounded-2xl overflow-hidden hover:border-primaryColor hover:shadow-2xl transition-all duration-500 group relative"
        >
          {/* SHINE EFFECT ON HOVER */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>

          {/* BANNER IMAGE */}
          <div className="relative h-48 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
            {course.courseBannerImage ? (
              <img
                src={course.courseBannerImage}
                alt={course.courseName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MdImage size={64} className="text-gray-300" />
              </div>
            )}

            {/* GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* ACTION BUTTON */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() =>
                  setOpenAction(openAction === course._id ? null : course._id)
                }
                className="p-2 bg-white/95 backdrop-blur-md rounded-xl hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MdMoreVert size={15} className="text-gray-700" />
              </button>

              {/* DROPDOWN MENU */}
              {openAction === course._id && (
                <div
                  ref={domNode}
                  className="absolute right-0 top-12 z-20 bg-white border-2 border-gray-100 rounded-xl shadow-2xl w-[9rem] text-xs overflow-hidden"
                >
                  {can("view") && (
                    <button
                      onClick={() => {
                        onView(course);
                        setOpenAction(null);
                      }}
                      className="w-full px-2 py-1.5 text-slate-700 flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <MdVisibility size={16} /> View Details
                    </button>
                  )}
                  {can("edit") && (
                    <>
                      <button
                        onClick={() => {
                          onEdit(course);
                          setOpenAction(null);
                        }}
                        className="w-full px-2 py-1.5 flex text-green-600 items-center gap-2 hover:bg-green-50 transition-colors"
                      >
                        <MdEdit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          onUpdateStatus(course);
                          setOpenAction(null);
                        }}
                        className="w-full px-2 py-1.5 flex text-blue-600 items-center gap-2 hover:bg-blue-50 transition-colors"
                      >
                        <MdUpdate size={16} /> Update Status
                      </button>
                    </>
                  )}
                  {can("delete") && (
                    <button
                      onClick={() => {
                        onDelete(course);
                        setOpenAction(null);
                      }}
                      className="w-full px-2 py-1.5 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <MdDelete size={16} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CARD CONTENT */}
          <div className="p-3 space-y-4 relative z-10 capitalize">
            {/* COURSE NAME & PRICE */}
            <div className="flex items-start justify-between gap-3 border-b">
              <div>
                <h3
                  onClick={() => onView(course)}
                  className="text-base font-bold cursor-pointer text-gray-800 group-hover:text-primaryColor transition-colors capitalize line-clamp-2 flex-1 leading-tight"
                >
                  {course.courseName}
                </h3>
              </div>
              <div className="flex-shrink-0 text-right">
                {course.isPaid ? (
                  <div className="flex flex-col items-end pb-2">
                    <p className="text-xl font-bold text-green-600 leading-none">
                      ₹{Math.round(course.price * (1 - course.discount / 100))}
                    </p>

                    {course.discount > 0 && (
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <span className="line-through text-gray-400">
                          ₹{course.price}
                        </span>
                        <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                          {course.discount}% OFF
                        </span>
                      </div>
                    )}

                    {/* <p className="text-[10px] text-gray-400 mt-0.5">Price</p> */}
                  </div>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    Free
                  </span>
                )}
              </div>
            </div>

            {/* BATCH INFO */}
            {/* {course.batch && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <span className="text-blue-600 font-bold text-sm">📦</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 font-semibold truncate">
                    {course.batch?.batchName}
                  </p>
                </div>
              </div>
            )} */}

            {/* DETAILS GRID */}
            <div className="flex justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="text-lg text-white mt-0.5 bg-gradient-to-br from-primaryColor/50 to-blue-600 p-1.5 rounded-lg">
                  <MdMyLocation />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Branch</p>
                  <p className="text-sm text-gray-800 font-semibold truncate">
                    {course.branch?.city}
                  </p>
                </div>
              </div>
              {/* STATUS BADGE */}
              <div className="capitalize">
                {getStatusBadge(course.status)}
              </div>
            </div>
          </div>

          {/* BOTTOM ACCENT BAR */}
          {/* <div className="h-1 bg-gradient-to-r from-primaryColor via-blue-500 to-indigo-500 group-hover:h-1.5 transition-all duration-300" /> */}
        </div>
      ))}
    </div>
  );
};

export default CourseCardView;