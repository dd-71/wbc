import React, { useEffect, useMemo, useState } from "react";
import { MdMoreVert, MdEdit, MdDelete, MdVisibility, MdPersonAdd } from "react-icons/md";
import { FaMoneyBillWave } from "react-icons/fa";
import CommonButton from "../../components/common/CommonButton";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import axios from "axios";
import toast from "react-hot-toast";
import { usePermission } from "../../components/Hooks/usePermissions";
import { useAuth } from "../../context/AuthProvider";
import CreateLeadModal from "../../components/AdminSideComponents/LeadManagement/CreateLeadModal";
import ViewLeadModal from "../../components/AdminSideComponents/LeadManagement/ViewLeadModal";
import AddPaymentModal from "../../components/AdminSideComponents/LeadManagement/AddPaymentModal";
import ConvertToStudentModal from "../../components/AdminSideComponents/LeadManagement/ConvertToStudentModal";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { useLockBodyScroll } from "../../components/Hooks/useLockBodyScroll";

const LeadSkeleton = () => {
  return [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));
};

const Lead = () => {
  const { branches, user } = useAuth();
  const [createModal, setCreateModal] = useState(false);
  const domNode = useClickOutside(() => setOpenAction(null));
  const [leads, setLeads] = useState(null);
  const [loading, setLoading] = useState(true);

  // action states
  const [openAction, setOpenAction] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showViewLead, setShowViewLead] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showConvertStudent, setShowConvertStudent] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* SEARCH & FILTER */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Hook to find permission action
  const { can } = usePermission();
  useLockBodyScroll(createModal || editLead || showViewLead || showAddPayment || showDelete || showConvertStudent)

  /* ================= FILTERED DATA ================= */
  const filteredLeads = useMemo(() => {
    return leads?.filter((lead) => {
      const matchSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.phoneNumber.includes(search) ||
        lead.email?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "" || lead.status === statusFilter;

      const matchBranch = branchFilter === "" || lead.branch?._id === branchFilter;

      return matchSearch && matchStatus && matchBranch;
    });
  }, [leads, search, statusFilter, branchFilter]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filteredLeads?.length / itemsPerPage);

  const paginatedLeads = filteredLeads?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const shouldOpenUp = (index) => {
    const rowPosition = index + 1;
    const rowsOnPage = paginatedLeads?.length;
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

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/lead/get-all`,
        { withCredentials: true }
      );
      setLeads(response.data.data || []);
    } catch (error) {
      console.log(`Error while fetching leads`);
      toast.error(error.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/lead/delete/${selectedLead._id}`,
        { withCredentials: true }
      );
      toast.success(response.data.message || "Lead deleted successfully");
      fetchLeads();
      setShowDelete(false);
    } catch (error) {
      console.log(`Error while deleting lead`);
      toast.error(error.response?.data?.message || "Failed to delete lead");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700",
      interested: "bg-green-100 text-green-700",
      "partially interested": "bg-blue-100 text-blue-700",
      "not interested": "bg-red-100 text-red-700",
      converted: "bg-primaryColor/20 text-primaryColor",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || "bg-gray-100 text-gray-700"
          }`}
      >
        {status}
      </span>
    );
  };

  // console.log(paginatedLeads)

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">Lead Management</h1>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border rounded-md text-sm">Export</button>
          {can("create") && (
            <CommonButton
              handler={() => setCreateModal(true)}
              label="+ New Lead"
            />
          )}
        </div>
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
          placeholder="Search name, phone, email"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="interested">Interested</option>
          <option value="partially interested">Partially Interested</option>
          <option value="not interested">Not Interested</option>
          <option value="converted">Converted</option>
        </select>

        {user?.role?.roleName === "super-admin" && (
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
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">Created On</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <LeadSkeleton />
            ) : paginatedLeads?.length > 0 ? (
              paginatedLeads?.map((lead, index) => (
                <tr key={index} className="hover:bg-gray-50 duration-300">
                  <td
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowViewLead(true);
                    }}
                    className="">
                    <div className="p-3 cursor-pointer hover:text-primaryColor duration-300">
                      <div className="font-medium">{lead.name}</div>
                      {lead && (
                        <div className="text-xs text-primaryColor">
                          {lead.student ? "(WBC student)" : "Lead"}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-3">{lead.phoneNumber}</td>

                  <td className="p-3">{lead.email || "—"}</td>

                  <td className="p-3 font-semibold uppercase">{getStatusBadge(lead.status)}</td>

                  <td className="p-3">{lead.branch?.city || "—"}</td>

                  <td className="p-3">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-right relative">
                    <button
                      onClick={() =>
                        setOpenAction(openAction === lead._id ? null : lead._id)
                      }
                      className="text-xl p-1.5 hover:bg-gray-200 duration-300 rounded-lg"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === lead._id && (
                      <div
                        ref={domNode}
                        className={`absolute text-xs right-10 z-20 bg-white border rounded-md shadow-lg w-44
                          ${shouldOpenUp(index) ? "bottom-8" : "top-8"}`}
                      >
                        {can("view") && (
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowViewLead(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 text-slate-600 flex items-center gap-2 hover:bg-gray-100"
                          >
                            <MdVisibility /> View Details
                          </button>
                        )}
                        {can("edit") && (
                          <button
                            onClick={() => {
                              setEditLead(lead);
                              setCreateModal(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex text-green-600 items-center gap-2 hover:bg-gray-100"
                          >
                            <MdEdit /> Edit
                          </button>
                        )}
                        {can("edit") && lead.student && (
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowAddPayment(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex items-center text-blue-600 gap-2 hover:bg-gray-100"
                          >
                            <FaMoneyBillWave /> Add Payment
                          </button>
                        )}
                        {can("edit") && !lead.student && (
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowConvertStudent(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 flex items-center text-primaryColor gap-2 hover:bg-gray-100"
                          >
                            <MdPersonAdd /> Convert to Student
                          </button>
                        )}
                        {can("delete") && (
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowDelete(true);
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
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No leads found
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
            {Math.min(currentPage * itemsPerPage, filteredLeads?.length)} of{" "}
            {filteredLeads?.length} leads
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

      {/* MODALS */}
      {createModal && (
        <CreateLeadModal
          onClose={() => {
            setCreateModal(false);
            setEditLead(null);
          }}
          addModal={createModal}
          onComplete={fetchLeads}
          editLead={editLead}
        />
      )}

      {showViewLead && selectedLead && (
        <ViewLeadModal
          lead={selectedLead}
          onClose={() => {
            setShowViewLead(false);
            setSelectedLead(null);
          }}
          addModal={showViewLead}
        />
      )}

      {showAddPayment && selectedLead && (
        <AddPaymentModal
          lead={selectedLead}
          onClose={() => {
            setShowAddPayment(false);
            setSelectedLead(null);
          }}
          addModal={showAddPayment}
          onSuccess={fetchLeads}
        />
      )}

      {showConvertStudent && selectedLead && (
        <ConvertToStudentModal
          lead={selectedLead}
          onClose={() => {
            setShowConvertStudent(false);
            setSelectedLead(null);
          }}
          addModal={showConvertStudent}
          onSuccess={fetchLeads}
        />
      )}

      {showDelete && selectedLead && (
        <DeleteAlertModal
          onClose={() => {
            setShowDelete(false);
            setSelectedLead(null);
          }}
          open={showDelete}
          onConfirm={handleDelete}
          loading={deleteLoading}
          title="Delete Lead"
          description="Are you sure you want to delete this lead? This action cannot be undone."
          confirmText="Delete Lead"
        />
      )}
    </div>
  );
};

export default Lead;