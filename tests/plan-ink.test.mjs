import test from 'node:test';
import assert from 'node:assert/strict';
import {maskInkRegions,normalizeExclusionRect,likelyTreadRuns} from '../dist/plan-ink.js';
import {detectLines} from '../dist/plan-detection.js';

const image=(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4).fill(255)});
const ink=(im,x1,y1,x2,y2)=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const k=(y*im.width+x)*4;im.data[k]=im.data[k+1]=im.data[k+2]=0;}};

test('excluded regions whiten only selected pixels and preserve original pixels',()=>{
 const original=image(100,60);
 ink(original,5,10,90,10);
 const masked=maskInkRegions(original,[{x:15,y:5,w:20,h:15}]);
 assert.equal(masked.data[(10*100+20)*4],255);
 assert.equal(original.data[(10*100+20)*4],0);
 assert.equal(masked.data[(10*100+50)*4],0);
 assert.equal(masked.data.length,original.data.length);
});
test('exclusion bounds clip safely and invalid rectangles are skipped',()=>{
 assert.deepEqual(normalizeExclusionRect({x:-5,y:-6,w:15,h:15},100,60),{x:0,y:0,w:10,h:9});
 assert.equal(normalizeExclusionRect({x:3,y:3,w:-4,h:6},100,60),null);
 assert.equal(normalizeExclusionRect({x:99,y:59,w:20,h:20},100,60),null);
 assert.throws(()=>maskInkRegions(image(20,20),Array(65).fill({x:1,y:1,w:5,h:5})),/64/);
});
test('five or more parallel short strokes are classified as stair-like, not ordinary walls',()=>{
 const stairs=Array.from({length:8},(_,i)=>({axis:'h',at:10+i*7,start:20,end:78,maxAt:10+i*7}));
 const walls=[{axis:'h',at:120,start:10,end:210,maxAt:120},{axis:'h',at:127,start:10,end:210,maxAt:127}];
 const results=likelyTreadRuns([...stairs,...walls]);
 assert.equal(results.size,8);
 assert.ok(!results.has(8)&&!results.has(9));
 assert.equal(likelyTreadRuns(walls).size,0);
});
test('full local line detector suppresses repeated treads while retaining a long double-wall',()=>{
 const im=image(240,180);
 for(let i=0;i<8;i++)ink(im,20,15+i*7,80,15+i*7);
 ink(im,15,120,220,120);ink(im,15,127,220,127);
 const lines=detectLines(im,{x:0,y:0,w:240,h:180});
 assert.ok(lines.suppressedTreadRuns>=5);
 assert.ok(lines.some(l=>l.axis==='h'&&l.end-l.start>150),'should keep the real long wall');
 assert.ok(!lines.some(l=>l.axis==='h'&&l.end-l.start<90),'should not create walls from the stair treads');
});
test('manual mask removes false candidate lines without moving unrelated wall geometry',()=>{
 const im=image(240,180);ink(im,15,120,220,120);ink(im,15,127,220,127);
 ink(im,25,35,92,35);ink(im,25,42,92,42);
 const before=detectLines(im,{x:0,y:0,w:240,h:180});
 const after=detectLines(maskInkRegions(im,[{x:20,y:30,w:80,h:20}]),{x:0,y:0,w:240,h:180});
 assert.ok(before.length>after.length);
 assert.ok(after.some(l=>l.axis==='h'&&l.end-l.start>150));
});
