import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthLayout from "./routes/middlewares/AuthLayout";
import { adminNonAuthRoutes, authRoutes } from "./routes/allRoutes";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import ProtectedRoute from "./routes/middlewares/ProtectedRoute";
import DashboardSkeleton from "./components/Skeletons/DashboardSkeleton";
import NotFound from "./screens/Auth/NotFound";
import PermissionRoute from "./routes/middlewares/PermissionRoute";
import Profile from "./screens/Auth/Profile";

const App = () => {
  const { permissions, token } = useAuth();

  if (token && !permissions) {
    return <DashboardSkeleton />;
  }

  const renderAuthRoutes = (routes) =>
    routes.map((route, index) => {
      if (route.children) {
        return (
          <Route key={index} path={route.path}>
            {route.children.map((child, index) => (
              <Route key={index} path={child.path} element={child.element} />
            ))}
          </Route>
        );
      }
      return <Route key={index} path={route.path} element={route.element} />;
    });

  const renderAdminNoAuthRoutes = (routes) =>
    routes.map((route, index) => (
      <Route key={index} path={route.path} element={route.element} />
    ));

  return (
    <>
      <BrowserRouter>
        <div className="tracking-wide font-BeVietnamPro">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <PermissionRoute>
                    <AuthLayout />
                  </PermissionRoute>
                </ProtectedRoute>
              }
            >
              {renderAuthRoutes(authRoutes)}
              <Route path="profile" element={<Profile />} />
            </Route>
            {renderAdminNoAuthRoutes(adminNonAuthRoutes)}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster position="top-center" />
      </BrowserRouter>
    </>
  );
};

export default App;
