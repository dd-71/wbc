import React, { useEffect, useState } from "react";
import { MdClose, MdLocationOn } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import axios from "axios";
import toast from "react-hot-toast";

const CreateBranchModal = ({ onClose, addModal, editData, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    state: editData?.state || "",
    dist: editData?.dist || "",
    city: editData?.city || "",
  });

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    if (addModal) setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let res;

      if (editData) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/branch/${editData._id}`, formData, { withCredentials: true });
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/branch/create`, formData, { withCredentials: true });
      }

      toast.success(res.data.message || "Branch saved");

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
      className={`fixed inset-0 z-50 flex items-center justify-center
      bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={domNode}
        className={`w-full max-w-xl bg-white rounded-tl-3xl rounded-br-3xl  shadow-xl
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
                {editData ? "Update Branch" : "Create Branch"}
              </h2>
              <p className="text-xs text-gray-100">
                {editData ? "Update you branch location" : "Add a new branch location"}
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm">
          <div className="grid grid-cols-1 gap-4">
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State *"
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />

            <input
              name="dist"
              value={formData.dist}
              onChange={handleChange}
              placeholder="District *"
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />

            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City *"
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Branch will be used for user & class mapping
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
              >
                {loading ? (editData ? "Updating..." : "Creating...") : (editData ? "Update Branch" : "Create Branch")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBranchModal;
