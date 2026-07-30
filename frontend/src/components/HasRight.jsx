import React from 'react';
import { useRights } from '../context/RightsContext';

const HasRight = ({ right, children }) => {
  const { hasRight, loading } = useRights();

  // If still loading or rights aren't restricted, render children safely
  if (loading || !right || hasRight(right)) {
    return children;
  }

  // Fallback unauthorized view if permission is strictly denied
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", color: "#fff", textAlign: "center" }}>
      <h2 style={{ color: "#ef4444", fontSize: "1.8rem", fontWeight: "800" }}>Access Restricted</h2>
      <p style={{ color: "#94a3b8", maxWidth: "400px", marginTop: "0.5rem" }}>
        Your current user account does not possess the required database permissions to view or execute operations on this module.
      </p>
    </div>
  );
};

export default HasRight;