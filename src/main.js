import './style.css';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import bananaUrl from '../output/banana-milk.glb?url';
import bravoUrl from '../output/bravo-cone.glb?url';
import yoplaitUrl from '../output/yoplait.glb?url';

const $=s=>document.querySelector(s), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const products=[
 {key:'banana',name:'바나나맛우유',url:bananaUrl,bg:'#f7cf53',accent:'#28784b',title:'LITTLE<br> BOTTLE.<br> <span>BIG SMILE.</span>',stamp:'BANANA<br>BLISS!',top:'THE ORIGINAL',bottom:'달콤함으로 이륙!',a:'한 모금이면 충분해.<br>온 우주가 빙그레 웃는 맛.',b:'언제 만나도 반가운<br>오리지널 바나나맛우유.',height:4.0,tilt:-.14},
 {key:'bravo',name:'부라보콘',url:bravoUrl,bg:'#a8d7df',accent:'#235590',title:'ONE CONE.<br> A WHOLE<br> <span>LOT OF LOVE.</span>',stamp:'BRAVO<br>TO LOVE!',top:'HEARTS EVERYWHERE',bottom:'한 입 가득, 부라보!',a:'하트가 가득한 오늘.<br>바닐라처럼 부드러운 순간.',b:'끝까지 즐거운 달콤함.<br>기분 좋은 한 입, 부라보콘.',height:4.4,tilt:.14},
 {key:'yoplait',name:'요플레 오리지널',url:yoplaitUrl,bg:'#f2aeb5',accent:'#a33145',title:'SPOONFUL<br> OF PURE<br> <span>HAPPINESS.</span>',stamp:'BERRY<br>HAPPY!',top:'A SPOONFUL OF JOY',bottom:'상큼함을 떠먹어요!',a:'새콤달콤 딸기 한 스푼.<br>작은 컵 속 커다란 행복.',b:'나를 위한 부드러운 시간.<br>요플레 오리지널 딸기.',height:3.15,tilt:-.11}
];
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch(error){$('#loading-message').textContent='3D를 표시할 수 없어요. WebGL을 지원하는 브라우저에서 다시 열어주세요.';}
if(renderer) start();
function start(){
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 $('#world').appendChild(renderer.domElement);
 const scene=new THREE.Scene(), camera=new THREE.OrthographicCamera();camera.position.set(0,3.2,15);camera.lookAt(0,0,0);
 const pmrem=new THREE.PMREMGenerator(renderer),env=new RoomEnvironment();scene.environment=pmrem.fromScene(env,.08).texture;env.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfffbed,0x536956,1.7));
 const key=new THREE.DirectionalLight(0xfffae8,2.5);key.position.set(-5,7,7);scene.add(key);
 const fill=new THREE.DirectionalLight(0xffffff,1.2);fill.position.set(5,2,-5);scene.add(fill);
 const rig=new THREE.Group();scene.add(rig);
 const mat=(color,roughness=.45)=>new THREE.MeshStandardMaterial({color,roughness});
 const green=mat('#28784b'),cream=mat('#fff5d2'),yellow=mat('#ffd74e'),ink=mat('#173429');
 const box=(w,h,d,m,x=0,y=0,z=0,r=.08)=>{const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),m);o.position.set(x,y,z);return o;};
 const parcel=new THREE.Group();rig.add(parcel);
 parcel.add(box(5.0,.16,3.4,green,0,-2,0));
 parcel.add(box(5,.9,.12,green,0,-1.6,1.66));parcel.add(box(5,.9,.12,green,0,-1.6,-1.66));
 parcel.add(box(.12,.9,3.3,green,-2.44,-1.6,0));parcel.add(box(.12,.9,3.3,green,2.44,-1.6,0));
 parcel.add(box(4.8,.08,3.1,cream,0,-1.88,0));
 const lidHinge=new THREE.Group();lidHinge.position.set(0,-1.1,-1.68);parcel.add(lidHinge);
 lidHinge.add(box(5.05,.12,3.42,green,0,0,1.71));
 const lidInner=box(4.8,.045,3.18,cream,0,-.083,1.71);lidHinge.add(lidInner);
 lidHinge.rotation.x=-1.7;
 // A three-dimensional smile stamp on the front of the gift tray.
 const smileGroup=new THREE.Group();smileGroup.position.set(0,-1.59,1.745);parcel.add(smileGroup);
 const eyeGeo=new THREE.SphereGeometry(.045,12,8);
 for(const x of [-.20,.20]){const eye=new THREE.Mesh(eyeGeo,cream);eye.position.set(x,.08,0);smileGroup.add(eye);}
 const smileCurve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.27,-.02,0),new THREE.Vector3(0,-.33,0),new THREE.Vector3(.27,-.02,0));smileGroup.add(new THREE.Mesh(new THREE.TubeGeometry(smileCurve,20,.027,8,false),cream));
 const productAnchor=new THREE.Group();productAnchor.position.set(.3,.4,.1);rig.add(productAnchor);
 const spin=new THREE.Group();productAnchor.add(spin);
 const userQuaternion=new THREE.Quaternion(),delta=new THREE.Quaternion(),axis=new THREE.Vector3(),baseQ=new THREE.Quaternion(),baseE=new THREE.Euler();
 let models=[],loaded=0,index=0,heroBucket=0,manual=false,scrollAtManual=0,transition=1,process=0,smoothScroll=scrollY,lastTime=0,drag=null,dxTotal=0,dyTotal=0,sound=false,audio;
 const state={loadedProducts:[],index:0,process:0,scroll:0,boxClosed:0,quaternion:[0,0,0,1]};window.getExperienceState=()=>({...state,quaternion:spin.quaternion.toArray(),verticalRotation:dyTotal,horizontalRotation:dxTotal});
 const hit=$('#rotation-hit');
 function rotate(dx,dy){const distance=Math.hypot(dx,dy);if(!distance)return;axis.set(dy,dx,0).normalize();delta.setFromAxisAngle(axis,distance);userQuaternion.premultiply(delta).normalize();dxTotal+=dx;dyTotal+=dy;}
 function reset(){userQuaternion.identity();dxTotal=dyTotal=0;}
 hit.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};hit.setPointerCapture(e.pointerId);hit.classList.add('dragging');});
 hit.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;rotate((e.clientX-drag.x)*.01,(e.clientY-drag.y)*.01);drag.x=e.clientX;drag.y=e.clientY;});
 const stop=()=>{drag=null;hit.classList.remove('dragging');};hit.addEventListener('pointerup',stop);hit.addEventListener('pointercancel',stop);hit.addEventListener('lostpointercapture',stop);
 hit.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home')reset();if(e.key==='ArrowLeft')rotate(-.16,0);if(e.key==='ArrowRight')rotate(.16,0);if(e.key==='ArrowUp')rotate(0,-.16);if(e.key==='ArrowDown')rotate(0,.16);});$('#reset').onclick=reset;
 function chime(){if(!sound)return;audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(440+index*110,audio.currentTime);o.frequency.exponentialRampToValueAtTime(880+index*110,audio.currentTime+.12);g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.26);}
 $('#sound').onclick=()=>{sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',sound?'효과음 끄기':'효과음 켜기');chime();};
 function choose(n,fromScroll=false){
  n=(n+3)%3;if(!models[n])return;
  if(!fromScroll){manual=true;scrollAtManual=scrollY;}if(n===index)return;
  index=n;transition=0;reset();const p=products[index];
  document.body.dataset.product=p.key;document.documentElement.style.setProperty('--theme',p.bg);document.documentElement.style.setProperty('--accent',p.accent);
  $('#hero-title').innerHTML=p.title;$('#description-one').innerHTML=p.a;$('#description-two').innerHTML=p.b;$('#stamp-main').innerHTML=p.stamp;$('#stamp-top').textContent=p.top;$('#stamp-bottom').textContent=p.bottom;$('#product-name').textContent=p.name;$('#product-count').textContent=`0${index+1}`;
  $('#copy-content').classList.remove('changing');void $('#copy-content').offsetWidth;$('#copy-content').classList.add('changing');
  document.querySelectorAll('[data-index]').forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});
  green.color.set(p.accent);chime();
 }
 $('#prev').onclick=()=>choose(index-1);$('#next').onclick=()=>choose(index+1);document.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.index)));
 const loader=new GLTFLoader();
 Promise.allSettled(products.map(async(p,i)=>{
  const gltf=await loader.loadAsync(p.url),model=gltf.scene;
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  model.position.sub(center);const wrapper=new THREE.Group();wrapper.add(model);wrapper.scale.setScalar(p.height/size.y);wrapper.visible=false;spin.add(wrapper);models[i]=wrapper;
  model.traverse(o=>{if(o.isMesh){o.material.envMapIntensity=.55;if(o.material.transparent){o.material.depthWrite=false;o.renderOrder=3;}}});
  loaded++;state.loadedProducts.push(p.key);$('#load-count').textContent=`${loaded} / 3`;$('.load-track i').style.width=`${loaded/3*100}%`;
 })).then(results=>{
  if(results.some(r=>r.status==='rejected')){console.error('Some product models failed to load',results);$('#loading-message').textContent='일부 제품을 불러오지 못했어요. 새로고침해 주세요.';document.body.dataset.model='error';return;}
  document.body.dataset.model='ready';$('#loader').classList.add('ready');
 });
 // Small sculpted mascot and orbiting sweets keep the hero a complete 3D scene.
 const mascot=new THREE.Group();rig.add(mascot);mascot.position.set(-2.0,-.6,.7);
 const sphere=(r,m,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,28,20),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;};
 mascot.add(sphere(.70,yellow,0,0,0,1,1.12,.85));
 for(const x of [-.25,.25]){mascot.add(sphere(.12,cream,x,.1,.55,1,1.2,.6));mascot.add(sphere(.065,ink,x,.1,.63,1,1,.5));mascot.add(sphere(.13,mat('#f09973'),x*1.45,-.1,.48,1,.45,.3));}
 const mouth=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.17,-.16,.59),new THREE.Vector3(0,-.38,.62),new THREE.Vector3(.17,-.16,.59));mascot.add(new THREE.Mesh(new THREE.TubeGeometry(mouth,16,.022,8,false),ink));
 mascot.add(sphere(.19,green,-.18,.73,0,1.4,.5,.8));mascot.add(sphere(.19,green,.14,.76,0,1.3,.5,.8));
 for(const x of [-.42,.42])mascot.add(sphere(.18,yellow,x,-.71,.05,1.3,.55,1));
 const satellites=new THREE.Group();rig.add(satellites);
 const planets=[];
 for(let i=0;i<5;i++){const group=new THREE.Group();const color=[cream,yellow,green,cream,yellow][i];group.add(sphere(.13+i*.028,color,0,0,0));if(i===0||i===3){const ring=new THREE.Mesh(new THREE.TorusGeometry(.28+i*.025,.023,8,40),green);ring.rotation.x=1;group.add(ring);}satellites.add(group);planets.push(group);}
 const floorRing=new THREE.Mesh(new THREE.TorusGeometry(3.1,.018,8,100),new THREE.MeshBasicMaterial({color:0x173429,transparent:true,opacity:.24}));floorRing.rotation.x=Math.PI/2;floorRing.position.y=-2.24;rig.add(floorRing);
 let heroEnd=0,howTop=0,howTravel=0,outroTop=0,visibleWidth=0,viewHeight=9.5;
 function resize(){
  renderer.setSize(innerWidth,innerHeight);viewHeight=innerWidth<=700?10.5:9.4;visibleWidth=viewHeight*innerWidth/innerHeight;
  camera.left=-visibleWidth/2;camera.right=visibleWidth/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.near=.1;camera.far=80;camera.updateProjectionMatrix();
  howTop=$('#how').offsetTop;heroEnd=howTop-innerHeight;howTravel=$('#how').offsetHeight-innerHeight;outroTop=$('.outro').offsetTop;
 }
 addEventListener('resize',resize);resize();
 document.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>{const n=Number(button.dataset.step);scrollTo({top:howTop+howTravel*(n===0?.05:n===1?.48:.88),behavior:reduced?'instant':'smooth'});});
 const steps=[['01 / PICK','PICK YOUR<br><em>HAPPINESS.</em>','오늘의 기분에 어울리는 달콤함을 골라요.'],['02 / PACK','A LITTLE BOX.<br><em>A LOT OF JOY.</em>','좋아하는 마음을 한 상자에 차곡차곡 담아요.'],['03 / SHARE','READY, SET…<br><em>SMILE!</em>','나에게도, 소중한 사람에게도. 달콤함을 전해요.']];
 const bounds=new THREE.Box3(),corner=new THREE.Vector3(),targetBackground=new THREE.Color(),heroColor=new THREE.Color(),processColor=new THREE.Color('#7fb69b');let currentStep=-1;
 const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp,ease=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
 renderer.setAnimationLoop(time=>{
  const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;if(document.hidden)return;
  smoothScroll=reduced?scrollY:lerp(smoothScroll,scrollY,1-Math.exp(-dt*10));transition=Math.min(1,transition+dt*2.8);
  const heroP=clamp(smoothScroll/Math.max(1,heroEnd),0,1),bucket=Math.min(2,Math.floor(heroP*3));
  if(manual&&Math.abs(scrollY-scrollAtManual)>80)manual=false;
  if(bucket!==heroBucket){heroBucket=bucket;if(!manual)choose(bucket,true);}
  process=clamp((smoothScroll-howTop)/Math.max(1,howTravel),0,1);
  const entrance=ease(howTop-innerHeight*.65,howTop,smoothScroll),exit=ease(outroTop-innerHeight*.5,outroTop,smoothScroll),mobile=innerWidth<=700;
  const pack=ease(.28,.58,process),send=ease(.64,1,process);
  const step=process<.28?0:process<.68?1:2;
  if(step!==currentStep){currentStep=step;$('#step-number').textContent=steps[step][0];$('#step-title').innerHTML=steps[step][1];$('#step-description').textContent=steps[step][2];document.querySelectorAll('[data-step]').forEach((b,i)=>{b.classList.toggle('active',i===step);b.setAttribute('aria-pressed',String(i===step));});}
  heroColor.set(products[index].bg);targetBackground.copy(heroColor).lerp(processColor,entrance);document.body.style.backgroundColor=`#${targetBackground.getHexString()}`;
  // On desktop the 3D package occupies the original reference's left two thirds.
  const heroX=mobile?0:-visibleWidth*.19,processX=mobile?0:-visibleWidth*.11;
  rig.position.set(lerp(heroX,processX,entrance)+send*(mobile?.2:visibleWidth*.05),lerp(mobile?1.5:0,mobile?-.85:-.05,entrance)+Math.sin(send*Math.PI)*1.15,0);
  const scale=mobile?.51:1;rig.scale.setScalar(scale*lerp(1,.88,send)*(1-exit*.5));rig.rotation.set(.04+send*.15,entrance*(process*Math.PI*1.5)+send*Math.PI*.8,lerp(-.06,-.18,send));
  rig.visible=exit<.99;
  lidHinge.rotation.x=lerp(-1.7,0,pack);productAnchor.position.y=lerp(.35,-1.47,pack);productAnchor.scale.setScalar(lerp(1,.16,pack));
  mascot.scale.setScalar(lerp(1,.01,pack));mascot.rotation.z=Math.sin(time*.0012)*.07*(reduced?0:1);satellites.scale.setScalar(1-pack*.8);
  const bob=reduced?0:Math.sin(time*.0015)*.075;
  productAnchor.position.y+=bob*(1-pack);baseQ.setFromEuler(baseE.set(.025,Math.sin(time*.00035)*.12*(reduced?0:1),products[index].tilt));spin.quaternion.copy(baseQ).premultiply(userQuaternion);
  models.forEach((m,i)=>{m.visible=i===index;if(i===index){m.rotation.y=(1-ease(0,1,transition))*.8;m.position.y=(1-ease(0,1,transition))*.45;}});
  planets.forEach((p,i)=>{const a=i*1.3+(reduced?0:time*.00012);p.position.set(Math.cos(a)*(3.1+i*.08),.2+Math.sin(a*1.2)*1.9,Math.sin(a)*2);});
  state.transition=transition;state.index=index;state.process=process;state.scroll=smoothScroll;state.boxClosed=pack;
  const interactive=loaded===3&&entrance<.1&&transition>.7;hit.classList.toggle('enabled',interactive);hit.tabIndex=interactive?0:-1;
  if(interactive){rig.updateMatrixWorld(true);camera.updateMatrixWorld(true);bounds.setFromObject(productAnchor);let l=Infinity,r=-Infinity,t=Infinity,b=-Infinity;
   for(let j=0;j<8;j++){corner.set(j&1?bounds.max.x:bounds.min.x,j&2?bounds.max.y:bounds.min.y,j&4?bounds.max.z:bounds.min.z).project(camera);const x=(corner.x*.5+.5)*innerWidth,y=(-corner.y*.5+.5)*innerHeight;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
   Object.assign(hit.style,{left:`${l}px`,top:`${t}px`,width:`${r-l}px`,height:`${b-t}px`});
  }
  renderer.render(scene,camera);
 });
}
