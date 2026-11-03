import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {CATALOG,item,createProject,validateProject} from '../dist/model.js';
import {furniture} from '../dist/scene.js';
import {isParkingCar,parkingCarSVG} from '../dist/parking-cars.js';

test('Parking library includes two recognizable editable vehicle variants',()=>{
 const cars=CATALOG.filter(v=>v.category==='Parking');
 assert.deepEqual(cars.map(c=>c.type),['car_compact','car_sedan']);
 for(const car of cars){
  assert.ok(isParkingCar(car.type));
  assert.ok(car.w>1&&car.d>3&&car.h>1);
  const p=item(car.type,2,3);
  assert.equal(p.category,'Parking');
  assert.equal(p.x,2);assert.equal(p.z,3);
  const svg=parkingCarSVG(p);
  assert.match(svg, /aria-label="(Compact car|Sedan)"/);
  assert.match(svg, /<rect /);
  const model=furniture(p),size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  for(const [key,value] of [['x',car.w],['y',car.h],['z',car.d]])assert.ok(Math.abs(size[key]-value)<.001,`${car.type}: ${key}`);
  assert.ok(model.children.length>12,'car geometry should include wheels, glass and lights');
 }
});

test('Parking vehicles survive project validation and JSON persistence',()=>{
 const p=createProject();
 p.floors[0].items.push(item('car_compact',5,6),item('car_sedan',7,6));
 assert.equal(validateProject(p),p);
 const restored=JSON.parse(JSON.stringify(p));
 assert.equal(validateProject(restored),restored);
 assert.equal(restored.floors[0].items.at(-1).type,'car_sedan');
});
