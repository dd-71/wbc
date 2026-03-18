import axios from "axios";
import { clearAuthData } from "./authStorage";

export const setupAxiosInterceptor = (logout) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearAuthData();
        logout();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    },
  );
};
