export const setAuthData = ({ user, accessToken }) => {
  localStorage.setItem("token", accessToken);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("role", user.role.roleName);
  // localStorage.setItem(
  //   "permissions",
  //   JSON.stringify(user.permissions?.permissions || [])
  // );
};

export const getAuthUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getAuthRole = () => {
  return localStorage.getItem("role");
};

export const getAuthPermissions = () =>
  JSON.parse(localStorage.getItem("permissions"));

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  // localStorage.removeItem("permissions");
};
