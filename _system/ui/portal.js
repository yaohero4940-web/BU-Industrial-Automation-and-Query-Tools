(function () {
  const HOME = "index.html";
  const BRAND_EN = "BU Industrial Automation and Query Tools";
  const AUTHOR_URL = "https://teams.microsoft.com/l/chat/0/0?users=HMIY@novonordisk.com&message=Hello%20HMIY%2C%20%E8%AF%B7%E5%8D%8F%E5%8A%A9%E5%A4%84%E7%90%86%E5%BD%93%E5%89%8D%E9%97%AE%E9%A2%98";

  const toolTitles = {
    "refrigeration-calculator.html": ["Refrigeration engineering", "\u5236\u51b7\u5de5\u7a0b"],
    "index.html": ["Thermal engineering", "\u6696\u901a\u70ed\u5de5"],
    "steam-system-calculator.html": ["Steam systems", "\u84b8\u6c7d\u7cfb\u7edf"],
    "PPCL_Query_Tool_premium.html": ["PPCL command reference", "PPCL \u547d\u4ee4\u67e5\u8be2"],
    "\u5236\u51b7\u5242\u7269\u6027\u67e5\u8be2.html": ["Refrigerant properties", "\u5236\u51b7\u5242\u7269\u6027"],
    "\u5de5\u4e1a\u4fe1\u53f7\u8f6c\u6362.html": ["Industrial signal conversion", "\u5de5\u4e1a\u4fe1\u53f7\u8f6c\u6362"]
  };

  function scriptBase() {
    const script = document.currentScript || Array.from(document.scripts).find((item) => item.src.includes("portal.js"));
    if (!script) return "";
    return script.src.slice(0, script.src.lastIndexOf("/") + 1);
  }

  function portalRoot() {
    return scriptBase().replace(/_system\/ui\/?$/, "");
  }

  function currentTitle() {
    const name = decodeURIComponent(location.pathname.split("/").pop() || "index.html");
    const path = decodeURIComponent(location.pathname);
    if (name === "index.html" && path.includes("/modules/r0/")) return toolTitles["refrigeration-calculator.html"];
    if (name === "index.html" && path.includes("/modules/t0/")) return toolTitles["index.html"];
    if (name === "index.html" && path.includes("/modules/s0/")) return toolTitles["steam-system-calculator.html"];
    if (name === "index.html" && path.includes("/modules/p0/")) return toolTitles["PPCL_Query_Tool_premium.html"];
    if (name === "index.html" && path.includes("/modules/rp/")) return toolTitles["\u5236\u51b7\u5242\u7269\u6027\u67e5\u8be2.html"];
    if (name === "index.html" && path.includes("/modules/i0/")) return toolTitles["\u5de5\u4e1a\u4fe1\u53f7\u8f6c\u6362.html"];
    return toolTitles[name] || [document.title || "Industrial automation and query tool", "\u5de5\u4e1a\u81ea\u52a8\u5316\u4e0e\u67e5\u8be2\u5de5\u5177"];
  }

  function ensureMotion() {
    if (document.querySelector(".portal-motion-field")) return;
    const motion = document.createElement("div");
    motion.className = "portal-motion-field";
    document.body.prepend(motion);
  }

  function bindPointerField() {
    let raf = 0;
    window.addEventListener("pointermove", (event) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const x = (event.clientX / Math.max(window.innerWidth, 1)) * 100;
        const y = (event.clientY / Math.max(window.innerHeight, 1)) * 100;
        document.documentElement.style.setProperty("--portal-pointer-x", `${x}%`);
        document.documentElement.style.setProperty("--portal-pointer-y", `${y}%`);
      });
    }, { passive: true });
  }

  function themeButtonMarkup() {
    return `
      <button class="portal-theme-toggle" type="button" data-portal-theme-toggle aria-label="Toggle dark and light theme">
        <span class="portal-theme-toggle-track">
          <span class="portal-theme-toggle-thumb">
            <svg class="portal-theme-sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"></path>
            </svg>
            <svg class="portal-theme-moon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 14.4A7.7 7.7 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4z"></path>
            </svg>
          </span>
        </span>
      </button>
    `;
  }

  function ensureHomeParticles() {
    if (!document.body.classList.contains("portal-home") || document.querySelector(".portal-particle-canvas")) return;
    const canvas = document.createElement("canvas");
    canvas.className = "portal-particle-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");
    const pointer = { x: -9999, y: -9999 };
    let particles = [];
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(92, Math.max(36, Math.floor((window.innerWidth * window.innerHeight) / 14500)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        ox: Math.random() * window.innerWidth,
        oy: Math.random() * window.innerHeight,
        vx: 0,
        vy: 0,
        r: 1 + Math.random() * 1.6
      }));
    }
    function move(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }
    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = document.body.classList.contains("portal-theme-dark") ? "rgba(143,215,255,.34)" : "rgba(0,25,101,.22)";
      ctx.strokeStyle = document.body.classList.contains("portal-theme-dark") ? "rgba(143,215,255,.10)" : "rgba(0,25,101,.08)";
      particles.forEach((p, index) => {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        if (dist < 150) {
          const push = (150 - dist) / 150;
          p.vx += (dx / dist) * push * 1.25;
          p.vy += (dy / dist) * push * 1.25;
        }
        p.vx += (p.ox - p.x) * 0.006;
        p.vy += (p.oy - p.y) * 0.006;
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        for (let j = index + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const lx = p.x - q.x;
          const ly = p.y - q.y;
          const l = Math.sqrt(lx * lx + ly * ly);
          if (l < 96) {
            ctx.globalAlpha = (96 - l) / 96;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });
      window.requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.requestAnimationFrame(draw);
  }

  function makeTopbar() {
    if (document.querySelector(".portal-topbar")) return;
    const [enTitle, zhTitle] = currentTitle();
    const base = portalRoot();
    const topbar = document.createElement("nav");
    topbar.className = "portal-topbar portal-no-print";
    topbar.setAttribute("aria-label", BRAND_EN);
    topbar.innerHTML = `
      <a class="portal-logo" href="${base}${HOME}" aria-label="Open home">
        <span class="portal-logo-mark">BU</span>
        <span>
          <strong>${escapeHtml(BRAND_EN)}</strong>
          <small>${escapeHtml(enTitle)}</small>
        </span>
      </a>
      <div class="portal-actions">
        <a class="portal-action" href="${base}${HOME}"><span class="portal-action-label">Home</span></a>
        ${themeButtonMarkup()}
      </div>
    `;
    document.body.prepend(topbar);
  }

  function makeFooter() {
    if (document.querySelector(".portal-footer")) return;
    const [enTitle, zhTitle] = currentTitle();
    const footer = document.createElement("footer");
    footer.className = "portal-footer";
    footer.innerHTML = `
      <div class="portal-footer-title" data-portal-en="${escapeHtml(enTitle)}" data-portal-zh="${escapeHtml(zhTitle)}">${escapeHtml(enTitle)}</div>
      <div>&copy; 2026 ${escapeHtml(BRAND_EN)} · Created by <a href="${AUTHOR_URL}">HMIY</a></div>
    `;
    document.body.appendChild(footer);
  }

  function setPortalLanguage(lang) {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }

  function bindActions() {
    document.querySelectorAll("[data-portal-theme-toggle]").forEach((themeButton) => {
      themeButton.addEventListener("click", () => {
        const next = document.body.classList.contains("portal-theme-dark") ? "light" : "dark";
        setPortalTheme(next);
      });
    });
  }

  function setPortalTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.dataset.portalTheme = isDark ? "dark" : "light";
    document.body.classList.toggle("portal-theme-dark", isDark);
    document.body.classList.toggle("portal-theme-light", !isDark);
    localStorage.setItem("bu-tools-theme", isDark ? "dark" : "light");
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }

  function init() {
    document.body.classList.add("portal-integrated");
    ensureMotion();
    ensureHomeParticles();
    bindPointerField();
    makeTopbar();
    makeFooter();
    setPortalTheme(localStorage.getItem("bu-tools-theme") || "light");
    bindActions();
    setPortalLanguage("en");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
