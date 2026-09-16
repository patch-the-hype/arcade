/* Patch's Arcade — front-page logic */
(function(){
  "use strict";
  var grid=document.getElementById('grid');
  var countLabel=document.getElementById('countLabel');
  var search=document.getElementById('search');
  var GAMES=[],filter='all',q='';
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function fmtT(s){return (Math.round(s*10)/10)+'s';}

  fetch('games.json').then(function(r){return r.json();}).then(function(d){
    GAMES=d.games||[];
    GAMES.sort(function(a,b){return a.wall_s-b.wall_s;});
    buildTicker();
    render();
    document.getElementById('randomBtn').addEventListener('click',function(){
      var pool=GAMES.filter(function(g){return filter==='all'||g.team===filter;});
      var g=pool[Math.floor(Math.random()*pool.length)];
      location.href='play.html?g='+encodeURIComponent(g.slug);
    });
    document.getElementById('openBtn').addEventListener('click',function(){setFilter('open');});
    document.getElementById('closedBtn').addEventListener('click',function(){setFilter('closed');});
  }).catch(function(){grid.innerHTML='<p class="empty">Could not load games.json</p>';});

  function setFilter(f){
    filter=f;
    document.querySelectorAll('.tab').forEach(function(t){t.setAttribute('aria-pressed',String(t.dataset.f===f));});
    render();
  }

  function buildTicker(){
    var t=document.getElementById('ticker');
    var items=GAMES.slice(0,10).map(function(g){
      var cls=g.team==='open'?'o':'c';
      return '<b class="'+cls+'">'+esc(g.model).toUpperCase()+'</b> '+esc(g.game).toUpperCase()+' · '+fmtT(g.wall_s);
    });
    var half=items.join('&nbsp;&nbsp;★&nbsp;&nbsp;');
    t.innerHTML=half+'&nbsp;&nbsp;★&nbsp;&nbsp;'+half+'&nbsp;&nbsp;★&nbsp;&nbsp;';
  }

  function card(g,featured){
    var teamCls=g.team==='open'?'open':'closed';
    var flag=g.team==='open'?'assets/flag-open.png':'assets/flag-closed.png';
    var teamTxt=g.team==='open'?'OPEN':'CLOSED';
    var win=g.winner?'<span class="win-pill">WON THE BATTLE</span>':'';
    return '<a class="card '+teamCls+(featured?' featured':'')+'" href="play.html?g='+encodeURIComponent(g.slug)+'">'+
      '<div class="thumb">'+
        '<img src="thumbs/'+g.slug+'.png" alt="Screenshot of '+esc(g.game)+' built by '+esc(g.model)+'" loading="lazy">'+
        '<span class="badge '+teamCls+'"><img src="'+flag+'" alt="">'+teamTxt+'</span>'+
        win+
        '<span class="play-pill">PLAY ▸</span>'+
      '</div>'+
      '<div class="card-body">'+
        '<span class="g-name">'+esc(g.game)+'</span>'+
        '<span class="time-chip">'+esc(g.model)+' · <b>'+fmtT(g.wall_s)+'</b></span>'+
      '</div>'+
    '</a>';
  }

  function render(){
    var list=GAMES.filter(function(g){
      return (filter==='all'||g.team===filter)&&(!q||g.game.indexOf(q)>=0||g.model.toLowerCase().indexOf(q)>=0);
    });
    countLabel.textContent='· '+list.length+'/'+GAMES.length;
    grid.innerHTML=list.length
      ?list.map(function(g,i){return card(g,i===0&&filter==='all'&&!q);}).join('')
      :'<p class="empty">No games match. The judge is not amused.</p>';
  }

  document.querySelectorAll('.tab').forEach(function(t){
    t.addEventListener('click',function(){setFilter(t.dataset.f);});
  });
  search.addEventListener('input',function(){q=search.value.trim().toLowerCase();render();});
})();
