/* NihilGuh Ambient Effects — live OBS animation layer.
   GSAP timelines follow HyperFrames-style declarative, seekable motion.
   CSS fallback keeps the scenes usable if GSAP's CDN is unavailable.
   No Adam selectors or assets. */
(() => {
  'use strict';
  const scene = document.querySelector('.scene');
  if (!scene || scene.querySelector('.amb-root') || document.body.dataset.adam) return;
  const params = new URLSearchParams(location.search);
  if (params.get('fx') === '0') return;
  const motionOff = params.get('motion') === '0' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionOff) { document.body.classList.add('amb-motion-off'); return; }
  const halloween = document.body.classList.contains('halloween') ||
    document.body.classList.contains('halloween-special') ||
    /\/halooween\//.test(location.pathname);
  const guessedScene = Number((location.pathname.match(/\/(\d+)-[^/]+\//) || [,'0'])[1]);
  const sceneId = Number(scene.dataset.scene || guessedScene || 0);
  const seed = halloween ? 9301 + sceneId * 313 : 4242 + sceneId * 257;
  let rngSeed = seed >>> 0;
  const rand = () => { rngSeed = (1664525 * rngSeed + 1013904223) >>> 0; return rngSeed / 4294967296; };
  const range = (lo,hi) => lo + rand()*(hi-lo);
  const performance = params.get('fx') === 'low' || params.get('intensity') === 'low' ? 'low' : params.get('intensity') === 'high' ? 'high' : 'normal';
  document.body.dataset.ambPerformance = performance;
  const calm = sceneId === 3 || sceneId === 4 || sceneId === 6;
  const counts = performance === 'low' ? {cats:1,ghosts:halloween?1:0,spiders:halloween?1:0,leaves:4} :
    performance === 'high' ? {cats:4,ghosts:halloween?3:0,spiders:halloween?4:0,leaves:14} :
    {cats:calm?1:3,ghosts:halloween?(calm?1:2):0,spiders:halloween?(calm?1:3):0,leaves:8};
  const root=document.createElement('div');
  root.className='amb-root';
  root.setAttribute('aria-hidden','true');
  root.dataset.theme=halloween?'halloween':'midnight';
  root.dataset.compositionId='nihilguh-' + (halloween?'halloween-':'midnight-') + sceneId;
  const createLayer=(name)=>{
    const layer=document.createElement('div');
    layer.className='amb-layer amb-'+name;
    root.append(layer);
    return layer;
  };
  const background=createLayer('background');
  const actors=createLayer('actors');
  const spiders=createLayer('spiders');
  const edges=createLayer('edges');
  if(!calm) {
    const glow=document.createElement('span');glow.className='amb-floor-glow';background.append(glow);
    const moon=document.createElement('span');moon.className='amb-crescent';background.append(moon);
  }
  const portal=document.createElement('div');
  portal.className='amb-portal';
  edges.append(portal);

  const catSVG = '<svg viewBox="0 0 170 110" xmlns="http://www.w3.org/2000/svg"><g class="amb-body">' +
    '<ellipse cx="85" cy="100" rx="59" ry="5" fill="rgba(32,18,49,.23)"/>' +
    '<path class="amb-tail" d="M46 62C22 68 13 37 26 24C36 16 39 32 31 37C22 46 41 53 56 50" fill="none" stroke="var(--amb-cat)" stroke-width="16" stroke-linecap="round"/>' +
    '<g class="amb-paw-a"><path class="amb-fur" d="M49 70L46 94Q55 103 65 94L69 76Z"/></g>' +
    '<g class="amb-paw-b"><path class="amb-fur" d="M84 76L79 97Q88 104 99 96L102 79Z"/></g>' +
    '<ellipse class="amb-fur" cx="83" cy="65" rx="49" ry="28" stroke-width="2"/>' +
    '<g class="amb-paw-c"><path class="amb-fur" d="M113 76L110 96Q117 102 127 96L131 76Z"/></g>' +
    '<g class="amb-paw-d"><path class="amb-fur" d="M135 70L135 95Q145 101 150 92L148 72Z"/></g>' +
    '<path class="amb-fur" d="M106 37L109 9L129 30L144 12L150 41Q163 50 157 68Q150 85 128 84Q102 80 102 59Z" stroke-width="2"/>' +
    '<path class="amb-inner" d="M116 20L117 37L128 31ZM140 23L141 40L148 34Z"/>' +
    '<ellipse class="amb-eye" cx="122" cy="56" rx="5" ry="7"/><ellipse class="amb-eye" cx="145" cy="56" rx="5" ry="7"/>' +
    '<path d="M133 65L137 68L141 65M137 68Q136 74 132 73M137 68Q140 74 145 72" fill="none" stroke="var(--amb-ear)" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M114 68L102 64M114 72L103 75M150 68L161 66M151 72L161 75" fill="none" stroke="var(--amb-outline)" stroke-width="1.3"/>' +
    '<path d="M111 83Q128 88 147 82" fill="none" stroke="var(--amb-glow)" stroke-width="3"/><circle cx="131" cy="87" r="4" fill="var(--amb-eye)"/>' +
    '</g></svg>';

  const ghostSVG = '<svg viewBox="0 0 150 165" xmlns="http://www.w3.org/2000/svg">' +
    '<path class="amb-ghost-body" d="M26 52L30 12L55 36Q79 22 100 38L124 14L126 58Q137 88 129 122L145 140L119 137L102 154L86 143L64 155L46 139L18 147Q28 127 19 107Q14 73 26 52Z"/>' +
    '<path d="M36 52Q77 27 114 52" stroke="white" stroke-opacity=".48" fill="none" stroke-width="8" stroke-linecap="round"/>' +
    '<ellipse class="amb-ghost-eye" cx="57" cy="83" rx="8" ry="11"/><ellipse class="amb-ghost-eye" cx="97" cy="83" rx="8" ry="11"/>' +
    '<ellipse cx="54" cy="79" rx="2.5" ry="3.5" fill="#fff"/><ellipse cx="94" cy="79" rx="2.5" ry="3.5" fill="#fff"/>' +
    '<path d="M73 95Q79 101 85 95" stroke="#514363" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle class="amb-ghost-blush" cx="42" cy="103" r="10"/><circle class="amb-ghost-blush" cx="110" cy="103" r="10"/>' +
    '<path d="M44 115Q29 135 40 139M112 115Q124 136 112 143" fill="none" stroke="var(--amb-glow)" stroke-opacity=".35" stroke-width="2"/>' +
    '</svg>';

  const spiderSVG = '<svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg"><g class="amb-spider-wiggle">' +
    '<path class="amb-spider-leg" d="M31 42L13 22L5 30M31 51L8 45L4 58M32 59L15 76L11 83M34 37L28 14L19 9M59 42L76 22L85 30M59 51L82 45L86 58M58 59L75 76L79 83M56 37L62 14L71 9"/>' +
    '<circle class="amb-spider-core" cx="45" cy="55" r="22"/><circle class="amb-spider-core" cx="45" cy="30" r="12"/>' +
    '<circle class="amb-spider-eye" cx="39" cy="26" r="3.5"/><circle class="amb-spider-eye" cx="51" cy="26" r="3.5"/>' +
    '<path d="M41 35Q45 38 49 35" stroke="var(--amb-glow)" stroke-width="1.5" fill="none"/>' +
    '<path d="M37 51L44 58L52 49" fill="none" stroke="var(--amb-glow)" stroke-width="1.5" opacity=".72"/></g></svg>';

  const characters=[];
  for(let i=0;i<counts.cats;i++){
    const cat=document.createElement('div');
    const direction=(i+sceneId)%2===0?'run-right':'run-left';
    const duration=range(18,33);
    const delay=-range(2,duration);
    cat.className='amb-cat '+direction;
    cat.innerHTML=catSVG;
    cat.style.cssText='--base-y:'+range(2.8,9.2).toFixed(1)+'vh;--width:'+range(78,132).toFixed(0)+'px;--duration:'+duration.toFixed(2)+'s;--delay:'+delay.toFixed(2)+'s;--opacity:'+(calm?.46:.85)+';';
    actors.append(cat);
    characters.push({el:cat,direction:direction==='run-right'?1:-1,duration,phase:range(0,1)});
  }
  for(let i=0;i<counts.ghosts;i++){
    const ghost=document.createElement('div');
    const direction=(i+sceneId)%2===0?1:-1;
    const duration=range(23,39);
    ghost.className='amb-ghost'+(direction===-1?' reverse':'');
    ghost.innerHTML=ghostSVG;
    ghost.style.cssText='--ghost-y:'+range(calm?20:25,calm?75:70).toFixed(1)+'%;--width:'+range(70,121).toFixed(0)+'px;--duration:'+duration.toFixed(1)+'s;--delay:-'+range(1,duration).toFixed(1)+'s;--opacity:'+(calm?.33:.66)+';';
    actors.append(ghost);
    characters.push({el:ghost,direction,duration,phase:range(0,1),ghost:true});
  }
  for(let i=0;i<counts.spiders;i++){
    const spider=document.createElement('div');
    const crawler=i%2===1;
    const reverse=i%3===2;
    const duration=range(crawler?25:13,crawler?43:22);
    spider.className='amb-spider'+(crawler?' crawler':'')+(crawler&&reverse?' reverse':'');
    spider.style.cssText='--sx:'+ (crawler?'0':(i%2===0?range(3,12):range(83,96)).toFixed(1)+'vw')+';--top:'+(crawler?range(8,18).toFixed(1)+'vh':'-4vh')+';--width:'+range(26,50).toFixed(0)+'px;--duration:'+duration.toFixed(1)+'s;--delay:-'+range(1,duration).toFixed(1)+'s;';
    spider.innerHTML='<span class="amb-thread"></span>'+spiderSVG;
    spiders.append(spider);
    characters.push({el:spider,direction:reverse?-1:1,duration,phase:range(0,1),spider:true,crawler});
  }
  const symbols=halloween?['✧','✦','☾','✣','✧','✦']:['✦','✧','♡','☾','✦','❋'];
  for(let i=0;i<counts.leaves;i++){
    const leaf=document.createElement('span');leaf.className='amb-leaf';
    leaf.textContent=symbols[i%symbols.length];
    leaf.style.cssText='--x:'+range(3,97).toFixed(1)+'%;--y:'+range(19,90).toFixed(1)+'%;--size:'+range(10,23).toFixed(0)+'px;--duration:'+range(7,15).toFixed(1)+'s;--delay:-'+range(0,15).toFixed(1)+'s;';
    background.append(leaf);
  }
  scene.append(root);

  // Runtime: GSAP is the same seekable animation engine used by HyperFrames.
  // Register timelines for optional HyperFrames capture while preserving live OBS loops.
  const gsap=window.gsap;
  if(gsap && typeof gsap.timeline==='function'){
    root.classList.add('amb-gsap');
    const style=document.createElement('style');
    style.textContent='.amb-gsap .amb-cat,.amb-gsap .amb-ghost,.amb-gsap .amb-spider{animation:none!important}';
    document.head.append(style);
    const registry=Array.isArray(window.__timelines)?window.__timelines:(window.__timelines=[]);
    for(const entry of characters){
      const el=entry.el,seconds=entry.duration;
      const tl=gsap.timeline({repeat:-1});
      if(entry.spider){
        if(entry.crawler) {
          const start=entry.direction===1?'-19vw':'119vw',end=entry.direction===1?'119vw':'-19vw';
          tl.fromTo(el,{x:start,autoAlpha:0,rotation:0},{x:end,autoAlpha:.85,rotation:entry.direction*3,duration:seconds,ease:'none'})
            .to(el,{autoAlpha:0,duration:.7},'-=.7');
        } else {
          tl.fromTo(el,{y:'-8vh',rotation:-7},{y:'33vh',rotation:8,duration:seconds*.62,ease:'sine.inOut'})
            .to(el,{y:'6vh',rotation:-5,duration:seconds*.38,ease:'sine.inOut'});
        }
      } else {
        const start=entry.direction===1?'-18vw':'118vw',end=entry.direction===1?'118vw':'-18vw';
        const rise=entry.ghost?'-8vh':'0vh';
        tl.fromTo(el,{x:start,y:0,autoAlpha:0},{x:end,y:rise,autoAlpha:parseFloat(getComputedStyle(el).getPropertyValue('--opacity'))||.65,duration:seconds,ease:'none'})
          .to(el,{autoAlpha:0,duration:.85},'-=.85');
      }
      tl.progress(entry.phase);
      registry.push(tl);
    }
  }
  // Existing scene.js already pauses GSAP on OBS visibility. This pauses CSS fallback
  // for Halloween scene 00 as well, where the original script doesn't do that.
  const updateVisibility=()=>document.body.classList.toggle('amb-hidden',document.hidden);
  document.addEventListener('visibilitychange',updateVisibility);
  updateVisibility();
})();
