const board=document.querySelector('#board');
const filters=document.querySelector('#filters');
const search=document.querySelector('#search');
const empty=document.querySelector('#empty');
const audio=new Audio();
let ringtones=[];
let activeFilter='All';
let playingNumber=null;

function normalize(value){return String(value||'').toLowerCase();}
function categoriesFor(r){return Array.isArray(r.category)?r.category:[r.category].filter(Boolean);}

function matches(r){
  const q=normalize(search.value);
  const cats=categoriesFor(r);
  const filterOk=activeFilter==='All'||cats.includes(activeFilter);
  const text=[r.number,r.name,r.description,r.recommended,cats.join(' ')].map(normalize).join(' ');
  return filterOk&&(!q||text.includes(q));
}

function setPlaying(number){
  playingNumber=number;
  document.querySelectorAll('.tile').forEach(tile=>{
    const isPlaying=Number(tile.dataset.number)===playingNumber;
    tile.classList.toggle('playing',isPlaying);
    const play=tile.querySelector('.play');
    if(play) play.textContent=isPlaying?'■':'▶';
    tile.setAttribute('aria-pressed',String(isPlaying));
  });
}

function stopAudio(){
  audio.pause();
  audio.currentTime=0;
  setPlaying(null);
}

function playTone(r){
  if(r.pending||!r.file) return;
  if(playingNumber===r.number){stopAudio();return;}
  audio.pause();
  audio.currentTime=0;
  audio.src=r.file;
  audio.play().then(()=>setPlaying(r.number)).catch(err=>{
    console.warn('Audio playback failed',err);
    setPlaying(null);
  });
}

audio.addEventListener('ended',()=>setPlaying(null));
audio.addEventListener('pause',()=>{if(audio.currentTime===0)setPlaying(null);});

function makeTile(r){
  const tile=document.createElement('button');
  tile.className='tile'+(r.pending?' pending':'');
  tile.type='button';
  tile.dataset.number=r.number;
  tile.setAttribute('aria-pressed','false');
  tile.innerHTML=`
    <div class="topline">
      <div>
        <div class="num">Ringtone ${r.number}${r.default?' • Default':''}</div>
        <div class="name">${r.name}</div>
      </div>
      <div class="play">${r.pending?'—':'▶'}</div>
    </div>
    <div class="equalizer"><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span></div>
    <div class="desc">${r.description||''}</div>
    <div class="rec"><b>Recommended for</b>${r.recommended||''}</div>
    <div>${categoriesFor(r).map(c=>`<span class="badge">${c}</span>`).join(' ')}</div>
  `;
  tile.addEventListener('click',()=>playTone(r));
  return tile;
}

function render(){
  board.innerHTML='';
  const visible=ringtones.filter(matches);
  visible.forEach(r=>board.appendChild(makeTile(r)));
  empty.classList.toggle('show',visible.length===0);
  setPlaying(playingNumber);
}

function renderFilters(){
  const cats=['All',...new Set(ringtones.flatMap(categoriesFor))];
  filters.innerHTML='';
  cats.forEach(cat=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='filter'+(cat===activeFilter?' active':'');
    btn.textContent=cat;
    btn.addEventListener('click',()=>{
      activeFilter=cat;
      document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.textContent===cat));
      render();
    });
    filters.appendChild(btn);
  });
}

search.addEventListener('input',render);

fetch('ringtones.json',{cache:'no-store'})
  .then(res=>res.json())
  .then(data=>{
    ringtones=data;
    renderFilters();
    render();
  })
  .catch(err=>{
    console.error('Failed to load ringtone data',err);
    empty.textContent='Could not load ringtone data. Check ringtones.json.';
    empty.classList.add('show');
  });
