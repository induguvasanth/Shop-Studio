const CONFIGURED_SHEET_ID='1RQlR7s9ZpFh_q3UcWWw5_Vko8kSV32RIMHzKVW-9Wc0';

const HEADERS=['job_id','created_at','customer_name','original_filename','mime_type','drive_file_id','paper_size','print_mode','copies','status','tracking_hash','approved_at','claimed_at','printed_at','last_error'];

const ALLOWED={'application/pdf':'.pdf','image/jpeg':'.jpg','image/png':'.png'};

function prop(k){return PropertiesService.getScriptProperties().getProperty(k);}

function setup(){const p=PropertiesService.getScriptProperties();if(!prop('SHEET_ID')){p.setProperty('SHEET_ID',CONFIGURED_SHEET_ID);}const ss=SpreadsheetApp.openById(prop('SHEET_ID'));let sh=ss.getSheetByName('Print_Jobs');if(!sh){sh=ss.insertSheet('Print_Jobs');}if(sh.getLastRow()===0){sh.appendRow(HEADERS);}else if(sh.getRange(1,1,1,HEADERS.length).getValues()[0].join('|')!==HEADERS.join('|')){throw Error('Existing Print_Jobs headers differ from project schema. Do not overwrite: inspect sheet first.');}if(!prop('FOLDER_ID')){p.setProperty('FOLDER_ID',DriveApp.createFolder('Shop Studio QR Private Uploads').getId());}Logger.log('Sheet: https\://docs.google.com/spreadsheets/d/'+prop('SHEET_ID')+'/edit');Logger.log('Drive folder ID: '+prop('FOLDER_ID'));}

// Credentials belong in Project Settings > Script Properties, never in source code.

// Required: SHEET_ID, FOLDER_ID, AGENT_SECRET, OWNER_EMAIL (for ownerSession).

function checkConfiguration(){

 const keys=['SHEET_ID','FOLDER_ID','AGENT_SECRET','OWNER_EMAIL'];

 const missing=keys.filter(k=>!prop(k));

 Logger.log(missing.length?'Missing properties: '+missing.join(', '):'All required properties are configured.');

 return {ok:missing.length===0,missing:missing};

}

// Kept for compatibility with older setup instructions. Never overwrites credentials.

function setSecretsOnce(){return checkConfiguration();}

function sha(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s).map(x=>('0'+(x&255).toString(16)).slice(-2)).join('');}

function sheet(){if(!prop('SHEET_ID'))throw Error('Run setup first');return SpreadsheetApp.openById(prop('SHEET_ID')).getSheetByName('Print_Jobs');}

function doGet(e){

 const q=(e&&e.parameter)||{};

 if(q.action==='health'&&q.callback){

   const cb=String(q.callback||'');

   if(!/^shopStudioTrack_[A-Za-z0-9_]{8,90}$/.test(cb))return ContentService.createTextOutput('/* Invalid callback */').setMimeType(ContentService.MimeType.JAVASCRIPT);

   let response;

   try{const sh=sheet();const folder=DriveApp.getFolderById(prop('FOLDER_ID'));response={ok:true,service:'Shop Studio',version:'2026-10-12-diagnostics',sheet:!!sh,folder:!!folder};}

   catch(err){response={ok:false,error:'Backend configuration error: '+String(err.message||err)};}

   return ContentService.createTextOutput(cb+'('+JSON.stringify(response).replace(/</g,'\\\u003c')+');').setMimeType(ContentService.MimeType.JAVASCRIPT);

 }

 if(q.action==='track'&&q.callback){

   // JSONP is read-only; random tracking secrets protect access to individual statuses.

   const cb=String(q.callback||'');

   if(!/^shopStudioTrack_[A-Za-z0-9_]{8,90}$/.test(cb))return ContentService.createTextOutput('/* Invalid callback */').setMimeType(ContentService.MimeType.JAVASCRIPT);

   let response;

   try{response={ok:true,job:track(String(q.id||''),String(q.secret||''))};}

   catch(err){response={ok:false,error:String(err.message||err)};}

   return ContentService.createTextOutput(cb+'('+JSON.stringify(response).replace(/</g,'\\\u003c')+');').setMimeType(ContentService.MimeType.JAVASCRIPT);

 }

 if(q.page==='owner')return HtmlService.createHtmlOutputFromFile('OwnerConsole').setTitle('Shop Studio Owner');

 if(q.page==='bridge'){

   const t=HtmlService.createTemplateFromFile('Bridge');

   t.nonce=String(q.nonce||'');t.parentOrigin=String(q.parentOrigin||'');

   return t.evaluate().setTitle('Shop Studio Bridge').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

 }

 return HtmlService.createHtmlOutput('Shop Studio backend is running. Open the Customer or Owner page on GitHub Pages.');

}

