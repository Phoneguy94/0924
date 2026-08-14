const VOICES=[
  'Maria','Daniel','Jennifer','Henry','Sophia','Ezra','Hazel','Oliver','Clara'
];
const byId=id=>document.getElementById(id);
const state={a:{voice:'Jennifer',rate:1,objectUrl:null},b:{voice:'Henry',rate:1,objectUrl:null}};

function voicePath(name){
  return `assets/voices/${name}_100.mp3`;
}

function fillVoices(select,selected){
  select.innerHTML='';
  VOICES.forEach(name=>{
    const opt=document.createElement('option');
    opt.value=name;
    opt.textContent=name;
    opt.selected=name===selected;
    select.appendChild(opt);
  });
}

function formatTime(seconds){
  if(!Number.isFinite(seconds)||seconds<0) seconds=0;
  const m=Math.floor(seconds/60);
  const s=Math.floor(seconds%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function setupDeck(letter){
  const key=letter.toLowerCase();
  const audio=byId('audio'+letter);
  const rate=byId('rate'+letter);
  const out=byId('rateOut'+letter);
  const play=byId('play'+letter);
  const restart=byId('restart'+letter);
  const seek=byId('seek'+letter);
  const time=byId('time'+letter);
  const voice=byId('voice'+letter);
  const voiceName=byId('voiceName'+letter);
  const status=byId('status'+letter);
  let userSeeking=false;
  let loadToken=0;

  audio.preservesPitch=true;
  audio.mozPreservesPitch=true;
  audio.webkitPreservesPitch=true;
  fillVoices(voice,state[key].voice);

  function setStatus(text,kind=''){
    status.textContent=text;
    status.dataset.kind=kind;
  }

  function updateTime(){
    time.textContent=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  }

  function setRate(v){
    v=Math.max(.70,Math.min(1.20,Number(v)));
    state[key].rate=v;
    rate.value=v.toFixed(2);
    out.value=v.toFixed(2);
    audio.playbackRate=v;
    document.querySelectorAll(`.rate-pads[data-target="${letter}"] button`).forEach(b=>{
      b.classList.toggle('active',Number(b.dataset.rate)===v);
    });
  }

  async function loadVoice(){
    const token=++loadToken;
    state[key].voice=voice.value;
    voiceName.textContent=voice.value;
    audio.pause();
    play.textContent='▶ Play';
    seek.value='0';
    time.textContent='0:00 / 0:00';
    setStatus(`Loading ${voice.value}_100.mp3 into memory…`);

    try{
      const response=await fetch(voicePath(voice.value),{cache:'no-store'});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob=await response.blob();
      if(token!==loadToken) return;

      if(state[key].objectUrl) URL.revokeObjectURL(state[key].objectUrl);
      state[key].objectUrl=URL.createObjectURL(blob);
      audio.src=state[key].objectUrl;
      audio.load();
      audio.playbackRate=state[key].rate;
      setStatus(`${voice.value}_100.mp3 loaded locally`,'ready');
    }catch(error){
      if(token!==loadToken) return;
      setStatus(`${voice.value}_100.mp3 failed to load`,'missing');
      console.error('Voice load failed',voice.value,error);
    }
  }

  voice.addEventListener('change',loadVoice);
  rate.addEventListener('input',()=>setRate(rate.value));

  play.addEventListener('click',()=>{
    if(audio.paused){
      audio.play().then(()=>play.textContent='⏸ Pause').catch(()=>{});
    }else{
      audio.pause();
      play.textContent='▶ Play';
    }
  });

  restart.addEventListener('click',()=>{
    audio.currentTime=0;
    seek.value='0';
    updateTime();
    audio.play().then(()=>play.textContent='⏸ Pause').catch(()=>{});
  });

  function seekToSlider(){
    if(!Number.isFinite(audio.duration)||audio.duration<=0) return;
    const ratio=Math.max(0,Math.min(1,Number(seek.value)/1000));
    audio.currentTime=ratio*audio.duration;
    updateTime();
  }

  seek.addEventListener('pointerdown',()=>{userSeeking=true;});
  seek.addEventListener('input',seekToSlider);
  const finishSeeking=()=>{userSeeking=false;};
  seek.addEventListener('pointerup',finishSeeking);
  seek.addEventListener('pointercancel',finishSeeking);
  seek.addEventListener('change',()=>{seekToSlider();finishSeeking();});

  audio.addEventListener('loadedmetadata',()=>{
    updateTime();
    setStatus(`${state[key].voice}_100.mp3 loaded locally`,'ready');
  });
  audio.addEventListener('error',()=>setStatus(`${state[key].voice}_100.mp3 could not be decoded`,'missing'));
  audio.addEventListener('timeupdate',()=>{
    if(!userSeeking && Number.isFinite(audio.duration) && audio.duration>0){
      seek.value=String(Math.round((audio.currentTime/audio.duration)*1000));
    }
    updateTime();
  });
  audio.addEventListener('ended',()=>{
    play.textContent='▶ Play';
    seek.value='1000';
    updateTime();
  });

  document.querySelectorAll(`.rate-pads[data-target="${letter}"] button`).forEach(btn=>{
    btn.addEventListener('click',()=>setRate(btn.dataset.rate));
  });

  setRate(1);
  loadVoice();
  return {audio,setRate,seek};
}

const deckA=setupDeck('A');
const deckB=setupDeck('B');

function applyCrossfade(){
  const x=Number(byId('crossfader').value)/100;
  deckA.audio.volume=Math.cos(x*Math.PI/2);
  deckB.audio.volume=Math.cos((1-x)*Math.PI/2);
  byId('xfadeOut').textContent=`${Math.round((1-x)*100)} / ${Math.round(x*100)}`;
  byId('meterA').style.width=`${Math.round(deckA.audio.volume*100)}%`;
  byId('meterB').style.width=`${Math.round(deckB.audio.volume*100)}%`;
}
byId('crossfader').addEventListener('input',applyCrossfade);
applyCrossfade();

byId('syncRate').addEventListener('click',()=>{
  const target=(state.a.rate+state.b.rate)/2;
  deckA.setRate(target);
  deckB.setRate(target);
});

// ---- DJ MODE LAYER ----
const proMode=byId('proMode');
const djMode=byId('djMode');
const djStage=byId('djStage');
const partyFx=byId('partyFx');
const lightsBtn=byId('lightsBtn');
const beatBtn=byId('beatBtn');
const beadsBtn=byId('beadsBtn');
const dropBtn=byId('dropBtn');
const heroTitle=byId('heroTitle');
const heroText=byId('heroText');
let beatTimer=null;
let audioCtx=null;

function getAudioCtx(){
  if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended') audioCtx.resume();
  return audioCtx;
}

function setMode(mode){
  const dj=mode==='dj';
  document.body.classList.toggle('dj-mode-active',dj);
  djStage.hidden=!dj;
  proMode.classList.toggle('active',!dj);
  djMode.classList.toggle('active',dj);
  partyFx.classList.toggle('on',dj && lightsBtn.classList.contains('active'));
  heroTitle.textContent=dj?'Compare voices like a completely unnecessary nightclub DJ.':'Compare two voices side by side.';
  heroText.textContent=dj?'Same Webex voice masters. Same working local playback core. Now with records, scratching, beats, lasers, smoke, beads and a soundboard nobody asked us to build.':'Pick any two Webex AI Agent voices, play them independently, adjust speaking rate live, and crossfade between them. Each voice uses its GitHub-hosted 1.00 master recording.';
}
proMode.addEventListener('click',()=>setMode('pro'));
djMode.addEventListener('click',()=>setMode('dj'));

function syncPlatterSpin(){
  byId('platterA').classList.toggle('spinning',!deckA.audio.paused);
  byId('platterB').classList.toggle('spinning',!deckB.audio.paused);
}
['play','pause','ended'].forEach(evt=>{
  deckA.audio.addEventListener(evt,syncPlatterSpin);
  deckB.audio.addEventListener(evt,syncPlatterSpin);
});

function setupScratch(platter,deck){
  let dragging=false;
  let startX=0;
  let startTime=0;
  platter.addEventListener('pointerdown',e=>{
    if(!Number.isFinite(deck.audio.duration)||deck.audio.duration<=0) return;
    dragging=true;
    startX=e.clientX;
    startTime=deck.audio.currentTime;
    platter.setPointerCapture(e.pointerId);
    platter.style.animationPlayState='paused';
  });
  platter.addEventListener('pointermove',e=>{
    if(!dragging) return;
    const delta=(e.clientX-startX)/160;
    deck.audio.currentTime=Math.max(0,Math.min(deck.audio.duration,startTime+delta*deck.audio.duration*.18));
  });
  const stop=e=>{
    dragging=false;
    platter.style.animationPlayState='running';
    if(platter.hasPointerCapture?.(e.pointerId)) platter.releasePointerCapture(e.pointerId);
  };
  platter.addEventListener('pointerup',stop);
  platter.addEventListener('pointercancel',stop);
}
setupScratch(byId('platterA'),deckA);
setupScratch(byId('platterB'),deckB);

function kick(at=0,level=.32){
  const ctx=getAudioCtx();
  const t=ctx.currentTime+at;
  const osc=ctx.createOscillator();
  const gain=ctx.createGain();
  osc.frequency.setValueAtTime(120,t);
  osc.frequency.exponentialRampToValueAtTime(45,t+.12);
  gain.gain.setValueAtTime(level,t);
  gain.gain.exponentialRampToValueAtTime(.001,t+.14);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);osc.stop(t+.15);
}
beatBtn.addEventListener('click',()=>{
  if(beatTimer){clearInterval(beatTimer);beatTimer=null;beatBtn.textContent='🥁 START BEAT';beatBtn.classList.remove('active');return;}
  kick();beatTimer=setInterval(kick,500);beatBtn.textContent='⏹ STOP BEAT';beatBtn.classList.add('active');
});

lightsBtn.addEventListener('click',()=>{
  lightsBtn.classList.toggle('active');
  const on=lightsBtn.classList.contains('active');
  lightsBtn.textContent=on?'⚡ LIGHTS ON':'🌑 LIGHTS OFF';
  partyFx.classList.toggle('on',on && !djStage.hidden);
});

function throwBeads(count=18){
  const layer=byId('beadLayer');
  for(let i=0;i<count;i++){
    const bead=document.createElement('span');
    bead.className='bead';
    bead.textContent=['📿','🟣','🟢','🟡'][Math.floor(Math.random()*4)];
    bead.style.left=`${Math.random()*100}%`;
    bead.style.setProperty('--drift',`${(Math.random()-.5)*280}px`);
    bead.style.animationDelay=`${Math.random()*.35}s`;
    layer.appendChild(bead);
    setTimeout(()=>bead.remove(),3000);
  }
}
beadsBtn.addEventListener('click',()=>throwBeads(24));

dropBtn.addEventListener('click',()=>{
  playSfx('bassdrop');
  throwBeads(42);
  partyFx.classList.add('on');
  document.body.animate([{filter:'brightness(1)'},{filter:'brightness(1.65)'},{filter:'brightness(.75)'},{filter:'brightness(1)'}],{duration:520});
  if(!beatTimer){kick();setTimeout(kick,180);setTimeout(kick,360);}
});

// ---- DJ SOUNDBOARD ----
function oscTone(freq,duration,{type='sawtooth',gain=.16,start=0,endFreq=null}={}){
  const ctx=getAudioCtx();
  const t=ctx.currentTime+start;
  const o=ctx.createOscillator();
  const g=ctx.createGain();
  o.type=type;
  o.frequency.setValueAtTime(Math.max(1,freq),t);
  if(endFreq) o.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),t+duration);
  g.gain.setValueAtTime(gain,t);
  g.gain.exponentialRampToValueAtTime(.001,t+duration);
  o.connect(g).connect(ctx.destination);
  o.start(t);o.stop(t+duration+.02);
}

