/* Spin-the-wheel prototype. The marketing panel edits PRIZES; the customer wheel reads them on every spin. */
(function () {
  var START = [
    { name: "10% off", label: "10% off", weight: 20, stock: 50, fill: "#0d47c9", ink: "#ffffff" },
    { name: "Free shipping", label: "Free shipping", weight: 25, stock: 100, fill: "#7ee3f0", ink: "#16294f" },
    { name: "Rp25,000 cashback", label: "Rp25K cashback", weight: 10, stock: 30, fill: "#0a2a78", ink: "#ffffff" },
    { name: "Try again", label: "Try again", weight: 30, stock: null, fill: "#e2e9f4", ink: "#16294f" },
    { name: "Rp50,000 voucher", label: "Rp50K voucher", weight: 5, stock: 10, fill: "#1a63e3", ink: "#ffffff" },
    { name: "Double points", label: "2x points", weight: 10, stock: 60, fill: "#c3d8fb", ink: "#16294f" },
  ];
  var TRY_AGAIN = 3;
  var SLICE = 360 / START.length;

  var prizes, spinsLeft, rotation = 0, spinning = false, paused = false;
  var $ = function (id) { return document.getElementById(id); };
  var wheel = $("wheel"), spinBtn = $("spinBtn"), result = $("result"), rows = $("prizeRows");
  var weightStatus = $("weightStatus"), spinsPer = $("spinsPer");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function drawWheel() {
    var out = "";
    prizes.forEach(function (p, i) {
      var a0 = (i * SLICE - 90) * Math.PI / 180, a1 = ((i + 1) * SLICE - 90) * Math.PI / 180;
      var x0 = 150 + 146 * Math.cos(a0), y0 = 150 + 146 * Math.sin(a0);
      var x1 = 150 + 146 * Math.cos(a1), y1 = 150 + 146 * Math.sin(a1);
      out += '<path d="M150 150L' + x0.toFixed(1) + " " + y0.toFixed(1) + "A146 146 0 0 1 " + x1.toFixed(1) + " " + y1.toFixed(1) + 'Z" fill="' + p.fill + '" stroke="#fff" stroke-width="2"/>';
      var mid = i * SLICE + SLICE / 2;
      // Short label, ending near the rim so it never runs into the hub.
      out += '<text transform="rotate(' + (mid - 90) + ' 150 150)" x="284" y="150" text-anchor="end" dominant-baseline="middle" fill="' + p.ink +
        '" font-size="12" font-weight="800" font-family="Plus Jakarta Sans, Arial, sans-serif"' + (p.stock === 0 ? ' opacity="0.45"' : "") + ">" + esc(p.label) + "</text>";
    });
    out += '<circle cx="150" cy="150" r="147" fill="none" stroke="#0a2a78" stroke-width="3"/>';
    wheel.innerHTML = out;
  }

  function drawRows() {
    rows.innerHTML = prizes.map(function (p, i) {
      var stock = p.stock === null
        ? '<span class="mkt__unlimited">Unlimited</span>'
        : '<label class="sr-only" for="stock-' + i + '">Stock left for ' + esc(p.name) + '</label><input type="number" id="stock-' + i + '" data-i="' + i + '" data-field="stock" min="0" max="999" value="' + p.stock + '" inputmode="numeric" />';
      return '<tr><th scope="row"><i class="mkt__swatch" style="background:' + p.fill + '"></i>' + esc(p.name) + ' <span class="st st--late" id="oos-' + i + '"' + (p.stock === 0 ? "" : " hidden") + ">Out of stock</span></th>" +
        '<td><label class="sr-only" for="weight-' + i + '">Weight for ' + esc(p.name) + '</label><input type="number" id="weight-' + i + '" data-i="' + i + '" data-field="weight" min="0" max="100" value="' + p.weight + '" inputmode="numeric" /></td>' +
        "<td>" + stock + "</td></tr>";
    }).join("");
  }

  // Update one row in place; re-rendering the table would destroy the input the user just moved to.
  function syncRow(i) {
    var p = prizes[i], input = document.getElementById("stock-" + i), tag = document.getElementById("oos-" + i);
    if (input && document.activeElement !== input) input.value = p.stock;
    if (tag) tag.hidden = p.stock !== 0;
  }

  function totalWeight() { return prizes.reduce(function (s, p) { return s + p.weight; }, 0); }

  // The game only runs when the weights are valid; the customer sees why when it doesn't.
  function updateStatus() {
    var total = totalWeight(), ok = total === 100;
    weightStatus.className = "mkt__total " + (ok ? "is-ok" : "is-error");
    weightStatus.textContent = ok
      ? "Weights total 100%. The game is live."
      : "Weights add up to " + total + "%. They must total 100% before customers can spin.";
    if (spinning) return;
    spinBtn.disabled = !ok || spinsLeft <= 0;
    spinBtn.textContent = spinsLeft <= 0 ? "No spins left today" : "Spin the wheel";
    if (!ok) { paused = true; showMessage("The game is paused for a moment while the prizes are updated. Please check back soon.", "warn"); }
    else if (paused) { paused = false; showMessage("The game is live again. Spin when you're ready."); }
  }

  function showMessage(text, tone) {
    result.innerHTML = '<p class="m-msg' + (tone === "warn" ? " mkt__warn" : "") + '">' + esc(text) + "</p>";
  }

  // Weighted draw over prizes that still have stock; the share of empty prizes falls to "Try again".
  function draw() {
    var pool = prizes.map(function (p, i) {
      var w = p.stock === 0 ? 0 : p.weight;
      return { i: i, w: w };
    });
    var lost = prizes.reduce(function (s, p) { return s + (p.stock === 0 ? p.weight : 0); }, 0);
    pool[TRY_AGAIN].w += lost;
    var r = Math.random() * 100, acc = 0;
    for (var k = 0; k < pool.length; k++) { acc += pool[k].w; if (r < acc) return pool[k].i; }
    return TRY_AGAIN;
  }

  function code() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
    for (var i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return "SPIN-" + s;
  }

  function finish(i) {
    var p = prizes[i];
    spinning = false;
    spinsLeft -= 1;
    $("spinsLeft").textContent = spinsLeft;
    var after = spinsLeft > 0 ? "You have " + spinsLeft + " spin" + (spinsLeft === 1 ? "" : "s") + " left today." : "That was your last spin today. Come back tomorrow for another.";
    if (i === TRY_AGAIN) {
      showMessage("No prize this time. " + after);
    } else {
      p.stock -= 1;
      var c = code();
      result.innerHTML = '<div class="m-card m-card--ok"><span class="m-sub">You won</span><span class="m-big m-ok">' + esc(p.name) + "</span></div>" +
        '<div class="mkt__code"><span>Code <b id="voucher">' + c + '</b></span><button type="button" class="w-btn" id="copyCode">Copy</button></div>' +
        '<p class="m-msg">Valid for 7 days. Use it at checkout. ' + esc(after) + "</p>";
      syncRow(i);
      drawWheel();
    }
    updateStatus();
  }

  function spin() {
    if (spinning || spinsLeft <= 0 || totalWeight() !== 100) return;
    spinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = "Spinning…";
    showMessage("Spinning…");
    var i = draw();
    var center = i * SLICE + SLICE / 2;
    var jitter = (Math.random() - 0.5) * (SLICE - 14);
    var target = ((360 - center - jitter) % 360 + 360) % 360;
    rotation += 5 * 360 + ((target - (rotation % 360)) + 360) % 360;
    if (reduceMotion) {
      wheel.style.transition = "none";
      wheel.style.transform = "rotate(" + rotation + "deg)";
      finish(i);
      return;
    }
    wheel.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.21, 1)";
    wheel.style.transform = "rotate(" + rotation + "deg)";
    wheel.addEventListener("transitionend", function done() {
      wheel.removeEventListener("transitionend", done);
      finish(i);
    });
  }

  function reset() {
    prizes = START.map(function (p) { return Object.assign({}, p); });
    spinsLeft = Number(spinsPer.value) || 3;
    $("spinsLeft").textContent = spinsLeft;
    spinning = false;
    paused = false;
    drawWheel();
    drawRows();
    showMessage("Each spin wins a voucher or a free retry. Good luck.");
    updateStatus();
  }

  rows.addEventListener("input", function (e) {
    var el = e.target, i = Number(el.dataset.i), v = Math.max(0, Math.min(Number(el.max), Math.round(Number(el.value) || 0)));
    prizes[i][el.dataset.field] = v;
    if (el.dataset.field === "stock") { syncRow(i); drawWheel(); }
    updateStatus();
  });

  spinsPer.addEventListener("change", function () {
    var v = Math.max(1, Math.min(10, Math.round(Number(spinsPer.value) || 1)));
    spinsPer.value = v;
    spinsLeft = v;
    $("spinsLeft").textContent = v;
    updateStatus();
  });

  spinBtn.addEventListener("click", spin);
  $("resetBtn").addEventListener("click", function () { spinsPer.value = 3; reset(); });

  // Copy the voucher code; when the clipboard is refused, select the code so the user can copy it.
  result.addEventListener("click", function (e) {
    if (e.target.id !== "copyCode") return;
    var btn = e.target, text = $("voucher").textContent;
    var fail = function () {
      var range = document.createRange(); range.selectNodeContents($("voucher"));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      btn.textContent = "Selected, press Ctrl+C";
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { btn.textContent = "Copied"; }, fail);
    else fail();
  });

  reset();
})();
