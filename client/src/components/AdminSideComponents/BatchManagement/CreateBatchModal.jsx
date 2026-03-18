import React, { useEffect, useState } from "react";
import { MdClose, MdImage, MdDelete } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { cloudinary } from "../../../utils/cloudinary";
import { useAuth } from "../../../context/AuthProvider";

const CreateBatchModal = ({ onClose, editData, onSuccess, branches }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.roleName === "super-admin";
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    editData?.batchBannerImage || null
  );

  const [formData, setFormData] = useState({
    batchName: editData?.batchName || "",
    branch: editData?.branch?._id || (isSuperAdmin ? "" : user?.branch?._id || ""),
    description: editData?.description || "",
    duration: editData?.duration || "",
    startDate: editData?.startDate?.split("T")[0] || "",
    endDate: editData?.endDate?.split("T")[0] || "",
    status: editData?.status || "upcoming",
    languages: editData?.languages?.join(", ") || "",
    price: editData?.price || "",
    discount: editData?.discount || "",
  });

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      return toast.error("End date cannot be before start date");
    }

    try {
      setLoading(true);

      let batchBannerImageUrl = editData?.batchBannerImage || "";

      // Upload image to Cloudinary if new image is selected
      if (imageFile) {
        try {
          const uploadedUrl = await cloudinary(imageFile);
          batchBannerImageUrl = uploadedUrl.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error("Failed to upload image. Please try again.");
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        batchBannerImage: batchBannerImageUrl,
        languages: formData.languages
          ? formData.languages.split(",").map((l) => l.trim()).filter(Boolean)
          : [],
        price: Number(formData.price),
        discount: formData.discount ? Number(formData.discount) : 0,
      };

      if (formData.discount && (formData.discount < 0 || formData.discount > 100)) {
        return toast.error("Discount must be between 0 and 100");
      }

      const url = editData
        ? `${process.env.REACT_APP_API_URL}/batch/${editData._id}`
        : `${process.env.REACT_APP_API_URL}/batch/create`;

      const method = editData ? axios.put : axios.post;

      const res = await method(url, payload, { withCredentials: true });

      toast.success(res.data.message || "Batch saved");
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
      className={`fixed inset-0 backdrop-blur-sm z-50 bg-primaryColor/20 flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-3xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdImage className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editData ? "Update Batch" : "Create Batch"}
              </h2>
              <p className="text-xs text-gray-100">
                {editData ? "Update batch information" : "Add a new batch"}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pt-6 space-y-5 text-sm">
          {/* IMAGE */}
          <div className="border-2 border-dashed rounded-xl p-4 bg-slate-50">
            <p className="text-xs text-gray-500 mb-2">Batch Banner</p>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} className="w-full h-40 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow"
                >
                  <MdDelete />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                <MdImage className="text-3xl text-gray-400" />
                <span className="text-gray-400 text-sm">Click to upload</span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              name="batchName"
              value={formData.batchName}
              onChange={handleChange}
              placeholder="Batch Name *"
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
            <input
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Batch Duration *"
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
            <input
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              placeholder="Languages (comma separated e.g. English, Hindi)"
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Batch Price *"
                min="0"
                required
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />

              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="Discount (%)"
                min="0"
                max="100"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />
            </div>

          </div>


          {isSuperAdmin ? (
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            >
              <option value="" disabled>Select Branch *</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.city} ({b.state})
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700">
              📍 {user?.branch?.city} ({user?.branch?.state})
            </div>
          )}

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            rows={3}
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
          </div>

          {editData && (
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="completed">Completed</option>
            </select>
          )}


          {/* FOOTER */}
          <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 border-t bg-white">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="px-4 py-2 flex items-center gap-1 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize disabled:opacity-70"
            >
              {loading && <FiLoader className="animate-spin" />}
              {loading
                ? editData
                  ? "Updating..."
                  : "Creating..."
                : editData
                  ? "Update Batch"
                  : "Create Batch"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateBatchModal;