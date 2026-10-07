window.OVERLAY_HUB_CONFIG = {
  canvas: {
    width: 800,
    height: 600
  },

  // Uma unica pagina publica carrega todos os alertboxes abaixo simultaneamente.
  embedExternal: true,

  overlays: [
    {
      id: "streamelements-alertbox",
      label: "StreamElements Alertbox",
      url: "https://streamelements.com/overlay/68fad2fe811a3e6717f6dc1c/DxMgFn7lnf7LvCPSNRGy71YM3tdigJiu8LHtNAfFjI_WWGLC",
      enabled: true,
      zIndex: 10,
      whiteKey: false
    },
    {
      id: "livepix-musica",
      label: "MUSICA-LIVEPIX",
      url: "https://widget.livepix.gg/embed/0cf8f546-2b17-47ba-b75b-0c69939cec88",
      enabled: true,
      zIndex: 20,
      whiteKey: true
    },
    {
      id: "livepix-video",
      label: "VIDEO-LIVEPIX",
      url: "https://widget.livepix.gg/embed/e253d3e6-7178-442a-b39a-a0060b897b8f",
      enabled: true,
      zIndex: 30,
      whiteKey: true
    },
    {
      id: "livepix-alert",
      label: "ALERT-LIVEPIX",
      url: "https://widget.livepix.gg/embed/fbccfcba-5220-47f0-8723-fd94552bd80f",
      enabled: true,
      zIndex: 40,
      whiteKey: true
    },
    {
      id: "streamlabs-alertbox",
      label: "StreamLabs Alertbox",
      url: "https://streamlabs.com/alert-box/v3/49FD764AE93247AF6E88F9D3FBC8FDA6FE9B9EFBF57C4FE540F6B432417BFAACEE9ABC4AA21DD82DA8C4EC5AA710D0617EC1E3AD8CC6BF43AFEBE01AAF06A366E4098EE161923D128AF6B27A34603638C88EF313394613A97EE1E6E05ED3B4A6067B7A8C3D9D0C544782E209AA7A77D92BD9AA3ECC1C142CEC3C8EBB5D",
      enabled: true,
      zIndex: 50,
      whiteKey: true
    }
  ],

  partner: {
    endpoint: "",
    pollMs: 1000,
    visibleMs: 6000,
    dedupeMs: 3 * 60 * 60 * 1000
  },

  debug: false
};

// OBS/CEF pode ignorar filtros aplicados diretamente em <object> cross-origin.
// Depois que overlay.js monta os alertboxes, trocamos os objetos por <embed>,
// preservando cada URL como documento HTML completo e aplicando o white-key
// na camada PAI ja composta pelo Chromium.
(function () {
  "use strict";

  function findOverlay(id) {
    var list = window.OVERLAY_HUB_CONFIG && window.OVERLAY_HUB_CONFIG.overlays;
    if (!Array.isArray(list)) return null;
    return list.find(function (item) {
      return String(item && item.id || "") === String(id || "");
    }) || null;
  }

  function upgradeExternalLayers() {
    var objects = Array.from(document.querySelectorAll("object.external-overlay"));
    if (!objects.length) return;

    objects.forEach(function (oldObject) {
      var id = oldObject.dataset.overlayId || "";
      var item = findOverlay(id);
      if (!item || !item.url || item.enabled === false) return;

      var layer = document.createElement("div");
      layer.className = "external-overlay-layer";
      layer.dataset.overlayId = id;
      layer.style.position = "absolute";
      layer.style.inset = "0";
      layer.style.width = "100%";
      layer.style.height = "100%";
      layer.style.overflow = "hidden";
      layer.style.pointerEvents = "none";
      layer.style.background = "transparent";
      layer.style.backgroundColor = "rgba(0,0,0,0)";
      layer.style.zIndex = String(Number(item.zIndex) || 1);
      layer.style.isolation = "isolate";
      layer.style.contain = "paint";
      layer.style.transform = "translateZ(0)";
      layer.style.willChange = "filter";

      if (item.whiteKey === true) {
        layer.style.filter = "url(#white-key)";
        layer.style.webkitFilter = "url(#white-key)";
      }

      var embed = document.createElement("embed");
      embed.className = "external-overlay external-overlay-embed";
      embed.dataset.overlayId = id;
      embed.type = "text/html";
      embed.src = item.url;
      embed.style.position = "absolute";
      embed.style.inset = "0";
      embed.style.width = "100%";
      embed.style.height = "100%";
      embed.style.border = "0";
      embed.style.margin = "0";
      embed.style.padding = "0";
      embed.style.display = "block";
      embed.style.overflow = "hidden";
      embed.style.pointerEvents = "none";
      embed.style.background = "transparent";
      embed.style.backgroundColor = "rgba(0,0,0,0)";

      layer.appendChild(embed);
      oldObject.replaceWith(layer);
    });
  }

  // config.js roda antes de overlay.js. O timeout executa depois que overlay.js
  // terminou de montar todos os documentos externos.
  window.setTimeout(upgradeExternalLayers, 0);
})();
