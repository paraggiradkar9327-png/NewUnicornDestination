// ==============================
// REGISTER PAGE — JS
// ==============================
import { supabase } from "../modules/supabase.js";
import { getSession } from "../modules/auth.js";

// ── If already logged in, redirect ─────────────────────────────────────────
(async () => {
  const session = await getSession();
  if (session?.user) {
    const role = session.user.user_metadata?.role || "client";
    window.location.replace(role === "admin" ? "/admin.html" : "/client.html");
  }
})();

// ── Alert helpers ─────────────────────────────────────────────────────────────
function showAlert(type, msg) {
  const el = document.getElementById("registerAlert");
  el.className = `auth-alert ${type}`;
  el.innerHTML = `<span>${type === "error" ? "⚠" : "✓"}</span> ${msg}`;
  el.style.display = "flex";
}
function clearAlert() {
  document.getElementById("registerAlert").style.display = "none";
}

// ── Eye toggle ────────────────────────────────────────────────────────────────
window.toggleEye = function (id, btn) {
  const el = document.getElementById(id);
  el.type = el.type === "password" ? "text" : "password";
  btn.textContent = el.type === "password" ? "👁" : "🙈";
};

// ── Password strength ─────────────────────────────────────────────────────────
document.getElementById("regPassword")?.addEventListener("input", function () {
  const pw = this.value;
  const wrapper = document.getElementById("pwStrength");
  const fill    = document.getElementById("pwFill");
  const label   = document.getElementById("pwLabel");

  if (!pw) { wrapper.style.display = "none"; return; }
  wrapper.style.display = "flex";

  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;

  const configs = [
    { w: "25%",  bg: "#c0392b", text: "Weak" },
    { w: "50%",  bg: "#e67e22", text: "Fair" },
    { w: "75%",  bg: "#f1c40f", text: "Good" },
    { w: "100%", bg: "#27ae60", text: "Strong" },
  ];

  const cfg = configs[Math.max(0, score - 1)];
  fill.style.width      = cfg.w;
  fill.style.background = cfg.bg;
  label.textContent     = cfg.text;
  label.style.color     = cfg.bg;
});

// ── Loading ───────────────────────────────────────────────────────────────────
function setLoading(on) {
  const btn = document.getElementById("btnRegister");
  const sp  = document.getElementById("spRegister");
  btn.disabled = on;
  sp.style.display = on ? "inline-block" : "none";
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
window.doRegister = async function () {
  clearAlert();

  const name     = document.getElementById("regName").value.trim();
  const email    = document.getElementById("regEmail").value.trim();
  const phone    = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value;
  const role     = document.getElementById("regRole").value;

  // Validation
  if (!name)  { showAlert("error", "Full name is required."); return; }
  if (!email) { showAlert("error", "Email address is required."); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert("error", "Enter a valid email address."); return;
  }
  if (!password) { showAlert("error", "Password is required."); return; }
  if (password.length < 6) {
    showAlert("error", "Password must be at least 6 characters."); return;
  }

  setLoading(true);

  try {
    // ── Create auth user — trigger auto-creates the profile row ──
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone ? `+91${phone}` : null,
          role
        }
      }
    });

    if (error) throw error;

    // ── Check if email confirmation is required ──
    const needsConfirm = !data.session;

    showAlert(
      "success",
      needsConfirm
        ? "Account created! Please check your email to verify your account, then sign in."
        : "Account created! Redirecting to login…"
    );

    // Clear form
    ["regName", "regEmail", "regPhone", "regPassword"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.getElementById("pwStrength").style.display = "none";

    // Redirect to login after 3s
    setTimeout(() => window.location.replace("/login.html"), 3000);

  } catch (e) {
    let msg = "Registration failed. Please try again.";
    if (e.status === 429 || e.message?.toLowerCase().includes("rate limit")) {
      msg = "Too many sign-up attempts. Please wait a few minutes and try again.";
    } else if (e.message?.toLowerCase().includes("already registered") || e.message?.toLowerCase().includes("already been registered")) {
      msg = "This email is already registered. Please log in instead.";
    } else {
      msg = e.message || msg;
    }
    showAlert("error", msg);
  } finally {
    setLoading(false);
  }
};
