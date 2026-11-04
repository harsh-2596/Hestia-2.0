// Decide whether Ctrl/Cmd+Z should affect the Hestia project or a text editor.
// Browser-native typing undo takes priority inside editable controls.
export function projectHistoryShortcut(event,modalOpen=false){
 if(modalOpen||!event||event.altKey||event.isComposing||!(event.ctrlKey||event.metaKey))return null;
 const key=String(event.key||'').toLowerCase();
 const action=key==='z'?(event.shiftKey?'redo':'undo'):key==='y'?'redo':null;
 if(!action)return null;
 const active=event.target;
 if(active?.isContentEditable||active?.closest?.('[contenteditable]:not([contenteditable="false"])'))return null;
 const tag=String(active?.tagName||'').toUpperCase();
 if(tag==='TEXTAREA')return null;
 if(tag==='INPUT'&&!active.readOnly&&!active.disabled){
  const type=String(active.type||'text').toLowerCase();
  if(['text','search','email','url','tel','password','number','date','datetime-local','time','month','week'].includes(type))return null;
 }
 return action;
}
