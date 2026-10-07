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
  var directId = String(params.get("direct") || "").trim().toLowerCase();

  // Por padrao os widgets externos ficam ATIVOS. Use ?embedExternal=0 apenas para desligar todos.
  var embedExternalParam = params.get("embedExternal");
  var embedExternal = embedExternalParam === null
    ? cfg.embedExternal !== false
    : embedExternalParam !== "0";

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

  function getConfiguredOverlays() {
    return Array.isArray(cfg.overlays) ? cfg.overlays : [];
  }

  function runDirectOverlay() {
    if (!directId) return false;

    var overlays = getConfiguredOverlays();
    var item = overlays.find(function (overlay) {
      return String(overlay && overlay.id || "").trim().toLowerCase() === directId;
    });

    if (!item || item.enabled === false || !item.url) {
      debug("Overlay direto nao encontrado: " + directId);
      return false;
    }

    // IMPORTANTE: navega o Browser Source para o widget como documento principal,
    // exatamente como quando a URL do provedor e colocada diretamente no OBS.
    // Isto evita as limitacoes de widgets executados dentro de iframe.
    window.location.replace(item.url);
    return true;
  }

  function shouldMountOverlay(item) {
    var id = String(item && item.id || "").trim().toLowerCase();
    if (!id) return true;
    if (onlyIds.length && onlyIds.indexOf(id) === -1) return false;
    if (excludedIds.indexOf(id) !== -1) return false;
    return true;
  }

  function mountExternalOverlays() {
    if (!overlayHost) return;
    overlayHost.replaceChildren();

    if (!embedExternal) {
      debug("Overlays externos desativados por ?embedExternal=0");
      return;
    }

    var overlays = getConfiguredOverlays();
    var mounted = 0;

    overlays.forEach(function (item, index) {
      if (!item || item.enabled === false || !item.url || !shouldMountOverlay(item)) return;

      var frame = document.createElement("iframe");
      frame.className = "external-overlay";
      frame.dataset.overlayId = item.id || String(index);
      frame.title = item.label || item.id || ("Overlay externo " + (index + 1));
      frame.src = item.url;
      frame.style.zIndex = String(Number(item.zIndex) || (index + 1));
      frame.style.background = "transparent";
      frame.style.backgroundColor = "rgba(0,0,0,0)";
      frame.setAttribute("allow", "autoplay; fullscreen");
      frame.setAttribute("allowtransparency", "true");
      frame.setAttribute("scrolling", "no");
      frame.setAttribute("aria-hidden", "true");
      frame.setAttribute("loading", "eager");
      frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      frame.tabIndex = -1;
      overlayHost.appendChild(frame);
      mounted += 1;
    });

    debug("Overlays externos ativos: " + mounted);
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
    if (!partner) return;

    if (partner.id === lastEventId) return;
    lastEventId = partner.id;

    var key = partnerKey(partner);
    var now = Date.now();
    var lastSeen = recentPartners[key] || 0;

    if (dedupeMs && (now - lastSeen) < dedupeMs) {
      debug("Evento repetido ignorado: " + partner.name);
      return;
    }

    recentPartners[key] = now;
    queue.push(partner);
    drainQueue();
  }

  function setAvatar(url) {
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
    if (!endpoint) {
      debug("Sem endpoint. Use ?endpoint=URL_DO_APPS_SCRIPT ou configure config.js");
      return;
    }

    jsonp(
      endpoint,
      function (data) {
        if (data && data.ok && data.event) enqueuePartner(data.event);
        pollTimer = window.setTimeout(poll, pollMs);
      },
      function () {
        debug("Falha ao consultar o backend de parceiros. Tentando novamente...");
        pollTimer = window.setTimeout(poll, Math.max(2000, pollMs * 2));
      }
    );
  }

  function runQueryTest() {
    var testNick = params.get("partner") || params.get("testPartner");
    if (!testNick) return false;

    enqueuePartner({
      id: "query-test-" + Date.now(),
      nick: testNick,
      name: params.get("name") || testNick,
      platform: params.get("platform") || "TWITCH",
      avatar: params.get("avatar") || "",
      timestamp: Date.now()
    });

    return true;
  }

  function init() {
    // Modo de diagnostico: carrega um widget como documento principal, nao em iframe.
    // Ex.: ?direct=livepix-alert
    if (runDirectOverlay()) return;

    mountExternalOverlays();
    runQueryTest();
    poll();

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (pollTimer) window.clearTimeout(pollTimer);
      } else if (endpoint) {
        if (pollTimer) window.clearTimeout(pollTimer);
        pollTimer = window.setTimeout(poll, 150);
      }
    });
  }

  init();
})();
