const accountState={profile:null};
const ACCOUNT_PLAYER_API={
  staticProfileBase:'https://mc-api.io/profile/',
  staticUuidBase:'https://mc-api.io/uuid/',
  playerDbBase:'https://playerdb.co/api/player/minecraft/',
  proxyPath:'php/profile-proxy.php?name='
};
function readUsers(){return JSON.parse(localStorage.getItem('ac_users')||'[]')}
function writeUsers(list){localStorage.setItem('ac_users',JSON.stringify(list))}
function currentUser(){return JSON.parse(localStorage.getItem('ac_user')||'null')}
function saveCurrentUser(next){localStorage.setItem('ac_user',JSON.stringify(next));const list=readUsers();const idx=list.findIndex(u=>String(u.id)===String(next.id));if(idx>=0){list[idx]={...list[idx],...next};writeUsers(list)}}
function cleanUuid(value=''){return String(value).replace(/-/g,'').trim()}
function formatUuid(value=''){const uuid=cleanUuid(value);return uuid.length===32?uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/,'$1-$2-$3-$4-$5'):uuid}
function normalizeMinecraftProfile(data,requestedName){
  const source=data?.data?.player||data?.data||data?.player||data?.profile||data||{};
  const meta=source.meta||data?.data?.player?.meta||{};
  const uuid=cleanUuid(source.uuid||source.id||source.uniqueId||source.unique_id||meta.uuid||meta.id||data?.uuid||data?.id);
  const name=source.name||source.username||source.playerName||meta.name||requestedName;
  if(!uuid||uuid.length!==32)throw new Error('The profile service did not return a valid Java UUID');
  return{id:uuid,name};
}
async function fetchProfileJson(url){
  const response=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
  let data;
  try{data=await response.json()}catch{throw new Error(`Profile service returned an unreadable response (${response.status})`)}
  if(!response.ok||data?.success===false||data?.error){
    const message=data?.message||data?.error?.message||data?.error;
    throw new Error(response.status===404?'Minecraft player not found':(message||`Lookup failed (${response.status})`));
  }
  return data;
}
async function lookupMinecraft(username){
  const name=String(username||'').trim();
  if(!/^[A-Za-z0-9_]{3,16}$/.test(name))throw new Error('Enter a valid Minecraft Java username');
  const providers=[
    async()=>normalizeMinecraftProfile(await fetchProfileJson(`${ACCOUNT_PLAYER_API.staticProfileBase}${encodeURIComponent(name)}/java`),name),
    async()=>normalizeMinecraftProfile(await fetchProfileJson(`${ACCOUNT_PLAYER_API.staticUuidBase}${encodeURIComponent(name)}/java`),name),
    async()=>normalizeMinecraftProfile(await fetchProfileJson(ACCOUNT_PLAYER_API.playerDbBase+encodeURIComponent(name)),name),
    async()=>normalizeMinecraftProfile(await fetchProfileJson(ACCOUNT_PLAYER_API.proxyPath+encodeURIComponent(name)),name)
  ];
  let lastError;
  for(const provider of providers){try{return await provider()}catch(error){lastError=error}}
  throw lastError||new Error('Minecraft player lookup failed');
}
function installImageFallback(image,urls=[]){
  if(!image)return;
  let index=0;
  image.onerror=()=>{if(index<urls.length){image.src=urls[index++]}else{image.onerror=null;image.alt='Minecraft skin unavailable'}};
}
function renderAccount(){
  const user=currentUser();
  if(!user){location.replace('login.html?next=account.html');return}
  accountState.profile=user;
  document.querySelectorAll('[data-profile-username]').forEach(el=>el.textContent=user.username||'Member');
  document.querySelectorAll('[data-profile-role]').forEach(el=>el.textContent=user.role||'Member');
  document.querySelectorAll('[data-profile-email]').forEach(el=>el.textContent=user.email||'No email saved');
  document.querySelectorAll('[data-profile-joined]').forEach(el=>el.textContent=user.joined||'Unknown');
  const mc=user.minecraft||{};const dc=user.discord||{};
  const emailInput=document.querySelector('#profileEmail');if(emailInput)emailInput.value=user.email||'';
  const profile=profileDefaults(user);[['#profileBio','bio'],['#profileStatus','status'],['#profileFavoriteMode','favoriteMode'],['#profileLocation','location'],['#profileWebsite','website'],['#profileDisplayName','profileName'],['#profilePlanetMinecraft','planetMinecraft'],['#profileYouTube','youtube'],['#profileDiscordLink','discordLink'],['#profileTwitch','twitch'],['#profileGithub','github'],['#profileSignatureText','signatureText']].forEach(([sel,key])=>{const el=document.querySelector(sel);if(el)el.value=profile[key]||''});
  const pp=document.querySelector('#profileImagePreview');if(pp){pp.src=profile.profileImage||minecraftAvatar(user,160);pp.hidden=false}
  const sp=document.querySelector('#signatureImagePreview');if(sp){sp.src=profile.signatureImage||'';sp.hidden=!profile.signatureImage}
  const galleryEditor=document.querySelector('#profileGalleryEditor');if(galleryEditor){const rows=Array.isArray(profile.gallery)?profile.gallery:[];galleryEditor.innerHTML=rows.length?rows.map((g,i)=>`<article class="profile-gallery-edit-item"><img src="${g.image}" alt="Gallery build ${i+1}"><div><input class="input gallery-title-input" data-gallery-title="${i}" maxlength="60" value="${escapeHtml(g.title||'')}" placeholder="Build title"><textarea class="textarea gallery-description-input" data-gallery-description="${i}" maxlength="180" placeholder="Short build description">${escapeHtml(g.description||'')}</textarea><button class="btn ghost" type="button" data-remove-gallery="${i}">Remove build</button></div></article>`).join(''):'<p class="muted">No gallery builds uploaded yet.</p>';galleryEditor.querySelectorAll('[data-remove-gallery]').forEach(b=>b.onclick=()=>{const u=currentUser();u.profile=profileDefaults(u);u.profile.gallery.splice(Number(b.dataset.removeGallery),1);saveCurrentUser(u);renderAccount();toast('Gallery build removed')});}
  const publicLink=document.querySelector('#viewPublicProfile');if(publicLink)publicLink.href=profileUrl(user.username);
  const mcName=document.querySelector('#minecraftUsername');if(mcName)mcName.value=mc.username||'';
  const discordName=document.querySelector('#discordUsername');if(discordName)discordName.value=dc.username||'';
  const discordId=document.querySelector('#discordId');if(discordId)discordId.value=dc.id||'';
  const skin=document.querySelector('#linkedSkin');
  if(skin){
    const id=cleanUuid(mc.uuid||'');
    const key=id||mc.username||'MHF_Steve';
    skin.src=`https://api.mcheads.org/player/${encodeURIComponent(key)}/256`;
    installImageFallback(skin,[`https://mc-heads.net/player/${encodeURIComponent(key)}/256`,`https://mc-heads.net/body/${encodeURIComponent(key)}/right`,'https://mc-heads.net/player/MHF_Steve/256']);
  }
  const mcStatus=document.querySelector('#minecraftLinkStatus');
  if(mcStatus)mcStatus.innerHTML=mc.username
    ?`Linked as <strong>${escapeHtml(mc.username)}</strong><br><code>${escapeHtml(formatUuid(mc.uuid||'UUID unavailable'))}</code><br><small class="muted">Username linked locally. Ownership is not verified.</small>`
    :'No Minecraft account linked yet.';
  const dcStatus=document.querySelector('#discordLinkStatus');if(dcStatus)dcStatus.innerHTML=dc.username?`Linked as <strong>${escapeHtml(dc.username)}</strong>${dc.id?`<br><code>${escapeHtml(dc.id)}</code>`:''}`:'No Discord account linked yet.';
}
document.addEventListener('DOMContentLoaded',()=>{
  if(!document.querySelector('#accountPage'))return;renderAccount();
  document.querySelector('#minecraftLinkForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const btn=e.submitter;btn.disabled=true;btn.textContent='Checking player...';
    try{
      const name=document.querySelector('#minecraftUsername').value.trim();
      const profile=await lookupMinecraft(name);
      const user=currentUser();
      user.minecraft={username:profile.name||name,uuid:cleanUuid(profile.id),linkedAt:new Date().toISOString(),verified:false};
      saveCurrentUser(user);renderAccount();toast('Minecraft username linked!');
    }catch(err){toast(err.message||'Could not link that player')}
    finally{btn.disabled=false;btn.textContent='Link Minecraft account'}
  });
  document.querySelector('#unlinkMinecraft')?.addEventListener('click',()=>{const user=currentUser();delete user.minecraft;saveCurrentUser(user);renderAccount();toast('Minecraft account unlinked')});
  document.querySelector('#discordLinkForm')?.addEventListener('submit',e=>{e.preventDefault();const username=document.querySelector('#discordUsername').value.trim(),id=document.querySelector('#discordId').value.trim();if(!username)return toast('Enter your Discord username');const user=currentUser();user.discord={username,id,linkedAt:new Date().toISOString()};saveCurrentUser(user);renderAccount();toast('Discord details linked!')});
  document.querySelector('#unlinkDiscord')?.addEventListener('click',()=>{const user=currentUser();delete user.discord;saveCurrentUser(user);renderAccount();toast('Discord account unlinked')});
  const resizeProfileImage=(file,maxW,maxH,quality=.86)=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const scale=Math.min(1,maxW/img.naturalWidth,maxH/img.naturalHeight),w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);resolve(canvas.toDataURL('image/jpeg',quality))};img.src=reader.result};reader.readAsDataURL(file)});
  document.querySelector('#profileImageInput')?.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const user=currentUser();user.profile=profileDefaults(user);user.profile.profileImage=await resizeProfileImage(file,420,420);saveCurrentUser(user);renderAccount();toast('Profile picture updated')}catch{toast('Could not process that profile picture')}});
  document.querySelector('#signatureImageInput')?.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const user=currentUser();user.profile=profileDefaults(user);user.profile.signatureImage=await resizeProfileImage(file,900,240,.82);saveCurrentUser(user);renderAccount();toast('Signature image updated')}catch{toast('Could not process that signature image')}});
  document.querySelector('#removeSignatureImage')?.addEventListener('click',()=>{const user=currentUser();user.profile=profileDefaults(user);user.profile.signatureImage='';saveCurrentUser(user);renderAccount();toast('Signature image removed')});
  document.querySelector('#profileGalleryInput')?.addEventListener('change',async e=>{const files=[...e.target.files].slice(0,8);if(!files.length)return;const user=currentUser();user.profile=profileDefaults(user);const room=Math.max(0,8-user.profile.gallery.length);if(!room)return toast('Your gallery already has 8 builds');for(const file of files.slice(0,room)){try{const image=await resizeProfileImage(file,1200,800,.82);user.profile.gallery.push({image,title:'',description:'',uploadedAt:new Date().toISOString()})}catch{}}saveCurrentUser(user);e.target.value='';renderAccount();toast('Gallery images added')});
  document.querySelector('#profileForm')?.addEventListener('submit',e=>{e.preventDefault();const user=currentUser();user.email=document.querySelector('#profileEmail').value.trim()||user.email;const base=profileDefaults(user);document.querySelectorAll('[data-gallery-title]').forEach(el=>{if(base.gallery[Number(el.dataset.galleryTitle)])base.gallery[Number(el.dataset.galleryTitle)].title=el.value.trim()});document.querySelectorAll('[data-gallery-description]').forEach(el=>{if(base.gallery[Number(el.dataset.galleryDescription)])base.gallery[Number(el.dataset.galleryDescription)].description=el.value.trim()});user.profile={...base,bio:document.querySelector('#profileBio').value.trim(),status:document.querySelector('#profileStatus').value.trim()||'Community member',favoriteMode:document.querySelector('#profileFavoriteMode').value.trim(),location:document.querySelector('#profileLocation').value.trim(),website:document.querySelector('#profileWebsite').value.trim(),profileName:document.querySelector('#profileDisplayName').value.trim(),planetMinecraft:document.querySelector('#profilePlanetMinecraft').value.trim(),youtube:document.querySelector('#profileYouTube').value.trim(),discordLink:document.querySelector('#profileDiscordLink').value.trim(),twitch:document.querySelector('#profileTwitch').value.trim(),github:document.querySelector('#profileGithub').value.trim(),signatureText:document.querySelector('#profileSignatureText').value.trim()};saveCurrentUser(user);renderAccount();authUI();toast('Community profile saved')});
});
