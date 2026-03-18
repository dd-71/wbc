import React, { useState } from "react";
import { MdEdit, MdEmail, MdPhone, MdPerson, MdLockOutline } from "react-icons/md";
import { FiCamera } from "react-icons/fi";
import { useAuth } from "../../context/AuthProvider";
import { cloudinary } from "../../utils/cloudinary";
import axios from "axios";
import toast from "react-hot-toast";
import EditProfileModal from "../../components/common/Modals/EditProfileModal";
import UpdatePasswordModal from "../../components/common/Modals/UpdatePasswordModal";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../../components/common/Avatar";


const Profile = () => {
  const { user, setUser } = useAuth();
  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);


  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await cloudinary(file);

      const isSuperAdmin = user?.role?.roleName === "super-admin";

      const url = isSuperAdmin
        ? `${process.env.REACT_APP_API_URL}/users/super-admin-update`
        : `${process.env.REACT_APP_API_URL}/users/${user?._id}`;

      const res = await axios.put(
        url,
        { profilePicture: result.url },
        { withCredentials: true }
      );

      setUser(res.data.data || res.data.user);
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error("Failed to update profile picture");
    } finally {
      setUploading(false);
    }
  };

  console.log(user);


  return (
    <div className="py-5">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primaryColor">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your personal information</p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-tl-3xl rounded-br-3xl border border-slate-200 overflow-hidden">
        {/* TOP BANNER */}
        <div className="h-36 p-5">
          <div className="flex items-center gap-4">
            {/* PROFILE IMAGE */}
            <div className="relative drop-shadow-lg">
              <motion.div
                layoutId="profile-image"
                onClick={() => !uploading && setPreviewOpen(true)}
                className={`relative cursor-pointer ${uploading ? "pointer-events-none" : ""}`}
              >
                <Avatar
                  src={user?.profilePicture}
                  name={user?.fullName}
                  size="w-28 h-28"
                  textSize="text-3xl"
                />

                {/* Loading Overlay */}
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primaryColor border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </motion.div>

              {/* Camera Button */}
              <label
                className={`absolute bottom-0 right-0 bg-primaryColor border-4 border-white text-white p-2 rounded-full transition 
    ${uploading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}
              >
                <FiCamera size={14} />
                <input
                  type="file"
                  hidden
                  disabled={uploading}
                  accept="image/*"
                  onChange={handleProfilePicChange}
                />
              </label>
            </div>

            {/* NAME */}
            <div className="">
              <h2 className="text-xl font-semibold text-primaryColor">
                {user?.fullName}
              </h2>
              <p className="text-xs text-primaryColor capitalize">
                {user?.role?.roleName}({user?.branch?.city || "super admin"})
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <InfoItem icon={<MdPerson />} label="Username" value={user?.username} />
          <InfoItem icon={<MdEmail />} label="Email" value={user?.email} />
          <InfoItem icon={<MdPhone />} label="Phone" value={user?.phoneNumber} />
          <InfoItem label="Gender" value={user?.gender} />

          {/* ACTIONS */}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              onClick={() => setOpenPassword(true)}
              className="px-4 py-2 flex items-center gap-2 border border-primaryColor text-primaryColor rounded-md transition hover:bg-gradient-to-t hover:from-primaryColor hover:via-[#617cf5] hover:to-primaryFadedColor hover:text-white"
            >
              <MdLockOutline /> Update Password
            </button>
            <button
              onClick={() => setOpenEdit(true)}
              className="px-4 py-2 flex items-center gap-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
            >
              <MdEdit /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {openEdit && (
        <EditProfileModal
          user={user}
          onClose={() => setOpenEdit(false)}
          onSuccess={(updatedUser) => setUser(updatedUser)}
        />
      )}

      {/* UPDATE PASSWORD MODAL */}
      {openPassword && (
        <UpdatePasswordModal onClose={() => setOpenPassword(false)} />
      )}

      <AnimatePresence>
        {previewOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewOpen(false)}
          >
            <motion.img
              layoutId="profile-image"
              src={user?.profilePicture}
              alt="profile large"
              className="w-[30rem] h-[30rem] rounded-full object-cover object-top shadow-2xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
    {icon && <div className="text-primaryColor text-lg">{icon}</div>}
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "-"}</p>
    </div>
  </div>
);

export default Profile;















// import React, { useState } from "react";
// import { MdEdit, MdEmail, MdPhone, MdPerson } from "react-icons/md";
// import { FiCamera } from "react-icons/fi";
// import { useAuth } from "../../context/AuthProvider";
// import { cloudinary } from "../../utils/cloudinary";
// import axios from "axios";
// import toast from "react-hot-toast";
// import EditProfileModal from "../../components/common/Modals/EditProfileModal";
// import { motion, AnimatePresence } from "framer-motion";
// import Avatar from "../../components/common/Avatar";


// const Profile = () => {
//   const { user, setUser } = useAuth();
//   const [openEdit, setOpenEdit] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [previewOpen, setPreviewOpen] = useState(false);


//   const handleProfilePicChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       setUploading(true);
//       const result = await cloudinary(file);

//       const isSuperAdmin = user?.role?.roleName === "super-admin";

//       const url = isSuperAdmin
//         ? `${process.env.REACT_APP_API_URL}/users/super-admin-update`
//         : `${process.env.REACT_APP_API_URL}/users/${user?._id}`;

//       const res = await axios.put(
//         url,
//         { profilePicture: result.url },
//         { withCredentials: true }
//       );

//       setUser(res.data.data || res.data.user);
//       toast.success("Profile picture updated");
//     } catch (err) {
//       toast.error("Failed to update profile picture");
//     } finally {
//       setUploading(false);
//     }
//   };


//   return (
//     <div className="py-5">
//       {/* HEADER */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-semibold text-primaryColor">My Profile</h1>
//         <p className="text-sm text-gray-500">Manage your personal information</p>
//       </div>

//       {/* PROFILE CARD */}
//       <div className="bg-white rounded-tl-3xl rounded-br-3xl border border-slate-200 overflow-hidden">
//         {/* TOP BANNER */}
//         <div className="h-36 p-5">
//           <div className="flex items-center gap-4">
//             {/* PROFILE IMAGE */}
//             <div className="relative drop-shadow-lg">
//               <motion.div
//                 layoutId="profile-image"
//                 onClick={() => !uploading && setPreviewOpen(true)}
//                 className={`relative cursor-pointer ${uploading ? "pointer-events-none" : ""}`}
//               >
//                 <Avatar
//                   src={user?.profilePicture}
//                   name={user?.fullName}
//                   size="w-28 h-28"
//                   textSize="text-3xl"
//                 />

//                 {/* Loading Overlay */}
//                 {uploading && (
//                   <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
//                     <div className="w-8 h-8 border-4 border-primaryColor border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                 )}
//               </motion.div>

//               {/* Camera Button */}
//               <label
//                 className={`absolute bottom-0 right-0 bg-primaryColor border-4 border-white text-white p-2 rounded-full transition
//     ${uploading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}
//               >
//                 <FiCamera size={14} />
//                 <input
//                   type="file"
//                   hidden
//                   disabled={uploading}
//                   accept="image/*"
//                   onChange={handleProfilePicChange}
//                 />
//               </label>
//             </div>



//             {/* NAME */}
//             <div className="">
//               <h2 className="text-xl font-semibold text-primaryColor">
//                 {user?.fullName}
//               </h2>
//               <p className="text-xs text-primaryColor capitalize">
//                 {user?.role?.roleName}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* BODY */}
//         <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
//           <InfoItem icon={<MdPerson />} label="Username" value={user?.username} />
//           <InfoItem icon={<MdEmail />} label="Email" value={user?.email} />
//           <InfoItem icon={<MdPhone />} label="Phone" value={user?.phoneNumber} />
//           <InfoItem label="Gender" value={user?.gender} />

//           {/* ACTION */}
//           <div className="md:col-span-2 flex justify-end">
//             <button
//               onClick={() => setOpenEdit(true)}
//               className="px-4 py-2 flex items-center gap-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242]"
//             >
//               <MdEdit /> Edit Profile
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* EDIT MODAL */}
//       {openEdit && (
//         <EditProfileModal
//           user={user}
//           onClose={() => setOpenEdit(false)}
//           onSuccess={(updatedUser) => setUser(updatedUser)}
//         />
//       )}

//       <AnimatePresence>
//         {previewOpen && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setPreviewOpen(false)}
//           >
//             <motion.img
//               layoutId="profile-image"
//               src={user?.profilePicture}
//               alt="profile large"
//               className="w-[30rem] h-[30rem] rounded-full object-cover object-top shadow-2xl"
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.8 }}
//               transition={{ duration: 0.3 }}
//               onClick={(e) => e.stopPropagation()}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>

//     </div>
//   );
// };

// const InfoItem = ({ icon, label, value }) => (
//   <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
//     {icon && <div className="text-primaryColor text-lg">{icon}</div>}
//     <div>
//       <p className="text-xs text-gray-500">{label}</p>
//       <p className="font-medium text-gray-800">{value || "-"}</p>
//     </div>
//   </div>
// );

// export default Profile;
