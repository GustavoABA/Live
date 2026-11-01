/* 15/11 Brasil: slideshow alternado VAI BRASIL! / fanart / VAI BRASIL! / fanart.
   Usa as fanarts originais sem alterá-las. Funciona offline da API após o fallback inicial. */
(() => {
  'use strict';
  const stage=document.querySelector('[data-br-slideshow]');
  if(!stage)return;
  const slogan=stage.querySelector('[data-br-slogan]');
  const art=stage.querySelector('[data-br-art]');
  const image=stage.querySelector('[data-br-image]');
  const progress=stage.querySelector('[data-br-progress]');
  const status=stage.querySelector('[data-br-status]');
  if(!slogan||!art||!image)return;
  const fallback=[{"name":"belle--nihilguh.webp"},{"name":"comunidade--01-guhf.webp"},{"name":"comunidade--02-strogonocofis.webp"},{"name":"comunidade--03-guhnoob.webp"},{"name":"comunidade--04-img-20240712-203208.webp"},{"name":"comunidade--05-guhlunar.webp"},{"name":"comunidade--06-57-sem-titulo-20240701170608.webp"},{"name":"comunidade--07-37-sem-titulo-20240506125023.webp"},{"name":"comunidade--09-guh-lunar-vtuber.webp"},{"name":"comunidade--10-3-sem-titulo-20250110235126.webp"},{"name":"comunidade--11-img-20241223-201814.webp"},{"name":"comunidade--12-guh-lunar.webp"},{"name":"comunidade--13-159-sem-titulo.webp"},{"name":"comunidade--14-spoiler-48-sem-titulo-20240923025237.webp"},{"name":"comunidade--15-rn-image-picker-lib-temp-81c77e56-0161-4f33-9798.webp"},{"name":"comunidade--16-65-sem-titulo-20240726063108.webp"},{"name":"comunidade--17-2310696-nrfpmj4s.webp"},{"name":"comunidade--18-60-sem-titulo.webp"},{"name":"comunidade--nihilguh-caderno-colorido.webp"}];
  const base=new URL('../../assets/fanarts/',location.href);
  const endpoint='https://api.github.com/repos/GustavoABA/Live/contents/assets/fanarts?ref=main';
  const params=new URLSearchParams(location.search);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const staticView=params.get('motion')==='0'||reduced;
  const interval=Number(params.get('slideSeconds'));
  const duration=Number.isFinite(interval)&&interval>=3&&interval<=30?interval*1000:5500;
  let files=fallback.slice(),index=0,phase='slogan',tickId;
  const imageName=file=>file.name;
  const show=(which)=>{
    phase=which;
    slogan.classList.toggle('active',which==='slogan');
    art.classList.toggle('active',which==='art');
    slogan.setAttribute('aria-hidden',String(which!=='slogan'));
    art.setAttribute('aria-hidden',String(which!=='art'));
    if(which==='art'){
      const file=files[index%files.length];
      if(file){
        const url=new URL(encodeURIComponent(file.name),base);
        if(image.src!==url.href)image.src=url.href;
        image.alt='Fanart da comunidade NihilGuh';
      }
    }
    if(status)status.textContent=which==='slogan'?'15 DE NOVEMBRO · VAI BRASIL!':'ARTES FEITAS POR VOCÊS';
    if(progress){
      progress.classList.remove('running');
      progress.style.setProperty('--slide-duration',(duration/1000)+'s');
      if(!staticView){void progress.offsetWidth;progress.classList.add('running');}
    }
  };
  const advance=()=>{
    if(document.hidden||staticView)return;
    if(phase==='slogan')show('art');
    else {index=(index+1)%files.length;show('slogan');}
  };
  const init=()=>{
    clearInterval(tickId);
    show(staticView?'art':'slogan');
    if(!staticView)tickId=setInterval(advance,duration);
  };
  const isImage=name=>/\.(png|webp|jpe?g|gif|avif)$/i.test(name);
  const discover=async()=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),5500);
    try{
      const response=await fetch(endpoint,{headers:{Accept:'application/vnd.github+json'},cache:'no-store',signal:controller.signal});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();
      if(!Array.isArray(data))throw new Error('Resposta inesperada');
      return data.filter(item=>item.type==='file'&&isImage(item.name))
        .sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(item=>({name:item.name}));
    }finally{clearTimeout(timeout)}
  };
  const sync=async()=>{
    try{
      const discovered=await discover();
      if(discovered.length){
        const current=files[index%files.length]?.name;
        files=discovered;
        const match=files.findIndex(f=>f.name===current);
        index=match<0?index%files.length:match;
      }
    }catch(error){console.warn('[Brasil] Fanarts: usando acervo de fallback.',error)}
  };
  image.onerror=()=>{
    if(files.length>1){
      index=(index+1)%files.length;
      const url=new URL(encodeURIComponent(files[index].name),base);
      if(image.src!==url.href)image.src=url.href;
    }
  };
  init();sync();
  const refresh=setInterval(()=>{if(!document.hidden)sync()},300000);
  window.addEventListener('pagehide',()=>{clearInterval(tickId);clearInterval(refresh)});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden){if(!staticView){show(phase);clearInterval(tickId);tickId=setInterval(advance,duration)}}
  });
})();