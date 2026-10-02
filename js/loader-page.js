const $=(s,c=document)=>c.querySelector(s);

async function applyLoaderConfig(){
  try{
    const config=await fetch('data/config.json').then(r=>r.json());
    document.querySelectorAll('[data-server-name]').forEach(el=>el.textContent=config.serverName||'AetherCraft');
    document.documentElement.style.setProperty('--accent',config.accent||'#78d64b');
    document.documentElement.style.setProperty('--accent2',config.accent2||'#7b59ff');
    document.title=`Loading | ${config.serverName||'AetherCraft'}`;
  }catch{}
}

function safeTarget(){
  const raw=new URLSearchParams(location.search).get('to')||'index.html';
  if(/^https?:/i.test(raw)||raw.startsWith('//')||raw.includes('..'))return 'index.html';
  return raw;
}

function startLoader(){
  const bar=$('#loadBar'),pct=$('#loadPct'),text=$('#loadText'),exit=$('#loaderExit');
  const messages=['Generating world...','Loading chunks...','Placing blocks...','Spawning community...','Joining server...'];
  let progress=0,messageIndex=0;
  const timer=setInterval(()=>{
    const remaining=100-progress;
    progress=Math.min(100,progress+Math.max(1,Math.ceil(Math.random()*Math.min(8,remaining))));
    bar.style.width=progress+'%';
    pct.textContent=progress+'%';
    const next=Math.min(messages.length-1,Math.floor(progress/22));
    if(next!==messageIndex){messageIndex=next;text.textContent=messages[messageIndex]}
    if(progress>=100){
      clearInterval(timer);
      sessionStorage.setItem('ac_loaded','1');
      document.body.classList.add('loader-complete');
      setTimeout(()=>exit.classList.add('go'),280);
      setTimeout(()=>location.replace(safeTarget()),920);
    }
  },105);
}

document.addEventListener('DOMContentLoaded',async()=>{await applyLoaderConfig();startLoader()});
