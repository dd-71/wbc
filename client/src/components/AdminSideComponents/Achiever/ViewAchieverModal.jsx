import React, { useEffect, useState } from "react";
import { MdClose, MdEmojiEvents, MdBusiness, MdCalendarToday, MdPeople } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import { useClickOutside } from "../../Hooks/useClickOutSide";

const ViewAchieverModal = ({ data, onClose }) => {
  const [animate, setAnimate] = useState(false);
  const [selectedAchiever, setSelectedAchiever] = useState(null);

  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
    if (data?.achievers?.length) setSelectedAchiever(data.achievers[0]);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  if (!data) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-primaryColor/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={domNode}
        className={`bg-white w-full max-w-3xl max-h-[90vh] rounded-tl-3xl rounded-br-3xl shadow-xl flex flex-col transition-all duration-300 ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdEmojiEvents className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Achievers Group</h2>
              <p className="text-xs text-gray-100">View placement details</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full bg-white hover:bg-gray-200 transition">
            <MdClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* GROUP INFO CARD */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-md bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                {data.companyLogo ? (
                  <img src={data.companyLogo} alt={data.companyName} className="w-full h-full object-contain p-1.5" />
                ) : (
                  <MdBusiness size={28} className="text-primaryColor" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-800 truncate">{data.title}</h3>
                <p className="text-sm font-semibold text-primaryColor">{data.companyName}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                <MdCalendarToday className="mx-auto text-primaryColor mb-1" size={18} />
                <p className="text-lg font-bold text-gray-800">{data.year}</p>
                <p className="text-[11px] text-gray-500">Batch Year</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                <MdPeople className="mx-auto text-primaryColor mb-1" size={18} />
                <p className="text-lg font-bold text-gray-800">{data.achievers?.length}</p>
                <p className="text-[11px] text-gray-500">Achievers</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                <MdEmojiEvents className="mx-auto text-primaryColor mb-1" size={18} />
                <p className="text-lg font-bold text-gray-800">{data.companyName}</p>
                <p className="text-[11px] text-gray-500">Company</p>
              </div>
            </div>
          </div>

          {/* ACHIEVERS SECTION */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MdPeople className="text-primaryColor" size={18} />
              All Achievers
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {data.achievers?.map((a, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedAchiever(a)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                    ${selectedAchiever === a
                      ? "border-primaryColor bg-primaryColor/5 shadow-sm"
                      : "border-gray-100 bg-slate-50 hover:border-primaryColor/40 hover:bg-primaryColor/3"
                    }`}
                >
                  <img
                    src={a.image}
                    alt={a.name}
                    className={`w-12 h-12 rounded-xl object-cover flex-shrink-0 transition-all duration-200 border-2
                      ${selectedAchiever === a ? "border-primaryColor shadow-md" : "border-white shadow-sm"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{a.name}</p>
                    <p className="text-xs text-gray-500 truncate">{a.role}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-primaryColor bg-primaryColor/10 px-2 py-0.5 rounded-full">
                      <FiPackage size={9} /> {a.package}
                    </span>
                  </div>
                  {selectedAchiever === a && (
                    <div className="w-2 h-2 rounded-full bg-primaryColor flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SELECTED ACHIEVER SPOTLIGHT */}
          {selectedAchiever && (
            <div className="border rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primaryColor to-primaryFadedColor px-5 py-3">
                <p className="text-white text-xs font-semibold uppercase tracking-wider">Selected Achiever</p>
              </div>
              <div className="p-5 flex items-center gap-5 bg-gradient-to-br from-slate-50 to-white">
                <img
                  src={selectedAchiever.image}
                  alt={selectedAchiever.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0"
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{selectedAchiever.name}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedAchiever.role}</p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primaryColor/10 border border-primaryColor/30 rounded-full">
                    <FiPackage size={13} className="text-primaryColor" />
                    <span className="text-sm font-bold text-primaryColor">{selectedAchiever.package}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER META */}
          <div className="border rounded-xl p-4 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500 mb-1">Created On</p>
                <p className="font-semibold text-gray-800">{new Date(data.createdAt).toLocaleDateString()}</p>
              </div>
              {data.updatedAt && (
                <div>
                  <p className="text-gray-500 mb-1">Last Updated</p>
                  <p className="font-semibold text-gray-800">{new Date(data.updatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 z-10 flex justify-end px-6 py-4 border-t bg-white rounded-br-3xl">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md text-sm transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAchieverModal;