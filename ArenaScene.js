
export default class ArenaScene extends Phaser.Scene{
 constructor(){super('Arena');this.tiles=new Map()}
 create(){
  this.onState=s=>{if(s?.code===LOCKDIN.room){LOCKDIN.state=s;LOCKDIN.host=s.hostKey===LOCKDIN.key;this.renderState()}};
  this.onDrop=async e=>{if(e.drops?.length)for(const n of e.drops)await this.dropSequence(n,e.remaining)};
  socket.on('state',this.onState);socket.on('dropEvent',this.onDrop);socket.emit('sync',{code:LOCKDIN.room,key:LOCKDIN.key});
  this.renderState();
 }
 shutdown(){socket.off('state',this.onState);socket.off('dropEvent',this.onDrop)}
 renderState(){
  this.children.removeAll();this.tiles.clear();const s=LOCKDIN.state,w=this.scale.width,h=this.scale.height;
  const bg=this.add.graphics();bg.fillGradientStyle(0x020308,0x12050a,0x090b13,0x020308,1);bg.fillRect(0,0,w,h);
  this.add.text(20,20,"LOCK'D IN 🔒",{fontSize:Math.min(36,w*.065)+'px',fontStyle:'bold',color:'#fff'});
  this.add.text(w-20,27,`ROOM ${LOCKDIN.room}  •  R${s?.round||1}`,{fontSize:'15px',fontStyle:'bold',color:'#f6c84c'}).setOrigin(1,0);
  this.add.text(w/2,72,s?.status==='live'?'🔥 LIVE — STAY LOCK’D':'PICK YOUR NUMBER',{fontSize:Math.min(25,w*.048)+'px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
  const cells=s?.cells||Array.from({length:25},(_,i)=>({n:i+1}));
  const cols=w<560?5:Math.min(10,Math.ceil(Math.sqrt(cells.length)));
  const gap=8,usable=Math.min(w-24,900),tw=(usable-gap*(cols-1))/cols,rows=Math.ceil(cells.length/cols),th=Math.min(tw*.82,(h-190)/rows-gap);
  const startX=(w-(tw*cols+gap*(cols-1)))/2,startY=110;
  cells.forEach((c,i)=>{
    const col=i%cols,row=Math.floor(i/cols),x=startX+col*(tw+gap)+tw/2,y=startY+row*(th+gap)+th/2;
    let fill=c.dropped?0x31060c:c.ownerKey?0x7d0c1d:0x171c29,stroke=c.dropped?0x5c101b:c.ownerKey?0xff334d:0xf6c84c;
    let box=this.add.rectangle(x,y,tw,th,Math.max(12,fill)).setStrokeStyle(c.ownerKey?3:2,stroke).setInteractive({useHandCursor:true});
    let num=this.add.text(x,y-(c.ownerKey?8:0),String(c.n).padStart(2,'0'),{fontSize:Math.max(18,Math.min(36,tw*.38))+'px',fontStyle:'bold',color:c.dropped?'#7d5660':'#fff'}).setOrigin(.5);
    if(c.ownerKey)this.add.text(x,y+th*.28,(c.dropped?'DROPPED • ':'🔒 ')+(c.ownerName||''),{fontSize:Math.max(7,Math.min(11,tw*.12))+'px',fontStyle:'bold',color:c.dropped?'#9b6872':'#ffd55a'}).setOrigin(.5);
    if(!c.ownerKey&&!c.dropped) box.on('pointerdown',()=>socket.emit('claim',{code:LOCKDIN.room,n:c.n,key:LOCKDIN.key},r=>{if(!r?.ok)alert(r?.msg||'Could not lock in')}))
    this.tiles.set(c.n,{box,num,x,y});
  });
  if(LOCKDIN.host){
    const yy=h-42;
    const mk=(x,label,cb,color=0xc71029)=>{let b=this.add.rectangle(x,yy,Math.min(190,w*.29),48,color).setStrokeStyle(2,0xff5268).setInteractive({useHandCursor:true});this.add.text(x,yy,label,{fontSize:Math.min(15,w*.027)+'px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);b.on('pointerdown',cb)};
    mk(w*.23,s?.status==='live'?'🔥 LIVE':'▶ GO LIVE',()=>socket.emit('start',{code:LOCKDIN.room,key:LOCKDIN.key},r=>{if(!r?.ok)alert(r.msg)}),0x7a5b09);
    mk(w*.50,'💥 DROP 1',()=>socket.emit('drop',{code:LOCKDIN.room,count:1,key:LOCKDIN.key,style:'game'},r=>{if(!r?.ok)alert(r.msg)}));
    mk(w*.77,'🔁 RUN IT BACK',()=>socket.emit('runBack',{code:LOCKDIN.room,key:LOCKDIN.key},r=>{if(!r?.ok)alert(r.msg)}),0x202638);
  }
 }
 async dropSequence(n,remaining){
  const s=LOCKDIN.state,c=s?.cells?.find(x=>x.n===n),name=c?.ownerName||'PLAYER',w=this.scale.width,h=this.scale.height;
  const cam=this.cameras.main;cam.flash(120,255,255,255);cam.shake(160,.008);
  const veil=this.add.rectangle(w/2,h/2,w,h,0x000000,.86).setDepth(100);
  const title=this.add.text(w/2,h*.18,'THE DROP HAS BEEN DECIDED',{fontSize:Math.min(46,w*.075)+'px',fontStyle:'bold',color:'#fff',stroke:'#7a0614',strokeThickness:5}).setOrigin(.5).setDepth(102);
  const card=this.add.container(w/2,h*.52).setDepth(103);
  const plate=this.add.rectangle(0,0,Math.min(360,w*.64),Math.min(430,h*.52),0x151923).setStrokeStyle(5,0xff334d);
  const num=this.add.text(0,-40,String(n).padStart(2,'0'),{fontSize:Math.min(170,w*.27)+'px',fontStyle:'bold',color:'#fff',stroke:'#780a18',strokeThickness:8}).setOrigin(.5);
  const nm=this.add.text(0,110,name.toUpperCase(),{fontSize:Math.min(35,w*.06)+'px',fontStyle:'bold',color:'#ffd54b'}).setOrigin(.5);card.add([plate,num,nm]);
  for(const count of ['3','2','1']){title.setText(count+'...');await new Promise(r=>this.time.delayedCall(620,r))}
  title.setText('GOT DROPPED!');
  this.tweens.add({targets:card,y:h*1.35,angle:24,scale:.18,alpha:.1,duration:1250,ease:'Cubic.easeIn'});
  cam.shake(420,.018);await new Promise(r=>this.time.delayedCall(1350,r));
  title.setText(`${remaining} STILL LOCK'D`);title.setColor('#ffd54b');
  await new Promise(r=>this.time.delayedCall(800,r));veil.destroy();title.destroy();card.destroy();this.renderState();
 }
}
