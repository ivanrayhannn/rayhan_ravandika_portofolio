(function () {
  var D = window.PORTFOLIO;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var list = function (arr, fn) { return arr.map(fn).join(""); };

  document.querySelectorAll("[data-bind]").forEach(function (el) {
    el.textContent = D[el.dataset.bind] || "";
  });
  var hrefs = { cv: D.cv, linkedin: D.linkedin, github: D.github, whatsapp: D.whatsapp, mailto: "mailto:" + D.email };
  document.querySelectorAll("[data-href]").forEach(function (el) {
    el.href = hrefs[el.dataset.href] || "#";
  });

  var now = new Date();
  $("#year").textContent = now.getFullYear();
  $("#rev").textContent = now.getFullYear() + "." + String(now.getMonth() + 1).padStart(2, "0");

  $("#props").insertAdjacentHTML("beforeend", list(D.facts || [], function (f) {
    return "<tr><th>" + esc(f[0]) + "</th><td>" + esc(f[1]) + "</td></tr>";
  }));

  $("#clients").innerHTML = list(D.clients || [], function (c) {
    var mark = c.logo
      ? '<img src="' + esc(c.logo) + '" alt="' + esc(c.name) + '"' + (c.logoHeight ? ' style="height:' + Number(c.logoHeight) + 'px"' : "") + " />"
      : '<span class="client__name">' + esc(c.name) + "</span>";
    return '<li class="client' + (c.logoLight ? " client--light" : "") + '">' + mark + '<span class="client__sector mono">' + esc(c.sector) + "</span></li>";
  });

  $("#aboutText").innerHTML = list(D.about, function (p) { return "<p>" + esc(p) + "</p>"; });

  $("#req").innerHTML =
    "<thead><tr><th>ID</th><th>Capability</th><th>What you get</th></tr></thead><tbody>" +
    list(D.services, function (s, i) {
      return "<tr><td>REQ-" + String(i + 1).padStart(2, "0") + "</td><td>" + esc(s.title) + "</td><td>" + esc(s.text) + "</td></tr>";
    }) + "</tbody>";

  $("#docs").innerHTML = list(D.deliverables, function (d) {
    return '<article class="doc"><div class="doc__code">' + esc(d.code) + '</div><p class="doc__name">' + esc(d.name) +
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
      '><figcaption class="mono">' + esc(w.caption) + '</figcaption><div class="wf__scroll">' + swimlane(w) + "</div></figure>";
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

  $("#cases").innerHTML = list(D.projects, function (p) {
    return '<article class="case"><div><span class="case__tag">' + esc(p.tag) + "</span><h3>" + esc(p.title) +
      "</h3></div><p>" + esc(p.summary) + "</p><ul>" +
      list(p.deliverables, function (d) { return "<li>" + esc(d) + "</li>"; }) + "</ul></article>";
  });

  $("#domains").innerHTML = list(D.domains, function (d) {
    return "<div><dt>" + esc(d.title) + "</dt><dd>" + esc(d.text) + "</dd></div>";
  });

  $("#kit").innerHTML = list(Object.keys(D.skills), function (k) {
    return "<dt>" + esc(k) + "</dt><dd>" + list(D.skills[k], function (s) { return "<span>" + esc(s) + "</span>"; }) + "</dd>";
  });

  $("#revs").innerHTML =
    "<thead><tr><th>Period</th><th>Role</th><th>Changes</th></tr></thead><tbody>" +
    list(D.experience, function (e) {
      return "<tr><td>" + esc(e.period) + "</td><td>" + esc(e.title) + "<span>" + esc(e.company) + "</span></td><td><ul>" +
        list(e.points, function (p) { return "<li>" + esc(p) + "</li>"; }) + "</ul></td></tr>";
    }) + "</tbody>";

  $("#themeToggle").addEventListener("click", function () {
    var root = document.documentElement;
    var dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
})();
