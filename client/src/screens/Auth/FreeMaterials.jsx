import React, { useEffect, useMemo, useState } from "react";
import {
  MdMoreVert, MdEdit, MdDelete, MdVisibility,
  MdViewModule, MdViewList, MdVideoLibrary, MdPictureAsPdf, MdOpenInNew,
} from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

import CommonButton from "../../components/common/CommonButton";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import { usePermission } from "../../components/Hooks/usePermissions";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { useLockBodyScroll } from "../../components/Hooks/useLockBodyScroll";
import ViewFreeMaterialModal from "../../components/AdminSideComponents/FreeMaterials/Viewfreematerialmodal";
import CreateFreeMaterialModal from "../../components/AdminSideComponents/FreeMaterials/Createfreematerialmodal";
import FreeMaterialCardView from "../../components/AdminSideComponents/FreeMaterials/Freematerialcardview";

const API = process.env.REACT_APP_API_URL;

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
const FreeMaterialSkeleton = () =>
  [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-8 w-8 bg-gray-200 rounded-lg" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-48" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const FreeMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAction, setOpenAction] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [viewMaterial, setViewMaterial] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewMode, setViewMode] = useState("table");

  /* SEARCH & FILTER */
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const domNode = useClickOutside(() => setOpenAction(null));
  useLockBodyScroll(openCreate || openView);

  const { can } = usePermission();

  /* ── FETCH ── */
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;

      const { data } = await axios.get(`${API}/free-material`, {
        params,
        withCredentials: true,
      });
      setMaterials(data.data || []);
    } catch {
      toast.error("Failed to load free materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [typeFilter]);

  /* ── FILTER (client-side search) ── */
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [materials, search]);

  /* ── PAGINATION ── */
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const shouldOpenUp = (index) => {
    return index + 1 > paginatedMaterials.length - 2;
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  /* ── DELETE ── */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${API}/free-material/${deleteId}`, {
        withCredentials: true,
      });
      toast.success("Material deleted");
      fetchMaterials();
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ── STATS ── */
  const videoCount = materials.filter((m) => m.type === "video").length;
  const enoteCount = materials.filter((m) => m.type === "enote").length;

  return (
    <div className="py-5">

      {/* ── HEADER ── */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">
          Free Materials
        </h1>
        <div className="flex items-center gap-3">
          {/* VIEW TOGGLE */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm flex items-center gap-2 transition ${viewMode === "table"
                ? "from-primaryColor via-[#617cf5] to-primaryFadedColor bg-gradient-to-b text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              <MdViewList size={18} /> Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 text-sm flex items-center gap-2 transition ${viewMode === "card"
                ? "from-primaryColor via-[#617cf5] to-primaryFadedColor bg-gradient-to-b text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              <MdViewModule size={18} /> Cards
            </button>
          </div>

          {can("create") && (
            <CommonButton
              label="+ Add Material"
              handler={() => setOpenCreate(true)}
            />
          )}
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      {!loading && materials.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-600">{materials.length}</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total</p>
              <p className="text-sm font-semibold text-gray-700">All Materials</p>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <MdVideoLibrary size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Videos</p>
              <p className="text-sm font-semibold text-gray-700">{videoCount}</p>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <MdPictureAsPdf size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">E-Notes</p>
              <p className="text-sm font-semibold text-gray-700">{enoteCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH & FILTER ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Search title or description"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Types</option>
          <option value="video">Videos</option>
          <option value="enote">E-Notes</option>
        </select>

        {/* ITEMS PER PAGE */}
        <select
          value={itemsPerPage}
          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="ml-auto px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* ── TABLE OR CARD VIEW ── */}
      {viewMode === "table" ? (
        <div className="bg-white border overflow-visible">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Link / File</th>
                <th className="p-3 text-left">Added On</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <FreeMaterialSkeleton />
              ) : paginatedMaterials.length > 0 ? (
                paginatedMaterials.map((m, index) => {
                  const isVideo = m.type === "video";
                  return (
                    <tr key={m._id} className="hover:bg-gray-50 duration-300">

                      {/* TYPE ICON */}
                      <td className="p-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isVideo ? "bg-blue-50" : "bg-red-50"
                          }`}>
                          {isVideo ? (
                            <MdVideoLibrary size={18} className="text-blue-500" />
                          ) : (
                            <MdPictureAsPdf size={18} className="text-red-500" />
                          )}
                        </div>
                      </td>

                      {/* TITLE — clickable */}
                      <td
                        onClick={() => { setViewMaterial(m); setOpenView(true); }}
                        className="p-3 font-medium text-gray-800 hover:text-primaryColor duration-300 cursor-pointer max-w-[180px]"
                      >
                        <p className="truncate">{m.title}</p>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full mt-0.5 inline-block ${isVideo ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                          }`}>
                          {isVideo ? "Video" : "E-Note"}
                        </span>
                      </td>

                      {/* DESCRIPTION */}
                      <td className="p-3 text-gray-500 max-w-[200px]">
                        <p className="truncate text-xs">{m.description || "—"}</p>
                      </td>

                      {/* LINK / FILE */}
                      <td className="p-3">
                        {isVideo && m.videoLink ? (
                          <a
                            href={m.videoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-blue-600 text-xs hover:underline"
                          >
                            <MdOpenInNew size={13} />
                            <span className="truncate max-w-[140px]">Open Video</span>
                          </a>
                        ) : !isVideo && m.pdfUrl ? (
                          <a
                            href={m.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-red-600 text-xs hover:underline"
                          >
                            <MdOpenInNew size={13} />
                            <span>Open PDF</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* DATE */}
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* ACTION */}
                      <td className="p-3 text-left relative">
                        <button
                          onClick={() => setOpenAction(openAction === m._id ? null : m._id)}
                          className="text-xl p-1.5 hover:bg-gray-200 duration-300 rounded-lg"
                        >
                          <MdMoreVert />
                        </button>

                        {openAction === m._id && (
                          <div
                            ref={domNode}
                            className={`absolute text-xs -translate-x-32 z-20 bg-white border rounded-md shadow-lg w-32 ${shouldOpenUp(index) ? "bottom-8" : "top-8"
                              }`}
                          >
                            {can("view") && (
                              <button
                                onClick={() => { setViewMaterial(m); setOpenView(true); setOpenAction(null); }}
                                className="w-full px-3 py-2 text-slate-600 flex items-center gap-2 hover:bg-gray-100"
                              >
                                <MdVisibility size={13} /> View
                              </button>
                            )}
                            {can("edit") && (
                              <button
                                onClick={() => { setEditMaterial(m); setOpenCreate(true); setOpenAction(null); }}
                                className="w-full px-3 py-2 flex text-green-600 items-center gap-2 hover:bg-gray-100"
                              >
                                <MdEdit size={13} /> Edit
                              </button>
                            )}
                            {can("delete") && (
                              <button
                                onClick={() => { setDeleteId(m._id); setDeleteModal(true); setOpenAction(null); }}
                                className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                              >
                                <MdDelete size={13} /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-3">
                        <MdVideoLibrary size={32} className="text-gray-300" />
                        <MdPictureAsPdf size={32} className="text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-500">No materials found</p>
                      <p className="text-xs text-gray-300">
                        {search || typeFilter ? "Try adjusting your filters" : "Add your first free material"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARD VIEW */
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-36 rounded-t-2xl" />
                <div className="bg-white p-4 space-y-3 rounded-b-2xl border border-t-0">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedMaterials.length > 0 ? (
          <FreeMaterialCardView
            materials={paginatedMaterials}
            onView={(m) => { setViewMaterial(m); setOpenView(true); }}
            onEdit={(m) => { setEditMaterial(m); setOpenCreate(true); }}
            onDelete={(m) => { setDeleteId(m._id); setDeleteModal(true); }}
            openAction={openAction}
            setOpenAction={setOpenAction}
            domNode={domNode}
            can={can}
          />
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="flex justify-center gap-3 mb-3">
              <MdVideoLibrary size={36} className="text-gray-300" />
              <MdPictureAsPdf size={36} className="text-gray-300" />
            </div>
            <p className="font-medium">No materials found</p>
          </div>
        )
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredMaterials.length)} of{" "}
            {filteredMaterials.length} materials
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Prev
            </button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-1">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${currentPage === page ? "bg-primaryColor text-white" : "hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {openCreate && (
        <CreateFreeMaterialModal
          editData={editMaterial}
          onSuccess={() => { fetchMaterials(); }}
          onClose={() => { setOpenCreate(false); setEditMaterial(null); }}
          openCreate={openCreate}
        />
      )}

      {openView && viewMaterial && (
        <ViewFreeMaterialModal
          material={viewMaterial}
          onClose={() => { setOpenView(false); setViewMaterial(null); }}
          open={openView}
        />
      )}

      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Free Material"
        description="Are you sure you want to delete this material? This action cannot be undone."
        confirmText="Delete Material"
      />
    </div>
  );
};

export default FreeMaterials;