// src/app/signup/page.tsx
"use client";

import { useState } from "react";
/* Reuse the exact same CSS module from /app/login/Login.module.css */
import styles from "../login/Login.module.css";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage(data.message);
      } else {
        setIsSuccess(false);
        setMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage("Network error.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Sign Up</h2>
        <form className={styles.form} onSubmit={handleSignup}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input
            id="username"
            type="text"
            className={styles.input}
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            required
          />

          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />

          <button type="submit" className={styles.button}>
            Sign Up
          </button>
        </form>

        {message && (
          <p
            className={styles.message}
            style={{ color: isSuccess ? "#2E7D32" : "#C62828" }}
          >
            {message}
          </p>
        )}

        <p className={styles.footerText}>
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}
