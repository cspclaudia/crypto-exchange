import axios from "axios";
import { sessionState } from "../auth/sessionState";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

let isRefreshing = false;

let queue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  queue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (sessionState.getIdle()) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) return Promise.reject(error);

    try {
      const res = await axios.post(
        `${api.defaults.baseURL}/refresh-token`,
        { refreshToken },
      );

      const newToken = res.data.accessToken;

      localStorage.setItem("token", newToken);

      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;

      return api(original);
    } catch (err) {
      processQueue(err, null);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
