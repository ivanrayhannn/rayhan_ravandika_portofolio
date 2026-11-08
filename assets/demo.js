/* State switches for the case-study demos. A button sets data-state on its screen; CSS rules or
   [data-when] attributes decide which parts show for that state. */
document.querySelectorAll(".seg button").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var screen = document.getElementById("demo-" + btn.dataset.demo);
    if (!screen) return;
    screen.dataset.state = btn.dataset.state;
    screen.querySelectorAll("[data-when]").forEach(function (el) {
      el.hidden = el.dataset.when.split(" ").indexOf(btn.dataset.state) === -1;
    });
    btn.parentElement.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", b === btn);
    });
  });
});
