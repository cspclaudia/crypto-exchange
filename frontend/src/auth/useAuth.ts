import { useState, useCallback, useEffect } from "react";
import { authEvents } from "./authEvents";

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  const [userType, setUserType] = useState<string | null>(() =>
    localStorage.getItem("userType"),
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("refreshToken");

    setTokenState(null);
    setUserType(null);

    window.location.href = "/login";
  }, []);

  useEffect(() => {
    authEvents.setLogoutHandler(logout);
  }, [logout]);

  const setToken = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken);
    setTokenState(newToken);
  }, []);

  return {
    token,
    userType,
    setToken,
    logout,
  };
}
