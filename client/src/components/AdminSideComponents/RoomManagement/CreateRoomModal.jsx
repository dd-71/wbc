import React, { useEffect, useState } from "react";
import { MdClose, MdMeetingRoom, MdAdd, MdDelete } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { FiLoader } from "react-icons/fi";
import { useAuth } from "../../../context/AuthProvider";

const emptyRoom = {
  roomName: "",
  branch: "",
  status: "available",
};

const CreateRoomModal = ({ onClose, editData, onSuccess, branches }) => {
  const { user } = useAuth();
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const isSuperAdmin = user?.role?.roleName === "super-admin";

  const [rooms, setRooms] = useState([
    editData
      ? {
        roomName: editData.roomName,
        branch: editData?.branch?._id || user?.branch?._id || "",
        status: editData.status || "available",
      }
      : {
        ...emptyRoom,
        branch: isSuperAdmin ? "" : user?.branch?._id || "",
      },
  ]);

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  /* HANDLERS */
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setRooms((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [name]: value } : r))
    );
  };

  const addRow = () =>
    setRooms((p) => [
      ...p,
      { ...emptyRoom, branch: isSuperAdmin ? "" : user?.branch?._id || "" },
    ]);

  const removeRow = (index) => {
    if (rooms.length === 1) return;
    setRooms((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = editData
        ? await axios.put(
          `${process.env.REACT_APP_API_URL}/room/${editData._id}`,
          rooms[0],
          { withCredentials: true }
        )
        : await axios.post(
          `${process.env.REACT_APP_API_URL}/room/create`,
          isBulk ? rooms : rooms[0],
          { withCredentials: true }
        );

      toast.success(res.data.message || "Room saved");
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
        className={`bg-white w-full max-w-2xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-2xl flex flex-col
  transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* ───── HEADER (STICKY) ───── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-slate-50 bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdMeetingRoom className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editData ? "Update Room" : "Create Room"}
              </h2>
              <p className="text-xs text-gray-100">
                Single or bulk room creation
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
              {isBulk ? "Switch to single room" : "+ Add multiple rooms"}
            </button>
          )}

          {/* ROOM ROWS */}
          {rooms.map((room, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 items-end border rounded-lg p-4 bg-slate-50"
            >
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  name="roomName"
                  value={room.roomName}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="e.g., Conference Room A"
                  required
                  className="w-full px-3 py-2 border rounded bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                />
              </div>

              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Branch
                </label>
                {isSuperAdmin ? (
                  <select
                    name="branch"
                    value={room.branch}
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
                  <div className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-700">
                    📍 {user?.branch?.city} ({user?.branch?.state})
                  </div>
                )}
              </div>

              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={room.status}
                  onChange={(e) => handleChange(index, e)}
                  className="w-full px-3 py-2 border rounded bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                >
                  <option value="available">Available</option>
                  <option value="under-maintenance">Under Maintenance</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              {isBulk && (
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                    disabled={rooms.length === 1}
                  >
                    <MdDelete />
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
              <MdAdd /> Add another room
            </button>
          )}

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
              {loading ? "Saving..." : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;