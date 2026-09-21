
export default class LobbyScene extends Phaser.Scene{
 constructor(){super('Lobby')}
 create(){
  this.draw(); this.onState=s=>{LOCKDIN.state=s;if(s?.code===LOCKDIN.room){LOCKDIN.host=s.hostKey===LOCKDIN.key;this.draw()}};
  socket.on('state',this.onState); socket.emit('sync',{code:LOCKDIN.room,key:LOCKDIN.key});
 }
 shutdown(){socket.off('state',this.onState)}
 draw(){
  this.children.removeAll();
  const w=this.scale.width,h=this.scale.height,s=LOCKDIN.state;
  this.cameras.main.setBackgroundColor('#05060b');
  this.add.text(w/2,52,"LOCK'D IN 🔒",{fontSize:Math.min(46,w*.08)+'px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
  this.add.text(w/2,96,`ROOM ${LOCKDIN.room}`,{fontSize:'20px',fontStyle:'bold',color:'#f6c84c'}).setOrigin(.5);
  this.add.text(w/2,145,s?.title||'WAITING FOR PLAYERS',{fontSize:'24px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
  const players=Object.values(s?.players||{});
  this.add.text(w/2,190,`${players.length} PLAYER${players.length===1?'':'S'} IN THE ROOM`,{fontSize:'16px',color:'#aeb6ca'}).setOrigin(.5);
  players.slice(0,10).forEach((p,i)=>{
    let y=245+i*42;this.add.rectangle(w/2,y,Math.min(440,w*.82),34,0x111522).setStrokeStyle(1,p.key===s?.hostKey?0xf6c84c:0x30384b);
    this.add.text(w/2,y,(p.key===s?.hostKey?'⭐ ':'')+p.name,{fontSize:'16px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
  });
  const y=Math.min(h-80,300+players.length*42);
  let b=this.add.rectangle(w/2,y,Math.min(420,w*.78),62,0xc71029).setStrokeStyle(2,0xff5268).setInteractive({useHandCursor:true});
  this.add.text(w/2,y,'🎮 ENTER THE ARENA',{fontSize:'20px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
  b.on('pointerdown',()=>this.scene.start('Arena'));
 }
}
