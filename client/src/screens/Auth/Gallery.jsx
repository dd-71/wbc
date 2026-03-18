import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { MdDelete, MdImage } from "react-icons/md";
import AddGalleryModal from "../../components/AdminSideComponents/Gallery/AddGalleryModal";
import CommonButton from "../../components/common/CommonButton";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { usePermission } from "../../components/Hooks/usePermissions";

// SKELETON
const GallerySkeleton = () => (
  <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="break-inside-avoid rounded-xl overflow-hidden animate-pulse bg-gray-200"
        style={{ height: `${[180, 240, 160, 300, 200][i % 5]}px` }}
      />
    ))}
  </div>
);

// MASONRY GALLERY GRID

const MasonryGrid = ({ images, onDelete, onPreview, can }) => {
  const [hoveredId, setHoveredId] = useState(null);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <MdImage size={64} className="mb-4 opacity-30" />
        <p className="text-lg font-medium">No images yet</p>
        <p className="text-sm mt-1">Upload your first gallery image</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
      {images.map((img) => (
        <div
          key={img._id}
          className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          onMouseEnter={() => setHoveredId(img._id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <img
            src={img.image}
            alt="gallery"
            onClick={() => onPreview(img)}
            className="w-full object-cover block transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
            loading="lazy"
          />
          {/* Overlay */}
          <div
            className={`absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${hoveredId === img._id ? "opacity-100" : "opacity-0"
              }`}
          />
          {/* Delete btn */}
          {can("delete") && (
            <button
              onClick={() => onDelete(img._id)}
              className={`absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-red-50 hover:text-red-600 rounded-full shadow transition-all duration-300 ${hoveredId === img._id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            >
              <MdDelete size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// MAIN GALLERY PAGE

const Gallery = () => {
  const { can } = usePermission();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);


  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/gallery/`);
      setImages(data.data || []);
    } catch {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/gallery/${deleteId}`, {
        withCredentials: true,
      });
      toast.success("Image deleted");
      fetchImages();
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const sortedImages = [...images].sort((a, b) => {
    const da = new Date(a.createdAt);
    const db = new Date(b.createdAt);
    return sortOrder === "newest" ? db - da : da - db;
  });

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primaryColor">Gallery</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {images.length} image{images.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SORT FILTER */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setSortOrder("newest")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition ${sortOrder === "newest"
                ? "from-primaryColor via-[#617cf5] to-primaryFadedColor bg-gradient-to-b text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              <HiSortDescending size={16} /> Newest
            </button>
            <button
              onClick={() => setSortOrder("oldest")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition ${sortOrder === "oldest"
                ? "from-primaryColor via-[#617cf5] to-primaryFadedColor bg-gradient-to-b text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              <HiSortAscending size={16} /> Oldest
            </button>
          </div>

          {can("create") && (
            <CommonButton
              label="+ Add Images"
              handler={() => setOpenModal(true)}
            />
          )}
        </div>
      </div>

      {/* GALLERY GRID */}
      {loading ? (
        <GallerySkeleton />
      ) : (
        <MasonryGrid
          images={sortedImages}
          onDelete={(id) => {
            setDeleteId(id);
            setDeleteModal(true);
          }}
          onPreview={(img) => setPreviewImage(img)}
          can={can}
        />
      )}

      {/* ADD IMAGES MODAL */}
      {openModal && (
        <AddGalleryModal
          onClose={() => setOpenModal(false)}
          onSuccess={fetchImages}
        />
      )}

      {/* DELETE MODAL */}
      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete Image"
      />

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl w-full px-6 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage.image}
              alt="preview"
              className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />

            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-8 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;