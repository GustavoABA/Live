(function () {
  "use strict";

  var cfg = window.OVERLAY_HUB_CONFIG || {};
  var nativeCfg = cfg.nativeAlerts || {};
  var seCfg = cfg.streamElements || {};
  var params = new URLSearchParams(window.location.search);

  var layer = document.getElementById("alert-layer");
  var card = document.getElementById("native-alert");
  var media = document.getElementById("native-alert-media");
  var image = document.getElementById("native-alert-image");
  var video = document.getElementById("native-alert-video");
  var audio = document.getElementById("native-alert-audio");
  var sourceEl = document.getElementById("native-alert-source");
  var titleEl = document.getElementById("native-alert-title");
  var messageEl = document.getElementById("native-alert-message");
  var amountEl = document.getElementById("native-alert-amount");
  var statusEl = document.getElementById("hub-status");

  if (!layer || !card) return;

  var endpoint = params.get("alertEndpoint") || params.get("endpoint") || nativeCfg.endpoint || "";
  var pollMs = Math.max(500, Number(params.get("alertPollMs") || nativeCfg.pollMs) || 800);
  var displayMs = Math.max(1800, Number(nativeCfg.displayMs) || 6500);
  var debugEnabled = params.get("debug") === "1" || cfg.debug === true;
  var maxQueue = Math.max(5, Number(nativeCfg.maxQueue) || 30);

  var queue = [];
  var playing = false;
  var lastSeq = Number(sessionStorage.getItem("nihilguhAlertSeq") || 0);
  var pollTimer = null;
  var ws = null;
  var reconnectTimer = null;
  var seen = Object.create(null);

  function debug(message) {
    if (!debugEnabled || !statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.add("is-visible");
  }

  function safeText(value) {
    return String(value == null ? "" : value).trim();
  }

  function formatMoney(amount, currency, amountInCents) {
    var n = Number(amount);
    if (!isFinite(n) || n <= 0) return "";
    if (amountInCents) n = n / 100;
    var code = safeText(currency || "BRL").toUpperCase();
    try {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: code }).format(n);
    } catch (e) {
      return code + " " + n.toFixed(2);
    }
  }

  function eventKey(event) {
    return safeText(event.id || event.activityId || event.seq || (event.source + ":" + event.type + ":" + event.name + ":" + event.timestamp));
  }

  function enqueue(event) {
    if (!event || typeof event !== "object") return;
    var key = eventKey(event);
    if (key && seen[key]) return;
    if (key) {
      seen[key] = Date.now();
      window.setTimeout(function () { delete seen[key]; }, 6 * 60 * 60 * 1000);
    }
    queue.push(event);
    if (queue.length > maxQueue) queue.splice(0, queue.length - maxQueue);
    drain();
  }

  function presentation(event) {
    var source = safeText(event.source || event.provider || "ALERTA").toUpperCase();
    var type = safeText(event.type || "event").toLowerCase();
    var name = safeText(event.name || event.username || event.displayName || "Alguem");
    var message = safeText(event.message || "");
    var title = name;

    if (source === "LIVEPIX") {
      if (type === "subscription") title = name + " virou assinante!";
      else if (type === "payment") title = "Novo PIX recebido!";
      else title = name + " mandou um PIX!";
    } else {
      if (type === "follow" || type === "follower") title = name + " seguiu a live!";
      else if (type === "subscriber" || type === "sponsor" || type === "subscription") title = name + " virou membro!";
      else if (type === "superchat") title = name + " mandou Super Chat!";
      else if (type === "cheer") title = name + " mandou bits!";
      else if (type === "raid") title = name + " chegou com uma raid!";
      else if (type === "tip") title = name + " fez uma doacao!";
    }

    var amount = event.amountFormatted || formatMoney(event.amount, event.currency, event.amountInCents === true);
    return {
      source: source,
      title: title,
      message: message,
      amount: amount,
      image: safeText(event.image || event.avatar || ""),
      video: safeText(event.video || ""),
      audio: safeText(event.audio || ""),
      durationMs: Math.max(1800, Number(event.durationMs) || displayMs)
    };
  }

  function resetMedia() {
    try { audio.pause(); } catch (e) {}
    try { video.pause(); } catch (e) {}
    audio.removeAttribute("src");
    video.removeAttribute("src");
    image.removeAttribute("src");
    media.classList.remove("has-image", "has-video");
  }

  function play(event) {
    return new Promise(function (resolve) {
      var p = presentation(event);
      resetMedia();

      sourceEl.textContent = p.source;
      titleEl.textContent = p.title;
      messageEl.textContent = p.message;
      amountEl.textContent = p.amount;

      if (p.video) {
        video.src = p.video;
        media.classList.add("has-video");
        video.play().catch(function () {});
      } else if (p.image) {
        image.src = p.image;
        media.classList.add("has-image");
      }

      if (p.audio) {
        audio.src = p.audio;
        audio.play().catch(function () {});
      }

      card.classList.remove("is-entering", "is-visible", "is-leaving");
      card.setAttribute("aria-hidden", "false");
      void card.offsetWidth;
      card.classList.add("is-entering");

      window.setTimeout(function () {
        card.classList.remove("is-entering");
        card.classList.add("is-visible");
      }, 620);

      window.setTimeout(function () {
        card.classList.remove("is-visible");
        card.classList.add("is-leaving");
      }, p.durationMs);

      window.setTimeout(function () {
        card.classList.remove("is-leaving");
        card.setAttribute("aria-hidden", "true");
        resetMedia();
        resolve();
      }, p.durationMs + 520);
    });
  }

  function drain() {
    if (playing || queue.length === 0) return;
    playing = true;
    play(queue.shift()).then(function () {
      playing = false;
      drain();
    });
  }

  function jsonp(url, query, onSuccess, onError) {
    var cb = "__nihilguhAlert_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
    var script = document.createElement("script");
    var finished = false;
    function cleanup() {
      if (finished) return;
      finished = true;
      try { delete window[cb]; } catch (e) { window[cb] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    window[cb] = function (data) { cleanup(); onSuccess(data); };
    script.onerror = function () { cleanup(); if (onError) onError(); };
    var parts = [];
    Object.keys(query || {}).forEach(function (key) {
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(query[key]));
    });
    parts.push("callback=" + encodeURIComponent(cb));
    parts.push("_=" + Date.now());
    script.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + parts.join("&");
    document.head.appendChild(script);
    window.setTimeout(function () {
      if (!finished) { cleanup(); if (onError) onError(); }
    }, 5000);
  }

  function pollBackend() {
    if (!endpoint) return;
    jsonp(endpoint, { action: "alerts", after: lastSeq }, function (data) {
      if (data && data.ok && Array.isArray(data.events)) {
        data.events.forEach(function (event) {
          if (Number(event.seq) > lastSeq) lastSeq = Number(event.seq);
          enqueue(event);
        });
        if (Number(data.latestSeq) > lastSeq) lastSeq = Number(data.latestSeq);
        sessionStorage.setItem("nihilguhAlertSeq", String(lastSeq));
      }
      pollTimer = window.setTimeout(pollBackend, pollMs);
    }, function () {
      debug("Falha ao buscar alertas do backend");
      pollTimer = window.setTimeout(pollBackend, Math.max(1800, pollMs * 2));
    });
  }

  function normalizeSEActivity(payload) {
    var data = payload && payload.data ? payload.data : payload;
    if (!data) return null;
    var detail = data.data || {};
    var type = safeText(data.type || "event");
    var provider = safeText(data.provider || "streamelements");
    return {
      id: safeText(data.activityId || data._id || payload.id || (provider + ":" + Date.now())),
      source: provider,
      provider: provider,
      type: type,
      name: safeText(detail.displayName || detail.username || detail.name || "Alguem"),
      message: safeText(detail.message || detail.text || ""),
      avatar: safeText(detail.avatar || ""),
      amount: detail.amount != null ? detail.amount : (data.amount != null ? data.amount : ""),
      currency: safeText(detail.currency || data.currency || ""),
      timestamp: Date.now()
    };
  }

  function connectStreamElements() {
    var room = params.get("seRoom") || seCfg.channelId || "";
    var token = params.get("seToken") || seCfg.token || "";
    var tokenType = params.get("seTokenType") || seCfg.tokenType || "jwt";
    var enabled = params.get("se") === "1" || seCfg.enabled === true || (!!room && !!token);
    if (!enabled || !room || !token) return;

    try { if (ws) ws.close(); } catch (e) {}
    ws = new WebSocket("wss://astro.streamelements.com/");
    ws.onopen = function () { debug("StreamElements conectado"); };
    ws.onmessage = function (evt) {
      var message;
      try { message = JSON.parse(evt.data); } catch (e) { return; }
      if (message.type === "welcome") {
        ws.send(JSON.stringify({
          type: "subscribe",
          nonce: "nihilguh-" + Date.now(),
          data: { topic: "channel.activities", room: room, token: token, token_type: tokenType }
        }));
        return;
      }
      if (message.type === "message" && message.topic === "channel.activities") {
        var normalized = normalizeSEActivity(message);
        if (normalized) enqueue(normalized);
      }
    };
    ws.onerror = function () { debug("Erro no WebSocket do StreamElements"); };
    ws.onclose = function () {
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      reconnectTimer = window.setTimeout(connectStreamElements, 3000);
    };
  }

  function runDemo() {
    var demo = safeText(params.get("testAlert") || params.get("demo")).toLowerCase();
    if (!demo) return;
    if (demo === "livepix" || demo === "1") {
      enqueue({
        id: "demo-livepix-" + Date.now(),
        source: "LIVEPIX",
        type: "message",
        name: "Guh",
        message: "Esse alerta agora e renderizado pelo nosso proprio hub.",
        amount: 10,
        currency: "BRL",
        amountInCents: false
      });
    } else if (demo === "follow") {
      enqueue({ id: "demo-follow-" + Date.now(), source: "TWITCH", type: "follow", name: "NovoSeguidor" });
    }
  }

  window.NIHIL_ALERT_HUB = {
    push: enqueue,
    test: function () { runDemo(); }
  };

  runDemo();
  pollBackend();
  connectStreamElements();

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (pollTimer) window.clearTimeout(pollTimer);
    } else if (endpoint) {
      if (pollTimer) window.clearTimeout(pollTimer);
      pollTimer = window.setTimeout(pollBackend, 100);
    }
  });
})();
