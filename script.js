// =======================================
// 1. Automatic Year for Footer
// =======================================
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// =======================================
// 2. Dark Mode Toggle
// =======================================
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// =======================================
// 3. Simple Parallax Background
// =======================================
window.addEventListener("scroll", function () {
  const parallaxBg = document.querySelector("[data-parallax-bg]");
  if (!parallaxBg) return;
  const scrollY = window.pageYOffset;
  // Adjust factor for desired speed
  parallaxBg.style.transform = `translateY(${scrollY * 0.4}px)`;
});

// =======================================
// 4. Intersection Observer for Fade-Ins
// =======================================
const faders = document.querySelectorAll("[data-animate]");

const appearOptions = {
  threshold: 0.1,
};

const appearOnScroll = new IntersectionObserver((entries, appearOnScroll) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in-view");
    appearOnScroll.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach((fader) => {
  appearOnScroll.observe(fader);
});

// =======================================
// 5. Typewriter Effect in Hero
// =======================================
const typewriterText = "I build robust & scalable software.";
const typewriterEl = document.getElementById("typewriter");
let i = 0;

function type() {
  if (typewriterEl) {
    if (i < typewriterText.length) {
      typewriterEl.textContent += typewriterText.charAt(i);
      i++;
      setTimeout(type, 100);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  type();
});
