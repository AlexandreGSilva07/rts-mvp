import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, MapControls, Sky } from "@react-three/drei";
import * as THREE from "three";
import { buildings, troops, research, type Cost, type Res } from "./game/data";
import { type State, initial, tick, scale, canPay, pay, production, popCap, population, hospitalCap, power } from "./game/engine";

const KEY="rts-mvp-save-v2", resources:Res[]=["food","wood","stone","iron","gold"];
const names:Record<Res,string>={food:"🌾 Comida",wood:"🪵 Madeira",stone:"🪨 Pedra",iron:"⛓ Ferro",gold:"🪙 Ouro"};
type Tab="city"|"army"|"research"|"hospital";
const tabs:{id:Tab;name:string}[]=[{id:"city",name:"Cidade"},{id:"army",name:"Exército"},{id:"research",name:"Tecnologias"},{id:"hospital",name:"Hospital"}];
function costText(c:Cost){return resources.filter(k=>c[k]!=null).map(k=>`${names[k].split(" ")[1]} ${c[k]}`).join(" · ")}
function readyState():State{const b=initial();b.levels=Object.fromEntries(buildings.map(x=>[x.id,x.id==="castle"?3:1]));b.resources={food:5000,wood:5000,stone:5000,iron:2500,gold:1800};return b}
function load():State{try{const r=localStorage.getItem(KEY);if(!r)return readyState();const p=JSON.parse(r) as State;return{...readyState(),...p,last:Date.now()}}catch{return readyState()}}

