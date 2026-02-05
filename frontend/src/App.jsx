import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_BASE;

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
  });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  return { ok: res.ok, status: res.status, data };
}

function StatusPill({ status }) {
  const { label, tone } = useMemo(() => {
    if (status == null) return { label: "—", tone: "neutral" };
    if (status >= 200 && status < 300) return { label: `${status} OK`, tone: "good" };
    if (status === 401) return { label: "401 Unauthorized", tone: "warn" };
    if (status === 403) return { label: "403 Forbidden", tone: "bad" };
    return { label: `${status}`, tone: "bad" };
  }, [status]);

  return <span className={`pill pill--${tone}`}>{label}</span>;
}

function JsonBlock({ value }) {
  return (
    <pre className="code">
      {value ? JSON.stringify(value, null, 2) : "—"}
    </pre>
  );
}

export default function App() {
  const [user, setUser] = useState("alice");
  const [last, setLast] = useState({ action: "Idle", status: null });

  const [me, setMe] = useState(null);
  const [meStatus, setMeStatus] = useState(null);

  const [admin, setAdmin] = useState(null);
  const [adminStatus, setAdminStatus] = useState(null);

  async function refreshMe() {
    const r = await apiFetch("/api/me");
    setMeStatus(r.status);
    setMe(r.ok ? r.data : null);
    setLast({ action: "GET /api/me", status: r.status });
  }

  async function login() {
    const clean = user.trim();
    if (!clean) return;

    const r = await apiFetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: clean }),
    });

    setLast({ action: "POST /api/login", status: r.status });
    await refreshMe();
    setAdmin(null);
    setAdminStatus(null);
  }

  async function logout() {
    const r = await apiFetch("/api/logout", { method: "POST" });
    setLast({ action: "POST /api/logout", status: r.status });

    setMe(null);
    setMeStatus(null);
    setAdmin(null);
    setAdminStatus(null);
    await refreshMe();
  }

  async function checkAdmin() {
    const r = await apiFetch("/api/admin");
    setAdminStatus(r.status);
    setAdmin(r.data);
    setLast({ action: "GET /api/admin", status: r.status });
  }

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="logo">ID</div>
          <div>
            <div className="title">Insecure Deserialization Lab</div>
            <div className="subtitle">
              Frontend <code>127.0.0.1:5173</code> · Backend <code>{API}</code>
            </div>
          </div>
        </div>

        <div className="last">
          <div className="last__label">Last action</div>
          <div className="last__row">
            <span className="mono">{last.action}</span>
            <StatusPill status={last.status} />
          </div>
        </div>
      </header>

      <main className="grid">
        <section className="card card--wide">
          <div className="card__head">
            <h2>Authentication</h2>
            <p>Login creates an insecure serialized session cookie (PoC).</p>
          </div>

          <div className="row">
            <label className="field">
              <span>Username</span>
              <input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="e.g. alice"
              />
            </label>

            <div className="actions">
              <button className="btn btn--primary" onClick={login}>
                Login
              </button>
              <button className="btn" onClick={logout}>
                Logout
              </button>
              <button className="btn btn--ghost" onClick={refreshMe}>
                Refresh
              </button>
            </div>
          </div>

          <div className="hint">
            Tip: after login, open DevTools → Application → Cookies →
            <span className="mono"> http://127.0.0.1:5000</span>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <div className="card__titleRow">
              <h2>Session</h2>
              <StatusPill status={meStatus} />
            </div>
            <p>Response from <span className="mono">GET /api/me</span></p>
          </div>

          <div className="kv">
            <div className="kv__item">
              <div className="kv__k">Authenticated</div>
              <div className="kv__v">{me?.authenticated ? "Yes" : "No"}</div>
            </div>
            <div className="kv__item">
              <div className="kv__k">User</div>
              <div className="kv__v mono">{me?.user ?? "—"}</div>
            </div>
            <div className="kv__item">
              <div className="kv__k">is_admin</div>
              <div className="kv__v">{me?.is_admin ? "true" : "false"}</div>
            </div>
          </div>

          <details className="details">
            <summary>Raw JSON</summary>
            <JsonBlock value={me} />
          </details>
        </section>

        <section className="card">
          <div className="card__head">
            <div className="card__titleRow">
              <h2>Admin</h2>
              <StatusPill status={adminStatus} />
            </div>
            <p>Response from <span className="mono">GET /api/admin</span></p>
          </div>

          <button className="btn btn--primary btn--full" onClick={checkAdmin}>
            Check admin access
          </button>

          <div className="spacer" />

          <details className="details" open>
            <summary>Response</summary>
            <JsonBlock value={admin} />
          </details>

          <div className="hint">
            Expected now: <span className="mono">403 Forbidden</span>.
            In the next step, we’ll forge the cookie and you’ll get <span className="mono">200 OK</span>.
          </div>
        </section>
      </main>

      <footer className="footer">
        <span className="muted">
          Lab-only PoC · Next: cookie forging + defenses (HMAC/JSON)
        </span>
      </footer>
    </div>
  );
}
