import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PopupProvider } from "./context/PopupContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <PopupProvider>
          <AuthProvider>
            <div className="tp-portal-app">
              <AppRoutes />
            </div>
          </AuthProvider>
        </PopupProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
