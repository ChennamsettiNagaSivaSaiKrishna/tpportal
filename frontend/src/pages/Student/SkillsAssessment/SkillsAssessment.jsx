import React, { useState, useEffect, useCallback, useRef } from "react";
import API from "../../../services/api";
import "./SkillsAssessment.css";
import { usePopup } from "../../../context/PopupContext";

const SkillsAssessment = ({
  studentRoll,
  studentEmail,
  skillName,
  onAssessmentClose,
}) => {
  const securityBreachRef = useRef(null);
  const { showPopup } = usePopup();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentQuestionIndex] = useState(0);

  // Custom Trackers States Map
  const [savedAnswers, setSavedAnswers] = useState({}); // Stores finalized choices
  const [selectedOption, setSelectedOption] = useState(null); // Selected but unsaved option
  const [markedQuestions, setMarkedQuestions] = useState({}); // Yellow tracking array map
  const [visitedQuestions, setVisitedQuestions] = useState({ 0: true }); // Visited index tracking nodes

  const [violations, setExamViolations] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // Backed configuration fallback defaults
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const cleanupListenersRef = useRef(null);
  

  // Consolidated submission handler pipeline
  const handleExamSubmit = useCallback(
    async (forcedByTimeout = false) => {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;

      clearInterval(timerRef.current);
      try {
        const res = await API.post("/assessment/submit", {
          studentRoll,
          skillName,
          answers: savedAnswers,
          securityViolations: forcedByTimeout ? 0 : violations,
        });

        if (res.data.success) {
          const scoreMsg = forcedByTimeout
            ? "Time has expired! Your currently saved choice coordinates have been successfully validated."
            : `Your evaluation session has been successfully processed. Score Matrix Result achieved: ${res.data.rating}%`;

          // Drop fullscreen safely before showing the final score modal
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }

          // FIXED: Replaced native alert() with our global popup configuration
          showPopup({
            title: forcedByTimeout
              ? "Time Session Expired"
              : "Assessment Complete",
            message: scoreMsg,
            confirmText: "Return to Dashboard",
            onConfirm: () => onAssessmentClose(), // Routes them back cleanly after acknowledgement click
          });
        }
      } catch (err) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }

        // FIXED: Error state alert replaced with popup wrapper mapping
        showPopup({
          title: "Pipeline Submission Error",
          message:
            "An operational fault occurred while validating evaluation matrices on the central server.",
          confirmText: "Close Component",
          onConfirm: () => onAssessmentClose(),
        });
      }
    },
    [
      studentRoll,
      skillName,
      savedAnswers,
      violations,
      onAssessmentClose,
      showPopup,
    ] // Added showPopup to dependencies
  );

  const handleSecurityBreachLogic = useCallback(() => {
    console.log("Proctor Event Intercepted: handleSecurityBreachLogic triggered.");
    
    if (hasSubmittedRef.current) {
      console.warn("Security Event Skipped: hasSubmittedRef is already TRUE.");
      return;
    }

    setExamViolations((prev) => {
      const updatedStrikes = prev + 1;
      console.log(`Previous Strikes: ${prev} -> New Strike Count: ${updatedStrikes}`);
      
      if (updatedStrikes >= 3) {
        console.error("Proctor Lockout Engaged! Tearing down environment...");
        hasSubmittedRef.current = true;
        clearInterval(timerRef.current);

        // STEP A: EXIT FULLSCREEN IMMEDIATELY
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          const exitFs = document.exitFullscreen || document.webkitExitFullscreen;
          if (exitFs) {
            exitFs.call(document).catch(err => console.error("Error exiting fullscreen:", err));
          }
        }
        
        // STEP B: CLEAN UP LISTENERS IMMEDIATELY USING OUR REF POINTER
        if (cleanupListenersRef.current) {
          cleanupListenersRef.current();
          console.log("Security event listeners successfully unbound inside lockout execution.");
        }

        // STEP C: TRANSMIT DATA PACKET TO BACKEND
        API.post('/assessment/submit', { studentRoll, skillName, answers: {}, securityViolations: 99 })
          .then((res) => {
            console.log("Backend Failure Log Packet Confirmed:", res.data);
            
            showPopup({
              title: "Security Environment Compromised",
              message: "Assessment terminated. The focus terminal limits were repeatedly breached. Your grade for this skill competency has been recorded as a failure.",
              confirmText: "Exit Exam Module",
              onConfirm: () => onAssessmentClose()
            });
          })
          .catch(err => {
            console.error("Network Pipeline Error while logging lockout:", err);
            onAssessmentClose();
          });

        return updatedStrikes;
      }

      // Friendly UI Warning Popup for Strike 1 and 2
      setTimeout(() => {
        showPopup({
          title: "Security Infraction Alert",
          message: `A window focus blur or tab shift was detected. This is strike ${updatedStrikes}/3 logged. Reaching 3 strikes will automatically lock your screen and fail the exam.`,
          confirmText: "Return to Assessment"
        });
      }, 50);
      
      return updatedStrikes;
    });
  }, [studentRoll, skillName, onAssessmentClose, showPopup]);

