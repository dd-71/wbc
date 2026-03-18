import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdLocationOn,
  MdClass,
  MdPeople,
  MdAdd,
  MdUpdate,
  MdAccessTime,
  MdVisibility,
  MdMoreVert
} from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteAlertModal from "../../common/DeleteAlertModal";
import CommonButton from "../../common/CommonButton";
import { usePermission } from "../../Hooks/usePermissions";
import AddCourseToBatchModal from "./AddCourseToBatchModal";
import EditBatchCourseModal from "./EditBatchCourseModal";
import BatchDetailsSkeleton from "./BatchDetailsSkeleton";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import AddClassModal from "./AddClassModal";
import ViewClassModal from "./ViewClassModal";
import { useLockBodyScroll } from "../../Hooks/useLockBodyScroll";

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openAddCourse, setOpenAddCourse] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  // Remove course modal states
  const [removeCourseModal, setRemoveCourseModal] = useState(false);
  const [courseToRemove, setCourseToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  // Course Class states
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [courseClasses, setCourseClasses] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [openClassAction, setOpenClassAction] = useState(null);
  const classActionRef = useClickOutside(() => setOpenClassAction(null));
  const [viewClass, setViewClass] = useState(null);
  const [classModal, setClassModal] = useState({
    open: false,
    mode: "add", // or "edit"
    courseData: null,
    editData: null,
  });
  const [deleteClassModal, setDeleteClassModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [deleteClassLoading, setDeleteClassLoading] = useState(false);
  useLockBodyScroll(classModal.open || deleteClassModal || viewClass || openAddCourse || editCourse || removeCourseModal || deleteModal);


  const shouldOpenClassUp = (index, total) => {
    return index >= total - 2;
  };

  const getClassStatusBadge = (status) => {
    const map = {
      draft: "bg-gray-200 text-gray-600",
      scheduled: "bg-blue-100 text-blue-600",
      ongoing: "bg-green-100 text-green-600",
      completed: "bg-purple-100 text-purple-600",
      cancelled: "bg-red-100 text-red-600",
      rescheduled: "bg-orange-100 text-orange-600",
    };

    return map[status] || "bg-gray-100 text-gray-600";
  };

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/batch/${id}`,
        { withCredentials: true }
      );
      // console.log(data.data)
      setBatch(data.data);
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message || "Failed to load batch details");
      navigate("/batch");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesForCourse = async (courseId) => {
    try {
      setLoadingClasses(true);

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/class/get-classes/`,
        {
          params: {
            course: courseId,
            batch: batch._id,
          },
          withCredentials: true,
        }
      );

      setCourseClasses((prev) => ({
        ...prev,
        [courseId]: data.data || [],
      }));
    } catch (err) {
      toast.error("Failed to load classes");
    } finally {
      setLoadingClasses(false);
    }
  };

  console.log(courseClasses)

  const handleToggleClasses = (courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }

    setExpandedCourseId(courseId);

    if (!courseClasses[courseId]) {
      fetchClassesForCourse(courseId);
    }
  };




  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  // console.log(courseClasses)
  // console.log(batch)

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/batch/${id}`, {
        withCredentials: true,
      });
      toast.success("Batch deleted");
      navigate("/batch");
    } catch (err) {
      toast.error(err.response.data.message || "Failed to delete batch");
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveCourseClick = (course) => {
    setCourseToRemove(course);
    setRemoveCourseModal(true);
  };

  const handleRemoveCourseConfirm = async () => {
    if (!courseToRemove) return;

    try {
      setRemoveLoading(true);

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/batch/${batch._id}/course/${courseToRemove.course._id}`,
        { withCredentials: true }
      );

      toast.success("Course removed from batch");

      setBatch((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.course._id !== courseToRemove.course._id),
      }));

      setRemoveCourseModal(false);
      setCourseToRemove(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to remove course");
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      setDeleteClassLoading(true);

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/class/${classToDelete._id}`,
        { withCredentials: true }
      );

      toast.success("Class deleted successfully");

      fetchClassesForCourse(classToDelete.course);

      setDeleteClassModal(false);
      setClassToDelete(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete class"
      );
    } finally {
      setDeleteClassLoading(false);
    }
  };


  // console.log(batch)

  const getStatusBadge = (status) => {
    const map = {
      upcoming: {
        bg: "bg-gradient-to-r from-blue-500 to-blue-600",
        text: "text-white",
        shadow: "shadow-blue-200",
      },
      active: {
        bg: "bg-gradient-to-r from-green-500 to-emerald-600",
        text: "text-white",
        shadow: "shadow-green-200",
      },
      inactive: {
        bg: "bg-gradient-to-r from-gray-400 to-gray-500",
        text: "text-white",
        shadow: "shadow-gray-200",
      },
      rescheduled: {
        bg: "bg-gradient-to-r from-orange-500 to-amber-600",
        text: "text-white",
        shadow: "shadow-orange-200",
      },
      completed: {
        bg: "bg-gradient-to-r from-purple-500 to-indigo-600",
        text: "text-white",
        shadow: "shadow-purple-200",
      },
    };
    return map[status] || map.inactive;
  };

  if (loading) return <BatchDetailsSkeleton />


  if (!batch) return null;

  const statusStyle = getStatusBadge(batch.status);

  return (
    <div className="pt-5 pb-[4.7rem]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <div className="flex items-center gap-2 text-primaryColor">
          <button
            onClick={() => navigate("/batch")}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            <MdArrowBack size={24} />
          </button>
          <h1 className="text-xl font-bold ">Batch Details</h1>
        </div>

        <div className="flex items-center gap-3">
          {can("delete") && (
            <button
              onClick={() => setDeleteModal(true)}
              className="px-4 flex items-center gap-1 py-2 bg-gradient-to-t from-red-600 via-red-500 to-red-400
              text-white rounded-md transition-all duration-500
              hover:shadow-[0px_6px_10px_#991b1b] disabled:opacity-70"
            >
              <MdDelete size={20} /> Delete Batch
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {batch.batchBannerImage && (
            <div className="relative rounded-tl-3xl rounded-br-3xl overflow-hidden group">
              <img
                src={batch.batchBannerImage}
                alt={batch.batchName}
                className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-4xl capitalize font-bold text-white drop-shadow-lg mb-2">
                  {batch.batchName}
                </h2>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusStyle.bg} ${statusStyle.text} shadow-lg capitalize`}
                >
                  {batch.status}
                </span>
              </div>
            </div>
          )}

          {/* Batch Info Card (if no banner) */}
          {!batch.batchBannerImage && (
            <div className="bg-gradient-to-br from-primaryColor via-[#617cf5] to-primaryFadedColor rounded-tl-3xl rounded-br-3xl p-8 shadow-xl">
              <h2 className="text-4xl capitalize font-bold text-white mb-3">
                {batch.batchName}
              </h2>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white shadow-lg capitalize`}
              >
                {batch.status}
              </span>
            </div>
          )}

          {/* Description Card */}
          {batch.description && (
            <div className="bg-white rounded-md shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primaryColor to-primaryFadedColor rounded-full"></div>
                About this Batch
              </h3>
              <p className="text-gray-600 leading-relaxed">{batch.description}</p>
            </div>
          )}

          {/* Courses Card */}
          <div className="bg-white rounded-md shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r text-primaryColor p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primaryColor/20 rounded-full backdrop-blur-sm">
                    <MdClass size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Courses</h3>
                    <p className="text-sm text-gray-600">
                      {batch.courses?.length || 0} course{batch.courses?.length !== 1 ? 's' : ''} enrolled in this batch
                    </p>
                  </div>
                </div>

                {can("edit") && (
                  <CommonButton
                    handler={() => setOpenAddCourse(true)}
                    icon={<MdAdd size={20} />}
                    label={"Add course"}
                  />
                )}
              </div>
            </div>

            <div className="p-6">
              {batch.courses?.length > 0 ? (
                <div className="space-y-4">
                  {batch.courses.map((c, index) => (
                    <React.Fragment key={c.course._id}>
                      <div
                        onClick={() => handleToggleClasses(c.course._id)}
                        key={c.course._id}
                        className="p-5 border-2 cursor-pointer border-gray-200 rounded-md hover:border-primaryColor/40 duration-300 group"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gradient-to-r from-primaryColor to-primaryFadedColor rounded-lg text-white font-bold text-sm mt-1">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold group-hover:text-primaryColor duration-300 text-gray-800 text-lg mb-2">
                                  {c.course.courseName}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Click to view classes
                                </p>

                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MdPeople className="text-primaryColor" size={16} />
                                    <span className="font-medium">Tutor:</span>
                                    <span>{c.tutor?.fullName || "Not assigned"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MdAccessTime className="text-primaryColor" size={16} />
                                    <span className="font-medium">Duration:</span>
                                    <span>
                                      {new Date(c.startDate).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}{" "}
                                      →{" "}
                                      {new Date(c.endDate).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {can("edit") && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => { setEditCourse(c); e.stopPropagation() }}
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors duration-200 flex items-center gap-1"
                              >
                                <MdEdit size={16} /> Edit
                              </button>
                              <button
                                onClick={(e) => { handleRemoveCourseClick(c); e.stopPropagation() }}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors duration-200 flex items-center gap-1"
                              >
                                <MdDelete size={16} /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {expandedCourseId === c.course._id && (
                        <div className="mt-4 border-t pt-4">
                          {/* Add Class Button */}
                          {can("edit") && (
                            <div className="flex justify-end mb-3">
                              <CommonButton
                                handler={() =>
                                  setClassModal({
                                    open: true,
                                    mode: "add",
                                    courseData: c,
                                    editData: null,
                                  })
                                }
                                icon={<MdAdd size={18} />}
                                label="Add Class"
                              />
                            </div>
                          )}
                          {loadingClasses ? (
                            <p className="text-sm text-gray-500 text-center">Loading classes...</p>
                          ) : courseClasses[c.course._id]?.length ? (
                            <div className="max-h-64 overflow-y-auto space-y-2">
                              {courseClasses[c.course._id].map((cls, i) => (
                                <div
                                  key={cls._id}
                                  className="flex items-center justify-between gap-3 bg-slate-50 border rounded-md px-3 py-2 text-sm relative"
                                >
                                  {/* LEFT — SLOT */}
                                  <div className="flex items-center gap-2 min-w-[110px]">
                                    <div className="px-2 py-1 rounded-md bg-primaryColor/10 text-primaryColor font-semibold text-xs">
                                      {cls.slot?.startTime} - {cls.slot?.endTime}
                                    </div>
                                  </div>

                                  {/* CENTER — CLASS INFO */}
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-800">
                                      {cls.className} <span
                                        className={`text-xs capitalize font-medium px-2 py-1 rounded-full ${getClassStatusBadge(
                                          cls.status
                                        )}`}
                                      >
                                        {cls.status}
                                      </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(cls.classDate).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>

                                  {/* RIGHT — ACTIONS */}
                                  <div className="relative">
                                    <button
                                      onClick={() =>
                                        setOpenClassAction(openClassAction === cls._id ? null : cls._id)
                                      }
                                      className="p-1.5 rounded-lg hover:bg-gray-200 transition"
                                    >
                                      <MdMoreVert />
                                    </button>

                                    {openClassAction === cls._id && (
                                      <div
                                        ref={classActionRef}
                                        className={`absolute -translate-x-6 right-0 z-30 bg-white border rounded-md shadow-lg w-32 text-xs ${shouldOpenClassUp(i, courseClasses[c.course._id].length)
                                          ? "bottom-4"
                                          : "top-4"
                                          }`}
                                      >
                                        {can("view") && (
                                          <button
                                            onClick={() => {
                                              setViewClass(cls);
                                              setOpenClassAction(null);
                                            }}
                                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100"
                                          >
                                            <MdVisibility /> View
                                          </button>
                                        )}

                                        {can("edit") && (
                                          <button
                                            onClick={() => {
                                              setClassModal({
                                                open: true,
                                                mode: "edit",
                                                courseData: batch.courses.find(
                                                  (c) => c.course._id === cls.course
                                                ),
                                                editData: cls,
                                              });
                                              setOpenClassAction(null);
                                            }}
                                            className="w-full px-3 py-2 flex items-center gap-2 text-green-600 hover:bg-gray-100"
                                          >
                                            <MdEdit /> Update
                                          </button>
                                        )}

                                        {can("delete") && (
                                          <button
                                            onClick={() => {
                                              setClassToDelete(cls);
                                              setDeleteClassModal(true);
                                              setOpenClassAction(null);
                                            }}
                                            className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                                          >
                                            <MdDelete /> Delete
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">
                              This course is not assigned to you or No classes generated yet
                            </p>
                          )}
                        </div>
                      )}

                    </React.Fragment>

                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <MdClass size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No courses added yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click "Add Course" to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5 lg:sticky lg:top-20 h-fit">
          <div className="bg-gradient-to-br from-primaryColor via-[#617cf5] to-primaryFadedColor rounded-tl-3xl rounded-br-3xl shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-white rounded-full"></div>
                Batch Information
              </h3>

              <div className="space-y-5">
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MdLocationOn className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-xs mb-1">Branch</p>
                    <p className="font-semibold text-white">
                      {batch.branch?.city || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MdCalendarToday className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-xs mb-1">Start Date</p>
                    <p className="font-semibold text-white">
                      {new Date(batch.startDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MdCalendarToday className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-xs mb-1">End Date</p>
                    <p className="font-semibold text-white">
                      {new Date(batch.endDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MdClass className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-xs mb-1">Total Courses</p>
                    <p className="font-semibold text-white">
                      {batch.courses?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-md border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MdUpdate className="text-primaryColor" size={18} />
              Timestamps
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Created</span>
                <span className="text-gray-800 font-semibold">
                  {new Date(batch.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Last Updated</span>
                <span className="text-gray-800 font-semibold">
                  {new Date(batch.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Delete Batch Modal */}
      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Batch"
        description={`Are you sure you want to delete "${batch.batchName}"? This will permanently remove the batch and all associated data.`}
        confirmText="Delete Batch"
      />

      {/* Remove Course Modal */}
      <DeleteAlertModal
        open={removeCourseModal}
        onClose={() => {
          setRemoveCourseModal(false);
          setCourseToRemove(null);
        }}
        onConfirm={handleRemoveCourseConfirm}
        loading={removeLoading}
        title="Remove Course"
        description={`Are you sure you want to remove "${courseToRemove?.course?.courseName}" from this batch? Students enrolled in this course will be affected.`}
        confirmText="Remove Course"
      />

      {/* Add Course Modal */}
      {openAddCourse && (
        <AddCourseToBatchModal
          batchId={batch._id}
          branchId={batch.branch._id}
          onClose={() => setOpenAddCourse(false)}
          onSuccess={fetchBatchDetails}
        />
      )}

      {/* Edit Course Modal */}
      {editCourse && (
        <EditBatchCourseModal
          batchId={batch._id}
          courseData={editCourse}
          onClose={() => setEditCourse(null)}
          onSuccess={(updatedCourse) => {
            setBatch((prev) => ({
              ...prev,
              courses: prev?.courses?.map((c) =>
                c.course._id === updatedCourse.course._id ? updatedCourse : c
              ),
            }));
            setEditCourse(null);
          }}
        />
      )}

      {classModal.open && (
        <AddClassModal
          batch={batch}
          branch={batch.branch}
          courseData={classModal.courseData}
          editData={classModal.editData}
          onClose={() =>
            setClassModal({
              open: false,
              mode: "add",
              courseData: null,
              editData: null,
            })
          }
          onSuccess={() => {
            fetchClassesForCourse(
              classModal.mode === "edit"
                ? classModal.editData.course
                : classModal.courseData.course._id
            );

            setClassModal({
              open: false,
              mode: "add",
              courseData: null,
              editData: null,
            });
          }}
        />
      )}

      <DeleteAlertModal
        open={deleteClassModal}
        onClose={() => setDeleteClassModal(false)}
        onConfirm={handleDeleteClass}
        loading={deleteClassLoading}
        title="Delete Class"
        description={`Are you sure you want to delete "${classToDelete?.className}"?`}
        confirmText="Delete Class"
      />

      {viewClass && (
        <ViewClassModal
          data={viewClass}
          onClose={() => setViewClass(null)}
        />
      )}

    </div>
  );
};

export default BatchDetails;