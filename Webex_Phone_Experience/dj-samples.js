// Build v13: tuned real-sample DJ soundboard.
// Real samples are from jonjonsson/SoundMonster public-domain/CC0 collection.
// Deep bass is generated locally because the requested sound is a clean sub hit, not a drum roll.
(() => {
  const RAW='https://raw.githubusercontent.com/jonjonsson/SoundMonster/main/Public%20domain/';
  const SAMPLES={
    airhorn:'hype%20air%20horn.mp3',
    scratch:'hip%20hop%20record%20scratch%201.wav',
    scratch2:'hip%20hop%20record%20scratch%202.wav',
    crowd:'laughter%20sitcom%20audience%20crowd.mp3',
    bruh:'bruh.mp3',
    buzzer:'buzzer.mp3',
    boing:'boing%20cartoon.mp3'
  };
  const cache=new Map();
  function getAudio(key){
    if(!cache.has(key)){
      const a=new Audio(RAW+SAMPLES[key]);
      a.preload='auto';
      cache.set(key,a);
    }
    return cache.get(key);
  }
  function play(key,volume=0.95,rate=1){
    const a=getAudio(key);
    try{a.pause();a.currentTime=0;a.volume=volume;a.playbackRate=rate;a.play().catch(console.error);}catch(e){console.error(e);}
  }
  Object.keys(SAMPLES).forEach(getAudio);

  let ctx=null;
  function deepBass(){
    ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==='suspended') ctx.resume();
    const t=ctx.currentTime;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(82,t);
    osc.frequency.exponentialRampToValueAtTime(34,t+.55);
    gain.gain.setValueAtTime(.9,t);
    gain.gain.exponentialRampToValueAtTime(.001,t+.75);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);osc.stop(t+.78);
  }
  function bassDouble(){deepBass();setTimeout(deepBass,230);}

  const config={
    airhorn:['📯','AIR HORN','reggae horn',()=>play('airhorn',1)],
    siren:['📯','AIR HORN 2','louder horn',()=>{play('airhorn',1);setTimeout(()=>play('airhorn',1),330);}],
    bassdrop:['💿','SCRATCH 2','alternate cut',()=>play('scratch2',1)],
    scratch:['💿','SCRATCH','real vinyl',()=>play('scratch',1)],
    drumfill:['🔊','DEEP BASS','sub hit',deepBass],
    bell:['🎉','CROWD 2','bigger audience',()=>{play('crowd',1,.92);setTimeout(()=>play('crowd',.8,1.06),120);}],
    impact:['🔊','DOUBLE BASS','boom · boom',bassDouble],
    rewind:['💿','SCRATCH BACK','alternate cut',()=>play('scratch2',1,.82)],
    crowd:['🎉','CROWD','hype audience',()=>{play('crowd',1,1.05);setTimeout(()=>play('crowd',.65,.94),170);}]
  };

  document.querySelectorAll('.sound-pad[data-sfx]').forEach(btn=>{
    const c=config[btn.dataset.sfx];
    if(!c) return;
    const [icon,title,sub,fn]=c;
    btn.innerHTML=`${icon} <b>${title}</b><small>${sub}</small>`;
    btn.addEventListener('click',e=>{
      e.preventDefault();e.stopImmediatePropagation();fn();
      btn.classList.add('hit');setTimeout(()=>btn.classList.remove('hit'),160);
    },true);
  });

  const pull=document.getElementById('pullUpBtn');
  if(pull){
    pull.innerHTML='🚨📯 <b>PULL UP!!!</b><small>scratch · horn · bass · crowd · chaos</small>';
    pull.addEventListener('click',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      play('scratch2',1,.85);
      setTimeout(()=>play('airhorn',1),430);
      setTimeout(()=>play('airhorn',1),780);
      setTimeout(deepBass,1050);
      setTimeout(()=>play('crowd',1,1.03),1150);
      if(typeof throwBeads==='function') setTimeout(()=>throwBeads(50),650);
      const fx=document.getElementById('partyFx');if(fx) fx.classList.add('on');
    },true);
  }
})();
