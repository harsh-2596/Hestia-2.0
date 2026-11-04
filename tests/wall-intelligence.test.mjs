import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretWallEvidence} from '../dist/wall-intelligence.js';
import {linesToFloor} from '../dist/plan-detection.js';
const line=(axis,at,start,end)=>({axis,at,start,end,thickness:6,confidence:.7,evidence:'Parallel dark lines; pair of wall faces.'});
const crop={x:20,y:10,w:540,h:430},scale=.03;
test('enclosing double-line wall body is recognized as four tentative perimeter walls',()=>{
 const input=[line('h',30,40,540),line('h',430,40,540),line('v',40,30,430),line('v',540,30,430),line('v',200,30,430)];
 const r=interpretWallEvidence(input,crop,scale);
 assert.equal(r.summary.outerCandidates,4);
 assert.equal(r.summary.innerCandidates,1);
 assert.ok(r.frame);
 assert.equal(r.frame.confidence,'requires_review');
 for(let i=0;i<4;i++)assert.equal(r.walls[i].role,'outer_candidate');
 assert.equal(r.walls[4].role,'inner_candidate');
 for(let i=0;i<input.length;i++)input[i].role=r.walls[i].role;
 const f=linesToFloor(input,{metersPerPixel:scale,origin:{x:20,y:10}});
 assert.equal(f.walls.length,5);
 assert.equal(f.walls[0].classification,'unclassified','topological exterior is not a verified structural classification');
 assert.equal(f.walls[0].detection.role,'outer_candidate');
 assert.ok(Math.abs(f.walls[0].thickness-.18)<.0001);
});
test('dimension lines and lone partitions never become assumed exterior geometry',()=>{
 const r=interpretWallEvidence([line('h',10,20,800)],{x:0,y:0,w:900,h:500},scale);
 assert.equal(r.frame,null);
 assert.equal(r.walls[0].role,'unclassified');
 assert.equal(r.summary.outerCandidates,0);
});
test('interrupted walls produce untyped gap evidence, never automatic door or window',()=>{
 const r=interpretWallEvidence([line('h',60,20,120),line('h',60,154,340)],{x:0,y:0,w:400,h:150},scale);
 assert.equal(r.gaps.length,1);
 assert.equal(r.gaps[0].type,'unknown');
 assert.ok(r.gaps[0].reviewRequired);
 assert.ok(Math.abs(r.gaps[0].widthMetres-1.02)<.0001);
});
test('invalid calibration and non-architectural short symbol strokes are not promoted to perimeter walls',()=>{
 assert.throws(()=>interpretWallEvidence([],{x:0,y:0,w:500,h:500},0),/Calibrate/);
 const strokes=Array.from({length:8},(_,i)=>line('h',100+i*8,30,110));
 const r=interpretWallEvidence(strokes,{x:0,y:0,w:600,h:500},scale);
 assert.equal(r.summary.outerCandidates,0);
 assert.equal(r.frame,null);
});
