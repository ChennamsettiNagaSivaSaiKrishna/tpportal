import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import API from "../../services/api";
import SkillManagement from "./SkillManagement/SkillManagement";
import SkillsAssessment from "./SkillsAssessment/SkillsAssessment";
import DriveCalendar from "./DriveCalendar/DriveCalendar";
import "../../App.css";
import { usePopup } from "../../context/PopupContext";

const StudentDashboard = () => {
  const { logout } = useAuth();
  const resumePrintRef = useRef();
  const { showPopup } = usePopup();

  // States
  const [activeTab, setActiveTab] = useState("metrics"); // metrics, placements, skills, info, resume
  const [profileData, setProfileData] = useState({
    fullName: "",
    rollNumber: "",
    email: "",
    branch: "",
    cgpa: 0,
    phoneNumber: "",
    verificationStatus: "",
    departmentId: "",
  });
  const [dashboardMetrics, setDashboardMetrics] = useState({
    applications: 0,
    verified: false,
    drives: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Skills Module States
  const [skillsList, setSkillsList] = useState([]);

  // ADD THESE TWO LINES HERE:
  const [isExamActive, setIsExamActive] = useState(false);
  const [selectedActiveSkillName, setSelectedActiveSkillName] = useState("");

  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    cgpa: "",
    rollNumber: "",
    activeBacklogs: "0",
    departmentId: "",
  });

  // Ephemeral Resume Generation States
  const [resumeData, setResumeData] = useState({
    summary: "",
    experience: "",
    projects: "",
    hobbies: "",
  });
  const [isResumeConfigured, setIsResumeConfigured] = useState(false);

  const isProfileComplete =
    profileData.branch && profileData.rollNumber && profileData.phoneNumber;

  // 10-Minute Activity Monitor Loop
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert("Session expired due to 10 minutes of inactivity.");
        logout();
      }, 600000);
    };
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeoutId);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [logout]);

  const fetchWorkspaceData = useCallback(async () => {
    try {
      setLoading(true);
      const profileRes = await API.get("/student/profile");
      let currentRollNumber = null;

      if (profileRes.data.success) {
        const p = profileRes.data.profile;
        setProfileData(p);
        currentRollNumber = p.rollNumber;
        setFormData({
          fullName: p.fullName || "",
          phoneNumber: p.phoneNumber || "",
          cgpa: p.cgpa ? p.cgpa.toString() : "",
          rollNumber: p.rollNumber || "",
          activeBacklogs: "0",
          departmentId: p.departmentId || "",
        });
      }

      const deptsRes = await API.get("/student/departments-list");
      if (deptsRes.data.success) setDepartments(deptsRes.data.departments);

      if (currentRollNumber) {
        const metricsRes = await API.get("/student/dashboard-metrics");
        if (metricsRes.data.success)
          setDashboardMetrics(metricsRes.data.metrics);

        const skillsRes = await API.get("/student/skills");
        if (skillsRes.data.success) setSkillsList(skillsRes.data.skills || []);
      }
    } catch (err) {
      console.error("Synchronization fault:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await API.put("/student/profile", {
        full_name: formData.fullName.trim(),
        mobile: formData.phoneNumber.trim(),
        cgpa: parseFloat(formData.cgpa),
        active_backlogs: parseInt(formData.activeBacklogs, 10),
        roll_number: formData.rollNumber.trim(),
        department_id: parseInt(formData.departmentId, 10),
      });
      if (res.data.success) {
        await fetchWorkspaceData();
        setActiveTab("metrics");
      }
    } catch (err) {
      alert("Error updating core profile metrics.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const triggerResumePrint = () => {
    window.print();
  };

  if (loading)
    return (
      <div
        className="portal-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Syncing Portal Context...
      </div>
    );

  const handleGenerateCertificatePDF = (skillItem) => {
    // Open a clean secondary printing canvas window stream context
    const printWindow = window.open("", "_blank", "width=900,height=650");

    const certificateHTML = `
        <html>
          <head>
            <title>Professional Competency Verification Certificate</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1e293b; text-align: center; padding: 3rem; }
              .cert-border { border: 8px double #10b981; padding: 2.5rem; border-radius: 4px; max-width: 800px; margin: 0 auto; }
              h1 { font-size: 2.75rem; color: #0f172a; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; }
              h3 { font-size: 1.25rem; color: #64748b; font-weight: 400; margin-top: 0; }
              .recipient-name { font-size: 2.25rem; font-weight: 800; color: #10b981; margin: 2rem 0; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 0.5rem; min-width: 400px; }
              .cert-text { font-size: 1.15rem; line-height: 1.6; color: #334155; margin: 1.5rem auto; max-width: 600px; }
              .meta-row { display: flex; justify-content: space-between; margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px dashed #cbd5e1; font-size: 0.95rem; color: #64748b; }
              .stamp { font-weight: 700; color: #10b981; letter-spacing: 2px; }
            </style>
          </head>
          <body>
            <div class="cert-border">
              <h3>TRAINING & PLACEMENT CELL</h3>
              <h1>Certificate of Proficiency</h1>
              <p class="cert-text">This document serves as formal confirmation of audited technical validation passing clearances achieved via secure proctored examination nodes.</p>
              <div class="recipient-name">${
                profileData.fullName || "Verified Student User"
              }</div>
              <p class="cert-text">has successfully demonstrated a verified operational competency profile mastery within the domain framework taxonomy of</p>
              <h2 style="font-size: 1.8rem; color: #0f172a; margin: 1rem 0;">${
                skillItem.skill_name
              }</h2>
              <p class="cert-text">achieving an official audited validation index baseline performance score metric rating of <strong>${
                skillItem.rating
              }%</strong>.</p>
              
              <div class="meta-row">
                <div><strong>Student Roll:</strong> ${
                  profileData.rollNumber
                }</div>
                <div class="stamp">VERIFIED NODE SECURITY</div>
                <div><strong>Issue Verification Date:</strong> ${new Date().toLocaleDateString()}</div>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }
            </script>
          </body>
        </html>
      `;

    printWindow.document.write(certificateHTML);
    printWindow.document.close();
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR NAVIGATION BAR CONTROL */}
      <aside className="workspace-sidebar">
        <div className="sidebar-main-nav">
          <div className="sidebar-brand">TP PORTAL</div>
          <div
            className={`sidebar-link ${
              activeTab === "metrics" && isProfileComplete ? "active-link" : ""
            }`}
            style={{ opacity: isProfileComplete ? 1 : 0.5 }}
            onClick={() => isProfileComplete && setActiveTab("metrics")}
          >
            Dashboard Home
          </div>
          <div
            className={`sidebar-link ${
              activeTab === "placements" && isProfileComplete
                ? "active-link"
                : ""
            }`}
            style={{ opacity: isProfileComplete ? 1 : 0.5 }}
            onClick={() => isProfileComplete && setActiveTab("placements")}
          >
            Open Placements
          </div>
          <div
            className={`sidebar-link ${
              activeTab === "skills" && isProfileComplete ? "active-link" : ""
            }`}
            style={{ opacity: isProfileComplete ? 1 : 0.5 }}
            onClick={() => isProfileComplete && setActiveTab("skills")}
          >
            Technical Skills
          </div>
          <div
            className={`sidebar-link ${
              activeTab === "calendar" && isProfileComplete ? "active-link" : ""
            }`}
            style={{ opacity: isProfileComplete ? 1 : 0.5 }}
            onClick={() => isProfileComplete && setActiveTab("calendar")}
          >
            DriveCalendar
          </div>
          <div
            className={`sidebar-link ${
              activeTab === "resume" && isProfileComplete ? "active-link" : ""
            }`}
            style={{ opacity: isProfileComplete ? 1 : 0.5 }}
            onClick={() => isProfileComplete && setActiveTab("resume")}
          >
            Resume Builder
          </div>
          <div
            className={`sidebar-link ${
              activeTab === "info" || !isProfileComplete ? "active-link" : ""
            }`}
            onClick={() => {
              setIsResumeConfigured(false);
              setActiveTab("info");
            }}
          >
            Profile Information {!isProfileComplete && "⚠️"}
          </div>
          <div
            className="sidebar-link"
            style={{ marginTop: "2rem", color: "#f87171" }}
            onClick={logout}
          >
            Log Out
          </div>
        </div>
      </aside>

      {/* DYNAMIC FRAME ROUTER VIEW CONTAINER */}
      <main
        className="workspace-content-frame"
        style={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        {/* REQUIREMENT 2: PROFILE DETAILS UPDATION VIEW POSITIONED EXACTLY IN THE DEAD CENTER */}
        {!isProfileComplete || activeTab === "info" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80vh",
              width: "100%",
            }}
          >
            <div style={{ width: "100%", maxWidth: "550px" }}>
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  fontWeight: "800",
                }}
              >
                Update Profile Details
              </h2>
              <form
                onSubmit={handleProfileSubmit}
                className="glass-auth-card"
                style={{ width: "100%" }}
              >
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Stream Branch</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                    className="form-input"
                    required
                  >
                    <option value="">
                      Choose your registered department...
                    </option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        [{d.dept_name}] {d.dept_full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, rollNumber: e.target.value })
                      }
                      className="form-input"
                      required
                      disabled={isProfileComplete}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Phone</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label">Aggregate CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.cgpa}
                      onChange={(e) =>
                        setFormData({ ...formData, cgpa: e.target.value })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Active Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.activeBacklogs}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          activeBacklogs: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="submit-btn"
                >
                  {submitLoading ? "Saving..." : "Sync Workspace Account"}
                </button>
              </form>
            </div>
          </div>
        ) : activeTab === "metrics" ? (
          /* VIEW PANEL A: ANALYTICS HOME VIEW WITH RATING PROGRESS BARS */
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", margin: 0 }}>
              Student Dashboard Workspace
            </h1>
            <p style={{ color: "var(--text-sub)", fontSize: "0.85rem" }}>
              Stream Branch: {profileData.branch}
            </p>

            <div
              className="metric-cards-row"
              style={{ marginTop: "1.5rem", marginBottom: "2rem" }}
            >
              <div className="metric-panel-card">
                <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>
                  VERIFICATION AUDIT
                </span>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    marginTop: "0.5rem",
                    color:
                      profileData.verificationStatus === "Clearance Verified"
                        ? "#10b981"
                        : "#f59e0b",
                  }}
                >
                  {profileData.verificationStatus}
                </h3>
              </div>
              <div className="metric-panel-card">
                <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>
                  VERIFIED CGPA
                </span>
                <h3 style={{ fontSize: "1.8rem", marginTop: "0.5rem" }}>
                  {Number(profileData.cgpa).toFixed(2)}
                </h3>
              </div>
              <div className="metric-panel-card">
                <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>
                  JOB APPLICATIONS
                </span>
                <h3 style={{ fontSize: "1.8rem", marginTop: "0.5rem" }}>
                  {dashboardMetrics.applications}
                </h3>
              </div>
            </div>

            {/* REQUIREMENT 1: RENDER TECHNICAL SKILLS RATINGS WITH CORE THEME PROGRESS BARS */}
            <div className="metric-panel-card" style={{ marginTop: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "1rem",
                  fontWeight: "700",
                }}
              >
                Configured Technical Skill Matrices
              </h3>
              {skillsList.length === 0 ? (
                <p style={{ color: "var(--text-sub)", fontSize: "0.85rem" }}>
                  No dynamic skills registered yet. Go to the skills tab to
                  configure.
                </p>
              ) : (
                <div
                  style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}
                >
                  {skillsList.map((s) => (
                    <div key={s.id} style={{ fontSize: "0.875rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span style={{ fontWeight: "600" }}>
                          {s.skill_name}
                        </span>
                        <span
                          style={{
                            color: "var(--accent-color)",
                            fontWeight: "700",
                          }}
                        >
                          {s.rating || 70}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          backgroundColor: "rgba(255,255,255,0.08)",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${s.rating || 70}%`,
                            height: "100%",
                            backgroundColor: "var(--accent-color)",
                            borderRadius: "4px",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "skills" ? (
          <div style={{ width: "100%" }}>
            {isExamActive ? (
              /* Swaps out Left Navigation Panel elements automatically by mounting the overlay viewport */
              <SkillsAssessment
                studentRoll={profileData.rollNumber}
                studentEmail={profileData.email}
                skillName={selectedActiveSkillName}
                onAssessmentClose={() => {
                  // 1. Close out the active workspace interface view layer node
                  setIsExamActive(false);

                  // 2. FIX: Re-run the workspace data fetcher loop to update attempts and status from DB immediately
                  fetchWorkspaceData();

                  console.log(
                    "[DASHBOARD PROCTOR] State synchronization matrices refreshed."
                  );
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                }}
              >
                <SkillManagement
                  studentRoll={profileData.rollNumber}
                  activeSkillsList={skillsList}
                  onSkillListUpdated={fetchWorkspaceData}
                />

                <div className="metric-panel-card">
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      marginBottom: "1rem",
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    Your Tracked Competencies
                  </h3>
                  {skillsList.length === 0 ? (
                    <p style={{ color: "var(--text-sub)" }}>
                      No skills logged.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: "1px solid var(--border-color)",
                              color: "var(--text-sub)",
                              fontSize: "0.8rem",
                            }}
                          >
                            <th
                              style={{ padding: "0.75rem", textAlign: "left" }}
                            >
                              Skill Name
                            </th>
                            <th
                              style={{ padding: "0.75rem", textAlign: "left" }}
                            >
                              Audited Score
                            </th>
                            <th
                              style={{ padding: "0.75rem", textAlign: "left" }}
                            >
                              Status
                            </th>
                            <th
                              style={{ padding: "0.75rem", textAlign: "right" }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {skillsList.map((s) => (
                            <tr
                              key={s.id}
                              style={{
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.02)",
                              }}
                            >
                              {/* 1. Skill Name Cell */}
                              <td
                                style={{
                                  padding: "0.75rem",
                                  color: "#fff",
                                  fontWeight: "600",
                                  textAlign: "left",
                                }}
                              >
                                {s.skill_name}
                              </td>

                              {/* 2. Audited Score Cell */}
                              <td
                                style={{
                                  padding: "0.75rem",
                                  color: "var(--accent-color)",
                                  fontWeight: "700",
                                  textAlign: "left",
                                }}
                              >
                                {s.assessment_status === "Verified"
                                  ? `${s.rating}%`
                                  : "0%"}
                              </td>

                              {/* 3. Dynamic Visual Status Badges */}
                              {/* 3. Dynamic Visual Status Badges */}
                              <td
                                style={{
                                  padding: "0.75rem",
                                  color: "var(--text-sub)",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "4px",
                                    background:
                                      s.assessment_status === "Verified"
                                        ? "rgba(16,185,129,0.1)"
                                        : s.assessment_status === "Malpractice"
                                        ? "rgba(239,68,68,0.15)" // Explicit red overlay tint for infraction tokens
                                        : s.assessment_status === "Failed"
                                        ? "rgba(239,68,68,0.1)"
                                        : "rgba(245,158,11,0.1)",
                                    color:
                                      s.assessment_status === "Verified"
                                        ? "#10b981"
                                        : s.assessment_status === "Malpractice"
                                        ? "#ef4444" // Strict high-visibility red
                                        : s.assessment_status === "Failed"
                                        ? "#ef4444"
                                        : "#f59e0b",
                                    fontWeight:
                                      s.assessment_status === "Malpractice"
                                        ? "700"
                                        : "normal",
                                  }}
                                >
                                  {s.assessment_status || "Not Initiated"}
                                </span>
                              </td>

                              {/* 4. FIXED ACTION CELL: Handles Certificate, Malpractice Locks, and Remainder Counts */}
                              <td
                                style={{
                                  padding: "0.75rem",
                                  textAlign: "right",
                                }}
                              >
                                <div
                                  style={{
                                    display: "inline-flex",
                                    gap: "0.5rem",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                  }}
                                >
                                  {/* CONDITION A: Show Certificate Download Link if Verified & Passed */}
                                  {s.assessment_status === "Verified" &&
                                    s.rating >= 60 && (
                                      <button
                                        onClick={() =>
                                          handleGenerateCertificatePDF(s)
                                        }
                                        className="submit-btn"
                                        style={{
                                          padding: "0.4rem 0.85rem",
                                          fontSize: "0.75rem",
                                          background: "#10b981",
                                          color: "#fff",
                                          border: "none",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          margin: 0,
                                          width: "auto",
                                        }}
                                      >
                                        Download Cert
                                      </button>
                                    )}

                                  {/* CONDITION B: Absolute Lockout -> Handles explicit Malpractice OR when unverified remaining attempts hit 0 */}
                                  {s.assessment_status === "Malpractice" ||
                                  (s.attempts_count !== null &&
                                    s.attempts_count !== undefined &&
                                    parseInt(s.attempts_count, 10) <= 0) ? (
                                    <button
                                      onClick={() => {
                                        const isMalpractice =
                                          s.assessment_status === "Malpractice";
                                        showPopup({
                                          title: isMalpractice
                                            ? "Terminal Security Lockout"
                                            : "Evaluation Node Locked",
                                          message: isMalpractice
                                            ? `Your exam path for ${s.skill_name} is locked due to an intentional proctor malpractice infraction. Please contact your HOD immediately.`
                                            : `Your exam terminal routing for ${s.skill_name} is permanently locked because all tracking attempts have been exhausted. Please contact your HOD or Admin for a re-test token.`,
                                          confirmText: "Close Metrics View",
                                        });
                                      }}
                                      className="submit-btn"
                                      style={{
                                        padding: "0.4rem 0.85rem",
                                        fontSize: "0.75rem",
                                        background: "#ef4444",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        margin: 0,
                                        width: "auto",
                                      }}
                                    >
                                      Contact HOD
                                    </button>
                                  ) : (
                                    /* CONDITION C: Permitted to Test -> Remaining attempts > 0 and status is unverified */
                                    s.assessment_status !== "Verified" && (
                                      <button
                                        onClick={() => {
                                          setSelectedActiveSkillName(
                                            s.skill_name
                                          );
                                          setIsExamActive(true);
                                          if (
                                            document.documentElement
                                              .requestFullscreen
                                          ) {
                                            document.documentElement
                                              .requestFullscreen()
                                              .catch(() => {});
                                          }
                                        }}
                                        className="submit-btn"
                                        style={{
                                          padding: "0.4rem 0.85rem",
                                          fontSize: "0.75rem",
                                          background: "#ffffff",
                                          color: "#000000",
                                          border: "none",
                                          borderRadius: "4px",
                                          fontWeight: "600",
                                          cursor: "pointer",
                                          margin: 0,
                                          width: "auto",
                                        }}
                                      >
                                        {/* Pulls remaining integer natively from database payload directly */}
                                        Take Assessment ({s.attempts_count ?? 3}{" "}
                                        left)
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "calendar" ? (
          <div className="dashboard-section-fade-container" style={{ width: "100%", padding: "0.25rem" }}>
            <DriveCalendar 
              studentCgpa={profileData?.cgpa || 0.00} 
              studentBranch={profileData?.branch || "CSE"} 
            />
          </div>
        ) : activeTab === "resume" ? (
          /* REQUIREMENT 3: EPHEMERAL INTERACTIVE RESUME BUILDER WORKSPACE Engine */
          <div>
            {!isResumeConfigured ? (
              <div style={{ maxWidth: "600px" }}>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    marginBottom: "0.5rem",
                  }}
                >
                  Compile Dynamic Resume Payload
                </h1>
                <p
                  style={{
                    color: "var(--text-sub)",
                    fontSize: "0.85rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  Provide contextual parameters to map your custom components
                  onto the CV workspace layout framework.
                </p>
                <div className="glass-auth-card">
                  <div className="form-group">
                    <label className="form-label">
                      Professional Summary Statement
                    </label>
                    <textarea
                      value={resumeData.summary}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          summary: e.target.value,
                        })
                      }
                      className="form-input"
                      rows="3"
                      placeholder="Ambitious Engineering student skilled in modern fullstack patterns..."
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Academic Projects Details
                    </label>
                    <textarea
                      value={resumeData.projects}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          projects: e.target.value,
                        })
                      }
                      className="form-input"
                      rows="3"
                      placeholder="Campus Drive Tracker Web App: Node, Express, MySQL backend..."
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Extracurricular Activities & Personal Hobbies
                    </label>
                    <textarea
                      value={resumeData.hobbies}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          hobbies: e.target.value,
                        })
                      }
                      className="form-input"
                      rows="2"
                      placeholder="Open source contributor, competitive programming competitor..."
                    ></textarea>
                  </div>
                  <button
                    onClick={() => {
                      if (resumeData.summary && resumeData.projects) {
                        setIsResumeConfigured(true);
                      } else {
                        alert("Please supply baseline fields first.");
                      }
                    }}
                    className="submit-btn"
                  >
                    Compile Preview Canvas
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <button
                    onClick={triggerResumePrint}
                    className="submit-btn"
                    style={{ width: "200px", margin: 0 }}
                  >
                    Download / Print CV
                  </button>
                  <button
                    onClick={() => setIsResumeConfigured(false)}
                    className="submit-btn"
                    style={{
                      width: "200px",
                      margin: 0,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  >
                    Edit Details
                  </button>
                </div>

                {/* VISUAL LAYOUT SHEET: INJECTS AN ALL-WHITE PRINT FORMAT OVERRIDING PORTAL GLASSMORPHISM */}
                <div
                  id="printable-cv-frame"
                  ref={resumePrintRef}
                  style={{
                    background: "#fff",
                    color: "#000",
                    padding: "2.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontFamily: "serif",
                    lineHeight: "1.5",
                  }}
                >
                  <div
                    style={{
                      borderBottom: "2px solid #000",
                      paddingBottom: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "1.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {profileData.fullName}
                    </h2>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "1rem",
                        fontSize: "0.85rem",
                        marginTop: "0.25rem",
                        fontFamily: "sans-serif",
                      }}
                    >
                      <span>Email: {profileData.email}</span>
                      <span>Phone: {profileData.phoneNumber}</span>
                      <span>Roll No: {profileData.rollNumber}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.25rem" }}>
                    <h4
                      style={{
                        margin: "0 0 0.25rem 0",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Academic Timeline
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>
                      <strong>Branch Stream:</strong> {profileData.branch}{" "}
                      Engineering Branch
                    </p>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>
                      <strong>Cumulative Metrics:</strong>{" "}
                      {Number(profileData.cgpa).toFixed(2)} CGPA Score Matrix
                    </p>
                  </div>

                  <div style={{ marginBottom: "1.25rem" }}>
                    <h4
                      style={{
                        margin: "0 0 0.25rem 0",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Professional Summary
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        textAlign: "justify",
                      }}
                    >
                      {resumeData.summary}
                    </p>
                  </div>

                  <div style={{ marginBottom: "1.25rem" }}>
                    <h4
                      style={{
                        margin: "0 0 0.25rem 0",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Core Skillsets Stack
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                      }}
                    >
                      {skillsList
                        .map((s) => `${s.skill_name} (${s.rating}%)`)
                        .join(", ")}
                    </p>
                  </div>

                  <div style={{ marginBottom: "1.25rem" }}>
                    <h4
                      style={{
                        margin: "0 0 0.25rem 0",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Projects Undertaken
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {resumeData.projects}
                    </p>
                  </div>

                  {resumeData.hobbies && (
                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.25rem 0",
                          textTransform: "uppercase",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Extracurricular Coordinates
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>
                        {resumeData.hobbies}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800" }}>
              Hiring Drive Records
            </h1>
            <p style={{ color: "var(--text-sub)" }}>
              Synchronizing available recruitment drives table parameters...
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
