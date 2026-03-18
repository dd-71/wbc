import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdVisibility,
  MdVisibilityOff,
  MdAdminPanelSettings,
  MdFrontLoader,
} from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import axios from "axios";
import { useAuth } from "../../../context/AuthProvider";
import { buildPermissionTemplateFromCreator, mergeUserPermissions } from './../../../utils/buildPermissionTemplateFromCreator';
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";

const AddAdminModal = ({ onClose, addModal, onComplete, editUser }) => {
  const [animate, setAnimate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { roles } = useAuth() // getting role and branch from context


  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    gender: "",
  });

  // state for permissions template
  const [permissionTemplate, setPermissionTemplate] = useState([])
  // context
  const { permissions, user } = useAuth()

  const domNode = useClickOutside(() => handleClose());
  // console.log(permissions)
  // console.log(permissionTemplate)

  useEffect(() => {
    if (addModal) setTimeout(() => setAnimate(true), 10);
  }, [addModal]);

  useEffect(() => {
    if (!permissions || editUser) return;

    const template = buildPermissionTemplateFromCreator(permissions);
    setPermissionTemplate(template);
  }, [permissions, editUser]);

  // console.log(editUser)

  useEffect(() => {
    if (!permissions) return;

    if (editUser) {
      setFormData({
        fullName: editUser.fullName || "",
        username: editUser.username || "",
        email: editUser.email || "",
        phoneNumber: editUser.phoneNumber || "",
        password: "",
        role: editUser.role?._id || editUser.role || "",
        gender: editUser.gender || "",
        branch: editUser.branch?._id || null
      });
      const creatorTemplate = buildPermissionTemplateFromCreator(permissions);
      const merged = mergeUserPermissions(
        creatorTemplate,
        editUser.permissions.permissions
      );
      setPermissionTemplate(merged);

    }
  }, [permissions, editUser]);



  // console.log(permissionTemplate)

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // console.log(editUser)

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = { ...formData, permissions: permissionTemplate };

      const url = editUser
        ? `${process.env.REACT_APP_API_URL}/users/${editUser._id}`
        : `${process.env.REACT_APP_API_URL}/users/signup`;

      const method = editUser ? axios.put : axios.post;

      const response = await method(url, payload, { withCredentials: true });

      toast.success(response.data.message);
      onComplete();
      handleClose();
    } catch (err) {
      console.error("User save failed", err);
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };


  const toggleComponentVisibility = (cIdx) => {
    setPermissionTemplate((prev) =>
      prev.map((comp, i) =>
        i === cIdx
          ? {
            ...comp,
            visible: !comp.visible,
            actions: comp.actions.map((a) => ({
              ...a,
              allowed: !comp.visible ? a.allowed : false,
            })),
            subComponents: comp.subComponents.map((sub) => ({
              ...sub,
              visible: !comp.visible ? sub.visible : false,
              actions: sub.actions.map((a) => ({
                ...a,
                allowed: !comp.visible ? a.allowed : false,
              })),
            })),
          }
          : comp
      )
    );
  };


  const toggleComponentAction = (cIdx, aIdx) => {
    setPermissionTemplate((prev) =>
      prev.map((comp, i) =>
        i === cIdx
          ? {
            ...comp,
            actions: comp.actions.map((a, j) =>
              j === aIdx
                ? { ...a, allowed: !a.allowed }
                : a
            ),
          }
          : comp
      )
    );
  };


  const toggleSubVisibility = (cIdx, sIdx) => {
    setPermissionTemplate((prev) =>
      prev.map((comp, i) =>
        i === cIdx
          ? {
            ...comp,
            subComponents: comp.subComponents.map((sub, j) =>
              j === sIdx
                ? {
                  ...sub,
                  visible: !sub.visible,
                  actions: sub.actions.map((a) => ({
                    ...a,
                    allowed: !sub.visible ? a.allowed : false,
                  })),
                }
                : sub
            ),
          }
          : comp
      )
    );
  };



  const toggleSubAction = (cIdx, sIdx, aIdx) => {
    setPermissionTemplate((prev) =>
      prev.map((comp, i) =>
        i === cIdx
          ? {
            ...comp,
            subComponents: comp.subComponents.map((sub, j) =>
              j === sIdx
                ? {
                  ...sub,
                  actions: sub.actions.map((a, k) =>
                    k === aIdx ? { ...a, allowed: !a.allowed } : a
                  ),
                }
                : sub
            ),
          }
          : comp
      )
    );
  };

  return (
    <div
      className={`fixed overflow-y-auto py-10 inset-0 z-50 flex items-center justify-center
      bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={domNode}
        className={`w-full h-[100%] overflow-y-auto max-w-3xl bg-white rounded-tl-3xl rounded-br-3xl shadow-xl
        transition-all duration-300
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center sticky top-0 justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdAdminPanelSettings className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editUser ? "Update User" : "Create User"}
              </h2>

              <p className="text-xs text-gray-100">
                Create a new user account
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

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit} className="px-6 pt-6 space-y-6 text-sm">
          {/* BASIC INFO */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name *"
                className="w-full col-span-2 px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />

              <input
                required
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username *"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />


              <select
                required
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              >
                <option value="">Select Gender *</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>

              <input
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email *"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />

              <input
                required
                name="phoneNumber"
                type="tel"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number *"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              />

              {/* <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="col-span-2 w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.city}
                  </option>
                ))}
              </select> */}

            </div>
          </div>

          {/* SECURITY */}
          {!editUser && <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Security
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password *"
                  className="w-full px-3 py-2 pr-10 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>

              {/* ROLE DROPDOWN */}
              <select
                required
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryFadedColor outline-none"
              >
                {/* <option value="">Select Role *</option> */}
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
          </div>}

          {/* PERMISSIONS */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Assign Permissions *
            </h3>

            <div className="space-y-4 max-h-64 overflow-y-auto border rounded-lg p-4 text-gray-700">
              {permissionTemplate?.map((component, cIdx) => (
                <div key={cIdx} className="border rounded-md p-3">
                  {/* COMPONENT */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={component.visible}
                      onChange={() => toggleComponentVisibility(cIdx)}
                    />
                    <span className="font-medium">
                      {component.componentName}
                    </span>
                  </div>

                  {/* COMPONENT ACTIONS */}
                  {component.visible && component.actions.length > 0 && (
                    <div className="ml-6 mt-2 flex flex-wrap gap-4 text-xs">
                      {component.actions.map((action, aIdx) => (
                        <label key={aIdx} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={action.allowed}
                            onChange={() => toggleComponentAction(cIdx, aIdx)}
                          />
                          {action.actionName}
                        </label>
                      ))}
                    </div>
                  )}


                  {/* SUB COMPONENTS */}
                  {component.subComponents.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="ml-6 mt-3 p-2 border rounded-md bg-slate-50"
                    >
                      {/* SUB COMPONENT HEADER */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sub.visible}
                          onChange={() => toggleSubVisibility(cIdx, sIdx)}
                        />
                        <span className="font-medium text-sm">
                          {sub.subComponentName}
                        </span>
                      </div>

                      {/* SUB ACTIONS */}
                      {sub.visible && (
                        <div className="ml-6 mt-2 flex flex-wrap gap-4 text-xs">
                          {sub.actions.map((action, aIdx) => (
                            <label
                              key={aIdx}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="checkbox"
                                checked={action.allowed}
                                onChange={() =>
                                  toggleSubAction(cIdx, sIdx, aIdx)
                                }
                              />
                              {action.actionName}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              ))}
            </div>
          </div>
          {/* FOOTER */}
          <div className="flex sticky bottom-0 justify-between items-center p-4 bg-white border-t">
            <p className="text-xs text-gray-500">
              Create a new administrative user with specific permissions.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 flex items-center gap-1 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
              >{loading && <FiLoader className="animate-spin" />}
                {loading ? "Saving..." : editUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;
