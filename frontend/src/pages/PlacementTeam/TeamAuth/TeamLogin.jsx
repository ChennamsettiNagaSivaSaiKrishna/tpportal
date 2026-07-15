import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import "../../../App.css"; 

const TeamLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/team-login", { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        
        // Security Check: Verify user has placement team clearance parameters
        if (!user.isplacementteammember) {
          setError("Access Denied: Restricted Administrative Context Block.");
          setLoading(false);
          return;
        }

        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", user.role);

        // Enforce Password Change Constraint Node before mounting home screen
        if (user.is_default_password) {
          navigate("/placement-team/reset-password");
        } else {
          navigate("/placement-team/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication baseline sync failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-auth-card">
        <div className="auth-header">
          <h3 className="auth-title">Placement Portal Node</h3>
          <p className="auth-subtitle">Administrative Secure Command Gateway Terminal</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label className="form-label">Corporate Email</label>
            <input 
              type="email" 
              className="form-input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@institution.org"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Temporary Access Token Token</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Decrypting Parameters..." : "Verify Identity"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamLogin;