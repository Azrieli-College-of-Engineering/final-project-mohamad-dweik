import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api.js";

export default function LoginPage() {
  const nav = useNavigate();
  const [user, setUser] = useState("alice");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onLogin(e) {
    e.preventDefault();
    setErr("");
    const clean = user.trim();
    if (!clean) return setErr("Please enter a username.");

    setLoading(true);
    const r = await apiFetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: clean }),
    });
    setLoading(false);

    if (!r.ok) {
      setErr(`Login failed (HTTP ${r.status}).`);
      return;
    }

    nav("/dashboard", { replace: true });
  }

  return (
    <div className="page">
      <div className="shell">
        <div className="brand">
          <div className="logo">ID</div>
          <div>
            <div className="h1">Insecure Deserialization Lab</div>
            <div className="sub">Authentication</div>
          </div>
        </div>

        <div className="card">
          <div className="cardHead">
            <div className="h2">Login</div>
          </div>

          <form onSubmit={onLogin} className="form">
            <label className="field">
              <span>Username</span>
              <input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Username"
                autoFocus
              />
            </label>

            {err ? <div className="alert alertBad">{err}</div> : null}

            <button className="btn btnPrimary" type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
