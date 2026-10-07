(() => {
  const params = new URLSearchParams(location.search);
  const body = document.body;
  const timers = [...document.querySelectorAll('[data-stopwatch]')];
  const countdowns = [...document.querySelectorAll('[data-countdown]')];
  const characters = [...document.querySelectorAll('[data-character]')];
  const scene = document.querySelector('.scene');
  const started = Date.now();
  let tickId;
  let blinkId;

  const createAtmosphere = () => {
    if (!scene || body.classList.contains('motion-off') || scene.querySelector('.atmosphere')) return;

    const atmosphere = document.createElement('div');
    atmosphere.className = 'atmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < 14; index += 1) {
      const mote = document.createElement('i');
      mote.className = 'mote';
      mote.style.setProperty('--x', `${4 + ((index * 37) % 92)}%`);
      mote.style.setProperty('--size', `${2 + (index % 4)}px`);
      mote.style.setProperty('--alpha', `${.18 + (index % 5) * .07}`);
      mote.style.setProperty('--duration', `${16 + (index % 6) * 2.8}s`);
      mote.style.setProperty('--delay', `${-index * 1.9}s`);
      mote.style.setProperty('--drift', `${-7 + (index % 5) * 3.5}vw`);
      atmosphere.appendChild(mote);
    }

    for (let index = 0; index < 2; index += 1) {
      const star = document.createElement('i');
      star.className = 'shooting-star';
      star.style.setProperty('--x', `${16 + index * 42}%`);
      star.style.setProperty('--y', `${15 + index * 22}%`);
      star.style.setProperty('--duration', `${13 + index * 7}s`);
      star.style.setProperty('--delay', `${-4 - index * 9}s`);
      atmosphere.appendChild(star);
    }

    scene.insertBefore(atmosphere, scene.querySelector('.noise'));
  };

  if (params.get('guide') === '1') body.classList.add('is-guide');
  if (params.get('motion') === '0') body.classList.add('motion-off');

  const formatTime = seconds => {
    const safe = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
  };

  const renderTimers = () => {
    const elapsed = (Date.now() - started) / 1000;
    timers.forEach(element => { element.textContent = formatTime(elapsed); });
    countdowns.forEach(element => {
      const minutes = Number(params.get('minutes') || element.dataset.countdown || 10);
      element.textContent = formatTime(minutes * 60 - elapsed);
    });
  };

  const scheduleBlink = () => {
    clearTimeout(blinkId);
    blinkId = setTimeout(() => {
      characters.forEach(character => character.classList.add('is-blinking'));
      setTimeout(() => characters.forEach(character => character.classList.remove('is-blinking')), 165);
      scheduleBlink();
    }, 2600 + Math.random() * 4200);
  };

  const start = () => {
    if (!tickId) {
      renderTimers();
      tickId = setInterval(renderTimers, 1000);
    }
    if (characters.length && !body.classList.contains('motion-off')) scheduleBlink();
  };

  const stop = () => {
    clearInterval(tickId);
    clearTimeout(blinkId);
    tickId = null;
    blinkId = null;
  };

  const updateVisibility = () => {
    body.classList.toggle('obs-paused', document.hidden);
    document.hidden ? stop() : start();
  };

  document.addEventListener('visibilitychange', updateVisibility);
  window.addEventListener('pageshow', updateVisibility);
  window.addEventListener('pagehide', stop);
  createAtmosphere();
  start();
})();
