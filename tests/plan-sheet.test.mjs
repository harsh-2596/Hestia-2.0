import test from 'node:test';
import assert from 'node:assert/strict';
import {suggestPlanBounds} from '../dist/plan-sheet.js';

function sheet(width=800,height=600){
 return {width,height,data:new Uint8ClampedArray(width*height*4).fill(255)};
}
function vertical(im,x,top,bottom){for(let y=top;y<=bottom;y++){const k=(y*im.width+x)*4;im.data[k]=im.data[k+1]=im.data[k+2]=0;}}
function horizontal(im,y,left,right){for(let x=left;x<=right;x++){const k=(y*im.width+x)*4;im.data[k]=im.data[k+1]=im.data[k+2]=0;}}

test('plan-only crop does not include title block, full sheet border or main-road caption',()=>{
 const im=sheet();
 for(const x of [5,795,710])vertical(im,x,0,599);
 for(const y of [5,595])horizontal(im,y,0,799);
 for(const x of [125,650])vertical(im,x,43,510);
 for(const y of [43,510])horizontal(im,y,125,650);
 for(const y of [525,550])horizontal(im,y,105,670);
 const crop=suggestPlanBounds(im);
 assert.ok(crop,'CAD footprint should be recognized');
 assert.equal(crop.reviewRequired,true);
 assert.equal(crop.method,'orthogonal-plan-frame-v1');
 assert.ok(crop.x<125&&crop.x>75);
 assert.ok(crop.x+crop.w>650&&crop.x+crop.w<700);
 assert.ok(crop.y<43&&crop.y>5);
 assert.ok(crop.y+crop.h>510&&crop.y+crop.h<545);
});
test('ambiguous blank, tiny and invalid inputs never receive invented plan bounds',()=>{
 assert.equal(suggestPlanBounds(sheet()),null);
 assert.equal(suggestPlanBounds({width:200,height:200,data:new Uint8ClampedArray(200*200*4)}),null);
 assert.equal(suggestPlanBounds({width:800,height:600,data:new Uint8ClampedArray(12)}),null);
 assert.equal(suggestPlanBounds(null),null);
});
test('suggestion is data-only: no raster pixels are changed',()=>{
 const im=sheet();vertical(im,125,43,510);vertical(im,650,43,510);horizontal(im,43,125,650);horizontal(im,510,125,650);
 const before=new Uint8ClampedArray(im.data);
 const crop=suggestPlanBounds(im);
 assert.ok(crop);assert.deepEqual(im.data,before);
});
