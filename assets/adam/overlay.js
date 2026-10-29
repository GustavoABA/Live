
(() => {
  'use strict';
  const sceneNumber = Number(document.body.dataset.scene || '0');
  const number = Number.isInteger(sceneNumber) && sceneNumber >= 0 && sceneNumber <= 9 ? sceneNumber : 0;
  const config = [
    ['INICIANDO','O aquecimento já começou'],
    ['ENTRADA','O show está no ar'],
    ['CHAT','A resenha começou'],
    ['GAMEPLAY','Modo jogo ativado'],
    ['REACTS','Reagindo a tudo'],
    ['INTERMISSÃO','Recarregando as energias'],
    ['COLABS','Mais cabras na arena'],
    ['JÁ VOLTO','Pausa rapidinha'],
    ['FINAL','Até a próxima'],
    ['EMERGÊNCIA','Reconexão em andamento']
  ];
  const params = new URLSearchParams(location.search);
  const motionOff = params.get('motion') === '0' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionOff) document.body.classList.add('is-motion-off');
  if (params.get('guide') === '1') document.body.classList.add('show-guide');
  if (params.get('transparent') === '1') document.body.classList.add('is-transparent');

  const flameSVG = '<svg viewBox="0 0 120 195" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="outer" d="M58 2C82 42 71 71 103 93C135 134 109 189 60 192C11 190 -2 150 17 112C31 86 46 76 37 44C55 62 60 41 58 2Z"/><path class="middle" d="M65 58C83 95 74 108 91 127C108 153 87 190 60 187C30 186 17 155 36 132C51 110 60 95 65 58Z"/><path class="inner" d="M60 111C65 138 81 150 75 167C69 187 42 185 42 166C42 148 58 142 60 111Z"/></svg>';
  const goatSVG = '<svg viewBox="0 0 170 144" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="87" cy="129" rx="59" ry="5" fill="#2577d1" opacity=".28"/><g class="goat-body"><g class="goat-leg-a"><path d="M112 91L116 119L125 121L125 95" fill="#d7eeff"/><path d="M114 117L128 117L128 128L113 128Z" fill="#1c3760"/></g><g class="goat-leg-b"><path d="M91 94L90 122L99 122L107 94" fill="#e6f8ff"/><path d="M89 118L101 118L101 129L87 129Z" fill="#1c3760"/></g><path d="M130 59Q147 33 148 50Q148 60 136 68" stroke="#d7eeff" stroke-width="11" stroke-linecap="round" fill="none"/><ellipse cx="101" cy="78" rx="45" ry="31" fill="#d6edff" stroke="#2e74c1" stroke-width="2"/><path d="M78 61Q95 48 122 66" fill="none" stroke="#f6fdff" stroke-width="12" stroke-linecap="round"/><g class="goat-leg-c"><path d="M65 91L59 119L69 124L78 92" fill="#e7f8ff"/><path d="M56 118L72 120L69 131L54 129Z" fill="#203e69"/></g><g class="goat-leg-d"><path d="M119 93L127 120L137 119L132 92" fill="#e5f8ff"/><path d="M125 116L139 116L140 127L127 129Z" fill="#1d3965"/></g><path d="M55 68Q38 65 31 43L35 18Q47 35 56 37Q65 25 67 12Q79 37 69 53" fill="#e5f5ff" stroke="#2866ab" stroke-width="2"/><path d="M40 38Q23 21 23 11Q38 19 44 32M57 29Q58 15 68 8Q70 23 65 36" fill="#b3dff8" stroke="#2f6fa8" stroke-width="4" stroke-linecap="round"/><path d="M37 61Q12 46 14 65Q27 79 38 70" fill="#a3d6ff" stroke="#2b72bd" stroke-width="2"/><path d="M64 59Q84 45 80 64Q77 77 63 73" fill="#9bd2ff" stroke="#2b72bd" stroke-width="2"/><path d="M40 52C17 48 12 83 25 92Q44 103 61 84Q74 75 65 58C59 49 51 50 40 52Z" fill="#f6fdff" stroke="#3e7bc3" stroke-width="2"/><ellipse cx="46" cy="70" rx="4" ry="5" fill="#09213f"/><circle cx="47" cy="68" r="1.5" fill="#fff"/><path d="M23 79Q26 76 30 79" stroke="#284a75" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M31 88Q34 103 44 96L38 85" fill="#e4faff"/><circle cx="54" cy="81" r="4" fill="#ed8cbb" opacity=".55"/><path d="M62 87Q73 98 85 87" fill="none" stroke="#227aff" stroke-width="7" stroke-linecap="round"/><path d="M75 90L72 102L85 102L82 90" fill="#5df0ff" stroke="#2c8aff" stroke-width="2"/><circle cx="78" cy="98" r="3" fill="#d8fdff"/></g></svg>';

  const slot = (name, cls, detail = '') => '<div class="slot ' + cls + '"><span class="slot-label">' + name + '</span><div class="guide"><strong>' + name + '</strong><small>' + detail + '</small></div></div>';
  const portrait = (compact = false) => compact
    ? '<div class="mini-portrait"><img data-portrait alt="Ilustração do Adam" loading="eager"></div>'
    : '<div class="portrait-stage"><div class="portrait-ring"></div><img data-portrait alt="Ilustração do Adam" loading="eager"><div class="portrait-caption">ADAM // GOATFIRE</div></div>';

  const hero = (eyebrow, title, subtitle, timer = '') => {
    const timeNode = timer === 'countdown' ? '<div class="counter" data-countdown>10:00</div>'
      : timer === 'stopwatch' ? '<div class="counter" data-stopwatch>00:00</div>' : '';
    return '<div class="center-copy"><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1><div class="subtitle">' + subtitle + '</div>' + timeNode + '</div>';
  };

  const scenes = [
    () => hero('O fogo azul está acendendo', 'A LIVE<br><em>VAI COMEÇAR</em>', 'Puxe uma cadeira, conheça o rebanho e prepare-se. Já já a transmissão começa!', 'countdown') + portrait(),
    () => '<div class="workspace layout-entry">' + slot('Chat','chat','posicione o chat por cima') + slot('VTuber','vtuber','área central do avatar') + '<div class="slogan">BEM-VINDO<br>À ARENA.</div></div>' + portrait(true),
    () => '<div class="workspace layout-chat">' + slot('Chat','chat','chat ao vivo') + '<div class="slogan">GOAT<br>SQUAD<br>ON FIRE.</div>' + slot('VTuber 01','vt1') + slot('VTuber 02','vt2') + slot('VTuber 03','vt3') + '</div>',
    () => '<div class="gameplay-frame"></div><div class="gameplay-note">PLAY HARD / STAY GOAT</div>' + portrait(true),
    () => '<div class="workspace layout-reacts">' + slot('Vídeo / navegador','content','área do conteúdo') + slot('Chat','chat','mensagens do chat') + slot('VTuber','vtuber','posição do streamer') + '</div>',
    () => hero('O rebanho está descansando','HORA DO<br><em>INTERVALO</em>','A chama continua acesa. A gente já volta!', 'stopwatch') + portrait(),
    () => '<div class="workspace layout-colabs">' + slot('Chat','chat','chat ao vivo') + '<div class="slogan">TROPA<br>DAS<br>CABRAS.</div>' + slot('Convidado 01','vt1') + slot('Convidado 02','vt2') + slot('Convidado 03','vt3') + slot('Convidado 04','vt4') + '</div>',
    () => hero('Não fuja do rebanho','JÁ<br><em>VOLTO!</em>','Pausa rápida. Guarda esse lugar que a gente já volta.', 'stopwatch') + portrait(),
    () => hero('Fim de transmissão','VALEU<br><em>DEMAIS!</em>','O fogo se apaga por hoje, mas a tropa se encontra na próxima!', '') + portrait(),
    () => hero('Aviso da transmissão','SINAL<br><em class="accent-warning">INSTÁVEL</em>','Tivemos um problema técnico. Estamos tentando reconectar — obrigado por ficar!', '')
  ];
  const scene = document.createElement('main');
  scene.className = 'scene';
  scene.dataset.scene = String(number);
  scene.setAttribute('aria-label','Overlay Adam — ' + config[number][0]);
  scene.innerHTML =
    '<div class="orb one"></div><div class="orb two"></div><div class="top-stripe"></div><div class="corners"></div>' +
    '<div class="fires">' + Array.from({length:4},(_,i)=>'<span class="flame flame-' + (i+1) + '">' + flameSVG + '</span>').join('') + '</div>' +
    '<div class="spark-field" aria-hidden="true"></div>' +
    '<header class="header"><div class="identity"><span class="emblem" aria-hidden="true">♈</span><span class="identity-word"><strong>ADAM</strong><small>GOATFIRE // BLUE FLAME</small></span></div>' +
    '<div class="tag"><span class="dot"></span>' + config[number][0] + '</div></header>' +
    scenes[number]() +
    '<div class="goat-yard" aria-hidden="true"></div>' +
    '<footer class="footer"><span><b>' + String(number).padStart(2,'0') + ' //</b> ' + config[number][1] + '</span><span>ADAM · GOATFIRE</span></footer>';
  document.body.replaceChildren(scene);

  const yard = scene.querySelector('.goat-yard');
  const count = number === 3 || number === 4 || number === 6 ? 2 : 3;
  for (let i=0;i<count;i++){
    const goat = document.createElement('div');
    goat.className = 'goat-walker' + (i%2===1?' reverse':'');
    goat.style.setProperty('--goat-size', (i===0?118:i===1?85:102)+'px');
    goat.style.setProperty('--goat-duration', (19 + i*7)+'s');
    goat.style.setProperty('--goat-delay', (-i*10 - 1)+'s');
    goat.style.setProperty('--goat-park', (10+i*22)+'vw');
    goat.style.bottom = (i%2)*4 + 'px';
    goat.innerHTML = goatSVG;
    yard.appendChild(goat);
  }
  if (!motionOff){
    const sparks = scene.querySelector('.spark-field');
    for (let i=0;i<24;i++) {
      const p=document.createElement('i');p.className='spark';
      p.style.setProperty('--sx',(i*31%100)+'%');
      p.style.setProperty('--sy',(26+i*19%74)+'%');
      p.style.setProperty('--ss',(2+i%3)+'px');
      p.style.setProperty('--st',(4+i%5*2)+'s');
      p.style.setProperty('--sd',(-i*0.6)+'s');
      sparks.appendChild(p);
    }
  }
  async function loadPortraits(){
    const pics=[...scene.querySelectorAll('[data-portrait]')];
    if (!pics.length) return;
    const webp=new URL('./adam.webp',document.currentScript?.src||location.href);
    // The copy in this script's folder is streamer-specific and never uses NihilGuh assets.
    const image=new Image();
    image.onload=()=>pics.forEach(p=>p.src=webp.href);
    image.onerror=async()=>{
      try {
        const response=await fetch(new URL('./adam-base64.txt',webp),{cache:'force-cache'});
        if(!response.ok) throw new Error('Falha ao obter arte Adam');
        const b64=(await response.text()).trim();
        if(!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) throw new Error('Imagem inválida');
        const url='data:image/avif;base64,'+b64;
        pics.forEach(p=>p.src=url);
      }catch(error){
        console.warn('Prévia do Adam indisponível:',error);
        pics.forEach(p=>{p.alt='ADAM';});
      }
    };
    image.src=webp.href;
  }
  // Document.currentScript is null after async operations. Capture it through the static path in each scene.
  loadPortraits();

  const durationRaw=Number(params.get('minutes'));
  const durationMinutes=Number.isFinite(durationRaw)&&durationRaw>0?Math.min(durationRaw,120):10;
  const countdown=scene.querySelector('[data-countdown]');
  const stopwatch=scene.querySelector('[data-stopwatch]');
  let elapsed=0,lastTick=Date.now(),timerId;
  const fmt=t=>{const n=Math.max(0,Math.floor(t));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
  const updateTime=()=>{
    const now=Date.now();
    if(!document.hidden) elapsed+=(now-lastTick)/1000;
    lastTick=now;
    if(countdown) countdown.textContent=fmt(durationMinutes*60-elapsed);
    if(stopwatch) stopwatch.textContent=fmt(elapsed);
  };
  function checkVisibility(){
    document.body.classList.toggle('is-paused',document.hidden);
    lastTick=Date.now();
    if(document.hidden){clearInterval(timerId);timerId=null}
    else if(!timerId){updateTime();timerId=setInterval(updateTime,500)}
  }
  document.addEventListener('visibilitychange',checkVisibility);
  window.addEventListener('pagehide',()=>clearInterval(timerId));
  checkVisibility();
})();
