import React, { createContext, useState, useContext, useCallback } from 'react';
import './PopupUtility.css';

const PopupContext = createContext(null);

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    showCancel: false,
    confirmText: 'Acknowledge',
    cancelText: 'Cancel'
  });

  const showPopup = useCallback(({ 
    title, 
    message, 
    onConfirm = null, 
    onCancel = null, 
    showCancel = false,
    confirmText = 'Acknowledge',
    cancelText = 'Cancel'
  }) => {
    setPopup({
      visible: true,
      title,
      message,
      onConfirm,
      onCancel,
      showCancel,
      confirmText,
      cancelText
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopup(prev => ({ ...prev, visible: false }));
  }, []);

  const handleConfirm = () => {
    hidePopup();
    if (popup.onConfirm) popup.onConfirm();
  };

  const handleCancel = () => {
    hidePopup();
    if (popup.onCancel) popup.onCancel();
  };

  return (
    <PopupContext.Provider value={{ showPopup, hidePopup }}>
      {children}
      
      {/* GLOBAL MODAL UI RENDERER */}
      {popup.visible && (
        <div className="global-popup-overlay">
          <div className="global-popup-card">
            <h4 className="global-popup-title">{popup.title}</h4>
            <p className="global-popup-message">{popup.message}</p>
            <div className="global-popup-actions">
              {popup.showCancel && (
                <button className="global-popup-btn-cancel" onClick={handleCancel}>
                  {popup.cancelText}
                </button>
              )}
              <button className="global-popup-btn-confirm" onClick={handleConfirm}>
                {popup.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
};

// Custom hook to consume the popup easily anywhere
export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};