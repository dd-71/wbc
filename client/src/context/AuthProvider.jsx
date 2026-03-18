import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuthUser,
  getAuthRole,
  clearAuthData,
  getAuthToken,
  getAuthPermissions,
} from "../utils/authStorage";
import axios from "axios";
import { setupAxiosInterceptor } from "../utils/axiosInterceptor";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getAuthUser());
  const [role, setRole] = useState(() => getAuthRole());
  const [token, setToken] = useState(() => getAuthToken());
  const [permissions, setPermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/me`,
        { withCredentials: true }
      );
      // console.log(res.data)

      setUser(res.data.data);
      setRole(res.data.data.role.roleName);
    } catch (err) {
      // toast.error("Session expired. Please log in again.");
      // console.error("Profile fetch failed", err);
      logout();
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      setPermissionsLoading(true)
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/permissions/${userId}-permissions`,
        // { withCredentials: true }
      );

      setPermissions(res.data.data.permissions || []);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
      setPermissions([]);
    } finally {
      setPermissionsLoading(false)
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/role/get-all`,
        { withCredentials: true }
      );
      setRoles(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/branch/get/`,
        { withCredentials: true }
      );
      setBranches(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchUserPermissions(user._id);
    }
  }, [user]);
  // console.log(user)

  useEffect(() => {
    // if (token) {
    fetchProfile();
    // }
  }, []);


  useEffect(() => {
    fetchBranches()
    fetchRoles();
  }, []);

  const logout = () => {
    clearAuthData();
    setUser(null);
    setRole(null);
    setToken(null);
    setPermissions([])
  };

  useEffect(() => {
    if (token) {
      setupAxiosInterceptor(logout);
    }
  }, [token]);

  const isSuperAdmin = role === "super-admin"
  const isAdmin = role === "admin"

  return (
    <AuthContext.Provider value={{ user, role, setUser, setRole, logout, token, permissions, setPermissions, branches, roles, permissionsLoading, isSuperAdmin, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
