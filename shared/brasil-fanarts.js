/* NihilGuh Brasil — deterministic fanart scheduler.
   Shared master clock with Brasil motion; never blends two slides together. */
(() => {
  'use strict';
  const stage=document.querySelector('[data-br-slideshow]');
  if(!stage)return;
  const slogan=stage.querySelector('[data-br-slogan]');
  const art=stage.querySelector('[data-br-art]');
  const img=stage.querySelector('[data-br-image]');
  const progress=stage.querySelector('[data-br-progress]');
  const progressBar=progress?.querySelector('span');
  const status=stage.querySelector('[data-br-status]');
  if(!slogan||!art||!img)return;

  const fallback=[{"name":"belle--nihilguh.webp"},{"name":"comunidade--01-guhf.webp"},{"name":"comunidade--02-strogonocofis.webp"},{"name":"comunidade--03-guhnoob.webp"},{"name":"comunidade--04-img-20240712-203208.webp"},{"name":"comunidade--05-guhlunar.webp"},{"name":"comunidade--06-57-sem-titulo-20240701170608.webp"},{"name":"comunidade--07-37-sem-titulo-20240506125023.webp"},{"name":"comunidade--09-guh-lunar-vtuber.webp"},{"name":"comunidade--10-3-sem-titulo-20250110235126.webp"},{"name":"comunidade--11-img-20241223-201814.webp"},{"name":"comunidade--12-guh-lunar.webp"},{"name":"comunidade--13-159-sem-titulo.webp"},{"name":"comunidade--14-spoiler-48-sem-titulo-20240923025237.webp"},{"name":"comunidade--15-rn-image-picker-lib-temp-81c77e56-0161-4f33-9798.webp"},{"name":"comunidade--16-65-sem-titulo-20240726063108.webp"},{"name":"comunidade--17-2310696-nrfpmj4s.webp"},{"name":"comunidade--18-60-sem-titulo.webp"},{"name":"comunidade--nihilguh-caderno-colorido.webp"}];
  const base=new URL('../../assets/fanarts/',location.href);
  const endpoint='https://api.github.com/repos/GustavoABA/Live/contents/assets/fanarts?ref=main';
  const params=new URLSearchParams(location.search);
  const requested=Number(params.get('slideSeconds'));
  const duration=Number.isFinite(requested)&&requested>=3&&requested<=30?requested:5.5;
  const staticView=params.get('motion')==='0'||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fadeSeconds=Math.min(.44,duration*.12);
  let files=fallback.slice();
  let currentSlot=-1,displayedName='',nativeFrame=0,lastFrame=0,nativeElapsed=0,unsubscribe=null;
  let disposed=false;
  const badFiles=new Set();

  const loadArt=(filename)=>{
    if(!filename||filename===displayedName)return;
    displayedName=filename;
    img.src=new URL(encodeURIComponent(filename),base).href;
    img.alt='Fanart da comunidade NihilGuh';
  };
  const setActive=(which,artIndex)=>{
    const showArt=which==='art';
    slogan.classList.toggle('active',!showArt);
    art.classList.toggle('active',showArt);
    slogan.setAttribute('aria-hidden',String(showArt));
    art.setAttribute('aria-hidden',String(!showArt));
    // The other panel becomes hidden immediately. Fade never overlaps content.
    (showArt?slogan:art).style.opacity='0';
    if(showArt&&files.length){
      const file=files[artIndex%files.length];
      loadArt(file.name);
    }
    if(status)status.textContent=showArt?'ARTES FEITAS POR VOCÊS':'15 DE NOVEMBRO · VAI BRASIL!';
  };
  const render=(elapsed)=>{
    if(disposed)return;
    // Nonanimated mode shows one community fanart and a complete progress bar.
    const time=staticView?duration:Math.max(0,elapsed);
    const slot=staticView?1:Math.floor(time/duration);
    const artIndex=staticView?0:Math.floor(slot/2)%Math.max(files.length,1);
    const which=slot%2?'art':'slogan';
    if(slot!==currentSlot){
      currentSlot=slot;
      setActive(which,artIndex);
    }
    const phase=staticView?duration/2:time-slot*duration;
    const alpha=staticView?1:Math.max(0,Math.min(1,phase/fadeSeconds,(duration-phase)/fadeSeconds));
    (which==='art'?art:slogan).style.opacity=alpha.toFixed(3);
    if(progressBar)progressBar.style.width=(staticView?100:Math.min(100,(phase/duration)*100)).toFixed(2)+'%';
    if(progress)progress.classList.remove('running');
  };

  img.onerror=()=>{
    // Move to another known image when a file disappears, without a redirect loop.
    if(!displayedName||badFiles.has(displayedName))return;
    badFiles.add(displayedName);
    const next=files.find(f=>!badFiles.has(f.name));
    if(next)loadArt(next.name);
  };
  const discover=async()=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),5500);
    try{
      const response=await fetch(endpoint,{
        headers:{Accept:'application/vnd.github+json'},
        cache:'no-store',signal:controller.signal
      });
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();
      if(!Array.isArray(data))throw new Error('Formato inesperado');
      return data.filter(f=>f.type==='file'&&/\.(png|jpe?g|webp|gif|avif)$/i.test(f.name))
        .sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(f=>({name:f.name}));
    }finally{clearTimeout(timeout)}
  };
  const sync=async()=>{
    try{
      const discovered=await discover();
      if(!disposed&&discovered.length)files=discovered;
    }catch(error){console.warn('[Brasil] Acervo local preservado:',error)}
  };
  const clock=window.BrasilMotionClock;
  if(!staticView&&clock&&typeof clock.subscribe==='function'){
    unsubscribe=clock.subscribe(render);
  }else if(!staticView&&typeof requestAnimationFrame==='function'){
    const step=(now)=>{
      if(disposed)return;
      if(!lastFrame)lastFrame=now;
      if(!document.hidden)nativeElapsed+=Math.max(0,Math.min((now-lastFrame)/1000,.08));
      lastFrame=now;
      render(nativeElapsed);
      nativeFrame=requestAnimationFrame(step);
    };
    nativeFrame=requestAnimationFrame(step);
  }else{
    render(duration);
  }
  if(staticView)render(duration);
  sync();
  const refresh=setInterval(()=>{if(!document.hidden)sync()},300000);
  window.addEventListener('pagehide',()=>{
    disposed=true;clearInterval(refresh);
    if(nativeFrame)cancelAnimationFrame(nativeFrame);
    if(typeof unsubscribe==='function')unsubscribe();
  });
})();
