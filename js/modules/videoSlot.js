// ==============================
// VIDEO SLOT COMPONENT (Admin)
// ==============================

/**
 * Creates a single video upload slot UI element.
 *
 * @returns {HTMLElement}
 */
export function createVideoSlot() {
  const wrapper = document.createElement("div");
  wrapper.className = "video-upload-slot";

  wrapper.innerHTML = `
    <label class="video-slot-label">
      <input type="file" class="video-input" accept="video/*">
      <div class="video-slot-preview">
        <div class="video-slot-empty">
          <span class="slot-icon">🎬</span>
          <span class="slot-text">Upload Video</span>
          <span class="slot-subtext">MP4, MOV, AVI</span>
        </div>
        <video class="video-preview-el" style="display:none;" muted></video>
        <button type="button" class="video-remove-btn" style="display:none;" title="Remove video">✕</button>
        <span class="video-filename" style="display:none;"></span>
      </div>
    </label>
  `;

  const input      = wrapper.querySelector(".video-input");
  const previewEl  = wrapper.querySelector(".video-preview-el");
  const emptyState = wrapper.querySelector(".video-slot-empty");
  const removeBtn  = wrapper.querySelector(".video-remove-btn");
  const filenameEl = wrapper.querySelector(".video-filename");

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    previewEl.src = url;
    previewEl.style.display = "block";
    emptyState.style.display = "none";
    removeBtn.style.display = "flex";
    filenameEl.textContent = file.name.length > 28 ? file.name.slice(0, 25) + "…" : file.name;
    filenameEl.style.display = "block";
  });

  removeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    input.value = "";
    previewEl.src = "";
    previewEl.style.display = "none";
    emptyState.style.display = "flex";
    removeBtn.style.display = "none";
    filenameEl.style.display = "none";
  });

  return wrapper;
}