function noiseBurst(duration=.25,gain=.12,start=0,filterFreq=1800){
  const ctx=getAudioCtx();
  const length=Math.max(1,Math.floor(ctx.sampleRate*duration));
  const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<length;i++) data[i]=(Math.random()*2-1)*(1-i/length);
  const src=ctx.createBufferSource();
  const filter=ctx.createBiquadFilter();
  const g=ctx.createGain();
  filter.type='bandpass';filter.frequency.value=filterFreq;filter.Q.value=.8;
  g.gain.value=gain;
  src.buffer=buffer;src.connect(filter).connect(g).connect(ctx.destination);
  const t=ctx.currentTime+start;src.start(t);
}

function airHorn(){
  [0,.05,.1].forEach((d,i)=>{oscTone(235+i*7,.42,{type:'square',gain:.09,start:d});oscTone(352+i*8,.42,{type:'sawtooth',gain:.07,start:d});});
  setTimeout(()=>{oscTone(210,.5,{type:'square',gain:.1});oscTone(315,.5,{type:'sawtooth',gain:.08});},360);
}
function siren(){
  const ctx=getAudioCtx();const t=ctx.currentTime;
  const o=ctx.createOscillator();const g=ctx.createGain();o.type='sawtooth';
  o.frequency.setValueAtTime(380,t);o.frequency.exponentialRampToValueAtTime(980,t+1.25);o.frequency.exponentialRampToValueAtTime(520,t+1.75);
  g.gain.setValueAtTime(.10,t);g.gain.exponentialRampToValueAtTime(.001,t+1.8);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+1.82);
}
function bassDrop(){
  oscTone(95,1.15,{type:'sine',gain:.38,endFreq:28});
  noiseBurst(.18,.13,0,350);
}
function scratchFx(){
  for(let i=0;i<7;i++){noiseBurst(.055,.09,i*.055,900+(i%2)*1800);oscTone(i%2?780:420,.05,{type:'square',gain:.035,start:i*.055,endFreq:i%2?350:900});}
}
function drumFill(){
  for(let i=0;i<8;i++){const d=i*.085;kick(d,.13+i*.012);noiseBurst(.045,.05,d,2200);}
  kick(.72,.34);
}
function bell(){
  [880,1320,1760,2310].forEach((f,i)=>oscTone(f,1.15-i*.1,{type:'sine',gain:.1/(i+1)}));
}
function impact(){
  noiseBurst(.55,.18,0,180);oscTone(62,.7,{type:'sine',gain:.38,endFreq:26});oscTone(180,.18,{type:'sawtooth',gain:.07,endFreq:65});
}
function rewind(){
  const ctx=getAudioCtx();const t=ctx.currentTime;
  const o=ctx.createOscillator();const g=ctx.createGain();o.type='sawtooth';
  o.frequency.setValueAtTime(1200,t);o.frequency.exponentialRampToValueAtTime(90,t+.85);g.gain.setValueAtTime(.11,t);g.gain.exponentialRampToValueAtTime(.001,t+.86);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.88);
  for(let i=0;i<6;i++) noiseBurst(.06,.045,i*.11,2200-i*260);
}
function crowdHype(){
  for(let i=0;i<20;i++){noiseBurst(.42,.015+Math.random()*.018,Math.random()*.35,450+Math.random()*2200);}
  [320,380,450,520].forEach((f,i)=>oscTone(f,.45,{type:'triangle',gain:.025,start:i*.045,endFreq:f*1.15}));
}

function playSfx(name){
  getAudioCtx();
  const map={airhorn:airHorn,siren,bassdrop:bassDrop,scratch:scratchFx,drumfill:drumFill,bell,impact,rewind,crowd:crowdHype};
  map[name]?.();
}

document.querySelectorAll('.sound-pad[data-sfx]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    btn.classList.add('hit');setTimeout(()=>btn.classList.remove('hit'),120);
    playSfx(btn.dataset.sfx);
  });
});

byId('pullUpBtn').addEventListener('click',()=>{
  const btn=byId('pullUpBtn');btn.classList.add('hit');setTimeout(()=>btn.classList.remove('hit'),180);
  rewind();
  setTimeout(airHorn,650);
  setTimeout(siren,1150);
  setTimeout(()=>{bassDrop();impact();throwBeads(55);partyFx.classList.add('on');document.body.animate([{filter:'brightness(1)'},{filter:'brightness(1.8)'},{filter:'brightness(.6)'},{filter:'brightness(1)'}],{duration:760});},2350);
});

setMode('pro');
