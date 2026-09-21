export default class MenuScene extends Phaser.Scene{
 constructor(){super('Menu')}
 create(){hideMediaControls();const w=this.scale.width,h=this.scale.height;this.cameras.main.setBackgroundColor('#030306');
  const g=this.add.graphics();g.fillGradientStyle(0x020204,0x1d0809,0x08080d,0x020204,1);g.fillRect(0,0,w,h);
  for(let i=0;i<30;i++){const p=this.add.circle(Math.random()*w,Math.random()*h,1+Math.random()*2,0xe5ad3b,.35);this.tweens.add({targets:p,alpha:.05,duration:600+Math.random()*1400,yoyo:true,repeat:-1})}
  this.add.text(w/2,h*.18,"LOCK'D IN 🔒",{fontSize:Math.min(92,w*.14)+'px',fontStyle:'bold',color:'#fff',stroke:'#780b17',strokeThickness:6}).setOrigin(.5);
  this.add.text(w/2,h*.29,'THE LIVE ELIMINATION GAME',{fontSize:Math.min(22,w*.04)+'px',fontStyle:'bold',color:'#e9b841',letterSpacing:2}).setOrigin(.5);
  this.button(h*.49,'🔥 CREATE GAME',()=>this.form(true),0x9f1024);
  this.button(h*.61,'🔑 JOIN GAME',()=>this.form(false),0x171922);
  this.button(h*.73,'🎮 HOW TO PLAY',()=>alert("Choose a number and LOCK IN. Once the host goes live, occupied numbers are randomly dropped. Last number standing wins."),0x171922);
 }
 button(y,label,cb,color){const w=this.scale.width,b=this.add.rectangle(w/2,y,Math.min(440,w*.8),66,color).setStrokeStyle(2,0xe2ad3b).setInteractive({useHandCursor:true});this.add.text(w/2,y,label,{fontSize:'21px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);b.on('pointerdown',cb);b.on('pointerover',()=>b.setScale(1.025));b.on('pointerout',()=>b.setScale(1))}
 form(create){const name=(prompt('Player name:',LOCKDIN.name)||'').trim();if(!name)return;LOCKDIN.name=name.slice(0,28);localStorage.setItem('lockdinName',LOCKDIN.name);
  if(create){const title=prompt('Game title:','LOCK’D IN LIVE')||'LOCK’D IN LIVE';const size=Number(prompt('How many numbers?','30'))||30;const prize=prompt('Prize display:','$500 CASH')||'Prize TBA';socket.emit('create',{name:LOCKDIN.name,title,size,prize,key:LOCKDIN.key},r=>this.enter(r))}
  else{const code=(prompt('Room code:','')||'').trim().toUpperCase();if(code)socket.emit('join',{name:LOCKDIN.name,code,key:LOCKDIN.key},r=>this.enter(r))}
 }
 enter(r){if(!r?.ok)return alert(r?.msg||'Could not enter game.');LOCKDIN.room=r.code;this.scene.start('Lobby')}
}