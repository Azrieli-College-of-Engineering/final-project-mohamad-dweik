import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api.js";

function Pill({ tone, children }) {
  return <span className={`pill pill${tone}`}>{children}</span>;
}

export default function DashboardPage() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [meStatus, setMeStatus] = useState(null);

  const [adminResp, setAdminResp] = useState(null);
  const [adminStatus, setAdminStatus] = useState(null);

  const isAuthed = !!me?.authenticated;
  const isAdmin = !!me?.is_admin;

  const banner = useMemo(() => {
    if (!isAuthed) return { tone: "Bad", title: "Not logged in" };
    if (isAdmin) return { tone: "Good", title: "ADMIN ACCESS" };
    return { tone: "Bad", title: "NOT ADMIN" };
  }, [isAuthed, isAdmin]);

  async function refreshMe() {
    const r = await apiFetch("/api/me");
    setMeStatus(r.status);
    setMe(r.ok ? r.data : null);
  }

  async function checkAdminEndpoint() {
    const r = await apiFetch("/api/admin");
    setAdminStatus(r.status);
    setAdminResp(r.data);
  }

  async function logout() {
    await apiFetch("/api/logout", { method: "POST" });
    nav("/login", { replace: true });
  }

  useEffect(() => {
    refreshMe();
  }, []);

  return (
    <div className="page">
      <div className="shell">
        <div className="topRow">
          <div className="brand">
            <div className="logo">ID</div>
            <div>
              <div className="h1">Dashboard</div>
            </div>
          </div>

          <button className="btn" onClick={logout}>Logout</button>
        </div>

        <div className={`hero hero${banner.tone}`}>
          <div className="heroTitle">{banner.title}</div>
          <div className="heroMeta">
            <Pill tone="Neutral">HTTP {meStatus ?? "—"}</Pill>
            <Pill tone={isAdmin ? "Good" : "Bad"}>
              is_admin: {String(isAdmin)}
            </Pill>
            <Pill tone="Neutral">{me?.user ?? "—"}</Pill>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <div className="cardHead">
              <div className="h2">Session</div>
            </div>

            <button className="btn btnPrimary" onClick={refreshMe}>
              Refresh Status
            </button>

            <button className="btn" onClick={checkAdminEndpoint}>
              Check Admin
            </button>
          </div>

          <div className="card">
            <div className="cardHead">
              <div className="h2">API Response</div>
            </div>

            <pre className="code">
              {adminResp ? JSON.stringify(adminResp, null, 2) : "—"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
