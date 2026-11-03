import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {CATALOG,createFloor,createProject,item,validateProject,wall} from '../dist/model.js';
import {furniture} from '../dist/scene.js';
import {SYMBOL_RULES,normalizeSymbolObservation,symbolPlacement} from '../dist/architectural-symbols.js';
import {PlanJobs} from '../backend/plan-jobs.mjs';
import {approveOriginal} from '../dist/planning-data.js';

const region={x:3,z:4,w:10,d:8};
const observed=(type,id='observe_1')=>normalizeSymbolObservation({
 type,x:1,z:2,w:1.5,d:.8,rotation:30,confidence:.89,evidence:'Visible shape in plan agrees with the architectural symbol.'
},region,id);

test('item library provides editable visual assets and preserves existing three-seat sofa',()=>{
 for(const type of ['tv','sofa','bed_with_tables','pantry_counter','car_compact']){
  const def=CATALOG.find(a=>a.type===type);
  assert.ok(def, 'Missing library item '+type);
  const mesh=furniture(item(type,5,6));
  assert.ok(mesh.children.length>=3, 'Expected 3D model for '+type);
  assert.equal(mesh.userData.kind,'item');
  const bounds=new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
  for(const [key,expected] of [['x',def.w],['z',def.d]])assert.ok(Math.abs(bounds[key]-expected)<.01,type+' '+key);
 }
});

test('top-view symbol rules distinguish assets, stairs and window openings',()=>{
 const types=SYMBOL_RULES.map(r=>r.type);
 for(const expected of ['tv','sofa','bed_with_tables','pantry_counter','car','stairs','window'])assert.ok(types.includes(expected));
 for(const type of types){
  const o=observed(type,'symbol_'+type),spec=symbolPlacement(o);
  assert.equal(o.state,'unresolved');
  assert.equal(o.x,4);
  assert.equal(o.z,6);
  if(type==='window'){assert.equal(spec.kind,'opening');assert.ok(spec.needsAssociatedWall);}
  else if(type==='stairs'){assert.equal(spec.kind,'feature');assert.ok(spec.needsConfirmedHeight);}
  else {assert.equal(spec.kind,'item');assert.ok(CATALOG.some(i=>i.type===spec.asset));assert.equal(spec.x,4.75);}
 }
});

test('unsupported geometry, missing visual evidence and invalid confidence are rejected',()=>{
 assert.throws(()=>normalizeSymbolObservation({type:'tv',x:9.9,z:1,w:2,d:.5,rotation:0,confidence:.9,evidence:'Visible TV on wall'},region,'tv_1'),/outside/);
 assert.throws(()=>normalizeSymbolObservation({type:'window',x:1,z:1,w:1,d:.5,rotation:0,confidence:1.1,evidence:'Window in bold wall'},region,'win_1'),/confidence/);
 assert.throws(()=>normalizeSymbolObservation({type:'sofa',x:1,z:1,w:1,d:.5,rotation:0,confidence:.8,evidence:''},region,'sofa_1'),/evidence/);
});

test('vision stage creates review proposals without changing walls or placing items',()=>{
 const f=createFloor('Unreviewed office',false);
 f.walls=[wall(0,0,8,0)];
 const job={floor:f,corrections:[]};
 const service=new PlanJobs('/tmp/hestia-symbol-unit');
 service.apply(job,'symbols',{symbols:[
  {type:'tv',x:1,z:1,w:1.4,d:.2,rotation:0,confidence:.9,evidence:'Nested screen outline attached to the wall'},
  {type:'stairs',x:3,z:1,w:2,d:3,rotation:0,confidence:.85,evidence:'Parallel stair treads adjacent to an UP marking'}
 ]},{x:0,z:0,w:8,d:6});
 assert.equal(job.floor.walls.length,1);
 assert.equal(job.floor.items.length,0);
 assert.equal(job.floor.importReview.pendingSymbols.length,2);
 const p=createProject();p.version=2;p.floors=[job.floor];
 assert.doesNotThrow(()=>validateProject(p));
 assert.throws(()=>approveOriginal(p,p.floors[0],{measurements:true,elements:true}),/symbol/i);
});

test('malformed vision output remains queued for human correction',()=>{
 const service=new PlanJobs('/tmp/hestia-symbol-unit');
 const job={floor:createFloor('Unreviewed office',false),corrections:[]};
 service.apply(job,'symbols',{symbols:[{type:'wall',x:1,z:1,w:2,d:1,rotation:0,confidence:1,evidence:'Wall'}]},{x:0,z:0,w:8,d:6});
 assert.equal(job.corrections.length,1);
 assert.match(job.corrections[0].error,/Unsupported architectural symbol/);
 assert.equal(job.floor.items.length,0);
});
