// Review feedback is labeled user data, not trained model weights.
// Same-source rejections prevent known false positives from returning on redetection.
export function sourceFingerprint(src){
 if(typeof src!=='string'||!src.length)return null;
 let hash=2166136261;
 const sample=src.length<=4096?src:src.slice(0,2048)+src.slice(-2048)+src.length;
 for(let i=0;i<sample.length;i++){hash^=sample.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return (hash>>>0).toString(36);
}
export function wallCorrection(w,bp,scale,label){
 if(!w||!bp||!Number.isFinite(scale)||scale<=0||!['not_wall','missing_wall'].includes(label))return null;
 const nums=[w.x1,w.z1,w.x2,w.z2,bp.x,bp.z];if(!nums.every(Number.isFinite))return null;
 const coords=[(w.x1-bp.x)/scale,(w.z1-bp.z)/scale,(w.x2-bp.x)/scale,(w.z2-bp.z)/scale];
 if(coords.some(n=>Math.abs(n)>30000))return null;
 const fingerprint=sourceFingerprint(bp.src);
 return fingerprint?{source:fingerprint,label,coords:coords.map(v=>Math.round(v*10)/10),reason:label==='not_wall'?'Deleted false-positive wall':'User drew a missing wall'}:null;
}
export function correctionMatchesLine(feedback,line,tolerance=5){
 if(!feedback||feedback.label!=='not_wall'||!Array.isArray(feedback.coords)||feedback.coords.length!==4||!line||!['h','v'].includes(line.axis))return false;
 const [x1,z1,x2,z2]=feedback.coords;
 const points=line.axis==='h'?[line.start,line.at,line.end,line.at]:[line.at,line.start,line.at,line.end];
 const match=(a,b)=>Math.abs(a-b)<=tolerance;
 return points.every((v,i)=>match(v,feedback.coords[i]))||
 points.every((v,i)=>match(v,[x2,z2,x1,z1][i]));
}
export function applyWallCorrections(lines,feedback,source){
 if(!Array.isArray(lines))return [];
 const negatives=(Array.isArray(feedback)?feedback:[]).filter(f=>f?.source===source&&f.label==='not_wall');
 return lines.filter(l=>!negatives.some(f=>correctionMatchesLine(f,l)));
}
export function appendWallCorrection(existing,entry,limit=250){
 if(!entry)return Array.isArray(existing)?existing:[];
 const prior=Array.isArray(existing)?existing:[];
 const key=e=>e.source+'|'+e.label+'|'+JSON.stringify(e.coords);
 return [...prior.filter(e=>key(e)!==key(entry)),entry].slice(-limit);
}
