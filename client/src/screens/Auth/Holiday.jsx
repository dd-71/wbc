import React, { useEffect, useMemo, useState } from "react";
import { MdDelete, MdEdit, MdMoreVert } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

import CommonButton from "../../components/common/CommonButton";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import CreateHolidayModal from './../../components/AdminSideComponents/HolidayManagement/CreateHolidayModal';
import { useAuth } from "../../context/AuthProvider";
import { usePermission } from "../../components/Hooks/usePermissions";

const HolidaySkeleton = () => {
  return [...Array(10)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));
};

const Holiday = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAction, setOpenAction] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editHoliday, setEditHoliday] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const domNode = useClickOutside(() => setOpenAction(null));

  const { role, branches, user } = useAuth();
  const { can } = usePermission()

  /* SEARCH & FILTER */
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const params = {};
      if (branchFilter) params.branch = branchFilter;

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/holiday/get-all/`,
        { params, withCredentials: true }
      );
      setHolidays(data.data || []);
    } catch {
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [branchFilter]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/holiday/${deleteId}`,
        { withCredentials: true }
      );
      toast.success("Holiday deleted");
      fetchHolidays();
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= FILTERED DATA ================= */
  const filteredHolidays = useMemo(() => {
    return holidays?.filter((holiday) => {
      const matchSearch = holiday.title.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [holidays, search]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filteredHolidays?.length / itemsPerPage);

  const paginatedHolidays = filteredHolidays?.slice(
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

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">
          Holiday Management
        </h1>
        {can("create") &&
          <CommonButton label="+ Create Holiday" handler={() => setOpenModal(true)} />
        }
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
          placeholder="Search holiday title"
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
            <option value="">All Branches (including Global)</option>
            {branches?.map((b) => (
              <option key={b._id} value={b._id}>
                {b.city}
              </option>
            ))}
          </select>
        )}

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
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <HolidaySkeleton />
            ) : paginatedHolidays?.length ? (
              paginatedHolidays.map((h) => (
                <tr key={h._id} className="hover:bg-gray-50">
                  <td className="p-3">
                    {new Date(h.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">{h.title}</td>
                  <td className="p-3">
                    {h.branch ? (
                      <span>
                        {h.branch.city} ({h.branch.state})
                      </span>
                    ) : (
                      "Global"
                    )}
                  </td>
                  <td className="p-3 relative">
                    <button
                      onClick={() =>
                        setOpenAction(openAction === h._id ? null : h._id)
                      }
                      className="p-1.5 text-xl hover:bg-gray-200 rounded"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === h._id && (
                      <div
                        ref={domNode}
                        className="absolute right-20 top-4 bg-white border rounded shadow z-20"
                      >
                        {can("edit") &&
                          <button
                            onClick={() => {
                              setEditHoliday(h);
                              setOpenModal(true);
                              setOpenAction(null);
                            }}
                            className="px-3 py-2 flex gap-2 w-full hover:bg-gray-100"
                          >
                            <MdEdit /> Edit
                          </button>
                        }

                        {can("delete") &&
                          <button
                            onClick={() => {
                              setDeleteId(h._id);
                              setDeleteModal(true);
                              setOpenAction(null);
                            }}
                            className="px-3 py-2 flex gap-2 text-red-600 hover:bg-red-50"
                          >
                            <MdDelete /> Delete
                          </button>
                        }
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No holidays found
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
            {Math.min(currentPage * itemsPerPage, filteredHolidays?.length)} of{" "}
            {filteredHolidays?.length} holidays
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
        <CreateHolidayModal
          editData={editHoliday}
          branches={branches}
          onSuccess={fetchHolidays}
          onClose={() => {
            setOpenModal(false);
            setEditHoliday(null);
          }}
        />
      )}

      {/* DELETE MODAL */}
      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Holiday"
        description="Are you sure you want to delete this holiday?"
        confirmText="Delete Holiday"
      />
    </div>
  );
};

export default Holiday;