/*
 * Site editor (admin.html).
 * Opens a page of the site in a frame (page.html?cms=edit); assets/cms.js inside the frame applies the draft.
 * You select, type, add, move, resize and hide content. The draft is kept in this browser (IndexedDB),
 * and Publish commits assets/edits.js plus any uploaded images to GitHub, which redeploys the site.
 */
(function () {
  "use strict";

  var PAGES = [
    ["index.html", "Home"],
    ["tmmin.html", "TMMIN logistics case study"],
    ["hris.html", "HRIS case study"],
    ["cimb.html", "CIMB Niaga case study"],
    ["marketing.html", "Spin the wheel prototype"]
  ];
  var DEFAULT_GH = { repo: "ivanrayhannn/rayhan_ravandika_portofolio", branch: "claude/optimistic-faraday-6kxzio" };
  // Folder of this site inside the repository, from <meta name="cms-dir">: "" at the root, "keisya/" for a copy in a subfolder.
  var SITE_DIR = ((document.querySelector('meta[name="cms-dir"]') || {}).content || "").replace(/^\/+/, "");
  var DEVICES = { desktop: 1280, tablet: 820, phone: 390 };
  var COLORS = [["", "Default"], ["text", "Main text", "#16294f"], ["muted", "Soft text", "#4a5b7c"], ["blue", "Blue", "#0d47c9"], ["navy", "Navy", "#0a2a78"], ["cyan", "Cyan", "#7ee3f0"], ["white", "White", "#ffffff"]];
  var FILLS = [["", "Default"], ["none", "Transparent"], ["white", "White", "#ffffff"], ["surface", "Light grey", "#f3f6fa"], ["mist", "Mist", "#dde5f1"], ["tint", "Tint", "#e2e9f4"], ["blue", "Blue", "#0d47c9"], ["navy", "Navy", "#0a2a78"], ["cyan", "Cyan", "#7ee3f0"]];
  var WIDTHS = [["", "Auto"], ["25%", "25%"], ["33.33%", "33%"], ["50%", "50%"], ["66.67%", "66%"], ["75%", "75%"], ["100%", "100%"]];
  var VARIANTS = [["solid", "Blue"], ["line", "Outline"], ["light", "White"], ["outline", "White outline"]];
  var DEFAULT_NOTE = "Update site content from the editor";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  // JSON with sorted keys, so the same content always gives the same string.
  function canon(o) {
    if (Array.isArray(o)) return "[" + o.map(canon).join(",") + "]";
    if (o && typeof o === "object") {
      return "{" + Object.keys(o).sort().filter(function (k) { return o[k] !== undefined; })
        .map(function (k) { return JSON.stringify(k) + ":" + canon(o[k]); }).join(",") + "}";
    }
    return JSON.stringify(o === undefined ? null : o);
  }
  function emptyPage() { return { nodes: {}, added: {}, order: {} }; }
  function normalize(d) {
    d = d && typeof d === "object" ? clone(d) : {};
    var out = { version: 1, rev: typeof d.rev === "number" ? d.rev : 0, published: d.published || null, pages: {} };
    Object.keys(d.pages || {}).forEach(function (p) {
      var pg = d.pages[p] || {};
      out.pages[p] = { nodes: pg.nodes || {}, added: pg.added || {}, order: pg.order || {} };
    });
    return out;
  }
  function pruned(d) {
    var out = normalize(d);
    Object.keys(out.pages).forEach(function (p) {
      var pg = out.pages[p];
      Object.keys(pg.nodes).forEach(function (k) {
        var n = pg.nodes[k];
        if (!n || Object.keys(n).every(function (f) { return f === "was"; })) delete pg.nodes[k];
      });
      Object.keys(pg.order).forEach(function (k) { if (!pg.order[k] || !pg.order[k].length) delete pg.order[k]; });
      if (!Object.keys(pg.nodes).length && !Object.keys(pg.added).length && !Object.keys(pg.order).length) delete out.pages[p];
    });
    return out;
  }
  function pageLabel(name) { var p = PAGES.filter(function (x) { return x[0] === name; })[0]; return p ? p[1] : name; }
  function stripTags(html) { var t = document.createElement("template"); t.innerHTML = String(html || ""); return t.content.textContent; }
  function htmlToText(html) {
    var t = document.createElement("template");
    t.innerHTML = String(html || "").replace(/<br\s*\/?>/gi, "\n");
    return t.content.textContent.replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n").replace(/^\s+|\s+$/g, "");
  }
  function textToHtml(text) { return esc(String(text || "").replace(/\r/g, "")).replace(/\n/g, "<br>"); }
  function when(iso) {
    try { return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return iso || ""; }
  }

  var published = normalize(window.PORTFOLIO_EDITS);
  var S = {
    doc: normalize(published),
    uploads: {},
    baseRev: published.rev,
    baseline: canon(pruned(published).pages),
    page: "index.html",
    sel: null,
    mode: "edit",
    device: "desktop",
    zoom: "fit",
    scale: 1,
    hist: {},
    ready: false,
    storeOK: true,
    results: {},
    orig: {}
  };
  var F = {};
  function pg() { return S.doc.pages[S.page] || (S.doc.pages[S.page] = emptyPage()); }
  function selEl() { return S.sel && F.CMS ? F.CMS.el(S.sel) : null; }

  /* ---------- Draft storage (IndexedDB; the same database cms.js reads for ?cms=preview) ---------- */
  var store = (function () {
    var opening = null;
    function db() {
      if (!opening) opening = new Promise(function (resolve, reject) {
        if (!window.indexedDB) { reject(new Error("No IndexedDB")); return; }
        var r = indexedDB.open("portfolio-cms", 1);
        r.onupgradeneeded = function () { r.result.createObjectStore("kv"); };
        r.onsuccess = function () { resolve(r.result); };
        r.onerror = function () { reject(r.error); };
        r.onblocked = function () { reject(new Error("Blocked")); };
      });
      return opening;
    }
    function run(mode, fn) {
      return db().then(function (d) {
        return new Promise(function (resolve, reject) {
          var tx = d.transaction("kv", mode), req = fn(tx.objectStore("kv"));
          tx.oncomplete = function () { resolve(req && req.result); };
          tx.onerror = tx.onabort = function () { reject(tx.error || new Error("Storage failed")); };
        });
      });
    }
    return {
      get: function (k) { return run("readonly", function (s) { return s.get(k); }); },
      set: function (k, v) { return run("readwrite", function (s) { return s.put(v, k); }); }
    };
  })();

  var saveTimer = null;
  function setSave(text, err) { var el = $("#saveState"); el.textContent = text; el.classList.toggle("is-error", !!err); }
  function changed() { return canon(pruned(S.doc).pages) !== S.baseline; }
  function usedUploads() {
    var text = canon(S.doc) + Object.keys(S.hist).map(function (p) { return S.hist[p].stack.join(""); }).join("");
    var out = {};
    Object.keys(S.uploads).forEach(function (id) { if (text.indexOf("upload:" + id) > -1) out[id] = S.uploads[id]; });
    return out;
  }
  function scheduleSave() { clearTimeout(saveTimer); setSave("Saving draft…"); saveTimer = setTimeout(saveNow, 400); }
  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!S.storeOK) {
      setSave(changed() ? "Draft not saved: storage is off" : "No unpublished changes", changed());
      return Promise.resolve(false);
    }
    var rec = { doc: pruned(S.doc), uploads: usedUploads(), baseRev: S.baseRev, baseline: S.baseline, orig: S.orig, savedAt: new Date().toISOString() };
    return store.set("draft", rec).then(function () {
      setSave(changed() ? "Draft saved on this browser" : "No unpublished changes");
      return true;
    }, function (e) {
      console.error(e);
      setSave("Couldn't save the draft", true);
      toast("Couldn't save the draft on this browser. Publish or download your changes before you close the tab.");
      return false;
    });
  }

  /* ---------- Messages ---------- */
  var toastTimer = null;
  function toast(text, action, fn) {
    var t = $("#toast"), b = $("#toastAction");
    $("#toastText").textContent = text;
    b.hidden = !action;
    b.textContent = action || "";
    b.onclick = action ? function () { hideToast(); fn(); } : null;
    t.classList.toggle("has-action", !!action);
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, action ? 7000 : 4000);
  }
  function hideToast() { $("#toast").classList.remove("is-on"); }
  function notice(text, buttons, info) {
    var n = $("#notice");
    n.innerHTML = "";
    n.dataset.kind = "";
    if (!text) { n.hidden = true; applyDevice(); return; }
    n.className = "notice" + (info ? " is-info" : "");
    var p = document.createElement("p");
    p.textContent = text;
    n.appendChild(p);
    (buttons && buttons.length ? buttons : [["Dismiss", function () { notice(null); }]]).forEach(function (b) {
      var el = document.createElement("button");
      el.type = "button"; el.className = "tbtn"; el.textContent = b[0]; el.onclick = b[1];
      n.appendChild(el);
    });
    n.hidden = false;
    applyDevice();
  }
  function stage(text, isError, retry) {
    var st = $("#stageState");
    st.hidden = false;
    st.classList.toggle("is-error", !!isError);
    $("#stageText").textContent = text;
    $("#stageRetry").hidden = !retry;
  }

  /* ---------- What an element is ---------- */
  var TEXT_TAGS = /^(H[1-6]|P|LI|DT|DD|FIGCAPTION|BLOCKQUOTE|LABEL|TD|TH|SUMMARY|CAPTION|LEGEND)$/;
  var SOLO = /^(SPAN|STRONG|EM|SMALL|TIME|CODE|B|I)$/;
  var PHRASE = /^(B|STRONG|I|EM|BR|SPAN|A|SMALL|CODE|MARK|SUB|SUP|ABBR|TIME|KBD|S|U|Q|CITE|WBR)$/;
  function isText(el) {
    if (!el || el.nodeType !== 1 || el === F.doc.body) return false;
    var tag = el.tagName;
    if (!(TEXT_TAGS.test(tag) || (SOLO.test(tag) && !isText(el.parentElement)))) return false;
    if (!norm(el.textContent)) return false;
    var all = el.getElementsByTagName("*");
    for (var i = 0; i < all.length; i++) if (!PHRASE.test(all[i].tagName)) return false;
    return true;
  }
  function inText(el) {
    for (var p = el.parentElement; p && p !== F.doc.body; p = p.parentElement) if (isText(p)) return true;
    return false;
  }
  function kind(el) {
    var a = el.getAttribute("data-cms-added");
    if (a) return a;
    if (el.hasAttribute("data-cms-cell")) return "cell";
    if (el.hasAttribute("data-cms-photo")) return "photo";
    if (el.tagName === "IMG") return "image";
    if (el.tagName === "A" && !inText(el)) return "link";
    if (isText(el)) return "text";
    return "box";
  }
  function isBtn(el) { return el.tagName === "A" && /\b(btn|nav__cv|case__link)\b/.test(el.className); }
  function known(el) {
    if (!el || el.nodeType !== 1 || !F.CMS) return false;
    var k = F.CMS.key(el);
    return k !== null && F.CMS.el(k) === el;
  }
  function addedBlock(key) { return pg().added[key] || null; }
  function nameOf(el) {
    var k = kind(el), tag = el.tagName;
    if (el.hasAttribute("data-cms-added")) {
      if (k === "text") {
        var t = (addedBlock(el.id) || {}).tag;
        return t === "h2" ? "Heading" : t === "h3" ? "Subheading" : t === "label" ? "Small label" : "Text";
      }
      return { button: "Button", image: "Image", shape: "Shape", columns: "Columns" }[k] || "Block";
    }
    if (k === "cell") return "Column";
    if (k === "photo") return "ID card photo";
    if (k === "image") return /clients\//.test(el.getAttribute("src") || "") ? "Logo" : "Image";
    if (k === "link") return isBtn(el) ? "Button" : "Link";
    if (k === "text") return tag === "H1" ? "Page title" : /^H[2-6]$/.test(tag) ? "Heading" : /^(LI|DT|DD)$/.test(tag) ? "List text" : "Text";
    return {
      SECTION: "Section", ARTICLE: "Card", LI: "List item", UL: "List", OL: "List", DL: "List", ASIDE: "Panel",
      HEADER: "Top bar", FOOTER: "Footer", NAV: "Menu", FIGURE: "Figure", svg: "Diagram", TABLE: "Table",
      FORM: "Form", BUTTON: "Page control", MAIN: "Page"
    }[tag] || groupName(el);
  }
  // A group is named after its first class, so "badge__card" reads as "Badge card".
  function groupName(el) {
    var c = (el.getAttribute("class") || "").split(/\s+/).filter(function (x) { return x && !/^(is-|cms-|tone-)/.test(x); })[0];
    if (!c || c === "wrap") return "Group";
    var words = c.replace(/(__|--|[-_])/g, " ").trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
  function iconOf(el) {
    var k = kind(el);
    if (el.hasAttribute("data-cms-added")) {
      if (k === "text") { var t = (addedBlock(el.id) || {}).tag; return t === "h2" || t === "h3" ? "i-heading" : t === "label" ? "i-label" : "i-text"; }
      return { button: "i-button", image: "i-image", shape: "i-shape", columns: "i-columns" }[k] || "i-box";
    }
    return { photo: "i-photo", image: "i-image", link: isBtn(el) ? "i-button" : "i-link", text: /^H\d$/.test(el.tagName) ? "i-heading" : "i-text" }[k] || "i-box";
  }
  function snippet(el) {
    var k = kind(el), b = el.hasAttribute("data-cms-added") ? addedBlock(el.id) || {} : null;
    if (b) {
      if (k === "image") return b.alt || (b.src ? "Image" : "No image yet");
      if (k === "button") return b.label || "";
      if (k === "shape") return (FILLS.filter(function (f) { return f[0] === b.bg; })[0] || ["", ""])[1];
      if (k === "columns") return (b.cols === 3 ? 3 : 2) + " columns";
      return norm(el.textContent).slice(0, 60) || "Empty";
    }
    if (k === "image") return el.getAttribute("alt") || (el.getAttribute("src") || "").split("/").pop();
    if (k === "photo") return el.querySelector("img") ? "Photo" : "Initials";
    if (k === "box") { var h = el.querySelector("h1,h2,h3,h4"); return norm(h ? h.textContent : el.textContent).slice(0, 60); }
    return norm(el.textContent).slice(0, 60);
  }

  // The element a click lands on: the photo frame, an added block, or the innermost text, link or image.
  function pick(t) {
    if (t && t.nodeType !== 1) t = t.parentElement;
    if (!t || !t.closest || t.closest("[data-cms-ui]")) return null;
    var ph = t.closest("[data-cms-photo]");
    if (ph && known(ph)) return ph;
    for (var n = t; n && n !== F.doc.body; n = n.parentElement) {
      if (n.hasAttribute("data-cms-added")) return n;
      if (n.hasAttribute("data-cms-cell")) return n.parentElement;
      if (kind(n) !== "box" && known(n)) return n;
    }
    for (n = t; n && n !== F.doc.body; n = n.parentElement) if (known(n)) return n;
    return null;
  }

  /* ---------- Where things can move ---------- */
  var FLOW = /^(DIV|SECTION|ARTICLE|ASIDE|FIGURE|HEADER|FOOTER)$/;
  // Free blocks can go into any flow container; everything else only moves among its own siblings.
  function free(el) {
    if (!el) return true;
    if (el.hasAttribute("data-cms-added")) return true;
    if (el.closest(".nav, [data-cms-photo], [role=tablist]")) return false;
    return /^(H[1-6]|P|BLOCKQUOTE|FIGURE|IMG)$/.test(el.tagName) || (el.tagName === "A" && el.classList.contains("btn"));
  }
  function isFlow(box) {
    if (!box || box.nodeType !== 1) return false;
    if (box.hasAttribute("data-cms-cell")) return true;
    if (!FLOW.test(box.tagName) || box.hasAttribute("data-cms-added") || !known(box)) return false;
    if (box.closest(".nav, [data-cms-photo], svg, [data-cms-hidden], [role=tablist]")) return false;
    for (var c = box.firstElementChild; c; c = c.nextElementSibling) if (!c.hasAttribute("data-cms-ui") && free(c)) return true;
    return false;
  }
  function movable(el) {
    if (!el || el.hasAttribute("data-cms-cell") || /^(BODY|MAIN|HTML)$/.test(el.tagName)) return false;
    if (el.parentElement === F.doc.body) return false;
    var p = el.parentElement;
    return !!p && (p.hasAttribute("data-cms-cell") || known(p));
  }
  function visibleKids(box, skip) {
    return Array.prototype.filter.call(box.children, function (c) {
      return c !== skip && !c.hasAttribute("data-cms-ui") && c.getClientRects().length;
    });
  }
  function nextEl(el) {
    for (var n = el.nextElementSibling; n; n = n.nextElementSibling) if (!n.hasAttribute("data-cms-ui")) return n;
    return null;
  }

  // Finds the container and position under a point, plus where to draw the insertion line.
  function dropAt(x, y, el) {
    var box = null;
    if (el && !free(el)) box = el.parentElement;
    else {
      for (var n = F.doc.elementFromPoint(x, y); n && n !== F.doc.body; n = n.parentElement) {
        if (el && (n === el || el.contains(n))) continue;
        if (isFlow(n)) { box = n; break; }
      }
    }
    if (!box) return null;
    var list = visibleKids(box, el), br = box.getBoundingClientRect();
    if (!list.length) return { box: box, before: null, line: { x: br.left + 4, y: br.top + 4, w: Math.max(24, br.width - 8), h: 3 } };
    var rects = list.map(function (c) { return c.getBoundingClientRect(); });
    var row = rects.some(function (r, i) {
      if (!i) return false;
      var p = rects[i - 1];
      return Math.min(r.bottom, p.bottom) - Math.max(r.top, p.top) > Math.min(r.height, p.height) * 0.5;
    });
    var best = 0, bd = Infinity;
    rects.forEach(function (r, i) {
      var dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
      var dy = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
      var d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    });
    var r = rects[best];
    var before = row ? x < r.left + r.width / 2 : y < r.top + r.height / 2;
    var ref = before ? list[best] : list[best + 1] || null;
    var line;
    if (row) {
      line = { x: (before ? r.left - 4 : r.right + 1), y: r.top, w: 3, h: r.height, v: true };
    } else {
      var yy = before ? r.top : r.bottom, other = before ? rects[best - 1] : rects[best + 1];
      if (other) yy = before ? (other.bottom + r.top) / 2 : (r.bottom + other.top) / 2;
      line = { x: r.left, y: yy - 1.5, w: r.width, h: 3 };
    }
    return { box: box, before: ref, line: line };
  }
  function isNoop(el, t) {
    return t.box === el.parentElement && (t.before === el || t.before === nextEl(el) || (!t.before && !nextEl(el)));
  }

  /* ---------- Changes to the draft ---------- */
  // The text an element had when the page was built; cms.js skips the change if that text changes later.
  function wasOf(el) {
    F.CMS.reset();
    var f = F.CMS.fingerprint(el);
    F.CMS.apply(pg());
    return f;
  }
  function nodePatch(key, create) {
    var P = pg();
    if (P.added[key]) return P.added[key];
    var p = P.nodes[key];
    if (!p && create) {
      p = P.nodes[key] = {};
      var el = F.CMS.el(key), was = el ? wasOf(el) : null;
      if (was !== null && was !== undefined) p.was = was;
    }
    return p || null;
  }
  function setField(key, f, v, keepEmpty) {
    var p = nodePatch(key, v !== null && v !== undefined && (v !== "" || keepEmpty));
    if (!p) return;
    if (v === null || v === undefined || (v === "" && !keepEmpty)) delete p[f]; else p[f] = v;
    var P = pg();
    if (!P.added[key] && P.nodes[key] && Object.keys(P.nodes[key]).every(function (x) { return x === "was"; })) delete P.nodes[key];
  }
  function childKeys(box) {
    return Array.prototype.filter.call(box.children, function (c) { return !c.hasAttribute("data-cms-ui"); })
      .map(function (c) { return F.CMS.key(c); }).filter(function (k) { return k !== null; });
  }
  function setOrder(box, list) {
    var k = F.CMS.key(box), orig = F.CMS.originalKids(box), o = pg().order;
    if (k === null) return;
    (S.orig[S.page] || (S.orig[S.page] = {}))[k] = orig || [];
    if (orig && orig.join("|") === list.join("|")) delete o[k]; else o[k] = list;
  }
  function insertKey(key, box, before) {
    var list = childKeys(box).filter(function (x) { return x !== key; });
    var i = before ? list.indexOf(F.CMS.key(before)) : -1;
    if (i < 0) i = list.length;
    list.splice(i, 0, key);
    setOrder(box, list);
  }
  function moveTo(el, box, before) {
    var key = F.CMS.key(el), from = el.parentElement;
    if (from && from !== box) setOrder(from, childKeys(from).filter(function (x) { return x !== key; }));
    insertKey(key, box, before);
    commit();
    select(key);
  }
  // Built-in content goes back to where the page originally had it.
  function home(el) {
    var key = F.CMS.key(el), P = pg(), orig = null, parent = null;
    $$("*", F.doc.body).some(function (c) {
      var kids = F.CMS.originalKids(c);
      if (kids && kids.indexOf(key) > -1) { parent = c; orig = kids; return true; }
      return false;
    });
    return parent ? { box: parent, kids: orig } : null;
  }
  function returnHome(el) {
    var h = home(el), key = F.CMS.key(el), P = pg();
    if (!h) return;
    Object.keys(P.order).forEach(function (ck) { P.order[ck] = P.order[ck].filter(function (k) { return k !== key; }); });
    var hk = F.CMS.key(h.box);
    if (P.order[hk]) {
      var list = P.order[hk], idx = h.kids.indexOf(key), at = list.length;
      for (var i = idx + 1; i < h.kids.length; i++) { var j = list.indexOf(h.kids[i]); if (j > -1) { at = j; break; } }
      list.splice(at, 0, key);
      if (list.join("|") === h.kids.join("|")) delete P.order[hk];
    }
    Object.keys(P.order).forEach(function (ck) { if (!P.order[ck].length) delete P.order[ck]; });
  }
  function deleteAdded(id) {
    var P = pg(), b = P.added[id];
    if (!b) return;
    if (b.type === "columns") {
      for (var i = 0; i < 3; i++) {
        var cid = id + "-c" + i;
        (P.order[cid] || []).slice().forEach(function (k) {
          if (P.added[k]) deleteAdded(k);
          else { var el = F.CMS.el(k); if (el) returnHome(el); }
        });
        delete P.order[cid];
      }
    }
    delete P.added[id];
    Object.keys(P.order).forEach(function (ck) { P.order[ck] = P.order[ck].filter(function (k) { return k !== id; }); });
  }
  function newId() {
    var id;
    do { id = "cms-" + Math.random().toString(36).slice(2, 8); } while (pg().added[id] || (F.doc && F.doc.getElementById(id)));
    return id;
  }

  /* ---------- History, render ---------- */
  function commit() {
    if (!S.ready) return;
    var h = S.hist[S.page], s = canon(pg());
    if (h.stack[h.i] !== s) {
      h.stack = h.stack.slice(0, h.i + 1);
      h.stack.push(s);
      if (h.stack.length > 200) h.stack.shift();
      h.i = h.stack.length - 1;
      scheduleSave();
    }
    render();
  }
  function render() {
    if (!S.ready) return;
    F.CMS.uploads = S.uploads;
    F.CMS.reset();
    var res = F.CMS.apply(pg());
    S.results[S.page] = res;
    if (S.sel && !F.CMS.el(S.sel)) { S.sel = null; renderProps(); }
    staleNotice(res);
    renderLayersSoon();
    updateBar();
  }
  function undo() {
    endEdit();
    hideToast();
    var h = S.hist[S.page];
    if (!h || h.i <= 0) return;
    h.i--;
    S.doc.pages[S.page] = JSON.parse(h.stack[h.i]);
    render(); renderProps(); scheduleSave();
  }
  function redo() {
    endEdit();
    hideToast();
    var h = S.hist[S.page];
    if (!h || h.i >= h.stack.length - 1) return;
    h.i++;
    S.doc.pages[S.page] = JSON.parse(h.stack[h.i]);
    render(); renderProps(); scheduleSave();
  }
  var staleSig = "";
  function staleNotice(res) {
    var bad = res.stale.concat(res.missing), sig = S.page + bad.join("|");
    if (sig === staleSig) return;
    staleSig = sig;
    if (!bad.length) { if ($("#notice").dataset.kind === "stale") notice(null); return; }
    notice(bad.length + (bad.length === 1 ? " change on this page is" : " changes on this page are") +
      " switched off because the content they were made on has changed since.", [
      ["Apply them anyway", function () {
        F.CMS.reset();
        res.stale.forEach(function (k) { var el = F.CMS.el(k), n = pg().nodes[k]; if (el && n) n.was = F.CMS.fingerprint(el); });
        staleSig = ""; notice(null); commit();
      }],
      ["Remove them", function () {
        var P = pg();
        bad.forEach(function (k) {
          delete P.nodes[k]; delete P.order[k];
          Object.keys(P.order).forEach(function (ck) { P.order[ck] = P.order[ck].filter(function (x) { return x !== k; }); });
        });
        staleSig = ""; notice(null); commit();
      }]
    ]);
    $("#notice").dataset.kind = "stale";
  }
  function delta() {
    var base = {}, cur = pruned(S.doc).pages, out = { total: 0, pages: {} };
    try { base = JSON.parse(S.baseline || "{}"); } catch (e) { base = {}; }
    var names = Object.keys(cur).concat(Object.keys(base)).filter(function (v, i, a) { return a.indexOf(v) === i; });
    names.forEach(function (name) {
      var a = base[name] || emptyPage(), b = cur[name] || emptyPage(), c = { edited: 0, hidden: 0, added: 0, removed: 0, moved: 0 }, shuffled = false;
      var builtIn = function (list) { return (list || []).filter(function (x) { return x.indexOf("cms-") !== 0; }); };
      ["nodes", "added", "order"].forEach(function (sec) {
        var A = a[sec] || {}, B = b[sec] || {};
        Object.keys(A).concat(Object.keys(B)).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).forEach(function (k) {
          if (canon(A[k]) === canon(B[k])) return;
          if (sec === "order") {
            // Slotting an added block into a container isn't a rearrangement; moving built-in content is.
            var was = A[k] || (S.orig[name] && S.orig[name][k]);
            if (k.indexOf("cms-") === 0 || (was && canon(builtIn(was)) === canon(builtIn(B[k] || was)))) shuffled = true;
            else c.moved++;
          }
          else if (sec === "added") c[!A[k] ? "added" : !B[k] ? "removed" : "edited"]++;
          else if (B[k] && B[k].hidden && !(A[k] && A[k].hidden)) c.hidden++;
          else c.edited++;
        });
      });
      var n = c.edited + c.hidden + c.added + c.removed + c.moved;
      if (!n && shuffled) { c.moved = 1; n = 1; }
      if (n) { out.pages[name] = c; out.total += n; }
    });
    return out;
  }
  function updateBar() {
    var h = S.hist[S.page];
    $("#undoBtn").disabled = !h || h.i <= 0;
    $("#redoBtn").disabled = !h || h.i >= h.stack.length - 1;
    var d = delta(), btn = $("#publishBtn"), cnt = $("#publishCount");
    btn.disabled = !d.total;
    cnt.hidden = !d.total;
    cnt.textContent = d.total;
    btn.title = d.total ? d.total + " unpublished change" + (d.total === 1 ? "" : "s") : "Nothing new to publish";
  }

  /* ---------- Frame ---------- */
  var frame = $("#frame"), loadTimer = null;
  function loadPage(name) {
    endEdit();
    S.ready = false; S.sel = null; F = {};
    staleSig = "";
    if ($("#notice").dataset.kind === "stale") notice(null);
    stage("Loading the page…");
    renderProps();
    $("#layers").innerHTML = '<p class="hint">Loading layers…</p>';
    clearTimeout(loadTimer);
    loadTimer = setTimeout(function () {
      if (!S.ready) stage("The page is taking too long to load. Check your connection, then try again.", true, true);
    }, 20000);
    var go = function () { if (S.page === name) frame.src = name + "?cms=edit"; };
    // Revalidate the page and its scripts first, so the canvas shows what the website serves now.
    siteSignature(name).then(function (sig) { siteSig = sig; staleSite = false; go(); }, go);
    try { history.replaceState(null, "", "#" + name); } catch (e) { /* not important */ }
  }

  /* ---------- Site updates (code pushed while you edit) ---------- */
  var siteSig = null, staleSite = false, checking = false;
  function textHash(t) {
    var h = 2166136261;
    for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(16) + ":" + t.length;
  }
  // Fingerprint of a page plus its local scripts and styles. edits.js is left out: publishing from here changes it.
  function siteSignature(name) {
    var get = function (u) { return fetch(u, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }); };
    return get(name).then(function (html) {
      var urls = [], re = /(?:src|href)="(assets\/[^"?#]+\.(?:js|css))"/g, m;
      while ((m = re.exec(html))) if (!/edits\.js$/.test(m[1]) && urls.indexOf(m[1]) < 0) urls.push(m[1]);
      return Promise.all(urls.map(get)).then(function (texts) { return textHash(html + "\u0000" + texts.join("\u0000")); });
    });
  }
  function checkSite() {
    if (checking || staleSite || !S.ready || !siteSig || document.hidden) return;
    checking = true;
    var page = S.page;
    siteSignature(page).then(function (sig) {
      checking = false;
      if (page !== S.page || sig === siteSig || staleSite) return;
      staleSite = true;
      notice("The site was updated since this page loaded. Refresh to see the latest version; your draft stays.", [["Refresh now", refreshSite], ["Later", function () { notice(null); }]], true);
      $("#notice").dataset.kind = "update";
    }, function () { checking = false; });
  }
  function refreshSite() {
    endEdit();
    if ($("#notice").dataset.kind === "update") notice(null);
    saveNow();
    toast("Loading the latest version of the page…");
    loadPage(S.page);
  }
  $("#refreshBtn").addEventListener("click", refreshSite);
  window.addEventListener("focus", checkSite);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) checkSite(); });
  setInterval(checkSite, 60000);
  frame.addEventListener("load", function () {
    if (!frame.getAttribute("src")) return;
    var w = null, d = null, search = "";
    try { w = frame.contentWindow; d = frame.contentDocument; search = w.location.search; } catch (e) { d = null; }
    clearTimeout(loadTimer);
    if (!d || !w) {
      stage("The editor can't open the page from here. Open admin.html from the website address or a local web server, not as a file on your computer.", true);
      return;
    }
    if (!/[?&]cms=edit/.test(search)) { loadPage(S.page); return; }
    if (!w.CMS) { stage("This page didn't load the editor script (assets/cms.js), so it can't be edited.", true, true); return; }
    initFrame(w, d);
  });
  $("#stageRetry").addEventListener("click", function () { loadPage(S.page); });

  function initFrame(w, d) {
    F = { win: w, doc: d, CMS: w.CMS };
    F.CMS.uploads = S.uploads;
    var css = d.createElement("link");
    css.rel = "stylesheet"; css.href = "assets/cms-canvas.css"; css.setAttribute("data-cms-ui", "");
    d.head.appendChild(css);
    F.ui = overlay(d);
    bindFrame(d, w);
    if (!S.hist[S.page]) S.hist[S.page] = { stack: [canon(pg())], i: 0 };
    S.ready = true;
    setMode(S.mode);
    render();
    $("#stageState").hidden = true;
    applyDevice();
    renderProps();
    renderLayers();
    if (pendingSelect) { var k = pendingSelect; pendingSelect = null; if (F.CMS.el(k)) select(k, { scroll: true }); }
  }

  function overlay(d) {
    var ui = d.createElement("div");
    ui.id = "cms-ui";
    ui.setAttribute("data-cms-ui", "");
    ui.setAttribute("aria-hidden", "true");
    var hs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"].map(function (h) {
      return '<span class="cms-h cms-h--' + h + '" data-h="' + h + '"></span>';
    }).join("");
    ui.innerHTML = '<div class="cms-zone"></div><div class="cms-hover"><span class="cms-tag"></span></div>' +
      '<div class="cms-sel"><span class="cms-tag"></span>' + hs + '</div><div class="cms-drop"></div>';
    d.body.appendChild(ui);
    return { root: ui, zone: ui.children[0], hover: ui.children[1], sel: ui.children[2], drop: ui.children[3] };
  }

  var hoverEl = null, drag = null, resize = null, editing = null, press = null, suppressClick = false;
  function handlesFor(el) {
    if (/^(BODY|MAIN|SECTION|HEADER|FOOTER|HTML)$/.test(el.tagName) || el.hasAttribute("data-cms-cell")) return "none";
    var k = kind(el);
    return k === "image" || k === "photo" || k === "shape" ? "xy" : "x";
  }
  function sizeTarget(el) { return el.getAttribute("data-cms-added") === "button" ? el.querySelector("a") || el : el; }
  function place(box, el, label, handles) {
    if (!el || !el.isConnected || !el.getClientRects().length) { if (box.style.display !== "none") box.style.display = "none"; return; }
    var r = el.getBoundingClientRect();
    box.style.display = "block";
    box.style.transform = "translate(" + r.left + "px," + r.top + "px)";
    box.style.width = r.width + "px";
    box.style.height = r.height + "px";
    box.classList.toggle("is-low", r.top < 26);
    var t = box.querySelector(".cms-tag"), text = typeof label === "function" ? label(r) : label;
    if (t.textContent !== text) t.textContent = text;
    if (handles !== undefined && box.getAttribute("data-handles") !== handles) box.setAttribute("data-handles", handles);
  }
  function draw() {
    if (S.ready && F.ui && F.ui.root.isConnected) {
      var edit = S.mode === "edit", el = selEl();
      var target = el ? sizeTarget(el) : null;
      place(F.ui.sel, edit ? target : null, function (r) {
        if (resize && resize.snap) return nameOf(el) + " · width " + resize.snapLabel;
        return nameOf(el) + " · " + Math.round(r.width) + " × " + Math.round(r.height);
      }, el && !editing ? handlesFor(el) : "none");
      place(F.ui.hover, edit && !drag && !resize && hoverEl && hoverEl !== el ? hoverEl : null, hoverEl ? nameOf(hoverEl) : "");
    }
    requestAnimationFrame(draw);
  }
  function showDrop(t) {
    if (!F.ui) return;
    var d = F.ui.drop, z = F.ui.zone;
    if (!t) { d.style.display = "none"; z.style.display = "none"; return; }
    var L = t.line, br = t.box.getBoundingClientRect();
    d.className = "cms-drop " + (L.v ? "is-v" : "is-h");
    d.style.display = "block";
    d.style.transform = "translate(" + L.x + "px," + L.y + "px)";
    d.style.width = L.w + "px";
    d.style.height = L.h + "px";
    z.style.display = "block";
    z.style.transform = "translate(" + br.left + "px," + br.top + "px)";
    z.style.width = br.width + "px";
    z.style.height = br.height + "px";
  }
  function autoscroll(y) {
    var H = F.win.innerHeight, edge = 60, v = 0;
    if (y < edge) v = -Math.ceil((edge - y) / 3);
    else if (y > H - edge) v = Math.ceil((y - (H - edge)) / 3);
    if (v) F.win.scrollBy(0, v);
  }

  function bindFrame(d, w) {
    d.addEventListener("pointerdown", onDown, true);
    d.addEventListener("pointermove", onMove, true);
    d.addEventListener("pointerup", onUp, true);
    d.addEventListener("pointercancel", cancelGesture, true);
    d.addEventListener("lostpointercapture", function () { setTimeout(function () { if (drag && !drag.fromPanel) cancelGesture(); }, 0); }, true);
    d.addEventListener("click", onClick, true);
    d.addEventListener("auxclick", function (e) { if (S.mode === "edit") e.preventDefault(); }, true);
    d.addEventListener("dblclick", function (e) {
      if (S.mode !== "edit") return;
      e.preventDefault(); e.stopPropagation();
      var el = selEl();
      if (el && canType(el) && !editing) startEdit(el, e);
    }, true);
    d.addEventListener("dragstart", function (e) { if (S.mode === "edit" && !editing) e.preventDefault(); }, true);
    d.addEventListener("submit", function (e) { e.preventDefault(); }, true);
    d.addEventListener("keydown", function (e) { onKey(e, true); }, true);
    d.addEventListener("paste", onPaste, true);
    d.addEventListener("focusin", function (e) {
      if (S.mode !== "edit" || editing || !e.target || e.target === d.body) return;
      if (e.target.closest && e.target.closest("[data-cms-ui]")) return;
      var el = pick(e.target);
      if (el && F.CMS.key(el) !== S.sel) select(F.CMS.key(el));
    }, true);
    d.documentElement.addEventListener("mouseleave", function () { hoverEl = null; });
    d.addEventListener("dragover", function (e) {
      if (!hasFiles(e) || S.mode !== "edit") return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      showDrop(dropAt(e.clientX, e.clientY, null));
    }, true);
    d.addEventListener("dragleave", function (e) { if (!e.relatedTarget) showDrop(null); }, true);
    d.addEventListener("drop", function (e) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      showDrop(null);
      if (S.mode !== "edit") { toast("Switch to Edit to add images."); return; }
      var t = dropAt(e.clientX, e.clientY, null);
      if (!t) { toast("Drop the image inside a section of the page."); return; }
      addBlock("image", t, e.dataTransfer.files[0]);
    }, true);
  }
  function hasFiles(e) { return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") > -1; }

  function onDown(e) {
    if (S.mode !== "edit" || !S.ready || e.button !== 0) return;
    var h = e.target.closest && e.target.closest("[data-h]");
    if (h && F.ui.root.contains(h)) { startResize(e, h.getAttribute("data-h")); return; }
    if (editing && editing.target.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    if (editing) endEdit();
    try { F.win.focus(); } catch (x) { /* focus is best effort */ }
    var el = pick(e.target);
    if (!el) { select(null); return; }
    var key = F.CMS.key(el);
    if (key !== S.sel) select(key);
    press = { x: e.clientX, y: e.clientY, el: el, key: key, id: e.pointerId };
  }
  function onMove(e) {
    if (S.mode !== "edit" || !S.ready) return;
    if (resize) { doResize(e); return; }
    if (press && !drag && !editing && Math.abs(e.clientX - press.x) + Math.abs(e.clientY - press.y) > 6) {
      if (movable(press.el)) startDrag(e);
      else { toast("This part of the page stays in place. Select a block inside it to move that instead."); press = null; }
    }
    if (drag) { e.preventDefault(); drag.x = e.clientX; drag.y = e.clientY; return; }
    hoverEl = editing ? null : pick(e.target);
    var grab = hoverEl && hoverEl === selEl() && movable(hoverEl);
    if (grab) F.doc.documentElement.setAttribute("data-cms-hover", "grab");
    else F.doc.documentElement.removeAttribute("data-cms-hover");
  }
  function onUp() {
    if (resize) { endResize(); return; }
    if (drag && !drag.fromPanel) {
      var d = drag;
      stopDrag();
      if (d.target) moveTo(d.el, d.target.box, d.target.before);
    }
    press = null;
  }
  function cancelGesture() {
    if (resize) { resize = null; render(); }
    if (drag && !drag.fromPanel) stopDrag();
    press = null;
  }
  function startDrag(e) {
    drag = { el: press.el, key: press.key, x: e.clientX, y: e.clientY, target: null };
    press.el.classList.add("cms-dragged");
    F.doc.documentElement.classList.add("is-dragging");
    hoverEl = null;
    try { F.doc.documentElement.setPointerCapture(e.pointerId); } catch (x) { /* capture is best effort */ }
    (function loop() {
      if (!drag || drag.fromPanel) return;
      autoscroll(drag.y);
      var t = dropAt(drag.x, drag.y, drag.el);
      drag.target = t && !isNoop(drag.el, t) ? t : null;
      showDrop(drag.target);
      requestAnimationFrame(loop);
    })();
  }
  function stopDrag() {
    if (drag && drag.el) drag.el.classList.remove("cms-dragged");
    if (F.doc) F.doc.documentElement.classList.remove("is-dragging");
    showDrop(null);
    drag = null;
  }
  function onClick(e) {
    if (S.mode === "interact") {
      var a = e.target.closest && e.target.closest("a[href]");
      if (a && !/^#/.test(a.getAttribute("href"))) {
        e.preventDefault();
        toast("Links to other pages don't open inside the editor. Use the page menu at the top.");
      }
      return;
    }
    if (editing && editing.target.contains(e.target)) { e.preventDefault(); return; }
    e.preventDefault();
    e.stopPropagation();
  }

  /* ---------- Resize ---------- */
  function startResize(e, h) {
    e.preventDefault();
    e.stopPropagation();
    var el = selEl();
    if (!el) return;
    var t = sizeTarget(el), r = t.getBoundingClientRect(), par = t.parentElement, cs = F.win.getComputedStyle(par);
    var key = S.sel, b = addedBlock(key) || pg().nodes[key] || {};
    resize = {
      h: h, el: el, t: t, key: key, x: e.clientX, y: e.clientY, w: r.width, hh: r.height, ratio: r.width / Math.max(1, r.height),
      parentW: par.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
      keep: (kind(el) === "image" || kind(el) === "photo") && h.length === 2,
      f: b.align === "center" ? 2 : 1, changedW: false, changedH: false
    };
    try { e.target.setPointerCapture(e.pointerId); } catch (x) { /* capture is best effort */ }
  }
  function doResize(e) {
    var R = resize, dx = e.clientX - R.x, dy = e.clientY - R.y, w = R.w, h = R.hh;
    if (/e/.test(R.h)) w = R.w + dx * R.f;
    if (/w/.test(R.h)) w = R.w - dx * R.f;
    if (/s/.test(R.h)) h = R.hh + dy;
    if (/n/.test(R.h)) h = R.hh - dy;
    if (R.keep && !e.shiftKey) h = w / R.ratio;
    w = Math.max(24, Math.min(w, R.parentW || w));
    h = Math.max(16, h);
    R.snap = null;
    [25, 33.33, 50, 66.67, 75, 100].some(function (pct) {
      var target = R.parentW * pct / 100;
      if (Math.abs(w - target) < 6) { w = target; R.snap = pct; R.snapLabel = Math.round(pct) + "%"; return true; }
      return false;
    });
    R.nw = w; R.nh = h;
    R.changedW = /[ew]/.test(R.h) || R.keep;
    R.changedH = /[ns]/.test(R.h) || R.keep;
    if (R.changedW) { R.t.style.setProperty("width", w + "px"); R.t.style.setProperty("max-width", "100%"); }
    if (R.changedH) R.t.style.setProperty("height", h + "px");
  }
  function endResize() {
    var R = resize;
    resize = null;
    if (!R.nw) { render(); return; }
    if (R.changedW) setFieldAny(R.key, "w", R.snap ? (R.snap === 100 ? "100%" : R.snap + "%") : Math.round(R.nw) + "px");
    if (R.changedH) setFieldAny(R.key, "h", Math.round(R.nh));
    commit();
    renderProps();
  }

  /* ---------- Typing on the page ---------- */
  function canType(el) { if (!el) return false; var k = kind(el); return k === "text" || k === "link" || k === "button"; }
  function startEdit(el, ev) {
    if (!el || !canType(el) || S.mode !== "edit" || !el.getClientRects().length) return;
    var key = F.CMS.key(el), k = kind(el), isA = !!addedBlock(key);
    var target = k === "button" ? el.querySelector("a") : el;
    if (!target) return;
    endEdit();
    if (!isA) F.CMS.remember(target);
    var multi = k === "text" && (isA ? (addedBlock(key).tag || "p") === "p" : /^(P|BLOCKQUOTE|DD|TD|FIGCAPTION|LI)$/.test(el.tagName));
    editing = { key: key, el: el, target: target, kind: k, isA: isA, multi: multi, start: target.innerHTML, startText: norm(target.textContent) };
    target.setAttribute("contenteditable", k === "text" ? "true" : "plaintext-only");
    if (k !== "text" && target.contentEditable !== "plaintext-only") target.setAttribute("contenteditable", "true");
    target.addEventListener("blur", onEditBlur);
    F.ui.root.classList.add("is-editing");
    target.focus({ preventScroll: true });
    var sel = F.win.getSelection(), r = null;
    if (ev && F.doc.caretRangeFromPoint) r = F.doc.caretRangeFromPoint(ev.clientX, ev.clientY);
    if (!r || !target.contains(r.startContainer)) { r = F.doc.createRange(); r.selectNodeContents(target); }
    sel.removeAllRanges();
    sel.addRange(r);
    renderProps();
  }
  function onEditBlur() { setTimeout(function () { if (editing && F.doc.activeElement !== editing.target) endEdit(); }, 0); }
  function endEdit() {
    if (!editing) return;
    var ed = editing, t = ed.target, P = pg();
    editing = null;
    t.removeEventListener("blur", onEditBlur);
    t.removeAttribute("contenteditable");
    if (F.ui) F.ui.root.classList.remove("is-editing");
    try { F.win.getSelection().removeAllRanges(); } catch (x) { /* nothing selected */ }
    if (ed.kind === "text") {
      var html = F.CMS.clean(t.innerHTML);
      if (html === F.CMS.clean(ed.start)) { render(); renderProps(); return; }
      if (ed.isA) P.added[ed.key].html = html;
      else if (!norm(stripTags(html))) { render(); toast("Text can't be left empty. To remove it, press Delete to hide it."); renderProps(); return; }
      else setField(ed.key, "html", html === F.CMS.clean(F.CMS.original(t)) ? null : html);
    } else {
      var text = norm(t.textContent);
      if (text === ed.startText) { render(); renderProps(); return; }
      if (!text) { render(); toast("A button needs a label, so the previous one is back."); renderProps(); return; }
      if (ed.isA) P.added[ed.key].label = text;
      else {
        var orig = document.createElement("div");
        orig.innerHTML = F.CMS.original(t);
        setField(ed.key, "html", text === norm(orig.textContent) ? null : esc(text));
      }
    }
    commit();
    renderProps();
  }
  function onPaste(e) {
    if (!editing || !editing.target.contains(e.target)) return;
    e.preventDefault();
    var text = (e.clipboardData && e.clipboardData.getData("text/plain")) || "";
    if (!editing.multi) text = text.replace(/\s*\n\s*/g, " ");
    F.doc.execCommand("insertText", false, text);
  }

  /* ---------- Keyboard ---------- */
  function onKey(e, inFrame) {
    if (document.querySelector("dialog[open]")) return;
    var mod = e.ctrlKey || e.metaKey, k = (e.key || "").toLowerCase();
    if (editing) {
      if (!inFrame) return;
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); endEdit(); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        var lineBreak = editing.kind === "text" && (editing.multi ? !mod : e.shiftKey);
        if (lineBreak) F.doc.execCommand("insertLineBreak");
        else endEdit();
        return;
      }
      if (mod && (k === "b" || k === "i" || k === "u") && editing.kind !== "text") e.preventDefault();
      e.stopPropagation();
      return;
    }
    var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ""));
    if (mod && k === "z" && !typing) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
    if (mod && k === "y" && !typing) { e.preventDefault(); redo(); return; }
    if (mod && k === "s") { e.preventDefault(); saveNow().then(function (ok) { if (ok) toast("Draft saved on this browser."); }); return; }
    if (typing || S.mode !== "edit" || !S.sel || !S.ready) return;
    if (!inFrame && (e.key === "Delete" || e.key === "Backspace") && document.activeElement && document.activeElement.closest(".bar")) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); removeSel(); }
    else if (e.key === "Escape") { e.preventDefault(); selectParent(); }
    else if (e.key === "Enter" && inFrame && canType(selEl())) { e.preventDefault(); startEdit(selEl()); }
    else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); nudge(e.key === "ArrowUp" ? -1 : 1); }
    else if (mod && k === "d") { e.preventDefault(); duplicate(); }
  }
  document.addEventListener("keydown", function (e) { onKey(e, false); });

  /* ---------- Actions on the selection ---------- */
  function select(key, opt) {
    if (editing && editing.key !== key) endEdit();
    S.sel = key || null;
    renderProps();
    markLayer();
    if (opt && opt.scroll) {
      var el = selEl();
      if (el && el.getClientRects().length) {
        var r = el.getBoundingClientRect();
        if (r.top < 70 || r.bottom > F.win.innerHeight - 20) F.win.scrollBy(0, r.top - F.win.innerHeight / 2 + Math.min(r.height, F.win.innerHeight * 0.6) / 2);
      }
    }
  }
  function selectParent() {
    var el = selEl();
    if (!el) return;
    for (var n = el.parentElement; n && n !== F.doc.body; n = n.parentElement) {
      if (n.hasAttribute("data-cms-cell")) continue;
      if (n.hasAttribute("data-cms-added") || known(n)) { select(F.CMS.key(n)); return; }
    }
    select(null);
  }
  function setFieldAny(key, f, v, keepEmpty) {
    var b = addedBlock(key);
    if (b) { if (v === null || v === undefined || (v === "" && !keepEmpty)) delete b[f]; else b[f] = v; }
    else setField(key, f, v, keepEmpty);
  }
  function removeSel() {
    var el = selEl();
    if (!el) return;
    var key = S.sel, name = nameOf(el);
    if (addedBlock(key)) {
      deleteAdded(key);
      commit();
      select(null);
      toast(name + " deleted.", "Undo", undo);
      return;
    }
    if (/^(BODY|MAIN|HTML)$/.test(el.tagName)) return;
    if (el.hasAttribute("data-cms-hidden")) return;
    setField(key, "hidden", true);
    commit();
    renderProps();
    toast(name + " hidden. Show it again from Layers.", "Undo", undo);
  }
  function nudge(dir) {
    var el = selEl();
    if (!el || !movable(el)) { toast("This part of the page stays in place."); return; }
    var sibs = visibleKids(el.parentElement), i = sibs.indexOf(el), j = i + dir;
    if (i < 0 || j < 0 || j >= sibs.length) { toast(dir < 0 ? "It's already first in its group." : "It's already last in its group."); return; }
    moveTo(el, el.parentElement, dir < 0 ? sibs[j] : nextEl(sibs[j]));
  }
  function asBlock(el) {
    var k = kind(el);
    if (k === "text") return { type: "text", tag: /^H[12]$/.test(el.tagName) ? "h2" : /^H\d$/.test(el.tagName) ? "h3" : "p", html: F.CMS.clean(el.innerHTML) };
    if (k === "link" && el.classList.contains("btn")) {
      var v = VARIANTS.map(function (x) { return x[0]; }).filter(function (x) { return el.classList.contains("btn--" + x); })[0] || "solid";
      return { type: "button", label: F.CMS.labelOf(el), href: el.getAttribute("href") || "", variant: v, newTab: el.getAttribute("target") === "_blank" || undefined };
    }
    if (k === "image") return { type: "image", src: el.getAttribute("src") || "", alt: el.getAttribute("alt") || "" };
    if (k === "photo") { var img = el.querySelector("img"); return img ? { type: "image", src: img.getAttribute("src"), alt: img.alt, h: 186 } : null; }
    return null;
  }
  function cloneAdded(id) {
    var P = pg(), nid = newId(), b = clone(P.added[id]);
    P.added[nid] = b;
    if (b.type === "columns") {
      for (var i = 0; i < 3; i++) {
        var src = P.order[id + "-c" + i];
        if (src) P.order[nid + "-c" + i] = src.filter(function (k) { return P.added[k]; }).map(cloneAdded);
      }
    }
    return nid;
  }
  function duplicate() {
    var el = selEl();
    if (!el || !el.parentElement) return;
    var key = S.sel, copy;
    if (addedBlock(key)) copy = cloneAdded(key);
    else {
      var b = asBlock(el);
      if (!b || !movable(el)) { toast("Only text, buttons and images can be duplicated."); return; }
      copy = newId();
      pg().added[copy] = b;
    }
    insertKey(copy, el.parentElement, nextEl(el));
    commit();
    select(copy);
    toast("Duplicated. The copy is selected.");
  }
  function setCols(key, n) {
    var b = addedBlock(key), P = pg();
    if (!b || (b.cols === 3 ? 3 : 2) === n) return;
    if (n === 2 && P.order[key + "-c2"]) {
      P.order[key + "-c1"] = (P.order[key + "-c1"] || []).concat(P.order[key + "-c2"]);
      delete P.order[key + "-c2"];
    }
    b.cols = n;
    commit();
    renderProps();
  }

  /* ---------- Adding blocks ---------- */
  var DEFAULTS = {
    heading: function () { return { type: "text", tag: "h2", html: "" }; },
    text: function () { return { type: "text", tag: "p", html: "" }; },
    label: function () { return { type: "text", tag: "label", html: "" }; },
    button: function () { return { type: "button", label: "New button", href: S.page === "index.html" ? "#contact" : "index.html#contact", variant: "solid" }; },
    image: function () { return { type: "image", src: "", alt: "" }; },
    shape: function () { return { type: "shape", bg: "blue", w: "240px", h: 120, radius: 16 }; },
    columns: function () { return { type: "columns", cols: 2 }; }
  };
  function placeFor() {
    var el = selEl();
    if (el && el.isConnected && el.getClientRects().length) {
      if (el.getAttribute("data-cms-added") === "columns") return { box: el.firstElementChild, before: null };
      if (isFlow(el) && !free(el)) return { box: el, before: null };
      for (var n = el; n && n !== F.doc.body; n = n.parentElement) {
        if (n.parentElement && isFlow(n.parentElement)) return { box: n.parentElement, before: nextEl(n) };
      }
    }
    var secs = $$("main > section", F.doc).filter(function (s) { return s.getClientRects().length; });
    var mid = F.win.innerHeight * 0.4;
    var sec = secs.filter(function (s) { var r = s.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; })[0] || secs[0];
    if (!sec) return null;
    var h = sec.querySelector("h1, h2");
    var box = h && isFlow(h.parentElement) ? h.parentElement : $$("*", sec).filter(isFlow)[0];
    return box ? { box: box, before: null } : null;
  }
  function addBlock(what, where, file) {
    if (!S.ready || !DEFAULTS[what]) return;
    endEdit();
    if (S.mode !== "edit") setMode("edit");
    where = where || placeFor();
    if (!where) { toast("Select a block on the page first, then add the component."); return; }
    var id = newId(), b = DEFAULTS[what]();
    pg().added[id] = b;
    insertKey(id, where.box, where.before);
    commit();
    select(id, { scroll: true });
    if (b.type === "text") startEdit(selEl());
    else if (b.type === "image") { if (file) useFile(file, id); else pickFile(id); }
    else toast(nameOf(selEl()) + " added. Edit it in the panel on the right.");
  }

  var dragGhost = $("#dragGhost");
  $("#comps").addEventListener("pointerdown", function (e) {
    var b = e.target.closest(".comp");
    if (!b || e.button !== 0 || !S.ready) return;
    var what = b.getAttribute("data-add"), sx = e.clientX, sy = e.clientY, moved = false;
    try { b.setPointerCapture(e.pointerId); } catch (x) { /* capture is best effort */ }
    function move(ev) {
      if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 6) return;
      if (!moved) {
        moved = true;
        endEdit();
        if (S.mode !== "edit") setMode("edit");
        drag = { el: null, fromPanel: true, target: null };
        dragGhost.textContent = b.textContent.trim();
        dragGhost.classList.add("is-on");
      }
      dragGhost.style.transform = "translate(" + (ev.clientX + 12) + "px," + (ev.clientY + 12) + "px)";
      var r = frame.getBoundingClientRect();
      var inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
      if (inside && F.doc) {
        var fx = (ev.clientX - r.left) / S.scale, fy = (ev.clientY - r.top) / S.scale;
        drag.target = dropAt(fx, fy, null);
        autoscroll(fy);
      } else drag.target = null;
      showDrop(drag.target);
    }
    function up() {
      b.removeEventListener("pointermove", move);
      b.removeEventListener("pointerup", up);
      b.removeEventListener("pointercancel", cancel);
      if (!moved) return;
      suppressClick = true;
      var t = drag && drag.target;
      drag = null;
      dragGhost.classList.remove("is-on");
      showDrop(null);
      if (t) addBlock(what, t);
      else toast("Drop the component onto the page to add it there.");
    }
    function cancel() {
      b.removeEventListener("pointermove", move);
      b.removeEventListener("pointerup", up);
      b.removeEventListener("pointercancel", cancel);
      drag = null;
      dragGhost.classList.remove("is-on");
      showDrop(null);
    }
    b.addEventListener("pointermove", move);
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", cancel);
  });
  $("#comps").addEventListener("click", function (e) {
    var b = e.target.closest(".comp");
    if (!b) return;
    if (suppressClick) { suppressClick = false; return; }
    if (!S.ready) { toast("Wait for the page to finish loading."); return; }
    addBlock(b.getAttribute("data-add"));
  });

  /* ---------- Images ---------- */
  var fileTarget = null;
  function pickFile(key) {
    fileTarget = { key: key, page: S.page };
    var fi = $("#fileInput");
    fi.value = "";
    fi.click();
  }
  $("#fileInput").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f || !fileTarget || fileTarget.page !== S.page) return;
    useFile(f, fileTarget.key);
  });
  function fullName() { var D = F.win && F.win.PORTFOLIO; return (D && (D.fullName || D.name)) || "Rayhan Ravandika"; }
  function useFile(file, key) {
    var el = F.CMS.el(key), isPhoto = !!(el && el.hasAttribute("data-cms-photo"));
    toast("Preparing the image…");
    readImage(file, isPhoto ? 900 : 1800).then(function (data) {
      if (!F.CMS || !F.CMS.el(key)) return;
      var id = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      S.uploads[id] = data;
      setFieldAny(key, "src", "upload:" + id);
      var p = addedBlock(key) || pg().nodes[key] || {};
      if (isPhoto && !p.alt) setFieldAny(key, "alt", "Photo of " + fullName());
      commit();
      renderProps();
      toast(isPhoto ? "Photo updated. Use Focus in the panel to choose what stays visible." : "Image added. Add a short description in the panel for screen readers.");
    }, function (err) { toast(err.message); });
  }
  function readImage(file, max) {
    return new Promise(function (resolve, reject) {
      if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) { reject(new Error("Use a PNG, JPG, WebP or GIF image.")); return; }
      if (file.size > 15 * 1024 * 1024) { reject(new Error("This image is larger than 15 MB. Pick a smaller one.")); return; }
      var fr = new FileReader();
      fr.onerror = function () { reject(new Error("Couldn't read that file. Try another image.")); };
      fr.onload = function () {
        var url = fr.result;
        if (file.type === "image/gif") {
          if (file.size > 2 * 1024 * 1024) reject(new Error("GIFs need to be under 2 MB."));
          else resolve(url);
          return;
        }
        var img = new Image();
        img.onload = function () {
          var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, max / Math.max(w, h));
          if (s === 1 && file.size < 400 * 1024) { resolve(url); return; }
          var c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(w * s));
          c.height = Math.max(1, Math.round(h * s));
          var ctx = c.getContext("2d");
          ctx.drawImage(img, 0, 0, c.width, c.height);
          var alpha = false;
          if (file.type !== "image/jpeg") {
            var px = ctx.getImageData(0, 0, c.width, c.height).data;
            for (var i = 3; i < px.length; i += 28) if (px[i] < 250) { alpha = true; break; }
          }
          resolve(c.toDataURL(alpha ? "image/png" : "image/jpeg", 0.86));
        };
        img.onerror = function () { reject(new Error("That file isn't an image this browser can open.")); };
        img.src = url;
      };
      fr.readAsDataURL(file);
    });
  }
  document.addEventListener("dragover", function (e) { if (hasFiles(e)) e.preventDefault(); });
  document.addEventListener("drop", function (e) { if (hasFiles(e)) { e.preventDefault(); toast("Drop images onto the page itself."); } });

  /* ---------- Contrast ---------- */
  function rgb(s) {
    var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(s || "");
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  }
  function lum(c) {
    var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function bgOf(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var cs = F.win.getComputedStyle(n), c = rgb(cs.backgroundColor);
      if (c && c.a > 0.8) return c;
      if (cs.backgroundImage && cs.backgroundImage !== "none" && n.classList.contains("tone-blue")) return { r: 13, g: 71, b: 201, a: 1 };
    }
    return { r: 231, g: 237, b: 246, a: 1 };
  }
  function contrastNote(el) {
    var t = sizeTarget(el), cs = F.win.getComputedStyle(t), fg = rgb(cs.color), bg = bgOf(t);
    if (!fg) return "";
    var a = lum(fg), b = lum(bg), ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    var size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
    var need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5, r = ratio.toFixed(1);
    return ratio >= need
      ? '<p class="msg msg--ok"><svg><use href="#i-check"/></svg><span>Contrast ' + r + ":1. Easy to read.</span></p>"
      : '<p class="msg msg--warn"><svg><use href="#i-alert"/></svg><span>Contrast ' + r + ":1. Text this size needs at least " + need + ":1. Pick a darker or lighter color.</span></p>";
  }

  /* ---------- Properties panel ---------- */
  var props = $("#props");
  var EMPTY = '<div class="props-empty"><strong>Nothing selected</strong><p>Click anything on the page to change it. Double-click text or a button to type.</p><p>To add something new, use the Add tab on the left.</p></div>';
  function chipsHtml(id, label, f, list, cur) {
    return '<div class="field"><span class="lbl" id="' + id + '">' + esc(label) + '</span><div class="chips" role="group" aria-labelledby="' + id + '">' +
      list.map(function (x) {
        return '<button type="button" data-f="' + f + '" data-v="' + esc(x[0]) + '" aria-pressed="' + (String(cur == null ? "" : cur) === String(x[0])) + '">' + esc(x[1]) + "</button>";
      }).join("") + "</div></div>";
  }
  function swatchHtml(id, label, f, list, cur) {
    return '<div class="field"><span class="lbl" id="' + id + '">' + esc(label) + '</span><div class="swatches" role="group" aria-labelledby="' + id + '">' +
      list.map(function (x) {
        return '<button type="button" data-f="' + f + '" data-v="' + x[0] + '" style="--c:' + (x[2] || "#fff") + '" aria-label="' + esc(x[1]) + '" title="' + esc(x[1]) + '" aria-pressed="' + ((cur || "") === x[0]) + '"></button>';
      }).join("") + "</div></div>";
  }
  function numHtml(id, label, f, v, ph, min, max) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><div class="unit" data-unit="px"><input id="' + id + '" class="input" type="number" inputmode="numeric" data-f="' + f + '"' +
      (min != null ? ' min="' + min + '"' : "") + (max != null ? ' max="' + max + '"' : "") + ' value="' + (v == null ? "" : esc(v)) + '" placeholder="' + esc(ph) + '" /></div></div>';
  }
  function px(v) { return Math.round(parseFloat(v) || 0); }
  function crumbs(el) {
    var chain = [];
    for (var n = el.parentElement; n && n !== F.doc.body; n = n.parentElement) {
      if (n.hasAttribute("data-cms-cell")) continue;
      if (n.hasAttribute("data-cms-added") || known(n)) chain.unshift(n);
    }
    chain = chain.slice(-3);
    return '<nav class="crumbs" aria-label="Where the selection sits">' + chain.map(function (n) {
      return '<button type="button" data-act="crumb" data-key="' + esc(F.CMS.key(n)) + '" title="Select this ' + esc(nameOf(n).toLowerCase()) + '">' + esc(nameOf(n)) + '</button><span aria-hidden="true">›</span>';
    }).join("") + '<span aria-current="true">' + esc(nameOf(el)) + "</span></nav>";
  }
  function renderProps() {
    if (!S.ready) { props.innerHTML = '<p class="hint">Loading…</p>'; return; }
    var el = selEl();
    if (!el) { props.innerHTML = EMPTY; return; }
    var key = S.sel, isA = !!addedBlock(key), p = isA ? addedBlock(key) : pg().nodes[key] || {}, k = kind(el);
    var cs = F.win.getComputedStyle(sizeTarget(el)), h = [];
    var hidden = el.hasAttribute("data-cms-hidden"), shown = !!el.getClientRects().length;
    h.push('<div class="p-head"><svg><use href="#' + iconOf(el) + '"/></svg><h2>' + esc(nameOf(el)) + "</h2>" +
      (isA ? '<span class="tag tag--added">Added</span>' : hidden ? '<span class="tag tag--hidden">Hidden</span>' : Object.keys(p).some(function (x) { return x !== "was"; }) ? '<span class="tag">Changed</span>' : "") + "</div>");
    h.push(crumbs(el));
    if (hidden) h.push('<p class="msg msg--warn" style="margin-top:12px"><svg><use href="#i-eye-off"/></svg><span>Hidden from visitors.</span></p><button type="button" class="tbtn tbtn--block" data-act="show" style="margin-top:8px"><svg><use href="#i-eye"/></svg>Show it again</button>');
    else if (!shown) h.push('<p class="msg msg--warn" style="margin-top:12px"><span>Not visible right now, for example inside a closed tab or a collapsed list. Switch to Interact to open it.</span></p>');
    if (editing && editing.key === key) h.push('<p class="msg msg--ok" style="margin-top:12px"><span>Typing on the page. Press Esc or click elsewhere when you\'re done.</span></p>');

    if (k === "text") {
      var html = isA ? p.html || "" : el.innerHTML, rich = /<(b|strong|i|em|a|span|code|mark|small|sub|sup)\b/i.test(html);
      h.push('<section class="p-sec"><h3>Content</h3>');
      if (isA) h.push(chipsHtml("l-tag", "Type", "tag", [["h2", "Heading"], ["h3", "Subheading"], ["p", "Text"], ["label", "Small label"]], p.tag || "p"));
      h.push('<div class="field"><label for="f-text">Text</label><textarea id="f-text" class="textarea" data-f="text">' + esc(htmlToText(html)) + "</textarea>" +
        (rich ? '<p class="help">Bold, italic and links survive when you type on the page. Editing in this box keeps only the words.</p>' : "") + "</div>");
      h.push('<button type="button" class="tbtn" data-act="edit"><svg><use href="#i-text"/></svg>Type on the page</button></section>');
    }
    if (k === "link" || k === "button") {
      var label = isA ? p.label || "" : F.CMS.labelOf(el), link = k === "button" ? el.querySelector("a") : el;
      var href = isA ? p.href || "" : el.getAttribute("href") || "", btnish = isA || el.classList.contains("btn");
      var variant = isA ? p.variant || "solid" : (VARIANTS.filter(function (v) { return el.classList.contains("btn--" + v[0]); })[0] || [""])[0];
      h.push('<section class="p-sec"><h3>' + (btnish ? "Button" : "Link") + "</h3>");
      h.push('<div class="field"><label for="f-label">Label</label><input id="f-label" class="input" data-f="label" value="' + esc(label) + '" /></div>');
      h.push('<div class="field"><label for="f-href">Link to</label><input id="f-href" class="input" data-f="href" spellcheck="false" value="' + esc(href) + '" placeholder="https://… or #contact" aria-describedby="f-href-help" />' +
        '<p class="help" id="f-href-help">A web address, a page such as hris.html, a section such as #contact, or mailto: and tel: links.</p></div>');
      h.push('<label class="check"><input type="checkbox" data-f="newTab"' + ((isA ? p.newTab : link && link.getAttribute("target") === "_blank") ? " checked" : "") + " /> Open in a new tab</label>");
      if (btnish) h.push(chipsHtml("l-variant", "Style", "variant", VARIANTS, variant) + '<p class="help">The white styles are made for blue backgrounds.</p>');
      h.push("</section>");
    }
    if (k === "image" || k === "photo") {
      var src, alt;
      if (k === "photo") { var im = el.querySelector("img"); src = im ? im.getAttribute("src") : ""; alt = p.alt != null ? p.alt : im ? im.alt : ""; }
      else if (isA) { src = p.src ? F.CMS.safeUrl(p.src, true) : ""; alt = p.alt || ""; }
      else { src = el.getAttribute("src"); alt = el.getAttribute("alt") || ""; }
      var typed = p.src && !/^(upload:|data:)/.test(p.src) ? p.src : "";
      h.push('<section class="p-sec"><h3>' + (k === "photo" ? "ID card photo" : "Image") + "</h3>");
      h.push('<div class="thumb">' + (src ? '<img src="' + esc(src) + '" alt="" />' : "<span>" + (k === "photo" ? "Initials are showing" : "No image yet") + "</span>") + "</div>");
      h.push('<div class="actions"><button type="button" class="tbtn" data-act="upload"><svg><use href="#i-upload"/></svg>' + (src ? "Replace" : "Upload") + "</button>" +
        (k === "photo" ? '<button type="button" class="tbtn" data-act="removePhoto"' + (src ? "" : " disabled") + '><svg><use href="#i-trash"/></svg>Remove photo</button>' : "") + "</div>");
      if (k === "photo") h.push('<p class="help">A portrait works best. The card crops it to fill the frame; Focus picks the part that stays visible.</p>');
      else h.push('<div class="field"><label for="f-src">Or paste an image address</label><input id="f-src" class="input" data-f="src" spellcheck="false" value="' + esc(typed) + '" placeholder="https://…" /></div>');
      h.push('<div class="field"><label for="f-alt">Description for screen readers</label><input id="f-alt" class="input" data-f="alt" value="' + esc(alt) + '"' + (p.deco ? " disabled" : "") + ' aria-describedby="f-alt-help" />' +
        '<p class="help" id="f-alt-help">Say what it shows, for example "Rayhan presenting the BRD to the business team".</p></div>');
      if (k !== "photo") h.push('<label class="check"><input type="checkbox" data-f="deco"' + (p.deco ? " checked" : "") + " /> Decorative, no description needed</label>");
      if (k === "photo" || isA || p.h) h.push(chipsHtml("l-pos", "Focus", "pos", [["top", "Top"], ["center", "Center"], ["bottom", "Bottom"]], p.pos || "center"));
      if (isA || (k === "image" && p.h)) h.push(chipsHtml("l-fit", "Fit", "fit", [["cover", "Fill the frame"], ["contain", "Show it whole"]], p.fit || "cover"));
      h.push("</section>");
    }
    if (k === "shape") {
      h.push('<section class="p-sec"><h3>Shape</h3>' + swatchHtml("l-bg", "Fill", "bg", FILLS.slice(2), p.bg || "") + "</section>");
    }
    if (k === "columns") {
      h.push('<section class="p-sec"><h3>Columns</h3>' + chipsHtml("l-cols", "Number of columns", "cols", [["2", "2"], ["3", "3"]], String(p.cols === 3 ? 3 : 2)) +
        numHtml("f-gap", "Gap between columns", "gap", p.gap, "24", 0, 120) +
        '<p class="help">Drag blocks into a column. On phones the columns stack.</p></section>');
    }

    var wcur = p.w || "", wpx = /px$/.test(wcur) ? parseFloat(wcur) : null;
    h.push('<section class="p-sec"><h3>Size and position</h3>');
    h.push(chipsHtml("l-w", "Width", "w", WIDTHS, WIDTHS.some(function (x) { return x[0] === wcur; }) ? wcur : null));
    h.push(numHtml("f-wpx", "Exact width", "wpx", wpx, px(cs.width), 24, 2400));
    if (k === "image" || k === "photo" || k === "shape") h.push(numHtml("f-h", "Height", "h", p.h, px(cs.height), 16, 2000));
    h.push(chipsHtml("l-align", "Align", "align", [["left", "Left"], ["center", "Center"], ["right", "Right"]], p.align || null));
    var ecs = F.win.getComputedStyle(el);
    h.push('<div class="row">' + numHtml("f-mt", "Space above", "mt", p.mt, px(ecs.marginTop), -200, 400) + numHtml("f-mb", "Space below", "mb", p.mb, px(ecs.marginBottom), -200, 400) + "</div></section>");

    if (k === "text" || k === "link" || k === "button") {
      h.push('<section class="p-sec"><h3>Text style</h3><div class="row">' + numHtml("f-fs", "Size", "fs", p.fs, px(cs.fontSize), 10, 120) +
        '<div class="field"><label for="f-fw">Weight</label><select id="f-fw" class="select" data-f="fw">' +
        [["", "Default"], ["400", "Regular"], ["500", "Medium"], ["600", "Semibold"], ["700", "Bold"], ["800", "Extra bold"]].map(function (o) {
          return '<option value="' + o[0] + '"' + (String(p.fw || "") === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
        }).join("") + "</select></div></div>" + swatchHtml("l-color", "Color", "color", COLORS, p.color || "") + '<div id="contrast">' + (shown ? contrastNote(el) : "") + "</div></section>");
    }
    if (k !== "shape" && k !== "photo") {
      var fills = k === "image" ? [] : FILLS;
      h.push('<section class="p-sec"><h3>' + (k === "image" ? "Corners" : "Background") + "</h3>" + (fills.length ? swatchHtml("l-bg", "Fill", "bg", fills, p.bg || "") : "") +
        '<div class="row">' + (k === "image" ? "" : numHtml("f-pad", "Padding", "pad", p.pad, px(cs.paddingTop), 0, 200)) + numHtml("f-radius", "Corner radius", "radius", p.radius, px(cs.borderTopLeftRadius), 0, 999) + "</div></section>");
    } else {
      h.push('<section class="p-sec"><h3>Corners</h3>' + numHtml("f-radius", "Corner radius", "radius", p.radius, px(cs.borderTopLeftRadius), 0, 999) + "</section>");
    }
    h.push('<section class="p-sec"><h3>Visibility</h3>' + chipsHtml("l-only", "Show on", "only", [["", "All screens"], ["desktop", "Desktop only"], ["phone", "Phone only"]], p.only || "") +
      '<p class="help">Phone means screens up to 760 pixels wide.</p></section>');

    var canMove = movable(el), sibs = canMove ? visibleKids(el.parentElement) : [], idx = sibs.indexOf(el);
    var hm = !isA && canMove ? home(el) : null, away = hm && hm.box !== el.parentElement;
    var touchedNode = !isA && Object.keys(p).some(function (x) { return x !== "was"; });
    h.push('<section class="p-sec"><h3>Arrange</h3><div class="actions">' +
      '<button type="button" class="tbtn" data-act="up"' + (canMove && idx > 0 ? "" : " disabled") + '><svg><use href="#i-up"/></svg>Move up</button>' +
      '<button type="button" class="tbtn" data-act="down"' + (canMove && idx > -1 && idx < sibs.length - 1 ? "" : " disabled") + '><svg><use href="#i-down"/></svg>Move down</button>' +
      '<button type="button" class="tbtn" data-act="dup"' + (isA || asBlock(el) ? "" : " disabled") + '><svg><use href="#i-copy"/></svg>Duplicate</button>' +
      (isA ? '<button type="button" class="tbtn tbtn--danger" data-act="delete"><svg><use href="#i-trash"/></svg>Delete</button>'
        : hidden ? '<button type="button" class="tbtn" data-act="show"><svg><use href="#i-eye"/></svg>Show</button>'
          : '<button type="button" class="tbtn" data-act="hide"><svg><use href="#i-eye-off"/></svg>Hide</button>') +
      (touchedNode ? '<button type="button" class="tbtn" data-act="reset"><svg><use href="#i-reset"/></svg>Undo all changes</button>' : "") +
      (away ? '<button type="button" class="tbtn" data-act="home"><svg><use href="#i-reset"/></svg>Move it back</button>' : "") +
      "</div></section>");
    var top = props.scrollTop;
    props.innerHTML = h.join("");
    props.scrollTop = top;
  }

  function readNum(t) { if (t.value === "") return null; var v = Number(t.value); return isFinite(v) ? v : undefined; }
  function field(t, final) {
    var key = S.sel;
    if (!key || !S.ready || !selEl()) return;
    var f = t.getAttribute("data-f"), v = t.type === "checkbox" ? t.checked : t.value, isA = !!addedBlock(key), b = addedBlock(key);
    if (t.type === "number") {
      v = readNum(t);
      if (v === undefined) return;
      if (v !== null) {
        var min = t.min === "" ? -Infinity : +t.min, max = t.max === "" ? Infinity : +t.max;
        if (final) { v = Math.min(max, Math.max(min, v)); t.value = v; } else if (v < min || v > max) return;
      }
    }
    if (f === "text") {
      var html = textToHtml(v);
      if (isA) b.html = html;
      else if (!norm(v)) { if (final) toast("Text can't be left empty. To remove it, use Hide."); return; }
      else setField(key, "html", html);
    } else if (f === "label") {
      if (!norm(v)) { if (final) { toast("A button needs a label."); renderProps(); } return; }
      if (isA) b.label = v; else setField(key, "html", esc(v));
    } else if (f === "href") {
      var ok = v.trim() === "" || F.CMS.safeUrl(v) !== "";
      t.setAttribute("aria-invalid", String(!ok));
      $("#f-href-help").textContent = ok ? "A web address, a page such as hris.html, a section such as #contact, or mailto: and tel: links."
        : "That link can't be used. Start with https://, mailto: or tel:, or use a page or #section name.";
      $("#f-href-help").className = ok ? "help" : "help msg msg--error";
      if (!ok) return;
      setFieldAny(key, "href", v.trim());
    } else if (f === "src") {
      var okSrc = v.trim() === "" || /^https?:\/\//i.test(v.trim()) || F.CMS.safeUrl(v, true) !== "";
      t.setAttribute("aria-invalid", String(!okSrc));
      if (!okSrc) return;
      if (v.trim() === "" && p0(key).src && /^(upload:|data:)/.test(p0(key).src)) return;
      setFieldAny(key, "src", v.trim() || null);
    } else if (f === "wpx") {
      setFieldAny(key, "w", v === null ? null : Math.round(v) + "px");
    } else if (f === "deco") {
      setFieldAny(key, "deco", v || null);
      setFieldAny(key, "alt", v ? "" : null, v);
      if (final) { commit(); renderProps(); return; }
    } else if (f === "alt") {
      setFieldAny(key, "alt", v);
    } else if (f === "newTab") {
      setFieldAny(key, "newTab", v ? true : isA ? null : false);
    } else if (f === "fw") {
      setFieldAny(key, "fw", v ? Number(v) : null);
    } else {
      setFieldAny(key, f, v);
    }
    if (final) commit(); else render();
    if (final && /^(fs|fw|color|bg)$/.test(f)) refreshContrast();
  }
  function p0(key) { return addedBlock(key) || pg().nodes[key] || {}; }
  function refreshContrast() { var c = $("#contrast"), el = selEl(); if (c && el && el.getClientRects().length) c.innerHTML = contrastNote(el); }
  props.addEventListener("input", function (e) { var t = e.target; if (t.getAttribute && t.getAttribute("data-f") && t.type !== "checkbox") field(t, false); });
  props.addEventListener("change", function (e) { var t = e.target; if (t.getAttribute && t.getAttribute("data-f")) field(t, true); });
  props.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || b.disabled) return;
    var key = S.sel;
    if (b.hasAttribute("data-f")) {
      var f = b.getAttribute("data-f"), v = b.getAttribute("data-v");
      if (f === "cols") { setCols(key, Number(v)); return; }
      var cur = p0(key)[f];
      if (f === "align" && cur === v) v = null;
      setFieldAny(key, f, v === "" ? null : v);
      commit();
      renderProps();
      var again = props.querySelector('[data-f="' + f + '"][data-v="' + (b.getAttribute("data-v")) + '"]');
      if (again) again.focus();
      return;
    }
    act(b.getAttribute("data-act"), b);
  });
  function act(name, b) {
    var key = S.sel, el = selEl();
    if (!el) return;
    if (name === "crumb") { select(b.getAttribute("data-key"), { scroll: true }); return; }
    if (name === "edit") { if (S.mode !== "edit") setMode("edit"); startEdit(el); return; }
    if (name === "upload") { pickFile(key); return; }
    if (name === "removePhoto") {
      var orig = document.createElement("div");
      orig.innerHTML = F.CMS.original(el);
      if (orig.querySelector("img")) setField(key, "src", "", true); else setField(key, "src", null);
      setField(key, "alt", null);
      commit(); renderProps(); toast("Photo removed. The card shows initials.", "Undo", undo);
      return;
    }
    if (name === "show") { setField(key, "hidden", null); commit(); renderProps(); toast("Shown again."); return; }
    if (name === "hide" || name === "delete") { removeSel(); return; }
    if (name === "up" || name === "down") { nudge(name === "up" ? -1 : 1); return; }
    if (name === "dup") { duplicate(); return; }
    if (name === "reset") {
      delete pg().nodes[key];
      commit(); renderProps(); toast("Changes to this " + nameOf(el).toLowerCase() + " undone.", "Undo", undo);
      return;
    }
    if (name === "home") { returnHome(el); commit(); select(key, { scroll: true }); toast("Moved back to where it started."); }
  }

  /* ---------- Layers ---------- */
  var openRegions = {}, layersTimer = null;
  function renderLayersSoon() { clearTimeout(layersTimer); layersTimer = setTimeout(renderLayers, 80); }
  function regionTitle(r, i) {
    if (r.tagName === "HEADER") return "Top bar";
    if (r.tagName === "FOOTER") return "Footer";
    var h = r.querySelector("h1, h2");
    return h ? norm(h.textContent).slice(0, 40) : "Section " + (i + 1);
  }
  function collect(node, depth, out) {
    for (var c = node.firstElementChild; c; c = c.nextElementSibling) {
      if (c.hasAttribute("data-cms-ui") || /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(c.tagName)) continue;
      var isCell = c.hasAttribute("data-cms-cell");
      if (isCell) { collect(c, depth, out); continue; }
      var isA = c.hasAttribute("data-cms-added"), k = kind(c), key = F.CMS.key(c);
      var leaf = isA ? k !== "columns" : k !== "box";
      var show = isA || (known(c) && (leaf || pg().nodes[key]));
      if (show) out.push(layerItem(c, key, depth));
      if ((!leaf || (isA && k === "columns")) && c.tagName !== "svg") collect(c, depth + (show ? 1 : 0), out);
    }
  }
  function layerItem(el, key, depth) {
    var hiddenSelf = el.hasAttribute("data-cms-hidden"), off = !hiddenSelf && !el.getClientRects().length;
    var name = nameOf(el), text = snippet(el);
    return '<li class="layer' + (hiddenSelf ? " is-hidden" : off ? " is-off" : "") + (el.hasAttribute("data-cms-added") ? " is-added" : "") + '" style="--d:' + Math.min(depth, 4) + '">' +
      '<button type="button" class="layer__btn" data-key="' + esc(key) + '"' + (key === S.sel ? ' aria-current="true"' : "") +
      ' title="' + esc(name + (text ? ": " + text : "") + (hiddenSelf ? " (hidden)" : off ? " (not visible right now)" : "")) + '"><svg><use href="#' + iconOf(el) + '"/></svg>' +
      '<span class="layer__name">' + esc(name) + '</span><span class="layer__text">' + esc(text) + "</span>" +
      (hiddenSelf ? '<span class="sr-only">, hidden</span>' : "") + "</button>" +
      (hiddenSelf ? '<button type="button" class="layer__eye" data-show="' + esc(key) + '" aria-label="Show ' + esc(name + " " + text) + '" title="Show"><svg><use href="#i-eye-off"/></svg></button>' : "") + "</li>";
  }
  function renderLayers() {
    if (!S.ready || !F.doc) return;
    var box = $("#layers"), scroller = box.parentElement, top = scroller.scrollTop;
    var regions = $$("body > header, main > section, body > footer", F.doc).filter(known);
    var open = openRegions[S.page] || (openRegions[S.page] = {}), el = selEl();
    var html = regions.map(function (r, i) {
      var items = [], rk = F.CMS.key(r);
      collect(r, 0, items);
      var isOpen = open[rk] === undefined ? (el ? r.contains(el) : i === 0) : open[rk] || (el && r.contains(el));
      return '<details data-region="' + esc(rk) + '"' + (isOpen ? " open" : "") + "><summary><span>" + esc(regionTitle(r, i)) + "</span><small>" + items.length +
        '<span class="sr-only"> items</span></small></summary><ul>' + items.join("") + "</ul></details>";
    }).join("");
    box.innerHTML = html || '<p class="hint">This page has no sections to list.</p>';
    scroller.scrollTop = top;
  }
  function markLayer() {
    $$(".layer__btn[aria-current]").forEach(function (b) { b.removeAttribute("aria-current"); });
    if (!S.sel) return;
    var b = $('.layer__btn[data-key="' + CSS.escape(S.sel) + '"]');
    if (!b) { renderLayersSoon(); return; }
    b.setAttribute("aria-current", "true");
    var d = b.closest("details");
    if (d && !d.open) d.open = true;
    if (!$("#panel-layers").hidden) b.scrollIntoView({ block: "nearest" });
  }
  $("#layers").addEventListener("click", function (e) {
    var eye = e.target.closest("[data-show]");
    if (eye) { setField(eye.getAttribute("data-show"), "hidden", null); commit(); renderProps(); toast("Shown again."); return; }
    var b = e.target.closest(".layer__btn");
    if (!b) return;
    if (S.mode !== "edit") setMode("edit");
    select(b.getAttribute("data-key"), { scroll: true });
  });
  $("#layers").addEventListener("toggle", function (e) {
    var d = e.target;
    if (d.tagName === "DETAILS" && openRegions[S.page]) openRegions[S.page][d.getAttribute("data-region")] = d.open;
  }, true);

  /* ---------- Toolbar ---------- */
  function setMode(m) {
    endEdit();
    S.mode = m;
    $$("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === m)); });
    if (F.doc) {
      F.doc.documentElement.classList.toggle("is-editing-mode", m === "edit");
      F.doc.documentElement.removeAttribute("data-cms-hover");
    }
    hoverEl = null;
    if (m === "interact" && S.ready) toast("Interact: use the page like a visitor. Switch back to Edit to change things.");
  }
  $$("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
  function applyDevice() {
    var sc = $("#stageScroll"), inner = $("#stageInner");
    if (!sc.clientWidth) return;
    var w = DEVICES[S.device], availW = sc.clientWidth - 48, availH = Math.max(240, sc.clientHeight - 48);
    var scale = S.zoom === "fit" ? Math.min(1, availW / w) : 1;
    if (!(scale > 0.1)) scale = 0.1;
    S.scale = scale;
    frame.style.width = w + "px";
    frame.style.height = availH / scale + "px";
    frame.style.transform = scale < 1 ? "scale(" + scale + ")" : "";
    inner.style.width = w * scale + "px";
    inner.style.height = availH + "px";
    $("#stage").setAttribute("data-device", S.device);
    $("#zoomSelect").options[0].textContent = "Fit (" + Math.round((S.zoom === "fit" ? scale : Math.min(1, availW / w)) * 100) + "%)";
  }
  $$("[data-device]").forEach(function (b) {
    b.addEventListener("click", function () {
      S.device = b.getAttribute("data-device");
      $$("[data-device]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      applyDevice();
    });
  });
  $("#zoomSelect").addEventListener("change", function () { S.zoom = this.value; applyDevice(); });
  if (window.ResizeObserver) new ResizeObserver(applyDevice).observe($("#stageScroll"));
  else window.addEventListener("resize", applyDevice);
  $("#undoBtn").addEventListener("click", undo);
  $("#redoBtn").addEventListener("click", redo);

  var pageSelect = $("#pageSelect");
  pageSelect.innerHTML = PAGES.map(function (p) { return '<option value="' + p[0] + '">' + esc(p[1]) + "</option>"; }).join("");
  pageSelect.addEventListener("change", function () {
    endEdit();
    saveNow();
    S.page = pageSelect.value;
    loadPage(S.page);
  });

  var tabs = $$(".tabs [role=tab]");
  function selectTab(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      $("#" + x.getAttribute("aria-controls")).hidden = !on;
    });
    if (t.id === "tab-layers") { renderLayers(); markLayer(); }
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(t), n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      var next = tabs[(n + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  $("#previewBtn").addEventListener("click", function () {
    endEdit();
    var w = window.open("", "_blank");
    var url = S.page + "?cms=preview";
    saveNow().then(function (ok) {
      if (!ok && !S.storeOK) toast("Preview needs browser storage, which is turned off here, so it shows the published page.");
      if (w) w.location.href = url;
      else toast("The browser blocked the new tab. Allow pop-ups for this site to preview.");
    });
  });

  /* ---------- GitHub ---------- */
  var gh = {
    cfg: null,
    load: function () {
      try {
        var s = sessionStorage.getItem("cms.github") || localStorage.getItem("cms.github");
        this.cfg = s ? JSON.parse(s) : null;
      } catch (e) { this.cfg = null; }
    },
    save: function (cfg) {
      this.cfg = cfg;
      try {
        var s = JSON.stringify(cfg);
        sessionStorage.setItem("cms.github", s);
        if (cfg.remember) localStorage.setItem("cms.github", s); else localStorage.removeItem("cms.github");
      } catch (e) { /* storage off: the token lives for this page only */ }
    },
    clear: function () {
      this.cfg = null;
      try { sessionStorage.removeItem("cms.github"); localStorage.removeItem("cms.github"); } catch (e) { /* nothing stored */ }
    },
    req: function (method, path, body, cfg, raw) {
      var c = cfg || this.cfg, headers = { Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json", Authorization: "Bearer " + c.token, "X-GitHub-Api-Version": "2022-11-28" };
      if (body) headers["Content-Type"] = "application/json";
      return fetch("https://api.github.com" + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined, cache: "no-store" })
        .then(function (res) {
          return res.text().then(function (t) {
            var j = null;
            if (!raw || !res.ok) { try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; } }
            if (!res.ok) { var err = new Error((j && j.message) || res.statusText || "Request failed"); err.status = res.status; throw err; }
            return raw ? t : j;
          });
        }, function () { var err = new Error("Network error"); err.status = 0; throw err; });
    }
  };
  function ghMessage(err, c) {
    c = c || gh.cfg || DEFAULT_GH;
    var s = err && err.status;
    if (s === 0) return "Couldn't reach GitHub. Check your connection and try again. Your draft is still saved on this browser.";
    if (s === 401) return "GitHub didn't accept the token. It may be mistyped, expired or revoked. Connect again with a new token.";
    if (s === 403 && /rate limit/i.test(err.message)) return "GitHub's request limit was reached. Wait a few minutes, then try again.";
    if (s === 403) return "This token isn't allowed to change " + c.repo + ". Give it access to this repository with the permission Contents: Read and write.";
    if (s === 404) return "GitHub couldn't find " + c.repo + " or the branch " + c.branch + ". Check both names, and that the token can see this repository.";
    if (s === 409) return "The branch is busy. Wait a moment and try again.";
    if (s === 422) return "GitHub refused the update: " + err.message + ". Try again.";
    return "GitHub returned an error" + (s ? " (" + s + ")" : "") + ": " + (err && err.message) + ".";
  }
  function encBranch(b) { return b.split("/").map(encodeURIComponent).join("/"); }
  function updateGhLabel() {
    $("#githubLabel").textContent = gh.cfg ? "GitHub connected" : "Connect GitHub";
    $("#githubBtn").title = gh.cfg ? "Publishing to " + gh.cfg.repo + ", branch " + gh.cfg.branch + (gh.cfg.login ? ", as " + gh.cfg.login : "") : "Connect GitHub so Publish can update the live site";
  }
  var ghAfter = null;
  function openGh(then) {
    var c = gh.cfg || {};
    $("#ghRepo").value = c.repo || DEFAULT_GH.repo;
    $("#ghBranch").value = c.branch || DEFAULT_GH.branch;
    $("#ghToken").value = c.token || "";
    $("#ghToken").type = "password";
    $("#ghShow").textContent = "Show";
    $("#ghShow").setAttribute("aria-pressed", "false");
    $("#ghRemember").checked = !!c.remember;
    $("#ghError").hidden = true;
    $("#ghDisconnect").hidden = !gh.cfg;
    $("#ghConnect").disabled = false;
    $("#ghConnect").textContent = "Connect";
    $$("#ghForm .input").forEach(function (i) { i.removeAttribute("aria-invalid"); });
    ghAfter = then || null;
    $("#ghDialog").showModal();
    (c.token ? $("#ghConnect") : $("#ghToken")).focus();
  }
  function ghErr(text, sel) {
    var e = $("#ghError");
    e.textContent = text;
    e.hidden = false;
    $$("#ghForm .input").forEach(function (i) { i.removeAttribute("aria-invalid"); });
    if (sel) { $(sel).setAttribute("aria-invalid", "true"); $(sel).focus(); }
  }
  $("#githubBtn").addEventListener("click", function () { openGh(); });
  $("#ghCancel").addEventListener("click", function () { $("#ghDialog").close(); });
  $("#ghShow").addEventListener("click", function () {
    var t = $("#ghToken"), show = t.type === "password";
    t.type = show ? "text" : "password";
    this.textContent = show ? "Hide" : "Show";
    this.setAttribute("aria-pressed", String(show));
  });
  $("#ghDisconnect").addEventListener("click", function () {
    gh.clear();
    updateGhLabel();
    $("#ghDialog").close();
    toast("Disconnected. The token was removed from this browser.");
  });
  $("#ghForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var repo = $("#ghRepo").value.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/, "").replace(/\/+$/, "");
    var branch = $("#ghBranch").value.trim(), token = $("#ghToken").value.trim(), remember = $("#ghRemember").checked;
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { ghErr("Enter the repository as owner/name, for example " + DEFAULT_GH.repo + ".", "#ghRepo"); return; }
    if (!branch) { ghErr("Enter the branch the site is built from.", "#ghBranch"); return; }
    if (!token) { ghErr("Paste an access token. The link under the field shows how to create one.", "#ghToken"); return; }
    var cfg = { repo: repo, branch: branch, token: token, remember: remember }, btn = $("#ghConnect");
    btn.disabled = true;
    btn.textContent = "Checking…";
    $("#ghError").hidden = true;
    gh.req("GET", "/repos/" + repo, null, cfg).then(function (info) {
      if (info && info.permissions && info.permissions.push === false) { var er = new Error("No push"); er.status = 403; throw er; }
      return gh.req("GET", "/repos/" + repo + "/branches/" + encBranch(branch), null, cfg);
    }).then(function () {
      return gh.req("GET", "/user", null, cfg).then(function (u) { return u && u.login; }, function () { return ""; });
    }).then(function (login) {
      cfg.login = login || "";
      gh.save(cfg);
      updateGhLabel();
      $("#ghDialog").close();
      toast("Connected to GitHub" + (login ? " as " + login : "") + ".");
      if (ghAfter) { var f = ghAfter; ghAfter = null; f(); }
    }, function (err) {
      btn.disabled = false;
      btn.textContent = "Connect";
      ghErr(ghMessage(err, cfg));
    });
  });

  /* ---------- Publish ---------- */
  function editsText(out) {
    return "/* Written by the site editor (admin.html). Make changes there instead of by hand. */\nwindow.PORTFOLIO_EDITS = " + JSON.stringify(out, null, 2) + ";\n";
  }
  function parseEdits(text) {
    var i = text.indexOf("{"), j = text.lastIndexOf("}");
    return JSON.parse(text.slice(i, j + 1));
  }
  function b64bytes(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function hashOf(b64) {
    if (window.crypto && crypto.subtle) {
      return crypto.subtle.digest("SHA-256", b64bytes(b64)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("").slice(0, 16);
      });
    }
    var h = 2166136261;
    for (var i = 0; i < b64.length; i++) { h ^= b64.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return Promise.resolve(h.toString(16) + b64.length.toString(16));
  }
  // Swaps "upload:<id>" for a repository path (to commit the file) or for the image data itself (for the download).
  function prepareUploads(out, inline) {
    var json = JSON.stringify(out), ids = [], re = /"upload:([a-z0-9]+)"/g, m;
    while ((m = re.exec(json))) if (ids.indexOf(m[1]) < 0) ids.push(m[1]);
    var map = {}, files = [];
    return ids.reduce(function (chain, id) {
      return chain.then(function () {
        var data = S.uploads[id];
        if (!data) { map[id] = ""; return; }
        if (inline) { map[id] = data; return; }
        var mm = /^data:(image\/[\w+.-]+);base64,(.*)$/.exec(data);
        if (!mm) { map[id] = ""; return; }
        var ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" }[mm[1]] || "img";
        return hashOf(mm[2]).then(function (h) {
          var path = "assets/uploads/" + h + "." + ext;
          map[id] = path;
          if (!files.some(function (f) { return f.path === path; })) files.push({ path: path, b64: mm[2] });
        });
      });
    }, Promise.resolve()).then(function () {
      Object.keys(out.pages).forEach(function (p) {
        ["nodes", "added"].forEach(function (sec) {
          var o = out.pages[p][sec];
          Object.keys(o).forEach(function (k) {
            if (typeof o[k].src === "string" && o[k].src.indexOf("upload:") === 0) o[k].src = map[o[k].src.slice(7)] || "";
          });
        });
      });
      return files;
    });
  }
  function checkIssues() {
    var out = [];
    Object.keys(S.doc.pages).forEach(function (name) {
      var P = S.doc.pages[name], label = pageLabel(name);
      Object.keys(P.added).forEach(function (id) {
        var b = P.added[id];
        if (b.type === "image" && !b.src) out.push([name, id, label + ": an image block has no image, so it won't show."]);
        else if (b.type === "image" && !b.alt && !b.deco) out.push([name, id, label + ": an image has no description for screen readers."]);
        if (b.type === "text" && !norm(stripTags(b.html))) out.push([name, id, label + ": a text block is empty, so it won't show."]);
        if (b.type === "button" && !b.href) out.push([name, id, label + ": the button \"" + (b.label || "") + "\" doesn't link anywhere."]);
      });
      var res = S.results[name];
      if (res && (res.stale.length || res.missing.length)) out.push([name, null, label + ": " + (res.stale.length + res.missing.length) + " change(s) are switched off because the page content changed."]);
    });
    return out;
  }
  var STEPS = [["check", "Checking the live version"], ["images", "Uploading images"], ["save", "Saving your changes"], ["update", "Updating the site"]];
  function steps(state) {
    var ol = $("#pubSteps");
    ol.hidden = false;
    ol.innerHTML = STEPS.map(function (s) {
      var st = state[s[0]] || "";
      return '<li class="' + (st ? "is-" + st : "") + '">' + esc(state[s[0] + "Text"] || s[1]) +
        (st === "done" ? '<span class="sr-only">, done</span>' : st === "active" ? '<span class="sr-only">, in progress</span>' : st === "failed" ? '<span class="sr-only">, failed</span>' : "") + "</li>";
    }).join("");
  }
  function pubLock(on) {
    $("#pubGo").disabled = on;
    $("#pubClose").disabled = on;
    $("#pubDownload").disabled = on;
    $("#pubMsg").disabled = on;
  }
  var pubForce = false;
  function openPublish() {
    endEdit();
    var d = delta();
    if (!d.total) { toast("Nothing new to publish."); return; }
    pubForce = false;
    $("#pubSummary").innerHTML = '<ul class="summary">' + Object.keys(d.pages).map(function (name) {
      var c = d.pages[name], parts = [];
      if (c.edited) parts.push(c.edited + " edited");
      if (c.added) parts.push(c.added + " added");
      if (c.moved) parts.push(c.moved + " rearranged");
      if (c.hidden) parts.push(c.hidden + " hidden");
      if (c.removed) parts.push(c.removed + " deleted");
      return "<li><span>" + esc(pageLabel(name)) + "</span><span>" + esc(parts.join(", ")) + "</span></li>";
    }).join("") + "</ul>";
    var issues = checkIssues();
    $("#pubIssues").innerHTML = issues.length ? '<p class="lbl" style="font-weight:700;margin-bottom:6px">Worth checking first</p><ul class="issues">' + issues.map(function (x) {
      return "<li><span>" + esc(x[2]) + '</span><button type="button" data-goto-page="' + esc(x[0]) + '" data-goto="' + esc(x[1] || "") + '">Show me</button></li>';
    }).join("") + "</ul>" : "";
    if (!$("#pubMsg").value) $("#pubMsg").value = DEFAULT_NOTE;
    $("#pubWhere").textContent = gh.cfg
      ? "Saves to " + gh.cfg.repo + " on branch " + gh.cfg.branch + ". GitHub then rebuilds the live site, which takes about a minute."
      : "GitHub isn't connected on this browser yet. You'll be asked for a token first, or you can download the file instead.";
    $("#pubSteps").hidden = true;
    $("#pubError").hidden = true;
    $("#pubDone").hidden = true;
    $("#pubMsgField").hidden = false;
    $("#pubGo").hidden = false;
    $("#pubGo").textContent = "Publish to GitHub";
    $("#pubClose").textContent = "Cancel";
    $("#pubDownload").hidden = false;
    pubLock(false);
    $("#pubDialog").showModal();
  }
  $("#publishBtn").addEventListener("click", openPublish);
  $("#pubClose").addEventListener("click", function () { $("#pubDialog").close(); });
  var pendingSelect = null;
  $("#pubIssues").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-goto-page]");
    if (!b) return;
    var name = b.getAttribute("data-goto-page"), key = b.getAttribute("data-goto");
    $("#pubDialog").close();
    if (name !== S.page) {
      S.page = name;
      pageSelect.value = name;
      pendingSelect = key;
      loadPage(name);
    } else if (key) select(key, { scroll: true });
  });
  $("#pubGo").addEventListener("click", function () {
    if (!gh.cfg) { $("#pubDialog").close(); openGh(openPublish); return; }
    runPublish(0);
  });
  function runPublish(attempt) {
    var note = $("#pubMsg").value.trim() || DEFAULT_NOTE, state = {};
    $("#pubError").hidden = true;
    pubLock(true);
    $("#pubGo").textContent = "Publishing…";
    steps(state);
    var set = function (k, v, text) { state[k] = v; if (text) state[k + "Text"] = text; steps(state); };
    var current = "check", c = gh.cfg, R = "/repos/" + c.repo, B = encBranch(c.branch), head, remoteRev = 0, out, entries = [];
    set("check", "active");
    gh.req("GET", R + "/git/ref/heads/" + B).then(function (ref) {
      head = ref.object.sha;
      return gh.req("GET", R + "/contents/" + SITE_DIR + "assets/edits.js?ref=" + encodeURIComponent(c.branch), null, null, true).then(function (text) {
        try { var r = parseEdits(text); remoteRev = typeof r.rev === "number" ? r.rev : 0; return r; } catch (e) { return null; }
      }, function (e) { if (e.status === 404) return null; throw e; });
    }).then(function (remote) {
      if (!pubForce && remoteRev > S.baseRev) {
        var ce = new Error("conflict");
        ce.conflict = true;
        ce.when = remote && remote.published;
        throw ce;
      }
      set("check", "done");
      current = "images";
      out = pruned(S.doc);
      out.rev = Math.max(remoteRev, S.baseRev) + 1;
      out.published = new Date().toISOString();
      return prepareUploads(out, false);
    }).then(function (files) {
      set("images", "active", files.length ? "Uploading " + files.length + " image" + (files.length === 1 ? "" : "s") : "No new images to upload");
      return files.reduce(function (chain, f, i) {
        return chain.then(function () {
          return gh.req("POST", R + "/git/blobs", { content: f.b64, encoding: "base64" }).then(function (b) {
            entries.push({ path: SITE_DIR + f.path, sha: b.sha });
            if (files.length > 1) set("images", "active", "Uploading images (" + (i + 1) + " of " + files.length + ")");
          });
        });
      }, Promise.resolve());
    }).then(function () {
      set("images", "done");
      current = "save";
      set("save", "active");
      return gh.req("POST", R + "/git/blobs", { content: editsText(out), encoding: "utf-8" });
    }).then(function (blob) {
      entries.push({ path: SITE_DIR + "assets/edits.js", sha: blob.sha });
      return gh.req("GET", R + "/git/commits/" + head);
    }).then(function (commit) {
      return gh.req("POST", R + "/git/trees", {
        base_tree: commit.tree.sha,
        tree: entries.map(function (e) { return { path: e.path, mode: "100644", type: "blob", sha: e.sha }; })
      });
    }).then(function (tree) {
      return gh.req("POST", R + "/git/commits", { message: note, tree: tree.sha, parents: [head] });
    }).then(function (nc) {
      set("save", "done");
      current = "update";
      set("update", "active");
      return gh.req("PATCH", R + "/git/refs/heads/" + B, { sha: nc.sha, force: false }).then(function () { return nc; });
    }).then(function (nc) {
      set("update", "done");
      S.baseRev = out.rev;
      S.baseline = canon(pruned(S.doc).pages);
      published = normalize(out);
      if ($("#notice").dataset.kind === "info") notice(null);
      saveNow();
      updateBar();
      pubLock(false);
      $("#pubGo").hidden = true;
      $("#pubDownload").hidden = true;
      $("#pubMsgField").hidden = true;
      $("#pubClose").textContent = "Done";
      var done = $("#pubDone");
      done.innerHTML = "<span>Published. GitHub is rebuilding the site; your changes show on the live site in about a minute.</span>" +
        '<span><a href="' + esc(nc.html_url || ("https://github.com/" + c.repo + "/commits/" + c.branch)) + '" target="_blank" rel="noopener">See the change on GitHub</a> · ' +
        '<a href="https://github.com/' + esc(c.repo) + '/actions" target="_blank" rel="noopener">Watch the rebuild</a> · ' +
        '<a href="' + esc(S.page) + '" target="_blank" rel="noopener">Open the live page</a></span>';
      done.hidden = false;
      $("#pubClose").focus();
      toast("Published.");
    }).catch(function (err) {
      if (err && err.conflict) {
        set("check", "failed");
        pubLock(false);
        pubForce = true;
        var e = $("#pubError");
        e.textContent = "The live site was published from somewhere else after you started" + (err.when ? " (" + when(err.when) + ")" : "") +
          ". Publishing now replaces that version with yours.";
        e.hidden = false;
        $("#pubGo").textContent = "Replace it with my version";
        return;
      }
      if (err && err.status === 422 && current === "update" && attempt < 1) { runPublish(attempt + 1); return; }
      set(current, "failed");
      pubLock(false);
      $("#pubGo").textContent = "Try again";
      $("#pubError").textContent = ghMessage(err);
      $("#pubError").hidden = false;
      if (err && err.status === 401) { gh.clear(); updateGhLabel(); }
    });
  }
  $("#pubDownload").addEventListener("click", function () {
    var out = pruned(S.doc);
    out.rev = S.baseRev + 1;
    out.published = new Date().toISOString();
    prepareUploads(out, true).then(function () {
      var blob = new Blob([editsText(out)], { type: "text/javascript" }), a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "edits.js";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
      var done = $("#pubDone");
      done.innerHTML = "<span>Downloaded edits.js. To publish it: on GitHub, open the assets folder of the repository, choose Add file, then Upload files, and drop edits.js in to replace the old one. The site updates about a minute after you commit.</span>";
      done.hidden = false;
    }, function (err) {
      $("#pubError").textContent = "Couldn't build the file: " + err.message;
      $("#pubError").hidden = false;
    });
  });

  /* ---------- Start ---------- */
  function restore(d) {
    if (!d || !d.doc) return;
    var draft = normalize(d.doc), base = typeof d.baseRev === "number" ? d.baseRev : 0;
    var baseline = d.baseline || canon(pruned(published).pages);
    var draftChanged = canon(pruned(draft).pages) !== baseline;
    if (base >= published.rev) {
      S.doc = draft;
      Object.assign(S.uploads, d.uploads || {});
      S.baseRev = base;
      S.baseline = baseline;
      S.orig = d.orig || {};
      if (base > published.rev) notice("Your last publish is on its way. The live site can take a few minutes to show it.", null, true);
      else if (draftChanged) notice("Restored your unpublished draft from " + when(d.savedAt) + ".", null, true);
      $("#notice").dataset.kind = "info";
      return;
    }
    if (!draftChanged) return;
    S.doc = draft;
    Object.assign(S.uploads, d.uploads || {});
    S.baseRev = base;
    S.baseline = baseline;
    notice("The live site was published from somewhere else after this draft was saved. Publishing your draft will replace that version.", [
      ["Keep my draft", function () { notice(null); }],
      ["Use the live version", function () {
        S.doc = normalize(published);
        S.baseRev = published.rev;
        S.baseline = canon(pruned(published).pages);
        S.hist = {};
        notice(null);
        saveNow();
        loadPage(S.page);
      }]
    ]);
  }
  // Only one main landmark at a time: the canvas, or the small-screen message.
  var narrowQuery = window.matchMedia("(max-width: 959px)");
  function fitScreen() {
    $("#narrow").hidden = !narrowQuery.matches;
    $("#stage").hidden = narrowQuery.matches;
    if (!narrowQuery.matches) applyDevice();
  }
  if (narrowQuery.addEventListener) narrowQuery.addEventListener("change", fitScreen); else narrowQuery.addListener(fitScreen);

  function boot() {
    fitScreen();
    gh.load();
    updateGhLabel();
    var want = decodeURIComponent(location.hash.slice(1));
    S.page = PAGES.some(function (p) { return p[0] === want; }) ? want : "index.html";
    pageSelect.value = S.page;
    store.get("draft").then(function (d) {
      restore(d);
      setSave(changed() ? "Draft saved on this browser" : "No unpublished changes");
      loadPage(S.page);
    }, function (err) {
      console.error(err);
      S.storeOK = false;
      setSave("Drafts can't be saved here", true);
      notice("This browser isn't keeping drafts (a private window, or storage is turned off). Publish or download your changes before you close the tab.");
      loadPage(S.page);
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener("beforeunload", function (e) {
    if (saveTimer) saveNow();
    if (!S.storeOK && changed()) { e.preventDefault(); e.returnValue = ""; }
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden && saveTimer) saveNow(); });
  window.addEventListener("blur", function () { if (drag || resize) cancelGesture(); });
  boot();
})();
