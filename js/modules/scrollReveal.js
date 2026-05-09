// ==============================
// SCROLL REVEAL UTILITIES
// ==============================

/**
 * Attach IntersectionObserver to all .fade-up elements.
 * Each element gets a staggered transitionDelay.
 */
export function observeFadeUps() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("visible");
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.10 });

    document.querySelectorAll(".fade-up").forEach((el, i) => {
        el.style.transitionDelay = (i * 0.07) + "s";
        observer.observe(el);
    });
}

/**
 * Attach IntersectionObserver to .day-card elements.
 * Used by both client.js and preview.js after rendering day cards.
 */
export function observeCards() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("visible");
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll(".itineraryDay, .day-card").forEach((el, i) => {
        el.style.transitionDelay = (i * 0.08) + "s";
        observer.observe(el);
    });
}