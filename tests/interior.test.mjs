import test from 'node:test';
import assert from 'node:assert/strict';
import {canWalk,walkStep,roomStation,sceneFingerprint} from '../dist/interior-data.js';
import {createProject,validateProject,wall} from '../dist/model.js';

test('walking crosses door openings but cannot tunnel through walls or leave the floor',()=>{
 const f={rooms:[{x:0,z:0,w:4,d:4},{x:4,z:0,w:4,d:4}],walls:[{x1:4,z1:0,x2:4,z2:4,thickness:.15,openings:[{type:'door',offset:2,width:1}]}]};
 assert.equal(canWalk(f,4,2),true);assert.equal(canWalk(f,4,1),false);assert.equal(canWalk(f,-1,1),false);
 assert.ok(walkStep(f,[2,1.6,2],4,0)[0]>5.5);assert.ok(walkStep(f,[2,1.6,1],4,0)[0]<4);
});
test('room stations are valid and scene changes invalidate image comparisons',()=>{const p=createProject(),f=p.floors[0],station=roomStation(f,f.rooms[0]);assert.ok(canWalk(f,station[0],station[2]));const before=sceneFingerprint(p,f);f.items[0].x+=1;assert.notEqual(sceneFingerprint(p,f),before);});
test('reference finishes round-trip and reject remote URLs and invalid sizes',()=>{const p=createProject(),finish={src:'data:image/jpeg;base64,/9j/2Q==',fit:'tile',tileSize:1};p.floors[0].walls[0].finish=finish;assert.doesNotThrow(()=>validateProject(JSON.parse(JSON.stringify(p))));finish.src='https://example.com/private.jpg';assert.throws(()=>validateProject(p));finish.src='data:image/png;base64,AAAA';finish.tileSize=NaN;assert.throws(()=>validateProject(p));});
