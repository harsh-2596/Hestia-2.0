import {FreeModelRegistry,imageRouterGenerate} from './free-models.mjs';
import {extraProviders,generateExtra,panoramaDimensions} from './image-providers.mjs';
import {mkdir,readFile,readdir,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {WorkspaceError} from './workspace.mjs';

const ID=/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
const requireId=value=>{if(typeof value!=='string'||!ID.test(value))throw new WorkspaceError(400,'Invalid project or render ID.');return value;};
export function imageData(value) {
  if(typeof value!=='string'||value.length>12000000)throw new WorkspaceError(400,'Image is missing or too large.');
  const match=/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if(!match)throw new WorkspaceError(400,'Use a PNG, JPEG or WebP image.');
  const bytes=Buffer.from(match[2],'base64');
  const valid=match[1]==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
    match[1]==='image/jpeg'?bytes[0]===255&&bytes[1]===216:bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
  if(!valid||bytes.length<24||bytes.length>8*1024*1024)throw new WorkspaceError(400,'Image signature or size is invalid.');
  return {mime:match[1],bytes};
}
export function providers(env=process.env) {
  return [
    {id:'openai',name:'OpenAI',key:env.OPENAI_API_KEY,model:env.HESTIA_OPENAI_MODEL||'gpt-image-2.5-sunburst',url:'https://api.openai.com/v1/images/edits',mask:true},
    {id:'gemini',name:'Google Gemini',key:env.GEMINI_API_KEY,model:env.HESTIA_GEMINI_MODEL||'gemini-nano-banana-2.1',mask:false},
    {id:'compatible',name:env.HESTIA_COMPATIBLE_NAME||'OpenAI-compatible',key:env.HESTIA_COMPATIBLE_API_KEY,model:env.HESTIA_COMPATIBLE_MODEL||'',url:env.HESTIA_COMPATIBLE_EDIT_URL||'',mask:true}
  ].map(p=>({...p,configured:!!(p.key&&p.model&&(p.id==='gemini'||p.url)),panorama:false})).concat(extraProviders(env),[{id:'auto-free',name:'Auto Free · quality-approved image models only',model:'curated-auto-free',key:env.IMAGEROUTER_API_KEY,configured:!!env.IMAGEROUTER_API_KEY,mask:false,panorama:true},{id:'imagerouter',name:'ImageRouter · curated quality test',model:'curated-candidate',key:env.IMAGEROUTER_API_KEY,configured:!!env.IMAGEROUTER_API_KEY,mask:false,panorama:true}]);
}
export function validateRender(input) {
  if(!input||typeof input!=='object')throw new WorkspaceError(400,'Invalid render request.');
  requireId(input.projectId);requireId(input.floorId);
  if(!['openai','gemini','compatible','cloudflare','comfyui','auto-free','imagerouter'].includes(input.provider)||!['room','wall','panorama'].includes(input.mode)||
      typeof input.prompt!=='string'||!input.prompt.trim()||input.prompt.length>3500)throw new WorkspaceError(400,'Choose a provider, target and a prompt up to 3500 characters.');
  if(input.mode==='panorama'&&(![input.layoutRevision,input.briefFingerprint,input.roomId].every(v=>typeof v==='string'&&v.length>0&&v.length<=80)))throw new WorkspaceError(400,'Panorama needs a room, approved layout revision and design brief.');
  const camera=input.camera;
  if(!camera||!Array.isArray(camera.position)||camera.position.length!==3||!camera.position.every(v=>Number.isFinite(v)&&Math.abs(v)<10000)||
      !Number.isFinite(camera.yaw)||!Number.isFinite(camera.pitch)||Math.abs(camera.yaw)>10000||Math.abs(camera.pitch)>Math.PI||
      !Number.isFinite(camera.fov)||camera.fov<20||camera.fov>110)throw new WorkspaceError(400,'Invalid viewpoint.');
  const source=imageData(input.source),reference=input.reference?imageData(input.reference):null,mask=input.mask?imageData(input.mask):null;
  if(input.mode==='panorama')panoramaDimensions(source);
  if(input.mode==='wall'&&(!input.wallId||!mask))throw new WorkspaceError(400,'Select a visible wall and capture its mask first.');
  if(input.wallId)requireId(input.wallId);if(input.tourId)requireId(input.tourId);
  if(mask&&mask.mime!=='image/png')throw new WorkspaceError(400,'Wall masks must be PNG.');
  return {source,reference,mask};
}
export function renderPrompt(input) {
  if(input.mode==='panorama')return `Create a seamless 360-degree equirectangular 2:1 architectural panorama. The first image is the exact spherical capture of the selected Hestia layout from this room station. Preserve spherical projection, room dimensions, door and window positions and floor/ceiling. Left and right edges must join seamlessly. Do not change geometry. Improve realism and requested finishes. Design brief: ${input.prompt}`;
  return `Create a photorealistic architectural interior visualization of the FIRST image, which is the exact camera view of a Hestia house model. Preserve its camera position, perspective, room dimensions, walls, doors, windows, openings and furniture placement. Do not invent extra rooms or change the layout. ${input.mode==='wall'?'Change only the selected wall surface indicated by the transparent mask (or the highlighted region guide). Preserve all objects in front of it and everything outside it.':'Improve realistic materials, lighting and the requested interior style while preserving this floor plan.'} ${input.reference?'The SECOND image is a style/material reference, not the floor plan. Borrow the requested colors, textures and design details, not its geometry.':''} User design request: ${input.prompt}`;
}
export async function generateImage(provider,input,assets,{fetcher=fetch,signal}={}) {
  if(provider.id==='imagerouter'){const b64=await imageRouterGenerate({...provider,prompt:renderPrompt(input)},input,assets,{fetcher,signal});return imageData('data:image/png;base64,'+b64);}
  if(['cloudflare','comfyui'].includes(provider.id))return generateExtra(provider,input,assets,{fetcher,signal});
  let response;
  if(provider.id==='gemini') {
    const parts=[{text:renderPrompt(input)},...['source','reference','mask'].filter(k=>assets[k]).map(k=>({inlineData:{mimeType:assets[k].mime,data:assets[k].bytes.toString('base64')}}))];
    // Native Gemini uses a visual region guide, not OpenAI alpha-mask semantics.
    if(assets.mask)parts[0].text+=' The LAST image is an alpha mask: transparent areas identify the selected wall; edit only that region.';
    response=await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':provider.key},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{responseModalities:['TEXT','IMAGE']}}),signal});
  } else {
    const endpoint=new URL(provider.url);
    if(endpoint.protocol!=='https:'&&!(endpoint.protocol==='http:'&&['localhost','127.0.0.1'].includes(endpoint.hostname)))throw Error('Use HTTPS for a remote image service.');
    const form=new FormData();form.set('model',provider.model);form.set('prompt',renderPrompt(input));form.set('n','1');form.set('size','1536x1024');form.set('quality','medium');form.set('output_format','png');
    for(const name of ['source','reference'])if(assets[name])form.append('image[]',new Blob([assets[name].bytes],{type:assets[name].mime}),name+'.'+(assets[name].mime==='image/jpeg'?'jpg':assets[name].mime.split('/')[1]));
    if(assets.mask)form.set('mask',new Blob([assets.mask.bytes],{type:'image/png'}),'mask.png');
    response=await fetcher(endpoint,{method:'POST',headers:{Authorization:'Bearer '+provider.key},body:form,signal,redirect:'error'});
  }
  if(!response.ok){const error=Error(`Image service returned HTTP ${response.status}. Check the selected model, account access, API key, quota and billing.`);error.status=response.status;throw error;}
  const raw=await response.text();if(raw.length>32*1024*1024)throw Error('The image service response is too large.');
  const body=JSON.parse(raw);
  const part=provider.id==='gemini'?body.candidates?.flatMap(c=>c.content?.parts||[]).find(p=>p.inlineData||p.inline_data):null;
  const inline=part?.inlineData||part?.inline_data;
  const encoded=inline?.data||body.data?.[0]?.b64_json,mime=inline?.mimeType||inline?.mime_type||'image/png';
  if(!encoded)throw Error('The provider returned no image. It may have declined the request or use an incompatible response format.');
  return imageData(`data:${mime};base64,${encoded}`);
}
export class RenderService {
  constructor(root,{env=process.env,fetcher=fetch}={}){this.root=path.join(root,'renders');this.freeModels=new FreeModelRegistry(root,{env,fetcher});this.env=env;this.fetcher=fetcher;this.active=null;}
  async save(job){const dir=path.join(this.root,requireId(job.id));await mkdir(dir,{recursive:true});const file=path.join(dir,'job.json'),temp=file+'.tmp';await writeFile(temp,JSON.stringify(job));for(let attempt=0;;attempt++){try{await rename(temp,file);break;}catch(e){if(attempt>=20||!['EPERM','EACCES','EBUSY'].includes(e.code))throw e;await new Promise(r=>setTimeout(r,20+attempt*5));}}}
  async get(id){requireId(id);if(this.active?.id===id&&this.active.job)return structuredClone(this.active.job);try{const job=JSON.parse(await readFile(path.join(this.root,requireId(id),'job.json'),'utf8'));if(['queued','running'].includes(job.status)&&this.active?.id!==id){job.status='interrupted';job.error='The server stopped during this render. Start a new render when ready; it was not retried automatically.';}return job;}catch(e){if(e.code==='ENOENT')throw new WorkspaceError(404,'Render not found.');throw e;}}
  async list(projectId,floorId){requireId(projectId);if(floorId)requireId(floorId);await mkdir(this.root,{recursive:true});const list=[];for(const id of await readdir(this.root)){if(!ID.test(id))continue;try{const job=await this.get(id);if(job.projectId===projectId&&(!floorId||job.floorId===floorId))list.push(job);}catch(e){if(e.status!==404)throw e;}}return list.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
  async start(input){const assets=validateRender(input);let provider=providers(this.env).find(p=>p.id===input.provider);if(!provider.configured)throw new WorkspaceError(503,'Configure this provider in the local .env file and restart Hestia.');if(['auto-free','imagerouter'].includes(input.provider)){const selected=await this.freeModels.select(input);provider={...provider,id:'imagerouter',name:'ImageRouter',model:selected.id};}if(input.mode==='panorama'&&!provider.panorama)throw new WorkspaceError(400,'This adapter does not support 2:1 panorama generation. Choose Cloudflare or local ComfyUI.');if(this.active)throw new WorkspaceError(409,'A render is already running. Wait for it to finish before starting another.');
    const job={id:randomUUID(),projectId:input.projectId,floorId:input.floorId,provider:provider.id,requestedProvider:input.provider,providerName:provider.name,model:provider.model,pricingPolicy:provider.id==='imagerouter'?'verified-zero-price-curated-v1':null,pricingVerifiedAt:provider.id==='imagerouter'?new Date().toISOString():null,prompt:input.prompt,mode:input.mode,layoutRevision:String(input.layoutRevision||'').slice(0,80),briefFingerprint:String(input.briefFingerprint||'').slice(0,80),wallId:input.wallId||null,tourId:input.tourId||null,camera:{position:[...input.camera.position],yaw:input.camera.yaw,pitch:input.camera.pitch,fov:input.camera.fov},roomId:typeof input.roomId==='string'?input.roomId.slice(0,80):null,sceneFingerprint:String(input.sceneFingerprint||'').slice(0,80),createdAt:new Date().toISOString(),status:'queued',hasReference:!!assets.reference};
    this.active={id:job.id,job};try{await this.save(job);for(const [name,asset]of Object.entries(assets))if(asset)await writeFile(path.join(this.root,job.id,name+'.image'),asset.bytes);job.sourceMime=assets.source.mime;job.referenceMime=assets.reference?.mime;await this.save(job);}catch(e){this.active=null;throw e;}
    this.active.promise=this.run(job,provider,input,assets);this.active.promise.catch(()=>{});return job;
  }
  async run(job,provider,input,assets){try{job.status='running';await this.save(job);const result=await generateImage(provider,input,assets,{fetcher:this.fetcher,signal:AbortSignal.timeout(300000)});if(input.mode==='panorama')job.dimensions=panoramaDimensions(result);await writeFile(path.join(this.root,job.id,'result.image'),result.bytes);job.mime=result.mime;job.status='completed';job.completedAt=new Date().toISOString();}catch(e){job.status='failed';job.error=e.name==='TimeoutError'?'The image service timed out. Check the provider before retrying.':e.status?e.message:'Image generation failed. Check server connectivity and provider configuration.';}finally{try{await this.save(job);}finally{this.active=null;}}}
}
export function aiHandler(service){return async(req,res,url)=>{
 const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 try{
   if(req.method==='GET'&&url.pathname==='/api/ai/status'){send(200,{providers:providers(service.env).map(({id,name,configured,model,mask,panorama})=>({id,name,configured,model,mask,panorama})),busy:!!service.active});return;}
   if(req.method==='GET'&&url.pathname==='/api/ai/free-models'){send(200,{models:await service.freeModels.list()});return;}
   if(req.method==='GET'&&url.pathname==='/api/ai/jobs'){send(200,{jobs:await service.list(url.searchParams.get('projectId'),url.searchParams.get('floorId'))});return;}
   const match=/^\/api\/ai\/jobs\/([A-Za-z0-9_-]+)(?:\/(source|reference|result))?$/.exec(url.pathname);
   if(req.method==='GET'&&match){const job=await service.get(match[1]);if(!match[2]){send(200,job);return;}const name=match[2],mime=name==='result'?job.mime:name==='source'?job.sourceMime:job.referenceMime;if(!mime)throw new WorkspaceError(404,'This image is not available.');const bytes=await readFile(path.join(service.root,job.id,name+'.image'));res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store','Content-Length':bytes.length});res.end(bytes);return;}
   if(req.method==='POST'&&['/api/ai/jobs','/api/ai/model-quality'].includes(url.pathname)){
     if(req.headers['x-hestia-client']!=='studio')throw new WorkspaceError(403,'Missing studio header.');
     if(!req.headers['content-type']?.startsWith('application/json'))throw new WorkspaceError(415,'Use application/json.');
     const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>24*1024*1024)throw new WorkspaceError(413,'Render input exceeds 24 MB.');chunks.push(chunk);}
     let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new WorkspaceError(400,'Malformed JSON.');}
     if(url.pathname==='/api/ai/model-quality'){if(input.action==='revoke'){send(200,await service.freeModels.revoke(input.modelId,input.task));return;}const approval=await service.freeModels.approve(await service.get(input.jobId),input.checks);send(200,approval);return;}
     const job=await service.start(input);send(202,job);return;
   }
   send(404,{error:'Unknown AI endpoint.'});
 }catch(e){send(e.status||500,{error:e.status?e.message:'The local render service could not complete the request.'});}
};}
