const phones=[
  {id:'8851',name:'Cisco IP Phone 8851',desc:'Classic MPP desk phone with a 5-inch display and side line appearances.',image:'https://cdn11.bigcommerce.com/s-2kqswvsy80/images/stencil/1280x1280/products/37283/2167864/2167864__10246.1689584137.jpg?c=2'},
  {id:'9851',name:'Cisco Desk Phone 9851',desc:'Compact PhoneOS color desk phone with six physical line keys.',image:'https://www.atlasphones.com/cdn/shop/files/Cisco9851Deskphone-stockphoto1_medium.jpg?v=1730129675'},
  {id:'9861',name:'Cisco Desk Phone 9861',desc:'PhoneOS desk phone with a larger display and ten physical line keys.',image:'https://cdn11.bigcommerce.com/s-u3uxlvxq3h/images/stencil/600x600/products/10565/43089/Cisco-9861-Black-Front__90638.1714765534.jpg?c=1'},
  {id:'9871',name:'Cisco Desk Phone 9871',desc:'Large 5-inch high-resolution touchscreen with a prominent idle clock.',image:'https://networkdevicesinc.com/cdn/shop/files/Cisco-9871-Black-Front__96731_600x_crop_center.jpg?v=1746717305'},
  {id:'8875',name:'Cisco Video Phone 8875',desc:'Full video phone with a 7-inch touchscreen and integrated camera.',image:'https://cdn11.bigcommerce.com/s-z2d8eutrbc/images/stencil/1280x1280/products/18497/29449/1075752247__90975.1710819922.jpg?c=1'}
];

const $=selector=>document.querySelector(selector);
const models=$('#models');
const phone=$('#phone');
const devicePhoto=$('#devicePhoto');
const wallpaper=$('#wallpaper');
const wallpaperPreview=$('#wallpaperPreview');
const ringtone=$('#ringtone');
const ringBtn=$('#ring');
const selectedName=$('#selectedName');
const selectedDesc=$('#selectedDesc');
const modelLabel=$('#modelLabel');
const caller=$('#caller');
const callerLabel=$('#callerLabel');
const toneLabel=$('#toneLabel');
const toneInfo=$('#toneInfo');
const nowPlaying=$('#nowPlaying');
const zoom=$('#zoom');
const posX=$('#posX');
const posY=$('#posY');
const compareControl=$('#compareControl');
const compareSlider=$('#compareSlider');
const compareValue=$('#compareValue');
const lightTextLayer=$('#lightTextLayer');
const compareDivider=$('#compareDivider');
const audio=new Audio();
let tones=[];
let activePhone=phones[1];
let wallpaperUrl='';
let cadenceTimers=[];
let playToken=0;
let isRinging=false;
let appearance='light';

function syncTextLayers(){
  const timeCopy=$('.time-copy');
  const modelCopy=$('.model-copy');
  const callerCopy=$('.caller-copy');
  const toneCopy=$('.tone-copy');
  if(timeCopy)timeCopy.textContent=$('#time').textContent;
  if(modelCopy)modelCopy.textContent=modelLabel.textContent;
  if(callerCopy)callerCopy.textContent=callerLabel.textContent;
  if(toneCopy)toneCopy.textContent=toneLabel.textContent;
}

phones.forEach(p=>{
  const btn=document.createElement('button');
  btn.className='model'+(p.id===activePhone.id?' active':'');
  btn.textContent=p.id;
  btn.onclick=()=>selectPhone(p,btn);
  models.appendChild(btn);
});

function selectPhone(p,btn){
  activePhone=p;
  document.querySelectorAll('.model').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  phone.className=`phone-photo model-${p.id}`;
  phone.dataset.appearance=appearance;
  devicePhoto.src=p.image;
  devicePhoto.alt=p.name;
  if(devicePhoto.complete)applyAspectRatio();
  selectedName.textContent=p.id;
  selectedDesc.textContent=p.desc;
  modelLabel.textContent=p.name;
  syncTextLayers();
  applyAppearance();
  stopRing();
}

function applyAspectRatio(){
  if(devicePhoto.naturalWidth&&devicePhoto.naturalHeight){
    phone.style.setProperty('--ar',`${devicePhoto.naturalWidth} / ${devicePhoto.naturalHeight}`);
  }
}

devicePhoto.addEventListener('error',()=>{
  nowPlaying.textContent=`The ${activePhone.id} product image host did not respond. Try refreshing.`;
  nowPlaying.classList.remove('live');
});
devicePhoto.addEventListener('load',applyAspectRatio);

function setComparePosition(){
  const darkPercent=Number(compareSlider.value);
  lightTextLayer.style.clipPath=`inset(0 0 0 ${darkPercent}%)`;
  lightTextLayer.style.webkitClipPath=`inset(0 0 0 ${darkPercent}%)`;
  compareDivider.style.left=`${darkPercent}%`;
  compareValue.textContent=`${darkPercent}% dark text / ${100-darkPercent}% light text`;
}

function applyAppearance(){
  phone.dataset.appearance=appearance;
  compareControl.hidden=appearance!=='compare';
  document.querySelectorAll('.appearance').forEach(btn=>btn.classList.toggle('active',btn.dataset.appearance===appearance));
  if(appearance==='compare')setComparePosition();
}

document.querySelectorAll('.appearance').forEach(btn=>{
  btn.addEventListener('click',()=>{
    appearance=btn.dataset.appearance;
    applyAppearance();
  });
});
compareSlider.addEventListener('input',setComparePosition);

