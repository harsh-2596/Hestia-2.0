import {inRoom} from './room-geometry.js';
// Shared validation and walk navigation. Geometry is in meters.
export function validateFinish(finish) {
  if (!finish || typeof finish.src !== 'string' || finish.src.length > 1400000 ||
      !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(finish.src) ||
      !['tile','stretch'].includes(finish.fit) || !Number.isFinite(finish.tileSize) ||
      finish.tileSize < .1 || finish.tileSize > 20) throw Error('Invalid reference finish.');
  return finish;
}
export function insideFloor(floor, x, z, radius = .16) {
  return [[0,0],[-radius,0],[radius,0],[0,-radius],[0,radius]].every(([dx,dz])=>floor.rooms.some(r=>inRoom(r,x+dx,z+dz)));
}
export function canWalk(floor, x, z, radius=.16) {
  if (!insideFloor(floor,x,z,radius)) return false;
  for (const w of floor.walls) {
    const dx=w.x2-w.x1,dz=w.z2-w.z1,L=Math.hypot(dx,dz);
    const along=((x-w.x1)*dx+(z-w.z1)*dz)/L;
    const t=Math.max(0,Math.min(L,along));
    if (Math.hypot(x-w.x1-dx*t/L,z-w.z1-dz*t/L) >= radius+w.thickness/2) continue;
    if (!w.openings.some(o=>o.type==='door' && along > o.offset-o.width/2+radius && along < o.offset+o.width/2-radius)) return false;
  }
  return true;
}
export function walkStep(floor, position, dx, dz) {
  const next=[...position], steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.06));
  for(let i=0;i<steps;i++) {
    if(canWalk(floor,next[0]+dx/steps,next[2])) next[0]+=dx/steps;
    if(canWalk(floor,next[0],next[2]+dz/steps)) next[2]+=dz/steps;
  }
  return next;
}
export function roomStation(floor,room) {
  const cx=room.x+room.w/2,cz=room.z+room.d/2;
  for(const [dx,dz] of [[0,0],[.3,0],[-.3,0],[0,.3],[0,-.3],[.6,.6],[-.6,-.6]])
    if(canWalk(floor,cx+dx,cz+dz))return [cx+dx,1.6,cz+dz];
  for(let z=room.z+.3;z<room.z+room.d;z+=.25)for(let x=room.x+.3;x<room.x+room.w;x+=.25)if(inRoom(room,x,z)&&canWalk(floor,x,z))return [x,1.6,z];
  return null;
}
export function sceneFingerprint(project,floor) {
  // A stable local change marker, not a security hash.
  const text=JSON.stringify({floor,brief:project.planning?.briefs?.[floor.id],uses:project.planning?.floors?.[floor.id]?.context?.roomUses,selected:project.planning?.floors?.[floor.id]?.selected,cad:project.cad?.entities,definitions:project.cad?.definitions});
  let hash=2166136261;for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
  return (hash>>>0).toString(16);
}
