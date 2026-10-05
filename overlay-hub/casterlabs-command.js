// Casterlabs Caffeinated
// Chat Bot > Commands > Any Platform > sends a message > execute
//
// 1) Publique partner-backend.gs como Web App.
// 2) Cole a URL /exec abaixo.
// 3) Use o MESMO WRITE_TOKEN configurado nas Script Properties do Apps Script.
// 4) Troque a lista PARCEIROS pelos nicks reais.

var PARTNER_WEBHOOK = "COLE_AQUI_A_URL_EXEC_DO_APPS_SCRIPT";
var PARTNER_WRITE_TOKEN = "COLE_AQUI_SEU_WRITE_TOKEN";

var PARCEIROS = [
  { platform: "TWITCH", username: "streamer1" },
  { platform: "KICK", username: "streamer2" },
  { platform: "YOUTUBE", username: "streamer3" }
];

// Mantém o TTS para TODAS as mensagens do chat.
var texto = String(event.raw || "").trim();
if (texto.length > 0 && texto.length <= 500) {
  Sound.playTTS(texto, "Ricardo", 1);
}

var sender = event.sender || {};
var username = String(sender.username || "").trim().toLowerCase();
var platform = String(sender.platform || "").trim().toUpperCase();

var parceiro = PARCEIROS.some(function (item) {
  return String(item.platform || "").toUpperCase() === platform &&
    String(item.username || "").toLowerCase() === username;
});

if (parceiro &&
    PARTNER_WEBHOOK.indexOf("http") === 0 &&
    PARTNER_WRITE_TOKEN.indexOf("COLE_AQUI") !== 0) {

  var displayName = String(sender.displayname || sender.username || username);
  var avatar = String(sender.image_link || "");

  var url = PARTNER_WEBHOOK +
    "?action=partner" +
    "&token=" + encodeURIComponent(PARTNER_WRITE_TOKEN) +
    "&nick=" + encodeURIComponent(username) +
    "&name=" + encodeURIComponent(displayName) +
    "&platform=" + encodeURIComponent(platform) +
    "&avatar=" + encodeURIComponent(avatar);

  try {
    fetch.asText(url);
  } catch (e) {
    // Não deixa uma falha do backend interromper o TTS.
  }
}
