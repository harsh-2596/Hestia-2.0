// Architectural symbol vocabulary shared by the Plan Lab vision stage and Item Library.
// These are recognition cues, NOT guaranteed detections or inferred construction details.
export const SYMBOL_RULES=Object.freeze([
 {type:'tv',label:'Television',asset:'tv',kind:'item',cues:['thin nested rectangle adjacent to wall','screen outline or mounting bracket in plan view'],reject:['door leaf with swing arc','double-lined masonry wall']},
 {type:'sofa',label:'Three-seat sofa',asset:'sofa',kind:'item',cues:['long upholstered rectangle','three seating cushions and back/arm rests'],reject:['parallel load-bearing walls','series of staircase treads']},
 {type:'bed_with_tables',label:'Bed with two bedside tables',asset:'bed_with_tables',kind:'item',cues:['bed rectangle with pillow or blanket lines','two compact flanking nightstand rectangles'],reject:['three independent wall enclosed rooms']},
 {type:'pantry_counter',label:'Pantry slab or cooking counter',asset:'pantry_counter',kind:'item',cues:['pantry label','fixed narrow counter or slab against a wall'],reject:['counter not visibly present; mere room name is insufficient']},
 {type:'car',label:'Car in parking bay',asset:'car_compact',kind:'item',cues:['recognizable overhead vehicle silhouette','windscreen, hood, roof and wheel outlines','aligned parking bay context'],reject:['parallel masonry wall lines','stair treads or door swing arcs']},
 {type:'stairs',label:'Staircase',asset:null,kind:'feature',cues:['regularly repeated parallel stair treads','stair boundary or central spine','UP or DN label (if visible)'],reject:['parking stall markings','dimension ticks','window mullions']},
 {type:'window',label:'Window opening',asset:null,kind:'opening',cues:['narrow parallel lines interrupt a bold wall','glazing frame or mullion within wall thickness'],reject:['standalone television','gap with door swing arc','dimension line']}
]);
const RULES=new Map(SYMBOL_RULES.map(r=>[r.type,r]));
export function symbolRule(type){return RULES.get(type)||null;}
export function normalizeSymbolObservation(a,region,id){
 const fail=reason=>{throw Error(reason);};
 if(!a||typeof a!=='object'||Array.isArray(a))fail('Symbol must be an object.');
 const rule=symbolRule(a.type);if(!rule)fail('Unsupported architectural symbol.');
 if(typeof id!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/.test(id))fail('Invalid detection identifier.');
 if(!region||![region.x,region.z,region.w,region.d].every(Number.isFinite)||region.w<=0||region.d<=0)fail('Invalid calibrated source region.');
 const nums=[a.x,a.z,a.w,a.d,a.rotation,a.confidence];
 if(!nums.every(v=>typeof v==='number'&&Number.isFinite(v)))fail('Symbol requires finite position, size, rotation and confidence.');
 if(a.w<.06||a.d<.06||a.w>12||a.d>12||a.x<0||a.z<0||a.x+a.w>region.w+1e-6||a.z+a.d>region.d+1e-6)fail('Symbol bounding box is outside its source region.');
 if(a.rotation< -360||a.rotation>360||a.confidence<0||a.confidence>1)fail('Invalid symbol rotation or confidence.');
 if(typeof a.evidence!=='string'||a.evidence.trim().length<5||a.evidence.length>500)fail('Provide brief visible evidence.');
 return {id,type:a.type,label:rule.label,kind:rule.kind,x:a.x+region.x,z:a.z+region.z,w:a.w,d:a.d,rotation:a.rotation,confidence:a.confidence,evidence:a.evidence.trim(),state:'unresolved',sourceRegion:{x:region.x,z:region.z,w:region.w,d:region.d}};
}
export function symbolPlacement(a){
 const rule=symbolRule(a?.type);
 if(!rule)return null;
 if(rule.kind==='item')return {kind:'item',asset:rule.asset,x:a.x+a.w/2,z:a.z+a.d/2,w:a.w,d:a.d,rotation:a.rotation};
 if(rule.kind==='feature')return {kind:'feature',type:'stairs',x:a.x,z:a.z,w:a.w,d:a.d,rotation:a.rotation,needsConfirmedHeight:true};
 return {kind:'opening',type:'window',needsAssociatedWall:true};
}
