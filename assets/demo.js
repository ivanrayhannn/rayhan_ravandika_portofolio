/* Clickable behaviour for the case-study prototypes, driven by data attributes:
   [data-demo][data-state] switch a screen's state ([data-when] parts follow), [data-done] confirms an action,
   [data-reveal] unhides a new row, [data-resolve] settles a row, [data-filter] filters rows. */
(function () {
  // One polite live region so screen-reader users hear what each click did.
  var live = document.createElement("p");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);
  var say = function (text) { live.textContent = ""; setTimeout(function () { live.textContent = text; }, 40); };

  function setState(name, state) {
    var screen = document.getElementById("demo-" + name);
    if (!screen) return;
    screen.dataset.state = state;
    screen.querySelectorAll("[data-when]").forEach(function (el) {
      el.hidden = el.dataset.when.split(" ").indexOf(state) === -1;
    });
    document.querySelectorAll('[data-demo="' + name + '"][aria-pressed]').forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.state === state);
    });
  }

  function filterRows(btn) {
    var table = document.querySelector(btn.dataset.target);
    if (!table) return;
    table.querySelectorAll("[data-type]").forEach(function (row) {
      row.hidden = btn.dataset.filter !== "all" && row.dataset.type !== btn.dataset.filter;
    });
    btn.parentElement.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn); });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn || btn.disabled || btn.closest(".mkt")) return;
    if (btn.dataset.demo && btn.dataset.state) setState(btn.dataset.demo, btn.dataset.state);
    if (btn.dataset.filter) filterRows(btn);
    if (btn.dataset.reveal) document.querySelectorAll(btn.dataset.reveal).forEach(function (el) { el.hidden = false; });
    if (btn.dataset.done) {
      btn.textContent = btn.dataset.done;
      btn.disabled = true;
      say(btn.dataset.done);
    }
    if (btn.dataset.resolve) {
      // Replace the row's buttons with the outcome; focus moves to it so keyboard users don't lose their place.
      var chip = document.createElement("span");
      chip.className = "st st--" + (btn.dataset.tone || "ok");
      chip.textContent = btn.dataset.resolve;
      chip.tabIndex = -1;
      btn.closest(".w-act").replaceWith(chip);
      chip.focus();
      say(btn.dataset.resolve);
    }
  });
})();
