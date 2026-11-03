// Suggests an editable building crop for orthogonal architectural sheets.
// No source pixels are modified; ambiguous layouts fall back to manual cropping.
export function suggestPlanBounds(image) {
  if (!image || !Number.isInteger(image.width) || !Number.isInteger(image.height)) return null;
  const { data, width: w, height: h } = image;
  if (!data || data.length < w*h*4 || w<300 || h<250) return null;
  const dark = (x,y) => { const k=(y*w+x)*4;return data[k+3]>80 && data[k]+data[k+1]+data[k+2]<465; };
  const sample = (start,end,step,fn) => {let count=0,total=0;for(let p=start;p<end;p+=step){total++;if(fn(p))count++;}return count/Math.max(1,total);};
  const chooseVertical = (lo,hi) => {let result=null;const from=Math.round(w*lo),end=Math.round(w*hi);
    for(let x=from;x<end;x++){const score=sample(Math.round(h*.12),Math.round(h*.78),3,y=>dark(x,y));if(!result||score>result.score+.001)result={at:x,score};}
    return result;
  };
  const left=chooseVertical(.09,.37),right=chooseVertical(.57,.85);
  if(!left||!right||left.score<.86||right.score<.86||right.at-left.at<w*.40)return null;
  const chooseHorizontal = (lo,hi) => {let result=null;for(let y=Math.round(h*lo);y<Math.round(h*hi);y++){
    const score=sample(left.at+3,right.at-2,3,x=>dark(x,y));if(!result||score>result.score+.001)result={at:y,score};}
    return result;
  };
  const top=chooseHorizontal(.035,.17),bottom=chooseHorizontal(.67,.915);
  if(!top||!bottom||top.score<.77||bottom.score<.77||bottom.at-top.at<h*.47)return null;
  const edgeCheck = Math.min(
    sample(top.at,bottom.at,4,y=>dark(left.at,y)),
    sample(top.at,bottom.at,4,y=>dark(right.at,y))
  );
  if(edgeCheck<.80)return null;
  const pad=Math.max(4,Math.round(Math.min(w,h)*.007));
  const x=Math.max(0,left.at-pad),y=Math.max(0,top.at-pad);
  const rightX=Math.min(w,right.at+pad),bottomY=Math.min(h,bottom.at+pad);
  return {x,y,w:rightX-x,h:bottomY-y,confidence:Math.round(Math.min(left.score,right.score,top.score,bottom.score,edgeCheck)*100)/100,
    method:'orthogonal-plan-frame-v1',reviewRequired:true};
}
