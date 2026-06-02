"use client"; // 🌟 CRUCIAL: Must be a client component

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error locally to your server monitor console
    console.error("Global Error Boundary Caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ 
        fontFamily: "sans-serif", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh",
        margin: 0,
        backgroundColor: "#f9fafb",
        color: "#111827"
      }}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>Something went wrong!</h2>
          <p style={{ color: "#4b5563", marginBottom: "20px" }}>A critical system error occurred.</p>
          <button 
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#7c3aed", // Simple fallback color
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
