const byId=id=>document.getElementById(id);
const state={a:{rate:1,url:null},b:{rate:1,url:null}};
function setupDeck(letter){
  const key=letter.toLowerCase();
  const audio=byId('audio'+letter), rate=byId('rate'+letter), out=byId('rateOut'+letter), play=byId('play'+letter), restart=byId('restart'+letter), progress=byId('progress'+letter), file=byId('file'+letter), fileName=byId('fileName'+letter), voice=byId('voice'+letter), voiceName=byId('voiceName'+letter);
  audio.preservesPitch=true; audio.mozPreservesPitch=true; audio.webkitPreservesPitch=true;
  function setRate(v){v=Math.max(.70,Math.min(1.20,Number(v)));state[key].rate=v;rate.value=v.toFixed(2);out.value=v.toFixed(2);audio.playbackRate=v;document.querySelectorAll(`.rate-pads[data-target="${letter}"] button`).forEach(b=>b.classList.toggle('active',Number(b.dataset.rate)===v));}
  voice.addEventListener('change',()=>voiceName.textContent=voice.value);
  file.addEventListener('change',()=>{const f=file.files&&file.files[0];if(!f)return;if(state[key].url)URL.revokeObjectURL(state[key].url);state[key].url=URL.createObjectURL(f);audio.src=state[key].url;audio.load();fileName.textContent=f.name;play.textContent='▶ Play';progress.style.width='0%';});
  rate.addEventListener('input',()=>setRate(rate.value));
  play.addEventListener('click',()=>{if(!audio.src){file.click();return;}if(audio.paused){audio.play().catch(()=>{});play.textContent='⏸ Pause';}else{audio.pause();play.textContent='▶ Play';}});
  restart.addEventListener('click',()=>{if(!audio.src){file.click();return;}audio.currentTime=0;audio.play().catch(()=>{});play.textContent='⏸ Pause';});
  audio.addEventListener('timeupdate',()=>progress.style.width=audio.duration?`${audio.currentTime/audio.duration*100}%`:'0%');
  audio.addEventListener('ended',()=>{play.textContent='▶ Play';progress.style.width='0%';});
  document.querySelectorAll(`.rate-pads[data-target="${letter}"] button`).forEach(btn=>btn.addEventListener('click',()=>setRate(btn.dataset.rate)));
  setRate(1);
  return {audio,setRate};
}
const deckA=setupDeck('A'),deckB=setupDeck('B');
function applyCrossfade(){const x=Number(byId('crossfader').value)/100;deckA.audio.volume=Math.cos(x*Math.PI/2);deckB.audio.volume=Math.cos((1-x)*Math.PI/2);byId('xfadeOut').textContent=`${Math.round((1-x)*100)} / ${Math.round(x*100)}`;byId('meterA').style.width=`${Math.round(deckA.audio.volume*100)}%`;byId('meterB').style.width=`${Math.round(deckB.audio.volume*100)}%`;}
byId('crossfader').addEventListener('input',applyCrossfade);applyCrossfade();
byId('syncRate').addEventListener('click',()=>{const target=(state.a.rate+state.b.rate)/2;deckA.setRate(target);deckB.setRate(target);});
