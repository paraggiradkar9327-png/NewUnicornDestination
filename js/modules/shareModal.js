// ==============================
// SHARE / LINK MODAL
// ==============================

/**
 * Show a modal with a shareable preview link and a copy button.
 *
 * @param {string} url - The URL to share (preview.html?id=...)
 */
export function showShareModal(url) {
    document.getElementById("shareModal")?.remove();

    const modal = document.createElement("div");
    modal.id = "shareModal";
    modal.innerHTML = `
    <div class="link-modal-backdrop"></div>
    <div class="link-modal-box">
      <div class="link-modal-icon">🔗</div>
      <h2 class="link-modal-title">Share Itinerary</h2>
      <p class="link-modal-sub">Copy the link below and send it to your client. They'll see their personalised itinerary.</p>

      <div class="link-copy-row">
        <input id="shareLinkInput" class="link-input" type="text" value="${url}" readonly>
        <button type="button" id="copyShareLinkBtn" class="copy-btn">
          <span class="copy-icon">📋</span>
          <span class="copy-label">Copy</span>
        </button>
      </div>

      <div id="shareCopySuccess" class="copy-success" style="display:none;">
        ✅ Link copied to clipboard!
      </div>

      <div class="link-modal-actions">
        <a href="${url}" target="_blank" class="preview-btn">
          <span>👁</span> Preview Client Page
        </a>
        <button type="button" class="close-modal-btn" id="closeShareModalBtn">
          Close
        </button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    // Copy link
    document.getElementById("copyShareLinkBtn").addEventListener("click", () => {
        navigator.clipboard.writeText(url).then(() => {
            document.getElementById("shareCopySuccess").style.display = "block";
            document.getElementById("copyShareLinkBtn").innerHTML =
                `<span class="copy-icon">✅</span><span class="copy-label">Copied!</span>`;
            setTimeout(() => {
                document.getElementById("shareCopySuccess").style.display = "none";
                document.getElementById("copyShareLinkBtn").innerHTML =
                    `<span class="copy-icon">📋</span><span class="copy-label">Copy</span>`;
            }, 3000);
        });
    });

    // Select all on click
    document.getElementById("shareLinkInput").addEventListener("click", function () {
        this.select();
    });

    // Close
    document.getElementById("closeShareModalBtn").addEventListener("click", () => modal.remove());
    modal.querySelector(".link-modal-backdrop").addEventListener("click", () => modal.remove());
}