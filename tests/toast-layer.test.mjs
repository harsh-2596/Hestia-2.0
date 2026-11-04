import test from 'node:test';
import assert from 'node:assert/strict';
import {syncToastLayer} from '../dist/toast-layer.js';

const host=(open=false)=>({
 open,children:[],appendChild(child){
  if(child.parentNode){const current=child.parentNode.children;
   current.splice(current.indexOf(child),1);
  }
  this.children.push(child);child.parentNode=this;return child;
 }
});

test('toast moves into the active native modal top layer and returns to body when closed',()=>{
 const body=host(),dialog=host(),toast={parentNode:null};
 body.appendChild(toast);
 dialog.open=true;
 assert.equal(syncToastLayer(toast,dialog,body),true);
 assert.equal(toast.parentNode,dialog);
 assert.deepEqual(body.children,[]);
 assert.deepEqual(dialog.children,[toast]);
 dialog.open=false;
 assert.equal(syncToastLayer(toast,dialog,body),false);
 assert.equal(toast.parentNode,body);
 assert.deepEqual(dialog.children,[]);
});
test('repeated notifications do not duplicate or reorder the toast within a dialog',()=>{
 const body=host(),dialog=host(true),toast={parentNode:null};
 body.appendChild(toast);
 syncToastLayer(toast,dialog,body);
 syncToastLayer(toast,dialog,body);
 assert.equal(dialog.children.filter(x=>x===toast).length,1);
});
test('missing UI nodes do not crash error reporting',()=>{
 assert.equal(syncToastLayer(null,null,null),false);
});
