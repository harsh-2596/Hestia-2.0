import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG,createProject,item,validateProject} from '../dist/model.js';
import {furniture} from '../dist/scene.js';

test('Item Library exposes an Architecture staircase',()=>{
 const stair=CATALOG.find(v=>v.type==='stairs');
 assert.ok(stair);
 assert.equal(stair.category,'Architecture');
 assert.ok(stair.w>0&&stair.d>0&&stair.h>0);
});

test('staircase is an editable, valid saved project item',()=>{
 const project=createProject();
 const stair=item('stairs',5,6,90);
 project.floors[0].items.push(stair);
 assert.doesNotThrow(()=>validateProject(project));
 assert.equal(stair.rotation,90);
 assert.equal(stair.type,'stairs');
});

test('staircase creates multiple individual 3D steps',()=>{
 const mesh=furniture(item('stairs',5,6));
 assert.equal(mesh.userData.kind,'item');
 assert.ok(mesh.children.length>=8,'Expected a stepped staircase, not one solid cuboid');
 assert.ok(mesh.children.every(child=>child.isMesh));
});
