const phones=[
  {id:'8851',name:'Cisco IP Phone 8851',desc:'Classic MPP desk phone with a smaller 4:3 display.'},
  {id:'9851',name:'Cisco Desk Phone 9851',desc:'Compact color desk phone preview.'},
  {id:'9861',name:'Cisco Desk Phone 9861',desc:'Larger PhoneOS desk phone with more line-key capacity.'},
  {id:'9871',name:'Cisco Desk Phone 9871',desc:'Large widescreen PhoneOS display with a prominent idle clock.'},
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
const audio=new Audio();
let tones=[];
let activePhone=phones[1];

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
}

wallpaper.addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file)return;
  wallpaperPreview.src=URL.createObjectURL(file);
  wallpaperPreview.style.display='block';
});

document.querySelectorAll('.fit').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.fit').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  wallpaperPreview.style.objectFit=btn.dataset.fit;
});

fetch('../Webex_Ringtones/ringtones.json',{cache:'no-store'})
  .then(r=>r.json()).then(data=>{
    tones=data.filter(t=>t.file&&!t.pending);
    ringtone.innerHTML=tones.map(t=>`<option value="${t.number}">Ringtone ${t.number} — ${t.name}</option>`).join('');
    ringtone.value='11';
  });

function shiftTone(amount){
  if(!tones.length)return;
  const idx=Math.max(0,tones.findIndex(t=>String(t.number)===ringtone.value));
  const next=(idx+amount+tones.length)%tones.length;
  ringtone.value=tones[next].number;
  stopRing();
}

document.querySelector('#prev').onclick=()=>shiftTone(-1);
document.querySelector('#next').onclick=()=>shiftTone(1);
ringtone.addEventListener('change',stopRing);

function stopRing(){
  audio.pause();
  audio.currentTime=0;
  phone.classList.remove('ringing');
  ringBtn.textContent='Ring Phone';
}

ringBtn.onclick=()=>{
  if(phone.classList.contains('ringing')){stopRing();return;}
  const tone=tones.find(t=>String(t.number)===ringtone.value);
  if(!tone)return;
  audio.src=`../Webex_Ringtones/${tone.file}`;
  audio.play();
  phone.classList.add('ringing');
  ringBtn.textContent='Stop Ringing';
};
audio.addEventListener('ended',stopRing);

function updateClock(){
  const now=new Date();
  document.querySelector('#time').textContent=now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
}
updateClock();setInterval(updateClock,30000);