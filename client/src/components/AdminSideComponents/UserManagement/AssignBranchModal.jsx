import React, { useEffect, useState } from "react";
import { MdClose, MdLocationOn } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { useAuth } from "../../../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";

const AssignBranchModal = ({ user, onClose, addModal, onSuccess }) => {
  const { branches, user: loggedInUser } = useAuth();
  const isSuperAdmin = loggedInUser?.role?.roleName === "super-admin";
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState("");

  const domNode = useClickOutside(() => handleClose());
  console.log(user);

  useEffect(() => {
    if (addModal) setTimeout(() => setAnimate(true), 10);
  }, [addModal]);

  useEffect(() => {
    if (user?.branch?._id) {
      setBranch(user.branch._id);
    }
  }, [user]);

  useEffect(() => {
    if (!isSuperAdmin && loggedInUser?.branch?._id) {
      setBranch(loggedInUser.branch._id);
    }
  }, [loggedInUser, isSuperAdmin]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleAssign = async () => {
    if (!branch) {
      toast.error("Please select a branch");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/branch/assign-branch`,
        { branchId: branch, userId: user?._id },
        { withCredentials: true }
      );
      console.log(response);
      toast.success(response.data.data.message || "Branch assigned successfully");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      console.error("Branch assignment failed:", err);
      toast.error(err.response?.data?.message || "Failed to assign branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
      bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={domNode}
        className={`w-full max-w-md mx-4 bg-white rounded-tl-3xl rounded-br-3xl shadow-xl
        transition-all duration-300
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdLocationOn className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Assign Branch
              </h2>
              <p className="text-xs text-gray-100">
                Assign user to a branch location
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 bg-white rounded-full hover:bg-gray-200 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* USER INFO CARD */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <img
              src={user?.profilePicture || "https://i.pravatar.cc/40"}
              alt={user?.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">
                {user?.fullName}
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {user?.role?.roleName}
                </span>
                {user?.branch?.city && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                    Current: {user.branch.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SELECT BRANCH */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Branch
            </label>
            {isSuperAdmin ? (
              <div>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none transition text-sm"
                >
                  <option value="" disabled>Choose a branch</option>
                  {branches?.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.city} – {b.state}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 text-sm">
                  📍 {loggedInUser?.branch?.city} ({loggedInUser?.branch?.state})
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {user?.branch?.city
                ? "Selecting a new branch will update the user's current assignment"
                : "This user currently has no branch assigned"}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t bg-slate-50 rounded-br-3xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !branch}
            className="px-4 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md text-sm transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Assigning..." : "Assign Branch"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignBranchModal;