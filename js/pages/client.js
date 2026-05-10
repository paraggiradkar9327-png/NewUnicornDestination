// ==============================
// CLIENT PAGE — Entry Point
// ==============================
import { fetchItinerary } from "../modules/itineraryApi.js";
import { showShareModal } from "../modules/shareModal.js";
import { observeCards } from "../modules/scrollReveal.js";
import { requireAuth, injectAuthTopbar } from "../modules/auth.js";

// ── AUTH GUARD — any logged-in user ────────────────────────────
(async () => {
    const currentUser = await requireAuth(); // just must be logged in
    if (!currentUser) return;
    await injectAuthTopbar(currentUser);
    loadItinerary();
})();

async function loadItinerary() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // ── No ID in URL ──
    if (!id) {
        document.getElementById("loadingState").innerHTML =
            `<p style="text-align:center;padding:40px;color:#999;">No itinerary found.</p>`;
        return;
    }

    // ── Fetch from Supabase ──
    const data = await fetchItinerary(id);

    if (!data) {
        document.getElementById("loadingState").innerHTML =
            `<p style="text-align:center;padding:40px;color:#999;">Error loading itinerary. Please check the link.</p>`;
        return;
    }

    // ── Hide loading, show section header ──
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("sectionHeader").style.display = "";

    // ── Render days ──
    renderDays(data.content, id);

    // ── Render admin action buttons ──
    renderActions(id);
}

// ── Render day cards ──────────────────────────────────────────
function renderDays(days, id) {
    const daysList = document.getElementById("daysList");
    daysList.innerHTML = "";

    days.forEach(day => {
        const dayNumPadded = String(day.day).padStart(2, "0");

        // Date badge
        let dateHTML = "";
        if (day.date) {
            const formatted = new Date(day.date + "T00:00:00").toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric"
            });
            dateHTML = `<span class="day-date-badge">📅 ${formatted}</span>`;
        }

        // Photos
        let photosHTML = "";
        if (day.photos?.length) {
            const slots = day.photos.map(p => `
        <div class="photo-slot">
          <img src="${p}" alt="Day ${day.day} photo">
        </div>`).join("");
            photosHTML = `
        <p class="media-label">Photos</p>
        <div class="photos-grid">${slots}</div>`;
        }

        // Videos
        let videosHTML = "";
        if (day.videos?.length) {
            const slots = day.videos.map((v, i) => `
        <div class="video-slot">
          <video src="${v}" controls></video>
          <div class="play-btn"><div class="play-icon"></div></div>
          <span class="video-caption">Clip ${i + 1}</span>
        </div>`).join("");
            videosHTML = `
        <p class="media-label">Videos</p>
        <div class="video-grid">${slots}</div>`;
        }

        const hasMedia = photosHTML || videosHTML;

        const div = document.createElement("div");
        div.className = "itineraryDay fade-up";
        div.innerHTML = `
      <div class="day-number-col">
        <div class="day-num">
          <span class="day-num-label">Day</span>
          <span class="day-num-value">${dayNumPadded}</span>
        </div>
      </div>
     
      <div class="day-body">
       <div class="day-header">
        <h2>${day.title || "Day " + day.day}</h2>
      </div>
        ${dateHTML}
        <p class="day-desc">${day.desc || ""}</p>
        ${hasMedia ? '<div class="day-divider"></div>' : ""}
        ${photosHTML}
        ${videosHTML}
      </div>
    `;
        daysList.appendChild(div);
    });

    observeCards();

    // Trigger fade-up on day cards
    if (typeof window.reObserveFadeUps === "function") {
        window.reObserveFadeUps();
    }
}

// ── Render edit + share buttons ───────────────────────────────
function renderActions(id) {
    const actionsEl = document.getElementById("clientActions");
    actionsEl.innerHTML = `
    <div class="client-actions">
      <a href="/admin.html?edit=${id}" class="edit-itinerary-btn">✏️ Edit Itinerary</a>
      <button type="button" class="share-itinerary-btn" id="shareBtn">🔗 Share with Client</button>
    </div>
  `;

    document.getElementById("shareBtn").addEventListener("click", () => {
        const previewUrl = `${window.location.origin}/preview.html?id=${id}`;
        showShareModal(previewUrl);
    });
}

// ── Run ───────────────────────────────────────────────────────
loadItinerary();