import React, { useEffect, useState } from "react";
import { MdClose, MdPerson, MdCalendarToday } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const EditBatchCourseModal = ({ batchId, courseData, onClose, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [slots, setSlots] = useState([]);

  // console.log(courseData)
  const [formData, setFormData] = useState({
    tutor: courseData.tutor?._id || "", slot: courseData.slot?._id || "",
    startDate: courseData.startDate.split("T")[0],
    endDate: courseData.endDate.split("T")[0],
  });

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
    fetchTutors();
    fetchSlots()
  }, []);

  const fetchTutors = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/get-by-role`,
        {
          params: { role: "tutor" },
          withCredentials: true,
        }
      );
      setTutors(data.data || []);
    } catch (err) {
      console.error("Failed to fetch tutors", err);
      toast.error("Failed to load tutors");
    }
  };

  const fetchSlots = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/slot/get-all`,
        { withCredentials: true }
      );
      setSlots(data.data || []);
    } catch (err) {
      console.error("Failed to fetch slots", err);
      toast.error("Failed to load slots");
    }
  };

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleSubmit = async () => {
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      return toast.error("End date cannot be before start date");
    }

    try {
      setLoading(true);
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/batch/${batchId}/course/${courseData.course._id}`,
        formData,
        { withCredentials: true }
      );

      toast.success("Course updated successfully");

      const updatedCourseData = {
        ...courseData,
        tutor: tutors.find(t => t._id === formData.tutor) || courseData.tutor,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      onSuccess(updatedCourseData);
      handleClose();
    } catch (err) {
      console.error("Update failed", err);
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-lg rounded-tl-3xl rounded-br-3xl shadow-2xl transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div>
            <h3 className="text-lg font-semibold text-white">Edit Course Assignment</h3>
            <p className="text-xs text-gray-100 mt-0.5">{courseData.course.courseName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-white rounded-full hover:bg-gray-200 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MdPerson className="text-primaryColor" size={18} />
              Assign Tutor
            </label>
            <select
              value={formData.tutor}
              onChange={(e) =>
                setFormData({ ...formData, tutor: e.target.value })
              }
              className="w-full px-4 py-3 border-2 rounded-lg bg-slate-50 focus:bg-white focus:border-primaryColor outline-none transition"
            >
              <option value="">Select Tutor</option>
              {tutors.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              🕒 Slot
            </label>
            <select
              value={formData.slot}
              onChange={(e) =>
                setFormData({ ...formData, slot: e.target.value })
              }
              className="w-full px-4 py-3 border-2 rounded-lg bg-slate-50 focus:bg-white focus:border-primaryColor outline-none transition"
              required
            >
              <option value="">Select Slot</option>
              {slots.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.startTime} - {s.endTime} ({s.mode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MdCalendarToday className="text-primaryColor" size={18} />
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-4 py-3 border-2 rounded-lg bg-slate-50 focus:bg-white focus:border-primaryColor outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MdCalendarToday className="text-primaryColor" size={18} />
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-4 py-3 border-2 rounded-lg bg-slate-50 focus:bg-white focus:border-primaryColor outline-none transition"
              required
            />
          </div>

          {new Date(formData.endDate) < new Date(formData.startDate) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ End date must be after start date
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50 rounded-br-3xl">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 border-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            disabled={loading || new Date(formData.endDate) < new Date(formData.startDate)}
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
          >
            {loading && <FiLoader className="animate-spin" />}
            {loading ? "Updating..." : "Update Course"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBatchCourseModal;