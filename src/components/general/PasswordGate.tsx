import type { FC, ReactNode, FormEvent } from "react";
import React, { useState, useEffect } from "react";

interface PasswordGateProps {
  children: ReactNode;
}

const CORRECT_PASSWORD = "theplace";
const STORAGE_KEY = "spaceviz_pw_unlocked";

const PasswordGate: FC<PasswordGateProps> = ({ children }) => {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      setUnlocked(true);
      setError("");
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        zIndex: 9999,
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: 32,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "400px",
          width: "90%",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "24px", color: "#333" }}>
          Enter Password
        </h2>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: 12,
            fontSize: 16,
            marginBottom: 16,
            border: "1px solid #ddd",
            borderRadius: 4,
            width: "100%",
            boxSizing: "border-box",
          }}
          placeholder="Password"
        />
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            fontSize: 16,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Unlock
        </button>
        {error && (
          <div
            style={{
              color: "#dc3545",
              marginTop: 16,
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default PasswordGate;
