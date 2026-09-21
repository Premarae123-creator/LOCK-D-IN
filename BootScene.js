export default class BootScene extends Phaser.Scene{
 constructor(){super('Boot')}
 create(){const w=this.scale.width,h=this.scale.height;this.cameras.main.setBackgroundColor('#020204');
  const g=this.add.graphics();g.fillGradientStyle(0x020204,0x16080a,0x3a0b0f,0x020204,1);g.fillRect(0,0,w,h);
  for(let i=0;i<18;i++){let x=w*(i/17);let l=this.add.rectangle(x,h*.18,3,h*.38,0xd99a31,.18).setAngle(-20+i*2.3);this.tweens.add({targets:l,alpha:.5,duration:500+Math.random()*800,yoyo:true,repeat:-1})}
  let logo=this.add.text(w/2,h*.40,"LOCK'D IN",{fontSize:Math.min(100,w*.15)+'px',fontStyle:'bold',color:'#fff',stroke:'#7e0c18',strokeThickness:7}).setOrigin(.5);
  this.add.text(w/2,h*.51,'🔒  LOCK IN • STAY UP • TAKE THE BAG',{fontSize:Math.min(21,w*.035)+'px',fontStyle:'bold',color:'#f4c64d'}).setOrigin(.5);
  this.tweens.add({targets:logo,scale:1.055,duration:650,yoyo:true,repeat:1,ease:'Sine.easeInOut'});
  this.time.delayedCall(1600,()=>this.scene.start('Menu'));
 }}