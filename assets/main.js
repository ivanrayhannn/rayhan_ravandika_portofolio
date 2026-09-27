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
  var hrefs = { cv: D.cv, linkedin: D.linkedin, github: D.github, mailto: "mailto:" + D.email };
  document.querySelectorAll("[data-href]").forEach(function (el) {
    el.href = hrefs[el.dataset.href] || "#";
  });

  var now = new Date();
  $("#year").textContent = now.getFullYear();
  $("#rev").textContent = now.getFullYear() + "." + String(now.getMonth() + 1).padStart(2, "0");

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

  $("#steps").innerHTML = list(D.process, function (p) {
    return "<li><h3>" + esc(p.step) + "</h3><p>" + esc(p.text) + "</p></li>";
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
