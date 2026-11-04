// Deterministic, review-only architectural wall evidence for a calibrated raster floor plan.
// Does not add, remove, join, or relocate walls; no opening is created without review.
const valid=n=>typeof n==='number'&&Number.isFinite(n);
export function interpretWallEvidence(lines,crop,metresPerPixel){
 if(!Array.isArray(lines)||!crop||![crop.x,crop.y,crop.w,crop.h,metresPerPixel].every(valid)||crop.w<=0||crop.h<=0||metresPerPixel<=0)throw Error('Calibrate a valid floor-plan crop first.');
 const candidates=lines.map((l,index)=>({...l,index})).filter(l=>['h','v'].includes(l.axis)&&[l.at,l.start,l.end,l.thickness].every(valid)&&l.end>l.start&&l.thickness>0);
 const paired=candidates.filter(l=>l.evidence?.startsWith('Parallel dark lines')||l.confidence>=.65);
 const horiz=paired.filter(l=>l.axis==='h'),vert=paired.filter(l=>l.axis==='v');
 const tol=Math.max(5,Math.min(16,Math.round(.2/metresPerPixel)));
 const hSupport=(h,x)=>Math.abs(h.start-x)<=tol||Math.abs(h.end-x)<=tol;
 const vSupport=(v,y)=>Math.abs(v.start-y)<=tol||Math.abs(v.end-y)<=tol;
 const supportedH=horiz.filter(h=>vert.some(v=>Math.abs(v.at-h.start)<=tol&&vSupport(v,h.at))&&vert.some(v=>Math.abs(v.at-h.end)<=tol&&vSupport(v,h.at)));
 const supportedV=vert.filter(v=>horiz.some(h=>Math.abs(h.at-v.start)<=tol&&hSupport(h,v.at))&&horiz.some(h=>Math.abs(h.at-v.end)<=tol&&hSupport(h,v.at)));
 const hs=supportedH.filter(l=>l.end-l.start>=crop.w*.4),vs=supportedV.filter(l=>l.end-l.start>=crop.h*.4);
 let frame=null;
 for(const top of hs)for(const bottom of hs){
  if(bottom.at-top.at<crop.h*.35)continue;
  for(const left of vs)for(const right of vs){
   if(right.at-left.at<crop.w*.35)continue;
   if(![top,bottom].every(h=>Math.abs(h.start-left.at)<=tol&&Math.abs(h.end-right.at)<=tol)||
      ![left,right].every(v=>Math.abs(v.start-top.at)<=tol&&Math.abs(v.end-bottom.at)<=tol))continue;
   const area=(right.at-left.at)*(bottom.at-top.at);
   if(!frame||area>frame.area)frame={top:top.index,bottom:bottom.index,left:left.index,right:right.index,area,x:left.at,y:top.at,w:right.at-left.at,h:bottom.at-top.at};
  }
 }
 const outer=new Set(frame?[frame.top,frame.bottom,frame.left,frame.right]:[]);
 const wallLabels=lines.map((l,index)=>{
  const inside=frame&&(l.axis==='h'?l.at>frame.y+tol&&l.at<frame.y+frame.h-tol&&l.start>=frame.x-tol&&l.end<=frame.x+frame.w+tol:
   l.axis==='v'&&l.at>frame.x+tol&&l.at<frame.x+frame.w-tol&&l.start>=frame.y-tol&&l.end<=frame.y+frame.h+tol);
  return {role:outer.has(index)?'outer_candidate':inside?'inner_candidate':'unclassified',
   wallEvidence:l.evidence?.startsWith('Parallel dark lines')?'paired_wall_faces':'ambiguous_line',
   confidence:Number.isFinite(l.confidence)?l.confidence:0};
 });
 const gaps=[];
 for(let i=0;i<paired.length;i++)for(let j=i+1;j<paired.length;j++){
  const a=paired[i],b=paired[j];
  if(a.axis!==b.axis||Math.abs(a.at-b.at)>Math.max(3,Math.min(8,a.thickness+b.thickness)))continue;
  if((a.end-a.start)*metresPerPixel<.45||(b.end-b.start)*metresPerPixel<.45)continue;
  const [first,second]=a.start<=b.start?[a,b]:[b,a];
  const width=(second.start-first.end)*metresPerPixel;
  if(width<.45||width>2.5)continue;
  gaps.push({axis:first.axis,at:(first.at+second.at)/2,start:first.end,end:second.start,
   widthMetres:width,adjacentLines:[first.index,second.index],type:'unknown',reviewRequired:true,
   evidence:'Collinear wall segments have an intentional-looking gap; inspect for a door swing or glazing marker.'});
  if(gaps.length>=100)break;
 }
 return {walls:wallLabels,frame:frame?{x:frame.x,y:frame.y,w:frame.w,h:frame.h,confidence:'requires_review'}:null,gaps:gaps.slice(0,100),
  summary:{pairedCandidates:paired.length,outerCandidates:outer.size,innerCandidates:wallLabels.filter(w=>w.role==='inner_candidate').length,
   unclassified:wallLabels.filter(w=>w.role==='unclassified').length,gapCandidates:Math.min(100,gaps.length)}};
}
