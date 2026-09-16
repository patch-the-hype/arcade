/* Patch's Arcade v4 — front-page logic.
   Kaarten staan statisch in de HTML (SEO). JS filtert/zoekt alleen in het DOM. */
(function(){
  "use strict";
  var grid=document.getElementById('grid');
  if(!grid)return;
  var search=document.getElementById('search');
  var countLabel=document.getElementById('countLabel');
  var cards=[].slice.call(grid.querySelectorAll('.card'));
  var ALL=cards.length;
  var filter='all',q='';

  function setFilter(f){
    filter=f;
    document.querySelectorAll('.tab').forEach(function(t){t.setAttribute('aria-pressed',String(t.dataset.f===f));});
    render();
  }
  function render(){
    var shown=0;
    cards.forEach(function(c){
      var ok=(filter==='all'||c.dataset.team===filter)&&(!q||c.dataset.search.indexOf(q)>=0);
      c.classList.toggle('hidden',!ok);
      if(ok)shown++;
    });
    countLabel.textContent='· '+shown+'/'+ALL;
    var empty=document.getElementById('emptyMsg');
    empty.hidden=shown!==0;
  }
  document.querySelectorAll('.tab').forEach(function(t){
    t.addEventListener('click',function(){setFilter(t.dataset.f);});
  });
  search.addEventListener('input',function(){q=search.value.trim().toLowerCase();render();});

  document.getElementById('openBtn').addEventListener('click',function(){setFilter('open');});
  document.getElementById('closedBtn').addEventListener('click',function(){setFilter('closed');});

  /* random: kies een zichtbare (of alle) kaart en volg de href */
  document.getElementById('randomBtn').addEventListener('click',function(){
    var pool=cards.filter(function(c){return filter==='all'||c.dataset.team===filter;});
    var c=pool[Math.floor(Math.random()*pool.length)];
    if(c)location.href=c.getAttribute('href');
  });

  /* battle of the week: deterministische weekkeuze, roteert zonder rebuild */
  try{
    var now=new Date();
    var week=Math.floor(((now/864e5)-4+7)/7); /* dagen sinds epoch / 7 (do 4-1-1970 = week 0-kalender) */
    var battles=[].reduce.call(grid.querySelectorAll('.card'),function(acc,c){
      if(acc.indexOf(c.dataset.battle)<0)acc.push(c.dataset.battle);
      return acc;
    },[]);
    if(battles.length){
      var pick=battles[week%battles.length];
      cards.forEach(function(c){if(c.dataset.battle===pick)c.classList.add('is-btw');});
    }
  }catch(e){}

  render();
})();
