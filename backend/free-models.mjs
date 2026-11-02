import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {WorkspaceError} from './workspace.mjs';
// Curated candidates only. Catalogue availability never constitutes a quality pass.
export const IMAGE_SHORTLIST=[
 {id:'black-forest-labs/FLUX-2-klein-4b:free',name:'FLUX 2 Klein 4B',rank:1},
 {id:'qwen/qwen-image-2:free',name:'Qwen Image 2',rank:2}
];
export const VISION_SHORTLIST=['google/gemma-4-31b-it:free','nvidia/nemotron-3.5-super-vl:free'];
export const QUALITY_VERSION=1;
export const IMAGE_CHECKS=['layout','materials','lighting','realism'];
const exactZero=v=>(typeof v==='number'||typeof v==='string')&&v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))&&Number(v)===0;
export function eligibleImage(model,task='room'){
 if(!model||!IMAGE_SHORTLIST.some(c=>c.id===model.id))return false;
 if(!model.architecture?.input_modalities?.includes('image')||!model.architecture?.output_modalities?.includes('image'))return false;
 if(!['min','average','max'].every(k=>exactZero(model.pricing?.[k]))||!Object.values(model.pricing).every(exactZero))return false;
 return task!=='panorama'||(model.supported_parameters?.includes('size')&&model.parameters?.size?.some(s=>s==='custom'||s==='2048x1024'));
}
export class FreeModelRegistry{
 constructor(root,{env=process.env,fetcher=fetch}={}){this.root=path.join(root,'model-quality');this.env=env;this.fetcher=fetcher;this.locks=Promise.resolve();}
 async catalogue(){let res;try{res=await this.fetcher('https://api.imagerouter.io/v3/models?output_modalities=image&free=true',{signal:AbortSignal.timeout(15000),redirect:'error'});}catch{throw new WorkspaceError(503,'Cannot verify current free image pricing. Auto Free is stopped.');}if(!res.ok)throw new WorkspaceError(503,'Free image catalogue unavailable. No paid fallback was used.');const rows=await res.json();if(!Array.isArray(rows))throw new WorkspaceError(503,'Unsupported image catalogue; free pricing cannot be verified.');return rows;}
 async persist(rows){await mkdir(this.root,{recursive:true});const file=path.join(this.root,'approved.json'),tmp=file+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(rows));for(let attempt=0;;attempt++){try{await rename(tmp,file);return;}catch(e){if(attempt>=20||!['EPERM','EACCES','EBUSY'].includes(e.code))throw e;await new Promise(r=>setTimeout(r,20+attempt*5));}}}
 revoke(model,task){const operation=this.locks.catch(()=>{}).then(async()=>{if(!IMAGE_SHORTLIST.some(m=>m.id===model)||!['room','panorama'].includes(task))throw new WorkspaceError(400,'Invalid quality record.');const rows=await this.records();rows.approvals=rows.approvals.filter(a=>a.model!==model||a.task!==task);await this.persist(rows);return {model,task,approved:false};});this.locks=operation;return operation;}
 async records(){try{return JSON.parse(await readFile(path.join(this.root,'approved.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return {version:1,approvals:[]};throw e;}}
 async list(){const [rows,records]=await Promise.all([this.catalogue(),this.records()]);return IMAGE_SHORTLIST.map(c=>{const model=rows.find(m=>m.id===c.id);return {...c,available:!!model,free:eligibleImage(model),panorama:eligibleImage(model,'panorama'),roomApproved:records.approvals.some(a=>a.model===c.id&&a.task==='room'&&a.version===QUALITY_VERSION),panoramaApproved:records.approvals.some(a=>a.model===c.id&&a.task==='panorama'&&a.version===QUALITY_VERSION),checks:IMAGE_CHECKS,reason:!model?'Not currently listed':!eligibleImage(model)?'Pricing or image-editing capability is unverified':'Curated candidate; requires an inspected real output before Auto Free'};});}
 async select(input){if(!this.env.IMAGEROUTER_API_KEY)throw new WorkspaceError(503,'Set IMAGEROUTER_API_KEY privately in .env and restart Hestia.');if(input.mode==='wall')throw new WorkspaceError(400,'The curated free shortlist is not qualified for isolated wall masks.');const list=await this.list(),task=input.mode==='panorama'?'panorama':'room',requested=input.modelId;
  if(requested&&!IMAGE_SHORTLIST.some(m=>m.id===requested))throw new WorkspaceError(400,'That model is not on the curated shortlist.');
  const compatible=list.filter(m=>m.free&&(task!=='panorama'||m.panorama));
  if(input.provider==='imagerouter'){const candidate=compatible.find(m=>m.id===requested);if(!candidate)throw new WorkspaceError(503,'Selected candidate is unavailable, no longer free, or unsuitable for this task.');return candidate;}
  const approved=compatible.filter(m=>task==='panorama'?m.panoramaApproved:m.roomApproved);
  const candidate=requested?approved.find(m=>m.id===requested):approved[0];if(!candidate)throw new WorkspaceError(503,'No quality-approved free model is available for this task. Generate and inspect a curated candidate in AI models first.');return candidate;
 }
 approve(job,checks){const operation=this.locks.catch(()=>{}).then(async()=>{if(job.status!=='completed'||job.provider!=='imagerouter'||!IMAGE_SHORTLIST.some(m=>m.id===job.model))throw new WorkspaceError(400,'Quality approval needs a completed curated-model test job.');const task=job.mode==='panorama'?'panorama':'room',required=task==='panorama'?[...IMAGE_CHECKS,'seams']:IMAGE_CHECKS;if(!required.every(k=>checks?.[k]===true))throw new WorkspaceError(400,'Inspect and confirm every quality criterion first.');const rows=await this.records(),approval={model:job.model,task,jobId:job.id,version:QUALITY_VERSION,checks:Object.fromEntries(required.map(k=>[k,true])),approvedAt:new Date().toISOString()};rows.approvals=rows.approvals.filter(a=>a.model!==job.model||a.task!==task);rows.approvals.push(approval);await this.persist(rows);return approval;});this.locks=operation;return operation;}
}
export async function imageRouterGenerate(provider,input,assets,{fetcher=fetch,signal}={}){
 if(assets.mask)throw new WorkspaceError(400,'Free curated models have not passed isolated mask editing.');
 const images=[assets.source,...(assets.reference?[assets.reference]:[])].map(a=>`data:${a.mime};base64,${a.bytes.toString('base64')}`);
 const res=await fetcher('https://api.imagerouter.io/v1/openai/images/generations',{method:'POST',headers:{Authorization:'Bearer '+provider.key,'Content-Type':'application/json'},body:JSON.stringify({model:provider.model,prompt:provider.prompt,image:images.length===1?images[0]:images,size:input.mode==='panorama'?'2048x1024':'1536x1024',response_format:'b64_ephemeral',output_format:'png'}),signal,redirect:'error'});
 if(!res.ok)throw new WorkspaceError(502,`ImageRouter returned HTTP ${res.status}. Generation stopped; no provider switch or paid fallback was made.`);
 const body=await res.json();if(!body.data?.[0]?.b64_json)throw new WorkspaceError(502,'ImageRouter returned no base64 image; no remote image URL was followed.');if(body.cost!==undefined&&!exactZero(body.cost))throw new WorkspaceError(502,'Provider reported a nonzero cost for a verified-free model. Generation stopped; review the provider account.');return body.data[0].b64_json;
}
export async function openRouterVision(messages,{env=process.env,fetcher=fetch}={}){
 if(!env.OPENROUTER_API_KEY)throw new WorkspaceError(503,'Set OPENROUTER_API_KEY privately in .env and restart Hestia.');const res=await fetcher('https://openrouter.ai/api/v1/models',{signal:AbortSignal.timeout(15000),redirect:'error'});if(!res.ok)throw new WorkspaceError(503,'Cannot verify free vision pricing.');const {data}=await res.json(),candidates=VISION_SHORTLIST.filter(id=>data?.some(m=>m.id===id&&m.architecture?.input_modalities?.includes('image')&&m.architecture?.output_modalities?.includes('text')&&m.supported_parameters?.includes('response_format')&&m.pricing&&Object.values(m.pricing).every(exactZero)));
 if(!candidates.length)throw new WorkspaceError(503,'No compatible curated free vision model is available.');const response=await fetcher('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+env.OPENROUTER_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:candidates[0],messages,response_format:{type:'json_object'},max_tokens:12000,temperature:.2,provider:{allow_fallbacks:false,require_parameters:true,max_price:{prompt:0,completion:0,request:0,image:0}}}),signal:AbortSignal.timeout(180000),redirect:'error'});if(!response.ok)throw new WorkspaceError(502,'Curated free vision request failed; no paid fallback was used.');const result=await response.json();return {content:result.choices?.[0]?.message?.content,model:result.model||candidates[0],provider:'openrouter'};
}
