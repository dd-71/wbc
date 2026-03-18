import React, { useEffect, useState } from "react";
import { MdClose, MdImage, MdDelete, MdAdd } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { cloudinary } from "../../../utils/cloudinary";
import { useAuth } from "../../../context/AuthProvider";

const CreateCourseModal = ({ onClose, editData, onSuccess, branches, openCreate }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isSuperAdmin = user?.role?.roleName === "super-admin";

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    editData?.courseBannerImage || null
  );

  const [formData, setFormData] = useState({
    courseName: editData?.courseName || "",
    branch: editData?.branch?._id || (isSuperAdmin ? "" : user?.branch?._id || ""),
    description: editData?.description || "",
    price: editData?.price || "",
    discount: editData?.discount || "",
    isPaid: editData?.isPaid ?? true,
    status: editData?.status || "draft",
    syllabus: editData?.syllabus || [""],
  });


  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, [openCreate]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleSyllabusChange = (index, value) => {
    const newSyllabus = [...formData.syllabus];
    newSyllabus[index] = value;
    setFormData((p) => ({ ...p, syllabus: newSyllabus }));
  };

  const addSyllabusItem = () => {
    setFormData((p) => ({ ...p, syllabus: [...p.syllabus, ""] }));
  };

  const removeSyllabusItem = (index) => {
    if (formData.syllabus.length > 1) {
      const newSyllabus = formData.syllabus.filter((_, i) => i !== index);
      setFormData((p) => ({ ...p, syllabus: newSyllabus }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty syllabus items
    const filteredSyllabus = formData.syllabus.filter((item) => item.trim());
    if (filteredSyllabus.length === 0) {
      return toast.error("Please add at least one syllabus topic");
    }

    try {
      setLoading(true);

      let courseBannerImageUrl = editData?.courseBannerImage || "";

      // Upload image to Cloudinary if new image is selected
      if (imageFile) {
        try {
          const uploadedUrl = await cloudinary(imageFile);
          courseBannerImageUrl = uploadedUrl.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error("Failed to upload image. Please try again.");
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        syllabus: filteredSyllabus,
        courseBannerImage: courseBannerImageUrl,
        price: formData.isPaid ? Number(formData.price) : 0,
        discount: formData.isPaid && formData.discount
          ? Number(formData.discount)
          : 0,
        isPaid: formData.isPaid,
      };


      const url = editData
        ? `${process.env.REACT_APP_API_URL}/course/${editData._id}`
        : `${process.env.REACT_APP_API_URL}/course/create`;

      const method = editData ? axios.put : axios.post;

      const res = await method(url, payload, { withCredentials: true });

      toast.success(res.data.message || "Course saved");
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
        className={`bg-white w-full max-w-4xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
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
                {editData ? "Update Course" : "Create Course"}
              </h2>
              <p className="text-xs text-gray-100">
                {editData ? "Update course information" : "Add a new course"}
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pt-6 space-y-5 text-sm"
        >
          {/* IMAGE */}
          <div className="border-2 border-dashed rounded-xl p-4 bg-slate-50">
            <p className="text-xs text-gray-500 mb-2">Course Banner</p>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Course Banner"
                  className="w-full h-40 object-cover rounded-lg"
                />
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

          {/* COURSE NAME */}
          <input
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            placeholder="Course Name *"
            required
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
          />

          {/* BRANCH */}
          {isSuperAdmin ? (
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            >
              <option value="">Select Branch *</option>
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


          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description *"
            required
            rows={3}
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
          />

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              Is Paid Course?
            </label>
            <input
              type="checkbox"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleChange}
              className="w-4 h-4 accent-primaryColor"
            />
          </div>


          {/* PRICE */}
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price *"
            required={formData.isPaid}
            disabled={!formData.isPaid}
            min="0"
            className={`w-full px-3 py-2 border rounded-lg 
  ${!formData.isPaid ? "bg-gray-100 cursor-not-allowed" : "bg-slate-50"}
  focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none`}
          />

          {/* DISCOUNT */}
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            placeholder="Discount (%)"
            disabled={!formData.isPaid}
            min="0"
            max="100"
            className={`w-full px-3 py-2 border rounded-lg 
  ${!formData.isPaid ? "bg-gray-100 cursor-not-allowed" : "bg-slate-50"}
  focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none`}
          />

          {/* STATUS */}
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>

          {/* SYLLABUS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Syllabus Topics *
              </p>
              <button
                type="button"
                onClick={addSyllabusItem}
                className="px-3 py-1 text-xs bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded flex items-center gap-1 transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
              >
                <MdAdd /> Add Topic
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto px-1">
              {formData.syllabus.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) =>
                      handleSyllabusChange(index, e.target.value)
                    }
                    placeholder={`Topic ${index + 1}`}
                    className="flex-1 px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                  />
                  {formData.syllabus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSyllabusItem(index)}
                      className="px-3 py-2 border rounded-lg hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <MdDelete />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

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
              type="submit"
              disabled={loading}
              className="px-4 py-2 flex items-center gap-1 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize disabled:opacity-70"
            >
              {loading && <FiLoader className="animate-spin" />}
              {loading
                ? editData
                  ? "Updating..."
                  : "Creating..."
                : editData
                  ? "Update Course"
                  : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;