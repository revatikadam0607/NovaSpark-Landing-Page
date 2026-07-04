/* ═══════════════════════════════════════════════════
   NOVASPARK — script.js
   Features: Scroll reveal · Stat counters · Theme toggle
             Pricing toggle · Sticky nav · Hamburger menu
═══════════════════════════════════════════════════ */

"use strict";

/* ─── DOM Ready ─── */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavbar();
  initHamburger();
  initScrollReveal();
  initStatCounters();
  initPricingToggle();
  initCTAButton();
});

/* ══════════════════════════════════════════
   THEME (Dark / Light)
══════════════════════════════════════════ */
function initTheme() {
  const btn = document.getElementById("themeToggle");
  const icon = btn.querySelector(".theme-icon");
  const root = document.documentElement;

  // Persist preference
  const saved = localStorage.getItem("ns-theme") || "dark";
  root.setAttribute("data-theme", saved);
  icon.textContent = saved === "dark" ? "🌙" : "☀️";

  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    icon.textContent = next === "dark" ? "🌙" : "☀️";
    localStorage.setItem("ns-theme", next);
  });
}

/* ══════════════════════════════════════════
   STICKY NAVBAR
══════════════════════════════════════════ */
function initNavbar() {
  const nav = document.getElementById("navbar");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    lastScroll = y;
  }, { passive: true });
}

/* ══════════════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════════════ */
function initHamburger() {
  const btn = document.getElementById("hamburger");
  const links = document.getElementById("navLinks");

  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    // Animate hamburger → X
    const spans = btn.querySelectorAll("span");
    if (open) {
      spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
    } else {
      spans[0].style.transform = "";
      spans[1].style.opacity = "";
      spans[2].style.transform = "";
    }
  });

  // Close on nav link click
  links.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", false);
      btn.querySelectorAll("span").forEach(s => { s.style.transform = ""; s.style.opacity = ""; });
    });
  });
}

/* ══════════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver)
══════════════════════════════════════════ */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const siblings = [...entry.target.parentElement.querySelectorAll(".reveal:not(.revealed)")];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 80, 400);

          setTimeout(() => {
            entry.target.classList.add("revealed");
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  items.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════
   ANIMATED STAT COUNTERS
══════════════════════════════════════════ */
function initStatCounters() {
  const counters = document.querySelectorAll(".stat-number[data-target]");
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOut(progress) * target);
      el.textContent = value.toLocaleString();

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════
   PRICING TOGGLE (Monthly ↔ Annual)
══════════════════════════════════════════ */
function initPricingToggle() {
  const toggle = document.getElementById("billingToggle");
  const monthlyLabel = document.getElementById("monthlyLabel");
  const annualLabel = document.getElementById("annualLabel");
  const priceVals = document.querySelectorAll(".price-val");

  if (!toggle) return;

  let isAnnual = false;

  toggle.addEventListener("click", () => {
    isAnnual = !isAnnual;
    toggle.classList.toggle("active", isAnnual);
    monthlyLabel.classList.toggle("active", !isAnnual);
    annualLabel.classList.toggle("active", isAnnual);

    priceVals.forEach(el => {
      const monthly = el.dataset.monthly;
      const annual = el.dataset.annual;
      const newVal = isAnnual ? annual : monthly;

      // Animate the number flip
      el.style.transform = "translateY(-8px)";
      el.style.opacity = "0";
      el.style.transition = "opacity 0.2s, transform 0.2s";

      setTimeout(() => {
        el.textContent = isNaN(Number(newVal)) ? newVal : Number(newVal).toLocaleString();
        el.style.transform = "translateY(0)";
        el.style.opacity = "1";
      }, 200);
    });
  });
}

/* ══════════════════════════════════════════
   CTA BUTTON FEEDBACK
══════════════════════════════════════════ */
function initCTAButton() {
  const btn = document.getElementById("ctaBtn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const nameInput = document.querySelector('.cta-card input[type="text"]');
    const emailInput = document.querySelector('.cta-card input[type="email"]');

    const name = nameInput?.value.trim();
    const email = emailInput?.value.trim();

    if (!name) {
      shakeInput(nameInput);
      nameInput.focus();
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      shakeInput(emailInput);
      emailInput.focus();
      return;
    }

    // Success state
    btn.textContent = "✓ Account Created!";
    btn.style.background = "linear-gradient(135deg, #10b981, #22d3ee)";
    btn.style.pointerEvents = "none";

    // Confetti burst
    confettiBurst(btn);
  });
}

function shakeInput(el) {
  if (!el) return;
  el.style.borderColor = "#ff6b6b";
  el.style.boxShadow = "0 0 0 3px rgba(255,107,107,0.2)";
  el.style.animation = "shake 0.4s ease";
  el.addEventListener("animationend", () => {
    el.style.animation = "";
    setTimeout(() => {
      el.style.borderColor = "";
      el.style.boxShadow = "";
    }, 1000);
  }, { once: true });
}

// Add shake keyframes dynamically
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}`;
document.head.appendChild(shakeStyle);

/* ─── Lightweight confetti ─── */
function confettiBurst(anchor) {
  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const colors = ["#6C63FF", "#00D4FF", "#FFB446", "#FF6B6B", "#10b981", "#f97316"];

  for (let i = 0; i < 40; i++) {
    const dot = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4;
    const angle = (Math.random() * Math.PI * 2);
    const dist = Math.random() * 160 + 60;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 60;

    Object.assign(dot.style, {
      position: "fixed",
      left: `${cx}px`,
      top: `${cy}px`,
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      pointerEvents: "none",
      zIndex: "9999",
      transform: "translate(-50%, -50%)",
      transition: `transform 0.8s cubic-bezier(0.2,0.8,0.3,1), opacity 0.8s ease`,
    });

    document.body.appendChild(dot);

    requestAnimationFrame(() => {
      dot.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${Math.random()*720}deg) scale(0)`;
      dot.style.opacity = "0";
    });

    setTimeout(() => dot.remove(), 900);
  }
}

/* ══════════════════════════════════════════
   SMOOTH ANCHOR SCROLLING (offset for nav)
══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();

    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;

    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ══════════════════════════════════════════
   HERO DASHBOARD BAR ANIMATION ON LOAD
══════════════════════════════════════════ */
window.addEventListener("load", () => {
  // Bars animate via CSS; just ensure they're visible
  document.querySelectorAll(".bar").forEach(b => {
    b.style.opacity = ""; // Let CSS animation handle it
  });
});