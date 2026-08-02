import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import API from "../../services/api";
import SkillManagement from "./SkillManagement/SkillManagement";
import SkillsAssessment from "./SkillsAssessment/SkillsAssessment";
import DriveCalendar from "./DriveCalendar/DriveCalendar";
import AttendanceWorkspace from "../Attendance/AttendanceWorkspace";
import NotificationsWorkspace from "../Notifications/NotificationsWorkspace";
import StudentVerification from "./StudentVerification";
import RbacManagement from "../Admin/RbacManagement";
import UserProfile from "../../components/UserProfile";
import "../../App.css";
import { usePopup } from "../../context/PopupContext";
import { Menu, LogOut, LayoutDashboard, Briefcase, Calendar, FileText, User, Shield, CheckCircle, Bell, Users } from "lucide-react";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const resumePrintRef = useRef();
  // eslint-disable-next-line no-unused-vars
  const { showPopup } = usePopup();

  const [userRights, setUserRights] = useState([]);
  const [rightsLoading, setRightsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  const userRole = user?.role || "student";

  useEffect(() => {
    const fetchUserRights = async () => {
      try {
        setRightsLoading(true);
        const res = await API.get("/auth/user-rights", { params: { role: userRole } }).catch(() => null);
        if (res && res.data && res.data.success) {
          setUserRights(res.data.rights || res.data.userRights || []);
        } else {
          setUserRights(res?.data?.rights || []);
        }
      } catch (err) {
        console.error("Failed to synchronize role access rights:", err);
        setUserRights([]);
      } finally {
        setRightsLoading(false);
      }
    };
    fetchUserRights();
  }, [userRole]);

  const getMenuIcon = (key) => {
    switch (key) {
      case "metrics": return <LayoutDashboard size={18} />;
      case "placements": case "drives": return <Briefcase size={18} />;
      case "skills": return <Users size={18} />;
      case "calendar": return <Calendar size={18} />;
      case "resume": return <FileText size={18} />;
      case "attendance": case "manage_attendance": case "view_attendance_desk": return <CheckCircle size={18} />;
      case "student_verify": return <Shield size={18} />;
      case "notifications": return <Bell size={18} />;
      case "rbac_admin": return <Shield size={18} />;
      case "profile": return <User size={18} />;
      default: return <LayoutDashboard size={18} />;
    }
  };

  const masterNavigation = [
    { key: "metrics", label: "Dashboard", rightId: "NAV_METRICS" },
    { key: "placements", label: "Open Placements / Companies", rightId: "NAV_PLACEMENTS" },
    { key: "drives", label: "Drives Desk", rightId: "NAV_DRIVES" },
    { key: "skills", label: "Technical Skills", rightId: "NAV_SKILLS" },
    { key: "calendar", label: "Drive Calendar", rightId: "NAV_CALENDAR" },
    { key: "resume", label: "Resume Builder", rightId: "NAV_RESUME" },
    { key: "attendance", label: "Attendance History", rightId: "NAV_ATTENDANCE_HISTORY" },
    { key: "student_verify", label: "Student Verification", rightId: "NAV_STUDENT_VERIFY" },
    { key: "manage_attendance", label: "Post Attendance", rightId: "NAV_MANAGE_ATTENDANCE" },
    { key: "view_attendance_desk", label: "View Attendance Desk", rightId: "NAV_VIEW_ATTENDANCE_DESK" },
    { key: "notifications", label: "Communications Hub", rightId: "NAV_NOTIFICATIONS" },
    { key: "rbac_admin", label: "RBAC Administration", rightId: "NAV_RBAC_ADMIN" },
    { key: "profile", label: "Profile Information", rightId: "NAV_PROFILE" }
  ];

  const menus = masterNavigation.filter(item => userRights.includes(item.rightId));

  const [activeTab, setActiveTab] = useState("metrics"); 
  const [profileData, setProfileData] = useState({ fullName: "", rollNumber: "", email: "", branch: "", cgpa: 0, phoneNumber: "", verificationStatus: "", departmentId: "" });
  const [dashboardMetrics, setDashboardMetrics] = useState({ applications: 0, verified: false, drives: 0 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [skillsList, setSkillsList] = useState([]);
  const [isExamActive, setIsExamActive] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedActiveSkillName, setSelectedActiveSkillName] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [formData, setFormData] = useState({ fullName: "", phoneNumber: "", cgpa: "", rollNumber: "", activeBacklogs: "0", departmentId: "" });
  const [resumeData, setResumeData] = useState({ summary: "", experience: "", projects: "", hobbies: "" });
  const [isResumeConfigured, setIsResumeConfigured] = useState(false);

  const isProfileComplete = Boolean(profileData.branch && profileData.rollNumber && profileData.phoneNumber);

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

  const fetchingRef = useRef(false);

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

  useEffect(() => {
    if (activeTab === "attendance" && profileData.rollNumber) {
      const fetchStudentAttendance = async () => {
        try {
          setAttendanceLoading(true);
          const res = await API.get(`/attendance/student/${profileData.rollNumber}`, {
            params: { rollNumber: profileData.rollNumber, student_roll: profileData.rollNumber }
          });
          if (res.data && res.data.success) {
            setAttendanceHistory(res.data.history || res.data.data || []);
          }
        } catch (err) {
          console.error("Error reading attendance matrix:", err);
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

  const triggerResumePrint = () => window.print();

  if (loading || rightsLoading) {
    return (
      <div style={{ height: "100vh", width: "100vw", backgroundColor: "var(--bg-primary)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "500" }}>
        Syncing Portal Context & RBAC Permissions...
      </div>
    );
  }

  if (!userRights || userRights.length === 0) {
    return (
      <div style={{ height: "100vh", width: "100vw", backgroundColor: "var(--bg-primary)", color: "var(--text-main)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.75rem" }}>No rights assigned to user</h2>
        <button onClick={logout} style={{ padding: "0.5rem 1.25rem", backgroundColor: "#ef4444", borderRadius: "0.75rem", color: "#fff", border: "none", cursor: "pointer" }}>Log Out</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "var(--bg-primary)", color: "var(--text-main)" }}>
      
      <style>{`
        @keyframes brandBlink {
          0% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px var(--accent-color, #10b981); }
          50% { opacity: 0.4; transform: scale(0.9); box-shadow: 0 0 2px var(--accent-color, #10b981); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px var(--accent-color, #10b981); }
        }
        .brand-neon-dot {
          width: 8px;
          height: 8px;
          background-color: var(--accent-color, #10b981);
          border-radius: 50%;
          display: inline-block;
          animation: brandBlink 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* FLOATING MODERN SIDEBAR NAVIGATION PANE */}
      <aside style={{
        height: "96vh",
        margin: "2vh 0 2vh 0.75rem",
        backgroundColor: "var(--bg-card)",
        borderRadius: "1.5rem",
        border: "1px solid var(--border-color)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: isExpanded ? "260px" : "80px",
        transition: "width 0.3s ease-in-out",
        flexShrink: 0,
        zIndex: 30,
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          
          {/* Top Header with Blinking Dot & Right-Aligned Toggle Button */}
          <div style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)" }}>
            {isExpanded ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="brand-neon-dot"></span>
                <span style={{ fontWeight: "800", letterSpacing: "0.1em", color: "var(--text-title)", fontSize: "1rem" }}>
                  TP PORTAL
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <span className="brand-neon-dot" title="TP Portal Active"></span>
              </div>
            )}
            
            {/* Toggle Button pushed cleanly to the right */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              style={{ background: "var(--tab-bg)", border: "none", color: "var(--text-sub)", cursor: "pointer", padding: "0.4rem", borderRadius: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              title="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Navigation Links Scrollable Area */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }} className="custom-scrollbar">
            {menus.map((menu) => {
              const isActive = activeTab === menu.key;
              return (
                <button
                  key={menu.key}
                  onClick={() => setActiveTab(menu.key)}
                  title={!isExpanded ? menu.label : ""}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "0.75rem 0.85rem",
                    borderRadius: "1rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    background: isActive ? "var(--accent-color)" : "transparent",
                    color: isActive ? "#ffffff" : "var(--text-sub)",
                    boxShadow: isActive ? "0 10px 15px -3px rgba(0, 0, 0, 0.2)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span style={{ flexShrink: 0, color: isActive ? "#ffffff" : "var(--accent-color)" }}>
                    {getMenuIcon(menu.key)}
                  </span>
                  {isExpanded && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: "900", fontSize: "0.9rem" }}>{menu.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section: Logout & User Profile Component */}
          <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
            <button
              onClick={logout}
              title={!isExpanded ? "Log Out" : ""}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                padding: "0.6rem 0.85rem",
                borderRadius: "0.75rem",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#f87171",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                marginBottom: "0.5rem",
                justifyContent: !isExpanded ? "center" : "flex-start"
              }}
            >
              <LogOut size={18} style={{ flexShrink: 0 }} />
              {isExpanded && <span>Log Out</span>}
            </button>

            {/* Separate UserProfile Component */}
            <UserProfile isExpanded={isExpanded} currentUser={user} />
          </div>

        </div>
      </aside>

      {/* MAIN DYNAMIC CONTENT ROUTER AREA */}
      <main style={{ flex: 1, height: "100vh", overflowY: "auto", padding: "2rem", boxSizing: "border-box" }}>
        
        {activeTab === "profile" && userRights.includes("NAV_PROFILE") ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "85vh", width: "100%" }}>
            <div style={{ width: "100%", maxWidth: "550px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "900", textAlign: "center", marginBottom: "1.5rem", color: "var(--text-title)" }}>Update Profile Details</h2>
              <form onSubmit={handleProfileSubmit} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "2rem", borderRadius: "1.5rem", boxShadow: "0 20px 25px -5px var(--shadow-card)" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-sub)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Full Name</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} style={{ width: "100%", padding: "0.75rem 1rem", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", fontSize: "0.85rem", color: "var(--text-title)", outline: "none" }} required />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-sub)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Department Stream Branch</label>
                  <select value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} style={{ width: "100%", padding: "0.75rem 1rem", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", fontSize: "0.85rem", color: "var(--text-title)", outline: "none" }} required>
                    <option value="">Choose department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>[{d.dept_name}] {d.dept_full_name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-sub)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Roll Number</label>
                    <input type="text" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} style={{ width: "100%", padding: "0.75rem 1rem", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", fontSize: "0.85rem", color: "var(--text-title)", opacity: isProfileComplete ? 0.6 : 1, outline: "none" }} required disabled={isProfileComplete} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-sub)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Mobile Phone</label>
                    <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} style={{ width: "100%", padding: "0.75rem 1rem", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", fontSize: "0.85rem", color: "var(--text-title)", outline: "none" }} required />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-sub)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Aggregate CGPA</label>
                    <input type="number" step="0.01" min="0" max="10" value={formData.cgpa} onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} style={{ width: "100%", padding: "0.75rem 1rem", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", fontSize: "0.85rem", color: "var(--text-title)", outline: "none" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-sub)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Active Backlogs</label>
                    <input type="number" min="0" value={formData.activeBacklogs} onChange={(e) => setFormData({ ...formData, activeBacklogs: e.target.value })} style={{ width: "100%", padding: "0.75rem 1rem", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", fontSize: "0.85rem", color: "var(--text-title)", outline: "none" }} required />
                  </div>
                </div>
                <button type="submit" disabled={submitLoading} style={{ width: "100%", padding: "0.85rem", background: "var(--accent-color)", color: "#fff", fontWeight: "700", fontSize: "0.85rem", borderRadius: "0.75rem", border: "none", cursor: "pointer", boxShadow: "0 10px 15px -3px var(--accent-glow)" }}>
                  {submitLoading ? "Saving..." : "Sync Workspace Account"}
                </button>
              </form>
            </div>
          </div>
        ) : activeTab === "metrics" && userRights.includes("NAV_METRICS") ? (
          <div style={{ width: "100%" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--text-title)", margin: 0 }}>Portal Workspace Dashboard</h1>
            {profileData.branch && <p style={{ fontSize: "0.8rem", color: "var(--text-sub)", marginTop: "0.25rem" }}>Stream Branch: {profileData.branch}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginTop: "1.5rem" }}>
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "1.5rem" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-sub)", letterSpacing: "0.05em" }}>VERIFIED CGPA</span>
                <h3 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-title)", marginTop: "0.5rem" }}>{Number(profileData.cgpa).toFixed(2)}</h3>
              </div>
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "1.5rem" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-sub)", letterSpacing: "0.05em" }}>JOB APPLICATIONS</span>
                <h3 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-title)", marginTop: "0.5rem" }}>{dashboardMetrics.applications}</h3>
              </div>
            </div>
          </div>
        ) : activeTab === "skills" && userRights.includes("NAV_SKILLS") ? (
          <div style={{ width: "100%" }}>
            {isExamActive ? (
              <SkillsAssessment studentRoll={profileData.rollNumber} studentEmail={profileData.email} skillName={selectedActiveSkillName} onAssessmentClose={() => { setIsExamActive(false); fetchWorkspaceData(); }} />
            ) : (
              <SkillManagement studentRoll={profileData.rollNumber} activeSkillsList={skillsList} onSkillListUpdated={fetchWorkspaceData} />
            )}
          </div>
        ) : activeTab === "calendar" && userRights.includes("NAV_CALENDAR") ? (
          <DriveCalendar studentCgpa={profileData?.cgpa || 0.00} studentBranch={profileData?.branch || "CSE"} />
        ) : activeTab === "resume" && userRights.includes("NAV_RESUME") ? (
          <div style={{ width: "100%" }}>
            {!isResumeConfigured ? (
              <div style={{ maxWidth: "600px" }}>
                <h1 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-title)", marginBottom: "1rem" }}>Compile Dynamic Resume Payload</h1>
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-sub)", marginBottom: "0.5rem" }}>Professional Summary Statement</label>
                  <textarea value={resumeData.summary} onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })} style={{ width: "100%", padding: "0.75rem", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", color: "var(--text-title)", marginBottom: "1rem" }} rows="3"></textarea>
                  <button onClick={() => setIsResumeConfigured(true)} style={{ padding: "0.65rem 1.25rem", backgroundColor: "var(--accent-color)", color: "#fff", fontWeight: "700", fontSize: "0.75rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}>Compile Preview Canvas</button>
                </div>
              </div>
            ) : (
              <div>
                <button onClick={triggerResumePrint} style={{ padding: "0.65rem 1.25rem", backgroundColor: "var(--accent-color)", color: "#fff", fontWeight: "700", fontSize: "0.75rem", borderRadius: "0.75rem", border: "none", cursor: "pointer", marginBottom: "1rem" }}>Download / Print CV</button>
                <div id="printable-cv-frame" ref={resumePrintRef} style={{ backgroundColor: "#fff", color: "#000", padding: "2rem", borderRadius: "0.75rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", textTransform: "uppercase" }}>{profileData.fullName}</h2>
                  <p style={{ fontSize: "0.75rem", color: "#555" }}>Email: {profileData.email} | Phone: {profileData.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "manage_attendance" && userRights.includes("NAV_MANAGE_ATTENDANCE") ? (
          <AttendanceWorkspace isReadOnlyMode={false} />
        ) : activeTab === "view_attendance_desk" && userRights.includes("NAV_VIEW_ATTENDANCE_DESK") ? (
          <AttendanceWorkspace isReadOnlyMode={true} />
        ) : activeTab === "notifications" && userRights.includes("NAV_NOTIFICATIONS") ? (
          <NotificationsWorkspace />
        ) : activeTab === "student_verify" && userRights.includes("NAV_STUDENT_VERIFY") ? (
          <StudentVerification />
        ) : activeTab === "rbac_admin" && userRights.includes("NAV_RBAC_ADMIN") ? (
          <RbacManagement />
        ) : (
          <div style={{ textAlign: "center", padding: "5rem", color: "var(--text-sub)", fontWeight: "600" }}>Dashboard Option coming soon...</div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;