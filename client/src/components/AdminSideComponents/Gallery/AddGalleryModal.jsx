import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiLoader, FiUploadCloud } from "react-icons/fi";
import { MdAddPhotoAlternate, MdClose, MdDelete } from "react-icons/md";
import { cloudinary } from './../../../utils/cloudinary';


const AddGalleryModal = ({ onClose, onSuccess }) => {
  const [animate, setAnimate] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    addFiles(selected);
  };

  const addFiles = (selected) => {
    const imageFiles = selected.filter((f) => f.type.startsWith("image/"));
    const previews = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setFiles((prev) => [...prev, ...previews]);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  };

  const handleSubmit = async () => {
    if (files.length === 0)
      return toast.error("Please select at least one image");

    try {
      setUploading(true);
      setProgress({ current: 0, total: files.length });

      const uploadedImages = [];

      // 🔥 Upload all to Cloudinary first
      for (let i = 0; i < files.length; i++) {
        const { file } = files[i];

        const uploaded = await cloudinary(file);

        uploadedImages.push({
          image: uploaded.url,
          publicId: uploaded.publicId,
        });

        setProgress({ current: i + 1, total: files.length });
      }

      // 🔥 ONE API CALL ONLY
      await axios.post(
        `${process.env.REACT_APP_API_URL}/gallery/bulk`,
        { images: uploadedImages },
        { withCredentials: true }
      );

      toast.success(`${files.length} images uploaded successfully`);
      onSuccess();
      handleClose();

    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };


  return (
    <div
      className={`fixed inset-0 backdrop-blur-sm z-50 bg-primaryColor/10 flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-white w-full max-w-3xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdAddPhotoAlternate className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Add Gallery Images</h2>
              <p className="text-xs text-gray-100">Select multiple images at once</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 rounded-full bg-white hover:bg-gray-200 transition disabled:opacity-50"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* DROPZONE */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? "border-primaryColor bg-primaryColor/5" : "border-gray-300 bg-slate-50"}`}
          >
            <FiUploadCloud className="mx-auto text-4xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-1">Drag & drop images here, or</p>
            <label className="cursor-pointer inline-block px-4 py-2 text-sm bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-lg hover:shadow-md transition">
              Browse Files
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">
              Tip: Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs border">Ctrl+A</kbd> inside the file picker to select all
            </p>
          </div>

          {/* PREVIEW GRID */}
          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">{files.length} image{files.length !== 1 ? "s" : ""} selected</p>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                {files.map(({ id, preview }) => (
                  <div key={id} className="relative group rounded-lg overflow-hidden aspect-square border">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(id)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      <MdDelete className="text-white text-xl" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD PROGRESS */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <FiLoader className="animate-spin" />
                  Uploading {progress.current} of {progress.total}...
                </span>
                <span className="font-medium text-primaryColor">
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-primaryColor to-primaryFadedColor rounded-full transition-all duration-500"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-br-3xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || files.length === 0}
            className="px-4 py-2 flex items-center gap-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md text-sm transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] disabled:opacity-60"
          >
            {uploading ? <FiLoader className="animate-spin" /> : <FiUploadCloud />}
            {uploading ? `Uploading (${progress.current}/${progress.total})...` : `Upload ${files.length > 0 ? files.length : ""} Image${files.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGalleryModal;