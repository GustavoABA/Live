window.OVERLAY_HUB_CONFIG = {
  canvas: {
    width: 800,
    height: 600
  },

  // A partir desta versao, o hub NAO depende de iframes externos para alertas.
  // Os alertas sao renderizados pela propria pagina a partir de eventos.
  embedExternal: false,

  // URLs antigas ficam apenas como referencia. Nao sao carregadas automaticamente.
  overlays: [
    {
      id: "streamelements-alertbox",
      label: "StreamElements Alertbox",
      url: "https://streamelements.com/overlay/68fad2fe811a3e6717f6dc1c/DxMgFn7lnf7LvCPSNRGy71YM3tdigJiu8LHtNAfFjI_WWGLC",
      enabled: true,
      zIndex: 10
    },
    {
      id: "livepix-musica",
      label: "MUSICA-LIVEPIX",
      url: "https://widget.livepix.gg/embed/0cf8f546-2b17-47ba-b75b-0c69939cec88",
      enabled: true,
      zIndex: 20
    },
    {
      id: "livepix-video",
      label: "VIDEO-LIVEPIX",
      url: "https://widget.livepix.gg/embed/e253d3e6-7178-442a-b39a-a0060b897b8f",
      enabled: true,
      zIndex: 30
    },
    {
      id: "livepix-alert",
      label: "ALERT-LIVEPIX",
      url: "https://widget.livepix.gg/embed/fbccfcba-5220-47f0-8723-fd94552bd80f",
      enabled: true,
      zIndex: 40
    }
  ],

  nativeAlerts: {
    // URL /exec do Google Apps Script que recebe os webhooks da LivePix
    // e entrega a fila para esta pagina. Tambem pode usar ?endpoint=URL no OBS.
    endpoint: "",
    pollMs: 800,
    displayMs: 6500,
    maxQueue: 30
  },

  streamElements: {
    // NUNCA publique token real neste arquivo. Passe no OBS por query string
    // ou mantenha estes campos vazios e configure depois.
    enabled: false,
    channelId: "",
    token: "",
    tokenType: "jwt"
  },

  partner: {
    // Mantem compatibilidade com o sistema de parceiros ja existente.
    endpoint: "",
    pollMs: 1000,
    visibleMs: 6000,
    dedupeMs: 3 * 60 * 60 * 1000
  },

  debug: false
};
