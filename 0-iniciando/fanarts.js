(() => {
  'use strict';

  const track = document.querySelector('[data-fanart-track]');
  const viewport = document.querySelector('[data-fanart-viewport]');
  const progress = document.querySelector('[data-fanart-progress]');
  const indicator = document.querySelector('[data-fanart-indicator]');
  if (!track || !viewport) return;

  // GitHub Pages não lista pastas; a API pública descobre os arquivos sem manifesto manual.
  const directory = '../assets/fanarts/';
  const endpoint = 'https://api.github.com/repos/GustavoABA/Live/contents/assets/fanarts?ref=main';
  // Galeria local de segurança para quando o GitHub estiver indisponível.
  // A API continua descobrindo automaticamente novos arquivos da pasta.
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
  let length = 0;
  let index = 0;
  let autoplay;
  let isResetting = false;

  const artistName = filename => {
    const author = filename.replace(/\.[^.]+$/, '').split('--')[0]
      .replace(/[-_]+/g, ' ').trim();
    return author ? author.replace(/\b\p{L}/gu, letter => letter.toUpperCase()) : 'Comunidade';
  };

  const makeCard = (file, position) => {
    const artist = artistName(file.name);
    const card = document.createElement('figure');
    card.className = 'fanart-card';
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', 'Fanart ' + position + ' de ' + length + ', por ' + artist);

    const paper = document.createElement('div');
    paper.className = 'fanart-art';
    const image = document.createElement('img');
    image.src = directory + encodeURIComponent(file.name);
    image.alt = 'Fanart enviada por ' + artist;
    image.decoding = 'async';
    image.loading = 'eager';
    paper.appendChild(image);

    const caption = document.createElement('figcaption');
    const hint = document.createElement('small');
    hint.textContent = 'feito com carinho por';
    const author = document.createElement('strong');
    author.textContent = artist;
    caption.append(hint, author);

    card.append(paper, caption);
    return card;
  };

  const updateCounter = () => {
    const current = String(Math.min(index + 1, length)).padStart(2, '0');
    const total = String(length).padStart(2, '0');
    if (progress) progress.textContent = current + ' / ' + total;
    if (indicator) indicator.textContent = 'Comunidade · ' + total;
  };

  const moveTo = (target, animate = true) => {
    if (!track.children.length) return;
    track.style.transition = animate && !motionOff ? '' : 'none';
    const position = track.children[target].offsetLeft - track.children[0].offsetLeft;
    track.style.transform = 'translate3d(' + (-position) + 'px, 0, 0)';
    if (!animate) {
      // Restaura a transição apenas após aplicar a posição sem animação.
      void track.offsetWidth;
      track.style.transition = '';
    }
  };

  const stopAutoplay = () => {
    clearInterval(autoplay);
    autoplay = undefined;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (motionOff || length < 2) return;
    autoplay = setInterval(() => {
      if (document.hidden || viewport.matches(':hover') || isResetting) return;
      index += 1;
      moveTo(index);
      updateCounter();
    }, 6500);
  };

  track.addEventListener('transitionend', event => {
    if (event.target !== track || event.propertyName !== 'transform') return;
    if (index === length && length > 1) {
      isResetting = true;
      index = 0;
      moveTo(0, false);
      isResetting = false;
      updateCounter();
    }
  });

  const render = files => {
    length = files.length;
    index = 0;
    track.replaceChildren(...files.map((file, i) => makeCard(file, i + 1)));
    track.classList.toggle('is-single', length === 1);
    if (length > 1) {
      const clone = track.firstElementChild.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
    moveTo(0, false);
    updateCounter();
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
      console.warn('[Fanarts] Não foi possível listar assets/fanarts; usando imagens conhecidas.', error);
    }
  };

  // Primeiro desenho já visível, mesmo sem acesso à API pública.
  imageNames = fallback.map(file => file.name).join('|');
  render(fallback);
  sync();

  // Novas fanarts enviadas durante a live aparecem após o deploy no GitHub Pages.
  setInterval(() => { if (!document.hidden) sync(); }, 300000);
  window.addEventListener('resize', () => moveTo(index, false));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && index < length) moveTo(index, false);
  });
})();
