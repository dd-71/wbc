import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdEmail,
  MdPhone,
  MdSchool,
  MdBook,
  MdWc,
  MdCalendarMonth,
  MdLinkOff,
} from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const STATUS_META = {
  new: { label: "New", color: "text-blue-600", bg: "bg-blue-50" },
  "follow-up": { label: "Follow Up", color: "text-amber-600", bg: "bg-amber-50" },
  converted: { label: "Converted", color: "text-emerald-600", bg: "bg-emerald-50" },
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-primaryColor/10 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-primaryColor" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">
        {label}
      </p>
      <p className="text-sm text-slate-700 font-medium mt-0.5 capitalize break-words">
        {value || "—"}
      </p>
    </div>
  </div>
);

const ViewGuestModal = ({ guest, onClose }) => {
  const [animate, setAnimate] = useState(false);
  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  if (!guest) return null;
  const meta = STATUS_META[guest.status] || STATUS_META.new;

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base">
              {guest.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white capitalize">
                {guest.fullName}
              </p>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white`}
              >
                {meta.label}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow icon={MdEmail} label="Email" value={guest.email} />
          <InfoRow icon={MdPhone} label="Phone" value={guest.phoneNumber} />
          <InfoRow icon={MdSchool} label="College" value={guest.collegeName} />
          <InfoRow icon={MdBook} label="Stream" value={guest.stream} />
          <InfoRow icon={MdWc} label="Gender" value={guest.gender} />
          <InfoRow
            icon={MdCalendarMonth}
            label="Registered On"
            value={new Date(guest.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
        </div>

        {/* Interested Courses */}
        <div className="px-6 pb-5">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-2">
            Interested Courses
          </p>

          {guest.interestedCourses?.length ? (
            <div className="flex flex-wrap gap-2">
              {guest.interestedCourses.map((c) => (
                <span
                  key={c._id || c}
                  className="px-2.5 py-1 text-xs font-medium bg-primaryColor/5 text-primaryColor rounded-full border border-primaryColor/15"
                >
                  {c.courseName || c}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
              <MdLinkOff size={14} /> No courses selected
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-br-3xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewGuestModal;