function clean(v,n){return String(v||'').replace(/[<>\r\n]/g,' ').slice(0,n);}

function createJob(o){if(!o||!o.data||!ALLOWED[o.mime])throw Error('Only PDF, JPG and PNG accepted');const bytes=Utilities.base64Decode(o.data);if(bytes.length>4*1024*1024||bytes.length<1)throw Error('File must be between 1 byte and 4 MB');const h=bytes.slice(0,8).map(x=>x&255);const pdf=h.slice(0,5).map(x=>String.fromCharCode(x)).join('')==='%PDF-';const jpg=h[0]===255&&h[1]===216;const png=h.slice(0,4).join(',')==='137,80,78,71';if(!(o.mime==='application/pdf'&&pdf||o.mime==='image/jpeg'&&jpg||o.mime==='image/png'&&png))throw Error('File signature does not match type');const copies=Number(o.copies);if(!Number.isInteger(copies)||copies<1||copies>30)throw Error('Copies must be 1–30');if(!['A4','A5','LETTER'].includes(o.paper)||!['BW','COLOR'].includes(o.mode))throw Error('Invalid settings');const lock=LockService.getScriptLock();lock.waitLock(20000);try{const id='SP-'+Utilities.getUuid().slice(0,8).toUpperCase();const secret=Utilities.getUuid()+Utilities.getUuid();const filename=clean(o.name,90)||'document';const file=DriveApp.getFolderById(prop('FOLDER_ID')).createFile(Utilities.newBlob(bytes,o.mime,id+'-'+filename));sheet().appendRow([id,new Date(),clean(o.customer,50),filename,o.mime,file.getId(),o.paper,o.mode,copies,'PENDING',sha(secret),'','','','']);return {id,secret};}finally{lock.releaseLock();}}

function track(id,secret){const rows=sheet().getDataRange().getValues();const row=rows.slice(1).find(r=>r[0]===id);if(!row||sha(String(secret||''))!==row[10])throw Error('Job not found or tracking code invalid');return {id:row[0],status:row[9]};}

function ownerLogin(password){if(!prop('OWNER_HASH')||sha(prop('OWNER_SALT')+String(password))!==prop('OWNER_HASH'))throw Error('Invalid password');const token=Utilities.getUuid()+Utilities.getUuid();CacheService.getScriptCache().put('owner_'+sha(token),'yes',1800);return token;}

function auth(token){if(!CacheService.getScriptCache().get('owner_'+sha(String(token||''))))throw Error('Session expired. Log in again.');}

function jobs(token){auth(token);return sheet().getDataRange().getValues().slice(1).reverse().slice(0,100).map(r=>({id:r[0],created:Utilities.formatDate(new Date(r[1]),Session.getScriptTimeZone(),'dd/MM/yy HH:mm'),name:r[2],file:r[3],paper:r[6],mode:r[7],copies:r[8],status:r[9]}));}

