(function () {
  var D = window.PORTFOLIO;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var list = function (arr, fn) { return arr.map(fn).join(""); };

  var ICONS = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    flow: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/><path d="M18 9V3M15 6h6"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  };
  var icon = function (n) { return '<svg viewBox="0 0 24 24">' + (ICONS[n] || ICONS.file) + "</svg>"; };

  // ---------- Simple bindings ----------
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    el.textContent = D[el.dataset.bind] || "";
  });
  var hrefs = { cv: D.cv, linkedin: D.linkedin, github: D.github, whatsapp: D.whatsapp, mailto: "mailto:" + D.email };
  document.querySelectorAll("[data-href]").forEach(function (el) {
    el.href = hrefs[el.dataset.href] || "#";
  });
  $("#year").textContent = new Date().getFullYear();

  // ---------- Hero ----------
  $("#heroTags").innerHTML = list(D.heroTags || [], function (t) { return "<span>" + esc(t) + "</span>"; });
  $("#stats").innerHTML = list(D.stats || [], function (s) {
    return "<li><strong>" + esc(s.value) + "</strong><span>" + esc(s.label) + "</span></li>";
  });
  $("#badgeExp").textContent = D.badgeTag || "";
  $("#badgePhoto").innerHTML = D.photo
    ? '<img src="' + esc(D.photo) + '" alt="' + esc(D.fullName || D.name) + '" draggable="false" />'
    : '<span class="badge__initials">' + esc((D.name || "").split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2)) + "</span>";

  // Lanyard card: drag to swing, it settles back like a pendulum
  (function () {
    var badge = $("#badge"), area = $(".badge-area");
    if (!badge) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var angle = reduce ? 0 : 6, vel = 0, dragging = false, pivot, raf = null;
    var render = function () { badge.style.transform = "rotate(" + angle.toFixed(2) + "deg)"; };
    var tick = function () {
      if (!dragging) {
        vel += -angle * 0.012; vel *= 0.965; angle += vel;
        if (Math.abs(angle) < 0.02 && Math.abs(vel) < 0.02) { angle = 0; vel = 0; render(); raf = null; return; }
      }
      render(); raf = requestAnimationFrame(tick);
    };
    var start = function () { if (!raf && !reduce) raf = requestAnimationFrame(tick); };
    badge.addEventListener("pointerdown", function (e) {
      dragging = true; badge.classList.add("is-dragging"); badge.setPointerCapture(e.pointerId);
      var r = area.getBoundingClientRect(); pivot = { x: r.left + r.width / 2, y: r.top };
      start();
    });
    badge.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var next = Math.atan2(pivot.x - e.clientX, e.clientY - pivot.y) * -180 / Math.PI;
      next = Math.max(-55, Math.min(55, next));
      vel = next - angle; angle = next;
    });
    var end = function () { if (!dragging) return; dragging = false; badge.classList.remove("is-dragging"); start(); };
    badge.addEventListener("pointerup", end);
    badge.addEventListener("pointercancel", end);
    render(); start();
  })();

  // ---------- About ----------
  $("#aboutText").innerHTML = list(D.about, function (p) { return "<p>" + esc(p) + "</p>"; });
  $("#facts").innerHTML = list([["Based in", D.location]].concat(D.facts || []), function (f) {
    return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>";
  });

  // ---------- Services & documents ----------
  $("#services-grid").innerHTML = list(D.services, function (s, i) {
    return '<article class="card"><div class="card__top"><div class="card__icon">' + icon(s.icon) + '</div><span class="card__id">REQ-' +
      String(i + 1).padStart(2, "0") + "</span></div><h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p></article>";
  });
  $("#docs").innerHTML = list(D.deliverables, function (d) {
    return '<article class="card doc"><div class="doc__code">' + esc(d.code) + '</div><p class="doc__name">' + esc(d.name) +
      "</p><ul>" + list(d.items, function (i) { return "<li>" + esc(i) + "</li>"; }) + "</ul></article>";
  });

  // ---------- Workflow swimlanes (vertical: lanes are columns, phases run downward) ----------
  function swimlane(wf) {
    var W = 1120, PH = 120, HEAD = 52, PITCH = 72, NH = 48, PAD = 20;
    var LW = (W - PH) / wf.lanes.length;
    var rows = 0;
    wf.nodes.forEach(function (n) { rows = Math.max(rows, n.row + 1); });
    var H = HEAD + rows * PITCH + 12;
    var laneX = function (l) { return PH + l * LW; };
    var rowY = function (r) { return HEAD + r * PITCH + PITCH / 2; };
    var byId = {};
    wf.nodes.forEach(function (n) {
      var g = { n: n, cy: rowY(n.row) };
      if (n.span) { g.l = laneX(n.span[0]) + PAD; g.r = laneX(n.span[1] + 1) - PAD; }
      else if (n.type === "task" || !n.type) { g.l = laneX(n.lane) + PAD; g.r = laneX(n.lane + 1) - PAD; }
      else { var c = laneX(n.lane) + LW / 2, h = n.type === "gw" ? 20 : 11; g.l = c - h; g.r = c + h; }
      g.cx = (g.l + g.r) / 2;
      g.half = n.span || !n.type || n.type === "task" ? NH / 2 : n.type === "gw" ? 20 : 11;
      g.t = g.cy - g.half; g.b = g.cy + g.half;
      byId[n.id] = g;
    });

    var o = [];
    o.push('<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(wf.caption) + '">');
    var head = function (x, y, dir) {
      var p = { down: [[x - 4, y - 7], [x + 4, y - 7]], left: [[x + 7, y - 4], [x + 7, y + 4]], right: [[x - 7, y - 4], [x - 7, y + 4]] }[dir];
      return '<path d="M' + x + " " + y + "L" + p[0][0] + " " + p[0][1] + "L" + p[1][0] + " " + p[1][1] + 'Z" class="wl-head-arrow"/>';
    };
    // lanes
    wf.lanes.forEach(function (name, i) {
      o.push('<rect x="' + laneX(i) + '" y="0" width="' + LW + '" height="' + H + '" class="' + (i === wf.me ? "wl-lane wl-lane--me" : "wl-lane") + '"/>');
      o.push('<text x="' + (laneX(i) + LW / 2) + '" y="' + HEAD / 2 + '" class="wl-head">' + esc(name.toUpperCase()) + "</text>");
    });
    o.push('<line x1="0" y1="' + HEAD + '" x2="' + W + '" y2="' + HEAD + '" class="wl-rule-strong"/>');
    o.push('<text x="14" y="' + HEAD / 2 + '" class="wl-head" text-anchor="start">PHASE</text>');
    // phases
    wf.phases.forEach(function (p, i) {
      var y0 = HEAD + p[1] * PITCH;
      if (i) o.push('<line x1="0" y1="' + y0 + '" x2="' + W + '" y2="' + y0 + '" class="wl-phase-rule"/>');
      o.push('<text x="14" y="' + (y0 + 24) + '" class="wl-phase-no">' + String(i + 1).padStart(2, "0") + "</text>");
      var words = p[0].split(" "), line = "", ly = y0 + 44;
      words.forEach(function (w, k) {
        var t = line ? line + " " + w : w;
        if (t.length > 13 && line) { o.push('<text x="14" y="' + ly + '" class="wl-phase">' + esc(line) + "</text>"); ly += 17; line = w; }
        else line = t;
        if (k === words.length - 1) o.push('<text x="14" y="' + ly + '" class="wl-phase">' + esc(line) + "</text>");
      });
    });
    // edges (drawn before nodes so boxes sit on top)
    wf.edges.forEach(function (e) {
      var a = byId[e[0]], b = byId[e[1]], opt = e[2] || {}, d, lx, ly, tip;
      if (opt.kind === "assoc") {
        var ltr = a.cx < b.cx;
        o.push('<path d="M' + (ltr ? a.r : a.l) + " " + a.cy + "H" + (ltr ? b.l : b.r) + '" class="wl-assoc"/>');
        return;
      }
      if (opt.kind === "loop") {
        var x = opt.x || laneX(a.n.lane + 1) - 9;
        var ty = b.n.span ? b.cy : b.cy + 12;
        d = "M" + a.r + " " + a.cy + "H" + x + "V" + ty + "H" + b.r;
        tip = head(b.r, ty, "left");
        lx = a.r + 6; ly = a.cy - 9;
      } else if (a.n.row === b.n.row) {
        var r2l = b.cx < a.cx;
        d = "M" + (r2l ? a.l : a.r) + " " + a.cy + "H" + (r2l ? b.r : b.l);
        tip = head(r2l ? b.r : b.l, b.cy, r2l ? "left" : "right");
      } else {
        var x1 = a.cx, x2 = b.cx;
        if (b.n.span && x1 > b.l + 20 && x1 < b.r - 20) x2 = x1;
        else if (b.n.span) x2 = Math.min(Math.max(x1, b.l + 30), b.r - 30);
        if (a.n.span) x1 = Math.min(Math.max(x2, a.l + 30), a.r - 30);
        if (a.n.span && !b.n.span) x2 = b.cx, x1 = Math.min(Math.max(b.cx, a.l + 30), a.r - 30);
        var mid = b.t - 12;
        d = x1 === x2 ? "M" + x1 + " " + a.b + "V" + b.t : "M" + x1 + " " + a.b + "V" + mid + "H" + x2 + "V" + b.t;
        tip = head(x2, b.t, "down");
        lx = x1 + 8; ly = a.b - 3;
      }
      o.push('<path d="' + d + '" class="wl-edge"/>' + tip);
      if (opt.label) o.push('<text x="' + lx + '" y="' + ly + '" class="wl-elabel">' + esc(opt.label) + "</text>");
    });
    // nodes
    wf.nodes.forEach(function (n) {
      var g = byId[n.id], lines = n.label.split("\n");
      if (n.type === "start" || n.type === "end") {
        o.push('<circle cx="' + g.cx + '" cy="' + g.cy + '" r="11" class="' + (n.type === "end" ? "wl-ev wl-ev--end" : "wl-ev") + '"/>');
        o.push('<text x="' + (g.cx + 20) + '" y="' + g.cy + '" class="wl-side">' + esc(n.label) + "</text>");
        return;
      }
      if (n.type === "gw") {
        o.push('<path d="M' + g.cx + " " + g.t + "L" + g.r + " " + g.cy + "L" + g.cx + " " + g.b + "L" + g.l + " " + g.cy + 'Z" class="wl-gw"/>');
        o.push('<text x="' + (g.l - 10) + '" y="' + g.cy + '" class="wl-side" text-anchor="end">' + esc(n.label) + "</text>");
        return;
      }
      var me = !n.span && n.lane === wf.me;
      o.push('<rect x="' + g.l + '" y="' + g.t + '" width="' + (g.r - g.l) + '" height="' + NH + '" rx="5" class="' + (n.span ? "wl-task wl-task--span" : me ? "wl-task wl-task--me" : "wl-task") + '"/>');
      var y0 = g.cy - (lines.length - 1) * 7.5;
      lines.forEach(function (ln, i) {
        o.push('<text x="' + g.cx + '" y="' + (y0 + i * 15) + '" class="wl-label">' + esc(ln) + "</text>");
      });
    });
    o.push("</svg>");
    return o.join("");
  }

  var wfs = D.workflows || [];
  $("#wf-tabs").innerHTML = list(wfs, function (w, i) {
    return '<button type="button" role="tab" id="tab-' + w.id + '" aria-controls="panel-' + w.id + '" aria-selected="' + (i === 0) + '">' + esc(w.name) + "</button>";
  });
  $("#wf-panels").innerHTML = list(wfs, function (w, i) {
    return '<figure class="wf" role="tabpanel" id="panel-' + w.id + '" aria-labelledby="tab-' + w.id + '"' + (i ? " hidden" : "") +
      "><figcaption>" + esc(w.caption) + '</figcaption><div class="wf__scroll">' + swimlane(w) + "</div></figure>";
  });
  $("#wf-tabs").addEventListener("click", function (ev) {
    var btn = ev.target.closest("button");
    if (!btn) return;
    document.querySelectorAll("#wf-tabs button").forEach(function (b) {
      var on = b === btn;
      b.setAttribute("aria-selected", on);
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
  });

  // Expand / collapse the workflow diagrams (state is shared by both tabs)
  var wfPanels = $("#wf-panels"), wfToggle = $("#wf-toggle");
  wfToggle.addEventListener("click", function () {
    var open = wfPanels.classList.toggle("is-collapsed") === false;
    wfToggle.setAttribute("aria-expanded", open);
    if (!open && $("#workflow").getBoundingClientRect().top < 0) $("#workflow").scrollIntoView({ block: "start" });
  });

  // ---------- Projects ----------
  var COVER = '<svg viewBox="0 0 170 170"><path d="M20 140h130M35 140v-30M60 140v-55M85 140v-40M110 140v-80M135 140v-60"/><path d="M30 60l35-25 30 15 40-35"/><circle cx="30" cy="60" r="4"/><circle cx="65" cy="35" r="4"/><circle cx="95" cy="50" r="4"/><circle cx="135" cy="15" r="4"/></svg>';
  $("#cases").innerHTML = list(D.projects, function (p) {
    return '<article class="card case"><div class="case__cover">' + COVER + '<span class="case__tag">' + esc(p.tag) + '</span></div><div class="case__body"><h3>' +
      esc(p.title) + "</h3><p>" + esc(p.summary) + '</p><ul class="chips">' +
      list(p.deliverables, function (d) { return "<li>" + esc(d) + "</li>"; }) + "</ul></div></article>";
  });
  $("#domains").innerHTML = list(D.domains, function (d) {
    return '<article class="card domain"><h3>' + esc(d.title) + "</h3><p>" + esc(d.text) + "</p></article>";
  });

  // ---------- Skills ----------
  $("#kit").innerHTML = list(Object.keys(D.skills), function (k) {
    return '<div class="card"><h3>' + esc(k) + '</h3><ul class="chips">' + list(D.skills[k], function (s) { return "<li>" + esc(s) + "</li>"; }) + "</ul></div>";
  });

  // ---------- Experience (first 4 points, rest behind "Show all") ----------
  var SHOW = 4;
  $("#timeline").innerHTML = list(D.experience, function (e, n) {
    var more = e.points.length - SHOW;
    return '<li class="tl-item"><div class="tl-period">' + esc(e.period) + '</div><div class="card tl-card"><h3>' + esc(e.title) +
      '</h3><p class="tl-org">' + esc(e.company) + '</p><ul class="tl-points" id="tl-' + n + '">' +
      list(e.points, function (p, i) { return "<li" + (i >= SHOW ? " hidden" : "") + ">" + esc(p) + "</li>"; }) + "</ul>" +
      (more > 0 ? '<button type="button" class="tl-more" aria-expanded="false" aria-controls="tl-' + n + '" data-more="' + more + '">Show all ' + e.points.length + " points ↓</button>" : "") +
      "</div></li>";
  });
  $("#timeline").addEventListener("click", function (ev) {
    var b = ev.target.closest(".tl-more");
    if (!b) return;
    var open = b.getAttribute("aria-expanded") !== "true";
    document.querySelectorAll("#" + b.getAttribute("aria-controls") + " li").forEach(function (li, i) { if (i >= SHOW) li.hidden = !open; });
    b.setAttribute("aria-expanded", open);
    b.textContent = open ? "Show less ↑" : "Show all " + (SHOW + Number(b.dataset.more)) + " points ↓";
  });

  // ---------- Clients ----------
  $("#clientsGrid").innerHTML = list(D.clients || [], function (c) {
    var mark = c.logo
      ? '<img src="' + esc(c.logo) + '" alt="' + esc(c.name) + '"' + (c.logoHeight ? ' style="height:' + Number(c.logoHeight) + 'px"' : "") + " />"
      : '<span class="client__name">' + esc(c.name) + "</span>";
    return '<li class="client">' + mark + '<span class="client__sector">' + esc(c.sector) + "</span></li>";
  });

  // ---------- Nav: mobile menu + active section ----------
  var burger = $("#burger"), links = $("#navLinks");
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { links.classList.remove("open"); burger.setAttribute("aria-expanded", false); }
  });
  if ("IntersectionObserver" in window) {
    var navA = {};
    links.querySelectorAll("a").forEach(function (a) { navA[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || !navA[en.target.id]) return;
        Object.keys(navA).forEach(function (k) { navA[k].classList.toggle("is-active", k === en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
  }
})();
