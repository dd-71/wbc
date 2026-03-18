import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaChalkboardTeacher } from "react-icons/fa";
import { LuGitBranch } from "react-icons/lu";
import { MdAdminPanelSettings, MdDelete, MdEdit, MdMoreVert, MdVisibility } from "react-icons/md";
import AddAdminModal from "../../components/AdminSideComponents/UserManagement/AddAdminModal";
import AssignBranchModal from "../../components/AdminSideComponents/UserManagement/AssignBranchModal";
import ViewUserModal from "../../components/AdminSideComponents/UserManagement/ViewUserModal";
import CommonButton from "../../components/common/CommonButton";
import DeleteAlertModal from "../../components/common/DeleteAlertModal";
import ManagePermissionModal from "../../components/common/Modals/ManagePermissionModal";
import PageHeader from "../../components/common/PageHeader";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import { usePermission } from "../../components/Hooks/usePermissions";
import { useAuth } from "../../context/AuthProvider";
import { useLockBodyScroll } from './../../components/Hooks/useLockBodyScroll';

const TutorSkeleton = () => {
  return [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="bg-gray-200 h-9 w-9 rounded-full" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
    </tr>
  ));
};

const TutorManagement = () => {
  const { branches, isSuperAdmin } = useAuth();
  const [addModal, setAddModal] = useState(false);
  const domNode = useClickOutside(() => setOpenAction(null));
  const [tutors, setTutors] = useState(null);
  const [loading, setLoading] = useState(true);

  // action states
  const [openAction, setOpenAction] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showAssignBranch, setShowAssignBranch] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);


  /* SEARCH & FILTER */
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Hook to find permission action
  const { can } = usePermission();
  useLockBodyScroll(addModal)

  /* ================= FILTERED DATA ================= */
  const filteredTutors = useMemo(() => {
    return tutors?.filter((tutor) => {
      const matchSearch =
        tutor.fullName.toLowerCase().includes(search.toLowerCase()) ||
        tutor.phoneNumber.includes(search);

      const matchBranch =
        branchFilter === "" || tutor.branch?._id === branchFilter;

      return matchSearch && matchBranch;
    });
  }, [tutors, search, branchFilter]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filteredTutors?.length / itemsPerPage);

  const paginatedTutors = filteredTutors?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const shouldOpenUp = (index) => {
    const rowPosition = index + 1;
    const rowsOnPage = paginatedTutors?.length;
    return rowPosition > rowsOnPage - 2;
  };

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/get-all-users`,
        { withCredentials: true }
      );
      // Filter only tutors from the response
      const tutorData = response.data.data?.filter(
        (user) => user.role?.roleName === "tutor"
      );
      setTutors(tutorData || []);
    } catch (error) {
      console.log(`Error while fetching tutors`);
      toast.error(error.response?.data?.message || "Failed to fetch tutors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/users/${selectedUser._id}`,
        { withCredentials: true }
      );
      toast.success(response.data.message);
      fetchTutors();
      setShowDelete(false);
    } catch (error) {
      console.log(`Error while deleting user`);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <PageHeader icon={FaChalkboardTeacher} title="Tutor Management" subtitle="Manage tutors and their details" />

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border rounded-md text-sm">
            Export
          </button>
          {can("create") && (
            <CommonButton
              handler={() => setAddModal(true)}
              label="+ New Tutor"
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
          placeholder="Search name, phone"
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm w-64"
        />

        {isSuperAdmin && (
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
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Last Activity</th>
              <th className="p-3 text-left">Created On</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <TutorSkeleton />
            ) : paginatedTutors?.length > 0 ? (
              paginatedTutors?.map((tutor, index) => (
                <tr key={index} className="hover:bg-gray-50 duration-300">
                  <td
                    title="view details"
                    onClick={() => {
                      setSelectedUser(tutor);
                      setShowViewUser(true);
                    }}
                    className="p-3 flex items-center gap-2 hover:text-primaryColor duration-300 cursor-pointer">
                    <img
                      src={tutor.profilePicture || "https://i.pravatar.cc/40"}
                      alt="profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{tutor.fullName}</span>
                  </td>

                  <td className="p-3">{tutor.phoneNumber}</td>

                  <td className="p-3">
                    {tutor.branch ? tutor.branch.city : "—"}
                  </td>

                  <td className="p-3">{tutor.role?.roleName || "Tutor"}</td>

                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                      Active
                    </span>
                  </td>

                  <td className="p-3">
                    {new Date(tutor.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-right relative">
                    <button
                      onClick={() =>
                        setOpenAction(
                          openAction === tutor._id ? null : tutor._id
                        )
                      }
                      className="text-xl p-1.5 hover:bg-gray-200 duration-300 rounded-lg"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === tutor._id && (
                      <div
                        ref={domNode}
                        className={`absolute text-xs right-10 z-20 bg-white border rounded-md shadow-lg w-32
                          ${shouldOpenUp(index) ? "bottom-8" : "top-8"}`}
                      >
                        {can("view") && (
                          <button
                            onClick={() => {
                              setSelectedUser(tutor);
                              setShowViewUser(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-2 py-1 text-slate-600 flex items-center gap-2 hover:bg-gray-100"
                          >
                            <MdVisibility /> View
                          </button>
                        )}
                        {can("edit") && (
                          <button
                            onClick={() => {
                              setEditUser(tutor);
                              setAddModal(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-2 py-1 flex text-green-600 items-center gap-2 hover:bg-gray-100"
                          >
                            <MdEdit /> Edit
                          </button>
                        )}
                        {can("edit") && (
                          <button
                            onClick={() => {
                              setSelectedUser(tutor);
                              setShowPermissionModal(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-2 py-1 flex items-center gap-2 text-purple-600 hover:bg-purple-50"
                          >
                            <MdAdminPanelSettings /> Permissions
                          </button>
                        )}
                        {can("edit") && (
                          <button
                            onClick={() => {
                              setSelectedUser(tutor);
                              setShowAssignBranch(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-2 py-1 flex items-center text-primaryColor gap-2 hover:bg-gray-100"
                          >
                            <LuGitBranch /> Assign Branch
                          </button>
                        )}
                        {can("delete") && (
                          <button
                            onClick={() => {
                              setSelectedUser(tutor);
                              setShowDelete(true);
                              setOpenAction(null);
                            }}
                            className="w-full px-2 py-1 flex items-center gap-2 text-red-600 hover:bg-red-50"
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
                  No tutors found
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
                    : "hover:bg-gray-100"
                  }`}
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

      {/* MODALS */}
      {addModal && (
        <AddAdminModal
          onClose={() => {
            setAddModal(false);
            setEditUser(null);
          }}
          addModal={addModal}
          onComplete={fetchTutors}
          editUser={editUser}
        />
      )}

      {showViewUser && selectedUser && (
        <ViewUserModal
          user={selectedUser}
          onClose={() => {
            setShowViewUser(false);
            setSelectedUser(null);
          }}
          viewModal={showViewUser}
        />
      )}

      {showPermissionModal && selectedUser && (
        <ManagePermissionModal
          user={selectedUser}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedUser(null);
          }}
          onSuccess={fetchTutors}
          showPermissionModal={showPermissionModal}
        />
      )}

      {showAssignBranch && selectedUser && (
        <AssignBranchModal
          user={selectedUser}
          onClose={() => {
            setShowAssignBranch(false);
            setSelectedUser(null);
          }}
          onSuccess={fetchTutors}
          addModal={showAssignBranch}
        />
      )}

      {showDelete && selectedUser && (
        <DeleteAlertModal
          onClose={() => {
            setShowDelete(false);
            setSelectedUser(null);
          }}
          open={showDelete}
          onConfirm={handleDelete}
          loading={deleteLoading}
          title="Delete Tutor"
          description="Are you sure you want to delete this tutor? All related mappings will be affected."
          confirmText="Delete Tutor"
        />
      )}
    </div>
  );
};

export default TutorManagement;