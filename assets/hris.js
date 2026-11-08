/* State switches for the released-feature demos: each button sets data-state on its phone, CSS shows the matching screen. */
document.querySelectorAll(".seg button").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var phone = document.getElementById("demo-" + btn.dataset.demo);
    if (!phone) return;
    phone.dataset.state = btn.dataset.state;
    btn.parentElement.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", b === btn);
    });
  });
});