function changeStatus(token,id,status){auth(token);if(!['APPROVED','REJECTED'].includes(status))throw Error('Invalid status');const lock=LockService.getScriptLock();lock.waitLock(20000);try{const sh=sheet(),rows=sh.getDataRange().getValues();for(let i=1;i<rows.length;i++)if(rows[i][0]===id){if(rows[i][9]!=='PENDING')throw Error('Job already processed');sh.getRange(i+1,10).setValue(status);if(status==='APPROVED')sh.getRange(i+1,12).setValue(new Date());return true;}throw Error('Job not found');}finally{lock.releaseLock();}}

function preview(token,id){auth(token);const rows=sheet().getDataRange().getValues();const r=rows.slice(1).find(x=>x[0]===id);if(!r)throw Error('Job not found');const f=DriveApp.getFileById(r[5]);return {mime:r[4],data:Utilities.base64Encode(f.getBlob().getBytes())};}

function cleanupOldJobs(){const sh=sheet(),rows=sh.getDataRange().getValues();for(let i=1;i<rows.length;i++){const d=new Date(rows[i][1]);if(!isNaN(d)&&Date.now()-d.getTime()>24*3600000&&rows[i][5]){try{DriveApp.getFileById(rows[i][5]).setTrashed(true);sh.getRange(i+1,6).setValue('');}catch(e){Logger.log(e);}}}}

function doPost(e){

 try{

  const q=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');

  if(q.action==='customerCreate')return json(customerCreate(q));

  if(!prop('AGENT_SECRET')||q.secret!==prop('AGENT_SECRET'))throw Error('Unauthorized agent');

  if(q.action==='claim')return json(claim());

  if(q.action==='result')return json(result(q));

  throw Error('Unknown action');

 }catch(err){
    console.error('SHOP_STUDIO_POST_ERROR: '+String((err && err.stack) || err));
    return json({ok:false,error:String((err && err.message) || err)});
  }

}

// Customer submits with fetch(no-cors); its opaque response is NOT treated as success.

// Client confirms persistence separately with a read-only tracking JSONP request.

function customerCreate(q){

 const id=String(q.id||''),secret=String(q.trackingSecret||'');

 if(!/^SP-[A-F0-9]{24}$/.test(id)||! /^[a-f0-9]{64}$/.test(secret))throw Error('Invalid order identifiers');

 const o=q.job||{};

 if(!o.data||!ALLOWED[o.mime])throw Error('Only PDF, JPG and PNG accepted');

 const bytes=Utilities.base64Decode(o.data);

 if(bytes.length<1||bytes.length>4*1024*1024)throw Error('File must be 1 byte to 4 MB');

 const h=bytes.slice(0,8).map(x=>x&255),pdf=h.slice(0,5).map(x=>String.fromCharCode(x)).join('')==='%PDF-';

 const jpg=h[0]===255&&h[1]===216,png=h.slice(0,4).join(',')==='137,80,78,71';

 if(!((o.mime==='application/pdf'&&pdf)||(o.mime==='image/jpeg'&&jpg)||(o.mime==='image/png'&&png)))throw Error('File signature mismatch');

 const copies=Number(o.copies);

 if(!Number.isInteger(copies)||copies<1||copies>30)throw Error('Copies must be 1 to 30');

 if(!['A4','A5','LETTER'].includes(o.paper)||!['BW','COLOR'].includes(o.mode))throw Error('Invalid print settings');

 const lock=LockService.getScriptLock();lock.waitLock(20000);

 try{

  const sh=sheet(),rows=sh.getDataRange().getValues();

  const existing=rows.slice(1).find(r=>r[0]===id);

  if(existing){if(existing[10]!==sha(secret))throw Error('Order ID conflict');return {ok:true,id,existing:true};}

  const filename=clean(o.name,90)||'document';

  const file=DriveApp.getFolderById(prop('FOLDER_ID')).createFile(Utilities.newBlob(bytes,o.mime,id+'-'+filename));

  try{sh.appendRow([id,new Date(),clean(o.customer,50),filename,o.mime,file.getId(),o.paper,o.mode,copies,'PENDING',sha(secret),'','','','']);}

  catch(err){file.setTrashed(true);throw err;}

  if(o.pageRange){const range=String(o.pageRange).trim();if(!/^[1-9]\d*(?:-[1-9]\d*)?(?:\s*,\s*[1-9]\d*(?:-[1-9]\d*)?)*$/.test(range))throw Error('Invalid page range');sh.getRange(sh.getLastRow(),16).setValue(range.slice(0,80));}
  return {ok:true,id};

 }finally{lock.releaseLock();}

}

