import BootScene from './BootScene.js';
import MenuScene from './MenuScene.js';
import LobbyScene from './LobbyScene.js';
import ArenaScene from './ArenaScene.js';

window.socket=io();
window.LOCKDIN={
 key:localStorage.getItem('lockdinPlayerKey')||(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random()),
 name:localStorage.getItem('lockdinName')||'',room:'',state:null,host:false,
 media:{localStream:null,pcs:{},peerNames:{},iceQueues:{},videos:{},camera:false,mic:false}
};
localStorage.setItem('lockdinPlayerKey',LOCKDIN.key);

window.LDUI={
 toast(msg){window.game?.scene?.getScenes(true)?.[0]?.showToast?.(msg)},
 clearVideos(){document.getElementById('mediaLayer').innerHTML='';LOCKDIN.media.videos={}},
 positionVideos(layout={}){
   for(const [k,pos] of Object.entries(layout)){
     const v=document.getElementById('vid-'+k);if(!v)continue;
     Object.assign(v.style,{left:pos.x+'px',top:pos.y+'px',width:pos.size+'px',height:pos.size+'px',display:'block'});
   }
   document.querySelectorAll('.playerVideo').forEach(v=>{if(!layout[v.dataset.key])v.style.display='none'})
 }
};

const config={type:Phaser.AUTO,parent:'game',backgroundColor:'#020204',
 scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
 render:{antialias:true,pixelArt:false,roundPixels:false},
 scene:[BootScene,MenuScene,LobbyScene,ArenaScene]};
window.game=new Phaser.Game(config);

// WebRTC overlay — preserves the working glare/ICE approach from the prior build.
const M=LOCKDIN.media, layer=document.getElementById('mediaLayer'), controls=document.getElementById('mediaControls');
function addVideo(k,name,stream,isLocal=false){
 let v=document.getElementById('vid-'+k);
 if(!v){v=document.createElement('video');v.id='vid-'+k;v.dataset.key=k;v.className='playerVideo '+(isLocal?'local':'remote');v.autoplay=true;v.playsInline=true;v.muted=isLocal;layer.appendChild(v)}
 if(v.srcObject!==stream)v.srcObject=stream;v.play().catch(()=>{});M.videos[k]=v;
}
function makePC(otherKey,name){
 if(M.pcs[otherKey])return M.pcs[otherKey];
 const pc=new RTCPeerConnection({iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]});
 M.pcs[otherKey]=pc;M.peerNames[otherKey]=name||'Player';M.iceQueues[otherKey]=M.iceQueues[otherKey]||[];
 if(M.localStream)M.localStream.getTracks().forEach(t=>pc.addTrack(t,M.localStream));
 pc.onicecandidate=e=>{if(e.candidate)socket.emit('rtc-signal',{code:LOCKDIN.room,to:otherKey,from:LOCKDIN.key,data:{candidate:e.candidate}})};
 pc.ontrack=e=>addVideo(otherKey,M.peerNames[otherKey],e.streams?.[0]||new MediaStream([e.track]),false);
 pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState)){document.getElementById('vid-'+otherKey)?.remove()}};
 return pc;
}
async function flushIce(k){const pc=M.pcs[k];if(!pc?.remoteDescription)return;const q=M.iceQueues[k]||[];M.iceQueues[k]=[];for(const c of q){try{await pc.addIceCandidate(c)}catch{}}}
window.startMedia=async()=>{
 try{
   if(!M.localStream)M.localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
   M.camera=true;M.mic=true;M.localStream.getVideoTracks().forEach(t=>t.enabled=true);M.localStream.getAudioTracks().forEach(t=>t.enabled=true);
   addVideo(LOCKDIN.key,LOCKDIN.name||'You',M.localStream,true);socket.emit('rtc-ready',{code:LOCKDIN.room,key:LOCKDIN.key});updateButtons();
 }catch{alert('Camera/microphone permission was not granted. You can keep using your avatar.')}
};
window.avatarMode=()=>{M.camera=false;if(M.localStream)M.localStream.getVideoTracks().forEach(t=>t.enabled=false);document.getElementById('vid-'+LOCKDIN.key)?.remove();updateButtons()};
window.toggleMic=()=>{if(!M.localStream)return startMedia();M.mic=!M.mic;M.localStream.getAudioTracks().forEach(t=>t.enabled=M.mic);updateButtons()};
window.toggleCamera=()=>{if(!M.localStream)return startMedia();M.camera=!M.camera;M.localStream.getVideoTracks().forEach(t=>t.enabled=M.camera);if(M.camera)addVideo(LOCKDIN.key,LOCKDIN.name,M.localStream,true);else document.getElementById('vid-'+LOCKDIN.key)?.remove();updateButtons()};
function updateButtons(){cameraBtn.classList.toggle('on',M.camera);micBtn.classList.toggle('on',M.mic);cameraBtn.textContent=M.camera?'📹 CAMERA ON':'📷 CAMERA OFF';micBtn.textContent=M.mic?'🎙️ MIC ON':'🔇 MIC OFF'}
cameraBtn.onclick=toggleCamera;micBtn.onclick=toggleMic;avatarBtn.onclick=avatarMode;

socket.on('rtc-peer',async({key:k,name})=>{if(!M.localStream||k===LOCKDIN.key)return;const pc=makePC(k,name);if(String(LOCKDIN.key)<String(k)&&pc.signalingState==='stable'){const offer=await pc.createOffer();await pc.setLocalDescription(offer);socket.emit('rtc-signal',{code:LOCKDIN.room,to:k,from:LOCKDIN.key,data:{sdp:pc.localDescription}})}});
socket.on('rtc-signal',async({from,data})=>{if(!M.localStream||from===LOCKDIN.key)return;const p=LOCKDIN.state?.players?.find(x=>x.key===from),pc=makePC(from,p?.name||'Player');try{if(data.sdp){await pc.setRemoteDescription(data.sdp);await flushIce(from);if(data.sdp.type==='offer'){const ans=await pc.createAnswer();await pc.setLocalDescription(ans);socket.emit('rtc-signal',{code:LOCKDIN.room,to:from,from:LOCKDIN.key,data:{sdp:pc.localDescription}})}}else if(data.candidate){if(pc.remoteDescription)await pc.addIceCandidate(data.candidate);else(M.iceQueues[from]||(M.iceQueues[from]=[])).push(data.candidate)}}catch(e){console.warn(e)}});
socket.on('rtc-remove',({key:k})=>{M.pcs[k]?.close();delete M.pcs[k];document.getElementById('vid-'+k)?.remove()});
window.showMediaControls=()=>controls.classList.remove('hidden');
window.hideMediaControls=()=>controls.classList.add('hidden');
