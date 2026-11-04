import test from 'node:test';
import assert from 'node:assert/strict';
import {projectHistoryShortcut} from '../dist/project-shortcuts.js';
import {History} from '../dist/model.js';

function key(key,opts={},target={tagName:'BUTTON'}){
 return {key,ctrlKey:true,metaKey:false,shiftKey:false,altKey:false,isComposing:false,target,...opts};
}
test('Ctrl+Z undoes project changes after clicking an Item Library button',()=>{
 assert.equal(projectHistoryShortcut(key('z')), 'undo');
 assert.equal(projectHistoryShortcut(key('Z')), 'undo');
 assert.equal(projectHistoryShortcut(key('z',{ctrlKey:false,metaKey:true})), 'undo');
 assert.equal(projectHistoryShortcut(key('z',{shiftKey:true})), 'redo');
 assert.equal(projectHistoryShortcut(key('y')), 'redo');
});
test('native text and contenteditable undo remain in the editor',()=>{
 for(const type of ['text','search','number','email']){
  assert.equal(projectHistoryShortcut(key('z',{}, {tagName:'INPUT',type,readOnly:false,disabled:false})),null);
 }
 assert.equal(projectHistoryShortcut(key('z',{}, {tagName:'TEXTAREA'})),null);
 assert.equal(projectHistoryShortcut(key('z',{}, {tagName:'DIV',isContentEditable:true})),null);
 assert.equal(projectHistoryShortcut(key('z',{}, {tagName:'DIV',closest:()=>({})})),null);
});
test('modal, composition and unrelated shortcuts do not modify project history',()=>{
 assert.equal(projectHistoryShortcut(key('z'),true),null);
 assert.equal(projectHistoryShortcut(key('z',{isComposing:true})),null);
 assert.equal(projectHistoryShortcut(key('z',{altKey:true})),null);
 assert.equal(projectHistoryShortcut(key('a')),null);
 assert.equal(projectHistoryShortcut(key('z',{ctrlKey:false,metaKey:false})),null);
});
test('project history returns pre-item state and supports redo',()=>{
 const h=new History();
 const before={floors:[{items:[]}]};
 const after={floors:[{items:[{type:'stairs',x:1,z:2}]}]};
 h.push(before);
 assert.deepEqual(h.undo(after),before);
 assert.deepEqual(h.redo(before),after);
});
