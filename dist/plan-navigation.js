// Pure viewport helpers; coordinates remain in calibrated 2D plan units.
// Wheel pan uses the SVG viewBox scale, not document scroll offsets.
export function planPan(center,box,viewport,dx,dy){
 if(!center||!box||!viewport||![center.x,center.z,box.w,box.d,viewport.width,viewport.height,dx,dy].every(Number.isFinite)||viewport.width<=0||viewport.height<=0||box.w<=0||box.d<=0)return center;
 return {x:center.x+dx*box.w/viewport.width,z:center.z+dy*box.d/viewport.height};
}
export function panWheel(event,zoom){
 if(!event||!Number.isFinite(zoom)||zoom<=1)return false;
 return !event.ctrlKey&&!event.metaKey;
}
export function zoomAt(center,box,px,py,currentZoom,nextZoom){
 if(!center||!box||![center.x,center.z,box.w,box.d,px,py,currentZoom,nextZoom].every(Number.isFinite)||currentZoom<=0||nextZoom<=0)return center;
 const ratio=currentZoom/nextZoom;
 // px,py are coordinates in the current viewBox (e.g. wheel pointer position).
 return {x:px+(center.x-px)*ratio,z:py+(center.z-py)*ratio};
}

// Match the SVG viewport aspect ratio so its viewBox fills the canvas and pans equally in X/Y.
export function centeredPlanBox(bounds,zoom=1,viewport={width:1,height:1},center=null,padding=1.2){
 if(!bounds||![bounds.x,bounds.z,bounds.w,bounds.d,zoom,viewport.width,viewport.height].every(Number.isFinite)||zoom<=0||viewport.width<=0||viewport.height<=0)return null;
 const aspect=viewport.width/viewport.height;
 let w=Math.max(.1,bounds.w+padding*2),d=Math.max(.1,bounds.d+padding*2);
 if(w/d>aspect)d=w/aspect;else w=d*aspect;
 w/=zoom;d/=zoom;
 const c=center||{x:bounds.x+bounds.w/2,z:bounds.z+bounds.d/2};
 return {x:c.x-w/2,z:c.z-d/2,w,d};
}
// PDF-style hand pan: mouse movement opposite to the viewBox movement.
export function shouldHandPan({button=0,space=false,tool='select',onObject=false,zoom=1}={}){
 return button===1||(button===0&&(space||tool==='pan'||tool==='select'&&!onObject&&zoom>1));
}
