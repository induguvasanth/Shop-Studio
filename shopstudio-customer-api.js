/* Shop Studio customer upload transport v4: direct POST + independent tracking. */
(function(){
'use strict';
const config=window.SHOP_STUDIO_CONFIG||{};
const endpoint=String(config.customerBridgeUrl||'').split('?')[0];
const pendingKey='shopStudioPendingUploadsV4';
const validUrl=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
function randomHex(n){return Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>b.toString(16).padStart(2,'0')).join('');}
function pending(){try{const x=JSON.parse(sessionStorage.getItem(pendingKey)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}}
function save(a){sessionStorage.setItem(pendingKey,JSON.stringify(a))}
function remember(t){save([...pending().filter(x=>x.id!==t.id),t])}
function forget(id){save(pending().filter(x=>x.id!==id))}
function get(action,id,secret){return new Promise((resolve,reject)=>{
 if(!validUrl.test(endpoint))return reject(Error('Customer Apps Script URL is invalid'));
 const cb='shopStudioTrack_'+randomHex(12),s=document.createElement('script');let done=false;
 const timeout=setTimeout(()=>finish(Error('Apps Script '+action+' timed out')),20000);
 function finish(err,val){if(done)return;done=true;clearTimeout(timeout);delete window[cb];s.remove();err?reject(err):resolve(val)}
 window[cb]=data=>data&&data.ok?finish(null,data.job||data):finish(Error(data&&data.error||'Backend rejected '+action));
 s.onerror=()=>finish(Error('Cannot access Apps Script '+action+' endpoint'));
 const p=new URLSearchParams({action,callback:cb});if(id)p.set('id',id);if(secret)p.set('secret',secret);
 s.src=endpoint+'?'+p.toString();document.head.append(s);
})}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function submit(job){
 await get('health');
 const ticket={id:'SP-'+randomHex(12).toUpperCase(),secret:randomHex(32),name:job.name,created:new Date().toISOString()};
 remember(ticket);
 const body=JSON.stringify({action:'customerCreate',id:ticket.id,trackingSecret:ticket.secret,job});
 let postError='';
 try{
   // Apps Script does not provide CORS-readable POST responses; confirmation is via GET.
   await fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=UTF-8'},body,cache:'no-store'});
 }catch(e){postError=String(e&&e.message||e)}
 let last='';
 for(let n=0;n<8;n++){
   await sleep(n===0?1700:3000);
   try{const state=await get('track',ticket.id,ticket.secret);forget(ticket.id);return {...ticket,status:state.status}}
   catch(e){last=String(e&&e.message||e)}
 }
 throw Error('Upload unconfirmed for '+ticket.id+'. '+last+(postError?' POST error: '+postError:'')+'. Check Upload_Diagnostics and Print_Jobs before retrying.');
}
async function recheck(){const results=[];for(const t of pending()){try{const s=await get('track',t.id,t.secret);forget(t.id);results.push({...t,status:s.status,confirmed:true})}catch(e){results.push({...t,confirmed:false,error:String(e.message||e)})}}return results}
window.ShopStudioCustomerAPI={submit,track:(id,secret)=>get('track',id,secret),health:()=>get('health'),pending,forget,recheck};
})();
