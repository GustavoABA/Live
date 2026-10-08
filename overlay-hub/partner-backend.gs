var LATEST_KEY = "OVERLAY_HUB_LATEST_EVENT";
var PARTNER_SEEN_KEY = "OVERLAY_HUB_PARTNER_SEEN";
var FOLLOW_SEEN_KEY = "OVERLAY_HUB_FOLLOW_SEEN";
var DEFAULT_PARTNER_COOLDOWN_MINUTES = 180;
var DEFAULT_FOLLOW_COOLDOWN_MINUTES = 10;

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = String(params.action || "health").toLowerCase();

  if (action === "partner") {
    return registerPartner_(params);
  }

  if (action === "follow") {
    return registerFollow_(params);
  }

  if (action === "latest") {
    return getLatestEvent_(params);
  }

  return output_(params.callback, {
    ok: true,
    service: "nihilguh-overlay-hub",
    actions: ["partner", "follow", "latest"],
    now: Date.now()
  });
}

function requireWriteToken_(params) {
  var properties = PropertiesService.getScriptProperties();
  var expectedToken = properties.getProperty("WRITE_TOKEN");

  if (!expectedToken) {
    return { ok: false, error: "WRITE_TOKEN_NOT_CONFIGURED" };
  }

  if (String(params.token || "") !== expectedToken) {
    return { ok: false, error: "INVALID_TOKEN" };
  }

  return { ok: true, properties: properties };
}

function registerPartner_(params) {
  var auth = requireWriteToken_(params);
  if (!auth.ok) return output_(null, auth);

  var properties = auth.properties;
  var nick = clean_(params.nick, 64);
  if (!nick) {
    return output_(null, { ok: false, error: "NICK_REQUIRED" });
  }

  var name = clean_(params.name, 80) || nick;
  var platform = clean_(params.platform, 32) || "UNKNOWN";
  var avatar = clean_(params.avatar, 1000);
  var now = Date.now();
  var cooldownMinutes = Number(properties.getProperty("PARTNER_COOLDOWN_MINUTES"));

  if (!isFinite(cooldownMinutes) || cooldownMinutes < 0) {
    cooldownMinutes = DEFAULT_PARTNER_COOLDOWN_MINUTES;
  }

  var result = registerWithCooldown_({
    properties: properties,
    seenKey: PARTNER_SEEN_KEY,
    cooldownMs: cooldownMinutes * 60 * 1000,
    dedupeKey: (platform + ":" + nick).toLowerCase(),
    event: {
      id: "partner-" + now + "-" + Utilities.getUuid().slice(0, 8),
      type: "partner",
      nick: nick,
      name: name,
      platform: platform.toUpperCase(),
      avatar: avatar,
      timestamp: now
    }
  });

  return output_(null, result);
}

function registerFollow_(params) {
  var auth = requireWriteToken_(params);
  if (!auth.ok) return output_(null, auth);

  var properties = auth.properties;
  var nick = clean_(params.nick, 64);
  if (!nick) {
    return output_(null, { ok: false, error: "NICK_REQUIRED" });
  }

  var name = clean_(params.name, 80) || nick;
  var platform = (clean_(params.platform, 32) || "TIKTOK").toUpperCase();
  var avatar = clean_(params.avatar, 1000);
  var sourceId = clean_(params.sourceId, 180);
  var now = Date.now();
  var cooldownMinutes = Number(properties.getProperty("FOLLOW_COOLDOWN_MINUTES"));

  if (!isFinite(cooldownMinutes) || cooldownMinutes < 0) {
    cooldownMinutes = DEFAULT_FOLLOW_COOLDOWN_MINUTES;
  }

  // Se o Casterlabs fornecer um identificador estavel, ele e preferido para
  // deduplicacao. Caso contrario, usuario + plataforma evita alertas repetidos
  // durante reconexoes do TikTok.
  var dedupeKey = sourceId ? (platform + ":" + sourceId) : (platform + ":" + nick);

  var result = registerWithCooldown_({
    properties: properties,
    seenKey: FOLLOW_SEEN_KEY,
    cooldownMs: cooldownMinutes * 60 * 1000,
    dedupeKey: dedupeKey.toLowerCase(),
    event: {
      id: "follow-" + now + "-" + Utilities.getUuid().slice(0, 8),
      type: "follow",
      nick: nick,
      name: name,
      platform: platform,
      avatar: avatar,
      sourceId: sourceId,
      timestamp: now
    }
  });

  return output_(null, result);
}

function registerWithCooldown_(options) {
  var properties = options.properties;
  var cooldownMs = Math.max(0, Number(options.cooldownMs) || 0);
  var now = Date.now();
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(3000);

    var seen = parseJson_(properties.getProperty(options.seenKey), {});
    var lastSeen = Number(seen[options.dedupeKey] || 0);

    if (cooldownMs > 0 && lastSeen && (now - lastSeen) < cooldownMs) {
      return {
        ok: true,
        duplicate: true,
        nick: options.event.nick,
        retryAfterMs: cooldownMs - (now - lastSeen)
      };
    }

    Object.keys(seen).forEach(function (seenKey) {
      if ((now - Number(seen[seenKey] || 0)) > Math.max(cooldownMs * 4, 24 * 60 * 60 * 1000)) {
        delete seen[seenKey];
      }
    });

    seen[options.dedupeKey] = now;
    properties.setProperty(options.seenKey, JSON.stringify(seen));
    properties.setProperty(LATEST_KEY, JSON.stringify(options.event));

    return { ok: true, duplicate: false, event: options.event };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function getLatestEvent_(params) {
  var properties = PropertiesService.getScriptProperties();
  var event = parseJson_(properties.getProperty(LATEST_KEY), null);

  // Compatibilidade com implantacoes antigas, antes de LATEST_KEY virar generico.
  if (!event) {
    event = parseJson_(properties.getProperty("OVERLAY_HUB_LATEST_PARTNER"), null);
    if (event && !event.type) event.type = "partner";
  }

  return output_(params.callback, {
    ok: true,
    event: event,
    now: Date.now()
  });
}

function clean_(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function parseJson_(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function output_(callback, payload) {
  var json = JSON.stringify(payload);
  var safeCallback = String(callback || "");

  if (/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(safeCallback)) {
    return ContentService
      .createTextOutput(safeCallback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
