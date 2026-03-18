import React, { useEffect, useState } from "react";
import { MdClose, MdAdd } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const AddClassModal = ({
  batch,
  branch,
  courseData,
  editData,
  onClose,
  onSuccess,
}) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [slots, setSlots] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [formData, setFormData] = useState({
    className: "",
    classDate: "",
    slot: "",
    tutor: "",
    status: "draft",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        className: editData.className?.split(" (")[0] || "",
        classDate: new Date(editData.classDate)
          .toISOString()
          .split("T")[0],
        slot: editData.slot?._id || "",
        tutor: editData.tutor?._id || "",
        status: editData.status || "draft",
      });
    }
  }, [editData]);

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);

    // Only fetch when modal opens
    if (branch?._id) {
      fetchSlots();
      fetchTutors();
    }

    // cleanup animation timeout
    return () => setAnimate(false);
  }, [branch?._id]);


  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const fetchSlots = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/slot/get-all`,
        {
          params: { branch: branch._id },
          withCredentials: true,
        }
      );
      setSlots(data.data || []);
    } catch (err) {
      toast.error("Failed to load slots");
    }
  };

  const fetchTutors = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/get-by-role`,
        {
          params: { role: "tutor", branch: branch._id },
          withCredentials: true,
        }
      );
      setTutors(data.data || []);
    } catch (err) {
      toast.error("Failed to load tutors");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.className ||
      !formData.classDate ||
      !formData.slot ||
      !formData.tutor
    ) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);

      if (editData) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/class/${editData._id}`,
          {
            ...formData,
            batch: batch._id,
            course: courseData.course._id,
            branch: branch._id,
          },
          { withCredentials: true }
        );

        toast.success("Class updated successfully");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/class/create`,
          {
            ...formData,
            batch: batch._id,
            course: courseData.course._id,
            branch: branch._id,
          },
          { withCredentials: true }
        );

        toast.success("Class created successfully");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create class"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-xl rounded-tl-3xl rounded-br-3xl shadow-xl transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdAdd className="text-primaryColor" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editData
                  ? "Update Class"
                  : "Add Class"}

              </h2>
              <p className="text-xs text-gray-100">
                {courseData.course.courseName}
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
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-sm">

          {/* Batch (Readonly) */}
          <input
            type="text"
            value={batch.batchName}
            disabled
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />

          {/* Course (Readonly) */}
          <input
            type="text"
            value={courseData.course.courseName}
            disabled
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />

          {/* Branch (Readonly) */}
          <input
            type="text"
            value={branch.city}
            disabled
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />


          <input
            type="text"
            placeholder="Class Name *"
            value={formData.className}
            onChange={(e) =>
              setFormData({ ...formData, className: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            required
          />

          <input
            type="date"
            value={formData.classDate}
            onChange={(e) =>
              setFormData({ ...formData, classDate: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            required
          />

          <select
            value={formData.tutor}
            onChange={(e) =>
              setFormData({ ...formData, tutor: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            required
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
            onChange={(e) =>
              setFormData({ ...formData, slot: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            required
          >
            <option value="" disabled>Select Slot *</option>
            {slots.map((s) => (
              <option key={s._id} value={s._id}>
                {s.startTime} - {s.endTime} {(s.mode)} ({s.room.roomName})
              </option>
            ))}
          </select>

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>

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
              className={`px-4 py-2 rounded-md text-white transition-all duration-500 ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor hover:shadow-[0px_6px_10px_#424242]"
                }`}
            >
              {loading
                ? editData
                  ? "Updating..."
                  : "Creating..."
                : editData
                  ? "Update Class"
                  : "Add Class"}

            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
