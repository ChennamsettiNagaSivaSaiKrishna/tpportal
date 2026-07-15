import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import "../../../App.css";

const ForcePasswordReset = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Security Threshold Fault: Password must encompass ≥ 8 alphanumeric variables.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Parameter Mismatch: Input passwords do not synchronize.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/team-enforce-reset", { newPassword });
      if (res.data.success) {
        navigate("/placement-team/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update systemic parameters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-auth-card">
        <div className="auth-header">
          <h3 className="auth-title">Initialize Profile</h3>
          <p className="auth-subtitle">You must overwrite your default temporary password token before accessing deployment analytics.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handlePasswordUpdate}>
          <div className="form-group">
            <label className="form-label">New Secure Password</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Re-encrypting Matrix Nodes..." : "Deploy Active Parameters"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordReset;