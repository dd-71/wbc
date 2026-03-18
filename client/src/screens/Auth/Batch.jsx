import React, { useEffect, useMemo, useState } from "react";
import { MdMoreVert, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import { CiSquarePlus } from "react-icons/ci";
import axios from "axios";
import toast from "react-hot-toast";

import CommonButton from "../../components/common/CommonButton";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import { useAuth } from "../../context/AuthProvider";
import { usePermission } from "../../components/Hooks/usePermissions";
import DeleteAlertModal from './../../components/common/DeleteAlertModal';
import ViewBatchModal from "../../components/AdminSideComponents/BatchManagement/ViewBatchModal";
import CreateBatchModal from "../../components/AdminSideComponents/BatchManagement/CreateBatchModal";
import { useLockBodyScroll } from "../../components/Hooks/useLockBodyScroll";
import UpdateBatchStatusModal from "../../components/AdminSideComponents/BatchManagement/UpdateBatchStatusModal";
import AddCourseToBatchModal from "../../components/AdminSideComponents/BatchManagement/AddCourseToBatchModal";
import { FiPlus, FiUploadCloud } from "react-icons/fi";
import { Link } from "react-router-dom";

const BatchSkeleton = () => {
  return [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-10 w-16 bg-gray-200 rounded" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));
};

const Batch = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAction, setOpenAction] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [viewBatch, setViewBatch] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [updateStatusModal, setUpdateStatusModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [addCourseModal, setAddCourseModal] = useState(false);


  const domNode = useClickOutside(() => setOpenAction(null));
  useLockBodyScroll(openCreate || openView || updateStatusModal || addCourseModal);

  const { role, branches } = useAuth();
  const { can } = usePermission();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params = {};
      if (branchFilter) params.branch = branchFilter;

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/batch/all/`,
        { params, withCredentials: true }
      );

      setBatches(data.data || []);
    } catch {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [branchFilter]);

  const filteredBatches = useMemo(() => {
    return batches.filter((b) =>
      b.batchName.toLowerCase().includes(search.toLowerCase())
    );
  }, [batches, search]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filteredBatches?.length / itemsPerPage);

  const paginatedBatches = filteredBatches?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const shouldOpenUp = (index) => {
    const rowPosition = index + 1;
    const rowsOnPage = paginatedBatches?.length;
    return rowPosition > rowsOnPage - 2;
  };

  // Smart pagination
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/batch/${deleteId}`,
        { withCredentials: true }
      );
      toast.success("Batch deleted");
      fetchBatches();
      setDeleteModal(false);
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setDeleting(false);
    }
  };
  // console.log(paginatedBatches)

  return (
    <div className="py-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">Batch Management</h1>
        {can("create") && (
          <CommonButton
            label="+ Create Batch"
            handler={() => setOpenCreate(true)}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search batch name"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

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
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.city}
              </option>
            ))}
          </select>
        )}

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

      <div className="bg-white border overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Banner</th>
              <th className="p-3 text-left">Batch</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">Dates</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <BatchSkeleton />
            ) : paginatedBatches?.length > 0 ? (
              paginatedBatches.map((b, index) => (
                <tr key={b._id} className="hover:bg-gray-50 duration-300">
                  <td className="p-3">
                    {b.batchBannerImage ? (
                      <img
                        src={b.batchBannerImage}
                        alt="banner"
                        className="w-16 h-10 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-16 h-10 flex items-center justify-center bg-gray-100 text-gray-400 rounded border">
                        —
                      </div>
                    )}
                  </td>

                  <td
                    // onClick={() => {
                    //   setViewBatch(b);
                    //   setOpenView(true);
                    // }}
                    className="font-medium capitalize text-gray-800">
                    <Link className="p-5 hover:text-primaryColor duration-300" to={`/batch/${b._id}`}>{b.batchName}</Link>
                  </td>

                  <td className="p-3">{b.branch?.city}</td>

                  <td className="p-3 text-xs text-gray-600">
                    {new Date(b.startDate).toLocaleDateString()} →{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${b.status === "active"
                        ? "bg-green-100 text-green-700"
                        : b.status === "upcoming"
                          ? "bg-blue-100 text-blue-700"
                          : b.status === "inactive"
                            ? "bg-gray-200 text-gray-700"
                            : b.status === "rescheduled"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="p-3 text-left relative">
                    <button
                      onClick={() =>
                        setOpenAction(openAction === b._id ? null : b._id)
                      }
                      className="text-xl p-1.5 hover:bg-gray-200 duration-300 rounded-lg"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === b._id && (
                      <div
                        ref={domNode}
                        className={`absolute text-xs -translate-x-32 z-20 bg-white border rounded-md shadow-lg w-36
                          ${shouldOpenUp(index) ? "bottom-9 left-0" : "top-8"}`}
                      >
                        {can("view") && (
                          <button
                            onClick={() => {
                              setViewBatch(b);
                              setOpenView(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 text-slate-600 flex items-center gap-2 hover:bg-gray-100"
                          >
                            <MdVisibility /> View
                          </button>
                        )}
                        {can("edit") && (
                          <button
                            onClick={() => {
                              setEditBatch(b);
                              setOpenCreate(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex text-green-600 items-center gap-2 hover:bg-gray-100"
                          >
                            <MdEdit /> Edit
                          </button>
                        )}
                        {can("edit") && (
                          <button
                            onClick={() => {
                              setViewBatch(b);
                              setAddCourseModal(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                          >
                            <FiPlus size={15} /> Add Courses
                          </button>
                        )}

                        {can("edit") && (
                          <button
                            onClick={() => {
                              setSelectedBatch(b);
                              setUpdateStatusModal(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                          >
                            <FiUploadCloud /> Update Status
                          </button>
                        )}

                        {can("delete") && (
                          <button
                            onClick={() => {
                              setDeleteId(b._id);
                              setDeleteModal(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
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
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No batches found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredBatches?.length)} of{" "}
            {filteredBatches?.length} batches
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

      {openCreate && (
        <CreateBatchModal
          editData={editBatch}
          branches={branches}
          onSuccess={fetchBatches}
          onClose={() => {
            setOpenCreate(false);
            setEditBatch(null);
          }}
        />
      )}

      {openView && (
        <ViewBatchModal
          data={viewBatch}
          onClose={() => {
            setOpenView(false);
            setViewBatch(null);
          }}
        />
      )}

      {addCourseModal && viewBatch && (
        <AddCourseToBatchModal
          batchId={viewBatch._id}
          branchId={viewBatch.branch?._id}
          onClose={() => setAddCourseModal(false)}
          onSuccess={fetchBatches}
        />
      )}


      {updateStatusModal && selectedBatch && (
        <UpdateBatchStatusModal
          batch={selectedBatch}
          onClose={() => {
            setUpdateStatusModal(false);
            setSelectedBatch(null);
          }}
          onSuccess={fetchBatches}
        />
      )}


      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Batch"
        description="Are you sure you want to delete this batch?"
        confirmText="Delete Batch"
      />
    </div>
  );
};

export default Batch;