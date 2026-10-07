(function(){
  "use strict";

  var params=new URLSearchParams(window.location.search);
  var stage=document.getElementById("compositor-output");
  var statusEl=document.getElementById("hub-status");
  if(!stage) return;

  var layers=new Map();
  var media=new Map();
  var socket=null;
  var retryTimer=null;
  var debug=params.get("debug")==="1";
  var wsUrl=params.get("compositorWs")||"ws://127.0.0.1:8791/ws";

  function debugText(text){
    if(!debug||!statusEl) return;
    statusEl.textContent=String(text||"");
    statusEl.classList.add("is-visible");
  }

  function getLayer(id,zIndex){
    if(layers.has(id)){
      var existing=layers.get(id);
      existing.style.zIndex=String(zIndex||1);
      return existing;
    }
    var img=document.createElement("img");
    img.className="compositor-page-layer";
    img.alt="";
    img.draggable=false;
    img.dataset.overlayId=id;
    img.style.zIndex=String(zIndex||1);
    stage.appendChild(img);
    layers.set(id,img);
    return img;
  }

  function syncOverlays(items){
    var valid=new Set((items||[]).map(function(item){return String(item.id);}));
    layers.forEach(function(el,id){
      if(valid.has(id)) return;
      el.remove();
      layers.delete(id);
    });
    (items||[]).forEach(function(item){
      getLayer(String(item.id),item.zIndex);
    });
  }

  function playMedia(message){
    if(!message.src||message.muted) return;
    if(String(message.src).indexOf("blob:")===0) return;

    var key=String(message.mediaId||((message.overlayId||"overlay")+":"+message.src));
    var old=media.get(key);
    if(old){try{old.pause();}catch(e){} media.delete(key);}

    var audio=new Audio(message.src);
    audio.preload="auto";
    audio.volume=Math.max(0,Math.min(1,Number(message.volume==null?1:message.volume)));
    audio.loop=Boolean(message.loop);
    audio.addEventListener("ended",function(){media.delete(key);},{once:true});
    media.set(key,audio);
    audio.play().catch(function(error){
      debugText("Audio bloqueado: "+(error&&error.message?error.message:error));
    });
  }

  function stopMedia(message){
    var key=String(message.mediaId||"");
    var audio=media.get(key);
    if(!audio) return;
    try{audio.pause();}catch(e){}
    media.delete(key);
  }

  function handle(message){
    if(!message||typeof message!=="object") return;

    if(message.type==="hello"){
      syncOverlays(message.overlays||[]);
      debugText("Compositor conectado · "+(message.overlays||[]).length+" paginas");
      return;
    }

    if(message.type==="frame"){
      var layer=getLayer(String(message.id),message.zIndex);
      if(message.data) layer.src=message.data;
      return;
    }

    if(message.type==="media-play"){
      playMedia(message);
      return;
    }

    if(message.type==="media-stop") stopMedia(message);
  }

  function connect(){
    window.clearTimeout(retryTimer);
    debugText("Conectando ao compositor local...");

    try{socket=new WebSocket(wsUrl);}catch(error){
      retryTimer=window.setTimeout(connect,1500);
      return;
    }

    socket.addEventListener("open",function(){debugText("Compositor conectado");});
    socket.addEventListener("message",function(event){
      try{handle(JSON.parse(event.data));}catch(error){
        debugText("Mensagem invalida do compositor");
      }
    });
    socket.addEventListener("close",function(){
      debugText("Compositor offline · reconectando...");
      retryTimer=window.setTimeout(connect,1200);
    });
    socket.addEventListener("error",function(){
      try{socket.close();}catch(e){}
    });
  }

  connect();
})();
