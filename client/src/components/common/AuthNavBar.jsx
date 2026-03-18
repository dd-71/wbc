import React, { useState, useRef, useContext } from "react";
import { MdNotificationsNone, MdDarkMode, MdLogout, MdPerson } from "react-icons/md";
import Breadcrumb from "./Breadcrumb";
import { Link, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { useClickOutside } from "../Hooks/useClickOutSide";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from './../../context/AuthProvider';
import LogoutAlertModal from "./Modals/LogoutAlertModal";
import Avatar from "./Avatar";


const AuthNavBar = () => {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const domNode = useClickOutside(() => setOpen(false))
  const [logoutModal, setLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);


  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/signout`, { withCredentials: true });
      // toast.success(response.data.message)
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
      // toast.error(error.response.data.message)
    } finally {
      setLoggingOut(false);
      setLogoutModal(false);
    }
  };

  // console.log(user)

  return (
    <header className="w-full sticky z-50 top-0 h-16 bg-white px-5 border-b border-slate-200 flex items-center justify-between">

      <Breadcrumb />

      <div className="flex items-center gap-2 relative">

        <button className="p-2 rounded-full hover:bg-slate-100 transition">
          <MdDarkMode size={20} />
        </button>

        <button className="relative p-2 rounded-full hover:bg-slate-100 transition">
          <MdNotificationsNone size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition"
          >
            <Avatar
              src={user?.profilePicture}
              name={user?.username}
              size="w-9 h-9"
              textSize="text-sm"
            />

            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-primaryColor leading-none">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500">
                {role}
              </p>
            </div>
          </button>

          {open && (
            <div ref={domNode} className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg overflow-hidden">
              <Link
                to={'/profile'}
                onClick={() => {
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
              >
                <MdPerson size={18} />
                View Profile
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  setLogoutModal(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <MdLogout size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <LogoutAlertModal
        open={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
      />

    </header>
  );
};

export default AuthNavBar;
