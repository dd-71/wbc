import React, { useEffect, useState } from "react";
import { MdClose, MdShield } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import {
  buildPermissionTemplateFromCreator,
  mergeUserPermissions,
} from "../../../utils/buildPermissionTemplateFromCreator";
import { useAuth } from "../../../context/AuthProvider";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { FiLoader } from "react-icons/fi";

const ManagePermissionModal = ({ user, onClose, onSuccess, showPermissionModal }) => {
  const { permissions: creatorPermissions } = useAuth();
  const [permissionTemplate, setPermissionTemplate] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false)
  const domNode = useClickOutside(() => handleClose())


  useEffect(() => {
    if (showPermissionModal) setTimeout(() => setAnimate(true), 10)
  }, [showPermissionModal])

  // Build template
  useEffect(() => {
    if (!creatorPermissions || !user) return;

    const baseTemplate =
      buildPermissionTemplateFromCreator(creatorPermissions);

    const merged = user.permissions
      ? mergeUserPermissions(baseTemplate, user.permissions.permissions)
      : baseTemplate;

    setPermissionTemplate(merged);
  }, [creatorPermissions, user]);

  const toggleComponentVisibility = (cIdx) => {
    setPermissionTemplate((prev) =>
      prev.map((c, i) =>
        i === cIdx ? { ...c, visible: !c.visible } : c
      )
    );
  };

  const toggleComponentAction = (cIdx, aIdx) => {
    setPermissionTemplate((prev) =>
      prev.map((c, i) =>
        i === cIdx
          ? {
            ...c,
            actions: c.actions.map((a, j) =>
              j === aIdx ? { ...a, allowed: !a.allowed } : a
            ),
          }
          : c
      )
    );
  };

  const toggleSubVisibility = (cIdx, sIdx) => {
    setPermissionTemplate((prev) =>
      prev.map((c, i) =>
        i === cIdx
          ? {
            ...c,
            subComponents: c.subComponents.map((s, j) =>
              j === sIdx ? { ...s, visible: !s.visible } : s
            ),
          }
          : c
      )
    );
  };

  const toggleSubAction = (cIdx, sIdx, aIdx) => {
    setPermissionTemplate((prev) =>
      prev.map((c, i) =>
        i === cIdx
          ? {
            ...c,
            subComponents: c.subComponents.map((s, j) =>
              j === sIdx
                ? {
                  ...s,
                  actions: s.actions.map((a, k) =>
                    k === aIdx ? { ...a, allowed: !a.allowed } : a
                  ),
                }
                : s
            ),
          }
          : c
      )
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await axios.put(
        `${process.env.REACT_APP_API_URL}/permissions/${user._id}-permissions`,
        { permissions: permissionTemplate },
        { withCredentials: true }
      );

      toast.success("Permissions updated");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update permission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnimate(false)
    setTimeout(onClose, 250)
  }

  return (
    <div className={`fixed overflow-y-auto py-10 inset-0 z-50 flex items-center justify-center
      bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}>
      <div ref={domNode} className={`w-full h-auto overflow-y-auto max-w-3xl bg-white rounded-tl-3xl rounded-br-3xl shadow-xl
        transition-all duration-300
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
        {/* HEADER */}
        <div className="flex items-center sticky top-0 justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdShield className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Manage Permissions – {user.fullName}
              </h2>
              <p className="text-xs text-gray-100">Manage user permissions for each component and subcomponent</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-white rounded-full hover:bg-gray-200 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-sm">
          {permissionTemplate.map((component, cIdx) => (
            <div key={cIdx} className="border text-lg capitalize rounded p-3">
              <label className="flex gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={component.visible}
                  onChange={() => toggleComponentVisibility(cIdx)}
                />
                {component.componentName}
              </label>

              {component.visible &&
                component.actions.map((a, aIdx) => (
                  <label key={aIdx} className="ml-6 flex gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={a.allowed}
                      onChange={() =>
                        toggleComponentAction(cIdx, aIdx)
                      }
                    />
                    {a.actionName}
                  </label>
                ))}

              {component.subComponents.map((s, sIdx) => (
                <div key={sIdx} className="ml-6 mt-2 border p-2 rounded">
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={s.visible}
                      onChange={() =>
                        toggleSubVisibility(cIdx, sIdx)
                      }
                    />
                    {s.subComponentName}
                  </label>

                  {s.visible &&
                    s.actions.map((a, aIdx) => (
                      <label
                        key={aIdx}
                        className="ml-6 flex gap-2 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={a.allowed}
                          onChange={() =>
                            toggleSubAction(cIdx, sIdx, aIdx)
                          }
                        />
                        {a.actionName}
                      </label>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 flex items-center gap-1 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
          >
            {loading && <FiLoader className="animate-spin" />}
            {loading ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagePermissionModal;
