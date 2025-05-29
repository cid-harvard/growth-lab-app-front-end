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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
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
        }}
      >
        <h2>Enter Password</h2>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: 8, fontSize: 16, marginBottom: 12 }}
        />
        <button type="submit" style={{ padding: "8px 16px", fontSize: 16 }}>
          Unlock
        </button>
        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
};

export default PasswordGate;
