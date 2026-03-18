import React, { useEffect, useMemo, useState } from "react";
import { MdMoreVert, MdEdit, MdDelete, MdEmojiEvents, MdBusiness, MdVisibility } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

import CommonButton from "../../components/common/CommonButton";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import { useAuth } from "../../context/AuthProvider";
import { usePermission } from "../../components/Hooks/usePermissions";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { useLockBodyScroll } from "../../components/Hooks/useLockBodyScroll";
import CreateAchieverModal from "../../components/AdminSideComponents/Achiever/CreateAchieverModal";
import ViewAchieverModal from "../../components/AdminSideComponents/Achiever/ViewAchieverModal";

/* ── SKELETON ── */
const AchieverSkeleton = () => (
  <>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden border shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    ))}
  </>
);

/* ── ACHIEVER GROUP CARD ── */
const AchieverGroupCard = ({ group, onView, onEdit, onDelete, can, openAction, setOpenAction, domNode }) => {
  const isOpen = openAction === group._id;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
      {/* Colored top bar */}
      <div className="h-1.5 bg-gradient-to-r from-primaryColor via-[#617cf5] to-primaryFadedColor" />

      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Group Header */}
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer group"
            onClick={() => onView(group)}
          >
            {/* Company logo or fallback icon */}
            <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-slate-50 flex-shrink-0 overflow-hidden">
              {group.companyLogo ? (
                <img src={group.companyLogo} alt={group.companyName} className="w-full h-full object-contain p-1" />
              ) : (
                <MdBusiness size={22} className="text-primaryColor" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 text-sm truncate group-hover:text-primaryColor transition-colors duration-200">
                {group.title}
              </h3>
              <p className="text-xs text-primaryColor font-semibold">{group.companyName}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {group.year} · {group.achievers?.length} Achiever{group.achievers?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Action menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setOpenAction(isOpen ? null : group._id)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
            >
              <MdMoreVert size={18} />
            </button>

            {isOpen && (
              <div ref={domNode} className="absolute right-0 top-8 z-20 bg-white border rounded-xl shadow-lg w-32 overflow-hidden">
                {can("view") && (
                  <button
                    onClick={() => { onView(group); setOpenAction(null); }}
                    className="w-full px-3 py-2 text-sm flex items-center gap-2 text-slate-600 hover:bg-gray-50 transition"
                  >
                    <MdVisibility size={15} /> View
                  </button>
                )}
                {can("edit") && (
                  <button
                    onClick={() => { onEdit(group); setOpenAction(null); }}
                    className="w-full px-3 py-2 text-sm flex items-center gap-2 text-green-600 hover:bg-green-50 transition"
                  >
                    <MdEdit size={15} /> Edit
                  </button>
                )}
                {can("delete") && (
                  <button
                    onClick={() => { onDelete(group._id); setOpenAction(null); }}
                    className="w-full px-3 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 transition"
                  >
                    <MdDelete size={15} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Achievers list preview */}
        <div className="flex flex-col gap-2">
          {group.achievers?.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-gray-100">
              <img
                src={a.image}
                alt={a.name}
                className="w-9 h-9 rounded-lg object-cover border-2 border-white shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{a.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{a.role}</p>
              </div>
              <span className="flex-shrink-0 text-[10px] font-bold text-primaryColor bg-primaryColor/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FiPackage size={10} /> {a.package}
              </span>
            </div>
          ))}

          {group.achievers?.length > 3 && (
            <button
              onClick={() => onView(group)}
              className="text-xs text-center text-primaryColor hover:underline pt-1"
            >
              +{group.achievers.length - 3} more achiever{group.achievers.length - 3 > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── MAIN PAGE ── */
const Achiever = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAction, setOpenAction] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [viewGroup, setViewGroup] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const domNode = useClickOutside(() => setOpenAction(null));
  useLockBodyScroll(openCreate);

  const { branches } = useAuth();
  const { can } = usePermission();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/achiever/`,
        { withCredentials: true }
      );
      setGroups(data.data || []);
    } catch {
      toast.error("Failed to load achievers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const years = useMemo(() => [...new Set(groups.map((g) => g.year))].sort((a, b) => b - a), [groups]);

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      const matchSearch =
        g.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        g.title?.toLowerCase().includes(search.toLowerCase()) ||
        g.achievers?.some((a) => a.name?.toLowerCase().includes(search.toLowerCase()));
      const matchYear = yearFilter === "" || String(g.year) === yearFilter;
      return matchSearch && matchYear;
    });
  }, [groups, search, yearFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/achiever/${deleteId}`, { withCredentials: true });
      toast.success("Achievers group deleted");
      fetchGroups();
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primaryColor flex items-center gap-2">
            {/* <MdEmojiEvents className="text-accentColor" /> */}
            Achievers Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {groups.length} placement group{groups.length !== 1 ? "s" : ""}
          </p>
        </div>
        {can("create") && (
          <CommonButton label="+ Add Achievers" handler={() => setOpenCreate(true)} />
        )}
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Search company, title, achiever name..."
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-72"
        />
        <select
          value={yearFilter}
          onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* CARD GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AchieverSkeleton />
        </div>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((group) => (
            <AchieverGroupCard
              key={group._id}
              group={group}
              onView={(g) => { setViewGroup(g); setOpenView(true); }}
              onEdit={(g) => { setEditGroup(g); setOpenCreate(true); }}
              onDelete={(id) => { setDeleteId(id); setDeleteModal(true); }}
              can={can}
              openAction={openAction}
              setOpenAction={setOpenAction}
              domNode={domNode}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <MdEmojiEvents size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No achievers found</p>
          <p className="text-sm mt-1">Create your first placement achievers group</p>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 text-sm">
          <span className="text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} groups
          </span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">Prev</button>
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`e-${idx}`} className="px-3 py-1">...</span>
              ) : (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${currentPage === page ? "bg-primaryColor text-white" : "hover:bg-gray-100"}`}>
                  {page}
                </button>
              )
            )}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">Next</button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {openCreate && (
        <CreateAchieverModal
          editData={editGroup}
          branches={branches}
          onSuccess={fetchGroups}
          onClose={() => { setOpenCreate(false); setEditGroup(null); }}
          openModal={openCreate}
        />
      )}

      {openView && (
        <ViewAchieverModal
          data={viewGroup}
          onClose={() => { setOpenView(false); setViewGroup(null); }}
        />
      )}

      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Achievers Group"
        description="Are you sure you want to delete this achievers group? All achievers in this group will be removed."
        confirmText="Delete Group"
      />
    </div>
  );
};

export default Achiever;