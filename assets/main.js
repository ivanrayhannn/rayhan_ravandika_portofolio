(function () {
  var D = window.PORTFOLIO;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var ICONS = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    flow: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/><path d="M18 9V3M15 6h6"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  };
  var icon = function (n) { return '<svg viewBox="0 0 24 24">' + (ICONS[n] || ICONS.file) + "</svg>"; };

  // Simple text bindings
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    el.textContent = D[el.dataset.bind] || "";
  });
  var hrefs = { cv: D.cv, linkedin: D.linkedin, github: D.github, mailto: "mailto:" + D.email };
  document.querySelectorAll("[data-href]").forEach(function (el) {
    el.href = hrefs[el.dataset.href] || "#";
  });
  $("#year").textContent = new Date().getFullYear();

  $("#stats").innerHTML = D.stats.map(function (s) {
    return "<li><strong>" + esc(s.value) + "</strong><span>" + esc(s.label) + "</span></li>";
  }).join("");

  $("#aboutText").innerHTML = D.about.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");

  $("#services-grid").innerHTML = D.services.map(function (s) {
    return '<article class="card reveal"><div class="card__icon">' + icon(s.icon) + "</div><h3>" +
      esc(s.title) + "</h3><p>" + esc(s.text) + "</p></article>";
  }).join("");

  $("#deliverables").innerHTML = D.deliverables.map(function (d) {
    return '<article class="doc reveal"><span class="doc__code">' + esc(d.code) + "</span><h3>" + esc(d.name) +
      "</h3><ul>" + d.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></article>";
  }).join("");

  $("#process-list").innerHTML = D.process.map(function (p, i) {
    return '<li class="reveal"><span class="process__num">' + String(i + 1).padStart(2, "0") +
      "</span><h3>" + esc(p.step) + "</h3><p>" + esc(p.text) + "</p></li>";
  }).join("");

  $("#domains").innerHTML = D.domains.map(function (d) {
    return '<article class="card card--sm reveal"><h3>' + esc(d.title) + "</h3><p>" + esc(d.text) + "</p></article>";
  }).join("");

  $("#projects-grid").innerHTML = D.projects.map(function (p) {
    return '<article class="project reveal"><span class="project__tag">' + esc(p.tag) + "</span><h3>" + esc(p.title) +
      "</h3><p>" + esc(p.summary) + '</p><ul class="chips">' +
      p.deliverables.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul></article>";
  }).join("");

  $("#skills").innerHTML = Object.keys(D.skills).map(function (k) {
    return '<div class="skills__group reveal"><h3>' + esc(k) + '</h3><ul class="chips">' +
      D.skills[k].map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>";
  }).join("");

  $("#timeline").innerHTML = D.experience.map(function (e) {
    return '<li class="reveal"><span class="timeline__period">' + esc(e.period) + "</span><h3>" + esc(e.title) +
      ' <span class="muted">· ' + esc(e.company) + "</span></h3><ul>" +
      e.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></li>";
  }).join("");

  // Theme toggle
  $("#themeToggle").addEventListener("click", function () {
    var root = document.documentElement;
    var dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  // Mobile menu
  var burger = $("#burger"), links = $("#navLinks");
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { links.classList.remove("open"); burger.setAttribute("aria-expanded", false); }
  });

  // Nav shadow on scroll
  var nav = $(".nav");
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }
})();
