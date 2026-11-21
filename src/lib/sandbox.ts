// Runs learners' and AI-made pages safely. Every page runs in an <iframe sandbox="allow-scripts ..."> WITHOUT
// allow-same-origin, so it gets a throw-away origin: it cannot read CDM Studio's sign-in, storage or cookies.
// A small helper is added to each page: it reports JavaScript errors to the app ("Fix with AI") and, in lessons,
// runs the lesson's checks inside the page and posts the results back.

export const SANDBOX = 'allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-pointer-lock'

export type CheckResult = { label: string; ok: boolean; error?: string }

const HELPER = (nonce: string) => `<script>(function(){
  var N=${JSON.stringify(nonce)};
  function post(m){ try{ m.cdm=N; parent.postMessage(m,'*') }catch(e){} }
  window.addEventListener('error',function(e){ post({type:'error',message:String(e.message||'Error'),line:e.lineno||0}) });
  window.addEventListener('unhandledrejection',function(e){ post({type:'error',message:String((e.reason&&e.reason.message)||e.reason||'Promise error'),line:0}) });
  // studio.api(name, {url, method, headers, body}): CDM Studio makes the call with the project's secret key (never in the page)
  var calls={},seq=0;
  window.studio={api:function(name,o){o=o||{};var id=++seq;return new Promise(function(res){calls[id]=res;post({type:'api',id:id,name:String(name),url:String(o.url||''),method:o.method||'GET',headers:o.headers||null,body:o.body===undefined?null:o.body});setTimeout(function(){if(calls[id]){delete calls[id];res({ok:false,error:'The API took too long to answer.'})}},20000)})}};
  var AF=Object.getPrototypeOf(async function(){}).constructor;
  window.addEventListener('message',async function(e){
    var d=e.data; if(!d||d.cdm!==N) return;
    if(d.type==='api-result'){ var r=calls[d.id]; if(r){ delete calls[d.id]; r(d.result) } return }
    if(d.type!=='run-checks') return;
    // Python and SQL lessons load their engine first (window.__ready); the engine's load time does not count against a check
    if(window.__ready){ try{ await window.__ready }catch(err){} }
    var out=[];
    for (var i=0;i<d.checks.length;i++){
      var c=d.checks[i];
      try{
        var r=await Promise.race([new AF(c.test)(), new Promise(function(_,no){ setTimeout(function(){ no(new Error('took too long')) }, 5000) })]);
        out.push({label:c.label,ok:r===true});
      }catch(err){ out.push({label:c.label,ok:false,error:String(err&&err.message||err)}) }
    }
    post({type:'checks',results:out});
  });
  window.addEventListener('load',function(){ post({type:'ready'}) });
})();<\/script>`

/** Wraps a page (a fragment or a full document) with the helper. */
export function buildDoc(html: string, nonce: string): string {
  const helper = HELPER(nonce)
  const src = String(html ?? '')
  if (/<html[\s>]/i.test(src) || /<!doctype/i.test(src)) {
    // full document: helper first thing in <head> so it sees every error
    if (/<head[^>]*>/i.test(src)) return src.replace(/<head[^>]*>/i, (m) => `${m}${helper}`)
    return src.replace(/<html[^>]*>/i, (m) => `${m}<head>${helper}</head>`)
  }
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${helper}<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:16px;line-height:1.5}</style></head><body>${src}</body></html>`
}

export const newNonce = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

/** Messages from one sandboxed frame only (checked against its window and nonce). */
export function listen(frame: () => HTMLIFrameElement | null, nonce: () => string, on: (m: { type: string; [k: string]: unknown }) => void) {
  const h = (e: MessageEvent) => {
    const f = frame()
    if (!f || e.source !== f.contentWindow) return
    const d = e.data
    if (!d || typeof d !== 'object' || d.cdm !== nonce() || typeof d.type !== 'string') return
    on(d)
  }
  window.addEventListener('message', h)
  return () => window.removeEventListener('message', h)
}

export function runChecks(f: HTMLIFrameElement | null, nonce: string, checks: { label: string; test: string }[]) {
  f?.contentWindow?.postMessage({ cdm: nonce, type: 'run-checks', checks }, '*')
}

/** A short, safe version of an error for showing and sending to the AI. */
export const cleanError = (m: unknown) => String(m ?? '').replace(/\s+/g, ' ').slice(0, 300)

export type ApiRequest = { id: number; name: string; url: string; method: string; headers: Record<string, string> | null; body: unknown }
/** Answers a page's studio.api call (the app makes it through the studio-proxy function). */
export function answerApi(f: HTMLIFrameElement | null, nonce: string, id: number, result: unknown) {
  f?.contentWindow?.postMessage({ cdm: nonce, type: 'api-result', id, result }, '*')
}
