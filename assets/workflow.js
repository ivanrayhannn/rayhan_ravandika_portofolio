/* Waterfall and agile swimlanes from assets/data.js, with tabs and an expand toggle. Used on tmmin.html. */
(function () {
  var D = window.PORTFOLIO;
  var $ = function (s) { return document.querySelector(s); };
  if (!D || !$("#wf-panels")) return;
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

})();
