function users(){return JSON.parse(localStorage.getItem('ac_users')||'[]')}
function saveUsers(x){localStorage.setItem('ac_users',JSON.stringify(x))}
document.addEventListener('DOMContentLoaded',()=>{
  const rf=$('#registerForm'),lf=$('#loginForm');
  rf&&(rf.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),u=users();if(u.some(x=>x.username.toLowerCase()===f.get('username').toLowerCase()))return toast('Username already exists');u.push({id:Date.now(),username:f.get('username'),email:f.get('email'),password:f.get('password'),role:'Member',joined:new Date().toLocaleDateString(),minecraft:null,discord:null});saveUsers(u);toast('Account created! You can now sign in.');setTimeout(()=>location.href='login.html',800)});
  lf&&(lf.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);let u=users().find(x=>x.username===f.get('username')&&x.password===f.get('password'));if(f.get('username')==='admin'&&f.get('password')==='BlockAdmin123!')u={id:0,username:'admin',email:'admin@aethercraft.local',role:'Administrator',joined:'Template setup'};if(!u)return toast('Incorrect username or password');localStorage.setItem('ac_user',JSON.stringify(u));toast('Welcome back, '+u.username);const requested=new URLSearchParams(location.search).get('next');setTimeout(()=>location.href=requested||'account.html',700)})
});
