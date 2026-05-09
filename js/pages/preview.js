// ==============================
// PREVIEW PAGE — Entry Point
// ==============================
import { fetchItinerary } from "../modules/itineraryApi.js";
import { observeCards, observeFadeUps } from "../modules/scrollReveal.js";


// ── Load ──────────────────────────────────────────────────────
async function loadItinerary() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const main = document.getElementById("previewContent");

    if (!id) {
        main.innerHTML = `<p style="text-align:center;padding:80px 20px;color:var(--muted);font-size:13px;letter-spacing:1px;">No itinerary ID found in the URL.</p>`;
        return;
    }

    const data = await fetchItinerary(id);
    if (!data) {
        main.innerHTML = `<p style="text-align:center;padding:80px 20px;color:var(--muted);font-size:13px;letter-spacing:1px;">Could not load itinerary. Please check the link.</p>`;
        return;
    }

    renderStats(data.content);
    renderDays(data.content);
    setupPdfButton(data);
}


// ── Stats strip ────────────────────────────────────────────────
function renderStats(days) {
    const grid = document.getElementById("statsGrid");
    if (!grid) return;

    const firstDay = days[0] || {};

    const totalDays = days.length;
    const destinations = new Set(days.map(d => d.location || "").filter(Boolean));
    const destiny = firstDay.destination;
    const destCount = destinations.size || "–";
    const daysOfTravel = firstDay.daysOfTravel;
    const pax = firstDay.pax
    const totalPhotos = days.reduce((sum, d) => sum + (d.photos?.length ?? 0), 0);
    const totalVideos = days.reduce((sum, d) => sum + (d.videos?.length ?? 0), 0);

    const stats = [
        { icon: "🌍", value: daysOfTravel, label: "Days of Travel" },
        { icon: "📍", value: destiny, label: "Destinations" },
        { icon: "🧑‍🤝‍🧑", value: pax, label: "Number of People" },
    ];

    grid.innerHTML = stats.map(s => `
    <div class="highlight-item">
      <span class="highlight-icon">${s.icon}</span>
      <div class="highlight-value">${s.value}</div>
      <div class="highlight-label">${s.label}</div>
    </div>
  `).join("");
}


// ── Day cards ─────────────────────────────────────────────────
function renderDays(days) {
    const list = document.getElementById("daysList");
    if (!list) return;
    list.innerHTML = "";

    days.forEach((day, index) => {
        const isLast = index === days.length - 1;
        const dayNumPadded = String(day.day).padStart(2, "0");
        const dayTitle = day.title?.trim() || `Day ${day.day}`;
        const daysOfTravel = day.daysOfTravel?.trim();
        const destinations = day.destinations?.trim();
        const locationLabel = day.location || dayTitle;

        let dateHTML = "";
        if (day.date) {
            const formatted = new Date(day.date + "T00:00:00").toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric"
            });
            dateHTML = `<div class="day-date-inline">📅 ${formatted}</div>`;
        }

        let tagsHTML = "";
        if (day.tags?.length) {
            tagsHTML = `<div class="day-tags">${day.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>`;
        }

        let photosHTML = "";
        if (day.photos?.length) {
            const slots = day.photos.map(p => `
        <div class="photo-slot">
          <img src="${p}" alt="Day ${day.day} photo" loading="lazy">
        </div>`).join("");
            photosHTML = `<p class="media-label">Photos</p><div class="photos-grid">${slots}</div>`;
        }

        let videosHTML = "";
        if (day.videos?.length) {
            const slots = day.videos.map((v, i) => `
        <div class="video-slot">
          <video src="${v}" controls preload="metadata"></video>
          <div class="play-btn"><div class="play-icon"></div></div>
          <span class="video-caption">Clip ${i + 1}</span>
        </div>`).join("");
            videosHTML = `
        <div class="video-section no-print">
          <p class="media-label video-label">Videos</p>
          <div class="video-grid">${slots}</div>
        </div>`;
        }

        const hasMedia = photosHTML || videosHTML;

        const card = document.createElement("div");
        card.className = "day-card fade-up";
        card.innerHTML = `
      <div class="day-number-col">
        <div class="day-num">
          <span class="day-num-label">Day</span>
          <span class="day-num-value">${dayNumPadded}</span>
        </div>
        ${!isLast ? '<div class="day-connector"></div>' : ""}
      </div>
      <div class="day-body">
        <div class="day-location">
          <span class="location-dot"></span>
          <span class="location-name">${locationLabel}</span>
        </div>
        ${dateHTML}
        <p class="day-desc">${day.desc || ""}</p>
        ${tagsHTML}
        ${hasMedia ? '<div class="day-divider"></div>' : ""}
        ${photosHTML}
        ${videosHTML}
      </div>
    `;

        list.appendChild(card);
    });

    observeCards();
    observeFadeUps();
}


// ── PDF download ──────────────────────────────────────────────
function setupPdfButton(data) {
    const btn = document.getElementById("downloadPdfBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        btn.disabled = true;
        btn.innerHTML = `<span class="btn-icon">↓</span> Preparing PDF…`;

        const videoSections = document.querySelectorAll(".video-section");
        videoSections.forEach(el => el.style.display = "none");

        setTimeout(() => {
            window.print();
            videoSections.forEach(el => el.style.display = "");
            btn.disabled = false;
            btn.innerHTML = `<span class="btn-icon">↓</span> Download Your Itinerary PDF`;
        }, 200);
    });
}


// ── Run ──────────────────────────────────────────────────────
loadItinerary();