import test from 'node:test';
import assert from 'node:assert/strict';
import {mountLocalWorkspace} from '../dist/workspace-client.js';

test('unchanged autosaves do not create revisions or block page unload',async t=>{
 const savedGlobals=Object.fromEntries(['document','window','localStorage','fetch'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 t.after(()=>{for(const [k,descriptor]of Object.entries(savedGlobals)){if(descriptor)Object.defineProperty(globalThis,k,descriptor);else delete globalThis[k];}});
 const status={},listeners={},writes=[];let revision=0,record;
 const project={id:'project-id',name:'Test',updatedAt:'first'};
 globalThis.document={querySelector:s=>s==='#save-status'?status:{prepend(){}},createElement:()=>({})};
 globalThis.window={addEventListener:(name,fn)=>listeners[name]=fn};
 globalThis.localStorage={getItem:()=>null,setItem(){}};
 globalThis.fetch=async(url,options={})=>{
  if(url==='/api/health')return{ok:true,json:async()=>({mode:'local',storage:'disk'})};
  if(options.method==='PUT'){record=JSON.parse(options.body).document;writes.push(record);return{ok:true,json:async()=>({revision:++revision})};}
  return{ok:!!record,status:record?200:404,json:async()=>record?{data:record,revision}:{error:'Missing'}};
 };
 const workspace=mountLocalWorkspace({getProject:()=>project,toast:message=>assert.fail(message)});
 await new Promise(r=>setImmediate(r));await workspace.flush();assert.equal(writes.length,1);
 workspace.queue({...project,updatedAt:'second'});await workspace.flush();assert.equal(writes.length,1);
 let prevented=false;listeners.beforeunload({preventDefault(){prevented=true;}});assert.equal(prevented,false);
 workspace.queue({...project,name:'Changed'});await workspace.flush();assert.equal(writes.length,2);
});
