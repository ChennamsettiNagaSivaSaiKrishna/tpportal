import React from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css"; 

const TeamSidebar = ({ activeNode, role }) => {
  const navigate = useNavigate();

  // Clear session parameters completely on logout
  const handleLogOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  // Helper mapping to read clear text tags for the footer profile avatar initials
  const getAvatarInitials = (roleString) => {
    if (!roleString) return "PT";
    return roleString
      .split("-")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <aside className="workspace-sidebar">
      <div className="sidebar-main-nav">
        
        {/* BRAND IDENTITY HEADER CONTAINER */}
        <div className="sidebar-brand">
          <span className="nav-logo-marker"></span>
          <span className="nav-brand-title">TP Admin Command</span>
        </div>

        {/* CORE ADMINISTRATIVE PATH MODULES - VISIBLE TO ALL PLACEMENT TEAM MEMBER CLUSTERS */}
        <div 
          onClick={() => navigate("/placement-team/dashboard")}
          className={`sidebar-link ${activeNode === "home" ? "active-link" : ""}`}
        >
          <span>📊</span> Dashboard Overview
        </div>

        {/* ==========================================================================
           ROLE-BASED DYNAMIC NAVIGATION ACCESS CONTROLS (RBAC)
           ========================================================================== */}

        {/* 1. PLACEMENT HEAD CONTEXT STRIPS */}
        {role === "placement-head" && (
          <>
            <div 
              onClick={() => navigate("/placement-team/approve-drives")}
              className={`sidebar-link ${activeNode === "approve" ? "active-link" : ""}`}
            >
              <span>⚖️</span> Drive Approvals
            </div>
            <div 
              onClick={() => navigate("/placement-team/salary-analysis")}
              className={`sidebar-link ${activeNode === "analysis" ? "active-link" : ""}`}
            >
              <span>📈</span> Salary Insights
            </div>
            <div 
              onClick={() => navigate("/placement-team/season-lock")}
              className={`sidebar-link ${activeNode === "lock" ? "active-link" : ""}`}
            >
              <span>🔒</span> Season Parameters
            </div>
          </>
        )}

        {/* 2. PLACEMENT OFFICER CONTEXT STRIPS */}
        {role === "placement-officer" && (
          <>
            <div 
              onClick={() => navigate("/placement-team/manage-drives")}
              className={`sidebar-link ${activeNode === "manage" ? "active-link" : ""}`}
            >
              <span>💼</span> Corporate Drives
            </div>
            <div 
              onClick={() => navigate("/placement-team/shortlists")}
              className={`sidebar-link ${activeNode === "shortlists" ? "active-link" : ""}`}
            >
              <span>📋</span> Student Shortlists
            </div>
            <div 
              onClick={() => navigate("/placement-team/crm-relations")}
              className={`sidebar-link ${activeNode === "crm" ? "active-link" : ""}`}
            >
              <span>🤝</span> HR Channels
            </div>
          </>
        )}

        {/* 3. TRAINING HEAD CONTEXT STRIPS */}
        {role === "training-head" && (
          <>
            <div 
              onClick={() => navigate("/placement-team/skills-tracker")}
              className={`sidebar-link ${activeNode === "skills" ? "active-link" : ""}`}
            >
              <span>💻</span> Technical Skills Matrix
            </div>
            <div 
              onClick={() => navigate("/placement-team/aptitude-courses")}
              className={`sidebar-link ${activeNode === "courses" ? "active-link" : ""}`}
            >
              <span>📚</span> Training Batches
            </div>
            <div 
              onClick={() => navigate("/placement-team/assessments")}
              className={`sidebar-link ${activeNode === "assessments" ? "active-link" : ""}`}
            >
              <span>📝</span> Mock Evaluations
            </div>
          </>
        )}

        {/* 4. PLACEMENT CO-ORDINATOR CONTEXT STRIPS */}
        {role === "placement-coordinator" && (
          <>
            <div 
              onClick={() => navigate("/placement-team/verify-profiles")}
              className={`sidebar-link ${activeNode === "verify" ? "active-link" : ""}`}
            >
              <span>🔍</span> Profile Verifications
            </div>
            <div 
              onClick={() => navigate("/placement-team/attendance-logs")}
              className={`sidebar-link ${activeNode === "attendance" ? "active-link" : ""}`}
            >
              <span>⏱️</span> Attendance Tracking
            </div>
            <div 
              onClick={() => navigate("/placement-team/drive-outcomes")}
              className={`sidebar-link ${activeNode === "outcomes" ? "active-link" : ""}`}
            >
              <span>🏁</span> Stage Progress Logs
            </div>
          </>
        )}

      </div>

      {/* SYSTEM LOGOUT TERMINAL MODULE ACTION TRIGGER */}
      <div>
        <div 
          onClick={handleLogOut}
          className="sidebar-link" 
          style={{ color: "#ef4444", marginBottom: "1rem" }}
        >
          <span>🚪</span> Disconnect Session
        </div>

        {/* FOOTER METADATA PROFILE DISPLAY COMPONENT FRAME */}
        <div className="sidebar-profile-footer">
          <div className="profile-avatar">
            {getAvatarInitials(role)}
          </div>
          <div className="profile-info-block">
            <span className="profile-meta-name" style={{ textTransform: "capitalize" }}>
              {role?.replace("-", " ")}
            </span>
            <span className="profile-meta-email">Internal Node</span>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default TeamSidebar;