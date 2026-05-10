// ==============================
// LOGIN PAGE — JS
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

// ── Method toggle ────────────────────────────────────────────────────────────
window.switchMethod = function (method) {
  document.getElementById("tabEmail").classList.toggle("active", method === "email");
  document.getElementById("tabPhone").classList.toggle("active", method === "phone");
  document.getElementById("emailSection").style.display = method === "email" ? "" : "none";
  document.getElementById("phoneSection").style.display = method === "phone" ? "" : "none";
  clearAlert();
};

// ── Alert helpers ─────────────────────────────────────────────────────────────
function showAlert(type, msg) {
  const el = document.getElementById("loginAlert");
  el.className = `auth-alert ${type}`;
  el.innerHTML = `<span>${type === "error" ? "⚠" : "✓"}</span> ${msg}`;
  el.style.display = "flex";
}
function clearAlert() {
  document.getElementById("loginAlert").style.display = "none";
}

// ── Eye toggle ────────────────────────────────────────────────────────────────
window.toggleEye = function (id, btn) {
  const el = document.getElementById(id);
  el.type = el.type === "password" ? "text" : "password";
  btn.textContent = el.type === "password" ? "👁" : "🙈";
};

// ── Loading helpers ───────────────────────────────────────────────────────────
function setLoading(btnId, spinnerId, on) {
  const btn = document.getElementById(btnId);
  const sp  = document.getElementById(spinnerId);
  if (btn) btn.disabled = on;
  if (sp)  sp.style.display = on ? "inline-block" : "none";
}

// ── Route after login ─────────────────────────────────────────────────────────
async function routeAfterLogin(user) {
  let role = "client";
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (data?.role) role = data.role;
  } catch (_) {
    role = user.user_metadata?.role || "client";
  }
  window.location.replace(role === "admin" ? "/admin.html" : "/client.html");
}

// ── EMAIL LOGIN ────────────────────────────────────────────────────────────────
window.doEmailLogin = async function () {
  clearAlert();
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showAlert("error", "Please enter both email and password."); return;
  }

  setLoading("btnEmailLogin", "spEmailLogin", true);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await routeAfterLogin(data.user);
  } catch (e) {
    let msg = "Login failed. Please try again.";
    const err = e.message?.toLowerCase() || "";

    if (e.status === 429 || err.includes("rate limit") || err.includes("too many")) {
      msg = "Too many login attempts. Please wait a few minutes and try again.";
    } else if (err.includes("invalid login credentials") || err.includes("invalid email") || err.includes("wrong password")) {
      msg = "Incorrect email or password. Please check and try again.";
    } else if (err.includes("email not confirmed")) {
      msg = "Please verify your email first. Check your inbox for the confirmation link.";
    } else if (err.includes("user not found")) {
      msg = "No account found with this email. Please register first.";
    } else {
      msg = e.message || msg;
    }

    showAlert("error", msg);
    setLoading("btnEmailLogin", "spEmailLogin", false);
  }
};

// Allow Enter key on password field
document.getElementById("loginPassword")?.addEventListener("keydown", e => {
  if (e.key === "Enter") window.doEmailLogin();
});

// ── PHONE OTP — SEND ──────────────────────────────────────────────────────────
let otpSentPhone = null;
let cooldownTimer = null;

window.doSendOtp = async function () {
  clearAlert();
  const phone = document.getElementById("loginPhone").value.trim();

  if (!phone || phone.length < 10) {
    showAlert("error", "Enter a valid 10-digit phone number."); return;
  }

  const fullPhone = `+91${phone}`;
  setLoading("btnSendOtp", "spSendOtp", true);

  try {
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) throw error;

    otpSentPhone = fullPhone;
    document.getElementById("otpRow").style.display = "";
    showAlert("info", `OTP sent to ${fullPhone}. Check your messages.`);
    startCooldown();

  } catch (e) {
    showAlert("error", e.message || "Failed to send OTP.");
    setLoading("btnSendOtp", "spSendOtp", false);
  }
};

function startCooldown() {
  const btn = document.getElementById("btnSendOtp");
  const label = document.getElementById("sendOtpLabel");
  let secs = 60;
  btn.disabled = true;
  document.getElementById("spSendOtp").style.display = "none";

  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    label.textContent = `Resend OTP (${--secs}s)`;
    if (secs <= 0) {
      clearInterval(cooldownTimer);
      btn.disabled = false;
      label.textContent = "Resend OTP";
    }
  }, 1000);
}

// ── PHONE OTP — VERIFY ────────────────────────────────────────────────────────
window.doVerifyOtp = async function () {
  clearAlert();
  const otp = document.getElementById("loginOtp").value.trim();

  if (!otp || otp.length !== 6) {
    showAlert("error", "Please enter the 6-digit OTP."); return;
  }
  if (!otpSentPhone) {
    showAlert("error", "Please send an OTP first."); return;
  }

  setLoading("btnVerifyOtp", "spVerifyOtp", true);
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: otpSentPhone,
      token: otp,
      type: "sms"
    });
    if (error) throw error;
    await routeAfterLogin(data.user);
  } catch (e) {
    showAlert("error", e.message || "OTP verification failed.");
    setLoading("btnVerifyOtp", "spVerifyOtp", false);
  }
};
