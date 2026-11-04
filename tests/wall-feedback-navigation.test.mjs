import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceFingerprint,wallCorrection,correctionMatchesLine,applyWallCorrections,appendWallCorrection} from '../dist/wall-feedback.js';
import {centeredPlanBox,planPan,shouldHandPan,panWheel} from '../dist/plan-navigation.js';
const blueprint={src:'data:image/png;base64,EXAMPLE-DRAWING-A',x:-2,z:-1,w:20,d:12};
const wall={x1:1,z1:2,x2:10,z2:2};
const line={axis:'h',at:30,start:30,end:120,confidence:.76,evidence:'Parallel dark lines'};
test('false-wall correction survives coordinate calibration and removes matching wall on same source',()=>{
 const label=wallCorrection(wall,blueprint,.1,'not_wall');
 assert.equal(label.source,sourceFingerprint(blueprint.src));
 assert.ok(correctionMatchesLine(label,line));
 assert.equal(applyWallCorrections([line],[label],label.source).length,0);
 assert.equal(applyWallCorrections([line],[label],sourceFingerprint('a different plan')).length,1);
});
test('manually added wall becomes positive training example, not an auto-generated wall',()=>{
 const plus=wallCorrection(wall,blueprint,.1,'missing_wall');
 assert.equal(plus.label,'missing_wall');
 assert.equal(applyWallCorrections([line],[plus],plus.source).length,1);
});
test('repeated negative labels deduplicate without building unbounded memory',()=>{
 const entry=wallCorrection(wall,blueprint,.1,'not_wall');
 assert.deepEqual(appendWallCorrection([entry],entry),[entry]);
 assert.equal(appendWallCorrection([],entry).length,1);
});
test('2D viewport begins centered and keeps equal X/Y navigation scale',()=>{
 const box=centeredPlanBox({x:2,z:3,w:30,d:10},1,{width:1200,height:600});
 assert.deepEqual({cx:box.x+box.w/2,cz:box.z+box.d/2},{cx:17,cz:8});
 assert.ok(Math.abs(box.w/box.d-2)<1e-9);
 const pan=planPan({x:17,z:8},box,{width:1200,height:600},200,-100);
 assert.ok(pan.x>17&&pan.z<8);
});
test('PDF-style left drag works on empty plan at zoom and never steals object movement',()=>{
 assert.equal(shouldHandPan({button:0,tool:'select',onObject:false,zoom:2}),true);
 assert.equal(shouldHandPan({button:0,tool:'select',onObject:true,zoom:2}),false);
 assert.equal(shouldHandPan({button:0,tool:'pan',onObject:true,zoom:1}),true);
 assert.equal(shouldHandPan({button:1,tool:'wall',zoom:2}),true);
 assert.equal(shouldHandPan({button:0,tool:'wall',zoom:2}),false);
 assert.equal(panWheel({deltaY:120},2),true);
});
