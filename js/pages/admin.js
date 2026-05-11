// ==============================
// ADMIN PAGE — Entry Point
// ==============================
import { supabase } from "../modules/supabase.js";
import { requireAuth, injectAuthTopbar } from "../modules/auth.js";
import { uploadFile } from "../modules/fileUpload.js";
import { saveItinerary, updateItinerary, fetchItinerary, searchItineraryByTrip } from "../modules/itineraryApi.js";
import { createDayBlock } from "../modules/dayBlock.js";
import { createTripInfoPanel } from "../modules/tripInfoPanel.js";

document.addEventListener("DOMContentLoaded", async () => {
    // ── AUTH GUARD — must be admin ──────────────────────────────
    const currentUser = await requireAuth("admin");
    if (!currentUser) return;

    // ── Inject user topbar with logout button ───────────────────
    await injectAuthTopbar(currentUser);

    // ── Trip Info Panel (outside form, top of <main>) ──────────
    const main = document.querySelector("main");
    const form = document.getElementById("itineraryForm");
    main.insertBefore(createTripInfoPanel(), form);

    const addDayBtn        = document.getElementById("addDayBtn");
    const showItineraryBtn = document.getElementById("showItineraryBtn");
    const daysContainer    = document.getElementById("daysContainer");
    const clearBtn         = document.getElementById("clearAllBtn");

    // Track the itinerary ID loaded from DB via Show Itinerary
    let _loadedItineraryId = null;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");

    // ── Add Day ────────────────────────────────────────────────
    if (addDayBtn) {
        addDayBtn.addEventListener("click", () => {
            daysContainer.appendChild(createDayBlock());
            setTimeout(updateClearBtn, 0);
        });
    }

    // ── Pre-fill if editing (URL ?edit=ID) ─────────────────────
    if (editId) {
        const submitBtnLabel = form?.querySelector(".submitBtn span:last-child");
        if (submitBtnLabel) submitBtnLabel.textContent = "Update Itinerary";

        const data = await fetchItinerary(editId);
        if (data?.content) {
            _prefillTripPanel(data.content[0]);
            for (const day of data.content) {
                const block = createDayBlock();
                daysContainer.appendChild(block);
                _fillBlockFromData(block, day);
            }
            setTimeout(updateClearBtn, 0);
        }
    }

    // ── SHOW ITINERARY BUTTON ───────────────────────────────────
    if (showItineraryBtn) {
        showItineraryBtn.addEventListener("click", async () => {
            const destination  = document.getElementById("tripDestination")?.value.trim();
            const daysOfTravel = document.getElementById("tripDaysOfTravel")?.value.trim();

            // Validate that both fields are filled
            if (!destination || !daysOfTravel) {
                _showSearchStatus(
                    "warning",
                    "⚠ Please fill in both <strong>Destination</strong> and <strong>Days of Travel</strong> in the Trip Overview above before searching."
                );
                // Highlight the empty fields briefly
                if (!destination) _flashField("tripDestination");
                if (!daysOfTravel) _flashField("tripDaysOfTravel");
                return;
            }

            // Set loading state on button
            _setShowBtnLoading(true);
            _showSearchStatus("info", `🔍 Searching for itinerary: <strong>${destination}</strong> · <strong>${daysOfTravel}</strong>…`);

            try {
                const record = await searchItineraryByTrip(destination, daysOfTravel);

                if (!record) {
                    _showSearchStatus(
                        "error",
                        `❌ No itinerary found for <strong>${destination}</strong> · <strong>${daysOfTravel}</strong>. You can create one using <strong>Add Day</strong>.`
                    );
                    return;
                }

                // ── Found — clear existing blocks and load data ──
                // Clear any existing day blocks
                daysContainer.innerHTML = "";
                _loadedItineraryId = record.id;

                // Fill the trip info panel from first day
                _prefillTripPanel(record.content[0]);

                // Build a day block for every saved day
                for (const day of record.content) {
                    const block = createDayBlock();
                    daysContainer.appendChild(block);
                    _fillBlockFromData(block, day);
                }

                setTimeout(updateClearBtn, 0);

                // Switch submit button label to "Update Itinerary"
                const submitBtnLabel = form?.querySelector(".submitBtn span:last-child");
                if (submitBtnLabel) submitBtnLabel.textContent = "Update Itinerary";

                // Show success banner with count
                const dayCount = record.content?.length || 0;
                _showSearchStatus(
                    "success",
                    `✅ Itinerary loaded — <strong>${destination}</strong> · <strong>${daysOfTravel}</strong> · ${dayCount} day${dayCount !== 1 ? "s" : ""}. Edit the fields below and click <strong>Update Itinerary</strong> to save changes.`
                );

                // Scroll to the first day block smoothly
                const firstBlock = daysContainer.querySelector(".dayBlock");
                if (firstBlock) {
                    setTimeout(() => firstBlock.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                }

            } catch (err) {
                console.error("Show itinerary error:", err);
                _showSearchStatus("error", "❌ An error occurred while searching. Please try again.");
            } finally {
                _setShowBtnLoading(false);
            }
        });
    }

    // ── Clear All button ────────────────────────────────────────
    function checkIfAnyFieldFilled() {
        for (const block of document.querySelectorAll(".dayBlock")) {
            if (block.querySelector(".day-date")?.value) return true;
            if (block.querySelector(".day-title")?.value.trim()) return true;
            if (block.querySelector(".desc")?.value.trim()) return true;
            if ([...block.querySelectorAll(".photo-input")].some(i => i.files[0])) return true;
            if ([...block.querySelectorAll(".photo-upload-slot")].some(s => s.dataset.existingUrl)) return true;
            if (block.querySelector(".video-upload-slot")?.dataset.existingUrl) return true;
            if (block.querySelector(".video-input")?.files[0]) return true;
        }
        return false;
    }

    function updateClearBtn() {
        if (!clearBtn) return;
        const active = checkIfAnyFieldFilled();
        clearBtn.disabled = !active;
        clearBtn.classList.toggle("clear-btn-active", active);
    }

    form?.addEventListener("input", updateClearBtn);
    form?.addEventListener("change", updateClearBtn);

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            document.querySelectorAll(".dayBlock").forEach(block => {
                _clearBlock(block);
            });
            updateClearBtn();
        });
    }

    updateClearBtn();

    // ── Form submit ─────────────────────────────────────────────
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector(".submitBtn");
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="btn-icon">⏳</span><span>Uploading…</span>`;

            const days = await _collectDays();

            // Use _loadedItineraryId if we loaded one via Show Itinerary,
            // otherwise fall back to the URL ?edit= param.
            const activeEditId = _loadedItineraryId || editId;

            let itineraryId;
            if (activeEditId) {
                const ok = await updateItinerary(activeEditId, days);
                if (!ok) {
                    alert("Failed to update itinerary.");
                    _resetSubmitBtn(submitBtn, activeEditId);
                    return;
                }
                itineraryId = activeEditId;
            } else {
                itineraryId = await saveItinerary(days);
            }

            _resetSubmitBtn(submitBtn, activeEditId);

            if (itineraryId) {
                window.location.href = `/client.html?id=${itineraryId}`;
            } else {
                alert("Failed to save itinerary. Please try again.");
            }
        });
    }
});


// ── DAY NUMBER OBSERVER ────────────────────────────────────────
const _container = document.getElementById("daysContainer");
if (_container) {
    const _observer = new MutationObserver(() => {
        document.querySelectorAll(".dayBlock").forEach((block, i) => {
            const h3 = block.querySelector("h3");
            if (h3) h3.textContent = `Day ${i + 1}`;
        });
    });
    _observer.observe(_container, { childList: true });
}


// ── PRIVATE HELPERS ────────────────────────────────────────────

/** Pre-fill the trip info panel fields from a day-object. */
function _prefillTripPanel(day) {
    if (!day) return;
    const destEl = document.getElementById("tripDestination");
    const dotEl  = document.getElementById("tripDaysOfTravel");
    const paxEl  = document.getElementById("tripPax");
    if (destEl && day.destination)  destEl.value = day.destination;
    if (dotEl  && day.daysOfTravel) dotEl.value  = day.daysOfTravel;
    if (paxEl  && day.pax)          paxEl.value  = day.pax;
}

/** Populate a day block from existing saved data. */
function _fillBlockFromData(block, day) {
    const dateEl  = block.querySelector(".day-date");
    const titleEl = block.querySelector(".day-title");
    const descEl  = block.querySelector(".desc");
    if (dateEl  && day.date)  dateEl.value  = day.date;
    if (titleEl && day.title) titleEl.value = day.title;
    if (descEl  && day.desc)  descEl.value  = day.desc;

    // Photos
    if (day.photos?.length) {
        const slots = block.querySelectorAll(".photo-upload-slot");
        day.photos.forEach((url, i) => {
            if (!slots[i]) return;
            const img       = slots[i].querySelector(".photo-preview-img");
            const empty     = slots[i].querySelector(".photo-slot-empty");
            const removeBtn = slots[i].querySelector(".photo-remove-btn");
            slots[i].dataset.existingUrl = url;
            img.src = url;
            img.style.display    = "block";
            empty.style.display  = "none";
            removeBtn.style.display = "flex";
            removeBtn.addEventListener("click", () => { delete slots[i].dataset.existingUrl; });
        });
    }

    // Video
    if (day.videos?.length) {
        const videoSlot = block.querySelector(".video-upload-slot");
        if (videoSlot) {
            const videoEl   = videoSlot.querySelector(".video-preview-el");
            const empty     = videoSlot.querySelector(".video-slot-empty");
            const removeBtn = videoSlot.querySelector(".video-remove-btn");
            const filename  = videoSlot.querySelector(".video-filename");
            videoSlot.dataset.existingUrl = day.videos[0];
            videoEl.src = day.videos[0];
            videoEl.style.display    = "block";
            empty.style.display      = "none";
            removeBtn.style.display  = "flex";
            filename.textContent     = "Existing video";
            filename.style.display   = "block";
            removeBtn.addEventListener("click", () => { delete videoSlot.dataset.existingUrl; });
        }
    }
}

/** Clear all fields in a day block back to empty state. */
function _clearBlock(block) {
    const dateEl  = block.querySelector(".day-date");
    const titleEl = block.querySelector(".day-title");
    const descEl  = block.querySelector(".desc");
    if (dateEl)  dateEl.value  = "";
    if (titleEl) titleEl.value = "";
    if (descEl)  descEl.value  = "";

    block.querySelectorAll(".photo-upload-slot").forEach(slot => {
        const input = slot.querySelector(".photo-input");
        const img   = slot.querySelector(".photo-preview-img");
        const empty = slot.querySelector(".photo-slot-empty");
        const rmBtn = slot.querySelector(".photo-remove-btn");
        if (input) input.value = "";
        if (img)  { img.src = ""; img.style.display = "none"; }
        if (empty) empty.style.display = "flex";
        if (rmBtn) rmBtn.style.display = "none";
        delete slot.dataset.existingUrl;
    });

    const videoSlot = block.querySelector(".video-upload-slot");
    if (videoSlot) {
        const input    = videoSlot.querySelector(".video-input");
        const videoEl  = videoSlot.querySelector(".video-preview-el");
        const empty    = videoSlot.querySelector(".video-slot-empty");
        const rmBtn    = videoSlot.querySelector(".video-remove-btn");
        const filename = videoSlot.querySelector(".video-filename");
        if (input)    input.value = "";
        if (videoEl)  { videoEl.src = ""; videoEl.style.display = "none"; }
        if (empty)    empty.style.display    = "flex";
        if (rmBtn)    rmBtn.style.display    = "none";
        if (filename) filename.style.display = "none";
        delete videoSlot.dataset.existingUrl;
    }
}

/** Collect all days from the form, uploading new files as needed. */
async function _collectDays() {
    const days = [];
    for (const [index, block] of [...document.querySelectorAll(".dayBlock")].entries()) {
        const date        = block.querySelector(".day-date")?.value || "";
        const title       = block.querySelector(".day-title")?.value.trim() || "";
        const destination = document.getElementById("tripDestination")?.value.trim() || "";
        const daysOfTravel= document.getElementById("tripDaysOfTravel")?.value.trim() || "";
        const pax         = document.getElementById("tripPax")?.value.trim() || "";
        const desc        = block.querySelector(".desc")?.value || "";

        // Photos
        const photos = [];
        for (const slot of block.querySelectorAll(".photo-upload-slot")) {
            const input = slot.querySelector(".photo-input");
            if (input?.files[0]) {
                const url = await uploadFile("Photos", input.files[0]);
                if (url) photos.push(url);
            } else if (slot.dataset.existingUrl) {
                photos.push(slot.dataset.existingUrl);
            }
        }

        // Video
        const videos = [];
        const videoSlot  = block.querySelector(".video-upload-slot");
        const videoInput = videoSlot?.querySelector(".video-input");
        if (videoInput?.files[0]) {
            const url = await uploadFile("Videos", videoInput.files[0]);
            if (url) videos.push(url);
        } else if (videoSlot?.dataset.existingUrl) {
            videos.push(videoSlot.dataset.existingUrl);
        }

        days.push({ day: index + 1, date, title, destination, daysOfTravel, pax, desc, photos, videos });
    }
    return days;
}

/** Re-enable and relabel the submit button. */
function _resetSubmitBtn(btn, activeEditId) {
    btn.disabled = false;
    btn.innerHTML = `<span class="btn-icon">✈</span><span>${activeEditId ? "Update" : "Generate"} Itinerary</span>`;
}

/** Show/hide the search status banner. */
function _showSearchStatus(type, html) {
    const el = document.getElementById("searchStatus");
    if (!el) return;
    el.className = `search-status search-status--${type}`;
    el.innerHTML = html;
    el.style.display = "block";
    // Auto-hide success messages after 8 seconds
    if (type === "success") {
        clearTimeout(el._timer);
        el._timer = setTimeout(() => { el.style.display = "none"; }, 8000);
    }
}

/** Set the Show Itinerary button to loading state and back. */
function _setShowBtnLoading(loading) {
    const btn   = document.getElementById("showItineraryBtn");
    const icon  = document.getElementById("showItineraryIcon");
    const label = document.getElementById("showItineraryLabel");
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
        icon.textContent  = "⏳";
        label.textContent = "Searching…";
    } else {
        icon.textContent  = "🔍";
        label.textContent = "Show Itinerary";
    }
}

/** Briefly highlight an empty required field. */
function _flashField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("field-required-flash");
    setTimeout(() => el.classList.remove("field-required-flash"), 1800);
}