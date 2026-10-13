/* GitHub UI -> Apps Script HtmlService bridge. No credentials stored in GitHub. */
(function () {
  'use strict';
  const cfg=window.SHOP_STUDIO_CONFIG||{};
  const owner=/\/Owner\.html$/i.test(location.pathname);
  const base=owner?cfg.ownerBridgeUrl:cfg.customerBridgeUrl;
  const nonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
  const pending=new Map(); let ready=false;
  const frame=document.createElement('iframe');frame.hidden=true;frame.setAttribute('aria-hidden','true');
  if(base && /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?|$)/.test(base)) frame.src=base+(base.includes('?')?'&':'?')+'parentOrigin='+encodeURIComponent(location.origin)+'&nonce='+nonce;
  function install(){document.body.appendChild(frame)}
  if(document.body)install();else document.addEventListener('DOMContentLoaded',install,{once:true});
  window.addEventListener('message',function(ev){
    // Frame source + cryptographic session nonce; actual iframe origin is Googleusercontent.
    if(ev.source!==frame.contentWindow||!ev.data||ev.data.bridge!=='shopstudio'||ev.data.nonce!==nonce)return;
    if(ev.data.kind==='ready'){ready=true;return}
    if(ev.data.kind!=='result')return;
    const p=pending.get(ev.data.id);if(!p)return;pending.delete(ev.data.id);
    ev.data.ok?p.success?.(ev.data.value):p.failure?.(new Error(ev.data.error||'Backend error'));
  });
  function invoke(method,args,success,failure){
    if(!base){failure?.(new Error('Apps Script bridge URL is not configured in shopstudio-config.js'));return;}
    const id=crypto.randomUUID();const started=Date.now();
    const trySend=()=>{
      if(ready){pending.set(id,{success,failure});frame.contentWindow.postMessage({bridge:'shopstudio',nonce,kind:'call',id,method,args},'*');
        setTimeout(()=>{if(pending.has(id)){pending.delete(id);failure?.(new Error('Backend timed out'))}},90000);return}
      if(Date.now()-started>25000){failure?.(new Error('Cannot connect to Apps Script bridge. Check deployment and browser iframe restrictions.'));return}
      setTimeout(trySend,250);
    };trySend();
  }
  window.google=window.google||{};
  window.google.script=window.google.script||{};
  window.google.script.run=new Proxy({}, {get(_target,key){
    if(key==='withSuccessHandler')return cb=>new Proxy({}, {get(_t,k){
      if(k==='withFailureHandler')return fail=>new Proxy({}, {get(_t2,m){return (...args)=>invoke(m,args,cb,fail)}});
      return (...args)=>invoke(k,args,cb,console.error)
    }});
    return undefined;
  }});
})();
