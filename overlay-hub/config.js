window.OVERLAY_HUB_CONFIG = {
  canvas: {
    width: 800,
    height: 600
  },

  // O hub publico nao carrega mais paginas externas em iframe.
  // A lista de alertboxes fica em overlay-hub/compositor/overlays.json.
  // O compositor local abre cada URL como pagina Chromium independente.
  embedExternal: false,
  overlays: [],

  partner: {
    endpoint: "",
    pollMs: 1000,
    visibleMs: 6000,
    dedupeMs: 3 * 60 * 60 * 1000
  },

  debug: false
};
