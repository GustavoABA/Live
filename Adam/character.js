/* Adam: carregador compartilhado de personagem, sem dependências externas.
   WebP local é preferencial; a imagem AVIF base64 serve como prévia automática. */
(() => {
  const script = document.currentScript;
  const base = new URL('./assets/', script.src);
  const images = [...document.querySelectorAll('[data-adam-image]')];
  if (!images.length) return;
  const full = new URL('adam.webp', base);
  const fallback = new URL('adam-base64.txt', base);

  const avatar = new Image();
  avatar.onload = () => images.forEach(img => { img.src = full.href; });
  avatar.onerror = async () => {
    try {
      const response = await fetch(fallback, {cache: 'force-cache'});
      if (!response.ok) throw new Error('Falha ao carregar fallback do Adam: ' + response.status);
      const encoded = (await response.text()).trim();
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error('Fallback base64 inválido');
      const inline = 'data:image/avif;base64,' + encoded;
      images.forEach(img => { img.src = inline; });
    } catch (error) {
      console.warn('[Adam] Não foi possível carregar o personagem.', error);
    }
  };
  avatar.src = full.href;
})();