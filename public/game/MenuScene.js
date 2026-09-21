
export default class MenuScene extends Phaser.Scene{
 constructor(){super('Menu')}
 create(){
  const w=this.scale.width,h=this.scale.height; this.cameras.main.fadeIn(350);
  const g=this.add.graphics();g.fillGradientStyle(0x020308,0x16050b,0x070812,0x020308,1);g.fillRect(0,0,w,h);
  for(let i=0;i<26;i++){let x=Math.random()*w,y=Math.random()*h;let s=this.add.circle(x,y,Math.random()*2+1,0xf6c84c,.35);this.tweens.add({targets:s,alpha:.05,duration:900+Math.random()*1500,yoyo:true,repeat:-1})}
  this.add.text(w/2,h*.18,"LOCK'D IN",{fontFamily:'Arial',fontSize:Math.min(94,w*.14)+'px',fontStyle:'bold',color:'#fff',stroke:'#8a0818',strokeThickness:5}).setOrigin(.5);
  this.add.text(w/2,h*.265,'🔒',{fontSize:Math.min(58,w*.09)+'px'}).setOrigin(.5);
  this.add.text(w/2,h*.32,'LOCK IN • STAY UP • TAKE THE BAG',{fontFamily:'Arial',fontSize:Math.min(18,w*.035)+'px',color:'#f6c84c'}).setOrigin(.5);
  const make=(y,label,cb,accent=false)=>{
    let box=this.add.rectangle(w/2,y,Math.min(430,w*.78),64,accent?0xc71029:0x151925,1).setStrokeStyle(2,accent?0xff5268:0xf6c84c).setInteractive({useHandCursor:true});
    let t=this.add.text(w/2,y,label,{fontFamily:'Arial',fontSize:'21px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);
    box.on('pointerover',()=>this.tweens.add({targets:[box,t],scale:1.035,duration:100}));
    box.on('pointerout',()=>this.tweens.add({targets:[box,t],scale:1,duration:100}));
    box.on('pointerdown',()=>cb());
  };
  make(h*.50,'🔥 CREATE ROOM',()=>this.openForm(true),true);
  make(h*.61,'🔑 JOIN ROOM',()=>this.openForm(false));
  make(h*.72,'🎮 HOW TO PLAY',()=>this.showRules());
 }
 openForm(create){
   const name=prompt('Player name:',LOCKDIN.name||'');
   if(!name)return; LOCKDIN.name=name.trim().slice(0,24);localStorage.setItem('lockdinName',LOCKDIN.name);
   if(create){
     const title=prompt('Room title:','LOCK’D IN LIVE')||'LOCK’D IN LIVE';
     socket.emit('create',{name:LOCKDIN.name,title,key:LOCKDIN.key},r=>this.handle(r,true));
   }else{
     const code=(prompt('Room code:','')||'').trim().toUpperCase();if(!code)return;
     socket.emit('join',{code,name:LOCKDIN.name,key:LOCKDIN.key},r=>this.handle(r,false));
   }
 }
 handle(r,created){
   if(!r?.ok){alert(r?.msg||'Could not enter room.');return}
   LOCKDIN.room=r.code||r.room?.code; LOCKDIN.host=created; this.scene.start('Lobby');
 }
 showRules(){alert("Pick an open number and LOCK IN. The host starts the round and drops occupied numbers. Stay up longer than everybody else. Last number standing wins.");}
}
