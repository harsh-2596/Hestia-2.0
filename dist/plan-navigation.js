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
