/* GitHub navigation only; no blocked Apps Script iframe. */
(()=>{
 const input=document.getElementById('qrScriptUrl');
 const key='shopstudio_qr_script_url';
 const defaultUrl='https://script.google.com/macros/s/AKfycbzKNYkCnIX7JamFiDF_Ipk7ymmO3fMgwmt7rXeFnCOqEj-IFQ-DBE_xyrttk55mTjiswQ/exec';
 if(input)input.value=localStorage.getItem(key)||defaultUrl;
 document.getElementById('qrSaveUrl')?.addEventListener('click',()=>{
   const v=(input?.value||'').trim();
   if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(v)){alert('Enter a valid Apps Script deployment /exec URL.');return;}
   localStorage.setItem(key,v);alert('Saved locally. For the GitHub pages also update shopstudio-config.js when your deployment URL changes.');
 });
 document.getElementById('qrOpenOwner')?.addEventListener('click',()=>{const f=document.getElementById('qrOwnerFrame');if(f){f.scrollIntoView({behavior:'smooth',block:'start'});f.focus();}else location.href=new URL('Owner.html',location.href).href;});
 document.getElementById('qrOpenCustomer')?.addEventListener('click',()=>window.open(new URL('Customer.html',location.href).href,'_blank','noopener'));
})();
