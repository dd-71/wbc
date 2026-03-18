import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdAttachMoney,
  MdPeople,
  MdSchedule,
  MdDescription,
  MdLocationOn,
  MdClass,
  MdCheckCircle,
  MdCancel
} from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import DeleteAlertModal from '../../common/DeleteAlertModal';
import CommonButton from '../../common/CommonButton';
import { usePermission } from '../../Hooks/usePermissions';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();

  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/course/${id}`,
        { withCredentials: true }
      );
      setCourse(data.data);
    } catch (error) {
      toast.error('Failed to load course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes for this course
  const fetchClasses = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/class/get-classes?course=${id}`,
        { withCredentials: true }
      );
      setClasses(data.data || []);
    } catch (error) {
      console.error('Failed to load classes');
    }
  };

  useEffect(() => {
    fetchCourseDetails();
    fetchClasses();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/course/${id}`,
        { withCredentials: true }
      );
      toast.success('Course deleted successfully');
      navigate('/courses');
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      upcoming: 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-200 text-gray-700',
      published: 'bg-purple-100 text-purple-700',
      draft: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-red-100 text-red-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="py-5">
        <div className="animate-pulse space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-24" />
              <div className="h-10 bg-gray-200 rounded w-24" />
            </div>
          </div>

          {/* Banner Skeleton */}
          <div className="h-80 bg-gray-200 rounded-xl" />

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-gray-200 rounded-xl" />
              <div className="h-48 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="pt-5 pb-[4.7rem]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/course')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <MdArrowBack size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold text-primaryColor">
            Course Details
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {can('edit') && (
            <CommonButton
              label="Edit Course"
              icon={<MdEdit />}
              handler={() => navigate(`/courses/edit/${id}`)}
            />
          )}
          {can('delete') && (
            <button
              onClick={() => setDeleteModal(true)}
              className="px-4 py-2 bg-gradient-to-b from-red-500 via-[#fa7878] to-red-500 text-white hover:bg-red-600 rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize flex items-center gap-1"
            >
              <MdDelete /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-5">
          {course.courseBannerImage && (
            <div className="mb-6 rounded-tl-3xl rounded-br-3xl overflow-hidden shadow-lg">
              <img
                src={course.courseBannerImage}
                alt={course.courseName}
                className="w-full h-80 object-cover"
              />
            </div>
          )}
          {/* COURSE INFO CARD */}
          <div className="bg-white shadow-sm border p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {course.courseName}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.status)}`}>
                  {course.status?.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primaryColor">
                  ₹{course.price?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Course Fee</div>
              </div>
            </div>

            {/* DESCRIPTION */}
            {course.description && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <MdDescription className="text-primaryColor" size={20} />
                  <h3 className="font-semibold text-gray-700">Description</h3>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>
            )}
          </div>

          {/* CLASSES SECTION */}
          <div className="bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MdClass className="text-primaryColor" size={24} />
                <h3 className="text-xl font-semibold text-gray-800">
                  Classes ({classes.length})
                </h3>
              </div>
              {can('create') && (
                <CommonButton
                  label="+ Add Class"
                  handler={() => navigate(`/classes/create?course=${id}`)}
                />
              )}
            </div>

            {classes.length > 0 ? (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div
                    key={cls._id}
                    // onClick={() => navigate(`/classes/${cls._id}`)}
                    className="p-4 border hover:border-primaryColor/40 duration-300 hover:shadow-md transition group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 group-hover:text-primaryColor duration-300">
                          {cls.className}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MdCalendarToday size={16} />
                            <span>
                              {new Date(cls.classDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {cls.slot && (
                            <div className="flex items-center gap-1">
                              <MdSchedule size={16} />
                              <span>{cls.slot.startTime} - {cls.slot.endTime}</span>
                            </div>
                          )}
                          {cls.tutor && (
                            <div className="flex items-center gap-1">
                              <MdPeople size={16} />
                              <span>{cls.tutor.fullName}</span>
                            </div>
                          )}
                          {cls.batch && (
                            <div className="flex items-center gap-1">
                              <MdClass size={16} />
                              <span>{cls.batch.batchName || cls.batch.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : cls.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                        {cls.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MdClass size={48} className="mx-auto mb-3 opacity-30" />
                <p>No classes scheduled yet</p>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6 sticky top-20 h-fit">
          {/* QUICK INFO CARD */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Course Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MdLocationOn className="text-primaryColor mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Branch</div>
                  <div className="font-medium text-gray-800">
                    {course.branch?.city || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdCalendarToday className="text-primaryColor mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="font-medium text-gray-800">
                    {new Date(course.startDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdCalendarToday className="text-primaryColor mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="font-medium text-gray-800">
                    {new Date(course.endDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdSchedule className="text-primaryColor mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium text-gray-800">
                    {Math.ceil(
                      (new Date(course.endDate) - new Date(course.startDate)) /
                      (1000 * 60 * 60 * 24)
                    )} days
                  </div>
                </div>
              </div>

              {course.batch && (
                <div className="flex items-start gap-3">
                  <MdPeople className="text-primaryColor mt-1 flex-shrink-0" size={20} />
                  <div>
                    <div className="text-sm text-gray-500">Batch</div>
                    <div className="font-medium text-gray-800">
                      {course.batch?.batchName || course.batch?.name}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MdClass className="text-primaryColor mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Total Classes</div>
                  <div className="font-medium text-gray-800">
                    {classes.length} classes
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATISTICS CARD */}
          <div className="bg-gradient-to-b from-primaryColor via-[#617cf5] to-primaryFadedColor rounded-xl shadow-lg p-5 text-white">
            <h3 className="text-lg font-semibold mb-4">Class Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MdCheckCircle size={18} />
                  <span>Completed</span>
                </div>
                <span className="font-bold">
                  {classes.filter(c => c.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MdSchedule size={18} />
                  <span>Upcoming</span>
                </div>
                <span className="font-bold">
                  {classes.filter(c => c.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MdCancel size={18} />
                  <span>Cancelled</span>
                </div>
                <span className="font-bold">
                  {classes.filter(c => c.status === 'cancelled').length}
                </span>
              </div>
            </div>
          </div>

          {/* TIMESTAMPS CARD */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              TIMESTAMPS
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-800 font-medium">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-800 font-medium">
                  {new Date(course.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Course"
        description={`Are you sure you want to delete "${course.courseName}"? All associated classes will also be deleted. This action cannot be undone.`}
        confirmText="Delete Course"
      />
    </div>
  );
};

export default CourseDetails;