const spots:Record<string,[number,number]>={
 castle:[0,0],farm:[-12,-9],lumber:[11,-10],quarry:[-15,4],mine:[15,5],
 barracks:[-9,10],stable:[9,11],workshop:[-16,14],hospital:[16,-4],academy:[0,14]
};
function Box({p,s,c="#b78a55"}:{p:[number,number,number];s:[number,number,number];c?:string}){return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c}/></mesh>}
function Roof({p,s,c="#8e3828"}:{p:[number,number,number];s:[number,number,number];c?:string}){return <mesh position={p} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[s[0],s[1],4]}/><meshStandardMaterial color={c}/></mesh>}
function BuildingModel({id,level,selected,onClick}:{id:string;level:number;selected:boolean;onClick:()=>void}){
 const [x,z]=spots[id]; const g=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(g.current&&selected)g.current.position.y=.12+Math.sin(clock.elapsedTime*3)*.08});
 const common=<><Box p={[0,1.15,0]} s={[3.7,2.3,3.4]} c={id==="castle"?"#b8b2a4":"#c7a36c"}/><Roof p={[0,3.0,0]} s={[2.8,2.1,2.8]} c={id==="hospital"?"#376b72":id==="academy"?"#394e82":"#883d2d"}/></>;
 return <group ref={g} position={[x,0,z]} onClick={e=>{e.stopPropagation();onClick()}}>
   {id==="castle"?<><Box p={[0,1.7,0]} s={[6.5,3.4,6.5]} c="#a7a397"/>{[-2.5,2.5].flatMap(xx=>[-2.5,2.5].map(zz=><group key={xx+"-"+zz}><mesh position={[xx,3.1,zz]} castShadow><cylinderGeometry args={[1.15,1.3,4.5,8]}/><meshStandardMaterial color="#aaa79d"/></mesh><mesh position={[xx,5.5,zz]}><coneGeometry args={[1.5,2.1,8]}/><meshStandardMaterial color="#743426"/></mesh></group>))}<Box p={[0,4.2,0]} s={[2.7,5,2.7]} c="#beb8a8"/><Roof p={[0,7,0]} s={[2.2,2.4,2.2]} c="#793526"/></>:common}
   {id==="farm"&&<>{[-2,0,2].map(q=><group key={q}>{Array.from({length:7}).map((_,i)=><mesh key={i} position={[q+(i%2)*.3,.22,-2.6+i*.75]}><boxGeometry args={[.12,.45,.12]}/><meshStandardMaterial color="#d8b34b"/></mesh>)}</group>)}</>}
   {id==="lumber"&&<>{[-2.5,2.4].map(q=><mesh key={q} position={[q,.35,1]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.28,.35,3,8]}/><meshStandardMaterial color="#744c2c"/></mesh>)}</>}
   {id==="quarry"&&<mesh position={[-2.5,.7,1]}><dodecahedronGeometry args={[1.2]}/><meshStandardMaterial color="#777873"/></mesh>}
   {id==="mine"&&<><Box p={[0,1.2,1.75]} s={[2.4,2.4,.4]} c="#60432b"/><Box p={[-1.2,2.3,1.75]} s={[.3,2.4,.4]} c="#3d2a1e"/><Box p={[1.2,2.3,1.75]} s={[.3,2.4,.4]} c="#3d2a1e"/></>}
   {id==="barracks"&&<>{[-2.3,2.3].map(q=><mesh key={q} position={[q,1.1,1.7]}><cylinderGeometry args={[.08,.08,2.5,6]}/><meshStandardMaterial color="#d5c19a"/></mesh>)}</>}
   <Html center position={[0,id==="castle"?8.6:4.7,0]} distanceFactor={18} style={{pointerEvents:"none"}}><div className={"worldLabel "+(selected?"selected":"")}><b>{buildings.find(b=>b.id===id)?.name}</b><span>Nível {level}</span></div></Html>
 </group>
}
function Villager({x,z,phase}:{x:number;z:number;phase:number}){const r=useRef<THREE.Group>(null);useFrame(({clock})=>{if(r.current){r.current.position.x=x+Math.sin(clock.elapsedTime*.35+phase)*3;r.current.position.z=z+Math.cos(clock.elapsedTime*.28+phase)*2}});return <group ref={r} position={[x,0,z]}><mesh position={[0,.55,0]} castShadow><capsuleGeometry args={[.22,.55,4,8]}/><meshStandardMaterial color={phase%2?"#355b78":"#8b4738"}/></mesh><mesh position={[0,1.15,0]}><sphereGeometry args={[.24,8,8]}/><meshStandardMaterial color="#d8aa7c"/></mesh></group>}
function Tree({x,z}:{x:number;z:number}){return <group position={[x,0,z]}><mesh position={[0,1,0]}><cylinderGeometry args={[.18,.3,2,7]}/><meshStandardMaterial color="#5d3c25"/></mesh><mesh position={[0,2.7,0]} castShadow><coneGeometry args={[1.2,3.4,8]}/><meshStandardMaterial color="#315a32"/></mesh></group>}
function CameraRig(){const{camera}=useThree();useEffect(()=>{camera.position.set(25,28,30);camera.lookAt(0,0,2)},[camera]);return null}
function City({s,selected,setSelected}:{s:State;selected:string;setSelected:(v:string)=>void}){
 return <Canvas shadows camera={{fov:45,near:.1,far:250}} onPointerMissed={()=>setSelected("")}>
 <Suspense fallback={null}><CameraRig/><Sky sunPosition={[100,60,80]}/><ambientLight intensity={1.2}/><directionalLight castShadow position={[20,35,15]} intensity={2.5} shadow-mapSize-width={2048} shadow-mapSize-height={2048}/>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[85,70]}/><meshStandardMaterial color="#5c783d"/></mesh>
 <mesh position={[0,.04,4]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[6,65]}/><meshStandardMaterial color="#a89468"/></mesh>
 <mesh position={[0,.05,4]} rotation={[-Math.PI/2,0,Math.PI/2]}><planeGeometry args={[5,70]}/><meshStandardMaterial color="#9d8962"/></mesh>
 {buildings.map(b=><BuildingModel key={b.id} id={b.id} level={s.levels[b.id]??1} selected={selected===b.id} onClick={()=>setSelected(b.id)}/>)}
 {Array.from({length:26}).map((_,i)=><Tree key={i} x={-32+(i*11)%65} z={-28+((i*17)%57)}/>)}
 {Array.from({length:18}).map((_,i)=><Villager key={i} x={-8+(i%6)*3} z={-6+Math.floor(i/6)*5} phase={i}/>)}
 <Environment preset="sunset"/><MapControls makeDefault enableDamping dampingFactor={.08} minDistance={14} maxDistance={65} maxPolarAngle={Math.PI/2.25} target={[0,0,3]}/></Suspense></Canvas>
}
export function App(){
 const[s,setS]=useState<State>(load),[tab,setTab]=useState<Tab>("city"),[selected,setSelected]=useState("castle");
 useEffect(()=>{const id=setInterval(()=>setS(v=>tick(structuredClone(v))),250);return()=>clearInterval(id)},[]);
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(s)),[s]);
 const prod=useMemo(()=>production(s),[s]),pwr=power(s),pop=population(s),cap=popCap(s);
 const mutate=(fn:(n:State)=>void)=>setS(o=>{const n=structuredClone(o);fn(n);return n});
 const upgrade=(id:string)=>mutate(n=>{const b=buildings.find(x=>x.id===id);if(!b)return;const lvl=n.levels[id]??1,c=scale(b.cost,lvl+1);if(!canPay(n,c)||n.jobs.some(j=>j.id===id&&(j.kind==="upgrade"||j.kind==="build")))return;pay(n,c);n.jobs.push({kind:"upgrade",id,ends:Date.now()+b.baseTime*700*Math.pow(1.1,lvl)})});
 const train=(id:string)=>mutate(n=>{const t=troops.find(x=>x.id===id);if(!t||population(n)>=popCap(n)||!canPay(n,t.cost))return;pay(n,t.cost);n.jobs.push({kind:"train",id,qty:1,ends:Date.now()+t.time*700})});
 const study=(id:string)=>mutate(n=>{const r=research.find(x=>x.id===id);if(!r)return;const lvl=n.research[id]??0,c=scale(r.cost,lvl+1,1.3);if(!canPay(n,c)||n.jobs.some(j=>j.kind==="research"))return;pay(n,c);n.jobs.push({kind:"research",id,ends:Date.now()+r.time*700})});
 const heal=()=>mutate(n=>{const q=Math.min(n.wounded,10),c:Cost={food:q*8,gold:q*2};if(q&&canPay(n,c)){pay(n,c);n.jobs.push({kind:"heal",id:"hospital",qty:q,ends:Date.now()+3500})}});
 const battle=()=>mutate(n=>{const size=population(n),room=Math.max(0,hospitalCap(n)-n.wounded),w=Math.min(Math.max(0,Math.floor(size*.2)),room);n.wounded+=w;let left=w;for(const t of troops){const q=n.army[t.id]??0,k=Math.min(q,left);n.army[t.id]=q-k;left-=k}});
 const chosen=buildings.find(b=>b.id===selected);
 return <div className="game"><div className="hud"><div className="crest">♜ <b>VALEDOURO</b></div><div className="res">{resources.map(k=><div key={k}><span>{names[k]}</span><b>{Math.floor(s.resources[k]).toLocaleString()}</b><small>+{prod[k].toFixed(1)}/s</small></div>)}</div><div className="power"><span>PODER</span><b>{pwr.toLocaleString()}</b><small>👥 {pop}/{cap}</small></div></div>
 <div className="tabs">{tabs.map(t=><button key={t.id} className={tab===t.id?"on":""} onClick={()=>setTab(t.id)}>{t.name}</button>)}</div>
 <div className="play">{tab==="city"?<><div className="world"><City s={s} selected={selected} setSelected={setSelected}/><div className="hint">Arraste para mover · Scroll para zoom · Clique nos edifícios</div></div>{chosen&&<div className="inspect"><div className="insHead"><span>{chosen.icon}</span><div><h2>{chosen.name}</h2><small>Nível {s.levels[chosen.id]??1}</small></div></div><p>{chosen.desc}</p><div className="buff">{chosen.buff}</div><p className="cost">{costText(scale(chosen.cost,(s.levels[chosen.id]??1)+1))}</p><button onClick={()=>upgrade(chosen.id)}>Melhorar edifício</button></div>}</>:
 <div className="screen"><div className="screenHead"><div><h1>{tab==="army"?"⚔ Exército":tab==="research"?"📜 Academia":"⚕ Hospital"}</h1><p>{tab==="army"?"Recrute e organize as forças do reino.":tab==="research"?"Tecnologias aplicam bônus permanentes à cidade.":`Feridos: ${s.wounded} / ${hospitalCap(s)}`}</p></div>{tab==="army"&&<button onClick={battle}>Simular combate</button>}{tab==="hospital"&&<button onClick={heal}>Curar feridos</button>}</div>
 {tab==="army"&&<div className="cards">{troops.map(t=><article key={t.id}><i>{t.icon}</i><h3>{t.name}</h3><p>ATQ {t.atk} · DEF {t.def} · HP {t.hp}</p><strong>{s.army[t.id]??0} soldados</strong><small>{costText(t.cost)}</small><button onClick={()=>train(t.id)}>Treinar</button></article>)}</div>}
 {tab==="research"&&<div className="cards">{research.map(r=>{const l=s.research[r.id]??0;return <article key={r.id}><i>{r.icon}</i><h3>{r.name} <em>Nv. {l}</em></h3><p>{r.desc}</p><small>{costText(scale(r.cost,l+1,1.3))}</small><button onClick={()=>study(r.id)}>Pesquisar</button></article>})}</div>}
 {tab==="hospital"&&<div className="hospital"><div>⚕</div><b>{s.wounded}</b><span>feridos aguardando tratamento</span></div>}</div>}</div>
 <div className="queue"><b>Atividades</b>{s.jobs.length?s.jobs.map((j,i)=><span key={i}>◷ {j.id} · {Math.max(0,Math.ceil((j.ends-Date.now())/1000))}s</span>):<span>Cidade em paz</span>}<button onClick={()=>{if(confirm("Reiniciar o reino?"))setS(readyState())}}>↻ Reset</button></div></div>
}