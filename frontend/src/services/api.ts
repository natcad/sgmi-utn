import axios from "axios";

const api = axios.create({
  baseURL: 
 "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// 🔹 Interceptor para refrescar el token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // si expira el token y no se ha reintetado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // Limpiar tokens y redirigir al login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // pedir nuevo accessToken
        const refresh = await axios.post(
          "http://localhost:4000/api/auth/refresh",
          { refreshToken } // 👈 MANDARLO EN EL BODY
        );

        const newAccessToken = refresh.data.accessToken;

        // guardar nuevo token
        localStorage.setItem("accessToken", newAccessToken);

        // actualizar headers
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // reintentar request original
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
