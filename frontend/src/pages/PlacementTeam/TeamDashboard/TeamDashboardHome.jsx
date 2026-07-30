import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useRights } from "../../../context/RightsContext";
import API from "../../../services/api";
import TeamSidebar from "../TeamSidebar"; 
import "../../Student/DriveCalendar/DriveCalendar.css"; // Reuses light/dark glass theme configs

const TeamDashboardHome = () => {
  const [metrics, setMetrics] = useState(null);
  const [liveLog, setLiveLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);
  const { hasRight, loadingRights } = useRights();

  // 🔒 DB Right Check for Dashboard Overview
  const hasDashboardAccess = hasRight("NAV_METRICS");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardRes = await API.get("/placement-team/dashboard-summary");

        if (dashboardRes.data && dashboardRes.data.success) {
          setMetrics(dashboardRes.data.metrics);
          setLiveLog(dashboardRes.data.liveLog || []);
        }
      } catch (err) {
        console.error("Failed to query placement dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (hasDashboardAccess) {
      fetchDashboardData();
    }
  }, [hasDashboardAccess]);

  if (loadingRights) {
    return (
      <div style={{ color: "#94a3b8", padding: "3rem", textAlign: "center", background: "#0a0c10", minHeight: "100vh" }}>
        Resolving Authorization Rights...
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Dynamic RBAC Sidebar (Role prop removed, sidebar checks DB rights natively) */}
      <TeamSidebar activeNode="home" />

      <div className="workspace-content-frame">
        {!hasDashboardAccess ? (
          <div style={{ padding: "3rem", textAlign: "center", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            🛑 Access Denied: Your profile lacks NAV_METRICS database permissions to view the Dashboard Overview.
          </div>
        ) : (
          <>
            <div className="slider-action-bar" style={{ marginBottom: "1.5rem" }}>
              <div>
                <span className="slider-subtitle">Institutional Overview Console</span>
                <h3 className="slider-month-heading" style={{ textTransform: "capitalize" }}>
                  Welcome back, {user?.full_name || user?.email || "Authorized Member"}
                </h3>
              </div>
            </div>

            {/* SECTION 1: TACTILE COUNTER CARDS MESH */}
            <div className="slider-details-responsive-grid" style={{ marginBottom: "2rem" }}>
              <div className="elegant-corporate-card">
                <span className="slider-subtitle">Placement Velocity</span>
                <h2 className="corp-company-name" style={{ fontSize: "2.5rem", margin: "0.5rem 0" }}>
                  {metrics?.placementRate || "94.2"}%
                </h2>
                <div className="corp-role-tag">Active Season Metric</div>
              </div>

              <div className="elegant-corporate-card">
                <span className="slider-subtitle">Allocated Corporate Slots</span>
                <h2 className="corp-company-name" style={{ fontSize: "2.5rem", margin: "0.5rem 0" }}>
                  {metrics?.totalCompanies || "44"}
                </h2>
                <div className="corp-role-tag">Verified Job Pipelines Deployed</div>
              </div>

              <div className="elegant-corporate-card">
                <span className="slider-subtitle">Average Package Index</span>
                <h2 className="corp-company-name" style={{ fontSize: "2.5rem", margin: "0.5rem 0" }}>
                  {metrics?.averageCtc || "6.8"} LPA
                </h2>
                <div className="corp-role-tag">Cross-Stream Allocation Midpoint</div>
              </div>
            </div>

            {/* SECTION 2: LIVE DRIVE MONITOR TRACK TIMELINE */}
            <div className="slider-panel-card">
              <h4 className="details-header-label" style={{ marginBottom: "1rem" }}>
                Real-time Selection Pipeline Stream
              </h4>
              <div className="corp-criteria-specs" style={{ gap: "0.75rem" }}>
                {loading ? (
                  <div style={{ color: "var(--text-sub)", fontSize: "0.85rem" }}>
                    Querying live updates from cluster...
                  </div>
                ) : liveLog.length === 0 ? (
                  <div style={{ color: "var(--text-sub)", fontSize: "0.85rem" }}>
                    Monitoring matrix idle. Waiting for inbound corporate feedback streams...
                  </div>
                ) : (
                  liveLog.map((log) => (
                    <div key={log.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "0.5rem" }}>
                      <div>
                        <strong style={{ color: "var(--accent-color)" }}>{log.company_name}</strong>
                        <span style={{ marginLeft: "0.5rem", color: "var(--text-main)" }}>{log.activity_update}</span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>{log.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamDashboardHome;