const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const path=require('path');
const app=express(),server=http.createServer(app),io=new Server(server);
app.use(express.static(path.join(__dirname,'public')));

const rooms={};
const makeCode=()=>Math.random().toString(36).slice(2,6).toUpperCase();
const clean=s=>String(s||'').trim().slice(0,24);

function state(r){
  return {
    code:r.code, title:r.title, host:r.host, status:r.status,
    gridSize:r.gridSize, prize:r.prize, round:r.round,
    cells:r.cells, eliminated:r.eliminated, winner:r.winner,
    players:r.players.map(p=>({id:p.id,name:p.name,cell:p.cell})),
    log:r.log.slice(-12)
  };
}
function emit(r){ io.to(r.code).emit('state',state(r)); }
function addLog(r,msg){ r.log.push({t:Date.now(),msg}); }

function availableCells(r){ return r.cells.filter(c=>!c.owner && !c.eliminated); }
function activeOwned(r){ return r.cells.filter(c=>c.owner && !c.eliminated); }

io.on('connection',s=>{
  s.on('create',({name,title,gridSize,prize},cb)=>{
    let c; do c=makeCode(); while(rooms[c]);
    let size=Math.max(10,Math.min(100,Number(gridSize)||30));
    const cells=Array.from({length:size},(_,i)=>({n:i+1,owner:null,ownerName:null,eliminated:false}));
    rooms[c]={
      code:c,host:s.id,title:clean(title)||'THE GRID LIVE',gridSize:size,
      prize:clean(prize)||'Prize TBA',status:'lobby',round:1,cells,
      players:[{id:s.id,name:clean(name)||'Host',cell:null}],
      eliminated:0,winner:null,log:[]
    };
    s.join(c); addLog(rooms[c],`${clean(name)||'Host'} created the game.`);
    cb({ok:true,code:c}); emit(rooms[c]);
  });

  s.on('join',({name,code},cb)=>{
    const c=clean(code).toUpperCase(),r=rooms[c];
    if(!r)return cb({ok:false,msg:'Room not found.'});
    if(r.status==='finished')return cb({ok:false,msg:'This game has ended.'});
    if(r.players.some(p=>p.id===s.id)){s.join(c);return cb({ok:true,code:c});}
    const nm=clean(name)||'Player';
    r.players.push({id:s.id,name:nm,cell:null});
    s.join(c); addLog(r,`${nm} joined.`);
    cb({ok:true,code:c}); emit(r);
  });

  s.on('claim',({code,n},cb)=>{
    const r=rooms[clean(code).toUpperCase()];
    if(!r||r.status!=='lobby')return cb&&cb({ok:false,msg:'Claims are closed.'});
    const p=r.players.find(p=>p.id===s.id),cell=r.cells.find(c=>c.n===Number(n));
    if(!p||!cell||cell.owner)return cb&&cb({ok:false,msg:'That spot is unavailable.'});
    if(p.cell){
      const old=r.cells.find(c=>c.n===p.cell);
      if(old){old.owner=null;old.ownerName=null;}
    }
    cell.owner=s.id; cell.ownerName=p.name; p.cell=cell.n;
    addLog(r,`${p.name} claimed #${cell.n}.`); emit(r);
    cb&&cb({ok:true});
  });

  s.on('start',code=>{
    const r=rooms[clean(code).toUpperCase()];
    if(!r||r.host!==s.id||activeOwned(r).length<2)return;
    r.status='live'; addLog(r,'Claims closed. The Grid is LIVE.'); emit(r);
  });

  s.on('eliminateOne',code=>{
    const r=rooms[clean(code).toUpperCase()];
    if(!r||r.host!==s.id||r.status!=='live'||r.winner)return;
    const a=activeOwned(r);
    if(a.length<=1)return;
    const pick=a[Math.floor(Math.random()*a.length)];
    pick.eliminated=true; r.eliminated++;
    addLog(r,`#${pick.n} — ${pick.ownerName} — ELIMINATED.`);
    const left=activeOwned(r);
    if(left.length===1){
      r.winner={n:left[0].n,name:left[0].ownerName};
      r.status='finished';
      addLog(r,`#${left[0].n} — ${left[0].ownerName} WINS ${r.prize}!`);
    }
    emit(r);
  });

  s.on('eliminateBatch',({code,count})=>{
    const r=rooms[clean(code).toUpperCase()];
    if(!r||r.host!==s.id||r.status!=='live'||r.winner)return;
    let k=Math.max(1,Math.min(20,Number(count)||1));
    while(k-- > 0 && activeOwned(r).length>1){
      const a=activeOwned(r),pick=a[Math.floor(Math.random()*a.length)];
      pick.eliminated=true;r.eliminated++;
      addLog(r,`#${pick.n} — ${pick.ownerName} — ELIMINATED.`);
    }
    const left=activeOwned(r);
    if(left.length===1){
      r.winner={n:left[0].n,name:left[0].ownerName};r.status='finished';
      addLog(r,`#${left[0].n} — ${left[0].ownerName} WINS ${r.prize}!`);
    }
    emit(r);
  });

  s.on('reopen',code=>{
    const r=rooms[clean(code).toUpperCase()];
    if(!r||r.host!==s.id)return;
    r.status='lobby';r.winner=null;r.eliminated=0;r.round++;
    r.cells.forEach(c=>c.eliminated=false);
    addLog(r,`Round ${r.round}: claims reopened.`);emit(r);
  });

  s.on('newRound',code=>{
    const r=rooms[clean(code).toUpperCase()];
    if(!r||r.host!==s.id)return;
    r.status='lobby';r.winner=null;r.eliminated=0;r.round++;
    r.cells.forEach(c=>{c.owner=null;c.ownerName=null;c.eliminated=false;});
    r.players.forEach(p=>p.cell=null);
    addLog(r,`Round ${r.round}: fresh Grid opened.`);emit(r);
  });

  s.on('disconnect',()=>{
    for(const c of Object.keys(rooms)){
      const r=rooms[c],p=r.players.find(p=>p.id===s.id);
      if(!p)continue;
      if(r.status==='lobby' && p.cell){
        const cell=r.cells.find(x=>x.n===p.cell);
        if(cell){cell.owner=null;cell.ownerName=null;}
      }
      r.players=r.players.filter(x=>x.id!==s.id);
      if(!r.players.length){delete rooms[c];continue;}
      if(r.host===s.id){r.host=r.players[0].id;addLog(r,`${r.players[0].name} is now host.`);}
      emit(r);
    }
  });
});

server.listen(process.env.PORT||3000,()=>console.log('THE GRID LIVE running'));
