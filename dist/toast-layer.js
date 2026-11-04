// Native showModal() dialogs render in the browser's top layer.
// A body-level toast cannot paint over that layer, even with a large z-index.
// Keep the existing toast element and styling; move it into the active dialog.
export function syncToastLayer(toast,dialog,body){
 if(!toast||!dialog||!body)return false;
 const host=dialog.open?dialog:body;
 if(toast.parentNode!==host)host.appendChild(toast);
 return host===dialog;
}
