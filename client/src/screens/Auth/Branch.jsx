import React, { useEffect, useMemo, useState } from "react";
import CreateBranchModal from "../../components/AdminSideComponents/BranchManagement/CreateBranchModal";
import { MdDelete, MdEdit, MdMoreVert } from "react-icons/md";
import { LuGitBranchPlus } from "react-icons/lu";
import CommonButton from "../../components/common/CommonButton";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import { usePermission } from "../../components/Hooks/usePermissions";
import PageHeader from "../../components/common/PageHeader";

const BranchSkeleton = () => {
  return [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
    </tr>
  ));
};


const Branch = () => {
  const { can } = usePermission()
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAction, setOpenAction] = useState(null);
  const [editBranch, setEditBranch] = useState(null);
  const [openModal, setOpenModal] = useState(false)

  const domNode = useClickOutside(() => setOpenAction(null));

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);



  const getBranches = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/branch/get/`, { withCredentials: true });
      // console.log(data)
      setBranches(data.data || []);
    } catch (err) {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/branch/${deleteId}`,
        { withCredentials: true }
      );
      toast.success("Branch deleted");
      getBranches();
      setDeleteModal(false);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    getBranches();
  }, []);


  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        b.state?.includes(search.toLowerCase()) ||
        b.dist?.includes(search.toLowerCase()) ||
        b.city?.includes(search.toLowerCase());

      const matchesState =
        stateFilter === "" || b.state === stateFilter;

      return matchesSearch && matchesState;
    });
  }, [branches, search, stateFilter]);

  const totalPages = Math.ceil(filteredBranches.length / pageSize);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // console.log(paginatedBranches)

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <PageHeader icon={LuGitBranchPlus} title="Branch Management" subtitle="Manage branches and their details" />

        <CommonButton handler={() => setOpenModal(true)} label={'+ create branch'} />
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search state, district, city"
          className="px-3 py-2 border rounded-md text-sm w-64 focus:ring-1 ring-primaryColor outline-none"
        />

        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm focus:ring-1 ring-primaryColor outline-none"
        >
          <option value="">All States</option>
          <option value="odisha">Odisha</option>
          <option value="maharashtra">Maharashtra</option>
          <option value="karnataka">Karnataka</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">State</th>
              <th className="p-3 text-left">District</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Created On</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <BranchSkeleton />
            ) : paginatedBranches.length > 0 ? (
              paginatedBranches.map((b, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3 capitalize">{b.state}</td>
                  <td className="p-3 capitalize">{b.dist}</td>
                  <td className="p-3 capitalize">{b.city}</td>
                  <td className="p-3">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-left relative">
                    <button
                      onClick={() => setOpenAction(openAction === b._id ? null : b._id)}
                      className="text-xl p-1.5 hover:bg-gray-200 rounded-lg"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === b._id && (
                      <div
                        ref={domNode}
                        className="absolute right-14 top-4 z-20 bg-white border rounded-md shadow-lg w-30"
                      >

                        {can("edit") &&
                          <button
                            onClick={() => {
                              setEditBranch(b);
                              setOpenModal(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100"
                          >
                            <MdEdit /> Edit
                          </button>
                        }

                        {can("delete") &&
                          <button
                            onClick={() => {
                              setDeleteId(b._id);
                              setDeleteModal(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-3 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50"
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
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No branches found
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
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded
                ${currentPage === i + 1
                    ? "bg-primaryColor text-white"
                    : "hover:bg-gray-100"}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create & Update modal */}
      {openModal && (
        <CreateBranchModal
          addModal
          editData={editBranch}
          onSuccess={getBranches}
          onClose={() => {
            setOpenModal(false);
            setEditBranch(null);
          }}
        />
      )}

      {/* Delete Modal */}
      <DeleteAlertModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? All related mappings will be affected."
        confirmText="Delete Branch"
      />
    </div>
  );
};

export default Branch;
