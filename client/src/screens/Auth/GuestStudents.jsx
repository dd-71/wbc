import React, { useEffect, useMemo, useState } from "react";
import {
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdDownload,
  MdSearch,
  MdFilterList,
  MdPeople,
  MdPersonAdd,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdIndeterminateCheckBox,
} from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import { usePermission } from "../../components/Hooks/usePermissions";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import ViewGuestModal from "../../components/AdminSideComponents/GuestStudents/ViewGuestModal";
import UpdateGuestStatusModal from "../../components/AdminSideComponents/GuestStudents/UpdateGuestStatusModal";
import PageHeader from "../../components/common/PageHeader";

/* ─── skeleton ─────────────────────────────────────────────── */
const GuestSkeleton = () =>
  [...Array(6)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-8" /></td>
    </tr>
  ));

/* ─── status badge ─────────────────────────────────────────── */
const STATUS_META = {
  new: { label: "New", color: "text-blue-600", bg: "bg-blue-50" },
  "follow-up": { label: "Follow Up", color: "text-amber-600", bg: "bg-amber-50" },
  converted: { label: "Converted", color: "text-emerald-600", bg: "bg-emerald-50" },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.new;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${m.color} ${m.bg}`}>
      {m.label}
    </span>
  );
};

/* ─── checkbox component ───────────────────────────────────── */
const Checkbox = ({ checked, indeterminate, onChange }) => {
  const Icon = indeterminate
    ? MdIndeterminateCheckBox
    : checked
      ? MdCheckBox
      : MdCheckBoxOutlineBlank;
  return (
    <button
      type="button"
      onClick={onChange}
      className={`text-xl transition ${checked || indeterminate ? "text-primaryColor" : "text-slate-300 hover:text-slate-400"
        }`}
    >
      <Icon />
    </button>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
const GuestStudents = () => {
  const { can } = usePermission();
  const domNode = useClickOutside(() => setOpenAction(null));

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAction, setOpenAction] = useState(null);
  const [selected, setSelected] = useState([]);   // array of _ids

  /* filters */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* modals */
  const [viewModal, setViewModal] = useState(false);
  const [viewGuest, setViewGuest] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [statusGuest, setStatusGuest] = useState(null);  // single guest or null (bulk)
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);  // single id or null (bulk)
  const [deleting, setDeleting] = useState(false);

  /* ── fetch ── */
  const fetchGuests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/guest/`,
        { params, withCredentials: true }
      );
      setGuests(data.data || []);
      setSelected([]);
    } catch {
      toast.error("Failed to load guest students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGuests(); }, [statusFilter]);

  /* debounced search */
  useEffect(() => {
    const t = setTimeout(fetchGuests, 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ── filtered & paginated ── */
  const filtered = useMemo(() => guests, [guests]);   // server already filters

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const pageIds = paginated.map((g) => g._id);

  /* ── selection helpers ── */
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const somePageSelected = pageIds.some((id) => selected.includes(id)) && !allPageSelected;

  const toggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAllData = () => setSelected(filtered.map((g) => g._id));
  const clearSelection = () => setSelected([]);

  /* ── delete ── */
  const handleDelete = async () => {
    const ids = deleteTarget ? [deleteTarget] : selected;
    try {
      setDeleting(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/guest/`, {
        data: { ids },
        withCredentials: true,
      });
      toast.success(`${ids.length} guest student${ids.length > 1 ? "s" : ""} deleted`);
      setDeleteModal(false);
      setDeleteTarget(null);
      setSelected([]);
      fetchGuests();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ── bulk status ── */
  const handleBulkStatusUpdate = async (status) => {
    const ids = statusGuest ? [statusGuest._id] : selected;
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/guest/status`,
        { ids, status },
        { withCredentials: true }
      );
      toast.success("Status updated");
      setStatusModal(false);
      setStatusGuest(null);
      fetchGuests();
    } catch {
      toast.error("Status update failed");
    }
  };

  /* ── export to Excel ── */
  const exportToExcel = () => {
    const toExport = selected.length
      ? filtered.filter((g) => selected.includes(g._id))
      : filtered;

    if (!toExport.length) {
      toast.error("No data to export");
      return;
    }

    const rows = toExport.map((g) => ({
      "Full Name": g.fullName,
      "Email": g.email,
      "Phone": g.phoneNumber,
      "College": g.collegeName,
      "Stream": g.stream,
      "Gender": g.gender,
      "Status": g.status,
      "Interested Courses": g.interestedCourses?.map((c) => c.courseName).join(", ") || "—",
      "Registered On": new Date(g.createdAt).toLocaleDateString("en-IN"),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    /* column widths */
    ws["!cols"] = [
      { wch: 22 }, { wch: 28 }, { wch: 14 }, { wch: 28 },
      { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guest Students");
    XLSX.writeFile(wb, `guest_students_${Date.now()}.xlsx`);
    toast.success(`Exported ${rows.length} record${rows.length > 1 ? "s" : ""}`);
  };

  /* ── shouldOpenUp for dropdown ── */
  const shouldOpenUp = (index) => {
    const pos = index + 1;
    return pos > paginated.length - 2;
  };

  /* ── stats ── */
  const stats = useMemo(() => ({
    total: guests.length,
    new: guests.filter((g) => g.status === "new").length,
    followUp: guests.filter((g) => g.status === "follow-up").length,
    converted: guests.filter((g) => g.status === "converted").length,
  }), [guests]);

  /* ── smart pagination ── */
  const getPageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++)
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="py-5">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <PageHeader icon={MdPeople} title="Guest Students" subtitle="Students registered via the app" />

        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-primaryColor via-[#617cf5] to-primaryFadedColor text-white text-sm font-medium rounded-lg hover:opacity-90 transition shadow-sm"
        >
          <MdDownload size={18} />
          Export {selected.length ? `(${selected.length})` : "Excel"}
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total", val: stats.total, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "New", val: stats.new, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Follow Up", val: stats.followUp, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Converted", val: stats.converted, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`rounded-xl border border-slate-200 ${bg} px-4 py-3`}>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search name, email, phone..."
            className="pl-9 pr-4 py-2 border rounded-md text-sm w-64 focus:ring-1 ring-primaryColor outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="follow-up">Follow Up</option>
          <option value="converted">Converted</option>
        </select>

        {/* items per page */}
        <select
          value={itemsPerPage}
          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="ml-auto px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* ── BULK ACTION BAR ── */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 bg-primaryColor/5 border border-primaryColor/20 rounded-lg text-sm flex-wrap">
          <span className="font-medium text-primaryColor">
            {selected.length} selected
          </span>
          <button
            onClick={selectAllData}
            className="text-xs text-slate-500 hover:text-primaryColor underline underline-offset-2"
          >
            Select all {filtered.length}
          </button>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button
              onClick={() => { setStatusGuest(null); setStatusModal(true); }}
              className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition border border-amber-200"
            >
              Update Status
            </button>
            {can("delete") && (
              <button
                onClick={() => { setDeleteTarget(null); setDeleteModal(true); }}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200"
              >
                Delete Selected
              </button>
            )}
            <button
              onClick={clearSelection}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="bg-white border overflow-visible rounded-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 w-10">
                <Checkbox
                  checked={allPageSelected}
                  indeterminate={somePageSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">College</th>
              <th className="p-3 text-left">Stream</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Registered</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <GuestSkeleton />
            ) : paginated.length > 0 ? (
              paginated.map((g, index) => (
                <tr
                  key={g._id}
                  className={`hover:bg-gray-50 duration-200 ${selected.includes(g._id) ? "bg-primaryColor/5" : ""
                    }`}
                >
                  {/* checkbox */}
                  <td className="p-3 w-10">
                    <Checkbox
                      checked={selected.includes(g._id)}
                      onChange={() => toggleOne(g._id)}
                    />
                  </td>

                  {/* name */}
                  <td
                    className="p-3 font-medium text-gray-800 hover:text-primaryColor cursor-pointer capitalize"
                    onClick={() => { setViewGuest(g); setViewModal(true); }}
                  >
                    {g.fullName}
                  </td>

                  {/* email */}
                  <td className="p-3 text-gray-500">{g.email}</td>

                  {/* phone */}
                  <td className="p-3">{g.phoneNumber}</td>

                  {/* college */}
                  <td className="p-3 text-gray-600 max-w-[160px] truncate" title={g.collegeName}>
                    {g.collegeName}
                  </td>

                  {/* stream */}
                  <td className="p-3 text-gray-500 capitalize">{g.stream}</td>

                  {/* status */}
                  <td
                    className="p-3 cursor-pointer"
                    title="Click to change status"
                    onClick={() => {
                      if (can("edit")) { setStatusGuest(g); setStatusModal(true); }
                    }}
                  >
                    <StatusBadge status={g.status} />
                  </td>

                  {/* registered */}
                  <td className="p-3 text-gray-400 text-xs">
                    {new Date(g.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>

                  {/* action */}
                  <td className="p-3 relative">
                    <button
                      onClick={() => setOpenAction(openAction === g._id ? null : g._id)}
                      className="text-xl p-1.5 hover:bg-gray-200 duration-300 rounded-lg"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === g._id && (
                      <div
                        ref={domNode}
                        className={`absolute text-xs -translate-x-32 z-20 bg-white border rounded-md shadow-lg w-32 ${shouldOpenUp(index) ? "bottom-8" : "top-8"
                          }`}
                      >
                        <button
                          onClick={() => { setViewGuest(g); setViewModal(true); setOpenAction(null); }}
                          className="w-full px-3 py-2 text-slate-600 flex items-center gap-2 hover:bg-gray-100 text-left"
                        >
                          <MdPeople size={14} /> View
                        </button>
                        {can("edit") && (
                          <button
                            onClick={() => { setStatusGuest(g); setStatusModal(true); setOpenAction(null); }}
                            className="w-full px-3 py-2 text-green-600 flex items-center gap-2 hover:bg-gray-100 text-left"
                          >
                            <MdEdit size={14} /> Status
                          </button>
                        )}
                        {can("delete") && (
                          <button
                            onClick={() => { setDeleteTarget(g._id); setDeleteModal(true); setOpenAction(null); }}
                            className="w-full px-3 py-2 text-red-600 flex items-center gap-2 hover:bg-red-50 text-left"
                          >
                            <MdDelete size={14} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-10 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <MdPersonAdd size={32} className="text-gray-200" />
                    <p>No guest students found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
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
      {viewModal && viewGuest && (
        <ViewGuestModal
          guest={viewGuest}
          onClose={() => { setViewModal(false); setViewGuest(null); }}
        />
      )}

      {statusModal && (
        <UpdateGuestStatusModal
          guest={statusGuest}               // null = bulk
          bulkCount={!statusGuest ? selected.length : 0}
          onClose={() => { setStatusModal(false); setStatusGuest(null); }}
          onConfirm={handleBulkStatusUpdate}
        />
      )}

      <DeleteAlertModal
        open={deleteModal}
        onClose={() => { setDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete Guest Student${selected.length > 1 ? "s" : ""}`}
        description={
          deleteTarget
            ? "Are you sure you want to delete this guest student?"
            : `Are you sure you want to delete ${selected.length} selected guest student(s)?`
        }
        confirmText="Delete"
      />
    </div>
  );
};

export default GuestStudents;