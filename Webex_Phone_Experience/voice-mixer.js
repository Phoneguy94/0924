const VOICES=[
  'Maria','Daniel','Jennifer','Henry','Sophia','Ezra','Hazel','Oliver','Clara'
];
const byId=id=>document.getElementById(id);
const state={a:{voice:'Jennifer',rate:1},b:{voice:'Henry',rate:1}};

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
  if(!Number.isFinite(seconds) || seconds<0) seconds=0;
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
  let seeking=false;

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

  function loadVoice(){
    state[key].voice=voice.value;
    voiceName.textContent=voice.value;
    const wasPlaying=!audio.paused;
    audio.pause();
    audio.src=voicePath(voice.value);
    audio.load();
    audio.playbackRate=state[key].rate;
    play.textContent='▶ Play';
    seek.value='0';
    time.textContent='0:00 / 0:00';
    setStatus(`Loading ${voice.value}_100.mp3…`);
    if(wasPlaying){
      audio.play().then(()=>play.textContent='⏸ Pause').catch(()=>{});
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

  seek.addEventListener('pointerdown',()=>{seeking=true;});
  seek.addEventListener('input',()=>{
    if(!Number.isFinite(audio.duration) || audio.duration<=0) return;
    const ratio=Number(seek.value)/1000;
    audio.currentTime=ratio*audio.duration;
    updateTime();
  });
  seek.addEventListener('change',()=>{seeking=false;});
  seek.addEventListener('pointerup',()=>{seeking=false;});
  seek.addEventListener('pointercancel',()=>{seeking=false;});

  audio.addEventListener('loadedmetadata',()=>{
    updateTime();
    setStatus(`${state[key].voice}_100.mp3 ready`,'ready');
  });
  audio.addEventListener('canplay',()=>setStatus(`${state[key].voice}_100.mp3 ready`,'ready'));
  audio.addEventListener('error',()=>setStatus(`${state[key].voice}_100.mp3 is not in the GitHub voice folder yet`,'missing'));
  audio.addEventListener('timeupdate',()=>{
    if(!seeking && Number.isFinite(audio.duration) && audio.duration>0){
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

byId('syncPlayback').addEventListener('click',()=>{
  const a=deckA.audio;
  const b=deckB.audio;
  if(!Number.isFinite(a.duration) || !Number.isFinite(b.duration) || a.duration<=0 || b.duration<=0) return;

  const aProgress=a.currentTime/a.duration;
  const bProgress=b.currentTime/b.duration;
  let targetProgress;

  if(!a.paused && b.paused) targetProgress=aProgress;
  else if(a.paused && !b.paused) targetProgress=bProgress;
  else targetProgress=(aProgress+bProgress)/2;

  targetProgress=Math.max(0,Math.min(1,targetProgress));
  a.currentTime=targetProgress*a.duration;
  b.currentTime=targetProgress*b.duration;
  deckA.seek.value=String(Math.round(targetProgress*1000));
  deckB.seek.value=String(Math.round(targetProgress*1000));
});
