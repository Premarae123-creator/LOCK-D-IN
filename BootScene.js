
export default class BootScene extends Phaser.Scene{
 constructor(){super('Boot')}
 create(){
   const w=this.scale.width,h=this.scale.height;
   const bg=this.add.graphics(); bg.fillGradientStyle(0x030409,0x09030a,0x22050b,0x030409,1); bg.fillRect(0,0,w,h);
   const logo=this.add.text(w/2,h*.40,"LOCK'D IN 🔒",{fontFamily:'Arial',fontSize:Math.min(78,w*.11)+'px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
   this.add.text(w/2,h*.49,'LOCK IN  •  STAY UP  •  TAKE THE BAG',{fontFamily:'Arial',fontSize:Math.min(18,w*.032)+'px',color:'#f6c84c',letterSpacing:3}).setOrigin(.5);
   const barBg=this.add.rectangle(w/2,h*.62,Math.min(430,w*.72),10,0x222631).setOrigin(.5);
   const bar=this.add.rectangle(barBg.x-barBg.width/2,h*.62,1,10,0xf6c84c).setOrigin(0,.5);
   this.tweens.add({targets:logo,scale:{from:.92,to:1.04},duration:850,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
   this.tweens.add({targets:bar,width:barBg.width,duration:1350,ease:'Cubic.easeOut',onComplete:()=>this.cameras.main.fadeOut(350,0,0,0,(c,p)=>{if(p===1)this.scene.start('Menu')})});
 }
}
