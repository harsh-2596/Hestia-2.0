import {structuredAdvice} from '../backend/advice.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject} from '../dist/model.js';
import {quarantineFeatures} from '../backend/plan-review.mjs';
import {approveOriginal} from '../dist/planning-data.js';
const feature=()=>({id:'stairs-1',type:'stairs',x:1,z:1,w:2,d:3,h:2.7,rotation:0});
test('invalid features preserve valid building geometry and raw evidence with field diagnostics',()=>{const p=createProject(),f=p.floors[0],walls=JSON.stringify(f.walls);const bad={...feature(),id:'bad-stairs',h:'2.7'};f.features=[feature(),bad];const pending=quarantineFeatures(f);assert.equal(f.features.length,1);assert.equal(JSON.stringify(f.walls),walls);assert.deepEqual(pending[0].raw,bad);assert.match(pending[0].issues.join(' '),/h: expected/);assert.throws(()=>approveOriginal(p,f,{measurements:true,elements:true}),/unresolved/);});
test('missing fields and duplicate IDs are quarantined without invented dimensions',()=>{const f=createProject().floors[0];f.features=[{type:'lift'}, {...feature(),id:f.walls[0].id}];const pending=quarantineFeatures(f);assert.equal(pending.length,2);assert.match(pending[0].issues.join(' '),/rotation/);assert.match(pending[1].issues.join(' '),/duplicates/);assert.equal(f.features.length,0);});
test('corrected features or reasoned exclusions unblock approval; resolution without geometry does not',()=>{for(const fix of ['correct','exclude']){const p=createProject(),f=p.floors[0];f.features=[{...feature(),w:0}];const [q]=quarantineFeatures(f);q.state='resolved';q.resolvedFeatureId='missing';assert.throws(()=>approveOriginal(p,f,{measurements:true,elements:true}),/unresolved/);if(fix==='correct'){f.features.push(feature());q.resolvedFeatureId='stairs-1';}else{q.state='excluded';q.reason='Drawing annotation, not a stair.';}assert.doesNotThrow(()=>approveOriginal(p,f,{measurements:true,elements:true}));}});
test('invalid core geometry and malformed feature arrays still fail closed',()=>{const f=createProject().floors[0];f.walls[0].height=-1;assert.throws(()=>quarantineFeatures(f));const g=createProject().floors[0];g.features={};assert.throws(()=>quarantineFeatures(g),/array/);});


test('AI API preserves malformed fixed features as review items rather than rejecting valid core geometry',async()=>{const f=createProject().floors[0];f.items=[];f.features=[{...feature(),h:'unknown'}];const result=await structuredAdvice({kind:'plan',image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==',width:12,depth:9},{env:{CLOUDFLARE_ACCOUNT_ID:'a'.repeat(32),CLOUDFLARE_API_TOKEN:'test'},fetcher:async()=>Response.json({choices:[{message:{content:JSON.stringify({floor:f})}}]})});assert.equal(result.floor.walls.length,f.walls.length);assert.equal(result.floor.features.length,0);assert.equal(result.floor.importReview.pendingFeatures.length,1);});


test('missing floor bookkeeping is explicit and never invents building dimensions',()=>{const f=createProject().floors[0];const walls=JSON.stringify(f.walls);delete f.id;delete f.name;delete f.elevation;delete f.items;quarantineFeatures(f);assert.equal(JSON.stringify(f.walls),walls);assert.deepEqual(f.items,[]);assert.ok(f.importReview.unresolved.some(s=>s.includes('actual levels')));});
