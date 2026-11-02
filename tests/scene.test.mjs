import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {furniture} from '../dist/scene.js';
import {CATALOG} from '../dist/model.js';
test('all procedural assets match their declared editable dimensions',()=>{for(const def of CATALOG){const model=furniture({...def,id:'test',x:0,z:0,rotation:0});const b=new THREE.Box3().setFromObject(model),size=b.getSize(new THREE.Vector3());for(const [key,n]of [['x',def.w],['y',def.h],['z',def.d]])assert.ok(Math.abs(size[key]-n)<.001,`${def.type}: ${key} should be ${n}, got ${size[key]}`);assert.ok(Math.abs(b.min.y)<.001,`${def.type} must sit on floor`);}});
test('resizing changes width, depth, and height of the actual sofa mesh',()=>{const def={...CATALOG[0],w:3.2,d:1.4,h:1.2,id:'resized',x:2,z:4,rotation:0};const mesh=furniture(def),size=new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());assert.ok(Math.abs(size.x-3.2)<.001);assert.ok(Math.abs(size.y-1.2)<.001);assert.ok(Math.abs(size.z-1.4)<.001);assert.equal(mesh.position.x,2);assert.equal(mesh.position.z,4);});
