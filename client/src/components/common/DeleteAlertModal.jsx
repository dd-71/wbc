import React, { useEffect, useState } from "react";
import { MdClose, MdWarning } from "react-icons/md";
import { useClickOutside } from "../Hooks/useClickOutSide";

const DeleteAlertModal = ({
  open,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  loading = false,
}) => {
  const [animate, setAnimate] = useState(false);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    if (open) setTimeout(() => setAnimate(true), 10);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
      bg-[red]/20 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={domNode}
        className={`w-full max-w-md bg-white rounded-tl-3xl rounded-br-3xl shadow-xl
        transition-all duration-300
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-[red] via-[#c49292] to-[red] rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <MdWarning className="text-red-600" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {title}
              </h2>
              <p className="text-xs text-gray-100">
                This action is irreversible
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 bg-white rounded-full hover:bg-red-100 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 text-sm text-gray-600">
          {description}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-t from-red-600 via-red-400 to-red-600
              text-white rounded-md transition-all duration-500
              hover:shadow-[0px_6px_10px_#991b1b] disabled:opacity-70"
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAlertModal;
