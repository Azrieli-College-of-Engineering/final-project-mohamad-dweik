const API = import.meta.env.VITE_API_BASE;

export async function apiFetch(path, options = {}) {
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