function json(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}

function claim(){const lock=LockService.getScriptLock();lock.waitLock(20000);try{const sh=sheet(),rows=sh.getDataRange().getValues();for(let i=1;i<rows.length;i++){const r=rows[i];if(r[9]!=='APPROVED')continue;const file=DriveApp.getFileById(r[5]);sh.getRange(i+1,10).setValue('CLAIMED');sh.getRange(i+1,13).setValue(new Date());return {ok:true,job:{id:r[0],name:r[3],mime:r[4],paper:r[6],mode:r[7],copies:r[8],pageRange:String(r[15]||''),data:Utilities.base64Encode(file.getBlob().getBytes())}};}return {ok:true,job:null};}finally{lock.releaseLock();}}

function result(q){const sh=sheet(),rows=sh.getDataRange().getValues();for(let i=1;i<rows.length;i++)if(rows[i][0]===q.id){if(rows[i][9]!=='CLAIMED')return {ok:false,error:'Not claimed'};sh.getRange(i+1,10).setValue(q.success?'SUBMITTED_TO_PRINTER':'PRINT_FAILED');if(q.success)sh.getRange(i+1,14).setValue(new Date());else sh.getRange(i+1,15).setValue(clean(q.error,200));return {ok:true};}return {ok:false,error:'Missing job'};}



// Passwordless owner access. Configure OWNER_EMAIL in Script Properties and deploy

// the owner interface with authenticated Google access. Public anonymous deployment

// may not expose Session.getActiveUser().getEmail(); this intentionally fails closed.

function ownerSession(){const allowed=String(prop('OWNER_EMAIL')||'').trim().toLowerCase();const email=String(Session.getActiveUser().getEmail()||'').trim().toLowerCase();if(!allowed||!email||email!==allowed)throw Error('Owner access denied. Set OWNER_EMAIL and use an authenticated owner deployment (execute as accessing user).');const token=Utilities.getUuid()+Utilities.getUuid();CacheService.getScriptCache().put('owner_'+sha(token),'yes',1800);return token;}

function replacePendingImage(token,id,data,mime){auth(token);if(!['image/png','image/jpeg'].includes(mime))throw Error('Image only');const bytes=Utilities.base64Decode(data||'');if(!bytes.length||bytes.length>4*1024*1024)throw Error('Image must be less than 4 MB');const ok=mime==='image/png'&&(bytes[0]&255)===137&&(bytes[1]&255)===80||mime==='image/jpeg'&&(bytes[0]&255)===255&&(bytes[1]&255)===216;if(!ok)throw Error('Invalid image');const lock=LockService.getScriptLock();lock.waitLock(20000);try{const sh=sheet(),rows=sh.getDataRange().getValues();for(let i=1;i<rows.length;i++){const r=rows[i];if(r[0]!==id)continue;if(r[9]!=='PENDING')throw Error('Only pending jobs may be edited');if(!['image/png','image/jpeg'].includes(r[4]))throw Error('PDF editing is not supported here');const file=DriveApp.getFolderById(prop('FOLDER_ID')).createFile(Utilities.newBlob(bytes,mime,id+'-edited.png'));sh.getRange(i+1,5).setValue(mime);sh.getRange(i+1,6).setValue(file.getId());try{DriveApp.getFileById(r[5]).setTrashed(true)}catch(e){}return true;}throw Error('Job not found')}finally{lock.releaseLock();}}

// Optional page range column P. Call once in Apps Script editor before using page ranges.
function shopStudioEnsurePageRange(){const sh=sheet();if(!sh.getRange(1,16).getValue())sh.getRange(1,16).setValue('page_range');}
