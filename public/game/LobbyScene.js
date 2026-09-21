export default class LobbyScene extends Phaser.Scene{
 constructor(){super('Lobby')}
 create(){showMediaControls();this.onState=s=>{if(s?.code===LOCKDIN.room){LOCKDIN.state=s;LOCKDIN.host=s.hostKey===LOCKDIN.key;this.draw()}};socket.on('state',this.onState);socket.emit('sync',{code:LOCKDIN.room,key:LOCKDIN.key},r=>{if(r?.state){LOCKDIN.state=r.state;this.draw()}});this.draw()}
 shutdown(){socket.off('state',this.onState)}
 draw(){this.children.removeAll();const w=this.scale.width,h=this.scale.height,s=LOCKDIN.state;this.cameras.main.setBackgroundColor('#040407');
  const bg=this.add.graphics();bg.fillGradientStyle(0x020204,0x1a080a,0x09090e,0x020204,1);bg.fillRect(0,0,w,h);
  this.add.text(w/2,44,"LOCK'D IN 🔒",{fontSize:Math.min(45,w*.075)+'px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
  this.add.text(w/2,88,`ROOM ${LOCKDIN.room}`,{fontSize:'18px',fontStyle:'bold',color:'#efbd43'}).setOrigin(.5);
  this.add.text(w/2,126,s?.title||'THE ROOM IS OPEN',{fontSize:'24px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
  const players=s?.players||[];players.slice(0,8).forEach((p,i)=>{const y=185+i*46;this.add.rectangle(w/2,y,Math.min(480,w*.84),38,0x111218).setStrokeStyle(1,p.key===s?.hostKey?0xe7ad35:0x383a43);this.add.text(w/2,y,(p.key===s?.hostKey?'⭐ HOST • ':'')+p.name,{fontSize:'16px',fontStyle:'bold',color:'#fff'}).setOrigin(.5)});
  const y=Math.min(h-70,235+players.length*46);const b=this.add.rectangle(w/2,y,Math.min(430,w*.8),60,0x9f1024).setStrokeStyle(2,0xe7ad35).setInteractive({useHandCursor:true});this.add.text(w/2,y,'🎬 ENTER LIVE ARENA',{fontSize:'20px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);b.on('pointerdown',()=>this.scene.start('Arena'));
 }}