
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const state={config:null,user:JSON.parse(localStorage.getItem('ac_user')||'null')};
async function loadConfig(){try{state.config=await fetch('data/config.json').then(r=>r.json())}catch{state.config={serverName:'AetherCraft',serverAddress:'play.example.net',serverPort:25565,edition:'java'}};applyConfig()}
function applyConfig(){const c=state.config;$$('[data-server-name]').forEach(e=>e.textContent=c.serverName);$$('[data-server-ip]').forEach(e=>e.textContent=c.serverAddress);$$('[data-discord]').forEach(e=>e.href=c.discordUrl||'#');$$('[data-store]').forEach(e=>e.href=c.storeUrl||'#');document.documentElement.style.setProperty('--accent',c.accent||'#78d64b');document.documentElement.style.setProperty('--accent2',c.accent2||'#7b59ff')}
let toastTimer;function toast(msg,type='default',duration=3600){const t=$('#toast');if(!t)return;clearTimeout(toastTimer);t.className='toast';if(type==='auth')t.classList.add('auth-toast');if(type==='copy')t.classList.add('copy-toast');t.innerHTML=`<span class="toast-message">${escapeHtml(String(msg))}</span><i class="toast-countdown" style="--toast-duration:${duration}ms"></i>`;void t.offsetWidth;t.classList.add('show');toastTimer=setTimeout(()=>{t.classList.remove('show','auth-toast','copy-toast')},duration)}
function copyIP(){const ip=state.config?.serverAddress||'play.example.net';toast(`Copying ${ip}...`,'copy',4200);const done=()=>toast(`Server IP copied: ${ip}`,'copy',4200);if(navigator.clipboard?.writeText){navigator.clipboard.writeText(ip).then(done).catch(()=>fallbackCopy(ip,done))}else fallbackCopy(ip,done)}
function fallbackCopy(text,done){const a=document.createElement('textarea');a.value=text;a.setAttribute('readonly','');a.style.position='fixed';a.style.left='-9999px';a.style.top='0';document.body.appendChild(a);a.select();a.setSelectionRange(0,a.value.length);let copied=false;try{copied=document.execCommand('copy')}catch{}a.remove();if(copied)done();else toast(`Copy unavailable — server IP: ${text}`,'copy',6000)}
async function getStatus(){const c=state.config, el=$('#serverStatus');if(!el)return;try{const r=await fetch(`https://api.mcstatus.io/v2/status/${c.edition||'java'}/${encodeURIComponent(c.serverAddress+(c.serverPort?':'+c.serverPort:''))}`);const d=await r.json();$('#statusText').textContent=d.online?'Online':'Offline';$('#statusText').style.color=d.online?'#86ed5c':'#ff6674';$('#playersOnline').textContent=d.players?.online??0;$('#playersMax').textContent=d.players?.max??'?';$('#serverVersion').textContent=d.version?.name_clean||'Unknown';$('#serverMotd').textContent=d.motd?.clean||'Welcome to the server!'}catch{$('#statusText').textContent='Demo mode';$('#playersOnline').textContent='128';$('#playersMax').textContent='500';$('#serverVersion').textContent='Java 1.21+'}}
function nav(){
  document.body.classList.add('page-enter');
  const b=$('#mobileToggle'),l=$('#navLinks');b?.addEventListener('click',()=>l.classList.toggle('open'));
  const navigate=(href)=>{if(document.body.classList.contains('page-leaving'))return;playCubePageTransition();document.body.classList.add('page-leaving');const c=$('#curtain');setTimeout(()=>c?.classList.add('go'),110);setTimeout(()=>location.href=href,650)};
  document.addEventListener('click',e=>{const a=e.target.closest('a[data-transition]');if(!a)return;if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin)return;e.preventDefault();navigate(a.href)});
  addEventListener('pageshow',()=>document.body.classList.remove('page-leaving'));
  const file=location.pathname.split('/').pop()||'index.html';$$('#navLinks a').forEach(a=>a.getAttribute('href')===file&&a.classList.add('active'))
}
function dedicatedLoaderGate(){
  const file=location.pathname.split('/').pop()||'index.html';
  if(file==='loader.html'||sessionStorage.getItem('ac_loaded')==='1')return false;
  const target=file+location.search+location.hash;
  location.replace('loader.html?to='+encodeURIComponent(target));
  return true;
}
function getCommunityUsers(){try{return JSON.parse(localStorage.getItem('ac_users')||'[]')}catch{return []}}
function saveCommunityUsers(rows){localStorage.setItem('ac_users',JSON.stringify(rows))}
function profileDefaults(user={}){return {bio:'',location:'',website:'',status:'Community member',banner:'',profileImage:'',signatureImage:'',signatureText:'',favoriteMode:'',profileName:'',planetMinecraft:'',youtube:'',discordLink:'',twitch:'',github:'',gallery:[],...user.profile}}
function normalizeCommunityUser(user={}){return {...user,profile:profileDefaults(user)}}
function findCommunityUser(username){const key=String(username||'').toLowerCase();const current=JSON.parse(localStorage.getItem('ac_user')||'null');if(current&&String(current.username).toLowerCase()===key)return normalizeCommunityUser(current);return normalizeCommunityUser(getCommunityUsers().find(u=>String(u.username).toLowerCase()===key)||{username:username||'Unknown',role:'Member',joined:'Unknown'})}
function persistCommunityUser(updated){const clean=normalizeCommunityUser(updated);const rows=getCommunityUsers();const i=rows.findIndex(u=>String(u.username).toLowerCase()===String(clean.username).toLowerCase());if(i>=0)rows[i]=clean;else if(clean.id!==0)rows.push(clean);saveCommunityUsers(rows);const current=JSON.parse(localStorage.getItem('ac_user')||'null');if(current&&String(current.username).toLowerCase()===String(clean.username).toLowerCase())localStorage.setItem('ac_user',JSON.stringify(clean));state.user=clean;return clean}
function minecraftAvatar(user,size=48){const mc=user?.minecraft||{};const key=String(mc.uuid||mc.username||'MHF_Steve').replaceAll('-','');return `https://mc-heads.net/avatar/${encodeURIComponent(key)}/${size}`}
function profileUrl(username){return `profile.html?user=${encodeURIComponent(username||'')}`}
function authUI(){
  const raw=JSON.parse(localStorage.getItem('ac_user')||'null');const u=raw?normalizeCommunityUser(raw):null;state.user=u;
  $$('[data-auth-name]').forEach(e=>e.textContent=u?u.username:'Guest');
  $$('[data-auth-actions]').forEach(box=>{box.innerHTML=u?`<a class="member-chip member-chip-avatar" href="${profileUrl(u.username)}" data-transition><img src="${minecraftAvatar(u,34)}" alt="${escapeHtml(u.username)} Minecraft head" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/34'"><span>${escapeHtml(u.username)}</span></a><a class="btn ghost" href="account.html" data-transition>Account</a>`:`<a class="btn ghost" href="login.html" data-transition>Log in</a><a class="btn primary" href="register.html" data-transition>Join</a>`});
  $$('[data-logout]').forEach(e=>e.addEventListener('click',()=>{localStorage.removeItem('ac_user');document.body.classList.add('page-leaving');setTimeout(()=>location.href='index.html',320)}))
}
function escapeHtml(s=''){return s.replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
document.addEventListener('DOMContentLoaded',async()=>{if(dedicatedLoaderGate())return;nav();await loadConfig();authUI();getStatus();setupIpReveal();setupHomeAnnouncements();setupPurchaseNotifications();$$('[data-copy-ip]').forEach(b=>b.addEventListener('click',copyIP));});

function setupIpReveal(){
  $$('.server-strip').forEach(strip=>{
    if(strip.classList.contains('ip-reveal-ready'))return;
    strip.classList.add('ip-reveal-ready');
    const code=strip.querySelector('[data-server-ip]');
    const button=strip.querySelector('[data-copy-ip]');
    if(code)code.setAttribute('aria-hidden','false');
    if(button){button.setAttribute('aria-label','Reveal and copy server address');button.title='Hover to reveal • click to copy'}
  })
}
function getAnnouncements(){
  try{const saved=JSON.parse(localStorage.getItem('ac_announcements')||'null');if(Array.isArray(saved)&&saved.length)return saved}catch{}
  const settings=(()=>{try{return JSON.parse(localStorage.getItem('ac_site_settings')||'null')}catch{return null}})();
  return [{id:1,text:settings?.announcement||'Welcome to AetherCraft — join the adventure today!',active:true}]
}
function setupHomeAnnouncements(){
  const main=document.querySelector('main');
  if(!main||!(location.pathname.endsWith('index.html')||location.pathname.endsWith('/')||!location.pathname.split('/').pop()))return;
  if(localStorage.getItem('ac_announcements_hidden')==='1')return;
  const announcements=getAnnouncements().filter(a=>a.active!==false&&String(a.text||'').trim());
  if(!announcements.length)return;
  const bar=document.createElement('section');bar.className='site-announcement';bar.innerHTML=`<div class="wrap announcement-inner"><span class="announcement-icon">◆</span><strong class="announcement-text"></strong><span class="announcement-count"></span><button class="announcement-hide" type="button" aria-label="Hide announcements">×</button></div><i class="announcement-progress"></i>`;
  main.prepend(bar);let index=0;const text=bar.querySelector('.announcement-text'),count=bar.querySelector('.announcement-count'),progress=bar.querySelector('.announcement-progress');
  const show=()=>{const a=announcements[index];bar.classList.remove('announcement-swap');void bar.offsetWidth;text.textContent=a.text;count.textContent=announcements.length>1?`${index+1}/${announcements.length}`:'';bar.classList.add('announcement-swap');progress.classList.remove('run');void progress.offsetWidth;progress.classList.add('run')};
  show();let timer;if(announcements.length>1)timer=setInterval(()=>{index=(index+1)%announcements.length;show()},120000);
  bar.querySelector('.announcement-hide').onclick=()=>{clearInterval(timer);localStorage.setItem('ac_announcements_hidden','1');bar.classList.add('announcement-closing');setTimeout(()=>bar.remove(),300);toast('Announcements hidden. Clear site data to show them again.','copy',3500)};
}
function setupCubeEffects(){
  if(matchMedia('(pointer: coarse)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const canvas=document.createElement('canvas');canvas.id='cubeParticleCanvas';document.body.prepend(canvas);
  const ctx=canvas.getContext('2d');let w=0,h=0,dpr=1,mouse={x:innerWidth/2,y:innerHeight/2,active:false};
  const cubes=Array.from({length:Math.min(70,Math.max(32,Math.floor(innerWidth/24)))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,s:2+Math.random()*6,vx:(Math.random()-.5)*.22,vy:.08+Math.random()*.28,a:.12+Math.random()*.35,r:Math.random()*6.28,vr:(Math.random()-.5)*.012}));
  function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}resize();addEventListener('resize',resize);
  addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true});addEventListener('mouseleave',()=>mouse.active=false);
  function draw(){ctx.clearRect(0,0,w,h);const accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#78d64b';for(const c of cubes){if(mouse.active){const dx=c.x-mouse.x,dy=c.y-mouse.y,d=Math.hypot(dx,dy);if(d<120&&d>0){const f=(120-d)/120;c.vx+=dx/d*f*.025;c.vy+=dy/d*f*.025}}c.vx*=.992;c.vy*=.995;c.x+=c.vx;c.y+=c.vy;c.r+=c.vr;if(c.y>h+12){c.y=-12;c.x=Math.random()*w}if(c.x<-12)c.x=w+12;if(c.x>w+12)c.x=-12;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.r);ctx.globalAlpha=c.a;ctx.fillStyle=accent;ctx.fillRect(-c.s/2,-c.s/2,c.s,c.s);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.5;ctx.strokeRect(-c.s/2,-c.s/2,c.s,c.s);ctx.restore()}requestAnimationFrame(draw)}draw();
  const cursor=document.createElement('div'),glow=document.createElement('div');cursor.className='cube-cursor';glow.className='cube-cursor-glow';document.body.append(glow,cursor);let x=mouse.x,y=mouse.y,gx=x,gy=y,lastTrail=0;
  addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;cursor.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;const now=performance.now();if(now-lastTrail>45){lastTrail=now;const f=document.createElement('i');f.className='cursor-fragment';f.style.left=x+'px';f.style.top=y+'px';f.style.setProperty('--dx',(Math.random()*18-9)+'px');f.style.setProperty('--dy',(12+Math.random()*24)+'px');document.body.appendChild(f);setTimeout(()=>f.remove(),750)}});
  function follow(){gx+=(x-gx)*.18;gy+=(y-gy)*.18;glow.style.transform=`translate(${gx}px,${gy}px) translate(-50%,-50%)`;requestAnimationFrame(follow)}follow();
  document.addEventListener('mouseover',e=>{const hot=e.target.closest('a,button,input,textarea,select,.topic,.item-card,.dropzone,.recipe-modal-close');cursor.classList.toggle('hover',!!hot);glow.classList.toggle('hover',!!hot)});
  const voteFrame=document.getElementById('voteFrame');
  if(voteFrame){
    voteFrame.addEventListener('mouseenter',()=>document.body.classList.add('vote-frame-hover'));
    voteFrame.addEventListener('mouseleave',()=>document.body.classList.remove('vote-frame-hover'));
    addEventListener('blur',()=>{if(document.activeElement===voteFrame)document.body.classList.add('vote-frame-hover')});
    addEventListener('focus',()=>document.body.classList.remove('vote-frame-hover'));
  }
}
document.addEventListener('DOMContentLoaded',setupCubeEffects);


