window.OVERLAY_HUB_CONFIG = {
  canvas: {
    width: 800,
    height: 600
  },

  // Overlays externos empilhados na mesma Browser Source.
  // IDs devem ser unicos para facilitar debug/manutencao.
  overlays: [
    {
      id: "streamelements-alertbox",
      label: "StreamElements Alertbox",
      url: "https://streamlabs.com/alert-box/v3/49FD764AE93247AF6E88F9D3FBC8FDA6FE9B9EFBF57C4FE540F6B432417BFAACEE9ABC4AA21DD82DA8C4EC5AA710D0617EC1E3AD8CC6BF43AFEBE01AAF06A366E4098EE161923D128AF6B27A34603638C88EF313394613A97EE1E6E05ED3B4A6067B7A8C3D9D0C544782E209AA7A77D92BD9AA3ECC1C142CEC3C8EBB5D",
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
    },
    {
      id: "streamlabs-alertbox",
      label: "StreamLabs Alertbox",
      url: "https://streamlabs.com/alert-box/v3/49FD764AE93247AF6E88F9D3FBC8FDA6FE9B9EFBF57C4FE540F6B432417BFAACEE9ABC4AA21DD82DA8C4EC5AA710D0617EC1E3AD8CC6BF43AFEBE01AAF06A366E4098EE161923D128AF6B27A34603638C88EF313394613A97EE1E6E05ED3B4A6067B7A8C3D9D0C544782E209AA7A77D92BD9AA3ECC1C142CEC3C8EBB5D",
      enabled: true,
      zIndex: 50
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
