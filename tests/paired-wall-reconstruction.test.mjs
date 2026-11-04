import test from 'node:test';
import assert from 'node:assert/strict';
import {detectLines,linesToFloor} from '../dist/plan-detection.js';
const image=(w=440,h=220)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4).fill(255)});
const ink=(im,x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const k=(y*im.width+x)*4;im.data[k]=im.data[k+1]=im.data[k+2]=0;}};
const horizontal=lines=>lines.filter(l=>l.axis==='h');
test('continuous wall face paired to interrupted opposite face preserves both wall sections without filling a window gap',()=>{
 const im=image();
 ink(im,20,45,405,45);ink(im,20,52,180,52);ink(im,222,52,405,52);
 const lines=detectLines(im);
 const sections=horizontal(lines).filter(l=>l.confidence>=.6);
 assert.equal(sections.length,2);
 assert.ok(sections.some(l=>l.start<=20&&l.end>=180));
 assert.ok(sections.some(l=>l.start<=222&&l.end>=405));
 assert.ok(!sections.some(l=>l.start<=180&&l.end>=222),'do not close an intentional-looking opening');
 const f=linesToFloor(lines,{metersPerPixel:.03});
 assert.equal(f.walls.length,2);
 assert.ok(f.walls.every(w=>Math.abs(w.thickness-.21)<.01));
});
test('isolated thick annotations remain weak and do not become 3D walls',()=>{
 const im=image();
 ink(im,22,30,220,33);
 const lines=detectLines(im);
 assert.ok(lines.some(l=>l.confidence<.6));
 const floor=linesToFloor(lines,{metersPerPixel:.03});
 assert.equal(floor.walls.length,0);
});
test('unpaired dimension alongside a valid double wall cannot alter the valid wall geometry',()=>{
 const im=image();ink(im,20,45,220,45);ink(im,20,52,220,52);
 ink(im,15,140,400,143);
 const lines=detectLines(im);
 const floor=linesToFloor(lines,{metersPerPixel:.03});
 assert.equal(floor.walls.length,1);
 assert.ok(floor.walls[0].detection.confidence>=.6);
});
