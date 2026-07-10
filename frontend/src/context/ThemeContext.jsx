import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('portal-accent') || '#10b981';
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('portal-dark-mode');
    return savedMode ? savedMode === 'true' : true;
  });

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sync structural configuration tokens directly to document root variables
  useEffect(() => {
    localStorage.setItem('portal-accent', accentColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    
    // Convert hex string value into a functional translucent rgba block for the box-glowing shadow targets
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.4)`);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('portal-dark-mode', darkMode);
  }, [darkMode]);

  const paletteOptions = [
    { name: 'Emerald Mint', value: '#10b981' },
    { name: 'Cyber Cyan', value: '#06b6d4' },
    { name: 'Electric Violet', value: '#8b5cf6' },
    { name: 'Amber Glow', value: '#f59e0b' },
    { name: 'Crimson Surge', value: '#ef4444' }
  ];

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor, paletteOptions, darkMode, setDarkMode, settingsOpen, setSettingsOpen }}>
      {/* Dynamic theme wrapper container injection mapping */}
      <div className={darkMode ? 'theme-dark' : 'theme-light'} style={{ minHeight: '100vh' }}>
        {children}
      </div>

      {/* Floating Panel Customization Trigger Widget */}
      <button 
        onClick={() => setSettingsOpen(!settingsOpen)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          backgroundColor: darkMode ? '#18181b' : '#ffffff',
          border: `1px solid ${settingsOpen ? accentColor : (darkMode ? '#27272a' : '#e2e8f0')}`,
          width: '46px', height: '46px', borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'all 0.2s'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: settingsOpen ? 'spin 4s linear infinite' : 'none' }}>
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {/* Configuration Slider Controls Overlay UI HUD */}
      {settingsOpen && (
        <div style={{ position: 'fixed', bottom: '85px', right: '24px', zIndex: 9999, width: '280px', backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e2e8f0'}`, borderRadius: '12px', padding: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', color: darkMode ? '#ffffff' : '#09090b', fontFamily: 'sans-serif' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600' }}>Customization Console</h4>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: darkMode ? '#a1a1aa' : '#71717a', display: 'block', marginBottom: '0.5rem' }}>Core Interface Mode</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', backgroundColor: darkMode ? '#09090b' : '#f4f4f5', padding: '0.25rem', borderRadius: '6px' }}>
              <button onClick={() => setDarkMode(true)} style={{ padding: '0.35rem', fontSize: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: darkMode ? '#27272a' : 'transparent', color: darkMode ? '#ffffff' : '#71717a', fontWeight: '600' }}>Dark</button>
              <button onClick={() => setDarkMode(false)} style={{ padding: '0.35rem', fontSize: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: !darkMode ? '#ffffff' : 'transparent', color: !darkMode ? '#09090b' : '#a1a1aa', fontWeight: '600' }}>Light</button>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: darkMode ? '#a1a1aa' : '#71717a', display: 'block', marginBottom: '0.5rem' }}>Color Palette Tokens</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {paletteOptions.map((opt) => (
                <div 
                  key={opt.value} 
                  onClick={() => setAccentColor(opt.value)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: accentColor === opt.value ? (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent', border: `1px solid ${accentColor === opt.value ? opt.value : (darkMode ? '#27272a' : '#e2e8f0')}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.775rem' }}
                >
                  <span style={{ color: accentColor === opt.value ? (darkMode ? '#ffffff' : '#09090b') : (darkMode ? '#a1a1aa' : '#71717a'), fontWeight: accentColor === opt.value ? '600' : '400' }}>{opt.name}</span>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: opt.value }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);