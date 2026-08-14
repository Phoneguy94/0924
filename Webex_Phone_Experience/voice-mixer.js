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
  return {audio,setRate};
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
