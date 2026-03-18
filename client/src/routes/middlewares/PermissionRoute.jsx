import { useAuth } from "../../context/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";
import { hasComponentAccess, hasSubAccess } from "../../utils/permissionHelpers";
import DashboardSkeleton from "../../components/AdminSideComponents/Dashboard/DashboardSkeleton";

const PermissionRoute = ({ children }) => {
  const { permissions, permissionsLoading } = useAuth();
  const { pathname } = useLocation();
  // console.log(pathname)
  // console.log(permissions)

  // console.log(hasComponentAccess(permissions,pathname))

  if (permissionsLoading) {
    return <DashboardSkeleton />
  }

  if (pathname === "/profile") {
    return children;
  }

  const allowed =
    hasComponentAccess(permissions, pathname) ||
    hasSubAccess(permissions, pathname);
  // console.log(allowed)

  if (!allowed) return <Navigate to="/not-found" replace />;

  return children;
};

export default PermissionRoute;
