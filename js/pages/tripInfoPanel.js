// ==============================
// TRIP INFO PANEL (Above Form)
// ==============================

/**
 * Creates the Trip Info panel that sits above the day-blocks form.
 * Contains: Destination, Days of Travel, Number of People.
 *
 * Values are read by the save/submit logic via:
 *   document.getElementById("tripDestination").value
 *   document.getElementById("tripDaysOfTravel").value
 *   document.getElementById("tripPax").value
 *
 * @returns {HTMLElement}
 */
export function createTripInfoPanel() {
    const panel = document.createElement("div");
    panel.className = "trip-info-panel";

    // ── Section heading ────────────────────────────────────────
    const heading = document.createElement("h2");
    heading.className = "trip-info-heading";
    heading.textContent = "Trip Overview";
    panel.appendChild(heading);

    const subtext = document.createElement("p");
    subtext.className = "trip-info-subtext";
    subtext.textContent = "These details appear in the highlights strip of the itinerary preview.";
    panel.appendChild(subtext);

    // ── Fields grid ───────────────────────────────────────────
    const grid = document.createElement("div");
    grid.className = "trip-info-grid";

    grid.appendChild(buildField({
        icon: "📍",
        id: "tripDestination",
        label: "Destination",
        placeholder: "e.g. Goa, India",
    }));

    grid.appendChild(buildField({
        icon: "🌍",
        id: "tripDaysOfTravel",
        label: "Days of Travel",
        placeholder: "e.g. 5N / 4D",
    }));

    grid.appendChild(buildField({
        icon: "🧑‍🤝‍🧑",
        id: "tripPax",
        label: "Number of People",
        placeholder: "e.g. 4",
    }));

    panel.appendChild(grid);
    return panel;
}


// ── Helper ────────────────────────────────────────────────────
function buildField({ icon, id, label, placeholder }) {
    const wrap = document.createElement("div");
    wrap.className = "trip-info-field";

    const iconEl = document.createElement("span");
    iconEl.className = "trip-info-icon";
    iconEl.textContent = icon;
    wrap.appendChild(iconEl);

    const lbl = document.createElement("label");
    lbl.htmlFor = id;
    lbl.className = "trip-info-label";
    lbl.textContent = label;
    wrap.appendChild(lbl);

    const input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.className = "trip-info-input";
    input.placeholder = placeholder;
    wrap.appendChild(input);

    return wrap;
}