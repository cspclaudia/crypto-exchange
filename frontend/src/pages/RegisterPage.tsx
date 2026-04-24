import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import api from "../api/api";

interface RegisterProps {
  onRegisterSuccess: (token: string) => void;
}

const validatePassword = (password: string) => {
  return {
    length: password.length >= 6,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[@$!%*?#&_]/.test(password),
  };
};

const RegisterPage: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const passwordValidation = validatePassword(password);
  const allPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!allPasswordValid) {
      setError("The password does not meet the security requirements.");
      setShowPasswordValidation(true);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/register", {
        username,
        password,
      });

      if (!response?.data || !response.data.accessToken) {
        setError("Invalid server response. Please try again.");
        return;
      }

      const token = response.data.accessToken;

      setSuccess("Registration completed successfully!");
      onRegisterSuccess(token);

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Error during registration. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Register</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setShowPasswordValidation(true);
              }}
              onFocus={() => setShowPasswordValidation(true)}
              required
              disabled={loading}
            />
            <span
              className="input-group-text"
              style={{ cursor: "pointer" }}
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  togglePasswordVisibility();
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {showPasswordValidation && (
            <div className="mt-2" style={{ fontSize: "0.9rem" }}>
              <PasswordValidationDisplay validation={passwordValidation} />
            </div>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="text-center mt-3">
        Already have an account?
        <br />
        <button
          type="button"
          className="btn btn-link"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          Login
        </button>
      </div>

      <div className="mb-5" />
    </div>
  );
};

const PasswordValidationDisplay: React.FC<{
  validation: ReturnType<typeof validatePassword>;
}> = ({ validation }) => {
  const validationList = [
    { label: "At least 6 characters", valid: validation.length },
    { label: "Uppercase letter", valid: validation.uppercase },
    { label: "Lowercase letter", valid: validation.lowercase },
    { label: "Number", valid: validation.number },
    {
      label: "Special character (@$!%*?#&_)",
      valid: validation.specialChar,
    },
  ];

  return (
    <>
      {validationList.map((item, index) => (
        <div key={index} style={{ color: item.valid ? "green" : "red" }}>
          {item.valid ? (
            <FaCheckCircle style={{ marginRight: 4 }} />
          ) : (
            <FaTimesCircle style={{ marginRight: 4 }} />
          )}
          {item.label}
        </div>
      ))}
    </>
  );
};

export default RegisterPage;
