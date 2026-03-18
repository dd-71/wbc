import React, { useEffect, useState } from "react";
import { MdClose, MdHistory } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const ViewUserModal = ({ user, onClose, viewModal }) => {
  const [animate, setAnimate] = useState(false);
  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    if (viewModal) setTimeout(() => setAnimate(true), 10);
  }, [viewModal]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  // console.log(user)

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
      bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={domNode}
        className={`w-full max-w-2xl mx-4 bg-white rounded-tl-3xl rounded-br-3xl shadow-xl
        transition-all duration-300 max-h-[90vh] flex flex-col
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdHistory className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                User Details
              </h2>
              <p className="text-xs text-gray-100">
                View user information and branch history
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 bg-white rounded-full hover:bg-gray-200 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* USER INFO CARD */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <img
              src={user?.profilePicture || "https://i.pravatar.cc/40"}
              alt={user?.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">
                {user?.fullName}
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {user?.role?.roleName}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  {user?.branch?.city || "No branch assigned"}
                </span>
              </div>
            </div>
          </div>

          {/* PERMISSIONS SECTION */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Assigned Permissions
            </h3>

            <div className="space-y-4 border capitalize rounded-lg p-4 text-sm bg-slate-50">
              {user?.permissions?.permissions?.length > 0 ? (
                user.permissions.permissions.map((component, cIdx) => (
                  component.visible && (
                    <div
                      key={cIdx}
                      className="border rounded-md p-3 bg-white"
                    >
                      {/* COMPONENT NAME */}
                      <div className="font-semibold text-gray-800">
                        {component.componentName}
                      </div>

                      {/* COMPONENT ACTIONS */}
                      {component.actions?.some(a => a.allowed) && (
                        <div className="ml-4 mt-2 flex flex-wrap gap-2">
                          {component.actions
                            .filter(a => a.allowed)
                            .map((action, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                              >
                                {action.actionName}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* SUB COMPONENTS */}
                      {component.subComponents
                        ?.filter(sub => sub.visible)
                        .map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            className="ml-4 mt-3 p-3 border rounded-md bg-slate-50"
                          >
                            {/* SUB COMPONENT NAME */}
                            <div className="font-medium text-gray-700">
                              {sub.subComponentName}
                            </div>

                            {/* SUB ACTIONS */}
                            {sub.actions?.some(a => a.allowed) && (
                              <div className="ml-4 mt-2 flex flex-wrap gap-2">
                                {sub.actions
                                  .filter(a => a.allowed)
                                  .map((action, aIdx) => (
                                    <span
                                      key={aIdx}
                                      className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"
                                    >
                                      {action.actionName}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )
                ))
              ) : (
                <p className="text-gray-500 text-center py-6">
                  No permissions assigned
                </p>
              )}
            </div>
          </div>


          {/* BRANCH HISTORY SECTION */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Branch History
            </h3>

            <div className="border rounded-lg overflow-hidden">
              {/* Table wrapper with max height and scroll */}
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-700">
                        Branch
                      </th>
                      <th className="p-3 text-center font-medium text-gray-700 hidden sm:table-cell">
                        Assigned
                      </th>
                      <th className="p-3 text-center font-medium text-gray-700 hidden sm:table-cell">
                        Removed
                      </th>
                      <th className="p-3 text-center font-medium text-gray-700">
                        Days
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {user?.branchHistory?.length > 0 ? (
                      user.branchHistory.map((b, i) => (
                        <tr
                          key={i}
                          className="border-t hover:bg-slate-50 transition"
                        >
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-gray-800">
                                {b.branch?.city || "N/A"}
                              </div>
                              {/* Mobile view: show dates below branch name */}
                              <div className="sm:hidden text-xs text-gray-500 mt-1">
                                {new Date(b.assignedAt).toLocaleDateString()}
                                {" → "}
                                {b.removedAt
                                  ? new Date(b.removedAt).toLocaleDateString()
                                  : "Active"}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center hidden sm:table-cell">
                            {new Date(b.assignedAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-center hidden sm:table-cell">
                            {b.removedAt ? (
                              new Date(b.removedAt).toLocaleDateString()
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center font-medium">
                            {b.workedDays}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-8 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <MdHistory size={32} className="text-gray-300" />
                            <p>No branch history available</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end items-center px-6 py-4 border-t bg-white rounded-b-2xl flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 flex items-center gap-1 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;