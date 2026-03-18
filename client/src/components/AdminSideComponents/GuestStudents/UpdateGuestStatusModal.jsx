import React, { useEffect, useState } from "react";
import { MdClose, MdCheckCircle, MdPeople } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const STATUSES = [
  {
    value: "new",
    label: "New",
    description: "Freshly registered, not yet contacted",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    ring: "ring-blue-400",
  },
  {
    value: "follow-up",
    label: "Follow Up",
    description: "In conversation, needs follow-up",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    ring: "ring-amber-400",
  },
  {
    value: "converted",
    label: "Converted",
    description: "Successfully enrolled as a student",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    ring: "ring-emerald-400",
  },
];

const UpdateGuestStatusModal = ({ guest, bulkCount, onClose, onConfirm }) => {
  const isBulk = !guest;
  const [selectedStatus, setSelectedStatus] = useState(guest?.status || "");
  const [saving, setSaving] = useState(false);
  const [animate, setAnimate] = useState(false);
  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;
    setSaving(true);
    await onConfirm(selectedStatus);
    setSaving(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-md rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Update Guest Status
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              {isBulk
                ? `Applying to ${bulkCount} selected student${bulkCount > 1 ? "s" : ""
                }`
                : guest?.fullName}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-3">
          {isBulk && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border rounded-lg px-3 py-2">
              <MdPeople size={14} className="text-primaryColor" />
              This will override the status of all {bulkCount} selected students.
            </div>
          )}

          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSelectedStatus(s.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${selectedStatus === s.value
                ? `${s.bg} ${s.border} ring-2 ${s.ring}`
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedStatus === s.value
                  ? `${s.bg} ${s.color}`
                  : "bg-gray-100 text-gray-400"
                  }`}
              >
                {selectedStatus === s.value ? (
                  <MdCheckCircle size={18} />
                ) : (
                  s.label[0]
                )}
              </div>

              <div className="text-left">
                <p
                  className={`text-sm font-semibold ${selectedStatus === s.value
                    ? s.color
                    : "text-slate-700"
                    }`}
                >
                  {s.label}
                </p>
                <p className="text-[11px] text-slate-400">
                  {s.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-br-3xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedStatus || saving}
            className="px-4 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateGuestStatusModal;
