import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import { sessionChannel } from "./auth/sessionChannel";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StatisticsPage from "./pages/StatisticsPage";
import GlobalMatchesPage from "./pages/GlobalMatchesPage";
import BuySellPage from "./pages/BuySellPage";
import MyActiveOrdersPage from "./pages/MyActiveOrdersPage";
import MyHistoryPage from "./pages/MyHistoryPage";
import BidAskPage from "./pages/BidAskPage";
import UserListPage from "./pages/UserListPage";
import PrivateRoute from "./components/PrivateRoute";
import NavigationBar from "./components/NavigationBar";
import SessionManager from "./components/SessionManager";

const AppRoutes = () => {
  const { token, userType, logout, setToken } = useAuth();
  const isAuthenticated = !!token;

  useEffect(() => {
    const unsubscribe = sessionChannel.onLogout(() => {
      logout();
    });

    return () => {
      unsubscribe();
      sessionChannel.close();
    };
  }, [logout]);

  return (
    <BrowserRouter>
      {isAuthenticated && <SessionManager />}

      {isAuthenticated && (
        <NavigationBar userType={userType} onLogout={logout} />
      )}

      <Routes>
        {!isAuthenticated ? (
          <>
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={setToken} />}
            />
            <Route
              path="/register"
              element={<RegisterPage onRegisterSuccess={setToken} />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/statistics"
              element={
                <PrivateRoute token={token}>
                  <StatisticsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/trades"
              element={
                <PrivateRoute token={token}>
                  <GlobalMatchesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/buy-sell"
              element={
                <PrivateRoute token={token}>
                  <BuySellPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/book"
              element={
                <PrivateRoute token={token}>
                  <BidAskPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/active"
              element={
                <PrivateRoute token={token}>
                  <MyActiveOrdersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute token={token}>
                  <MyHistoryPage />
                </PrivateRoute>
              }
            />
            {userType === "ADMIN" && (
              <Route
                path="/users"
                element={
                  <PrivateRoute token={token}>
                    <UserListPage />
                  </PrivateRoute>
                }
              />
            )}
            <Route path="*" element={<Navigate to="/statistics" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;