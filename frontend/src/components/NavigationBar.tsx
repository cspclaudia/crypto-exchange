import React, { useState } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  onLogout: () => void;
  userType?: string | null;
}

const NavigationBar: React.FC<Props> = ({ onLogout, userType }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleNavbar = () => setIsCollapsed(prev => !prev);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    "nav-link" + (isActive ? " active" : "");

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid px-3">
        <span className="navbar-brand">BTC Exchange</span>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
          onClick={toggleNavbar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse${!isCollapsed ? " show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/statistics" className={navLinkClass}>
                Statistics
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/trades" className={navLinkClass}>
                Global Matches
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/buy-sell" className={navLinkClass}>
                Buy / Sell
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/active" className={navLinkClass}>
                My Active Orders
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/history" className={navLinkClass}>
                My History
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/book" className={navLinkClass}>
                Bid / Ask
              </NavLink>
            </li>
            {userType === "ADMIN" && (
              <li className="nav-item">
                <NavLink to="/users" className={navLinkClass}>
                  Users
                </NavLink>
              </li>
            )}
          </ul>

          <button
            className="btn btn-outline-light"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;