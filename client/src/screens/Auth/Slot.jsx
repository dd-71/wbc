import React, { useEffect, useMemo, useState } from "react";
import { MdDelete, MdEdit, MdMoreVert } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

import CommonButton from "../../components/common/CommonButton";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import CreateSlotModal from './../../components/AdminSideComponents/SlotManagement/CreateSlotModal';
import { useAuth } from "../../context/AuthProvider";
import { usePermission } from "../../components/Hooks/usePermissions";

const SlotSkeleton = () => {
  return [...Array(10)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));
};

const Slot = () => {
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAction, setOpenAction] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const domNode = useClickOutside(() => setOpenAction(null));

  const { role, branches, user } = useAuth();
  const { can } = usePermission();

  /* SEARCH & FILTER */
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const params = {};
      if (branchFilter) params.branch = branchFilter;
      if (modeFilter) params.mode = modeFilter;
      if (roomFilter) params.room = roomFilter;

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/slot/get-all`,
        { params, withCredentials: true }
      );
      setSlots(data.data || []);
    } catch {
      toast.error("Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const params = {};
      if (branchFilter) params.branch = branchFilter;

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/room/get-all`,
        { params, withCredentials: true }
      );
      setRooms(data.data || []);
    } catch {
      toast.error("Failed to load rooms");
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchRooms();
  }, [branchFilter, modeFilter, roomFilter]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/slot/${deleteId}`,
        { withCredentials: true }
      );
      toast.success("Slot deleted");
      fetchSlots();
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= FILTERED DATA ================= */
  const filteredSlots = useMemo(() => {
    return slots?.filter((slot) => {
      const matchSearch =
        slot.room?.roomName?.toLowerCase().includes(search.toLowerCase()) ||
        slot.location?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [slots, search]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filteredSlots?.length / itemsPerPage);

  const paginatedSlots = filteredSlots?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Smart pagination - show first 2, last 2, and current page context
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    const pages = [];

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const getModeBadge = (mode) => {
    const styles = {
      online: "bg-blue-100 text-blue-700",
      offline: "bg-green-100 text-green-700",
      hybrid: "bg-purple-100 text-purple-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[mode]}`}>
        {mode}
      </span>
    );
  };

  const formatTime = (time) => {
    if (!time) return "";
    // If time is in ISO format, extract time part
    if (time.includes("T")) {
      return new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    // If it's already in time format (HH:MM)
    return time;
  };

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">
          Slot Management
        </h1>
        {can("create") && (
          <CommonButton label="+ Create Slot" handler={() => setOpenModal(true)} />
        )}
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          type="text"
          placeholder="Search room or location"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

        {/* Show branch filter only for super-admin */}
        {role === "super-admin" && (
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setRoomFilter(""); // Reset room filter when branch changes
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
          >
            <option value="">All Branches</option>
            {branches?.map((b) => (
              <option key={b._id} value={b._id}>
                {b.city}
              </option>
            ))}
          </select>
        )}

        {/* MODE FILTER */}
        <select
          value={modeFilter}
          onChange={(e) => {
            setModeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Modes</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="hybrid">Hybrid</option>
        </select>

        {/* ROOM FILTER */}
        <select
          value={roomFilter}
          onChange={(e) => {
            setRoomFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Rooms</option>
          {rooms?.map((r) => (
            <option key={r._id} value={r._id}>
              {r.roomName}
            </option>
          ))}
        </select>

        {/* ITEMS PER PAGE */}
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="ml-auto px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Start Time</th>
              <th className="p-3 text-left">End Time</th>
              <th className="p-3 text-left">Mode</th>
              <th className="p-3 text-left">Room</th>
              <th className="p-3 text-left">Location/Link</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <SlotSkeleton />
            ) : paginatedSlots?.length ? (
              paginatedSlots.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{formatTime(s.startTime)}</td>
                  <td className="p-3 font-medium">{formatTime(s.endTime)}</td>
                  <td className="p-3">{getModeBadge(s.mode)}</td>
                  <td className="p-3">
                    {s.room ? (
                      <span>{s.room.roomName}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {s.location ? (
                      <a
                        href={s.location.startsWith('http') ? s.location : `https://${s.location}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-xs"
                      >
                        {s.location}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {s.branch ? (
                      <span>
                        {s.branch.city} ({s.branch.state})
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="p-3 relative">
                    <button
                      onClick={() =>
                        setOpenAction(openAction === s._id ? null : s._id)
                      }
                      className="p-1.5 text-xl hover:bg-gray-200 rounded"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === s._id && (
                      <div
                        ref={domNode}
                        className="absolute -translate-x-24 -translate-y-7 left bg-white border rounded shadow z-20"
                      >
                        {can("edit") && (
                          <button
                            onClick={() => {
                              setEditSlot(s);
                              setOpenModal(true);
                              setOpenAction(null);
                            }}
                            className="px-3 py-2 flex gap-2 w-full hover:bg-gray-100"
                          >
                            <MdEdit /> Edit
                          </button>
                        )}

                        {can("delete") && (
                          <button
                            onClick={() => {
                              setDeleteId(s._id);
                              setDeleteModal(true);
                              setOpenAction(null);
                            }}
                            className="px-3 py-2 flex gap-2 text-red-600 hover:bg-red-50"
                          >
                            <MdDelete /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No slots found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredSlots?.length)} of{" "}
            {filteredSlots?.length} slots
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
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded
                    ${currentPage === page
                      ? "bg-primaryColor text-white"
                      : "hover:bg-gray-100"
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

      {/* CREATE / UPDATE MODAL */}
      {openModal && (
        <CreateSlotModal
          editData={editSlot}
          branches={branches}
          rooms={rooms}
          onSuccess={fetchSlots}
          onClose={() => {
            setOpenModal(false);
            setEditSlot(null);
          }}
        />
      )}

      {/* DELETE MODAL */}
      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Slot"
        description="Are you sure you want to delete this slot?"
        confirmText="Delete Slot"
      />
    </div>
  );
};

export default Slot;