/*
 * Applies the changes made in the site editor (admin.html) to this page.
 * Published changes live in assets/edits.js. The editor loads pages with ?cms=edit and uses the
 * same functions to reset the page and re-apply its draft after every change.
 *
 * A change is keyed by where the element sits in the page as built: the nearest id, then tag and
 * position, for example "#about/div:0/p:1". Each change also stores the start of the text it was
 * made on ("was"); if the page content changes later, the change is skipped instead of landing on
 * the wrong element.
 */
(function () {
  "use strict";
  var doc = document;
  var mode = new URLSearchParams(location.search).get("cms");
  var file = location.pathname.split("/").pop();
  var PAGE = /\.html?$/.test(file) ? file : "index.html";

  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, LINK: 1, META: 1 };
  var keyOf = new WeakMap();
  var byKey = new Map();
  var kids = new WeakMap();
  var added = new Map();
  var touched = new Map();
  var snaps = new Map();

  var COLORS = { text: "var(--text)", muted: "var(--text-2)", blue: "var(--blue)", navy: "var(--navy)", cyan: "var(--cyan)", white: "#fff" };
  var FILLS = { none: "transparent", white: "#fff", surface: "var(--surface)", mist: "var(--mist-2)", tint: "var(--chip)", blue: "var(--blue)", navy: "var(--navy)", cyan: "var(--cyan)" };
  var POS = { top: "50% 15%", center: "50% 50%", bottom: "50% 85%" };
  var VARIANTS = ["btn--light", "btn--outline", "btn--solid", "btn--line"];
  var ALIGN = { left: 1, center: 1, right: 1 };

  var api = {
    page: PAGE,
    mode: mode,
    uploads: {},
    colors: COLORS,
    fills: FILLS,
    variants: VARIANTS
  };

  function own(el) { return el.hasAttribute("data-cms-added") || el.hasAttribute("data-cms-cell") || el.hasAttribute("data-cms-ui"); }
  function num(v) { return typeof v === "number" && isFinite(v); }
  function norm(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

  function index(root, prefix) {
    var counts = {}, list = [];
    for (var c = root.firstElementChild; c; c = c.nextElementSibling) {
      if (SKIP[c.tagName] || own(c)) continue;
      var tag = c.tagName.toLowerCase();
      var n = counts[tag] || 0;
      counts[tag] = n + 1;
      var key = c.id ? "#" + c.id : prefix + "/" + tag + ":" + n;
      keyOf.set(c, key);
      byKey.set(key, c);
      list.push(key);
      if (tag !== "svg") index(c, key);
    }
    kids.set(root, list);
  }

  // Elements a page script adds after load have no stored key, so theirs is worked out from where they are now.
  function keyFor(el) {
    if (!el || el.nodeType !== 1) return null;
    if (el.hasAttribute("data-cms-added") || el.hasAttribute("data-cms-cell")) return el.id;
    if (keyOf.has(el)) return keyOf.get(el);
    if (el === doc.body) return "";
    if (el.id) return "#" + el.id;
    var p = el.parentElement;
    if (!p || p === doc.documentElement) return null;
    var pk = keyFor(p);
    if (pk === null) return null;
    var n = 0;
    for (var c = p.firstElementChild; c && c !== el; c = c.nextElementSibling) {
      if (c.tagName === el.tagName && !own(c)) n++;
    }
    return pk + "/" + el.tagName.toLowerCase() + ":" + n;
  }

  function find(key) { return added.get(key) || byKey.get(key) || null; }

  // Links and image sources: web addresses, page paths, anchors, mailto and tel. Anything else (javascript: and so on) is dropped.
  function safeUrl(u, img) {
    u = String(u == null ? "" : u).trim();
    if (!u) return "";
    if (/^upload:/.test(u)) return img ? api.uploads[u.slice(7)] || "" : "";
    if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(u)) return img ? u : "";
    if (/^(https?:|mailto:|tel:)/i.test(u)) return img && !/^https?:/i.test(u) ? "" : u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return "";
    return u;
  }

  var INLINE = { B: 1, STRONG: 1, I: 1, EM: 1, BR: 1, SPAN: 1, A: 1, SMALL: 1, CODE: 1, MARK: 1, SUB: 1, SUP: 1 };
  var DROP = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, SVG: 1, svg: 1, MATH: 1, TEMPLATE: 1 };
  // Text from the editor keeps line breaks, bold, italic, links and styled spans; other markup is reduced to its text.
  function clean(html) {
    var t = doc.createElement("template");
    t.innerHTML = String(html == null ? "" : html);
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) return;
        if (n.nodeType !== 1 || DROP[n.tagName]) { n.remove(); return; }
        walk(n);
        if (!INLINE[n.tagName]) {
          var frag = doc.createDocumentFragment();
          if (/^(DIV|P|LI|H[1-6])$/.test(n.tagName) && n.previousSibling) frag.appendChild(doc.createElement("br"));
          while (n.firstChild) frag.appendChild(n.firstChild);
          n.replaceWith(frag);
          return;
        }
        Array.prototype.slice.call(n.attributes).forEach(function (a) {
          var keep = (n.tagName === "SPAN" && a.name === "class" && /^[\w\s-]*$/.test(a.value)) ||
            (n.tagName === "A" && a.name === "href" && safeUrl(a.value) !== "") ||
            (n.tagName === "A" && a.name === "target" && a.value === "_blank");
          if (!keep) n.removeAttribute(a.name);
        });
        if (n.tagName === "A" && n.getAttribute("target")) n.setAttribute("rel", "noopener");
      });
    })(t.content);
    return t.innerHTML.replace(/(<br>)+$/, "");
  }

  function fluid(n) {
    return n <= 20 ? n + "px" : "clamp(" + Math.max(20, Math.round(n * 0.6)) + "px, " + (n / 12.8).toFixed(2) + "vw, " + n + "px)";
  }

  function styleOf(p) {
    var o = {};
    if (typeof p.w === "string" && /^\d+(\.\d+)?(px|%)$/.test(p.w)) { o.width = p.w; o["max-width"] = "100%"; }
    if (num(p.h)) o.height = p.h + "px";
    if (num(p.fs)) o["font-size"] = fluid(p.fs);
    if (num(p.fw)) o["font-weight"] = String(p.fw);
    if (COLORS[p.color]) o.color = COLORS[p.color];
    if (FILLS[p.bg]) o.background = FILLS[p.bg];
    if (num(p.radius)) o["border-radius"] = p.radius + "px";
    if (num(p.pad)) o.padding = p.pad + "px";
    if (num(p.mt)) o["margin-top"] = p.mt + "px";
    if (num(p.mb)) o["margin-bottom"] = p.mb + "px";
    if (ALIGN[p.align]) o["text-align"] = p.align;
    return o;
  }

  // Remember the original state the first time a change touches an element, so reset() can put it back.
  function remember(el) {
    var r = touched.get(el);
    if (!r) { r = { style: el.getAttribute("style"), content: null, attrs: {} }; touched.set(el, r); }
    return r;
  }
  function rememberContent(el) { var r = remember(el); if (!r.content) r.content = el.cloneNode(true); }
  function rememberAttr(el, name) { var r = remember(el); if (!(name in r.attrs)) r.attrs[name] = el.getAttribute(name); }
  function snapshot(box) { if (!snaps.has(box)) snaps.set(box, Array.prototype.slice.call(box.childNodes)); }

  function textNodes(el) {
    var direct = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
    if (direct.length) return direct;
    var out = [], w = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.textContent.trim()) out.push(w.currentNode);
    return out;
  }
  function setLabel(el, text) {
    var nodes = textNodes(el);
    if (!nodes.length) { el.appendChild(doc.createTextNode(text)); return; }
    nodes[0].textContent = text;
    nodes.slice(1).forEach(function (n) { n.textContent = ""; });
  }

  function initials() {
    var name = (window.PORTFOLIO && window.PORTFOLIO.name) || "";
    return name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2);
  }

  // Applies one change to an element. Built-in elements are remembered first; blocks from the editor are rebuilt each time.
  function decorate(el, p, isAdded) {
    var hasAttr = function (name) { if (!isAdded) rememberAttr(el, name); };
    if (!isAdded) remember(el);
    if (p.hidden) { hasAttr("data-cms-hidden"); el.setAttribute("data-cms-hidden", ""); }
    if (p.only === "desktop" || p.only === "phone") { hasAttr("data-cms-only"); el.setAttribute("data-cms-only", p.only); }

    var type = isAdded ? el.getAttribute("data-cms-added") : "";
    var link = el.tagName === "A" ? el : type === "button" ? el.querySelector("a") : null;

    if (p.html != null && !isAdded) { rememberContent(el); el.innerHTML = clean(p.html); }
    if (link) {
      if (p.href != null) {
        if (!isAdded) rememberAttr(link, "href");
        var u = safeUrl(p.href);
        if (u) link.setAttribute("href", u); else link.removeAttribute("href");
      }
      if (p.newTab != null) {
        if (!isAdded) { rememberAttr(link, "target"); rememberAttr(link, "rel"); }
        if (p.newTab) { link.setAttribute("target", "_blank"); link.setAttribute("rel", "noopener"); }
        else { link.removeAttribute("target"); link.removeAttribute("rel"); }
      }
      if (p.variant && VARIANTS.indexOf("btn--" + p.variant) > -1 && link.classList.contains("btn")) {
        if (!isAdded) rememberAttr(link, "class");
        VARIANTS.forEach(function (v) { link.classList.remove(v); });
        link.classList.add("btn--" + p.variant);
      }
    }

    if (el.tagName === "IMG") {
      if (p.src != null) {
        var s = safeUrl(p.src, true);
        if (s) { rememberAttr(el, "src"); rememberAttr(el, "srcset"); el.setAttribute("src", s); el.removeAttribute("srcset"); }
      }
      if (p.alt != null) { rememberAttr(el, "alt"); el.setAttribute("alt", p.alt); }
      if (p.fit || num(p.h)) el.style.setProperty("object-fit", p.fit === "contain" ? "contain" : "cover");
      if (POS[p.pos]) el.style.setProperty("object-position", POS[p.pos]);
    }

    if (el.hasAttribute("data-cms-photo") && p.src != null) {
      rememberContent(el);
      var src = safeUrl(p.src, true);
      el.textContent = "";
      if (src) {
        var img = doc.createElement("img");
        img.src = src; img.alt = p.alt || ""; img.width = 224; img.height = 186; img.draggable = false;
        if (POS[p.pos]) img.style.objectPosition = POS[p.pos];
        el.appendChild(img);
      } else {
        var sp = doc.createElement("span");
        sp.className = "badge__initials"; sp.setAttribute("aria-hidden", "true"); sp.textContent = initials();
        el.appendChild(sp);
      }
    }

    var css = styleOf(p);
    // On an added button, size, type and fill belong to the button itself; the wrapper keeps alignment and spacing.
    if (type === "button" && link) {
      ["width", "max-width", "height", "font-size", "font-weight", "color", "background", "border-radius", "padding"].forEach(function (k) {
        if (k in css) { link.style.setProperty(k, css[k]); delete css[k]; }
      });
    }
    if (ALIGN[p.align]) {
      var cs = getComputedStyle(el), inline = /^inline/.test(cs.display);
      if (inline && !isAdded) {
        css.display = cs.display === "inline-flex" ? "flex" : cs.display === "inline-grid" ? "grid" : "block";
        if (!css.width) css.width = "fit-content";
      }
      if (inline || css.width || /^(image|shape|columns)$/.test(type)) {
        css["margin-left"] = p.align === "left" ? "0" : "auto";
        css["margin-right"] = p.align === "right" ? "0" : "auto";
      }
    }
    Object.keys(css).forEach(function (k) { el.style.setProperty(k, css[k]); });
  }

  function mk(tag, cls) { var e = doc.createElement(tag); if (cls) e.className = cls; return e; }

  // Blocks added in the editor: text, button, image, shape and columns.
  function build(id, b) {
    var el, t = b.type;
    if (t === "text") {
      var tag = b.tag === "h2" || b.tag === "h3" ? b.tag : "p";
      el = mk(tag, "cms-text cms-text--" + (b.tag === "label" ? "label" : tag) + (tag === "h2" ? " title" : ""));
      el.innerHTML = clean(b.html);
    } else if (t === "button") {
      el = mk("div", "cms-btnwrap");
      var a = mk("a", "btn btn--" + (VARIANTS.indexOf("btn--" + b.variant) > -1 ? b.variant : "solid"));
      a.textContent = b.label || "";
      el.appendChild(a);
    } else if (t === "image") {
      el = mk("div", "cms-img");
      var src = safeUrl(b.src, true);
      if (src) {
        var img = mk("img");
        img.src = src;
        img.alt = b.alt || "";
        img.style.objectFit = b.fit === "contain" ? "contain" : "cover";
        if (POS[b.pos]) img.style.objectPosition = POS[b.pos];
        if (num(b.h)) img.style.height = "100%";
        el.appendChild(img);
      } else {
        el.setAttribute("data-cms-empty", "");
      }
    } else if (t === "shape") {
      el = mk("div", "cms-shape");
      el.setAttribute("aria-hidden", "true");
    } else if (t === "columns") {
      el = mk("div", "cms-cols");
      var n = b.cols === 3 ? 3 : 2;
      el.style.gridTemplateColumns = "repeat(" + n + ", minmax(0, 1fr))";
      if (num(b.gap)) el.style.gap = b.gap + "px";
      for (var i = 0; i < n; i++) {
        var cell = mk("div", "cms-col");
        cell.id = id + "-c" + i;
        cell.setAttribute("data-cms-cell", "");
        el.appendChild(cell);
        added.set(cell.id, cell);
      }
    } else {
      return null;
    }
    el.id = id;
    el.classList.add("cms-block");
    el.setAttribute("data-cms-added", t);
    added.set(id, el);
    decorate(el, b, true);
    return el;
  }

  function fingerprint(el) {
    if (el.tagName === "IMG") return el.getAttribute("src") || "";
    if (el.hasAttribute("data-cms-photo")) return null;
    return norm(el.textContent).slice(0, 80);
  }

  // Puts the page back the way it was built, before any change.
  function reset() {
    added.forEach(function (el) { el.remove(); });
    added.clear();
    snaps.forEach(function (nodes, box) { nodes.forEach(function (n) { box.appendChild(n); }); });
    snaps.clear();
    touched.forEach(function (r, el) {
      if (r.content) {
        el.replaceChildren.apply(el, Array.prototype.slice.call(r.content.cloneNode(true).childNodes));
        index(el, keyOf.get(el) || "");
      }
      if (r.style === null) el.removeAttribute("style"); else el.setAttribute("style", r.style);
      Object.keys(r.attrs).forEach(function (a) {
        if (r.attrs[a] === null) el.removeAttribute(a); else el.setAttribute(a, r.attrs[a]);
      });
      el.removeAttribute("data-cms-hidden");
      el.removeAttribute("data-cms-only");
    });
    touched.clear();
  }

  // Applies one page's changes: { nodes: {key: change}, added: {id: block}, order: {containerKey: [childKeys]} }.
  // Returns the keys it could not find and the changes it skipped because the content they were made on has changed.
  function apply(pd) {
    var out = { missing: [], stale: [] };
    if (!pd) return out;
    var nodes = pd.nodes || {}, skip = {};
    Object.keys(nodes).forEach(function (k) {
      var el = find(k), p = nodes[k];
      if (!el) { out.missing.push(k); skip[k] = 1; return; }
      if (p.was != null) {
        var f = fingerprint(el);
        if (f !== null && f !== p.was) { out.stale.push(k); skip[k] = 1; }
      }
    });
    Object.keys(pd.added || {}).forEach(function (id) {
      try { build(id, pd.added[id]); } catch (e) { console.error("Couldn't build " + id, e); }
    });
    Object.keys(pd.order || {}).forEach(function (ck) {
      var box = find(ck);
      if (!box) { out.missing.push(ck); return; }
      snapshot(box);
      (pd.order[ck] || []).forEach(function (k) {
        var el = find(k);
        if (!el) { if (k.indexOf("cms-") !== 0) out.missing.push(k); return; }
        if (el === box || el.contains(box)) return;
        if (el.parentNode && !own(el)) snapshot(el.parentNode);
        box.appendChild(el);
      });
    });
    Object.keys(nodes).forEach(function (k) {
      if (skip[k]) return;
      try { decorate(find(k), nodes[k], false); } catch (e) { console.error("Couldn't apply the change to " + k, e); }
    });
    return out;
  }

  api.index = function () { index(doc.body, ""); };
  api.key = keyFor;
  api.el = find;
  api.originalKids = function (box) { return kids.get(box) || null; };
  api.clean = clean;
  api.safeUrl = safeUrl;
  api.fluid = fluid;
  api.reset = reset;
  api.apply = apply;
  api.fingerprint = fingerprint;
  api.remember = function (el) { rememberContent(el); };
  api.original = function (el) { var r = touched.get(el); return r && r.content ? r.content.innerHTML : el.innerHTML; };
  api.labelOf = function (el) { return norm(textNodes(el).map(function (n) { return n.textContent; }).join(" ")); };
  api.setLabel = setLabel;
  window.CMS = api;

  api.index();

  function readDraft(done) {
    try {
      var req = indexedDB.open("portfolio-cms", 1);
      req.onupgradeneeded = function () { req.result.createObjectStore("kv"); };
      req.onerror = function () { done(null); };
      req.onsuccess = function () {
        try {
          var get = req.result.transaction("kv").objectStore("kv").get("draft");
          get.onsuccess = function () { done(get.result || null); };
          get.onerror = function () { done(null); };
        } catch (e) { done(null); }
      };
    } catch (e) { done(null); }
  }

  function previewBar(text) {
    var bar = mk("div", "cms-preview-bar");
    bar.setAttribute("data-cms-ui", "");
    bar.setAttribute("role", "status");
    bar.innerHTML = "<span></span> <a href=\"admin.html\">Back to the editor</a>";
    bar.firstChild.textContent = text;
    doc.body.appendChild(bar);
  }

  if (mode === "edit") {
    doc.documentElement.setAttribute("data-cms-mode", "edit");
    return;
  }
  if (mode === "preview") {
    readDraft(function (d) {
      var pd = d && d.doc && d.doc.pages && d.doc.pages[PAGE];
      if (!d) { previewBar("No draft found on this browser, so this is the published page."); return; }
      api.uploads = d.uploads || {};
      try { apply(pd); previewBar("Draft preview. Visitors still see the published page until you publish."); }
      catch (e) { reset(); previewBar("The draft couldn't be shown, so this is the published page."); console.error(e); }
    });
    return;
  }
  var pub = window.PORTFOLIO_EDITS;
  if (pub && pub.pages && pub.pages[PAGE]) {
    try { apply(pub.pages[PAGE]); }
    catch (e) { console.error("Couldn't apply the published edits; showing the page without them.", e); reset(); }
  }
})();
