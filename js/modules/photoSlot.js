// ==============================
// PHOTO SLOT COMPONENT (Admin)
// ==============================

/**
 * Creates a single photo upload slot UI element.
 *
 * @param {number} slotNumber - 1-indexed slot label
 * @returns {HTMLElement}
 */
export function createPhotoSlot(slotNumber) {
    const wrapper = document.createElement("div");
    wrapper.className = "photo-upload-slot";
    wrapper.dataset.slot = slotNumber;

    wrapper.innerHTML = `
    <label class="photo-slot-label">
      <input type="file" class="photo-input" accept="image/*" data-slot="${slotNumber}">
      <div class="photo-slot-preview">
        <div class="photo-slot-empty">
          <span class="slot-icon">📷</span>
          <span class="slot-text">Photo ${slotNumber}</span>
        </div>
        <img class="photo-preview-img" src="" alt="" style="display:none;">
        <button type="button" class="photo-remove-btn" style="display:none;" title="Remove photo">✕</button>
      </div>
    </label>
  `;

    const input = wrapper.querySelector(".photo-input");
    const previewImg = wrapper.querySelector(".photo-preview-img");
    const emptyState = wrapper.querySelector(".photo-slot-empty");
    const removeBtn = wrapper.querySelector(".photo-remove-btn");

    input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = "block";
            emptyState.style.display = "none";
            removeBtn.style.display = "flex";
        };
        reader.readAsDataURL(file);
    });

    removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.value = "";
        previewImg.src = "";
        previewImg.style.display = "none";
        emptyState.style.display = "flex";
        removeBtn.style.display = "none";
    });

    return wrapper;
}