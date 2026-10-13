import base64,json,time,os,subprocess,tempfile,pathlib,urllib.request,urllib.parse,sys
ROOT=pathlib.Path(__file__).resolve().parent
cfg=json.loads((ROOT/'config.json').read_text(encoding='utf-8'))
def request(action,**fields):
 data=json.dumps({'action':action,'secret':cfg['agent_secret'],**fields}).encode()
 req=urllib.request.Request(cfg['apps_script_url'],data=data,headers={'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=90) as response:return json.loads(response.read())
def validate_config():
 required=['apps_script_url','agent_secret','color_printer','bw_printer','sumatra_pdf_path']
 missing=[k for k in required if not cfg.get(k)]
 if missing:raise RuntimeError('Missing config.json keys: '+', '.join(missing))
 if not pathlib.Path(cfg['sumatra_pdf_path']).is_file():raise RuntimeError('SumatraPDF not found: '+cfg['sumatra_pdf_path'])
 if cfg.get('dry_run',True):raise RuntimeError('Agent stopped: dry_run is enabled. No jobs will be claimed. Connect and test printers before disabling dry_run.')
 if os.name=='nt':
  try:
   import win32print
   installed={p[2] for p in win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL|win32print.PRINTER_ENUM_CONNECTIONS)}
   for key in ('color_printer','bw_printer'):
    if cfg[key] not in installed:raise RuntimeError('Printer not installed: '+cfg[key])
  except ImportError:print('Optional pywin32 unavailable: verify Windows printer names manually.')
def run():
 validate_config()
 while True:
  try:
   response=request('claim')
   if not response.get('ok'):raise RuntimeError(response.get('error'))
   job=response.get('job')
   if job:
    ok=False;error=''
    try:
     if job['mime'] not in ('application/pdf','image/png','image/jpeg'):raise RuntimeError('Unsupported type')
     printer=cfg['color_printer'] if job['mode']=='COLOR' else cfg['bw_printer']
     suffix={'application/pdf':'.pdf','image/png':'.png','image/jpeg':'.jpg'}[job['mime']]
     with tempfile.TemporaryDirectory(prefix='shopstudio_') as folder:
      path=pathlib.Path(folder)/('job'+suffix);path.write_bytes(base64.b64decode(job['data']))
      # Explicit operator confirmation is mandatory until a fully reliable spooler integration is validated.
      print('APPROVED JOB:',job['id'],'printer:',printer,'paper:',job['paper'],'copies:',job['copies'])
      if job['paper']!='A4':raise RuntimeError('Only A4 automatic printing is supported in this agent version')
      # SumatraPDF command line: supports PDF, PNG and JPG; printing depends on driver configuration.
      page_range=str(job.get('pageRange') or '').strip()
      if page_range and (job['mime']!='application/pdf' or not __import__('re').fullmatch(r'[1-9]\d*(?:-[1-9]\d*)?(?:\s*,\s*[1-9]\d*(?:-[1-9]\d*)?)*',page_range)):
       raise RuntimeError('Invalid PDF page range')
      for _ in range(int(job['copies'])):
       args=[cfg['sumatra_pdf_path'],'-print-to',printer]
       if page_range:args+=['-print-settings',page_range]
       args+=['-silent',str(path)]
       subprocess.run(args,check=True,timeout=120)
      ok=True
    except Exception as ex:error=str(ex);print('JOB FAILED:',error)
    result=request('result',id=job['id'],success=ok,error=error)
    print('REPORT:',result)
  except Exception as ex:print('Agent error:',ex)
  time.sleep(max(10,int(cfg.get('poll_seconds',20))))
if __name__=='__main__':run()
