import React, { useState, useRef, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function UserProfile({ isExpanded, currentUser }) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const menuRef = useRef(null);

  // Limited offered profile avatars pool
  const profileAvatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver"
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(profileAvatars[0]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAvatarPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative", marginTop: "auto", padding: "0.75rem" }} ref={menuRef}>
      <style>{`
        @keyframes neonBlink {
          0% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px var(--accent-color, #10b981); }
          50% { opacity: 0.4; transform: scale(0.9); box-shadow: 0 0 2px var(--accent-color, #10b981); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px var(--accent-color, #10b981); }
        }
        .user-neon-dot {
          width: 8px;
          height: 8px;
          background-color: var(--accent-color, #10b981);
          border-radius: 50%;
          display: inline-block;
          animation: neonBlink 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Avatar Selection Popup Box (Allows changing profile photo only) */}
      {showAvatarPicker && (
        <div style={{
          position: "absolute",
          bottom: "75px",
          left: isExpanded ? "0.75rem" : "5rem",
          width: "14rem",
          background: "var(--card-bg, #121620)",
          border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
          borderRadius: "1rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          padding: "0.75rem",
          zIndex: 50,
          color: "inherit"
        }}>
          <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-sub, #94a3b8)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Choose Profile Avatar
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
            {profileAvatars.map((avatarUrl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedAvatar(avatarUrl);
                  setShowAvatarPicker(false);
                }}
                style={{
                  padding: "0.25rem",
                  borderRadius: "0.5rem",
                  background: selectedAvatar === avatarUrl ? "var(--accent-color)" : "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <img src={avatarUrl} alt="Avatar option" style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Profile Trigger Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "0.6rem",
          borderRadius: "1rem",
          background: "var(--input-bg, #161a27)",
          border: "1px solid var(--border-color, rgba(255,255,255,0.06))",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden" }}>
          
          {/* Clickable Avatar to change profile picture */}
          <div 
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
            title="Click to change profile picture"
          >
            <img 
              src={selectedAvatar} 
              alt="Avatar" 
              style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "#1f2937", border: "2px solid var(--accent-color, #10b981)", objectFit: "cover" }} 
            />
            {/* Exactly ONE online blinking neon dot */}
            <span style={{ position: "absolute", bottom: 0, right: 0, border: "2px solid #111622" }} className="user-neon-dot"></span>
          </div>

          {isExpanded && (
            <div style={{ textAlign: "left", overflow: "hidden" }}>
              <div style={{ fontSize: "1rem", fontWeight: "700", color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {"user"}
              </div>
            </div>
          )}
        </div>

        {isExpanded && (
          <button 
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.2rem" }}
          >
            <ChevronUp size={14} color="var(--text-sub, #94a3b8)" style={{ transform: showAvatarPicker ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>
        )}
      </div>
    </div>
  );
}