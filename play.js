/* Patch's Arcade — play shell logic */
(function(){
  "use strict";
  var p=new URLSearchParams(location.search);
  var slug=p.get('g');
  var frame=document.getElementById('frame'),hint=document.getElementById('hint');
  fetch('games.json').then(function(r){return r.json();}).then(function(d){
    var g=(d.games||[]).filter(function(x){return x.slug===slug;})[0];
    if(!g){document.getElementById('t').textContent='GAME NOT FOUND';return;}
    document.title=g.game+' by '+g.model+" — Patch's Arcade";
    var teamCls=g.team==='open'?'open':'closed';
    document.getElementById('t').innerHTML=
      esc(g.game)+' <span class="chip '+teamCls+'"><img src="assets/flag-'+teamCls+'.png" alt="">'+
      (teamCls==='open'?'OPEN':'CLOSED')+'</span>';
    document.getElementById('r').innerHTML=
      '<span class="t-'+teamCls+'">BUILT BY <b>'+esc(g.model)+'</b></span>'+
      '<span>IN <b>'+g.wall_s+'s</b></span>'+
      '<span>JUDGE <b>'+g.points+'/5</b></span>';
    frame.src='games/'+encodeURIComponent(g.slug)+'.html';
  }).catch(function(){document.getElementById('t').textContent='GAME NOT FOUND';});

  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  function focusGame(){
    hint.classList.add('hidden');
    frame.focus();
    try{frame.contentWindow.focus();}catch(e){}
  }
  hint.addEventListener('click',focusGame);
  frame.addEventListener('load',function(){setTimeout(function(){hint.classList.remove('hidden');},0);});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!document.fullscreenElement&&hint.classList.contains('hidden')){
      hint.classList.remove('hidden');
    }
  });
  var fsBtn=document.getElementById('fsBtn');
  if(document.fullscreenEnabled){
    fsBtn.hidden=false;
    fsBtn.addEventListener('click',function(){
      var st=document.querySelector('.stage');
      if(document.fullscreenElement){document.exitFullscreen();}else{st.requestFullscreen();}
    });
  }
})();
