import axios from "axios";

const api = axios.create({
  baseURL: 
 "http://localhost:4000/api",
  withCredentials: true,
});
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = await api.post("/auth/refresh");

        const newAccessToken = refresh.data.accessToken;

        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        console.error("Error al refrescar token", err);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
