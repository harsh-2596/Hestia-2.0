import test from 'node:test';
import assert from 'node:assert/strict';
import {orbitFrame,shouldRefitOrbit} from '../dist/orbit-center.js';

test('model bounds produce center pivot instead of old world origin',()=>{
 const frame=orbitFrame({min:{x:30,y:-.2,z:12},max:{x:54,y:3.2,z:28}});
 assert.deepEqual(frame.center,{x:42,y:1.5,z:20});
 assert.equal(frame.span,24);
 assert.equal(shouldRefitOrbit(null,frame),true);
});
test('small geometry edits do not force zoom refitting',()=>{
 const old={center:{x:10,y:1,z:8},span:20};
 assert.equal(shouldRefitOrbit(old,{center:{x:10.3,y:1,z:8.3},span:20.2}),false);
});
test('imported plan far from origin triggers framing adjustment',()=>{
 const old={center:{x:6,y:0,z:4.5},span:12};
 assert.equal(shouldRefitOrbit(old,{center:{x:52,y:1.4,z:41},span:35}),true);
});
test('invalid geometry bounds fall back safely',()=>{
 assert.equal(orbitFrame(null),null);
 assert.equal(orbitFrame({min:{x:10,y:0,z:0},max:{x:2,y:0,z:3}}),null);
 assert.equal(orbitFrame({min:{x:NaN,y:0,z:0},max:{x:2,y:0,z:3}}),null);
});
