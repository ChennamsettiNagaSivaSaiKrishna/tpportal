// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Remove or comment out StrictMode if you want to eliminate development double-triggers
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);