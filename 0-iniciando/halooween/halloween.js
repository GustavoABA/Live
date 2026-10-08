(() => {
  const params = new URLSearchParams(location.search);
  const output = document.querySelector('[data-countdown] output');
  const motionOff = params.get('motion') === '0';
  const started = Date.now();
  const format = seconds => `${String(Math.max(0, Math.floor(seconds / 60))).padStart(2, '0')}:${String(Math.max(0, Math.floor(seconds % 60))).padStart(2, '0')}`;
  const render = () => {
    const minutes = Number(params.get('minutes') || document.querySelector('[data-countdown]').dataset.countdown || 10);
    output.textContent = format(minutes * 60 - (Date.now() - started) / 1000);
  };
  if (motionOff) document.body.classList.add('motion-off');
  render();
  setInterval(render, 1000);
})();
