import React, { useEffect, useState } from "react";
import { MdClose, MdFrontLoader, MdSecurity } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import axios from "axios";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";

const CreateRoleModal = ({ onClose, addModal, editData, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    roleName: "",
    code: "",
    status: "active",
  });

  const domNode = useClickOutside(() => handleClose());

  /* ================= PREFILL ON EDIT ================= */
  useEffect(() => {
    if (editData) {
      setFormData({
        roleName: editData.roleName || "",
        code: editData.code || "",
        status: editData.status || "active",
      });
    }
  }, [editData]);

  useEffect(() => {
    if (addModal) setTimeout(() => setAnimate(true), 10);
  }, [addModal]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let res;

      if (editData) {
        // UPDATE ROLE
        res = await axios.patch(
          `${process.env.REACT_APP_API_URL}/role/${editData._id}`,
          formData,
          { withCredentials: true }
        );
      } else {
        // CREATE ROLE
        res = await axios.post(
          `${process.env.REACT_APP_API_URL}/role/create`,
          formData,
          { withCredentials: true }
        );
      }

      toast.success(res.data.message || "Role saved successfully");
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
        className={`w-full max-w-lg bg-white rounded-tl-3xl rounded-br-3xl  shadow-2xl
        transition-all duration-300
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdSecurity className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editData ? "Update Role" : "Create Role"}
              </h2>
              <p className="text-xs text-gray-100">
                {editData
                  ? "Modify role details"
                  : "Define a new system role"}
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
              required
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              placeholder="Role Name *"
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />

            {/* <input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Role Code (eg: admin, tutor) *"
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select> */}
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Roles control user permissions
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
                className="px-4 flex items-center gap-1 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
              >{loading && <FiLoader className="animate-spin" />}
                {loading
                  ? editData
                    ? "Updating..."
                    : "Creating..."
                  : editData
                    ? "Update Role"
                    : "Create Role"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoleModal;
