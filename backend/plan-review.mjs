import {randomUUID} from 'node:crypto';
import {validateProject} from '../dist/model.js';
import {featureIssues} from '../dist/feature-review.js';
export function quarantineFeatures(f){
 if(!f||typeof f!=='object')throw Error('floor: expected an object.');
 const assumptions=[];if(f.id===undefined){f.id=randomUUID();assumptions.push('Floor identifier assigned locally.');}if(f.name===undefined){f.name='AI reconstruction review draft';assumptions.push('Floor name was missing.');}if(f.elevation===undefined){f.elevation=0;assumptions.push('Floor elevation uses a zero coordinate origin; actual levels must be confirmed.');}if(f.items===undefined){f.items=[];assumptions.push('Drawn furniture was not returned; review missing objects.');}
 f.importReview={...f.importReview,unresolved:[...(f.importReview?.unresolved||[]),...assumptions]};
 for(const key of ['rooms','walls','items'])if(!Array.isArray(f[key]))throw Error('floor.'+key+': expected an array.');
 if(f.features!==undefined&&(!Array.isArray(f.features)||f.features.length>500))throw Error('features must be an array with at most 500 entries.');
 const raw=structuredClone(f.features||[]);f.features=[];
 // Invalid core geometry must still fail; only individually invalid fixed features are quarantined.
 validateProject({version:2,id:'draft',name:'Draft',units:'m',floors:[f]});
 const used=new Set([f.id,...f.rooms.map(a=>a.id),...f.items.map(a=>a.id),...f.walls.flatMap(w=>[w.id,...w.openings.map(a=>a.id)])]),pending=[];
 for(const [index,a]of raw.entries()){const issues=featureIssues(a);if(a?.id&&used.has(a.id))issues.push('id: duplicates another building element.');if(!issues.length){f.features.push(a);used.add(a.id);}else pending.push({id:randomUUID(),sourceIndex:index,label:`Feature ${index+1}${typeof a?.type==='string'?' · '+a.type:''}`,raw:a,issues,state:'unresolved'});}
 f.importReview={...f.importReview,pendingFeatures:pending};return pending;
}
