var LATEST_KEY = "OVERLAY_HUB_LATEST_PARTNER";
var SEEN_KEY = "OVERLAY_HUB_PARTNER_SEEN";
var DEFAULT_COOLDOWN_MINUTES = 180;

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = String(params.action || "health").toLowerCase();

  if (action === "partner") {
    return registerPartner_(params);
  }

  if (action === "latest") {
    return getLatestPartner_(params);
  }

  return output_(params.callback, {
    ok: true,
    service: "nihilguh-overlay-hub",
    now: Date.now()
  });
}

function registerPartner_(params) {
  var properties = PropertiesService.getScriptProperties();
  var expectedToken = properties.getProperty("WRITE_TOKEN");

  if (!expectedToken) {
    return output_(null, { ok: false, error: "WRITE_TOKEN_NOT_CONFIGURED" });
  }

  if (String(params.token || "") !== expectedToken) {
    return output_(null, { ok: false, error: "INVALID_TOKEN" });
  }

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
    cooldownMinutes = DEFAULT_COOLDOWN_MINUTES;
  }

  var cooldownMs = cooldownMinutes * 60 * 1000;
  var key = (platform + ":" + nick).toLowerCase();
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(3000);

    var seen = parseJson_(properties.getProperty(SEEN_KEY), {});
    var lastSeen = Number(seen[key] || 0);

    if (cooldownMs > 0 && lastSeen && (now - lastSeen) < cooldownMs) {
      return output_(null, {
        ok: true,
        duplicate: true,
        nick: nick,
        retryAfterMs: cooldownMs - (now - lastSeen)
      });
    }

    Object.keys(seen).forEach(function (seenKey) {
      if ((now - Number(seen[seenKey] || 0)) > Math.max(cooldownMs * 4, 24 * 60 * 60 * 1000)) {
        delete seen[seenKey];
      }
    });

    seen[key] = now;

    var event = {
      id: now + "-" + Utilities.getUuid().slice(0, 8),
      nick: nick,
      name: name,
      platform: platform.toUpperCase(),
      avatar: avatar,
      timestamp: now
    };

    properties.setProperty(SEEN_KEY, JSON.stringify(seen));
    properties.setProperty(LATEST_KEY, JSON.stringify(event));

    return output_(null, { ok: true, duplicate: false, event: event });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function getLatestPartner_(params) {
  var properties = PropertiesService.getScriptProperties();
  var event = parseJson_(properties.getProperty(LATEST_KEY), null);

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