// Keep the reference anchor updated on every single render pass
useEffect(() => {
  securityBreachRef.current = handleSecurityBreachLogic;
});



  const triggerFinalSubmissionModal = () => {
    showPopup({
      title: "Finalize & Submit?",
      message: "Are you sure you want to conclude this proctored validation? All saved choices will be committed for final score analysis.",
      showCancel: true,
      confirmText: "Yes, Finalize",
      cancelText: "Review Questions",
      onConfirm: () => handleExamSubmit(false)
    });
  };

  // Initialize Exam Metrics Configurations
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    console.log("Initializing secure proctor system lifecycle container...");

    // Data Matrix Loader
    const fetchExamMatrix = async () => {
      try {
        const res = await API.post('/assessment/start', { studentRoll, skillName });
        if (res.data.success) {
          console.log("Exam data parameters loaded. Questions received:", res.data.questions.length);
          setQuestions(res.data.questions);
          const duration = res.data.durationMinutes ? parseInt(res.data.durationMinutes, 10) : 30;
          setTimeLeft(duration * 60);
        }
      } catch (err) {
        console.error("Failed to fetch initial assessment configuration matrix:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExamMatrix();

    // Reusable router function for the native events
    const triggerBreachAction = (event) => {
      console.log(`Native Browser Intercept Event Fired: [Type: ${event.type}] caught.`);
      if (securityBreachRef.current) {
        securityBreachRef.current();
      }
    };

    // Define the master cleanup method
    const removeProctorListeners = () => {
      console.log("Executing unbind sequence for proctor listeners...");
      window.removeEventListener('blur', triggerBreachAction);
      document.removeEventListener('visibilitychange', triggerBreachAction);
      document.removeEventListener('mouseleave', triggerBreachAction);
    };

    // Store the cleanup sequence in the reference box so the lockout callback can use it
    cleanupListenersRef.current = removeProctorListeners;

    // Bind listeners to global scope containers
    console.log("Binding native security framework event listeners permanently...");
    window.addEventListener('blur', triggerBreachAction);
    document.addEventListener('visibilitychange', triggerBreachAction);
    document.addEventListener('mouseleave', triggerBreachAction);

    // Component unmount fallback teardown
    return () => {
      removeProctorListeners();
      clearInterval(timerRef.current);
    };
  }, [studentRoll, skillName, onAssessmentClose]);
  // Independent Countdown Engine Loop
  useEffect(() => {
    if (loading || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleExamSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, questions, handleExamSubmit]);

  useEffect(() => {
    console.log("Binding native security framework event listeners permanently to window scope container...");

    const triggerBreachAction = (event) => {
      console.log(`Native Browser Intercept Event Fired: [Type: ${event.type}] caught on target object.`);
      if (securityBreachRef.current) {
        securityBreachRef.current();
      } else {
        console.error("Critical Reference Fault: securityBreachRef.current is unassigned or NULL.");
      }
    };

    // Attach listeners securely to global context window frames
    window.addEventListener('blur', triggerBreachAction);
    document.addEventListener('visibilitychange', triggerBreachAction);
    document.addEventListener('mouseleave', triggerBreachAction);

    // This clean cleanup function will ONLY execute when the exam page completely closes
    return () => {
      console.log("Cleaning up and unmounting proctor event listener attachments dynamically...");
      window.removeEventListener('blur', triggerBreachAction);
      document.removeEventListener('visibilitychange', triggerBreachAction);
      document.removeEventListener('mouseleave', triggerBreachAction);
    };
  }, []);

  // Synchronize options display tracking matching active selections
  useEffect(() => {
    if (questions[currentIndex]) {
      setSelectedOption(savedAnswers[questions[currentIndex].id] || null);
    }
  }, [currentIndex, questions, savedAnswers]);

  const handleSaveAnswerSelection = () => {
    if (!selectedOption) {
      showPopup({
        title: "Selection Matrix Empty",
        message:
          "Please choose an answer variant option before attempting to save your answer coordinate.",
        confirmText: "Acknowledge",
      });
      return;
    }
    const currentQId = questions[currentIndex].id;
    setSavedAnswers((prev) => ({ ...prev, [currentQId]: selectedOption }));
  };

  const handleMarkReviewToggle = () => {
    const currentQId = questions[currentIndex].id;
    setMarkedQuestions((prev) => ({
      ...prev,
      [currentQId]: !prev[currentQId],
    }));
  };

  const navigateToQuestionIndex = (targetIdx) => {
    setVisitedQuestions((prev) => ({ ...prev, [targetIdx]: true }));
    setCurrentQuestionIndex(targetIdx);
  };

  const formatTimerString = (secondsCount) => {
    const mm = Math.floor(secondsCount / 60)
      .toString()
      .padStart(2, "0");
    const ss = (secondsCount % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  if (loading)
    return (
      <div className="exam-mesh-loader">
        Instantiating Secure Secure Validation Framework...
      </div>
    );

  const activeQuestion = questions[currentIndex];

  return (
    <div className="exam-fullscreen-viewport-override">
      {/* 1. COMPONENT REPLACEMENT LEFT SIDEBAR NAVIGATION BLOCK */}
      <aside className="exam-proctor-profile-sidebar">
        <div className="proctor-identity-badge">
          <h4>SECURE TERMINAL</h4>
          <div className="identity-row">
            <strong>Roll No:</strong> <span>{studentRoll}</span>
          </div>
          <div className="identity-row">
            <strong>Mail ID:</strong>{" "}
            <span className="identity-email-text">{studentEmail}</span>
          </div>
        </div>

        {/* 2. NUMBERS NAVIGATION DRAWERS PANEL LAYOUT GRID */}
        <div className="exam-navigation-matrix-box">
          <h5>Question Coordinates</h5>
          <div className="matrix-numbers-grid">
            {questions.map((q, idx) => {
              const isSaved = !!savedAnswers[q.id];
              const isMarked = !!markedQuestions[q.id];
              const isVisited = !!visitedQuestions[idx];

              let bubbleClass = "bubble-not-visited"; // Default tracking: Charcoal Grey
              if (isSaved)
                bubbleClass = "bubble-saved-green"; // Answered: Emerald Green
              else if (isMarked)
                bubbleClass = "bubble-review-yellow"; // Flagged: Amber Yellow
              else if (isVisited) bubbleClass = "bubble-visited-red"; // Visited but skipped: Crimson Rust

              return (
                <button
                  key={q.id}
                  onClick={() => navigateToQuestionIndex(idx)}
                  className={`matrix-number-bubble ${bubbleClass} ${
                    currentIndex === idx ? "active-bubble-focus" : ""
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sidebar-legend-mapping">
          <div className="legend-item">
            <span className="legend-dot bubble-saved-green"></span> Saved
          </div>
          <div className="legend-item">
            <span className="legend-dot bubble-review-yellow"></span> Marked
          </div>
          <div className="legend-item">
            <span className="legend-dot bubble-visited-red"></span> Skipped
          </div>
          <div className="legend-item">
            <span className="legend-dot bubble-not-visited"></span> Unvisited
          </div>
        </div>
      </aside>

      {/* PRIMARY CENTRAL SCREEN INTERACTION DRAWERS ENGINE VIEW */}
      <main className="exam-workspace-center-body">
        <div className="exam-body-header-row">
          <div>
            <h2>{skillName} Evaluation System Node</h2>
            <p className="security-tag-armed">
              Hardware Intercept Active &bull; Strikes: {violations}/3
            </p>
          </div>
          <div
            className={`countdown-timer-hud ${
              timeLeft < 300 ? "timer-alert-pulse" : ""
            }`}
          >
            <span className="timer-label">TIME REMAINING</span>
            <span className="timer-clock">{formatTimerString(timeLeft)}</span>
          </div>
        </div>

        {activeQuestion && (
          <div className="exam-workspace-card-layout">
            <div className="question-text-title-box">
              <h3>
                Question {currentIndex + 1} of {questions.length}
              </h3>
              <p className="question-core-prompt">
                {activeQuestion.question_text}
              </p>
            </div>

            <div className="options-selection-column-list">
              {["a", "b", "c", "d"].map((key) => {
                const checked = selectedOption === key;
                return (
                  <label
                    key={key}
                    className={`option-label-wrapper-box ${
                      checked ? "option-checked-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="exam-options-group"
                      checked={checked}
                      onChange={() => setSelectedOption(key)}
                      className="option-radio-input"
                    />
                    <span className="option-prefix">{key.toUpperCase()}.</span>
                    <span className="option-string-content">
                      {activeQuestion[`option_${key}`]}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="exam-control-navigation-action-bar">
              <div className="action-bar-left-cluster">
                <button
                  onClick={handleMarkReviewToggle}
                  className={`exam-action-btn-secondary ${
                    markedQuestions[activeQuestion.id]
                      ? "active-marked-btn"
                      : ""
                  }`}
                >
                  {markedQuestions[activeQuestion.id]
                    ? "Unmark Question"
                    : "Mark for Review"}
                </button>
                <button
                  onClick={handleSaveAnswerSelection}
                  className="exam-action-btn-save"
                >
                  Save Choice Node
                </button>
              </div>

              <div className="action-bar-right-cluster">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => navigateToQuestionIndex(currentIndex - 1)}
                  className="exam-nav-arrow-btn"
                >
                  Previous
                </button>
                {/* Change the final submit button configuration map inside your action bar cluster: */}
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => navigateToQuestionIndex(currentIndex + 1)}
                    className="exam-nav-arrow-btn"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={triggerFinalSubmissionModal}
                    className="exam-action-btn-submit-final"
                  >
                    Finalize & Submit Test
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SkillsAssessment;
