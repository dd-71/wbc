import React, { useEffect, useState } from "react";
import { MdClose, MdPerson, MdEmail, MdPhone, MdSchool } from "react-icons/md";
import { useClickOutside } from "../../Hooks/useClickOutSide";
import { FaWhatsapp } from "react-icons/fa";

const ViewLeadModal = ({ lead, onClose, addModal }) => {
  const [animate, setAnimate] = useState(false);
  const domNode = useClickOutside(() => handleClose());

  useEffect(() => {
    if (addModal) setTimeout(() => setAnimate(true), 10);
  }, [addModal]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 250);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700",
      interested: "bg-green-100 text-green-700",
      "partially interested": "bg-blue-100 text-blue-700",
      "not interested": "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-3 py-1 text-sm rounded-full font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"
          }`}
      >
        {status}
      </span>
    );
  };

  const getPaymentTypeBadge = (type) => {
    const typeColors = {
      enrollment: "bg-purple-100 text-purple-700",
      "course-payment": "bg-blue-100 text-blue-700",
      refund: "bg-red-100 text-red-700",
    };
    const typeLabels = {
      enrollment: "Enrollment",
      "course-payment": "Course Payment",
      refund: "Refund",
    };

    return (
      <span
        className={`px-2 py-0.5 text-xs rounded-full font-medium ${typeColors[type] || "bg-gray-100 text-gray-700"
          }`}
      >
        {typeLabels[type] || type}
      </span>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
      bg-primaryColor/20 backdrop-blur-sm transition-opacity duration-300
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={domNode}
        className={`w-full max-w-3xl mx-4 bg-white rounded-tl-3xl rounded-br-3xl shadow-xl
        transition-all duration-300 max-h-[90vh] flex flex-col
        ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primaryColor via-[#70a3d6] to-primaryColor rounded-tl-3xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <MdPerson className="text-primaryColor" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Lead Details</h2>
              <p className="text-xs text-gray-100">Complete lead information</p>
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
          {/* LEAD INFO CARD */}
          <div className="p-4 bg-slate-50 rounded-xl border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{lead.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{lead.gender}</p>
              </div>
              {getStatusBadge(lead.status)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <MdPhone className="text-primaryColor" size={18} />
                <span>{lead.phoneNumber}</span>
              </div>
              {lead.whatsappNumber && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FaWhatsapp className="text-green-500" size={18} />
                  <span>{lead.whatsappNumber}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 col-span-2 text-gray-700">
                  <MdEmail className="text-primaryColor" size={18} />
                  <span className="break-all">{lead.email}</span>
                </div>
              )}
              {lead.collegeName && (
                <div className="flex items-center gap-2 col-span-2 text-gray-700">
                  <MdSchool className="text-primaryColor" size={18} />
                  <span>{lead.collegeName}</span>
                </div>
              )}
            </div>
          </div>

          {/* BRANCH INFO */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Branch Information
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Branch:</span>{" "}
                {lead.branch?.city || "N/A"} ({lead.branch?.state || "N/A"})
              </p>
            </div>
          </div>

          {/* REMARKS */}
          {lead.remarks && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Remarks</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">{lead.remarks}</p>
              </div>
            </div>
          )}

          {/* PARENT INFO */}
          {lead.parents && lead.parents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Parent/Guardian Information
              </h3>
              <div className="space-y-3">
                {lead.parents.map((parent, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-gray-100 rounded-xl bg-slate-50 hover:border-primaryColor/30 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Name:</span>{" "}
                        <span className="text-gray-600">{parent.name}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Relation:</span>{" "}
                        <span className="text-gray-600 capitalize">{parent.relation}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Phone:</span>{" "}
                        <span className="text-gray-600">{parent.phoneNumber}</span>
                      </div>
                      {parent.whatsappNumber && (
                        <div>
                          <span className="font-semibold text-gray-700">WhatsApp:</span>{" "}
                          <span className="text-gray-600">{parent.whatsappNumber}</span>
                        </div>
                      )}
                      {parent.email && (
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">Email:</span>{" "}
                          <span className="text-gray-600 break-all">{parent.email}</span>
                        </div>
                      )}
                      {parent.occupation && (
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">Occupation:</span>{" "}
                          <span className="text-gray-600">{parent.occupation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAYMENT HISTORY */}
          {lead.payments && lead.payments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Payment History
              </h3>
              <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-primaryColor/10 to-primaryFadedColor/10">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-700">Type</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Amount</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Mode</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Remarks</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lead.payments.map((payment, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            {getPaymentTypeBadge(payment.type)}
                          </td>

                          <td className="p-3 font-semibold text-gray-800">
                            <span className={payment.type === "refund" ? "text-red-600" : "text-gray-800"}>
                              {payment.type === "refund" ? "-" : ""}₹{Math.abs(payment.amount).toLocaleString()}
                            </span>
                          </td>

                          <td className="p-3 capitalize text-gray-700">
                            {payment.mode === "refund" ? "—" : payment.mode}
                          </td>

                          <td className="p-3 text-gray-600 max-w-[150px] truncate">
                            {payment.remarks || "—"}
                          </td>

                          <td className="p-3 text-gray-600">
                            {new Date(payment.paidAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* TOTALS ROW */}
                    <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                      <tr>
                        <td className="p-3 font-semibold text-gray-700" colSpan={1}>
                          Total Paid
                        </td>
                        <td className="p-3 font-bold text-green-700" colSpan={4}>
                          ₹{lead.payments
                            .filter((p) => p.type !== "refund")
                            .reduce((sum, p) => sum + p.amount, 0)
                            .toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INTERESTED BATCHES & COURSES */}
          {lead.interestedEnrollments && lead.interestedEnrollments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Interested Batches & Courses
              </h3>

              <div className="space-y-3">
                {lead.interestedEnrollments.map((en, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-50 rounded-xl border border-gray-100"
                  >
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      📚 Batch: {en.batch?.batchName || "N/A"}
                    </p>

                    {en.courses && en.courses.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {en.courses.map((course, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
                          >
                            {course.courseName || course}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        No courses selected in this batch
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STUDENT STATUS */}
          {lead.student && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Conversion Status
              </h3>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  This lead has been converted to a student
                </p>
              </div>
            </div>
          )}

          {/* TIMESTAMPS */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm font-semibold text-gray-700">
                {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(lead.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm font-semibold text-gray-700">
                {new Date(lead.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(lead.updatedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end items-center px-6 py-4 border-t bg-slate-50 rounded-br-3xl flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md text-sm transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeadModal;