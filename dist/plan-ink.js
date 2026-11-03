export function normalizeExclusionRect(rect,width,height){
 if(!rect||typeof rect!=='object'||![rect.x,rect.y,rect.w,rect.h,width,height].every(Number.isFinite)||width<=0||height<=0||rect.w<=0||rect.h<=0)return null;
 const x0=Math.max(0,Math.min(width,Math.floor(rect.x))),y0=Math.max(0,Math.min(height,Math.floor(rect.y)));
 const x1=Math.max(0,Math.min(width,Math.ceil(rect.x+rect.w))),y1=Math.max(0,Math.min(height,Math.ceil(rect.y+rect.h)));
 return x1-x0>=3&&y1-y0>=3?{x:x0,y:y0,w:x1-x0,h:y1-y0}:null;
}

export function maskInkRegions(image,regions=[]){
 if(!image||!Number.isInteger(image.width)||!Number.isInteger(image.height)||image.width<=0||image.height<=0||!image.data||image.data.length<image.width*image.height*4)throw Error('Invalid floor-plan pixels.');
 if(!Array.isArray(regions)||regions.length>64)throw Error('Use at most 64 excluded regions.');
 const copy=new Uint8ClampedArray(image.data);
 for(const raw of regions){const r=normalizeExclusionRect(raw,image.width,image.height);if(!r)continue;
  for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){const k=(y*image.width+x)*4;copy[k]=copy[k+1]=copy[k+2]=copy[k+3]=255;}
 }
 return {data:copy,width:image.width,height:image.height};
}

export function likelyTreadRuns(runs,{minCount=5,minLength=32,maxLength=130}={}){
 const found=new Set();
 for(const axis of ['h','v']){
  const candidates=runs.map((r,i)=>({...r,index:i,length:r.end-r.start})).filter(r=>r.axis===axis&&r.length>=minLength&&r.length<=maxLength).sort((a,b)=>a.at-b.at);
  for(let i=0;i<candidates.length;i++){
   const first=candidates[i],group=[first];let prev=first;
   for(let j=i+1;j<candidates.length;j++){
    const r=candidates[j],delta=r.at-prev.at;
    if(delta>14)break;
    if(delta<3)continue;
    const overlap=Math.min(first.end,r.end)-Math.max(first.start,r.start);
    const similarity=Math.min(first.length,r.length)/Math.max(first.length,r.length);
    if(overlap<.78*Math.min(first.length,r.length)||similarity<.78||Math.abs((first.start+first.end-r.start-r.end)/2)>8)continue;
    group.push(r);prev=r;
   }
   if(group.length>=minCount){
    const gaps=group.slice(1).map((r,j)=>r.at-group[j].at);
    if(Math.max(...gaps)/Math.min(...gaps)<=2.25)for(const r of group)found.add(r.index);
   }
  }
 }
 return found;
}
