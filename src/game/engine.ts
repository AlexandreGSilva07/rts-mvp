import{buildings,troops,research,Cost,Res}from"./data";
export type Job={kind:"build"|"upgrade"|"train"|"research"|"heal";id:string;ends:number;qty?:number};
export type State={resources:Record<Res,number>;levels:Record<string,number>;army:Record<string,number>;research:Record<string,number>;wounded:number;jobs:Job[];last:number};
export const initial=():State=>({resources:{food:850,wood:850,stone:700,iron:320,gold:250},levels:{castle:1},army:{},research:{},wounded:0,jobs:[],last:Date.now()});
export const scale=(c:Cost,l:number,f=1.45)=>Object.fromEntries(Object.entries(c).map(([k,v])=>[k,Math.ceil((v||0)*Math.pow(f,Math.max(0,l-1))) ])) as Cost;
export const canPay=(s:State,c:Cost)=>Object.entries(c).every(([k,v])=>s.resources[k as Res]>=(v||0));
export const pay=(s:State,c:Cost)=>{for(const[k,v]of Object.entries(c))s.resources[k as Res]-=v||0};
export function production(s:State){const c=1+(s.levels.castle||0)*.05+(s.research.administration||0)*.05;return{food:(s.levels.farm||0)*2*(1+(s.research.agriculture||0)*.08)*c,wood:(s.levels.lumber||0)*1.5*(1+(s.research.extraction||0)*.07)*c,stone:(s.levels.quarry||0)*1.2*(1+(s.research.extraction||0)*.07)*c,iron:(s.levels.mine||0)*.7*(1+(s.research.metallurgy||0)*.08)*c,gold:(s.levels.mine||0)*.25*(1+(s.research.metallurgy||0)*.08)*c}}
export const popCap=(s:State)=>20+(s.levels.castle||0)*15+Math.floor((s.research.administration||0)*8);
export const population=(s:State)=>Object.values(s.army).reduce((a,b)=>a+b,0);
export const hospitalCap=(s:State)=>Math.floor((s.levels.hospital||0)*30*(1+(s.research.medicine||0)*.12));
export const power=(s:State)=>{const bp=Object.values(s.levels).reduce((a,b)=>a+b*45,0),rp=Object.values(s.research).reduce((a,b)=>a+b*35,0),ap=troops.reduce((a,t)=>a+(s.army[t.id]||0)*t.power,0);return Math.floor(bp+rp+ap)};
export function tick(s:State,now=Date.now()){const dt=Math.min(30,(now-s.last)/1000);const p=production(s);for(const k of Object.keys(p)as Res[])s.resources[k]+=p[k]*dt;s.last=now;const done=s.jobs.filter(j=>j.ends<=now);s.jobs=s.jobs.filter(j=>j.ends>now);for(const j of done){if(j.kind==="build"||j.kind==="upgrade")s.levels[j.id]=(s.levels[j.id]||0)+1;if(j.kind==="train")s.army[j.id]=(s.army[j.id]||0)+(j.qty||1);if(j.kind==="research")s.research[j.id]=(s.research[j.id]||0)+1;if(j.kind==="heal")s.wounded=Math.max(0,s.wounded-(j.qty||0))}return s}
export const fmtCost=(c:Cost)=>Object.entries(c).map(([k,v])=>`${k} ${v}`).join(" · ");