import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useRights } from "../../context/RightsContext";
import "../../App.css";

const TeamSidebar = ({ activeNode }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hasRight, loadingRights } = useRights();

  // Unified Master Navigation Catalog mapped strictly to DB Right Codes
  const masterTeamNavigation = [
    {
      key: "home",
      label: "Dashboard Overview",
      icon: "📊",
      path: "/placement-team/dashboard",
      right: "NAV_METRICS",
    },
    // Placement Head Modules
    {
      key: "approve",
      label: "Drive Approvals",
      icon: "⚖️",
      path: "/placement-team/approve-drives",
      right: "NAV_APPROVE_DRIVES",
    },
    {
      key: "analysis",
      label: "Salary Insights",
      icon: "📈",
      path: "/placement-team/salary-analysis",
      right: "NAV_SALARY_INSIGHTS",
    },
    {
      key: "lock",
      label: "Season Parameters",
      icon: "🔒",
      path: "/placement-team/season-lock",
      right: "NAV_SEASON_LOCK",
    },
    // Placement Officer Modules
    {
      key: "manage",
      label: "Corporate Drives",
      icon: "💼",
      path: "/placement-team/manage-drives",
      right: "NAV_MANAGE_DRIVES",
    },
    {
      key: "shortlists",
      label: "Student Shortlists",
      icon: "📋",
      path: "/placement-team/shortlists",
      right: "NAV_SHORTLISTS",
    },
    {
      key: "crm",
      label: "HR Channels",
      icon: "🤝",
      path: "/placement-team/crm-relations",
      right: "NAV_CRM_RELATIONS",
    },
    // Training Head Modules
    {
      key: "skills",
      label: "Technical Skills Matrix",
      icon: "💻",
      path: "/placement-team/skills-tracker",
      right: "NAV_SKILLS_TRACKER",
    },
    {
      key: "courses",
      label: "Training Batches",
      icon: "📚",
      path: "/placement-team/aptitude-courses",
      right: "NAV_TRAINING_BATCHES",
    },
    {
      key: "assessments",
      label: "Mock Evaluations",
      icon: "📝",
      path: "/placement-team/assessments",
      right: "NAV_MOCK_EVALUATIONS",
    },
    // Placement Coordinator Modules
    {
      key: "verify",
      label: "Profile Verifications",
      icon: "🔍",
      path: "/placement-team/verify-profiles",
      right: "NAV_STUDENT_VERIFY",
    },
    {
      key: "attendance",
      label: "Attendance Tracking",
      icon: "⏱️",
      path: "/placement-team/attendance-logs",
      right: "NAV_ATTENDANCE_LOGS",
    },
    {
      key: "outcomes",
      label: "Stage Progress Logs",
      icon: "🏁",
      path: "/placement-team/drive-outcomes",
      right: "NAV_DRIVE_OUTCOMES",
    },
  ];

  // Dynamically filter active sidebar items based on database permissions
  const allowedNavItems = masterTeamNavigation.filter((item) =>
    hasRight(item.right)
  );

  // Helper mapping to generate avatar initials dynamically from user identity
  const getAvatarInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "PT";
  };

  const handleLogOut = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      navigate("/login");
    }
  };

  if (loadingRights) {
    return (
      <aside className="workspace-sidebar" style={{ padding: "1.5rem", color: "#94a3b8" }}>
        Loading permissions...
      </aside>
    );
  }

  return (
    <aside className="workspace-sidebar">
      <div className="sidebar-main-nav">
        {/* BRAND IDENTITY HEADER CONTAINER */}
        <div className="sidebar-brand">
          <span className="nav-logo-marker"></span>
          <span className="nav-brand-title">TP Admin Command</span>
        </div>

        {/* DYNAMIC RBAC DRIVEN NAVIGATION LINKS */}
        {allowedNavItems.map((item) => (
          <div
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`sidebar-link ${activeNode === item.key ? "active-link" : ""}`}
            style={{ cursor: "pointer" }}
          >
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
      </div>

      {/* SYSTEM LOGOUT TERMINAL MODULE ACTION TRIGGER */}
      <div>
        <div
          onClick={handleLogOut}
          className="sidebar-link"
          style={{ color: "#ef4444", marginBottom: "1rem", cursor: "pointer" }}
        >
          <span>🚪</span> Disconnect Session
        </div>

        {/* FOOTER METADATA PROFILE DISPLAY COMPONENT FRAME */}
        <div className="sidebar-profile-footer">
          <div className="profile-avatar">{getAvatarInitials()}</div>
          <div className="profile-info-block">
            <span
              className="profile-meta-name"
              style={{
                textTransform: "capitalize",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                maxWidth: "140px",
              }}
            >
              {user?.full_name || user?.email || "Authorized Member"}
            </span>
            <span className="profile-meta-email">Active Node</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TeamSidebar;