// ==============================
// DAY BLOCK COMPONENT (Admin Form)
// ==============================
import { createPhotoSlot } from "./photoSlot.js";
import { createVideoSlot } from "./videoSlot.js";

/**
 * Creates a full admin day-entry block DOM element.
 * Contains: day number header, date, title, description,
 *           3 photo slots, and 1 video slot.
 *
 * @returns {HTMLElement}
 */
export function createDayBlock() {
    const dayBlock = document.createElement("div");
    dayBlock.className = "dayBlock";

    // Header
    const header = document.createElement("h3");
    header.textContent = "Day";
    dayBlock.appendChild(header);

    // Date
    const dateLabel = document.createElement("label");
    dateLabel.textContent = "Date:";
    dayBlock.appendChild(dateLabel);
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "day-date";
    dayBlock.appendChild(dateInput);

    // Title
    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Day Title:";
    dayBlock.appendChild(titleLabel);
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "day-title";
    titleInput.placeholder = "e.g. Arrival & City Welcome";
    dayBlock.appendChild(titleInput);

    // Description
    const descLabel = document.createElement("label");
    descLabel.textContent = "Description:";
    dayBlock.appendChild(descLabel);
    const textarea = document.createElement("textarea");
    textarea.className = "desc";
    dayBlock.appendChild(textarea);

    // Photos (up to 3)
    const photosLabel = document.createElement("label");
    photosLabel.textContent = "Photos (up to 3):";
    dayBlock.appendChild(photosLabel);
    const photosGrid = document.createElement("div");
    photosGrid.className = "photo-upload-grid";
    for (let i = 1; i <= 3; i++) {
        photosGrid.appendChild(createPhotoSlot(i));
    }
    dayBlock.appendChild(photosGrid);

    // Video (1 clip)
    const videoLabel = document.createElement("label");
    videoLabel.textContent = "Video (1 clip):";
    dayBlock.appendChild(videoLabel);
    const videoWrapper = document.createElement("div");
    videoWrapper.className = "video-upload-wrapper";
    videoWrapper.appendChild(createVideoSlot());
    dayBlock.appendChild(videoWrapper);

    return dayBlock;
}