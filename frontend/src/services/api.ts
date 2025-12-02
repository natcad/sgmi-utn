import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true, // Importante: permite enviar/recibir cookies
});

api.interceptors.request.use((config) => {
  // El Access Token SÍ puede estar en localStorage (o memoria)
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// --- Lógica para manejar Concurrencia (Queue) ---
let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 🔹 Interceptor de Respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es un error 401 y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // CASO A: Ya se está refrescando el token (Concurrencia)
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // CASO B: Es el primero en fallar, iniciamos el refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 1. Llamamos al backend. NO enviamos nada en el body.
        // La cookie 'refreshToken' viaja sola gracias a `withCredentials: true` en la instancia 'api'
        // o explícitamente aquí si usaras una instancia diferente.
        const { data } = await api.post("/auth/refresh"); 
        
        // Asumiendo que tu backend devuelve { accessToken: "..." }
        const newAccessToken = data.accessToken;

        // 2. Guardamos el nuevo access token
        localStorage.setItem("accessToken", newAccessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        
        // 3. Procesamos la cola de peticiones que estaban esperando
        processQueue(null, newAccessToken);

        // 4. Reintentamos la petición original
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Si el refresh falla (cookie expirada o inválida)
        processQueue(refreshError, null);
        
        // Limpiamos todo y redirigimos
        localStorage.removeItem("accessToken");
        // No podemos borrar la cookie desde JS (HttpOnly), el backend debería haberla borrado o lo hará el navegador al expirar.
        
        // Solo redirigimos si estamos en el cliente (evita errores en SSR si usas Next.js)
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;