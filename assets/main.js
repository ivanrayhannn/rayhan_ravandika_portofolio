/* Renders assets/data.js into the page. Each section renders on its own, so one bad entry can't blank the page. */
(function () {
  var D = window.PORTFOLIO;
  var $ = function (s) { return document.querySelector(s); };
  var showAppError = function () { var el = $("#appError"); if (el) el.hidden = false; };
  if (!D) { showAppError(); return; }

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var list = function (arr, fn) { return arr.map(fn).join(""); };

  // Fills a container, or shows msg.empty when there is nothing to list.
  // A render error shows msg.error in place and leaves the other sections working.
  function section(sel, items, renderItem, msg) {
    var el = $(sel);
    if (!el) return;
    var stateTag = /^(UL|OL)$/.test(el.tagName) ? "li" : "p";
    try {
      el.innerHTML = items && items.length
        ? list(items, renderItem)
        : "<" + stateTag + ' class="state">' + esc(msg.empty) + "</" + stateTag + ">";
    } catch (err) {
      console.error("Render failed for " + sel, err);
      el.innerHTML = "<" + stateTag + ' class="state state--error" role="alert">' + esc(msg.error) + "</" + stateTag + ">";
    }
  }
  var REFRESH = " Refresh the page, or download the CV for the same details.";

  // Logo lookup by path, so case studies reuse the client entry's size and alt text.
  var logoInfo = {};
  (D.clients || []).forEach(function (c) { if (c.logo) logoInfo[c.logo] = c; });
  function logoImg(path, height) {
    var c = logoInfo[path] || { name: "", logoSize: [160, 40] };
    var size = c.logoSize || [160, 40];
    var h = height || c.logoHeight || 40;
    var w = Math.round(size[0] * h / size[1]);
    return '<img src="' + esc(path) + '" alt="' + esc(c.name) + '" width="' + w + '" height="' + h + '" style="height:' + h + 'px" data-name="' + esc(c.name) + '" />';
  }
  // A missing logo file falls back to the company name as text.
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (img.tagName !== "IMG" || !img.dataset.name) return;
    var span = document.createElement("span");
    span.className = "client__name";
    span.textContent = img.dataset.name;
    img.replaceWith(span);
  }, true);

  document.querySelectorAll("[data-bind]").forEach(function (el) {
    el.textContent = D[el.dataset.bind] || "";
  });
  var hrefs = { linkedin: D.linkedin, github: D.github, whatsapp: D.whatsapp, mailto: D.email && "mailto:" + D.email };
  document.querySelectorAll("[data-href]").forEach(function (el) {
    var url = hrefs[el.dataset.href];
    if (url) el.href = url;
    else el.hidden = true;
  });
  // Without a CV file the buttons stay visible but say so, instead of linking nowhere.
  document.querySelectorAll("[data-cv]").forEach(function (el) {
    if (D.cv) { el.href = D.cv; return; }
    el.removeAttribute("href");
    el.setAttribute("aria-disabled", "true");
    el.textContent = "CV coming soon";
  });
  $("#year").textContent = new Date().getFullYear();

  $("#heroWhere").textContent = D.heroWhere || "";
  section("#heroTags", D.heroTags, function (t) { return "<span>" + esc(t) + "</span>"; }, { empty: "", error: "" });
  section("#figures", D.stats, function (s) {
    return "<div><dt>" + esc(s.label) + "</dt><dd>" + esc(s.value) + "</dd></div>";
  }, { empty: "", error: "" });
  $("#badgePhoto").innerHTML = D.photo
    ? '<img src="' + esc(D.photo) + '" alt="Photo of ' + esc(D.fullName || D.name) + '" width="224" height="186" draggable="false" />'
    : '<span class="badge__initials" aria-hidden="true">' + esc((D.name || "").split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2)) + "</span>";

  // Drag the lanyard card and it swings back like a pendulum. Decorative, so it is pointer-only.
  (function () {
    var badge = $("#badge"), area = $(".badge-area");
    if (!badge) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { $("#badgeHint").hidden = true; return; }
    var angle = 6, vel = 0, dragging = false, pivot, raf = null;
    var render = function () { badge.style.transform = "rotate(" + angle.toFixed(2) + "deg)"; };
    var tick = function () {
      if (!dragging) {
        vel += -angle * 0.012; vel *= 0.965; angle += vel;
        if (Math.abs(angle) < 0.02 && Math.abs(vel) < 0.02) { angle = 0; vel = 0; render(); raf = null; return; }
      }
      render(); raf = requestAnimationFrame(tick);
    };
    var start = function () { if (!raf) raf = requestAnimationFrame(tick); };
    badge.addEventListener("pointerdown", function (e) {
      dragging = true; badge.classList.add("is-dragging"); badge.setPointerCapture(e.pointerId);
      var r = area.getBoundingClientRect(); pivot = { x: r.left + r.width / 2, y: r.top };
      start();
    });
    badge.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var next = Math.max(-55, Math.min(55, Math.atan2(pivot.x - e.clientX, e.clientY - pivot.y) * -180 / Math.PI));
      vel = next - angle; angle = next;
    });
    var end = function () { if (!dragging) return; dragging = false; badge.classList.remove("is-dragging"); start(); };
    badge.addEventListener("pointerup", end);
    badge.addEventListener("pointercancel", end);
    render(); start();
  })();

  section("#aboutText", D.about, function (p) { return "<p>" + esc(p) + "</p>"; },
    { empty: "The profile summary hasn't been written yet.", error: "Couldn't show the profile summary." + REFRESH });
  section("#facts", [["Based in", D.location]].concat(D.facts || []), function (f) {
    return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>";
  }, { empty: "", error: "Couldn't show these details." });

  section("#reqs", D.services, function (s, i) {
    return '<li><span class="req__id">REQ-' + String(i + 1).padStart(2, "0") + "</span><h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p></li>";
  }, { empty: "No services are listed yet. The work history below shows what I've delivered.", error: "Couldn't show the services list." + REFRESH });
  section("#docs", D.deliverables, function (d) {
    return '<li class="doc"><div class="doc__code">' + esc(d.code) + '</div><p class="doc__name">' + esc(d.name) +
      '</p><ul class="doc__items">' + list(d.items, function (i) { return "<li>" + esc(i) + "</li>"; }) + "</ul></li>";
  }, { empty: "No document types are listed yet.", error: "Couldn't show the document list." + REFRESH });

  // Swimlane SVG. Lanes are columns and phases run downward, so the long flow scrolls with the page.
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
    wf.lanes.forEach(function (name, i) {
      o.push('<rect x="' + laneX(i) + '" y="0" width="' + LW + '" height="' + H + '" class="' + (i === wf.me ? "wl-lane wl-lane--me" : "wl-lane") + '"/>');
      o.push('<text x="' + (laneX(i) + LW / 2) + '" y="' + HEAD / 2 + '" class="wl-head">' + esc(name.toUpperCase()) + "</text>");
    });
    o.push('<line x1="0" y1="' + HEAD + '" x2="' + W + '" y2="' + HEAD + '" class="wl-rule-strong"/>');
    o.push('<text x="14" y="' + HEAD / 2 + '" class="wl-head" text-anchor="start">PHASE</text>');
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
    // Edges first, so the boxes draw over their ends.
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

  // Workflow tabs: one panel per methodology, arrow keys move between tabs (ARIA tabs pattern).
  var wfs = D.workflows || [];
  var wfToggle = $("#wf-toggle"), wfPanels = $("#wf-panels");
  section("#wf-tabs", wfs, function (w, i) {
    return '<button type="button" role="tab" id="tab-' + w.id + '" aria-controls="panel-' + w.id + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(w.name) + "</button>";
  }, { empty: "", error: "" });
  section("#wf-panels", wfs, function (w, i) {
    return '<div role="tabpanel" id="panel-' + w.id + '" aria-labelledby="tab-' + w.id + '"' + (i ? " hidden" : "") +
      '><figure class="wf"><figcaption>' + esc(w.caption) + '</figcaption><div class="wf__scroll" tabindex="0" aria-label="' + esc(w.caption) + ', scrollable">' + swimlane(w) +
      '</div><p class="wf__hint">Swipe sideways to see every lane.</p></figure></div>';
  }, { empty: "The workflow diagrams aren't published yet.", error: "Couldn't draw the workflow diagram." + REFRESH });
  if (!$("#wf-panels .wf")) { wfToggle.disabled = true; wfPanels.classList.remove("is-collapsed"); }

  var tabs = function () { return Array.prototype.slice.call(document.querySelectorAll("#wf-tabs [role=tab]")); };
  function selectTab(btn) {
    tabs().forEach(function (b) {
      var on = b === btn;
      b.setAttribute("aria-selected", on);
      b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
  }
  $("#wf-tabs").addEventListener("click", function (ev) {
    var btn = ev.target.closest("[role=tab]");
    if (btn) selectTab(btn);
  });
  $("#wf-tabs").addEventListener("keydown", function (ev) {
    var all = tabs(), i = all.indexOf(document.activeElement);
    if (i < 0) return;
    var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: all.length - 1 }[ev.key];
    if (next === undefined) return;
    ev.preventDefault();
    var btn = all[(next + all.length) % all.length];
    selectTab(btn); btn.focus();
  });

  // One expand state for both tabs. Collapsing from far below scrolls back to the section title.
  wfToggle.addEventListener("click", function () {
    var open = wfPanels.classList.toggle("is-collapsed") === false;
    wfToggle.setAttribute("aria-expanded", open);
    if (!open && $("#workflow").getBoundingClientRect().top < 0) $("#workflow").scrollIntoView({ block: "start" });
  });

  section("#cases", D.projects, function (p) {
    var logos = p.logos && p.logos.length ? list(p.logos, function (l) { return logoImg(l); }) : '<span class="case__badge">' + esc(p.badge || "") + "</span>";
    return '<article class="case"><div class="case__logos">' + logos +
      '</div><div class="case__body"><p class="case__meta">' + esc(p.client) + (p.period ? " · " + esc(p.period) : "") + "</p><h3>" + esc(p.title) +
      "</h3><p>" + esc(p.summary) + '</p><ul class="chips" aria-label="Deliverables">' +
      list(p.deliverables, function (d) { return "<li>" + esc(d) + "</li>"; }) + "</ul>" +
      (p.link ? '<a class="case__link" href="' + esc(p.link) + '">' + esc(p.linkLabel || "Read the case study") + "</a>" : "") + "</div></article>";
  }, { empty: "No case studies are published yet. The work history below covers the same projects.", error: "Couldn't show the case studies." + REFRESH });

  section("#kit", Object.keys(D.skills || {}), function (k) {
    return '<details class="kit__group"><summary>' + esc(k) + '<span class="kit__count">' + D.skills[k].length + '</span></summary><div class="kit__items">' +
      list(D.skills[k], function (s) { return "<span>" + esc(s) + "</span>"; }) + "</div></details>";
  }, { empty: "No skills are listed yet.", error: "Couldn't show the skills list." + REFRESH });

  // Work history: the first SHOW points of each role, the rest behind a toggle.
  var SHOW = 4;
  section("#timeline", D.experience, function (e, n) {
    var total = e.points.length;
    return '<li class="tl-item"><div class="tl-period">' + esc(e.period) + '</div><div class="tl-card"><h3>' + esc(e.title) +
      '</h3><p class="tl-org">' + esc(e.company) + '</p><ul class="tl-points" id="tl-' + n + '">' +
      list(e.points, function (p, i) { return "<li" + (i >= SHOW ? " hidden" : "") + ">" + esc(p) + "</li>"; }) + "</ul>" +
      (total > SHOW ? '<button type="button" class="tl-more" aria-expanded="false" aria-controls="tl-' + n + '" data-total="' + total + '">Show all ' + total + " points</button>" : "") +
      "</div></li>";
  }, { empty: "Work history will be added soon.", error: "Couldn't show the work history." + REFRESH });
  $("#timeline").addEventListener("click", function (ev) {
    var b = ev.target.closest(".tl-more");
    if (!b) return;
    var open = b.getAttribute("aria-expanded") !== "true";
    document.querySelectorAll("#" + b.getAttribute("aria-controls") + " li").forEach(function (li, i) { if (i >= SHOW) li.hidden = !open; });
    b.setAttribute("aria-expanded", open);
    b.textContent = open ? "Show fewer points" : "Show all " + b.dataset.total + " points";
  });

  section("#clientsGrid", D.clients, function (c) {
    var mark = c.logo ? logoImg(c.logo) : '<span class="client__name">' + esc(c.name) + "</span>";
    return '<li class="client">' + mark + '<span class="client__sector">' + esc(c.sector) + "</span></li>";
  }, { empty: "The client list will be added soon.", error: "Couldn't show the client list." + REFRESH });

  // Copy email. Clipboard access can be refused (http, old browsers), so the fallback selects the text.
  var copyBtn = $("#copyEmail"), copyStatus = $("#copyStatus"), emailText = $("#emailText");
  function selectEmail() {
    var range = document.createRange();
    range.selectNodeContents(emailText);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  }
  copyBtn.addEventListener("click", function () {
    var done = function () { copyStatus.textContent = "Email address copied."; copyBtn.textContent = "Copied"; };
    var fail = function () { selectEmail(); copyStatus.textContent = "Couldn't copy automatically. The address is selected: press Ctrl+C (or Cmd+C) to copy it."; };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(D.email).then(done, fail);
    else fail();
    setTimeout(function () { copyBtn.textContent = "Copy"; }, 2500);
  });

  // Mobile menu: the button label says what it will do; Escape and link taps close it.
  var burger = $("#burger"), burgerLabel = $("#burgerLabel"), links = $("#navLinks");
  function setMenu(open) {
    links.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burgerLabel.textContent = open ? "Close" : "Menu";
  }
  burger.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
  links.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("open")) { setMenu(false); burger.focus(); }
  });

  // Highlight the nav link of the section in the middle of the screen.
  if ("IntersectionObserver" in window) {
    var navA = {};
    links.querySelectorAll("a").forEach(function (a) { navA[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(navA).forEach(function (k) {
          var on = k === en.target.id;
          navA[k].classList.toggle("is-active", on);
          if (on) navA[k].setAttribute("aria-current", "true"); else navA[k].removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
  }
})();
