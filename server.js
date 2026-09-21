const express=require('express'),http=require('http'),path=require('path');
const {Server}=require('socket.io');
const app=express(),server=http.createServer(app),io=new Server(server,{pingTimeout:20000,pingInterval:10000});
app.use(express.static(path.join(__dirname,'public')));
const rooms={};
const rc=()=>Math.random().toString(36).slice(2,6).toUpperCase();
const clean=(x,n=28)=>String(x||'').trim().slice(0,n);
const active=r=>r.cells.filter(c=>c.ownerKey&&!c.dropped);
const claimed=r=>r.cells.filter(c=>c.ownerKey);
const snapshot=r=>({code:r.code,title:r.title,status:r.status,prize:r.prize,round:r.round,hostKey:r.hostKey,cells:r.cells,players:Object.values(r.players).map(p=>({key:p.key,name:p.name,spot:p.spot,online:p.online})),winner:r.winner,log:r.log.slice(-30),version:r.version});
function push(r,msg,type='info'){r.log.push({id:`${Date.now()}-${Math.random()}`,msg,type,at:Date.now()});if(r.log.length>100)r.log.shift()}
function emit(r){r.version++;io.to(r.code).emit('state',snapshot(r))}
function findRoom(c){return rooms[clean(c,4).toUpperCase()]}
function attach(s,r,key,name){
  let p=r.players[key];
  if(!p){p=r.players[key]={key,name:clean(name)||'Player',spot:null,online:true,socketId:s.id}}
  else {p.online=true;p.socketId=s.id;if(clean(name))p.name=clean(name)}
  s.data.room=r.code;s.data.key=key;s.join(r.code);return p;
}
function finishIfNeeded(r){
 const a=active(r);
 if(r.status==='live'&&a.length===1){r.winner={n:a[0].n,name:a[0].ownerName};r.status='finished';push(r,`🏆 #${a[0].n} — ${a[0].ownerName} IS THE LAST SPOT STANDING!`,'winner')}
}
io.on('connection',s=>{
 s.on('create',({name,title,size,prize,key},cb)=>{
  let c;do c=rc();while(rooms[c]);const z=Math.max(10,Math.min(100,Number(size)||30));key=clean(key,80)||s.id;
  const r=rooms[c]={code:c,title:clean(title)||'LOCK-D-IN LIVE',status:'lobby',prize:clean(prize)||'Prize TBA',round:1,hostKey:key,winner:null,version:0,log:[],players:{},cells:Array.from({length:z},(_,i)=>({n:i+1,ownerKey:null,ownerName:null,dropped:false}))};
  attach(s,r,key,name);push(r,`🔥 ${clean(name)||'Host'} opened the board.`);cb({ok:true,code:c});emit(r);
 });
 s.on('join',({name,code,key},cb)=>{
  const r=findRoom(code);if(!r)return cb({ok:false,msg:'Room not found.'});key=clean(key,80)||s.id;
  const existed=!!r.players[key];attach(s,r,key,name);if(!existed)push(r,`👀 ${clean(name)||'Player'} pulled up.`);
  cb({ok:true,code:r.code});emit(r);
 });
 s.on('sync',({code,key},cb)=>{
  const r=findRoom(code);if(!r)return cb&&cb({ok:false});if(r.players[key])attach(s,r,key,r.players[key].name);
  cb&&cb({ok:true,state:snapshot(r)});emit(r);
 });
 s.on('claim',({code,n,key},cb)=>{
  const r=findRoom(code);if(!r||r.status!=='lobby')return cb({ok:false,msg:'Locks are closed.'});
  const p=r.players[key],cell=r.cells.find(x=>x.n===Number(n));if(!p||!cell)return cb({ok:false,msg:'Refresh and rejoin the room.'});
  if(cell.ownerKey&&cell.ownerKey!==key)return cb({ok:false,msg:`#${cell.n} is already LOCK'D by ${cell.ownerName}.`});
  if(p.spot&&p.spot!==cell.n){const old=r.cells.find(x=>x.n===p.spot);if(old&&old.ownerKey===key){old.ownerKey=null;old.ownerName=null;old.dropped=false}}
  cell.ownerKey=key;cell.ownerName=p.name;cell.dropped=false;p.spot=cell.n;push(r,`🔒 ${p.name} LOCK'D IN #${cell.n}.`,'lock');emit(r);cb({ok:true});
 });
 s.on('start',({code,key},cb)=>{
  const r=findRoom(code);if(!r||r.hostKey!==key)return cb&&cb({ok:false,msg:'Host only.'});
  if(claimed(r).length<2)return cb&&cb({ok:false,msg:"At least 2 players must be LOCK'D IN before the game can start."});
  r.status='live';r.winner=null;push(r,'🚨 LOCKS CLOSED — WE ARE LIVE!','live');emit(r);cb&&cb({ok:true});
 });
 s.on('drop',({code,count,key,style},cb)=>{
  const r=findRoom(code);if(!r||r.hostKey!==key||r.status!=='live'||r.winner)return cb&&cb({ok:false,msg:'Drop unavailable.'});
  let k=Math.max(1,Math.min(20,Number(count)||1)),drops=[];
  while(k-->0&&active(r).length>1){const a=active(r),x=a[Math.floor(Math.random()*a.length)];x.dropped=true;drops.push(x.n);push(r,`💥 #${x.n} — ${x.ownerName} GOT DROPPED!`,'drop')}
  finishIfNeeded(r);emit(r);io.to(r.code).emit('dropEvent',{drops,remaining:active(r).length,winner:r.winner,style:clean(style,30)||'random'});cb&&cb({ok:true});
 });
 s.on('runBack',({code,key},cb)=>{
  const r=findRoom(code);if(!r||r.hostKey!==key)return cb&&cb({ok:false,msg:'Host only.'});
  r.round++;r.status='lobby';r.winner=null;r.cells.forEach(c=>{c.ownerKey=null;c.ownerName=null;c.dropped=false});Object.values(r.players).forEach(p=>p.spot=null);
  push(r,`🔁 ROUND ${r.round} — CLEAN BOARD. RUN IT BACK!`,'round');emit(r);io.to(r.code).emit('roundReset',{round:r.round});cb&&cb({ok:true});
 });
 s.on('chat',({code,key,text},cb)=>{const r=findRoom(code),p=r&&r.players[key],msg=clean(text,180);if(!r||!p||!msg)return cb&&cb({ok:false});push(r,`💬 ${p.name}: ${msg}`,'chat');emit(r);cb&&cb({ok:true})});
 s.on('rtc-ready',({code,key})=>{const r=findRoom(code);if(!r||!r.players[key])return;const p=r.players[key];p.videoReady=true;emit(r);for(const o of Object.values(r.players)){if(o.key!==key&&o.online&&o.videoReady&&o.socketId){io.to(o.socketId).emit('rtc-peer',{key,name:p.name});io.to(s.id).emit('rtc-peer',{key:o.key,name:o.name})}}});
 s.on('rtc-off',({code,key})=>{const r=findRoom(code);if(!r||!r.players[key])return;r.players[key].videoReady=false;s.to(r.code).emit('rtc-remove',{key});emit(r)});
 s.on('rtc-signal',({code,to,from,data})=>{const r=findRoom(code),t=r&&r.players[to];if(r&&t&&t.socketId)io.to(t.socketId).emit('rtc-signal',{from,data})});
 s.on('disconnect',()=>{
  const r=findRoom(s.data.room);if(!r)return;const p=r.players[s.data.key];if(p&&p.socketId===s.id){p.online=false;emit(r)}
 });
});
setInterval(()=>{for(const r of Object.values(rooms))emit(r)},3000);
server.listen(process.env.PORT||3000,()=>console.log('LOCK-D-IN v2.1 running'));