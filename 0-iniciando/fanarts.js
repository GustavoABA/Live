(() => {
  'use strict';

  const track = document.querySelector('[data-fanart-track]');
  const viewport = document.querySelector('[data-fanart-viewport]');
  if (!track || !viewport) return;

  // No GitHub Pages a listagem da pasta é consultada pela API pública do GitHub.
  const directory = '../assets/fanarts/';
  const endpoint = 'https://api.github.com/repos/GustavoABA/Live/contents/assets/fanarts?ref=main';
  // Acervo de segurança se a API estiver indisponível.
  const fallback = [
  {
    "name": "belle--nihilguh.webp"
  },
  {
    "name": "comunidade--01-guhf.webp"
  },
  {
    "name": "comunidade--02-strogonocofis.webp"
  },
  {
    "name": "comunidade--03-guhnoob.webp"
  },
  {
    "name": "comunidade--04-img-20240712-203208.webp"
  },
  {
    "name": "comunidade--05-guhlunar.webp"
  },
  {
    "name": "comunidade--06-57-sem-titulo-20240701170608.webp"
  },
  {
    "name": "comunidade--07-37-sem-titulo-20240506125023.webp"
  },
  {
    "name": "comunidade--09-guh-lunar-vtuber.webp"
  },
  {
    "name": "comunidade--10-3-sem-titulo-20250110235126.webp"
  },
  {
    "name": "comunidade--11-img-20241223-201814.webp"
  },
  {
    "name": "comunidade--12-guh-lunar.webp"
  },
  {
    "name": "comunidade--13-159-sem-titulo.webp"
  },
  {
    "name": "comunidade--14-spoiler-48-sem-titulo-20240923025237.webp"
  },
  {
    "name": "comunidade--15-rn-image-picker-lib-temp-81c77e56-0161-4f33-9798.webp"
  },
  {
    "name": "comunidade--16-65-sem-titulo-20240726063108.webp"
  },
  {
    "name": "comunidade--17-2310696-nrfpmj4s.webp"
  },
  {
    "name": "comunidade--18-60-sem-titulo.webp"
  }
];
  const isImage = name => /\.(png|jpe?g|webp|gif|avif)$/i.test(name);
  const motionOff = new URLSearchParams(location.search).get('motion') === '0'
    || matchMedia('(prefers-reduced-motion: reduce)').matches;

  let imageNames = '';
  let count = 0;
  let index = 0;
  let autoplay;

  const makeCard = file => {
    const card = document.createElement('figure');
    card.className = 'fanart-card';
    const image = document.createElement('img');
    image.src = directory + encodeURIComponent(file.name);
    image.alt = 'Fanart da comunidade';
    image.decoding = 'async';
    card.appendChild(image);
    return card;
  };

  const moveTo = (target, animate = true) => {
    if (!track.children[target]) return;
    track.style.transition = animate && !motionOff ? '' : 'none';
    // Cada slide tem exatamente a largura da janela: só um desenho por vez.
    const first = track.firstElementChild;
    const offset = track.children[target].offsetLeft - first.offsetLeft;
    track.style.transform = 'translate3d(' + (-offset) + 'px, 0, 0)';
    if (!animate || motionOff) {
      void track.offsetWidth;
      track.style.transition = '';
    }
  };

  const startAutoplay = () => {
    clearInterval(autoplay);
    if (motionOff || count < 2) return;
    autoplay = setInterval(() => {
      if (document.hidden) return;
      index += 1;
      moveTo(index);
    }, 6500);
  };

  track.addEventListener('transitionend', event => {
    if (event.target !== track || event.propertyName !== 'transform') return;
    // Depois de exibir o clone da primeira arte, retorna sem salto visual.
    if (index === count && count > 1) {
      index = 0;
      moveTo(0, false);
    }
  });

  const render = files => {
    count = files.length;
    index = 0;
    track.replaceChildren(...files.map(makeCard));
    if (count > 1) {
      const clone = track.firstElementChild.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
    moveTo(0, false);
    startAutoplay();
  };

  const discover = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5500);
    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
        cache: 'no-store',
        headers: { Accept: 'application/vnd.github+json' }
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const entries = await response.json();
      if (!Array.isArray(entries)) throw new Error('Resposta inesperada da API');
      return entries.filter(item => item.type === 'file' && isImage(item.name))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        .map(item => ({ name: item.name }));
    } finally {
      clearTimeout(timeout);
    }
  };

  const sync = async () => {
    try {
      const files = await discover();
      const nextNames = files.map(file => file.name).join('|');
      if (nextNames !== imageNames) {
        imageNames = nextNames;
        render(files.length ? files : fallback);
      }
    } catch (error) {
      console.warn('[Fanarts] API indisponível; mantendo as artes locais.', error);
    }
  };

  imageNames = fallback.map(file => file.name).join('|');
  render(fallback);
  sync();

  // Novas fanarts aparecem automaticamente quando publicadas na branch main.
  setInterval(() => { if (!document.hidden) sync(); }, 300000);
  window.addEventListener('resize', () => moveTo(index, false));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) moveTo(index, false);
  });
})();
