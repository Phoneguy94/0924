const VOICES={
  Jennifer:'assets/voices/Jennifer_100.mp3',
  Henry:'assets/voices/Henry_100.mp3'
};

const byId=id=>document.getElementById(id);
const state={a:{voice:'Jennifer',rate:1},b:{voice:'Henry',rate:1}};

function fillVoices(select,selected){
  Object.keys(VOICES).forEach(name=>{
    const opt=document.createElement('option');
    opt.value=name; opt.textContent=name; opt.selected=name===selected;
    select.appendChild(opt);
  });
}

function setupDeck(letter){
  const key=letter.toLowerCase();
  const audio=byId('audio'+letter);
  const voice=byId('voice'+letter);
  const rate=byId('rate'+letter);
  const rateOut=byId('rateOut'+letter);
  const play=byId('play'+letter);
  const restart=byId('restart'+letter);
  const name=byId('voiceName'+letter);
  const progress=byId('progress'+letter);
  fillVoices(voice,state[key].voice);

  function loadVoice(){
    state[key].voice=voice.value;
    name.textContent=voice.value;
    const wasPlaying=!audio.paused;
    audio.src=VOICES[voice.value];
    audio.playbackRate=state[key].rate;
    if(wasPlaying) audio.play().catch(()=>{});
  }
  function setRate(value){
    const v=Math.max(.70,Math.min(1.20,Number(value)));
    state[key].rate=v;
    rate.value=v.toFixed(2);
    rateOut.value=v.toFixed(2);
    audio.playbackRate=v;
    document.querySelectorAll(`.rate-pads[data-target="${letter}"] button`).forEach(b=>b.classList.toggle('active',Number(b.dataset.rate)===v));
  }
  voice.addEventListener('change',loadVoice);
  rate.addEventListener('input',()=>setRate(rate.value));
  play.addEventListener('click',()=>{
    if(audio.paused){audio.play().catch(()=>{});play.textContent='⏸ Pause';}
    else{audio.pause();play.textContent='▶ Play';}
  });
  restart.addEventListener('click',()=>{audio.currentTime=0;audio.play().catch(()=>{});play.textContent='⏸ Pause';});
  audio.addEventListener('timeupdate',()=>{progress.style.width=audio.duration?`${audio.currentTime/audio.duration*100}%`:'0%';});
  audio.addEventListener('ended',()=>{play.textContent='▶ Play';progress.style.width='0%';});
  document.querySelectorAll(`.rate-pads[data-target="${letter}"] button`).forEach(btn=>btn.addEventListener('click',()=>setRate(btn.dataset.rate)));
  loadVoice(); setRate(1);
  return {audio,setRate};
}

const deckA=setupDeck('A');
const deckB=setupDeck('B');

function applyCrossfade(){
  const x=Number(byId('crossfader').value)/100;
  // Equal-power crossfade keeps the center from sounding noticeably quieter.
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
  deckA.setRate(target); deckB.setRate(target);
});
