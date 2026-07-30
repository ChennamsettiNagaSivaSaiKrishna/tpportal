import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRights } from "../../context/RightsContext";
import API from "../../services/api";
import SkillManagement from "./SkillManagement/SkillManagement";
import SkillsAssessment from "./SkillsAssessment/SkillsAssessment";
import DriveCalendar from "./DriveCalendar/DriveCalendar";
import AttendanceWorkspace from "../Attendance/AttendanceWorkspace";
import NotificationsWorkspace from "../Notifications/NotificationsWorkspace";
import StudentVerification from "./StudentVerification";
import "../../App.css";
import { usePopup } from "../../context/PopupContext";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const { isStudent, loadingRights } = useRights();
  const resumePrintRef = useRef();
  const { showPopup } = usePopup();

  // Force role detection based on auth user object or fallback to window path/localStorage if context fails
  const userRole = user?.role || localStorage.getItem("userRole") || "";
  const forceIsStudent = userRole.toLowerCase().includes("student") || isStudent;
  const forceIsPlacement = userRole.toLowerCase().includes("placement") || userRole.toLowerCase().includes("admin") || window.location.pathname.includes("placement");
  
  // Final resolution: if it's explicitly placement, isStudent is false. Otherwise use context.
  const resolvedIsStudent = forceIsPlacement ? false : forceIsStudent;

  // 1. MASTER FEATURE CATALOG (Completely Role-Agnostic & DB Rights Driven)[cite: 1]
  const masterNavigation = [
    { key: "metrics", label: "Dashboard", right: "NAV_METRICS" },
    { key: "placements", label: "Open Placements / Companies", right: "NAV_PLACEMENTS" },
    { key: "drives", label: "Drives Desk", right: "NAV_DRIVES" },
    { key: "skills", label: "Technical Skills", right: "NAV_SKILLS" },
    { key: "calendar", label: "Drive Calendar", right: "NAV_CALENDAR" },
    { key: "resume", label: "Resume Builder", right: "NAV_RESUME" },
    { key: "attendance", label: "Attendance History", right: "NAV_ATTENDANCE_HISTORY" },
    { key: "student_verify", label: "Student Verification", right: "NAV_STUDENT_VERIFY" },
    { key: "manage_attendance", label: "Post Attendance", right: "NAV_MANAGE_ATTENDANCE" },
    { key: "view_attendance_desk", label: "View Attendance Desk", right: "NAV_VIEW_ATTENDANCE_DESK" },
    { key: "notifications", label: "Communications Hub", right: "NAV_NOTIFICATIONS" },
    { key: "profile", label: "Profile Information", right: "NAV_PROFILE" }
  ];

  // Strict Role-Based Menu Filtering[cite: 1]
  const menus = masterNavigation.filter(item => {
    // Student vs Placement exclusive tabs definition[cite: 1]
    const studentOnlyTabs = ["skills", "calendar", "resume", "attendance"];
    const placementOnlyTabs = ["manage_attendance", "view_attendance_desk", "student_verify"];

    if (resolvedIsStudent) {
      if (placementOnlyTabs.includes(item.key)) return false;
    } else {
      // Placement team gets administrative tabs and communications[cite: 1]
      if (studentOnlyTabs.includes(item.key)) return false;
    }

    return true;
  });

  // Global Workspace States[cite: 1]
  const [activeTab, setActiveTab] = useState("metrics"); 
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

  // Technical Skills Module States[cite: 1]
  const [skillsList, setSkillsList] = useState([]);
  const [isExamActive, setIsExamActive] = useState(false);
  const [selectedActiveSkillName, setSelectedActiveSkillName] = useState("");

  // Attendance History States[cite: 1]
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Profile Modification Form State[cite: 1]
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    cgpa: "",
    rollNumber: "",
    activeBacklogs: "0",
    departmentId: "",
  });

  // Resume Generator Engine States[cite: 1]
  const [resumeData, setResumeData] = useState({
    summary: "",
    experience: "",
    projects: "",
    hobbies: "",
  });
  const [isResumeConfigured, setIsResumeConfigured] = useState(false);

  const isProfileComplete = Boolean(
    profileData.branch && profileData.rollNumber && profileData.phoneNumber
  );

  // 10-Minute Security Session Activity Monitor Loop[cite: 1]
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

  // Ref guard to block overlapping / duplicate execution loops[cite: 1]
  const fetchingRef = useRef(false);

  // Primary Workspace Context Loader Function Block[cite: 1]
  const fetchWorkspaceData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setLoading(true);
      const profileRes = await API.get("/student/profile").catch(() => null);
      let currentRollNumber = null;

      if (profileRes && profileRes.data && profileRes.data.success) {
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

      const deptsRes = await API.get("/student/departments-list").catch(() => null);
      if (deptsRes && deptsRes.data && deptsRes.data.success) setDepartments(deptsRes.data.departments);

      if (currentRollNumber) {
        const metricsRes = await API.get("/student/dashboard-metrics").catch(() => null);
        if (metricsRes && metricsRes.data && metricsRes.data.success)
          setDashboardMetrics(metricsRes.data.metrics);

        const skillsRes = await API.get("/student/skills").catch(() => null);
        if (skillsRes && skillsRes.data && skillsRes.data.success) setSkillsList(skillsRes.data.skills || []);
      }
    } catch (err) {
      console.error("Synchronization fault:", err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  // Student Attendance Ledger Data Load Hook Block[cite: 1]
  useEffect(() => {
    if (activeTab === "attendance" && profileData.rollNumber) {
      const fetchStudentAttendance = async () => {
        try {
          setAttendanceLoading(true);
          const res = await API.get(`/attendance/student/${profileData.rollNumber}`, {
            params: {
              rollNumber: profileData.rollNumber,
              student_roll: profileData.rollNumber
            }
          });
          if (res.data && res.data.success) {
            const historyData = res.data.history || res.data.data || [];
            setAttendanceHistory(historyData);
          }
        } catch (err) {
          console.error("Error reading personal attendance pipeline data matrix:", err);
        } finally {
          setAttendanceLoading(false);
        }
      };
      fetchStudentAttendance();
    }
  }, [activeTab, profileData.rollNumber]);

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
      if (res.data && res.data.success) {
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

  const handleGenerateCertificatePDF = (skillItem) => {
    const printWindow = window.open("", "_blank", "width=900,height=650");
    const certificateHTML = `
        <html>
          <head>
            <title>Professional Competency Verification Certificate</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1e293b; text-align: center; padding: 3rem; }
              .cert-border { border: 8px double #10b981; padding: 2.5rem; border-radius: 4px; max-width: 800px; margin: 0 auto; }
              h1 { font-size: 2.75rem; color: #0f172a; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; }
              .recipient-name { font-size: 2.25rem; font-weight: 800; color: #10b981; margin: 2rem 0; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 0.5rem; min-width: 400px; }
              .cert-text { font-size: 1.15rem; line-height: 1.6; color: #334155; margin: 1.5rem auto; max-width: 600px; }
              .meta-row { display: flex; justify-content: space-between; margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px dashed #cbd5e1; font-size: 0.95rem; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="cert-border">
              <h3>TRAINING & PLACEMENT CELL</h3>
              <h1>Certificate of Proficiency</h1>
              <div class="recipient-name">${profileData.fullName || "Verified Student User"}</div>
              <p class="cert-text">has successfully demonstrated technical proficiency mastery within the framework taxonomy of</p>
              <h2 style="font-size: 1.8rem; color: #0f172a; margin: 1rem 0;">${skillItem.skill_name}</h2>
              <p class="cert-text">achieving a validation index performance metric rating of <strong>${skillItem.rating}%</strong>.</p>
              <div class="meta-row">
                <div><strong>Student Roll:</strong> ${profileData.rollNumber}</div>
                <div><strong>Issue Verification Date:</strong> ${new Date().toLocaleDateString()}</div>
              </div>
            </div>
            <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }</script>
          </body>
        </html>
      `;
    printWindow.document.write(certificateHTML);
    printWindow.document.close();
  };

  if (loading || loadingRights) {
    return (
      <div className="portal-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        Syncing Portal Context & RBAC Permissions...[cite: 1]
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper" style={{ display: "flex", width: "100vw", maxWidth: "100vw", overflowX: "hidden", minHeight: "100vh" }}>
      
      {/* DYNAMIC SIDEBAR NAVIGATION PANE */}
      <aside className="workspace-sidebar" style={{ flexShrink: 0 }}>
        <div className="sidebar-main-nav">
          <div className="sidebar-brand">TP PORTAL</div>
          {menus.map((menu) => (
            <div
              key={menu.key}
              onClick={() => setActiveTab(menu.key)}
              className={`sidebar-link ${activeTab === menu.key ? "active" : ""}`}
            >
              {menu.label}
            </div>
          ))}
          <div className="sidebar-link" style={{ color: "red", cursor: "pointer" }} onClick={logout}>
            Log Out
          </div>
        </div>
      </aside>

      {/* DYNAMIC CONTENT ROUTER */}
      <main className="workspace-content-frame" style={{ display: "flex", flexDirection: "column", flex: 1, width: "100%", overflowX: "hidden", boxSizing: "border-box", padding: "1.5rem" }}>
        
        {/* PROFILE TAB VIEW */}
        {activeTab === "profile" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", width: "100%" }}>
            <div style={{ width: "100%", maxWidth: "550px" }}>
              <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontWeight: "800" }}>Update Profile Details</h2>
              <form onSubmit={handleProfileSubmit} className="glass-auth-card" style={{ width: "100%" }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Stream Branch</label>
                  <select value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} className="form-input" required>
                    <option value="">Choose your registered department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>[{d.dept_name}] {d.dept_full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input type="text" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className="form-input" required disabled={isProfileComplete} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Phone</label>
                    <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="form-input" required />
                  </div>
                </div>
                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label">Aggregate CGPA</label>
                    <input type="number" step="0.01" min="0" max="10" value={formData.cgpa} onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Active Backlogs</label>
                    <input type="number" min="0" value={formData.activeBacklogs} onChange={(e) => setFormData({ ...formData, activeBacklogs: e.target.value })} className="form-input" required />
                  </div>
                </div>
                <button type="submit" disabled={submitLoading} className="submit-btn">
                  {submitLoading ? "Saving..." : "Sync Workspace Account"}
                </button>
              </form>
            </div>
          </div>
        ) : activeTab === "metrics" ? (
          
          /* DASHBOARD METRICS ANALYTICS PANEL */
          <div style={{ width: "100%", maxWidth: "100%" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", margin: 0 }}>
              Portal Workspace Dashboard
            </h1>
            
            {profileData.branch && (
              <p style={{ color: "var(--text-sub)", fontSize: "0.85rem" }}>Stream Branch: {profileData.branch}</p>
            )}

            {resolvedIsStudent ? (
              <>
                <div className="metric-cards-row" style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
                  <div className="metric-panel-card" style={{ 
                    borderLeft: `4px solid ${
                      profileData.verificationStatus === 'Approved' || profileData.verificationStatus === 'Clearance Verified' ? '#10b981' : 
                      profileData.verificationStatus === 'Rejected' ? '#ef4444' : '#f59e0b'
                    }` 
                  }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>VERIFICATION AUDIT</span>
                    <h3 style={{ 
                      fontSize: "1.25rem", 
                      marginTop: "0.5rem", 
                      fontWeight: "700",
                      color: (profileData.verificationStatus === "Approved" || profileData.verificationStatus === "Clearance Verified") ? "#10b981" : 
                             profileData.verificationStatus === "Rejected" ? "#ef4444" : "#f59e0b" 
                    }}>
                      {profileData.verificationStatus === 'Approved' || profileData.verificationStatus === 'Clearance Verified' ? 'Clearance Verified ✓' :
                       profileData.verificationStatus === 'Rejected' ? 'Clearance Action Flagged ✖' : 
                       'Pending Coordinator Clearance ⏳'}
                    </h3>
                  </div>
                  <div className="metric-panel-card">
                    <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>VERIFIED CGPA</span>
                    <h3 style={{ fontSize: "1.8rem", marginTop: "0.5rem" }}>{Number(profileData.cgpa).toFixed(2)}</h3>
                  </div>
                  <div className="metric-panel-card">
                    <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>JOB APPLICATIONS</span>
                    <h3 style={{ fontSize: "1.8rem", marginTop: "0.5rem" }}>{dashboardMetrics.applications}</h3>
                  </div>
                </div>

                <div className="metric-panel-card" style={{ marginTop: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", fontWeight: "700" }}>Configured Technical Skill Matrices</h3>
                  {skillsList.length === 0 ? (
                    <p style={{ color: "var(--text-sub)", fontSize: "0.85rem" }}>No dynamic skills registered yet.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                      {skillsList.map((s) => (
                        <div key={s.id} style={{ fontSize: "0.875rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontWeight: "600" }}>{s.skill_name}</span>
                            <span style={{ color: "var(--accent-color)", fontWeight: "700" }}>{s.rating || 70}%</span>
                          </div>
                          <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${s.rating || 70}%`, height: "100%", backgroundColor: "var(--accent-color)", borderRadius: "4px" }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* PLACEMENT TEAM / OFFICERS / ADMINS OVERVIEW PANEL */
              <div style={{ marginTop: "1.5rem" }}>
                <div className="metric-cards-row" style={{ marginBottom: "2rem" }}>
                  <div className="metric-panel-card" style={{ borderLeft: "4px solid var(--accent-color, #a855f7)" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>SYSTEM CLEARANCE LEVEL</span>
                    <h3 style={{ fontSize: "1.4rem", marginTop: "0.5rem", color: "#fff" }}>Authorized Operational Node</h3>
                  </div>
                  <div className="metric-panel-card">
                    <span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>PORTAL STATUS</span>
                    <h3 style={{ fontSize: "1.4rem", marginTop: "0.5rem", color: "#10b981" }}>Operational Active</h3>
                  </div>
                </div>

                <div className="skill-management-card" style={{ padding: "2rem", background: "#121620", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#fff", fontSize: "1.2rem", fontWeight: "700" }}>
                    Administrative Control Workspace Desk
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, lineHeight: "1.5" }}>
                    Select an option on the left navigation pane to manage placements, attendance desks, and student verifications.
                  </p>
                </div>
              </div>
            )}
          </div>

        ) : activeTab === "skills" ? (
          <div style={{ width: "100%" }}>
            {isExamActive ? (
              <SkillsAssessment
                studentRoll={profileData.rollNumber}
                studentEmail={profileData.email}
                skillName={selectedActiveSkillName}
                onAssessmentClose={() => {
                  setIsExamActive(false);
                  fetchWorkspaceData();
                }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <SkillManagement studentRoll={profileData.rollNumber} activeSkillsList={skillsList} onSkillListUpdated={fetchWorkspaceData} />
                <div className="metric-panel-card">
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", fontWeight: "700", color: "#fff" }}>Your Tracked Competencies</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-sub)", fontSize: "0.8rem" }}>
                          <th style={{ padding: "0.75rem", textAlign: "left" }}>Skill Name</th>
                          <th style={{ padding: "0.75rem", textAlign: "left" }}>Audited Score</th>
                          <th style={{ padding: "0.75rem", textAlign: "left" }}>Status</th>
                          <th style={{ padding: "0.75rem", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skillsList.map((s) => (
                          <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                            <td style={{ padding: "0.75rem", color: "#fff", fontWeight: "600" }}>{s.skill_name}</td>
                            <td style={{ padding: "0.75rem", color: "var(--accent-color)", fontWeight: "700" }}>{s.assessment_status === "Verified" ? `${s.rating}%` : "0%"}</td>
                            <td style={{ padding: "0.75rem" }}>
                              <span style={{
                                fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "4px",
                                background: s.assessment_status === "Verified" ? "rgba(16,185,129,0.1)" : s.assessment_status === "Malpractice" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.1)",
                                color: s.assessment_status === "Verified" ? "#10b981" : s.assessment_status === "Malpractice" ? "#ef4444" : "#f59e0b"
                              }}>{s.assessment_status || "Not Initiated"}</span>
                            </td>
                            <td style={{ padding: "0.75rem", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                                {s.assessment_status === "Verified" && s.rating >= 60 && (
                                  <button onClick={() => handleGenerateCertificatePDF(s)} className="submit-btn" style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem", background: "#10b981", width: "auto", margin: 0 }}>Download Cert</button>
                                )}
                                {s.assessment_status === "Malpractice" ? (
                                  <button onClick={() => showPopup({ title: "Terminal Lockout", message: "Locked via proctor infraction parameters.", confirmText: "Close" })} className="submit-btn" style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem", background: "#ef4444", width: "auto", margin: 0 }}>Locked</button>
                                ) : (
                                  s.assessment_status !== "Verified" && (
                                    <button onClick={() => { setSelectedActiveSkillName(s.skill_name); setIsExamActive(true); }} className="submit-btn" style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem", background: "#fff", color: "#000", width: "auto", margin: 0 }}>Take Assessment</button>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

        ) : activeTab === "calendar" ? (
          <div style={{ width: "100%" }}>
            <DriveCalendar studentCgpa={profileData?.cgpa || 0.00} studentBranch={profileData?.branch || "CSE"} />
          </div>

        ) : activeTab === "resume" ? (
          <div style={{ width: "100%" }}>
            {!isResumeConfigured ? (
              <div style={{ maxWidth: "600px" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>Compile Dynamic Resume Payload</h1>
                <div className="glass-auth-card">
                  <div className="form-group">
                    <label className="form-label">Professional Summary Statement</label>
                    <textarea value={resumeData.summary} onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })} className="form-input" rows="3" placeholder="Summary particulars..."></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Projects Details</label>
                    <textarea value={resumeData.projects} onChange={(e) => setResumeData({ ...resumeData, projects: e.target.value })} className="form-input" rows="3" placeholder="Projects description..."></textarea>
                  </div>
                  <button onClick={() => setIsResumeConfigured(true)} className="submit-btn">Compile Preview Canvas</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                  <button onClick={triggerResumePrint} className="submit-btn" style={{ width: "200px", margin: 0 }}>Download / Print CV</button>
                  <button onClick={() => setIsResumeConfigured(false)} className="submit-btn" style={{ width: "200px", margin: 0, backgroundColor: "rgba(255,255,255,0.1)" }}>Edit Details</button>
                </div>
                <div id="printable-cv-frame" ref={resumePrintRef} style={{ background: "#fff", color: "#000", padding: "2.5rem", borderRadius: "4px", fontFamily: "serif" }}>
                  <h2 style={{ textTransform: "uppercase", margin: 0 }}>{profileData.fullName}</h2>
                  <p>Email: {profileData.email} | Phone: {profileData.phoneNumber} | Roll No: {profileData.rollNumber}</p>
                  <hr/>
                  <h4>Professional Summary</h4>
                  <p>{resumeData.summary}</p>
                  <h4>Projects undertaken</h4>
                  <p>{resumeData.projects}</p>
                </div>
              </div>
            )}
          </div>

        ) : activeTab === "manage_attendance" ? (
          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <AttendanceWorkspace isReadOnlyMode={false} />
          </div>

        ) : activeTab === "view_attendance_desk" ? (
          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <AttendanceWorkspace isReadOnlyMode={true} />
          </div>

        ) : activeTab === "attendance" ? (
          <div className="metric-panel-card" style={{ width: "100%", boxSizing: "border-box" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem", color: "#fff" }}>
              Your Training Attendance Summary Ledger
            </h2>
            <p style={{ color: "var(--text-sub)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Logged training session records for Roll Number: <strong>{profileData.rollNumber}</strong>
            </p>

            {attendanceLoading ? (
              <div style={{ color: "var(--text-sub)", fontSize: "0.9rem" }}>Fetching ledger fields...</div>
            ) : attendanceHistory.length === 0 ? (
              <div style={{ padding: "2rem", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "8px", textAlign: "center", color: "#777" }}>
                No training session data rows compiled for this student configuration node yet.
              </div>
            ) : (
              <div style={{ overflowX: "auto", width: "100%" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-sub)", fontSize: "0.8rem" }}>
                      <th style={{ padding: "0.75rem", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "0.75rem", textAlign: "left" }}>Session Slot</th>
                      <th style={{ padding: "0.75rem", textAlign: "left" }}>Topic Context</th>
                      <th style={{ padding: "0.75rem", textAlign: "center" }}>Clearance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", fontSize: "0.9rem" }}>
                        <td style={{ padding: "0.75rem", color: "#fff", fontWeight: "600" }}>{new Date(log.session_date).toLocaleDateString()}</td>
                        <td style={{ padding: "0.75rem", color: "var(--text-sub)" }}>{log.session_slot?.replace("_", " ")}</td>
                        <td style={{ padding: "0.75rem", color: "#fff" }}>{log.topic || "General Technical Alignment Training"}</td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>
                          <span style={{
                            fontSize: "0.75rem", padding: "0.25rem 0.6rem", borderRadius: "4px", fontWeight: "700",
                            background: log.attendance_status === "Present" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            color: log.attendance_status === "Present" ? "#10b981" : "#ef4444"
                          }}>{log.attendance_status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        ) : activeTab === "notifications" ? (
          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <NotificationsWorkspace />
          </div>

        ) : activeTab === "student_verify" ? (
          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <StudentVerification />
          </div>

        ) : (
          <div>
            <h1>Dashboard Option coming soon...</h1>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;