// Build v12: real-sample DJ soundboard override.
// Sources: jonjonsson/SoundMonster public-domain/CC0 collection.
// Capture-phase handlers stop the older synthesized v11 pad handlers.
(() => {
  const RAW='https://raw.githubusercontent.com/jonjonsson/SoundMonster/main/Public%20domain/';
  const SAMPLES={
    airhorn:'hype%20air%20horn.mp3',
    scratch:'hip%20hop%20record%20scratch%201.wav',
    scratch2:'hip%20hop%20record%20scratch%202.wav',
    drumfill:'announcement%20timpani%20roll.mp3',
    crowd:'laughter%20sitcom%20audience%20crowd.mp3',
    trainhorn:'horn%20air%20horn%20train.mp3'
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
  function play(key,volume=0.85){
    const a=getAudio(key);
    try{a.pause();a.currentTime=0;a.volume=volume;a.play().catch(console.error);}catch(e){console.error(e);}
  }
  Object.keys(SAMPLES).forEach(getAudio);

  const map={airhorn:'airhorn',scratch:'scratch',drumfill:'drumfill',crowd:'crowd'};
  document.querySelectorAll('.sound-pad[data-sfx]').forEach(btn=>{
    btn.addEventListener('click',e=>{
      const key=map[btn.dataset.sfx];
      if(!key) return; // leave unsupported legacy pads alone until replaced
      e.preventDefault();e.stopImmediatePropagation();
      play(key);
      btn.classList.add('hit');setTimeout(()=>btn.classList.remove('hit'),160);
    },true);
  });

  // Repurpose unsupported synth pads into additional real samples.
  const replacements={
    siren:['📯','AIR HORN 2','train horn','trainhorn'],
    bassdrop:['💿','SCRATCH 2','alternate cut','scratch2'],
    bell:['🎉','CROWD 2','audience hit','crowd'],
    impact:['🥁','DRUM ROLL 2','timpani','drumfill'],
    rewind:['💿','SCRATCH BACK','scratch cut','scratch2']
  };
  Object.entries(replacements).forEach(([oldKey,[icon,title,sub,newKey]])=>{
    const btn=document.querySelector(`.sound-pad[data-sfx="${oldKey}"]`);
    if(!btn) return;
    btn.innerHTML=`${icon} <b>${title}</b><small>${sub}</small>`;
    btn.addEventListener('click',e=>{
      e.preventDefault();e.stopImmediatePropagation();play(newKey);
      btn.classList.add('hit');setTimeout(()=>btn.classList.remove('hit'),160);
    },true);
  });

  const pull=document.getElementById('pullUpBtn');
  if(pull){
    pull.innerHTML='🚨📯 <b>PULL UP!!!</b><small>scratch · horn · crowd · chaos</small>';
    pull.addEventListener('click',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      play('scratch2');
      setTimeout(()=>play('airhorn',.95),500);
      setTimeout(()=>play('airhorn',.95),900);
      setTimeout(()=>play('crowd',.72),1250);
      if(typeof throwBeads==='function') setTimeout(()=>throwBeads(50),700);
      const fx=document.getElementById('partyFx');if(fx) fx.classList.add('on');
    },true);
  }
})();
