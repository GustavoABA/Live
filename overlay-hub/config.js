window.OVERLAY_HUB_CONFIG = {
  canvas: {
    width: 800,
    height: 600
  },

  // Adicione quantos overlays externos quiser. Eles ficam empilhados na mesma Browser Source.
  overlays: [
    {
      id: "streamelements-alertbox",
      label: "StreamElements Alertbox",
      url: "https://streamelements.com/overlay/68fad2fe811a3e6717f6dc1c/DxMgFn7lnf7LvCPSNRGy71YM3tdigJiu8LHtNAfFjI_WWGLC",
      enabled: true,
      zIndex: 10
    }
  ],

  partner: {
    // Cole aqui a URL /exec do Google Apps Script quando publicar o backend.
    // Também pode passar ?endpoint=URL na URL do Browser Source sem editar este arquivo.
    endpoint: "",
    pollMs: 1000,
    visibleMs: 6000,
    dedupeMs: 3 * 60 * 60 * 1000
  },

  debug: false
};
