import React, { useState, useEffect, useRef } from "react";
import API from "../../../services/api";
import "./DriveCalendar.css";

const DriveCalendar = ({ studentCgpa, studentBranch }) => {
  const [drives, setDrives] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 12)); 
  const [selectedDayDrives, setSelectedDayDrives] = useState([]);
  const [selectedDateString, setSelectedDateString] = useState("");
  const [activeDateKey, setActiveDateKey] = useState(null);
  
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await API.get("/student/hiring-drives");
        if (res.data.success) {
          setDrives(res.data.drives);
          
          // Auto-select baseline operating node (12th) on initialization
          handleDateSelect(12, new Date(2026, 6, 12));
        }
      } catch (err) {
        console.error("Error synchronizing hiring drive parameters:", err);
      }
    };
    fetchDrives();
  }, [currentDate.getMonth()]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handleDateSelect = (day, customTargetDate = null) => {
    const targetMonth = customTargetDate ? customTargetDate.getMonth() : month;
    const targetYear = customTargetDate ? customTargetDate.getFullYear() : year;
    
    const targetDateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const matched = drives.filter(d => d.drive_date.split("T")[0] === targetDateStr);
    
    setSelectedDayDrives(matched);
    setActiveDateKey(targetDateStr);
    setSelectedDateString(`${monthNames[targetMonth]} ${day}, ${targetYear}`);
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="slider-layout-container">
      
      {/* SECTION 1: TOP SLIDER STRIP PANEL WITH SPLINE LINE BACKGROUND */}
      <div className="slider-panel-card">
        <div className="slider-action-bar">
          <div className="slider-meta-info">
            <span className="slider-subtitle">Placement Timeline Tracker</span>
            <h3 className="slider-month-heading">{monthNames[month]} {year}</h3>
          </div>
          <div className="slider-navigation-arrows">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="nav-arrow-btn">Previous Month</button>
            <button onClick={() => scrollSlider("left")} className="nav-arrow-btn scroll-btn">❬</button>
            <button onClick={() => scrollSlider("right")} className="nav-arrow-btn scroll-btn">❭</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="nav-arrow-btn">Next Month &gt;&gt;</button>
          </div>
        </div>

        {/* CONNECTING STRUCTURAL AXIS BAR GRAPH */}
        <div className="chronology-track-wrapper">
          <div className="chronology-strip-viewport" ref={sliderRef}>
            {daysArray.map(day => {
              const dayOfWeekIndex = new Date(year, month, day).getDay();
              const dayStr = weekdayNames[dayOfWeekIndex];
              const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              
              const dayDrives = drives.filter(d => d.drive_date.split("T")[0] === dateKey);
              const hasDrives = dayDrives.length > 0;
              const isSelected = activeDateKey === dateKey;

              return (
                <div
                  key={`day-box-${day}`}
                  onClick={() => handleDateSelect(day)}
                  className={`chronology-day-pill ${isSelected ? "pill-active" : ""} ${hasDrives ? "pill-has-events" : ""}`}
                >
                  <span className="pill-weekday-text">{dayStr}</span>
                  <span className="pill-date-number">{day}</span>
                  
                  {/* INSTEAD OF TOP COUNTER: Render integrated pips tracking strip at the bottom inner zone */}
                  <div className="pill-micro-pip-row">
                    {dayDrives.slice(0, 4).map((_, idx) => (
                      <span key={idx} className="micro-event-pip"></span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: LOWER DETAILS DISPLAY WINDOW */}
      <div className="slider-bottom-details">
        {selectedDayDrives.length === 0 ? (
          <div className="slider-panel-card fallback-empty-state">
            <p>No corporate placement timelines mounted on {selectedDateString}.</p>
          </div>
        ) : (
          <div className="slider-active-details-wrapper">
            <h4 className="details-header-label">
              Arrival Schedules for <span className="date-glow-span">{selectedDateString}</span>
            </h4>
            
            <div className="slider-details-responsive-grid">
              {selectedDayDrives.map(d => {
                const cgapPass = Number(studentCgpa) >= Number(d.min_cgpa);
                const branchPass = d.allowed_branches === "All" || d.allowed_branches.split(",").map(b => b.trim()).includes(studentBranch);
                const isEligible = cgapPass && branchPass;

                return (
                  <div key={d.id} className="elegant-corporate-card">
                    <div className="corp-card-header">
                      <div>
                        <h3 className="corp-company-name">{d.company_name}</h3>
                        <span className="corp-role-tag">{d.role_name}</span>
                      </div>
                      <div className="corp-salary-badge">{d.ctc_lpa} LPA</div>
                    </div>

                    <div className="corp-card-body">
                      <div className="corp-criteria-specs">
                        <div><strong>Eligibility Baseline:</strong> Minimum {d.min_cgpa} CGPA</div>
                        <div><strong>Allowed Branches:</strong> {d.allowed_branches}</div>
                      </div>
                      
                      <div className={`corp-eligibility-tag ${isEligible ? "eligible-pass" : "eligible-fail"}`}>
                        {isEligible ? "✓ Profile Clearance Granted" : "❌ Academic Criteria Mismatch"}
                      </div>
                    </div>

                    {d.selection_process && (
                      <div className="corp-card-footer">
                        <span className="footer-title">Selection Process Roadmap:</span>
                        <p className="footer-description">{d.selection_process}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DriveCalendar;