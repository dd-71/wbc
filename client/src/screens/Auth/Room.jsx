import React, { useEffect, useMemo, useState } from "react";
import { MdDelete, MdEdit, MdMoreVert } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

import CommonButton from "../../components/common/CommonButton";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import CreateRoomModal from './../../components/AdminSideComponents/RoomManagement/CreateRoomModal';
import { useAuth } from "../../context/AuthProvider";
import { usePermission } from "../../components/Hooks/usePermissions";

const RoomSkeleton = () => {
  return [...Array(10)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));
};

const Room = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAction, setOpenAction] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const domNode = useClickOutside(() => setOpenAction(null));

  const { role, branches, user } = useAuth();
  const { can } = usePermission();

  /* SEARCH & FILTER */
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (branchFilter) params.branch = branchFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/room/get-all/`,
        { params, withCredentials: true }
      );
      setRooms(data.data || []);
    } catch {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [branchFilter, statusFilter]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/room/${deleteId}`,
        { withCredentials: true }
      );
      toast.success("Room deleted");
      fetchRooms();
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= FILTERED DATA ================= */
  const filteredRooms = useMemo(() => {
    return rooms?.filter((room) => {
      const matchSearch = room.roomName.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [rooms, search]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filteredRooms?.length / itemsPerPage);

  const paginatedRooms = filteredRooms?.slice(
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

  const getStatusBadge = (status) => {
    const styles = {
      available: "bg-green-100 text-green-700",
      "under-maintenance": "bg-yellow-100 text-yellow-700",
      disabled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status === "under-maintenance" ? "Maintenance" : status}
      </span>
    );
  };

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">
          Room Management
        </h1>
        {can("create") && (
          <CommonButton label="+ Create Room" handler={() => setOpenModal(true)} />
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
          placeholder="Search room name"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

        {/* Show branch filter only for super-admin */}
        {role === "super-admin" && (
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
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

        {/* STATUS FILTER */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="under-maintenance">Under Maintenance</option>
          <option value="disabled">Disabled</option>
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
      <div className="bg-white border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Room Name</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <RoomSkeleton />
            ) : paginatedRooms?.length ? (
              paginatedRooms.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{r.roomName}</td>
                  <td className="p-3">
                    {r.branch ? (
                      <span>
                        {r.branch.city} ({r.branch.state})
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="p-3">{getStatusBadge(r.status)}</td>
                  <td className="p-3 relative">
                    <button
                      onClick={() =>
                        setOpenAction(openAction === r._id ? null : r._id)
                      }
                      className="p-1.5 text-xl hover:bg-gray-200 rounded"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === r._id && (
                      <div
                        ref={domNode}
                        className="absolute right-16 top-4 bg-white border rounded shadow z-20"
                      >
                        {can("edit") && (
                          <button
                            onClick={() => {
                              setEditRoom(r);
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
                              setDeleteId(r._id);
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
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No rooms found
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
            {Math.min(currentPage * itemsPerPage, filteredRooms?.length)} of{" "}
            {filteredRooms?.length} rooms
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
        <CreateRoomModal
          editData={editRoom}
          branches={branches}
          onSuccess={fetchRooms}
          onClose={() => {
            setOpenModal(false);
            setEditRoom(null);
          }}
        />
      )}

      {/* DELETE MODAL */}
      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Room"
        description="Are you sure you want to delete this room?"
        confirmText="Delete Room"
      />
    </div>
  );
};

export default Room;