window.OVERLAY_HUB_CONFIG = {
  canvas: {
    width: 800,
    height: 600
  },

  // Importante: widgets como LivePix e StreamElements foram feitos para rodar
  // como Browser Source de nivel superior no OBS. Alguns deles podem pintar
  // o proprio iframe de branco ou bloquear embedding por politica do provedor.
  // Por isso o hub NAO incorpora URLs externas por iframe por padrao.
  // Para teste manual, use ?embedExternal=1 na URL do hub.
  embedExternal: false,

  // Mantemos as URLs aqui como referencia/configuracao central.
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

  partner: {
    // Cole aqui a URL /exec do Google Apps Script quando publicar o backend.
    // Tambem pode passar ?endpoint=URL na URL do Browser Source sem editar este arquivo.
    endpoint: "",
    pollMs: 1000,
    visibleMs: 6000,
    dedupeMs: 3 * 60 * 60 * 1000
  },

  debug: false
};
