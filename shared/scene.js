(() => {
  const params = new URLSearchParams(location.search);
  const body = document.body;
  const timers = [...document.querySelectorAll('[data-stopwatch]')];
  const countdowns = [...document.querySelectorAll('[data-countdown]')];
  const characters = [...document.querySelectorAll('[data-character]')];
  const started = Date.now();
  let tickId;
  let blinkId;

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
  start();
})();
