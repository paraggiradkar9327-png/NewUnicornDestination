// ==============================
// AUTH MODULE — Shared helpers
// ==============================
import { supabase } from "./supabase.js";

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    if (data) return { ...session.user, profile: data };
  } catch (_) {}

  const meta = session.user.user_metadata || {};
  return {
    ...session.user,
    profile: {
      full_name: meta.full_name || session.user.email?.split("@")[0] || "User",
      role: meta.role || "client",
      email: session.user.email,
      phone: meta.phone || null,
    }
  };
}

export async function requireAuth(allowedRole = null) {
  const user = await getCurrentUser();
  if (!user) { window.location.replace("/login.html"); return null; }
  if (allowedRole && user.profile?.role !== allowedRole) {
    const role = user.profile?.role;
    if (role === "admin") window.location.replace("/admin.html");
    else window.location.replace("/client.html");
    return null;
  }
  return user;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.replace("/login.html");
}

// ── Inject topbar into the top-right corner of the hero ──────
export async function injectAuthTopbar(user) {
  const name     = user?.profile?.full_name || user?.email?.split("@")[0] || "User";
  const role     = user?.profile?.role || "client";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  // Remove any existing topbar
  document.querySelector(".auth-topbar")?.remove();

  const bar = document.createElement("div");
  bar.className = "auth-topbar";
  bar.innerHTML = `
    <div class="auth-user-info">
      <div class="auth-avatar">${initials}</div>
      <div class="auth-user-text">
        <span class="auth-user-name">${name}</span>
        <span class="auth-role-badge ${role}">${role}</span>
      </div>
    </div>
    <button class="logout-btn" id="logoutBtn">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      <span>Logout</span>
    </button>
  `;

  // Place inside hero at top-right
  const hero = document.querySelector("header.hero");
  if (hero) {
    hero.style.position = "relative";
    hero.appendChild(bar);
  } else {
    document.body.insertBefore(bar, document.body.firstChild);
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);
}