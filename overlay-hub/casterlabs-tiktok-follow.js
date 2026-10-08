// Casterlabs Caffeinated
// Chat Bot > Shouts > TikTok > follows > execute
//
// Este script roda APENAS quando o Casterlabs recebe um evento FOLLOW.
// O AppChatbot do Casterlabs expõe o seguidor em event.follower.
//
// 1) Publique partner-backend.gs como Web App no Google Apps Script.
// 2) Configure WRITE_TOKEN nas Script Properties.
// 3) Cole a mesma URL /exec e o mesmo token abaixo.
// 4) No Overlay Hub/OBS, use a mesma URL /exec no parametro ?endpoint=...

var FOLLOW_WEBHOOK = "COLE_AQUI_A_URL_EXEC_DO_APPS_SCRIPT";
var FOLLOW_WRITE_TOKEN = "COLE_AQUI_SEU_WRITE_TOKEN";

var follower = event.follower || {};
var username = String(follower.username || "").trim();
var displayName = String(follower.displayname || follower.username || "").trim();
var platform = String(follower.platform || "").trim().toUpperCase();
var avatar = String(follower.image_link || "").trim();

// Proteção extra: mesmo configurando o Shout para TikTok, não deixa outro
// provedor chamar este alerta por engano.
if (platform === "TIKTOK" &&
    username.length > 0 &&
    FOLLOW_WEBHOOK.indexOf("http") === 0 &&
    FOLLOW_WRITE_TOKEN.indexOf("COLE_AQUI") !== 0) {

  var sourceId = String(
    follower.UPID ||
    follower.id ||
    (event.timestamp ? (event.timestamp + ":" + username) : username)
  );

  var url = FOLLOW_WEBHOOK +
    "?action=follow" +
    "&token=" + encodeURIComponent(FOLLOW_WRITE_TOKEN) +
    "&nick=" + encodeURIComponent(username) +
    "&name=" + encodeURIComponent(displayName || username) +
    "&platform=" + encodeURIComponent(platform) +
    "&avatar=" + encodeURIComponent(avatar) +
    "&sourceId=" + encodeURIComponent(sourceId);

  try {
    fetch.asText(url);
  } catch (e) {
    // O alerta visual não deve quebrar os outros Shouts do Casterlabs.
  }
}
