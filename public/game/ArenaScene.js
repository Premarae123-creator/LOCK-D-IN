export default class ArenaScene extends Phaser.Scene{
 constructor(){super('Arena');this.dropBusy=false}
 create(){showMediaControls();this.onState=s=>{if(s?.code===LOCKDIN.room){LOCKDIN.state=s;LOCKDIN.host=s.hostKey===LOCKDIN.key;if(!this.dropBusy)this.draw()}};this.onDrop=async e=>{if(e.drops?.length)for(const n of e.drops)await this.dropSequence(n,e.remaining);if(e.winner)this.winnerSequence(e.winner)};socket.on('state',this.onState);socket.on('dropEvent',this.onDrop);socket.emit('sync',{code:LOCKDIN.room,key:LOCKDIN.key},r=>{if(r?.state){LOCKDIN.state=r.state;this.draw()}});this.scale.on('resize',()=>this.draw());this.draw()}
 shutdown(){socket.off('state',this.onState);socket.off('dropEvent',this.onDrop);LDUI.positionVideos({})}
 showToast(msg){const w=this.scale.width,h=this.scale.height,t=this.add.text(w/2,h*.15,msg,{fontSize:Math.min(28,w*.05)+'px',fontStyle:'bold',color:'#fff',backgroundColor:'#7e1020',padding:{x:18,y:10}}).setOrigin(.5).setDepth(300);this.time.delayedCall(1800,()=>t.destroy())}
 panel(x,y,w,h,fill=0x09090d,stroke=0x8d6925){return this.add.rectangle(x,y,w,h,fill,.94).setStrokeStyle(2,stroke)}
 draw(){if(this.dropBusy)return;this.children.removeAll();const s=LOCKDIN.state,w=this.scale.width,h=this.scale.height;if(!s)return;
  const bg=this.add.graphics();bg.fillGradientStyle(0x020204,0x190708,0x07070b,0x020204,1);bg.fillRect(0,0,w,h);
  // stage lights
  for(let i=0;i<8;i++){let x=w*(.08+i*.12);this.add.rectangle(x,h*.19,4,h*.38,0xe5a936,.15).setAngle(-22+i*6)}
  this.add.rectangle(w/2,h*.96,w,h*.18,0x120608,.9);this.add.ellipse(w/2,h*.91,w*.72,h*.12,0x5d0a12,.5).setStrokeStyle(2,0xd49a31);
  this.add.text(24,20,"LOCK'D IN 🔒",{fontSize:Math.min(43,w*.058)+'px',fontStyle:'bold',color:'#fff',stroke:'#720b16',strokeThickness:4});
  this.add.text(w-24,24,`ROOM ${s.code}  •  ROUND ${s.round}`,{fontSize:Math.min(16,w*.022)+'px',fontStyle:'bold',color:'#efbd43'}).setOrigin(1,0);
  this.add.text(w/2,32,s.status==='live'?'🔥 LIVE — WHO STAYS LOCK’D?':'CHOOSE YOUR NUMBER',{fontSize:Math.min(27,w*.035)+'px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
  const desktop=w>=850,left=desktop?Math.max(175,w*.14):0,right=desktop?Math.max(190,w*.15):0,top=82,bottom=LOCKDIN.host?92:54;
  if(desktop){this.panel(left/2,h*.52,left-18,h*.72);this.panel(w-right/2,h*.52,right-18,h*.72)}
  const cells=s.cells||[],cols=w<560?5:(w<900?6:Math.min(10,Math.ceil(Math.sqrt(cells.length)))),areaW=w-left-right-30,gap=8,tw=Math.min(104,(areaW-gap*(cols-1))/cols),rows=Math.ceil(cells.length/cols),th=Math.min(82,(h-top-bottom-gap*(rows-1))/rows),gridW=cols*tw+(cols-1)*gap,startX=left+(areaW-gridW)/2,startY=top;
  cells.forEach((c,i)=>{const col=i%cols,row=Math.floor(i/cols),x=startX+col*(tw+gap)+tw/2,y=startY+row*(th+gap)+th/2;const owned=!!c.ownerKey,mine=c.ownerKey===LOCKDIN.key,dead=c.dropped;
    const shadow=this.add.rectangle(x+3,y+5,tw,th,0x000000,.65).setStrokeStyle(1,0x000000);
    const tile=this.add.rectangle(x,y,tw,th,dead?0x25080d:owned?0x650c18:0x14151a,.98).setStrokeStyle(mine?4:2,mine?0xffdc63:owned?0xd93a4d:0xd6a23b).setInteractive({useHandCursor:true});
    if(!dead)this.tweens.add({targets:tile,alpha:{from:.88,to:1},duration:900+(i%4)*130,yoyo:true,repeat:-1});
    this.add.text(x,y-(owned?8:0),String(c.n).padStart(2,'0'),{fontSize:Math.max(18,Math.min(34,tw*.36))+'px',fontStyle:'bold',color:dead?'#79555b':'#fff',stroke:'#000',strokeThickness:3}).setOrigin(.5);
    this.add.text(x,y+th*.28,dead?'OUT':owned?('🔒 '+c.ownerName):'OPEN',{fontSize:Math.max(7,Math.min(11,tw*.11))+'px',fontStyle:'bold',color:dead?'#9c6a73':owned?'#ffd86b':'#d7b75d'}).setOrigin(.5);
    if(s.status==='lobby'&&!owned)tile.on('pointerdown',()=>socket.emit('claim',{code:LOCKDIN.room,n:c.n,key:LOCKDIN.key},r=>{if(!r?.ok)this.showToast(r?.msg||'Could not lock in')}))
  });
  if(desktop)this.drawPlayers(left,right);
  const remain=cells.filter(c=>c.ownerKey&&!c.dropped).length;this.add.text(w/2,h-(LOCKDIN.host?72:30),`${remain} STILL UP  •  ${s.prize||''}`,{fontSize:Math.min(17,w*.023)+'px',fontStyle:'bold',color:'#efbd43'}).setOrigin(.5);
  if(LOCKDIN.host)this.hostControls();
 }
 drawPlayers(left,right){const s=LOCKDIN.state,w=this.scale.width,h=this.scale.height,players=(s.players||[]).slice(0,8),layout={};this.add.text(left/2,h*.19,'PLAYERS',{fontSize:'16px',fontStyle:'bold',color:'#efbd43'}).setOrigin(.5);
  players.forEach((p,i)=>{const x=left/2,y=h*.27+i*Math.min(86,h*.075),size=Math.min(58,left*.36);this.add.circle(x,y,size/2,0x15161b).setStrokeStyle(3,p.key===s.hostKey?0xffd45a:0xb8842c);const initials=(p.name||'?').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();this.add.text(x,y,initials,{fontSize:Math.max(16,size*.34)+'px',fontStyle:'bold',color:'#e8c36a'}).setOrigin(.5);this.add.text(x+size*.72,y,p.name+(p.key===s.hostKey?' ⭐':''),{fontSize:'12px',fontStyle:'bold',color:'#fff'}).setOrigin(0,.5);layout[p.key]={x:x-size/2,y:y-size/2,size};});
  this.add.text(w-right/2,h*.19,'LIVE FEED',{fontSize:'16px',fontStyle:'bold',color:'#efbd43'}).setOrigin(.5);(s.log||[]).slice(-8).reverse().forEach((e,i)=>this.add.text(w-right+15,h*.25+i*42,e.msg,{fontSize:'11px',color:'#eee',wordWrap:{width:right-30}}));
  LDUI.positionVideos(layout);
 }
 hostControls(){const s=LOCKDIN.state,w=this.scale.width,h=this.scale.height,y=h-35,items=[['▶ GO LIVE',()=>socket.emit('start',{code:LOCKDIN.room,key:LOCKDIN.key},r=>{if(!r?.ok)this.showToast(r.msg)}),0x7a5a0b],['💥 DROP',()=>socket.emit('drop',{code:LOCKDIN.room,count:1,key:LOCKDIN.key,style:'show'},r=>{if(!r?.ok)this.showToast(r.msg)}),0x9e1024],['🔁 RUN IT BACK',()=>socket.emit('runBack',{code:LOCKDIN.room,key:LOCKDIN.key},r=>{if(!r?.ok)this.showToast(r.msg)}),0x24262d]];items.forEach((a,i)=>{const x=w/2+(i-1)*Math.min(210,w*.25),bw=Math.min(190,w*.22),b=this.add.rectangle(x,y,bw,48,a[2]).setStrokeStyle(2,0xe2ad3b).setInteractive({useHandCursor:true});this.add.text(x,y,a[0],{fontSize:Math.min(14,w*.018)+'px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);b.on('pointerdown',a[1])})}
 async dropSequence(n,remaining){this.dropBusy=true;LDUI.positionVideos({});this.children.removeAll();const s=LOCKDIN.state,c=s?.cells?.find(x=>x.n===n),name=c?.ownerName||'PLAYER',w=this.scale.width,h=this.scale.height;
  const g=this.add.graphics();g.fillGradientStyle(0x010102,0x240508,0x5a0910,0x010102,1);g.fillRect(0,0,w,h);
  for(let i=0;i<6;i++)this.add.rectangle(w*(.12+i*.15),h*.24,5,h*.55,0xffd77a,.22).setAngle(-22+i*9);
  this.add.text(w/2,h*.10,'THE DROP HAS BEEN DECIDED',{fontSize:Math.min(54,w*.065)+'px',fontStyle:'bold',color:'#fff',stroke:'#8a0a17',strokeThickness:6}).setOrigin(.5);
  const pit=this.add.ellipse(w/2,h*.83,Math.min(700,w*.68),Math.min(160,h*.18),0x8d0713,.9).setStrokeStyle(8,0x2b1515);this.tweens.add({targets:pit,scaleX:1.08,scaleY:1.08,duration:400,yoyo:true,repeat:-1});
  const card=this.add.container(w/2,h*.50);const plate=this.add.rectangle(0,0,Math.min(380,w*.55),Math.min(430,h*.52),0x111217).setStrokeStyle(5,0xe2263e);const num=this.add.text(0,-35,String(n).padStart(2,'0'),{fontSize:Math.min(190,w*.24)+'px',fontStyle:'bold',color:'#eee',stroke:'#6f0610',strokeThickness:9}).setOrigin(.5);const nm=this.add.text(0,120,name.toUpperCase(),{fontSize:Math.min(38,w*.05)+'px',fontStyle:'bold',color:'#ffd05b'}).setOrigin(.5);card.add([plate,num,nm]);
  const title=this.add.text(w/2,h*.22,'',{fontSize:Math.min(100,w*.12)+'px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
  for(const x of ['3','2','1']){title.setText(x);this.cameras.main.shake(100,.004);await new Promise(r=>this.time.delayedCall(620,r))}
  title.setText('');this.tweens.add({targets:card,y:h*1.25,angle:26,scale:.12,alpha:.1,duration:1300,ease:'Cubic.easeIn'});this.cameras.main.shake(500,.016);
  await new Promise(r=>this.time.delayedCall(700,r));const stamp=this.add.text(w/2,h*.50,'GOT DROPPED!',{fontSize:Math.min(95,w*.11)+'px',fontStyle:'bold italic',color:'#ff334b',stroke:'#4d0008',strokeThickness:8}).setOrigin(.5).setAngle(-7).setScale(.2);this.tweens.add({targets:stamp,scale:1,duration:300,ease:'Back.easeOut'});
  await new Promise(r=>this.time.delayedCall(1200,r));this.add.text(w/2,h*.67,`${remaining} STILL LOCK'D`,{fontSize:Math.min(38,w*.05)+'px',fontStyle:'bold',color:'#ffd05b'}).setOrigin(.5);
  await new Promise(r=>this.time.delayedCall(700,r));this.dropBusy=false;this.draw()
 }
 winnerSequence(win){this.showToast(`🏆 #${win.n} ${win.name} TOOK THE BAG!`)}
}