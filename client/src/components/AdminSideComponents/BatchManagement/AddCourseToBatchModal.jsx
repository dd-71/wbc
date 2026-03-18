import React, { useEffect, useState } from "react";
import { MdClose, MdAdd } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const AddCourseToBatchModal = ({ batchId, branchId, onClose, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [slots, setSlots] = useState([]);

  const [formData, setFormData] = useState({
    course: "",
    tutor: "",
    startDate: "",
    endDate: "", slot: ""
  });

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
    fetchCourses();
    fetchTutors();
    fetchSlots()
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/course/all-courses`,
        {
          params: { branch: branchId, status: "active" },
          withCredentials: true,
        }
      );
      setCourses(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
      setCourses([]);
    }
  };

  const fetchTutors = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/get-by-role`,
        {
          params: { role: "tutor", branch: branchId },
          withCredentials: true,
        }
      );
      setTutors(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tutors");
      setTutors([]);
    }
  };

  const fetchSlots = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/slot/get-all`,
        {
          params: { branch: branchId },
          withCredentials: true,
        }
      );
      setSlots(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load slots");
      setSlots([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course || !formData.startDate || !formData.endDate || !formData.slot) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/batch/${batchId}/courses`,
        { courses: [formData] },
        { withCredentials: true }
      );

      toast.success("Course added to batch");

      setAnimate(false);

      setTimeout(() => {
        onClose();
        onSuccess();
      }, 250);

    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}>
      <div
        ref={domNode}
        className={`bg-white w-full max-w-xl rounded-tl-3xl rounded-br-3xl shadow-xl transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdAdd className="text-primaryColor" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Add Course</h2>
              <p className="text-xs text-gray-100">Attach course to batch</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 bg-white rounded-full hover:bg-gray-200 transition">
            <MdClose />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-sm">
          <select
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            required
          >
            <option value="" disabled>Select Course *</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseName}
              </option>
            ))}
          </select>

          <select
            value={formData.tutor}
            required
            onChange={(e) => setFormData({ ...formData, tutor: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
          >
            <option value="" disabled>Select Tutor *</option>
            {tutors.map((t) => (
              <option key={t._id} value={t._id}>
                {t.fullName}
              </option>
            ))}
          </select>

          <select
            value={formData.slot}
            required
            onChange={(e) =>
              setFormData({ ...formData, slot: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
          >
            <option value="" disabled>Select Slot *</option>
            {slots.map((s) => (
              <option key={s._id} value={s._id}>
                {s.startTime} - {s.endTime} ({s.mode}) ({s.room.roomName})
              </option>
            ))}
          </select>


          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                required
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md disabled:opacity-70 transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
            >
              {loading ? "Adding..." : "Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseToBatchModal;