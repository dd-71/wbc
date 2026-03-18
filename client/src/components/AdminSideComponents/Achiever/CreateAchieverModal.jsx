import React, { useEffect, useState } from "react";
import { MdClose, MdDelete, MdAdd, MdEmojiEvents } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { cloudinary } from "../../../utils/cloudinary";
import { useAuth } from "../../../context/AuthProvider";

const EMPTY_ACHIEVER = { name: "", role: "", package: "", image: "", _imageFile: null, _preview: null };

const CreateAchieverModal = ({ onClose, editData, onSuccess, branches, openModal }) => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isSuperAdmin = user?.role?.roleName === "super-admin";

  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState(editData?.companyLogo || null);

  const [formData, setFormData] = useState({
    companyName: editData?.companyName || "",
    title: editData?.title || "",
    year: editData?.year || new Date().getFullYear(),
    branch: editData?.branch?._id || (isSuperAdmin ? "" : user?.branch?._id || ""),
  });

  const [achievers, setAchievers] = useState(
    editData?.achievers?.length
      ? editData.achievers.map((a) => ({ ...a, _imageFile: null, _preview: a.image || null }))
      : [{ ...EMPTY_ACHIEVER }]
  );

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, [openModal]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAchieverChange = (index, field, value) => {
    setAchievers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAchieverImage = (index, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAchievers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], _imageFile: file, _preview: preview };
      return updated;
    });
  };

  const addAchiever = () => setAchievers((p) => [...p, { ...EMPTY_ACHIEVER }]);

  const removeAchiever = (index) => {
    if (achievers.length === 1) return;
    setAchievers((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasEmpty = achievers.some((a) => !a.name || !a.role || !a.package || (!a._preview && !a.image));
    if (hasEmpty) return toast.error("Please fill all achiever details including images");

    try {
      setLoading(true);

      // Upload company logo if changed
      let companyLogoUrl = editData?.companyLogo || "";
      if (companyLogoFile) {
        const res = await cloudinary(companyLogoFile);
        companyLogoUrl = res.url;
      }

      // Upload each achiever image if new
      const uploadedAchievers = await Promise.all(
        achievers.map(async (a) => {
          let imageUrl = a.image || "";
          if (a._imageFile) {
            const res = await cloudinary(a._imageFile);
            imageUrl = res.url;
          }
          return { name: a.name, role: a.role, package: a.package, image: imageUrl };
        })
      );

      const payload = {
        ...formData,
        year: Number(formData.year),
        companyLogo: companyLogoUrl,
        achievers: uploadedAchievers,
      };

      const url = editData
        ? `${process.env.REACT_APP_API_URL}/achiever/${editData._id}`
        : `${process.env.REACT_APP_API_URL}/achiever/`;
      const method = editData ? axios.put : axios.post;

      const res = await method(url, payload, { withCredentials: true });
      toast.success(res.data.message || "Saved successfully");
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 backdrop-blur-sm z-50 bg-primaryColor/20 flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}>
      <div
        ref={domNode}
        className={`bg-white w-full max-w-4xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdEmojiEvents className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editData ? "Update Achievers" : "Create Achievers Group"}
              </h2>
              <p className="text-xs text-gray-100">
                {editData ? "Update placement group info" : "Add a new placement achievers group"}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full bg-white hover:bg-gray-200 transition">
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pt-6 space-y-5 text-sm">

          {/* GROUP INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name *"
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Group Title * (e.g. Accenture Crackers)"
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
            />
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Year *"
              required
              min="2000"
              max="2100"
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
                  <option key={b._id} value={b._id}>{b.city} ({b.state})</option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700">
                📍 {user?.branch?.city} ({user?.branch?.state})
              </div>
            )}
          </div>

          {/* COMPANY LOGO */}
          <div className="border-2 border-dashed rounded-xl p-4 bg-slate-50">
            <p className="text-xs text-gray-500 mb-2">Company Logo (optional)</p>
            {companyLogoPreview ? (
              <div className="relative w-32">
                <img src={companyLogoPreview} alt="logo" className="w-32 h-16 object-contain rounded-lg border bg-white p-1" />
                <button type="button" onClick={() => { setCompanyLogoFile(null); setCompanyLogoPreview(null); }}
                  className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow">
                  <MdDelete size={14} className="text-red-500" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <div className="w-32 h-16 flex flex-col items-center justify-center border-2 border-dashed rounded-lg border-gray-300 hover:border-primaryColor transition">
                  <MdEmojiEvents className="text-2xl text-gray-400" />
                  <span className="text-xs text-gray-400">Upload Logo</span>
                </div>
                <input type="file" hidden accept="image/*" onChange={(e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setCompanyLogoFile(f);
                  setCompanyLogoPreview(URL.createObjectURL(f));
                }} />
              </label>
            )}
          </div>

          {/* ACHIEVERS LIST */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">
                Achievers <span className="text-xs text-gray-400 ml-1">({achievers.length})</span>
              </p>
              <button
                type="button"
                onClick={addAchiever}
                className="px-3 py-1 text-xs bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded flex items-center gap-1 transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
              >
                <MdAdd /> Add Achiever
              </button>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {achievers.map((achiever, index) => (
                <div key={index} className="border rounded-xl p-4 bg-slate-50 space-y-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-primaryColor bg-primaryColor/10 px-2 py-0.5 rounded-full">
                      Achiever #{index + 1}
                    </span>
                    {achievers.length > 1 && (
                      <button type="button" onClick={() => removeAchiever(index)}
                        className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition">
                        <MdDelete size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {/* ACHIEVER IMAGE */}
                    <div className="flex-shrink-0">
                      {achiever._preview ? (
                        <div className="relative w-20 h-20">
                          <img src={achiever._preview} alt="achiever" className="w-20 h-20 object-cover rounded-xl border-2 border-primaryColor/20" />
                          <button type="button"
                            onClick={() => handleAchieverChange(index, '_preview', null)}
                            className="absolute -top-1.5 -right-1.5 bg-white border rounded-full p-0.5 shadow">
                            <MdDelete size={12} className="text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed rounded-xl border-gray-300 hover:border-primaryColor transition bg-white">
                            <MdAdd className="text-xl text-gray-400" />
                            <span className="text-[10px] text-gray-400 text-center">Photo</span>
                          </div>
                          <input type="file" hidden accept="image/*" onChange={(e) => handleAchieverImage(index, e.target.files[0])} />
                        </label>
                      )}
                    </div>

                    {/* ACHIEVER FIELDS */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        value={achiever.name}
                        onChange={(e) => handleAchieverChange(index, "name", e.target.value)}
                        placeholder="Full Name *"
                        required
                        className="px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm"
                      />
                      <input
                        value={achiever.role}
                        onChange={(e) => handleAchieverChange(index, "role", e.target.value)}
                        placeholder="Role / Position *"
                        required
                        className="px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm"
                      />
                      <input
                        value={achiever.package}
                        onChange={(e) => handleAchieverChange(index, "package", e.target.value)}
                        placeholder="Package (e.g. 6 LPA) *"
                        required
                        className="px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 border-t bg-white">
            <button type="button" onClick={handleClose} disabled={loading}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 flex items-center gap-1 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize disabled:opacity-70">
              {loading && <FiLoader className="animate-spin" />}
              {loading
                ? editData ? "Updating..." : "Creating..."
                : editData ? "Update Group" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAchieverModal;