export function featureIssues(a){
 if(!a||typeof a!=='object'||Array.isArray(a))return ['Feature must be an object.'];
 const issues=[],number=(key,min,max)=>{if(typeof a[key]!=='number'||!Number.isFinite(a[key])||a[key]<min||a[key]>max)issues.push(`${key}: expected a number from ${min} to ${max}; received ${JSON.stringify(a[key])??'missing'}.`);};
 if(typeof a.id!=='string'||! /^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/.test(a.id))issues.push('id: missing or invalid identifier.');
 if(!['stairs','ramp','parking','lift','column','service'].includes(a.type))issues.push(`type: unsupported ${JSON.stringify(a.type)??'missing'}.`);
 number('x',-200,200);number('z',-200,200);number('w',.1,100);number('d',.1,100);number('h',.01,10);number('rotation',-3600,3600);return issues;
}
export function unresolvedFeatures(f){return (f.importReview?.pendingFeatures||[]).filter(p=>!(p.state==='resolved'&&f.features?.some(a=>a.id===p.resolvedFeatureId))&&!(p.state==='excluded'&&typeof p.reason==='string'&&p.reason.trim()));}
