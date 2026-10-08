(function () {
  "use strict";

  var cfg = window.OVERLAY_HUB_CONFIG || {};
  var overlayHost = document.getElementById("external-overlays");
  var partnerLayer = document.getElementById("partner-layer");
  var partnerCard = document.getElementById("partner-card");
  var partnerName = document.getElementById("partner-name");
  var partnerMeta = document.getElementById("partner-meta");
  var partnerAvatar = document.getElementById("partner-avatar");
  var statusEl = document.getElementById("hub-status");

  var params = new URLSearchParams(window.location.search);
  var debugEnabled = params.get("debug") === "1" || cfg.debug === true;
  var whiteKeyEnabled = params.get("whiteKey") !== "0";
  var onlyIds = String(params.get("only") || "")
    .split(",")
    .map(function (value) { return value.trim().toLowerCase(); })
    .filter(Boolean);
  var excludedIds = String(params.get("exclude") || "")
    .split(",")
    .map(function (value) { return value.trim().toLowerCase(); })
    .filter(Boolean);

  var partnerCfg = cfg.partner || {};
  var endpoint = params.get("endpoint") || partnerCfg.endpoint || "";
  var pollMs = Math.max(600, Number(partnerCfg.pollMs) || 1000);
  var visibleMs = Math.max(1500, Number(partnerCfg.visibleMs) || 6000);
  var dedupeMs = Math.max(0, Number(partnerCfg.dedupeMs) || 0);

  var lastEventId = null;
  var recentPartners = Object.create(null);
  var queue = [];
  var isAnimating = false;
  var pollTimer = null;

  function debug(message) {
    if (!debugEnabled || !statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.add("is-visible");
  }

  function shouldMount(item) {
    var id = String(item && item.id || "").trim().toLowerCase();
    if (!id) return true;
    if (onlyIds.length && onlyIds.indexOf(id) === -1) return false;
    if (excludedIds.indexOf(id) !== -1) return false;
    return true;
  }

  function mountExternalOverlays() {
    if (!overlayHost) return;
    overlayHost.replaceChildren();

    if (cfg.embedExternal === false) {
      debug("Carregamento de alertboxes desativado no config.js");
      return;
    }

    var overlays = Array.isArray(cfg.overlays) ? cfg.overlays : [];
    var mounted = 0;

    overlays.forEach(function (item, index) {
      if (!item || item.enabled === false || !item.url || !shouldMount(item)) return;

      // Cada alertbox e carregado como documento HTML embutido por <object>,
      // ocupando o mesmo canvas e empilhado por z-index.
      var object = document.createElement("object");
      object.className = "external-overlay";
      object.dataset.overlayId = item.id || String(index);
      object.type = "text/html";
      object.data = item.url;
      object.title = item.label || item.id || ("Alertbox " + (index + 1));
      object.style.zIndex = String(Number(item.zIndex) || (index + 1));
      object.style.background = "transparent";
      object.style.backgroundColor = "rgba(0,0,0,0)";

      // Alguns provedores (ex.: LivePix) pintam o documento embutido de branco.
      // Nao podemos alterar o CSS interno por ser cross-origin, entao removemos
      // apenas pixels quase brancos no resultado final do <object>.
      if (whiteKeyEnabled && item.whiteKey === true) {
        object.style.filter = "url(#white-key)";
        object.style.webkitFilter = "url(#white-key)";
        object.dataset.whiteKey = "true";
      }

      object.setAttribute("aria-hidden", "true");
      object.tabIndex = -1;

      var fallback = document.createElement("span");
      fallback.hidden = true;
      fallback.textContent = item.label || item.id || "Alertbox";
      object.appendChild(fallback);

      overlayHost.appendChild(object);
      mounted += 1;
    });

    debug("Alertboxes carregados: " + mounted);
  }

  function normalizePartner(payload) {
    if (!payload || typeof payload !== "object") return null;
    var nick = String(payload.nick || payload.username || "").trim();
    if (!nick) return null;

    return {
      id: String(payload.id || (Date.now() + ":" + nick)),
      nick: nick,
      name: String(payload.name || payload.displayname || nick).trim(),
      platform: String(payload.platform || "COMUNIDADE").trim().toUpperCase(),
      avatar: String(payload.avatar || "").trim(),
      timestamp: Number(payload.timestamp) || Date.now()
    };
  }

  function partnerKey(partner) {
    return (partner.platform + ":" + partner.nick).toLowerCase();
  }

  function enqueuePartner(payload) {
    var partner = normalizePartner(payload);
    if (!partner || partner.id === lastEventId) return;
    lastEventId = partner.id;

    var key = partnerKey(partner);
    var now = Date.now();
    var lastSeen = recentPartners[key] || 0;
    if (dedupeMs && (now - lastSeen) < dedupeMs) return;

    recentPartners[key] = now;
    queue.push(partner);
    drainQueue();
  }

  function setAvatar(url) {
    if (!partnerAvatar) return;
    partnerAvatar.classList.remove("is-ready");
    partnerAvatar.removeAttribute("src");
    if (!url) return;

    partnerAvatar.onload = function () {
      partnerAvatar.classList.add("is-ready");
    };
    partnerAvatar.onerror = function () {
      partnerAvatar.classList.remove("is-ready");
      partnerAvatar.removeAttribute("src");
    };
    partnerAvatar.src = url;
  }

  function showPartner(partner) {
    return new Promise(function (resolve) {
      if (!partnerCard || !partnerLayer || !partnerName || !partnerMeta) {
        resolve();
        return;
      }

      partnerName.textContent = partner.name.charAt(0) === "@" ? partner.name : ("@" + partner.name);
      partnerMeta.textContent = partner.platform + " · COMUNIDADE NIHILGUH";
      setAvatar(partner.avatar);

      partnerCard.classList.remove("is-entering", "is-visible", "is-leaving");
      partnerLayer.classList.remove("is-active");
      partnerCard.setAttribute("aria-hidden", "false");
      void partnerCard.offsetWidth;
      partnerLayer.classList.add("is-active");
      partnerCard.classList.add("is-entering");

      window.setTimeout(function () {
        partnerCard.classList.remove("is-entering");
        partnerCard.classList.add("is-visible");
      }, 700);

      window.setTimeout(function () {
        partnerCard.classList.remove("is-visible");
        partnerCard.classList.add("is-leaving");
      }, visibleMs);

      window.setTimeout(function () {
        partnerCard.classList.remove("is-leaving");
        partnerLayer.classList.remove("is-active");
        partnerCard.setAttribute("aria-hidden", "true");
        resolve();
      }, visibleMs + 560);
    });
  }

  function drainQueue() {
    if (isAnimating || queue.length === 0) return;
    isAnimating = true;
    var next = queue.shift();
    showPartner(next).then(function () {
      isAnimating = false;
      drainQueue();
    });
  }

  function jsonp(url, onSuccess, onError) {
    var callbackName = "__nihilPartner_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
    var script = document.createElement("script");
    var finished = false;

    function cleanup() {
      if (finished) return;
      finished = true;
      try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = function (data) {
      cleanup();
      onSuccess(data);
    };

    script.onerror = function () {
      cleanup();
      if (onError) onError();
    };

    var separator = url.indexOf("?") >= 0 ? "&" : "?";
    script.src = url + separator + "action=latest&callback=" + encodeURIComponent(callbackName) + "&_=" + Date.now();
    document.head.appendChild(script);

    window.setTimeout(function () {
      if (!finished) {
        cleanup();
        if (onError) onError();
      }
    }, Math.min(5000, Math.max(2000, pollMs * 3)));
  }

  function poll() {
    if (!endpoint) return;
    jsonp(
      endpoint,
      function (data) {
        if (data && data.ok && data.event) enqueuePartner(data.event);
        pollTimer = window.setTimeout(poll, pollMs);
      },
      function () {
        pollTimer = window.setTimeout(poll, Math.max(2000, pollMs * 2));
      }
    );
  }

  function runQueryTest() {
    var testNick = params.get("partner") || params.get("testPartner");
    if (!testNick) return;
    enqueuePartner({
      id: "query-test-" + Date.now(),
      nick: testNick,
      name: params.get("name") || testNick,
      platform: params.get("platform") || "TWITCH",
      avatar: params.get("avatar") || "",
      timestamp: Date.now()
    });
  }

  function init() {
    mountExternalOverlays();
    runQueryTest();
    poll();
  }

  init();
})();
