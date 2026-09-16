/* Patch's Arcade v4 — play shell.
   Gamedata staat statisch in <script type="application/json" id="gdata"> (CSP-safe data blok). */
(function(){
  "use strict";
  var dataEl=document.getElementById('gdata');
  if(!dataEl)return;
  var G=JSON.parse(dataEl.textContent);
  var frame=document.getElementById('frame'),hint=document.getElementById('hint');

  document.title=G.title+" by "+G.model+" | Patch's Arcade";
  frame.src='../games/'+G.slug+'.html';
  frame.setAttribute('aria-label',G.title+' game, built by '+G.model);
  document.getElementById('hintSub').textContent=
    'Unedited AI output. Built by '+G.model+' in '+G.wall_s+' seconds.';
  var keys=document.getElementById('hintKeys');
  if(G.controls_text&&G.controls_text!=='TAP / CLICK'){
    keys.hidden=false;keys.textContent='KEYS: '+G.controls_text;
  }else{
    document.getElementById('hintBig').textContent='TAP TO PLAY';
  }

  /* ── focus & ESC ── */
  function focusGame(){
    hint.classList.add('hidden');
    frame.focus();
    try{frame.contentWindow.focus();}catch(e){}
  }
  hint.addEventListener('click',focusGame);
  frame.addEventListener('load',function(){setTimeout(function(){hint.classList.remove('hidden');},0);});

  var toastEl=document.getElementById('toast'),toastT;
  function toast(msg){
    toastEl.textContent=msg;toastEl.classList.add('show');
    clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('show');},1800);
  }
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!document.fullscreenElement&&hint.classList.contains('hidden')){
      hint.classList.remove('hidden');
      toast('ESC = EXIT GAME');
    }
  });

  /* ── fullscreen ── */
  var fsBtn=document.getElementById('fsBtn');
  if(document.fullscreenEnabled){
    fsBtn.hidden=false;
    fsBtn.addEventListener('click',function(){
      var st=document.querySelector('.stage');
      if(document.fullscreenElement){document.exitFullscreen();}else{st.requestFullscreen();}
    });
  }

  /* ── runs-teller (lokaal) ── */
  try{
    var runs=JSON.parse(localStorage.getItem('ptah-runs')||'{}');
    runs[G.slug]=(runs[G.slug]||0)+1;
    localStorage.setItem('ptah-runs',JSON.stringify(runs));
    document.getElementById('runs').textContent='YOUR RUNS: '+runs[G.slug];
  }catch(e){}

  /* ── stem: welke AI won deze battle? ── */
  var voteBox=document.getElementById('vote');
  if(voteBox){
    var KEY='ptah-vote-'+G.battle;
    var current=null;
    try{current=localStorage.getItem(KEY);}catch(e){}
    var btns=[].slice.call(voteBox.querySelectorAll('.vote-btn'));
    function paint(){
      btns.forEach(function(b){b.classList.toggle('voted',b.dataset.model===current);});
      var note=document.getElementById('voteNote');
      if(current){note.textContent='Your pick: '+current+'. Saved on this device.';}
    }
    btns.forEach(function(b){
      b.addEventListener('click',function(){
        try{localStorage.setItem(KEY,b.dataset.model);current=b.dataset.model;paint();toast('VOTE SAVED');}catch(e){toast('VOTE FAILED');}
      });
    });
    paint();
  }

  /* ── share ── */
  var shareBtn=document.getElementById('shareBtn');
  shareBtn.addEventListener('click',function(){
    var url=location.href,title=G.title+' | Patch\'s Arcade';
    if(navigator.share){
      navigator.share({title:title,text:'Built 100% by '+G.model+' in '+G.wall_s+'s. Play it free:',url:url}).catch(function(){});
    }else if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(function(){toast('LINK COPIED');},function(){toast(url);});
    }else{toast(url);}
  });

  /* ── touch controls: synthetiseer toetsenbord-events de iframe in ── */
  var touch=document.getElementById('touch');
  if(touch&&G.touch&&matchMedia('(pointer: coarse)').matches){
    var SCHEMES={
      arrows:{up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'},
      wasd:{up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD'},
      ws:{up:'KeyW',down:'KeyS'},
      ad:{left:'KeyA',right:'KeyD'}
    };
    var scheme=SCHEMES[G.touch.scheme]||null;
    var action=G.touch.action||null;
    var dpad=document.getElementById('dpad'),actBtn=document.getElementById('actBtn');
    if(!scheme)dpad.style.display='none';
    if(!action)actBtn.style.display='none';
    else if(action==='KeyR')actBtn.textContent='R';
    touch.classList.add('on');
    function keyName(code){return code==='Space'?' ':code.replace(/^Arrow/,'');}
    function send(code,type){
      try{
        var doc=frame.contentDocument,win=frame.contentWindow;
        win.focus();
        var ev=new KeyboardEvent(type,{key:keyName(code),code:code,keyCode:code==='Space'?32:0,which:code==='Space'?32:0,bubbles:true,cancelable:true});
        doc.dispatchEvent(ev);
        (doc.activeElement||doc.body).dispatchEvent(ev);
      }catch(e){}
    }
    function bind(el,code){
      var on=false;
      el.addEventListener('pointerdown',function(e){e.preventDefault();on=true;send(code,'keydown');});
      ['pointerup','pointercancel','pointerleave'].forEach(function(t){
        el.addEventListener(t,function(){if(on){on=false;send(code,'keyup');}});
      });
    }
    dpad.querySelectorAll('.tbtn[data-dir]').forEach(function(el){
      var code=scheme&&scheme[el.dataset.dir];
      if(code)bind(el,code);else el.style.visibility='hidden';
    });
    if(action)bind(actBtn,action);
    /* eerste touch op de overlay focust meteen het spel */
    touch.addEventListener('pointerdown',function(){hint.classList.add('hidden');},{once:true});
  }
})();