function updateWallpaperTransform(){
  wallpaperPreview.style.transform=`scale(${Number(zoom.value)/100})`;
  wallpaperPreview.style.objectPosition=`${posX.value}% ${posY.value}%`;
}

wallpaper.addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file)return;
  if(wallpaperUrl)URL.revokeObjectURL(wallpaperUrl);
  wallpaperUrl=URL.createObjectURL(file);
  wallpaperPreview.src=wallpaperUrl;
  wallpaperPreview.style.display='block';
  zoom.value='100';posX.value='50';posY.value='50';
  updateWallpaperTransform();
});

[zoom,posX,posY].forEach(control=>control.addEventListener('input',updateWallpaperTransform));

document.querySelectorAll('.fit').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.fit').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  wallpaperPreview.style.objectFit=btn.dataset.fit;
});

$('#resetWallpaper').onclick=()=>{
  if(wallpaperUrl)URL.revokeObjectURL(wallpaperUrl);
  wallpaperUrl='';
  wallpaper.value='';
  wallpaperPreview.removeAttribute('src');
  wallpaperPreview.style.display='none';
  wallpaperPreview.style.objectFit='cover';
  zoom.value='100';posX.value='50';posY.value='50';
  updateWallpaperTransform();
  document.querySelectorAll('.fit').forEach(b=>b.classList.toggle('active',b.dataset.fit==='cover'));
};

function currentTone(){return tones.find(t=>String(t.number)===ringtone.value);}
function updateToneInfo(){
  const tone=currentTone();
  if(!tone)return;
  toneInfo.querySelector('strong').textContent=`Ringtone ${tone.number} — ${tone.name}`;
  toneInfo.querySelector('span').textContent=`${tone.description} Recommended: ${tone.recommended}`;
  toneLabel.textContent=tone.name;
  syncTextLayers();
}

fetch('../Webex_Ringtones/ringtones.json',{cache:'no-store'}).then(r=>r.json()).then(data=>{
  tones=data.filter(t=>t.file&&!t.pending);
  ringtone.innerHTML=tones.map(t=>`<option value="${t.number}">Ringtone ${t.number} — ${t.name}</option>`).join('');
  ringtone.value='11';
  updateToneInfo();
});

function shiftTone(amount){
  if(!tones.length)return;
  const idx=Math.max(0,tones.findIndex(t=>String(t.number)===ringtone.value));
  ringtone.value=tones[(idx+amount+tones.length)%tones.length].number;
  stopRing();
  updateToneInfo();
}

$('#prev').onclick=()=>shiftTone(-1);
$('#next').onclick=()=>shiftTone(1);
ringtone.addEventListener('change',()=>{stopRing();updateToneInfo();});
caller.addEventListener('change',()=>{callerLabel.textContent=caller.value;syncTextLayers();stopRing();});

function clearCadenceTimers(){cadenceTimers.forEach(clearTimeout);cadenceTimers=[];}
function schedule(fn,delay){const timer=setTimeout(fn,delay);cadenceTimers.push(timer);return timer;}
function resetRingUi(){
  isRinging=false;
  phone.classList.remove('ringing');
  ringBtn.textContent='Ring Phone';
  nowPlaying.textContent='Ready to preview';
  nowPlaying.classList.remove('live');
}
function stopRing(){
  playToken++;
  clearCadenceTimers();
  audio.pause();
  audio.loop=false;
  audio.currentTime=0;
  resetRingUi();
}
function beginRingUi(tone){
  isRinging=true;
  phone.classList.add('ringing');
  ringBtn.textContent='Stop Ringing';
  nowPlaying.textContent=`Now playing: ${tone.name} for ${caller.value}`;
  nowPlaying.classList.add('live');
}
function playBellcoreCadence(tone){
  stopRing();
  const token=++playToken;
  const cycles=3,onMs=2000,offMs=4000;
  let cycle=0;
  audio.src=`../Webex_Ringtones/${tone.file}`;
  audio.loop=true;
  beginRingUi(tone);
  const ringOnce=()=>{
    if(token!==playToken)return;
    cycle++;
    audio.currentTime=0;
    audio.play().catch(()=>{
      if(token===playToken){stopRing();nowPlaying.textContent='Audio could not start. Tap Ring Phone again.';}
    });
    schedule(()=>{
      if(token!==playToken)return;
      audio.pause();
      audio.currentTime=0;
      if(cycle>=cycles){audio.loop=false;resetRingUi();return;}
      schedule(ringOnce,offMs);
    },onMs);
  };
  ringOnce();
}

ringBtn.onclick=()=>{
  if(isRinging){stopRing();return;}
  const tone=currentTone();
  if(!tone)return;
  callerLabel.textContent=caller.value;
  toneLabel.textContent=tone.name;
  syncTextLayers();
  if(/^Bellcore-dr[1-5]$/i.test(tone.name)){playBellcoreCadence(tone);return;}
  stopRing();
  const token=++playToken;
  audio.src=`../Webex_Ringtones/${tone.file}`;
  audio.loop=false;
  audio.play().then(()=>{if(token===playToken)beginRingUi(tone);}).catch(()=>{
    if(token===playToken){resetRingUi();nowPlaying.textContent='Audio could not start. Tap Ring Phone again.';}
  });
};

audio.addEventListener('ended',()=>{if(!audio.loop)stopRing();});
function updateClock(){
  $('#time').textContent=new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  syncTextLayers();
}
updateClock();
setInterval(updateClock,30000);
applyAppearance();
selectPhone(activePhone,document.querySelector('.model.active'));