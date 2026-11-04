// A geometry-based orbit pivot for the Three.js floor viewer.
// Consumes world-space bounds, not raster/blueprint pixel coordinates.
export function orbitFrame(bounds){
 const min=bounds?.min,max=bounds?.max;
 if(!min||!max||![min.x,min.y,min.z,max.x,max.y,max.z].every(Number.isFinite))return null;
 const width=max.x-min.x,height=max.y-min.y,depth=max.z-min.z;
 if(width<0||height<0||depth<0)return null;
 const span=Math.max(width,depth,height,1);
 return {center:{x:(min.x+max.x)/2,y:(min.y+max.y)/2,z:(min.z+max.z)/2},
  span,width,height,depth};
}
export function shouldRefitOrbit(previous,next){
 if(!next)return false;
 if(!previous)return true;
 const displacement=Math.hypot(next.center.x-previous.center.x,next.center.y-previous.center.y,next.center.z-previous.center.z);
 return next.span>previous.span*1.4||displacement>previous.span*.35;
}
