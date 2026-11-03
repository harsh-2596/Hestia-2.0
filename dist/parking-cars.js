// Procedural parking assets shared by the 3D renderer and 2D floor-plan editor.
// Geometry always comes from the editable library item, never from a static icon.
export const isParkingCar = type => type === 'car_compact' || type === 'car_sedan';

export function buildParkingCar(group, {w,d,h,color,type}, {box,cyl}) {
 if(!isParkingCar(type))throw Error('Unknown parking vehicle type.');
 const compact = type === 'car_compact', tireRadius = h * .18;
 for(const side of [-1,1])for(const axle of [-1,1]){
  const z = axle * d * (compact ? .285 : .31), x = side * w * .4375;
  const tire=cyl(group,tireRadius,tireRadius,w*.115,x,tireRadius,z,'#292d32');tire.rotation.z=Math.PI/2;
  const hub=cyl(group,tireRadius*.53,tireRadius*.53,w*.035,side*w*.50,tireRadius,z,'#afb8bb');hub.rotation.z=Math.PI/2;
 }
 // Rounded body and separate cabin keep the car readable in tiny 3D thumbnails.
 box(group,w*.84,h*.29,d*.91,0,h*.34,0,color,h*.085);
 box(group,w*.73,h*.27,d*(compact?.51:.50),0,h*.585,-d*(compact?.055:.035),color,h*.065);
 box(group,w*.68,h*.06,d*.32,0,h*.76,-d*.045,color,h*.025);
 const windscreen=box(group,w*.64,h*.022,d*.15,0,h*.68,-d*.235,'#88a8b7',.008);windscreen.rotation.x=-.38;
 const rearGlass=box(group,w*.62,h*.022,d*.14,0,h*.68,d*.19,'#8ba6af',.008);rearGlass.rotation.x=.38;
 for(const side of [-1,1]){
  box(group,w*.018,h*.16,d*.29,side*w*.369,h*.625,-d*.045,'#7895a5',.008);
  box(group,w*.105,h*.055,d*.09,side*w*.46,h*.53,-d*.20,color,.012);
  box(group,w*.15,h*.055,d*.027,side*w*.295,h*.375,-d*.455,'#f2e9ce',.009);
  box(group,w*.16,h*.055,d*.027,side*w*.295,h*.365,d*.455,'#bd4650',.009);
 }
 box(group,w*.65,h*.045,d*.025,0,h*.295,-d*.465,'#3b444a',.008);
 box(group,w*.65,h*.045,d*.025,0,h*.295,d*.465,'#3b444a',.008);
}

// Stylized bird's-eye silhouette on the 2D plan, with a distinct cabin and tires.
export function parkingCarSVG({w,d,color,type}) {
 if(!isParkingCar(type))return '';
 const compact=type==='car_compact', glassStart=compact?-.245:-.255;
 return `<g aria-label="${compact?'Compact car':'Sedan'}">
 <rect x="${-w*.49}" y="${-d*.31}" width="${w*.11}" height="${d*.21}" rx="${w*.04}" fill="#303238"/>
 <rect x="${w*.38}" y="${-d*.31}" width="${w*.11}" height="${d*.21}" rx="${w*.04}" fill="#303238"/>
 <rect x="${-w*.49}" y="${d*.12}" width="${w*.11}" height="${d*.21}" rx="${w*.04}" fill="#303238"/>
 <rect x="${w*.38}" y="${d*.12}" width="${w*.11}" height="${d*.21}" rx="${w*.04}" fill="#303238"/>
 <rect x="${-w*.425}" y="${-d*.48}" width="${w*.85}" height="${d*.96}" rx="${w*.18}" fill="${color}" stroke="#4b5358" stroke-width=".025"/>
 <rect x="${-w*.34}" y="${d*glassStart}" width="${w*.68}" height="${d*.49}" rx="${w*.11}" fill="#8caab7" stroke="#465963" stroke-width=".025"/>
 <rect x="${-w*.29}" y="${-d*.055}" width="${w*.58}" height="${d*.22}" rx="${w*.065}" fill="${color}"/>
 <path d="M${-w*.32} ${-d*.15}H${w*.32} M${-w*.32} ${d*.205}H${w*.32}" stroke="#455660" stroke-width=".025"/>
 <rect x="${-w*.33}" y="${-d*.475}" width="${w*.21}" height="${d*.035}" rx=".02" fill="#f4eed9"/>
 <rect x="${w*.12}" y="${-d*.475}" width="${w*.21}" height="${d*.035}" rx=".02" fill="#f4eed9"/>
 <rect x="${-w*.33}" y="${d*.44}" width="${w*.21}" height="${d*.035}" rx=".02" fill="#a84351"/>
 <rect x="${w*.12}" y="${d*.44}" width="${w*.21}" height="${d*.035}" rx=".02" fill="#a84351"/>
 </g>`;
}
