/* NihilGuh Midnight Cat Club — normal scenes only.
   GSAP animation loops + CSS fallback for live OBS Browser Source.
   HyperFrames renders HTML videos; these animations remain browser-native.
   No Halloween or Adam files are loaded here. */
(() => {
  'use strict';
  const scene = document.querySelector('.scene');
  if (!scene || scene.querySelector('.amb-root') || document.body.dataset.adam) return;
  const params = new URLSearchParams(location.search);
  if (params.get('fx') === '0') return;
  const motionOff = params.get('motion') === '0' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionOff) { document.body.classList.add('amb-motion-off'); return; }
  const halloween = false; // Dedicated normal-only script. Halloween keeps ambient.js.
  const guessedScene = Number((location.pathname.match(/\/(\d+)-[^/]+\//) || [,'0'])[1]);
  const sceneId = Number(scene.dataset.scene || guessedScene || 0);
  const seed = halloween ? 9301 + sceneId * 313 : 4242 + sceneId * 257;
  let rngSeed = seed >>> 0;
  const rand = () => { rngSeed = (1664525 * rngSeed + 1013904223) >>> 0; return rngSeed / 4294967296; };
  const range = (lo,hi) => lo + rand()*(hi-lo);
  const performance = params.get('fx') === 'low' || params.get('intensity') === 'low' ? 'low' : params.get('intensity') === 'high' ? 'high' : 'normal';
  document.body.dataset.ambPerformance = performance;
  const calm = sceneId === 3 || sceneId === 4 || sceneId === 6;
  // In the midnight theme cats are tiny accents, never more than two at a time.
  const explicitCats=Number(params.get('cats'));
  const requestedCats=[1,2].includes(explicitCats)?explicitCats:(calm?1:2);
  const counts = { cats:performance==='low'?1:requestedCats, ghosts:0, spiders:0,
    leaves:performance==='low'?5:(performance==='high'?14:calm?7:10) };
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
  const magic=createLayer('magic');
  const trails=createLayer('trails');
  const orbits=createLayer('orbits');
  const pawprints=createLayer('paws');
  if(!calm) {
    const glow=document.createElement('span');glow.className='amb-floor-glow';background.append(glow);
    const moon=document.createElement('span');moon.className='amb-crescent';background.append(moon);
  }
  const portal=document.createElement('div');
  portal.className='amb-portal';
  edges.append(portal);

  // Redesigned small lunar kitten; it faces RIGHT in the SVG.
  // Leftward walkers are mirrored by CSS, so heads always face their movement.
  const catSVG = '<svg viewBox="0 0 172 116" xmlns="http://www.w3.org/2000/svg"><g class="amb-body">' +
    '<ellipse cx="88" cy="108" rx="61" ry="4.5" fill="rgba(13,8,20,.17)"/>' +
    '<path class="amb-tail" d="M52 67C27 64 22 46 29 32C35 18 48 25 45 35C43 42 34 39 34 34" fill="none" stroke="var(--amb-cat)" stroke-width="15" stroke-linecap="round"/>' +
    '<path d="M51 62C30 60 25 46 31 36" fill="none" stroke="#d0a3de" stroke-width="2.3" stroke-linecap="round" opacity=".75"/>' +
    '<g class="amb-paw-a"><path class="amb-fur" d="M52 76L47 96Q50 106 60 105L68 87Z" stroke-width="2"/><path d="M49 100L61 100" stroke="#aa85c8" stroke-width="2"/></g>' +
    '<g class="amb-paw-b"><path class="amb-fur" d="M75 80L72 99Q76 108 86 103L95 84Z" stroke-width="2"/></g>' +
    '<ellipse class="amb-fur" cx="88" cy="70" rx="48" ry="28" stroke-width="2.2"/>' +
    '<path d="M74 52Q91 48 105 58" stroke="#e5bbde" stroke-width="2.4" fill="none" opacity=".7"/>' +
    '<path class="nyx-star-mark" d="M87 63L90 70L98 71L92 76L93 84L87 80L80 84L82 76L76 71L84 70Z" opacity=".77"/>' +
    '<path class="amb-fur" d="M101 76Q124 72 142 79L146 87Q125 91 104 87Z" stroke-width="1.7"/>' +
    '<g class="amb-paw-c"><path class="amb-fur" d="M116 85L115 101Q121 108 129 104L135 85Z" stroke-width="2"/><path d="M118 101L130 101" stroke="#ad84bf" stroke-width="2"/></g>' +
    '<g class="amb-paw-d"><path class="amb-fur" d="M137 84L141 99Q151 106 158 99L154 81Z" stroke-width="2"/></g>' +
    '<path class="amb-fur" d="M110 47L112 12L131 34L144 14L158 50Q168 69 159 82Q148 94 125 89Q104 84 106 64Z" stroke-width="2.5"/>' +
    '<g class="nyx-ear-twitch"><path class="amb-inner" d="M116 24L119 43L129 37ZM147 25L148 45L155 46Z"/></g>' +
    '<ellipse class="amb-eye" cx="125" cy="61" rx="6" ry="7.5"/><ellipse class="amb-eye" cx="150" cy="61" rx="6" ry="7.5"/>' +
    '<ellipse cx="127" cy="57" rx="2.1" ry="2.8" fill="#fff"/><ellipse cx="152" cy="57" rx="2.1" ry="2.8" fill="#fff"/>' +
    '<ellipse class="nyx-cheek" cx="117" cy="72" rx="7" ry="4"/><ellipse class="nyx-cheek" cx="157" cy="72" rx="6" ry="3.5"/>' +
    '<path d="M134 70L138 73L142 70M138 73Q134 79 131 76M138 73Q142 78 146 75" stroke="#e6b9cf" stroke-width="1.9" stroke-linecap="round" fill="none"/>' +
    '<path d="M116 75L105 72M116 79L104 80M152 75L165 72M153 79L164 81" fill="none" stroke="#c09aca" stroke-width="1.4" stroke-linecap="round"/>' +
    '<path d="M116 87Q135 98 153 86" stroke="#bc8ee1" stroke-width="3.6" fill="none"/>' +
    '<path class="nyx-heart" d="M133 93C127 88 124 95 133 100C142 95 139 88 133 93Z" fill="#f1c4e4" stroke="#a680d5" stroke-width="1.4"/>' +
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
    const duration=range(31,51);
    const delay=-range(2,duration);
    cat.className='amb-cat '+direction;
    cat.innerHTML=catSVG;
    cat.style.cssText='--base-y:'+range(1.8,4.2).toFixed(1)+'vh;--width:'+range(48,76).toFixed(0)+'px;--duration:'+duration.toFixed(2)+'s;--delay:'+delay.toFixed(2)+'s;--opacity:'+(calm?.55:.83)+';';
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

  // Midnight Cat Club: visual richness lives at the edges, not over chat or fanarts.
  const frame=document.createElement('span');frame.className='nyx-frame-glow';magic.append(frame);
  const sweep=document.createElement('span');sweep.className='nyx-sweep';magic.append(sweep);
  for(const side of ['left','right']){
    const nebula=document.createElement('span');nebula.className='nyx-nebula '+side;magic.append(nebula);
  }
  const constellationSVG='<svg viewBox="0 0 300 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
    '<path class="nyx-link" d="M27 37L72 75L140 27L172 91L248 61L272 132L199 179L125 143L72 75L50 165L125 143M172 91L199 179"/>'+
    '<circle class="nyx-point" cx="27" cy="37" r="3.2"/><circle class="nyx-point" cx="72" cy="75" r="4.4"/>'+
    '<circle class="nyx-point" cx="140" cy="27" r="3"/><circle class="nyx-point" cx="172" cy="91" r="5"/>'+
    '<circle class="nyx-point" cx="248" cy="61" r="3.2"/><circle class="nyx-point" cx="272" cy="132" r="3.4"/>'+
    '<circle class="nyx-point" cx="199" cy="179" r="4"/><circle class="nyx-point" cx="125" cy="143" r="3.6"/>'+
    '<circle class="nyx-point" cx="50" cy="165" r="2.4"/></svg>';
  for(const position of ['top-left','bottom-right']){
    const constellation=document.createElement('div');
    constellation.className='nyx-constellation '+position;
    constellation.innerHTML=constellationSVG;
    magic.append(constellation);
  }
  for(const side of ['a','b']){
    const ring=document.createElement('span');ring.className='nyx-ring '+side;orbits.append(ring);
  }
  const cometNodes=[];
  const numberOfComets=performance==='low'?1:calm?1:3;
  for(let i=0;i<numberOfComets;i++){
    const comet=document.createElement('span');
    comet.className='nyx-comet';
    const duration=range(13,24);
    const delay=-range(1,duration);
    comet.style.cssText='--top:'+range(10,54).toFixed(1)+'%;--duration:'+duration.toFixed(1)+'s;--delay:'+delay.toFixed(1)+'s;';
    trails.append(comet);
    cometNodes.push({el:comet,duration,phase:rand()});
  }
  const mothSVG='<svg viewBox="0 0 66 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="nyx-wing-left">'+
    '<path class="nyx-wings" d="M33 28C18 3 -2 9 7 26C-1 33 14 45 33 32Z"/><circle cx="16" cy="24" r="3" fill="#f4dbed"/></g>'+
    '<g class="nyx-wing-right"><path class="nyx-wings" d="M33 28C48 3 68 9 59 26C67 33 52 45 33 32Z"/><circle cx="50" cy="24" r="3" fill="#f4dbed"/></g>'+
    '<ellipse class="nyx-body" cx="33" cy="29" rx="3.5" ry="12"/><path d="M31 21L26 11M35 21L40 11" stroke="#d8b4e4" stroke-width="1.5" fill="none"/></svg>';
  const moths=[];
  const mothCount=performance==='low'?0:calm?2:4;
  for(let i=0;i<mothCount;i++){
    const moth=document.createElement('div');moth.className='nyx-moth';moth.innerHTML=mothSVG;
    const duration=range(12,22);
    moth.style.cssText='--x:'+(i%2===0?range(2,17):range(77,94)).toFixed(1)+'%;--y:'+range(16,75).toFixed(1)+'%;--size:'+range(22,38).toFixed(0)+'px;--duration:'+duration.toFixed(1)+'s;--delay:-'+range(0,duration).toFixed(1)+'s;';
    orbits.append(moth);moths.push({el:moth,duration,phase:rand()});
  }
  for(let i=0;i<(performance==='low'?2:calm?4:7);i++){
    const lantern=document.createElement('span');lantern.className='nyx-lantern';
    lantern.style.cssText='--x:'+(i%2===0?range(4,19):range(79,96)).toFixed(1)+'%;--y:'+range(19,77).toFixed(1)+'%;--size:'+range(14,31).toFixed(0)+'px;--duration:'+range(7,13).toFixed(1)+'s;--delay:-'+range(0,10).toFixed(1)+'s;';
    orbits.append(lantern);
  }
  for(let i=0;i<(performance==='low'?5:performance==='high'?30:calm?12:23);i++){
    const sparkle=document.createElement('i');sparkle.className='nyx-sparkle';
    const x=rand()<.5?range(1,24):range(76,99);
    sparkle.style.cssText='--x:'+x.toFixed(1)+'%;--y:'+range(12,92).toFixed(1)+'%;--size:'+range(4,12).toFixed(1)+'px;--duration:'+range(3,9).toFixed(1)+'s;--delay:-'+range(0,12).toFixed(1)+'s;';
    trails.append(sparkle);
  }
  const pawSVG='<svg viewBox="0 0 32 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="16" cy="25" rx="9" ry="7" />'+
    '<ellipse cx="5" cy="13" rx="3.3" ry="5"/><ellipse cx="12" cy="7" rx="3.4" ry="5.2"/><ellipse cx="22" cy="7" rx="3.4" ry="5.2"/><ellipse cx="29" cy="14" rx="3" ry="4.7"/></svg>';
  for(let i=0;i<(calm?5:9);i++){
    const paw=document.createElement('i');paw.className='nyx-pawprint';paw.innerHTML=pawSVG;
    paw.style.cssText='--x:'+(5+i*9.5).toFixed(1)+'vw;--bottom:'+(i%2===0?4.7:5.4)+'vh;--delay:'+(-i*.49).toFixed(2)+'s;--angle:'+(i%2===0?-22:14)+'deg;';
    pawprints.append(paw);
  }
  for(let i=0;i<(performance==='low'?0:calm?4:12);i++){
    const petal=document.createElement('i');petal.className='nyx-petal';
    petal.style.cssText='--x:'+(rand()<.5?range(1,20):range(80,97)).toFixed(1)+'%;--y:'+range(-12,33).toFixed(1)+'%;--size:'+range(6,14).toFixed(0)+'px;--duration:'+range(9,19).toFixed(1)+'s;--delay:-'+range(0,20).toFixed(1)+'s;';
    magic.append(petal);
  }

  scene.append(root);

  // Runtime: GSAP is the same seekable animation engine used by HyperFrames.
  // Register timelines for optional HyperFrames capture while preserving live OBS loops.
  const gsap=window.gsap;
  if(gsap && typeof gsap.timeline==='function'){
    root.classList.add('amb-gsap');
    root.classList.add('nyx-gsap');
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
    // Seamless repeated shooting stars and drifting lunar moths.
    // CSS continues to animate when GSAP is unavailable.
    for(const item of cometNodes){
      const t=gsap.timeline({repeat:-1,delay:-item.phase*item.duration});
      t.fromTo(item.el,{x:'-17vw',y:'5vh',autoAlpha:0,rotation:-17},
        {x:'117vw',y:'-11vh',autoAlpha:0,rotation:-17,duration:item.duration,ease:'none'});
      t.fromTo(item.el,{autoAlpha:0},{autoAlpha:.76,duration:.28},item.duration*.74);
      t.to(item.el,{autoAlpha:0,duration:.7},item.duration*.84);
      registry.push(t);
    }
    for(const item of moths){
      const t=gsap.timeline({repeat:-1,yoyo:true,delay:-item.phase*item.duration});
      t.fromTo(item.el,{x:'-2vw',y:'2vh',rotation:-21},
        {x:'5vw',y:'-4vh',rotation:20,duration:item.duration,ease:'sine.inOut'});
      registry.push(t);
    }
  }
  // Existing scene.js already pauses GSAP on OBS visibility. This pauses CSS fallback
  // for Halloween scene 00 as well, where the original script doesn't do that.
  const updateVisibility=()=>document.body.classList.toggle('amb-hidden',document.hidden);
  document.addEventListener('visibilitychange',updateVisibility);
  updateVisibility();
})();
