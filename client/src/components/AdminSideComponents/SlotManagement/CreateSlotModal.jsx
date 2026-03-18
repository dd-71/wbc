import React, { useEffect, useState } from "react";
import { MdClose, MdSchedule, MdAdd, MdDelete } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { FiLoader } from "react-icons/fi";
import { useAuth } from "../../../context/AuthProvider";

const emptySlot = {
  startTime: "",
  endTime: "",
  mode: "offline",
  room: "",
  location: "",
  branch: "",
};

const CreateSlotModal = ({ onClose, editData, onSuccess, branches, rooms }) => {
  const { user } = useAuth();
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const isSuperAdmin = user?.role?.roleName === "super-admin";

  const [slots, setSlots] = useState([
    editData
      ? {
        startTime: editData.startTime,
        endTime: editData.endTime,
        mode: editData.mode || "offline",
        room: editData?.room?._id || "",
        location: editData.location || "",
        branch: editData?.branch?._id || user?.branch?._id || "",
      }
      : {
        ...emptySlot,
        branch: isSuperAdmin ? "" : user?.branch?._id || "",
      },
  ]);

  const [availableRooms, setAvailableRooms] = useState(rooms || []);

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  // Filter rooms based on selected branch
  useEffect(() => {
    if (slots[0]?.branch) {
      const filtered = rooms?.filter(r => r.branch?._id === slots[0].branch || r.branch === slots[0].branch);
      setAvailableRooms(filtered || []);
    } else {
      setAvailableRooms(rooms || []);
    }
  }, [slots, rooms]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  /* HANDLERS */
  const handleChange = (index, e) => {
    const { name, value } = e.target;

    setSlots((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;

        const updated = { ...s, [name]: value };

        if (name === "mode") {
          if (value === "online") {
            updated.room = "";
          } else if (value === "offline") {
            updated.location = "";
          }
        }

        return updated;
      })
    );
  };

  const addRow = () =>
    setSlots((p) => [
      ...p,
      { ...emptySlot, branch: isSuperAdmin ? "" : user?.branch?._id || "" },
    ]);

  const removeRow = (index) => {
    if (slots.length === 1) return;
    setSlots((p) => p.filter((_, i) => i !== index));
  };

  const validateSlot = (slot) => {
    if (!slot.startTime || !slot.endTime || !slot.branch) {
      toast.error("Start time, end time, and branch are required");
      return false;
    }

    if (slot.mode === "offline" && !slot.room) {
      toast.error("Offline mode requires a room");
      return false;
    }

    if (slot.mode === "hybrid" && (!slot.room || !slot.location)) {
      toast.error("Hybrid mode requires both room and meeting link");
      return false;
    }

    if (slot.mode === "online" && slot.room) {
      toast.error("Online mode cannot have a room assigned");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all slots
    for (const slot of slots) {
      if (!validateSlot(slot)) return;
    }

    try {
      setLoading(true);

      const payload = slots.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
        mode: s.mode,
        room: s.room || undefined,
        location: s.location || undefined,
        branch: s.branch,
      }));

      const res = editData
        ? await axios.put(
          `${process.env.REACT_APP_API_URL}/slot/${editData._id}`,
          payload[0],
          { withCredentials: true }
        )
        : await axios.post(
          `${process.env.REACT_APP_API_URL}/slot/create`,
          isBulk ? payload : payload[0],
          { withCredentials: true }
        );
      // console.log(res);
      toast.success(res.data.message || "Slot saved", { duration: 4000, position: "top-center", });
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 backdrop-blur-sm z-50 bg-primaryColor/20 flex items-center justify-center transition-opacity ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-4xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-2xl flex flex-col
  transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* ───── HEADER (STICKY) ───── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-slate-50 bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdSchedule className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editData ? "Update Slot" : "Create Slot"}
              </h2>
              <p className="text-xs text-gray-100">
                Single or bulk slot creation
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 bg-white rounded-full hover:bg-gray-200"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* ───── BODY (SCROLLABLE ONLY) ───── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 text-sm"
        >
          {/* BULK TOGGLE */}
          {!editData && (
            <button
              type="button"
              onClick={() => setIsBulk((p) => !p)}
              className="text-primaryColor text-sm font-medium"
            >
              {isBulk ? "Switch to single slot" : "+ Add multiple slots"}
            </button>
          )}

          {/* SLOT ROWS */}
          {slots.map((slot, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-slate-50 space-y-3"
            >
              <div className="grid grid-cols-12 gap-3">
                {/* Start Time */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={slot.startTime}
                    onChange={(e) => handleChange(index, e)}
                    required
                    className="w-full px-3 py-2 border rounded bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  />
                </div>

                {/* End Time */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={slot.endTime}
                    onChange={(e) => handleChange(index, e)}
                    required
                    className="w-full px-3 py-2 border rounded bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  />
                </div>

                {/* Mode */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="mode"
                    value={slot.mode}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-3 py-2 border rounded bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Branch */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  {isSuperAdmin ? (
                    <select
                      name="branch"
                      value={slot.branch}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full px-3 py-2 border rounded bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                    >
                      <option value="">Select Branch</option>
                      {branches?.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.city} ({b.state})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-700 text-xs">
                      📍 {user?.branch?.city} ({user?.branch?.state})
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                {/* Room - Only show for offline and hybrid modes */}
                {slot.mode !== "online" && (
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Room {slot.mode === "offline" && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      name="room"
                      value={slot.room}
                      onChange={(e) => handleChange(index, e)}
                      required={slot.mode === "offline" || slot.mode === "hybrid"}
                      className="w-full px-3 py-2 border rounded bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                    >
                      <option value="">Select Room</option>
                      {availableRooms
                        ?.filter(r => r.status === "available")
                        ?.map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.roomName}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Location/Link - Only show for online and hybrid modes */}
                {slot.mode !== "offline" && (
                  <div className={slot.mode === "online" ? "col-span-12" : "col-span-6"}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Meeting Link {slot.mode === "hybrid" && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={slot.location}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="https://meet.google.com/xxx or Zoom link"
                      required={slot.mode === "hybrid"}
                      className="w-full px-3 py-2 border rounded bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Delete Button for Bulk */}
              {isBulk && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-500 hover:bg-red-50 px-3 py-1 rounded flex items-center gap-1"
                    disabled={slots.length === 1}
                  >
                    <MdDelete /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* ADD ROW */}
          {isBulk && (
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 text-primaryColor"
            >
              <MdAdd /> Add another slot
            </button>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            <p className="font-semibold mb-1">📌 Slot Creation Rules:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Offline:</strong> Requires a room assignment</li>
              <li><strong>Online:</strong> Requires meeting link, no room needed</li>
              <li><strong>Hybrid:</strong> Requires both room and meeting link</li>
              <li>Rooms must be available and not overlapping with existing slots</li>
            </ul>
          </div>

          <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 pt-4 border-t bg-white rounded-b-2xl">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="px-4 py-2 flex items-center gap-1 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
            >
              {loading && <FiLoader className="animate-spin" />}
              {loading ? "Saving..." : "Save Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSlotModal;