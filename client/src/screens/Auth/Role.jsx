import React, { useEffect, useMemo, useState } from "react";
import CreateRoleModal from "../../components/AdminSideComponents/RoleManagement/CreateRoleModal";
import { MdDelete, MdEdit, MdMoreVert } from "react-icons/md";
import CommonButton from "../../components/common/CommonButton";
import { useClickOutside } from "../../components/Hooks/useClickOutSide";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import DeleteAlertModal from './../../components/common/DeleteAlertModal';
import { usePermission } from "../../components/Hooks/usePermissions";


const RoleSkeleton = () =>
  [...Array(10)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-8" /></td>
    </tr>
  ));


const Role = () => {
  const [openModal, setOpenModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAction, setOpenAction] = useState(null);
  const [editRole, setEditRole] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const domNode = useClickOutside(() => setOpenAction(null));
  const { can } = usePermission()

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;


  const getRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/role/get-all`,
        { withCredentials: true }
      );
      // console.log(res.data.data)
      setRoles(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/role/${deleteId}`,
        { withCredentials: true }
      );
      toast.success("Role deleted");
      getRoles();
      setDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    getRoles();
  }, []);


  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        role?.roleName?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "" || role.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [roles, search, statusFilter]);


  const totalPages = Math.ceil(filteredRoles.length / pageSize);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  // console.log(paginatedRoles)

  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">
          Role Management
        </h1>

        <CommonButton handler={() => setOpenModal(true)} label={'+ create role'} />
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search role name or code"
          className="px-3 focus:ring-1 ring-primaryColor outline-none py-2 border rounded-md text-sm w-64"
        />

        {/* <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 focus:ring-1 ring-primaryColor outline-none border rounded-md text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select> */}
      </div>

      {/* TABLE */}
      <div className="bg-white border overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Role Name</th>
              {/* <th className="p-3 text-left">Status</th> */}
              <th className="p-3 text-left">Created On</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <RoleSkeleton />
            ) : paginatedRoles.length > 0 ? (
              paginatedRoles.map((role) => (
                <tr key={role._id} className="hover:bg-gray-50">
                  <td className="p-3">{role.roleName}</td>
                  {/* <td className="p-3 text-gray-600">{role.code}</td> */}
                  {/* <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs
                        ${role.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                        }`}
                    >
                      {role.status}
                    </span>
                  </td> */}
                  <td className="p-3">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-left relative">
                    <button
                      onClick={() =>
                        setOpenAction(openAction === role._id ? null : role._id)
                      }
                      className="text-xl p-1.5 hover:bg-gray-200 rounded-lg"
                    >
                      <MdMoreVert />
                    </button>

                    {openAction === role._id && (
                      <div
                        ref={domNode}
                        className="absolute left-[15%] top-4 z-50 bg-white border rounded-md shadow-lg w-30"
                      >
                        {can("edit") &&
                          <button
                            onClick={() => {
                              setEditRole(role);
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
                              setDeleteId(role._id);
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
                  No roles found
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

      {/* MODAL */}
      {openModal && (
        <CreateRoleModal
          addModal
          editData={editRole}
          onSuccess={getRoles}
          onClose={() => {
            setOpenModal(false);
            setEditRole(null);
          }}
        />
      )}

      {/* Delete alert */}
      <DeleteAlertModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Role"
        description="Are you sure you want to delete this role? Users assigned to this role may be affected."
        confirmText="Delete Role"
      />

    </div>
  );
};

export default Role;
