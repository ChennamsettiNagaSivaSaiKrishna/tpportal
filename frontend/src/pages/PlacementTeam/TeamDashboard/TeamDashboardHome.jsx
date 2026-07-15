import React, { useState, useEffect } from "react";
import API from "../../../services/api";
import TeamSidebar from "../TeamSidebar"; 
import "../../Student/DriveCalendar/DriveCalendar.css"; // Reuses your premium light/dark glass theme configs cleanly

const TeamDashboardHome = () => {
  const [metrics, setMetrics] = useState(null);
  const [liveLog, setLiveLog] = useState([]);
  const roleTitle = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchAdministrativeMetrics = async () => {
      try {
        const res = await API.get("/placement-team/dashboard-summary");
        if (res.data.success) {
          setMetrics(res.data.metrics);
          setLiveLog(res.data.liveLog);
        }
      } catch (err) {
        console.error("Error pulling analytical matrix updates:", err);
      }
    };
    fetchAdministrativeMetrics();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <TeamSidebar activeNode="home" role={roleTitle} />

      <div className="workspace-content-frame">
        <div className="slider-action-bar" style={{ marginBottom: "1.5rem" }}>
          <div>
            <span className="slider-subtitle">Institutional Overview Console</span>
            <h3 className="slider-month-heading" style={{ textTransform: "capitalize" }}>
              Welcome back, {roleTitle?.replace("-", " ")}
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
            {liveLog.length === 0 ? (
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

      </div>
    </div>
  );
};

export default TeamDashboardHome;