const phones=[
  {id:'8851',name:'Cisco IP Phone 8851',desc:'Classic MPP desk phone with a smaller 4:3 display and side line appearances.'},
  {id:'9851',name:'Cisco Desk Phone 9851',desc:'Compact PhoneOS color desk phone preview.'},
  {id:'9861',name:'Cisco Desk Phone 9861',desc:'PhoneOS desk phone with more line-key capacity and a larger working area.'},
  {id:'9871',name:'Cisco Desk Phone 9871',desc:'Large widescreen PhoneOS display with a prominent centered idle clock.'},
  {id:'8875',name:'Cisco Video Phone 8875',desc:'Touchscreen video phone with a large 4:3 display.'}
];
const models=document.querySelector('#models');
const phone=document.querySelector('#phone');
const wallpaper=document.querySelector('#wallpaper');
const wallpaperPreview=document.querySelector('#wallpaperPreview');
const ringtone=document.querySelector('#ringtone');
const ringBtn=document.querySelector('#ring');
const selectedName=document.querySelector('#selectedName');
const selectedDesc=document.querySelector('#selectedDesc');
const modelLabel=document.querySelector('#modelLabel');
const caller=document.querySelector('#caller');
const callerLabel=document.querySelector('#callerLabel');
const toneLabel=document.querySelector('#toneLabel');
const toneInfo=document.querySelector('#toneInfo');
const nowPlaying=document.querySelector('#nowPlaying');
const zoom=document.querySelector('#zoom');
const posX=document.querySelector('#posX');
const posY=document.querySelector('#posY');
const audio=new Audio();
let tones=[];
let activePhone=phones[1];
let wallpaperUrl='';

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
  btn.classList.add('active');
  phone.className=`phone model-${p.id}`;
  selectedName.textContent=p.id;
  selectedDesc.textContent=p.desc;
  modelLabel.textContent=p.name;
  stopRing();
}

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

document.querySelector('#resetWallpaper').onclick=()=>{
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
}

fetch('../Webex_Ringtones/ringtones.json',{cache:'no-store'})
  .then(r=>r.json()).then(data=>{
    tones=data.filter(t=>t.file&&!t.pending);
    ringtone.innerHTML=tones.map(t=>`<option value="${t.number}">Ringtone ${t.number} — ${t.name}</option>`).join('');
    ringtone.value='11';
    updateToneInfo();
  });

function shiftTone(amount){
  if(!tones.length)return;
  const idx=Math.max(0,tones.findIndex(t=>String(t.number)===ringtone.value));
  const next=(idx+amount+tones.length)%tones.length;
  ringtone.value=tones[next].number;
  stopRing();
  updateToneInfo();
}

document.querySelector('#prev').onclick=()=>shiftTone(-1);
document.querySelector('#next').onclick=()=>shiftTone(1);
ringtone.addEventListener('change',()=>{stopRing();updateToneInfo();});
caller.addEventListener('change',()=>{callerLabel.textContent=caller.value;stopRing();});

function stopRing(){
  audio.pause();
  audio.currentTime=0;
  phone.classList.remove('ringing');
  ringBtn.textContent='Ring Phone';
  nowPlaying.textContent='Ready to preview';
  nowPlaying.classList.remove('live');
}

ringBtn.onclick=()=>{
  if(phone.classList.contains('ringing')){stopRing();return;}
  const tone=currentTone();
  if(!tone)return;
  callerLabel.textContent=caller.value;
  toneLabel.textContent=tone.name;
  audio.src=`../Webex_Ringtones/${tone.file}`;
  audio.play().then(()=>{
    phone.classList.add('ringing');
    ringBtn.textContent='Stop Ringing';
    nowPlaying.textContent=`Now playing: ${tone.name} for ${caller.value}`;
    nowPlaying.classList.add('live');
  }).catch(()=>{
    nowPlaying.textContent='Audio could not start. Tap Ring Phone again.';
  });
};
audio.addEventListener('ended',stopRing);

function updateClock(){
  const now=new Date();
  document.querySelector('#time').textContent=now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
}
updateClock();setInterval(updateClock,30000);