/* v1.9 Minecraft cube page transitions */
function playCubePageTransition(){
  let layer=document.getElementById('cubePageTransition');
  if(!layer){
    layer=document.createElement('div');layer.id='cubePageTransition';layer.className='cube-page-transition';
    layer.innerHTML='<div class="cube-transition-shade"></div><div class="cube-transition-field">'+Array.from({length:18},(_,i)=>`<i style="--i:${i};--x:${8+(i*17)%88}%;--y:${10+(i*29)%78}%;--s:${10+(i%5)*5}px"></i>`).join('')+'</div>';
    document.body.appendChild(layer);
  }
  layer.classList.remove('active');void layer.offsetWidth;layer.classList.add('active');
}

/* v1.9 purchase announcement feed. Static demo reads localStorage/data JSON;
   PHP hosting can receive Tebex or generic store webhooks. */
let purchaseNoticeQueue=[],purchaseNoticeBusy=false,purchaseSeen=new Set();
function normalizePurchase(p={}){return {id:String(p.id||p.transaction_id||p.order_id||Date.now()),player:String(p.player||p.username||p.customer||'A player'),product:String(p.product||p.package||p.item||'a store item'),total:Number(p.total||p.price||p.amount||0),currency:String(p.currency||'USD'),createdAt:p.createdAt||p.date||new Date().toISOString()}}
function queuePurchaseNotice(raw){const p=normalizePurchase(raw);if(purchaseSeen.has(p.id))return;purchaseSeen.add(p.id);purchaseNoticeQueue.push(p);showNextPurchaseNotice()}
function showNextPurchaseNotice(){if(purchaseNoticeBusy||!purchaseNoticeQueue.length)return;purchaseNoticeBusy=true;const p=purchaseNoticeQueue.shift();const el=document.createElement('aside');el.className='purchase-popout';const price=p.total?` • ${new Intl.NumberFormat('en-US',{style:'currency',currency:p.currency||'USD'}).format(p.total)}`:'';el.innerHTML=`<span class="purchase-cube">◆</span><div><small>NEW STORE PURCHASE</small><strong>${escapeHtml(p.player)}</strong><span>purchased ${escapeHtml(p.product)}${escapeHtml(price)}</span></div><i></i>`;document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>{el.classList.remove('show');setTimeout(()=>{el.remove();purchaseNoticeBusy=false;showNextPurchaseNotice()},320)},6200)}
async function setupPurchaseNotifications(){
  try{const existing=JSON.parse(localStorage.getItem('ac_purchases')||'[]');existing.slice(0,3).forEach(p=>purchaseSeen.add(String(p.id)))}catch{}
  addEventListener('storage',e=>{if(e.key==='ac_purchases'&&e.newValue){try{const rows=JSON.parse(e.newValue);if(rows[0])queuePurchaseNotice(rows[0])}catch{}}});
  addEventListener('ac-purchase-added',e=>queuePurchaseNotice(e.detail||{}));
  const settings=(()=>{try{return JSON.parse(localStorage.getItem('ac_site_settings')||'{}')}catch{return {}}})();
  if(settings.purchasePopups===false)return;
  const poll=async()=>{for(const url of ['php/store-feed.php','data/store-events.json']){try{const r=await fetch(url+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)continue;const d=await r.json();const rows=Array.isArray(d)?d:(d.events||[]);rows.slice(-10).forEach(queuePurchaseNotice);break}catch{}}};
  poll();setInterval(poll,60000);
}
