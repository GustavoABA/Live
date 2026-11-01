/* NihilGuh Brasil / 15 de novembro — decoração SVG e GSAP para Browser Source OBS.
   Símbolos vetoriais são estilizações comemorativas da bandeira, não modelos oficiais para hasteamento.
   Não interfere no tema original, Halloween ou Adam. */
(() => {
  'use strict';
  const scene=document.querySelector('.scene');
  if(!scene||!document.body.classList.contains('brasil')||scene.querySelector('.br-effects'))return;
  const q=new URLSearchParams(location.search);
  const sceneId=Number(scene.dataset.scene||0);
  const limited=[3,4,6].includes(sceneId);
  const noMotion=q.get('motion')==='0'||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const noFx=q.get('fx')==='0';
  const low=q.get('intensity')==='low'||q.get('fx')==='low';
  const high=q.get('intensity')==='high';
  if(noMotion)document.body.classList.add('br-motion-off');
  if(noFx)document.body.classList.add('br-fx-off');
  let seed=(15111889+sceneId*617)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const between=(lo,hi)=>lo+(hi-lo)*random();
  const date=document.createElement('div');
  date.className='br-date';date.setAttribute('aria-label','15 de novembro — Proclamação da República');
  date.innerHTML='<b>15 · NOVEMBRO</b><span>Proclamação da República</span>';
  scene.append(date);
  if(noFx)return;
  const root=document.createElement('div');root.className='br-effects';root.setAttribute('aria-hidden','true');
  const create=(cls)=>{const el=document.createElement('div');el.className=cls;root.append(el);return el};
  const ambient=create('br-glow');
  for(let i=0;i<2;i++){const r=document.createElement('div');r.className='br-ribbon'+(i?' r2':'');root.append(r);}
  for(const side of ['',' right']){const o=document.createElement('div');o.className='br-orbit'+side;root.append(o);}
  const flags=create('br-flags'),particles=create('br-particles'),walkers=create('br-walkers');
  const star=(x,y,r)=>'<path d="M'+x.toFixed(1)+' '+(y-r).toFixed(1)+'l'+(r*.28).toFixed(1)+' '+(r*.72).toFixed(1)+'h'+(r*.8).toFixed(1)+'l-'+(r*.65).toFixed(1)+' '+(r*.48).toFixed(1)+'l'+(r*.24).toFixed(1)+' '+(r*.82).toFixed(1)+'l-'+(r*.67).toFixed(1)+'-'+(r*.49).toFixed(1)+'l-'+(r*.69).toFixed(1)+' '+(r*.47).toFixed(1)+'l'+(r*.29).toFixed(1)+'-'+(r*.79).toFixed(1)+'l-'+(r*.68).toFixed(1)+'-'+(r*.48).toFixed(1)+'h'+(r*.85).toFixed(1)+'Z" fill="#fff"/>';
  let starItems='';
  for(let i=0;i<27;i++){
    const a=i*2.399963229728653;
    const radius=between(8,37);const x=120+Math.cos(a)*radius,y=80+Math.sin(a)*radius;
    if(y>70&&y<91)continue; // evita cobrir a faixa branca comemorativa
    starItems+=star(x,y,between(1.7,2.8));
  }
  const flagSVG='<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
    '<g class="br-flag-fabric"><rect width="240" height="160" rx="2" fill="#079447"/>'+
    '<polygon points="120,12 228,80 120,148 12,80" fill="#ffdf4e"/>'+
    '<circle cx="120" cy="80" r="43" fill="#084db2"/>'+starItems+
    '<path d="M78 73Q121 57 163 77L163 88Q124 70 79 85Z" fill="#fff" />'+
    '<text x="120" y="78" font-family="Arial,sans-serif" font-size="7" text-anchor="middle" fill="#11783c" font-weight="700">ORDEM E PROGRESSO</text>'+
    '<path class="br-flag-light" d="M7 0Q49 67 6 160H0V0Z" fill="#fff" opacity=".2"/>'+
    '<path d="M235 0Q209 76 236 160H240V0Z" fill="#003e4a" opacity=".14"/></g></svg>';
  // Flags wave at edges, leaving the main viewing area readable.
  const flagConfig=limited?[[3,19,86,.36],[85,64,86,.32],[91,14,65,.26]]:
   [[3,18,125,.72],[86,21,135,.64],[8,69,90,.43],[87,68,95,.44],[48,8,57,.27],[45,84,60,.25]];
  const gsapFlags=[];
  flagConfig.forEach(([x,y,size,opacity],i)=>{
    const flag=document.createElement('div');flag.className='br-flag'+(i<2?' flag-corner '+(i?'right':'left'):'');
    const d=between(3,6);
    flag.style.cssText='--fx:'+x+'vw;--fy:'+y+'vh;--flag-size:'+size+'px;--fo:'+opacity+';--fd:'+d.toFixed(2)+'s;--delay:-'+(i*1.9)+'s;';
    flag.innerHTML=flagSVG;flags.append(flag);gsapFlags.push({el:flag,duration:d,phase:random()});
  });
  const personSVG='<svg viewBox="0 0 128 184" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
    '<g class="br-person"><ellipse class="br-shadow" cx="60" cy="176" rx="37" ry="5" fill="#032b2e"/>'+
    '<g class="br-leg-two"><path d="M48 117L44 161L58 162L72 123Z" fill="#082f7a"/><path d="M42 157L58 158L62 173L37 173Z" fill="#0b224d"/></g>'+
    '<g class="br-leg-one"><path d="M72 119L72 159L87 162L88 128Z" fill="#1462b8"/><path d="M72 158L87 157L98 171L69 174Z" fill="#082b52"/></g>'+
    '<path d="M40 61Q62 52 85 65L89 124Q63 134 41 124Z" fill="#f3d64c"/>'+
    '<path d="M42 77Q60 70 88 80L87 100Q62 94 42 105Z" fill="#188c55" opacity=".77"/>'+
    '<path d="M42 67Q26 69 25 92" fill="none" stroke="#ad7753" stroke-width="13" stroke-linecap="round"/>'+
    '<g class="br-arm"><path d="M84 70Q101 69 102 43" fill="none" stroke="#ad7753" stroke-width="12" stroke-linecap="round"/></g>'+
    '<circle cx="62" cy="36" r="19" fill="#ba825e"/>'+
    '<path d="M44 35Q39 14 59 14Q85 10 83 34Q75 26 61 26Q51 25 44 35Z" fill="#1d1c27"/>'+
    '<circle cx="73" cy="38" r="2.1" fill="#162438"/><path d="M68 48Q76 53 82 46" fill="none" stroke="#7d4033" stroke-width="1.6"/>'+
    '<g class="br-handflag"><path d="M102 45L109 -82" stroke="#ece6bd" stroke-width="4" stroke-linecap="round"/>'+
    '<g transform="translate(108,-79) scale(.33)"><rect width="240" height="160" fill="#099749"/>'+
    '<polygon points="120,12 228,80 120,148 12,80" fill="#ffe450"/>'+
    '<circle cx="120" cy="80" r="42" fill="#1458a9"/>'+
    '<path d="M80 76Q121 58 161 77L162 91Q119 72 80 89Z" fill="#fff"/>'+
    '<circle cx="119" cy="61" r="2" fill="#fff"/><circle cx="138" cy="97" r="2" fill="#fff"/></g></g></g></svg>';
  const gsapWalkers=[];
  const count=low?1:limited?1:high?4:3;
  for(let i=0;i<count;i++){
    const w=document.createElement('div');w.className='br-walker'+((i+sceneId)%2?' reverse':'');
    const duration=between(25,44);const reverse=w.className.includes('reverse');
    w.style.cssText='--bottom:'+between(2.3,5.2).toFixed(1)+'vh;--size:'+between(74,105).toFixed(0)+'px;--dur:'+duration.toFixed(1)+'s;--del:-'+between(2,duration).toFixed(1)+'s;--op:'+(limited?.55:.81)+';';
    w.innerHTML=personSVG;walkers.append(w);
    gsapWalkers.push({el:w,duration,phase:random(),reverse});
  }
  const sparks=low?9:limited?16:high?55:34;
  for(let i=0;i<sparks;i++){
    const node=document.createElement('span');node.className='br-spark';
    node.textContent=['✦','★','✧','·','✺'][i%5];
    const color=['#ffdf4f','#e9ffbf','#4dd999','#73c9ff'][i%4];
    node.style.cssText='--x:'+between(3,97).toFixed(1)+'%;--y:'+between(9,94).toFixed(1)+'%;--size:'+between(7,22).toFixed(0)+'px;--clr:'+color+';--dur:'+between(4,10).toFixed(1)+'s;--del:-'+between(0,15).toFixed(1)+'s;';
    particles.append(node);
  }
  const pieces=low?6:limited?10:high?38:24;
  for(let i=0;i<pieces;i++){
    const el=document.createElement('i');el.className='br-confetti';
    el.style.cssText='--x:'+between(3,97).toFixed(1)+'%;--w:'+between(3,7).toFixed(0)+'px;--h:'+between(8,16).toFixed(0)+'px;--dur:'+between(10,22).toFixed(1)+'s;--del:-'+between(0,24).toFixed(1)+'s;--clr:'+['#099c55','#ffe36c','#3781d7','#f0fff4'][i%4]+';';
    particles.append(el);
  }
  for(let i=0;i<(limited?1:3);i++){
    const ray=document.createElement('span');ray.className='br-ray';
    ray.style.cssText='--x:'+between(10,89).toFixed(1)+'%;--w:'+between(1,4).toFixed(1)+'vw;--dur:'+between(13,22).toFixed(1)+'s;--del:-'+between(1,19).toFixed(1)+'s;';
    root.append(ray);
  }
  const badge=document.createElement('span');badge.className='br-badge';badge.textContent='NihilGuh · Especial Brasil 🇧🇷';root.append(badge);
  scene.append(root);
  // Browser Source: GSAP timelines when available; CSS keyframes otherwise.
  const gsap=window.gsap;
  let loops=[];
  if(gsap&&!noMotion&&typeof gsap.timeline==='function'){
    root.classList.add('br-gsap');
    loops=Array.isArray(window.__timelines)?window.__timelines:(window.__timelines=[]);
    for(const f of gsapFlags){
      const t=gsap.timeline({repeat:-1,yoyo:true});
      t.fromTo(f.el,{skewY:-4,scaleX:.97,rotation:-5},{skewY:4,scaleX:1.03,rotation:5,duration:f.duration,ease:'sine.inOut'});
      t.progress(f.phase);loops.push(t);
    }
    for(const w of gsapWalkers){
      const t=gsap.timeline({repeat:-1});
      t.fromTo(w.el,{x:w.reverse?'122vw':'-22vw'},{x:w.reverse?'-22vw':'122vw',duration:w.duration,ease:'none'});
      t.progress(w.phase);loops.push(t);
    }
  }
  // Source visibility is managed by the OBS browser; pause effects while hidden.
  const update=()=>{
    const hidden=document.hidden;
    document.body.classList.toggle('br-paused',hidden);
    if(loops.length)for(const t of loops){if(hidden&&typeof t.pause==='function')t.pause();else if(!hidden&&typeof t.resume==='function')t.resume();}
  };
  document.addEventListener('visibilitychange',update);update();
})();
