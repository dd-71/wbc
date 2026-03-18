import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";
import { LuBookOpen, LuGraduationCap, LuUsers } from "react-icons/lu";
import {
  MdArrowBack,
  MdBadge,
  MdCalendarMonth,
  MdDelete,
  MdEmail,
  MdLocationOn,
  MdPayment,
  MdPerson,
  MdPhone,
  MdSchool,
  MdStickyNote2,
  MdVerified,
  MdWork
} from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import DeleteAlertModal from "../../common/DeleteAlertModal";
import { useLockBodyScroll } from "../../Hooks/useLockBodyScroll";
import { usePermission } from "../../Hooks/usePermissions";
import AddPaymentModal from "../LeadManagement/AddPaymentModal";

const API = process.env.REACT_APP_API_URL;

// SKELETON

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

const PageSkeleton = () => (
  <div className="py-5 space-y-6 max-w-6xl mx-auto">
    <div className="flex items-center gap-4">
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
    {/* hero */}
    <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5">
      <Skeleton className="w-20 h-20 rounded-full shrink-0" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-36" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
    {/* body */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-5">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// REUSABLE SUB-COMPONENTS

const InfoChip = ({ icon: Icon, label, value, iconBg = "bg-primaryColor/10", iconColor = "text-primaryColor" }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={17} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-slate-700 truncate">{value || "—"}</p>
    </div>
  </div>
);

const SectionCard = ({ icon: Icon, title, iconBg = "bg-indigo-50", iconColor = "text-indigo-500", children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-50">
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon size={15} className={iconColor} />
      </div>
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const getPaymentTypeBadge = (type) => {
  const map = {
    enrollment: { label: "Enrollment", cls: "bg-purple-100 text-purple-700" },
    "course-payment": { label: "Course Payment", cls: "bg-blue-100 text-blue-700" },
    refund: { label: "Refund", cls: "bg-red-100 text-red-700" },
  };
  const cfg = map[type] || { label: type, cls: "bg-gray-100 text-gray-700" };
  return (
    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const EnrollmentStatusBadge = ({ status }) => {
  const map = {
    enrolled: "bg-green-100 text-green-700",
    "pending-payment": "bg-yellow-100 text-yellow-700",
    completed: "bg-indigo-100 text-indigo-700",
    dropped: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 text-[11px] rounded-full font-medium capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status?.replace("-", " ") || "—"}
    </span>
  );
};

// MAIN PAGE

const ViewStudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  useLockBodyScroll(showDelete || showAddPayment);

  /* ── FETCH ── */
  const fetchStudent = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/student/${id}`, {
        withCredentials: true,
      });
      setStudent(data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load student");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  console.log("Student details:", student);

  /* ── DELETE ── */
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${API}/student/${id}`, { withCredentials: true });
      toast.success("Student deleted successfully");
      navigate(-1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <PageSkeleton />;
  if (!student) return null;

  const lead = student.lead || null;

  /* ── PAYMENT CALCS ── */
  const totalPaid = lead?.payments
    ?.filter((p) => p.type !== "refund")
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const totalRefunded = lead?.payments
    ?.filter((p) => p.type === "refund")
    .reduce((sum, p) => sum + Math.abs(p.amount || 0), 0) || 0;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "—";

  const formatDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";

  const totalCourseAmount =
    student.enrollments?.reduce((sum, en) => {
      const price =
        en.course?.finalPrice != null
          ? en.course.finalPrice
          : en.course?.price || 0;

      return sum + price;
    }, 0) || 0;

  const coursePaid =
    lead?.payments
      ?.filter((p) => p.type === "course-payment")
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const remainingAmount = totalCourseAmount - coursePaid;

  return (
    <div className="py-5 space-y-6">

      {/* ── BACK BUTTON ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primaryColor bg-white border border-slate-200 hover:border-primaryColor/40 px-4 py-2 rounded-xl transition-all duration-150 w-fit"
      >
        <MdArrowBack size={16} /> Back to Students
      </button>

      {/* ── HERO CARD ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primaryColor/20 to-primaryColor/50 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-3xl font-bold text-primaryColor">
              {student.fullName?.charAt(0)?.toUpperCase()}
            </span>
          </div>

          {/* Name + badges */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-800">{student.fullName}</h1>
              <span className={`px-3 py-1 text-xs rounded-full font-semibold ${student.status === "enrolled"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
                }`}>
                {student.status || "—"}
              </span>
              {lead?.status && (
                <span className="px-3 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-700 capitalize">
                  Lead: {lead.status}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1 capitalize">{student.gender}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {student.email && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MdEmail size={14} className="text-primaryColor" />{student.email}
                </span>
              )}
              {student.phoneNumber && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MdPhone size={14} className="text-primaryColor" />{student.phoneNumber}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap shrink-0">
            {can("edit") && lead && (
              <button
                onClick={() => setShowAddPayment(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor rounded-lg transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
              >
                <MdPayment size={16} /> Add Payment
              </button>
            )}
            {can("delete") && (
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-150"
              >
                <MdDelete size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN BODY: 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT COLUMN (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* PERSONAL INFO */}
          <SectionCard icon={MdPerson} title="Personal Information" iconBg="bg-blue-50" iconColor="text-blue-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoChip icon={MdPerson} label="Full Name" value={student.fullName} />
              <InfoChip icon={MdBadge} label="Username" value={student.username} />
              <InfoChip icon={MdEmail} label="Email" value={student.email}
                iconBg="bg-indigo-50" iconColor="text-indigo-500" />
              <InfoChip icon={MdPhone} label="Phone" value={student.phoneNumber}
                iconBg="bg-green-50" iconColor="text-green-500" />
              {lead?.whatsappNumber && (
                <InfoChip icon={FaWhatsapp} label="WhatsApp" value={lead.whatsappNumber}
                  iconBg="bg-emerald-50" iconColor="text-emerald-500" />
              )}
              <InfoChip icon={MdPerson} label="Gender" value={student.gender}
                iconBg="bg-pink-50" iconColor="text-pink-500" />
              {student.collegeName && (
                <InfoChip icon={MdSchool} label="College" value={student.collegeName}
                  iconBg="bg-amber-50" iconColor="text-amber-500" />
              )}
              {student.qualification && (
                <InfoChip icon={LuGraduationCap} label="Qualification" value={student.qualification}
                  iconBg="bg-violet-50" iconColor="text-violet-500" />
              )}
              {student.designation && (
                <InfoChip icon={MdWork} label="Designation" value={student.designation}
                  iconBg="bg-sky-50" iconColor="text-sky-500" />
              )}
              {student.experience && (
                <InfoChip icon={MdWork} label="Experience" value={student.experience}
                  iconBg="bg-orange-50" iconColor="text-orange-500" />
              )}
            </div>
          </SectionCard>

          {/* BRANCH & SYSTEM INFO */}
          <SectionCard icon={MdLocationOn} title="Branch & System Info" iconBg="bg-emerald-50" iconColor="text-emerald-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoChip icon={MdLocationOn} label="City" value={student.branch?.city}
                iconBg="bg-emerald-50" iconColor="text-emerald-500" />
              <InfoChip icon={MdLocationOn} label="State" value={student.branch?.state}
                iconBg="bg-teal-50" iconColor="text-teal-500" />
              <InfoChip icon={MdLocationOn} label="District" value={student.branch?.district}
                iconBg="bg-cyan-50" iconColor="text-cyan-500" />
              <InfoChip icon={MdBadge} label="Role" value={student.role?.roleName}
                iconBg="bg-purple-50" iconColor="text-purple-500" />
              <InfoChip icon={MdCalendarMonth} label="Joined On" value={formatDate(student.createdAt)}
                iconBg="bg-slate-100" iconColor="text-slate-500" />
              <InfoChip icon={MdCalendarMonth} label="Last Updated" value={formatDate(student.updatedAt)}
                iconBg="bg-slate-100" iconColor="text-slate-500" />
            </div>
          </SectionCard>

          {/* ENROLLMENTS */}
          {student.enrollments?.length > 0 && (
            <SectionCard icon={LuBookOpen} title="Course Enrollments" iconBg="bg-indigo-50" iconColor="text-indigo-500">
              <div className="space-y-3">
                {student.enrollments.map((en, i) => (
                  <div key={i} className="flex items-start justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-indigo-500">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {en.course?.courseName || "—"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Batch: {en.batch?.batchName || "—"}
                        </p>
                        {en.course?.price && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Price: ₹{en.course.price.toLocaleString()}
                            {en.course.duration ? ` · ${en.course.duration}` : ""}
                          </p>
                        )}
                        {en.batch?.startDate && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(en.batch.startDate)} → {formatDate(en.batch.endDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <EnrollmentStatusBadge status={en.status} />
                      {en.enrolledAt && (
                        <span className="text-[10px] text-slate-400">
                          Enrolled {formatDate(en.enrolledAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* PAYMENT HISTORY */}
          {lead?.payments?.length > 0 && (
            <SectionCard icon={MdPayment} title="Payment History" iconBg="bg-green-50" iconColor="text-green-500">
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-primaryColor/10 to-primaryFadedColor/10">
                      <th className="p-3 text-left font-semibold text-gray-700 text-xs">#</th>
                      <th className="p-3 text-left font-semibold text-gray-700 text-xs">Type</th>
                      <th className="p-3 text-left font-semibold text-gray-700 text-xs">Amount</th>
                      <th className="p-3 text-left font-semibold text-gray-700 text-xs">Mode</th>
                      <th className="p-3 text-left font-semibold text-gray-700 text-xs">Remarks</th>
                      <th className="p-3 text-left font-semibold text-gray-700 text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lead.payments.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-xs text-slate-400">{i + 1}</td>
                        <td className="p-3">{getPaymentTypeBadge(p.type)}</td>
                        <td className="p-3 font-semibold">
                          <span className={p.type === "refund" ? "text-red-600" : "text-slate-800"}>
                            {p.type === "refund" ? "−" : ""}₹{Math.abs(p.amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3 capitalize text-slate-600 text-xs">
                          {p.mode === "refund" ? "—" : p.mode}
                        </td>
                        <td className="p-3 text-slate-500 text-xs max-w-[160px] truncate">
                          {p.remarks || "—"}
                        </td>
                        <td className="p-3 text-slate-500 text-xs whitespace-nowrap">
                          {formatDate(p.paidAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={2} className="p-3 text-xs font-semibold text-slate-700">Summary</td>
                      <td colSpan={4} className="p-3">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-xs font-semibold text-green-700">
                            Total Paid: ₹{totalPaid.toLocaleString()}
                          </span>
                          {totalRefunded > 0 && (
                            <span className="text-xs font-semibold text-red-600">
                              Refunded: ₹{totalRefunded.toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-600">
                            Net: ₹{(totalPaid - totalRefunded).toLocaleString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </SectionCard>
          )}

          {/* INTERESTED ENROLLMENTS (from lead) */}
          {/* {lead?.interestedEnrollments?.length > 0 && (
            <SectionCard icon={LuGraduationCap} title="Interested Batches & Courses" iconBg="bg-violet-50" iconColor="text-violet-500">
              <div className="space-y-3">
                {lead.interestedEnrollments.map((en, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <LuBookOpen size={14} className="text-violet-500" />
                      {en.batch?.batchName || "Batch N/A"}
                      {en.batch?.startDate && (
                        <span className="text-xs text-slate-400 font-normal">
                          ({formatDate(en.batch.startDate)} – {formatDate(en.batch.endDate)})
                        </span>
                      )}
                    </p>
                    {en.courses?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {en.courses.map((c, j) => (
                          <span key={j} className="px-3 py-1 bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 rounded-lg text-xs font-medium border border-violet-200">
                            {c.courseName || c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No courses selected</p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )} */}

          {/* LEAD REMARKS */}
          {lead?.remarks && (
            <SectionCard icon={MdStickyNote2} title="Remarks" iconBg="bg-amber-50" iconColor="text-amber-500">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed italic">"{lead.remarks}"</p>
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── RIGHT COLUMN (1/3) ── */}
        <div className="space-y-5">

          {/* PAYMENT SUMMARY CARD */}
          <SectionCard icon={MdPayment} title="Payment Summary" iconBg="bg-green-50" iconColor="text-green-500">
            <div className="space-y-3">
              {student.enrollmentAmount?.amount != null && (
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-500 font-medium">Enrollment Fee</span>
                  <span className="text-sm font-semibold text-slate-700">
                    ₹{student.enrollmentAmount.amount.toLocaleString()}
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${student.enrollmentAmount.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                      }`}>
                      {student.enrollmentAmount.status}
                    </span>
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">Total Paid</span>
                <span className="text-sm font-bold text-green-700">₹{totalPaid.toLocaleString()}</span>
              </div>
              {totalRefunded > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-500 font-medium">Total Refunded</span>
                  <span className="text-sm font-bold text-red-600">₹{totalRefunded.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-500 font-medium">Net Payment(For Refund)</span>
                <span className="text-sm font-bold text-primaryColor">
                  ₹{(totalPaid - totalRefunded).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">
                  Total Course Fee
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  ₹{totalCourseAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">
                  Course Paid(excluding enrollment)
                </span>
                <span className="text-sm font-semibold text-green-700">
                  ₹{coursePaid.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-500 font-medium">
                  Remaining Amount
                </span>
                <span
                  className={`text-sm font-bold ${remainingAmount > 0
                    ? "text-red-600"
                    : "text-green-600"
                    }`}
                >
                  ₹{remainingAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-1">
                <div className={`w-full py-2.5 px-3 rounded-xl text-center text-xs font-semibold ${totalPaid > 0
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-600 border border-red-100"
                  }`}>
                  {totalPaid > 0 ? "✓ Payment on record" : "No payments recorded"}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* LEAD INFO SUMMARY */}
          {lead && (
            <SectionCard icon={MdVerified} title="Lead Info" iconBg="bg-blue-50" iconColor="text-blue-500">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Lead Status</span>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${{
                    converted: "bg-green-100 text-green-700",
                    interested: "bg-blue-100 text-blue-700",
                    pending: "bg-yellow-100 text-yellow-700",
                    "not interested": "bg-red-100 text-red-700",
                  }[lead.status] || "bg-gray-100 text-gray-600"
                    }`}>
                    {lead.status}
                  </span>
                </div>
                {lead.interestedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Interested On</span>
                    <span className="text-xs font-medium text-slate-700">{formatDate(lead.interestedDate)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Total Payments</span>
                  <span className="text-xs font-semibold text-slate-700">{lead.payments?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Lead Created</span>
                  <span className="text-xs font-medium text-slate-700">{formatDate(lead.createdAt)}</span>
                </div>
              </div>
            </SectionCard>
          )}

          {/* PARENTS */}
          {lead?.parents?.length > 0 && (
            <SectionCard icon={LuUsers} title="Parent / Guardian" iconBg="bg-rose-50" iconColor="text-rose-500">
              <div className="space-y-3">
                {lead.parents.map((p, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-rose-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                      <span className="text-[10px] capitalize font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                        {p.relation}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {p.phoneNumber && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MdPhone size={12} className="text-slate-400" />{p.phoneNumber}
                        </p>
                      )}
                      {p.whatsappNumber && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <FaWhatsapp size={12} className="text-green-500" />{p.whatsappNumber}
                        </p>
                      )}
                      {p.email && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MdEmail size={12} className="text-slate-400" />{p.email}
                        </p>
                      )}
                      {p.occupation && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MdWork size={12} className="text-slate-400" />{p.occupation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* TIMESTAMPS */}
          <SectionCard icon={MdCalendarMonth} title="Timeline" iconBg="bg-slate-100" iconColor="text-slate-500">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-0.5">Student Created</p>
                <p className="text-xs font-semibold text-slate-700">{formatDateTime(student.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-0.5">Last Updated</p>
                <p className="text-xs font-semibold text-slate-700">{formatDateTime(student.updatedAt)}</p>
              </div>
              {lead?.createdAt && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-0.5">Lead Created</p>
                  <p className="text-xs font-semibold text-slate-700">{formatDateTime(lead.createdAt)}</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── MODALS ── */}
      {showAddPayment && lead && (
        <AddPaymentModal
          lead={lead}
          onClose={() => setShowAddPayment(false)}
          addModal={showAddPayment}
          onSuccess={() => {
            setShowAddPayment(false);
            fetchStudent();
          }}
        />
      )}

      <DeleteAlertModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Student"
        description={`Are you sure you want to delete ${student.fullName}? This will permanently remove the student, their linked lead, all attendance records, quiz attempts, and homework status. This action cannot be undone.`}
        confirmText="Delete Student"
      />
    </div>
  );
};

export default ViewStudentDetails;