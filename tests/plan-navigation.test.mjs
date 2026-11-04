import test from 'node:test';
import assert from 'node:assert/strict';
import {planPan,panWheel,zoomAt} from '../dist/plan-navigation.js';
test('wheel moves the zoomed 2D view instead of changing the zoom level',()=>{
 const origin={x:12,z:8},bounds={w:20,d:10},viewport={width:1000,height:500};
 assert.deepEqual(planPan(origin,bounds,viewport,100,100),{x:14,z:10});
 assert.equal(panWheel({deltaY:100,ctrlKey:false,metaKey:false},2),true);
 assert.equal(panWheel({deltaY:100,ctrlKey:false,metaKey:false},1),false);
});
test('Ctrl/Cmd wheel remains available to zoom',()=>{
 assert.equal(panWheel({ctrlKey:true},3),false);
 assert.equal(panWheel({metaKey:true},3),false);
});
test('space or middle drag can pan in any direction using scaled canvas coordinates',()=>{
 const before={x:5,z:6};
 assert.deepEqual(planPan(before,{w:12,d:8},{width:600,height:400},-150,80),{x:2,z:7.6});
});
test('wheel zoom keeps the point under the cursor anchored',()=>{
 const prev={x:10,z:8},box={w:20,d:16};
 const next=zoomAt(prev,box,15,12,1,2);
 assert.deepEqual(next,{x:12.5,z:10});
});
test('invalid viewport is safely ignored',()=>{
 const center={x:1,z:2};
 assert.equal(planPan(center,{w:10,d:10},{width:0,height:100},30,30),center);
});
