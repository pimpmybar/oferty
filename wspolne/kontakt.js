/* Pimp My Bar – wspólny moduł ofert: alarm „gorący klient” + dymek kontaktowy.
   Działa na każdej ofercie. Silniki (wesele/offer.js, event/event.js) dołączają go same;
   strony samodzielne ustawiają window.PMB = {id, title, ty} i dodają <script src="../wspolne/kontakt.js">.
   Właściciel (?ja) i tryb ?test nie wywołują powiadomień. */
(function(){
  if (window.__pmbKontakt) return; window.__pmbKontakt = 1;
  var O = window.OFFER || {}, C = window.PMB || {};
  var ID = String(C.id || O.id || location.pathname.split('/').filter(Boolean).pop() || 'oferta');
  var TITLE = C.title || O.title || document.title;
  var TY = !!(C.ty || O.ty);
  var TEL = '+48513916977', WA = '48513916977';
  var TOPIC = 'https://ntfy.sh/pmb-oferty-0d10ca967d';
  var SB = 'https://zqpqjgxtefzojhjglppb.supabase.co/rest/v1/offer_events', SBK = 'sb_publishable__bPrQF9K35vs8RbLdWBRXQ_VBVj2esQ';
  var TEST = /[?&]test(=|&|$)/.test(location.search), owner = false;
  try{ if (/[?&]ja(=|&|$)/.test(location.search)) localStorage.setItem('pmb_owner','1'); owner = !TEST && localStorage.getItem('pmb_owner')==='1'; }catch(e){}
  var DEV = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'telefon' : 'komputer';
  var SID = 'k'+Math.random().toString(36).slice(2,9)+Date.now().toString(36);

  // ── PostHog (nagrania sesji, lejki, kto otworzył którą ofertę) ──
  // Klucz projektu (phc_…) i host z PostHog → Settings → Project. Pusty klucz = PostHog wyłączony.
  var PH_KEY = 'PH_KEY_TUTAJ', PH_HOST = 'https://eu.i.posthog.com';
  var ph = null;
  if (PH_KEY && PH_KEY.indexOf('phc_') === 0 && !owner){
    try{
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init(PH_KEY, {api_host: PH_HOST, person_profiles: 'always', capture_pageview: true, capture_pageleave: true, session_recording: {maskAllInputs: false}, autocapture: true});
      posthog.register({oferta: (TEST?'TEST-':'')+ID, oferta_tytul: TITLE, urzadzenie: DEV, test: TEST});
      posthog.group('oferta', (TEST?'TEST-':'')+ID, {name: TITLE});
      ph = posthog;
    }catch(e){ ph = null; }
  }
  function phCapture(ev, detail){
    if (!ph) return;
    try{ ph.capture('oferta:'+String(ev).slice(0,40), {szczegoly: detail==null?null:String(detail).slice(0,300), sesja_pmb: SID}); }catch(e){}
  }
  // Silniki ofert (wesele/offer.js, event/event.js…) mają własne track() – dublują zdarzenia tutaj.
  window.__pmbTrack = phCapture;
  try{ (window.__pmbQ||[]).forEach(function(q){ phCapture(q[0], q[1]); }); window.__pmbQ = []; }catch(e){}

  function track(ev, detail){
    if (owner || O.noPing) return;
    phCapture(ev, detail);
    try{ fetch(SB, {method:'POST', keepalive:true, headers:{'apikey':SBK,'Authorization':'Bearer '+SBK,'Content-Type':'application/json','Prefer':'return=minimal'},
      body: JSON.stringify({offer:(TEST?'TEST-':'')+ID.slice(0,75), session:SID, event:String(ev).slice(0,40), detail: detail==null?null:String(detail).slice(0,300), device:DEV, lang:document.documentElement.lang||'pl'})}).catch(function(){}); }catch(e){}
  }
  function ping(msg, tags, prio){
    if (owner || O.noPing) return;
    track(tags||'eyes', msg);
    if (TEST) return;
    try{ fetch(TOPIC+'?title='+encodeURIComponent(TITLE)+'&tags='+encodeURIComponent(tags||'eyes')+(prio?'&priority='+prio:''), {method:'POST', body:msg, keepalive:true}).catch(function(){}); }catch(e){}
  }

  // ── Licznik wizyt (nowa wizyta = nowa karta/sesja przeglądarki) ──
  var visit = 1, newSession = true;
  try{
    newSession = !sessionStorage.getItem('pmb_k_'+ID); sessionStorage.setItem('pmb_k_'+ID,'1');
    visit = +(localStorage.getItem('pmb_v_'+ID)||0); if (newSession){ visit++; localStorage.setItem('pmb_v_'+ID, String(visit)); }
    visit = Math.max(visit,1);
  }catch(e){}
  if (newSession){
    track('wizyta', String(visit));
    if (visit >= 2) ping('🔥 Wrócił do oferty – '+visit+'. wizyta ('+DEV+'). Dobry moment, żeby zadzwonić.','fire',5);
  }

  // ── Czas na stronie (liczony tylko gdy karta jest widoczna) ──
  var active = 0, tick = setInterval(function(){
    if (document.visibilityState !== 'visible') return;
    active += 5;
    if (active === 180) ping('⏱ Czyta ofertę już 3 minuty ('+DEV+')','hourglass',4);
    if (active === 480){ ping('⏱ Siedzi w ofercie 8 minut – mocno zainteresowany','fire',5); clearInterval(tick); }
  }, 5000);
  if (!window.OFFER){
    document.addEventListener('visibilitychange', function(){ if (document.visibilityState==='hidden' && active >= 10) track('time', active+' s'); });
  }

  // ── Ostatni wybór klienta (wariant, ilości, menu, dodatki) → offer_events 'wybor' / 'akceptacja' ──
  // Źródło prawdy: element z podsumowaniem, który silniki i strony samodzielne i tak przeliczają na żywo.
  (function(){
    var lastSent = '', timer = null, tries = 0;
    function node(){ return document.getElementById('choice-text') || document.getElementById('choice'); }
    function text(){ var n = node(); if (!n) return ''; var t = (n.innerText || n.textContent || '').replace(/\s+/g,' ').trim(); return t.slice(0, 300); }
    function send(ev){ var t = text(); if (!t) return; if (ev === 'wybor' && t === lastSent) return; lastSent = t; track(ev, t); }
    function arm(){
      var n = node();
      if (!n){ if (tries++ < 20) setTimeout(arm, 500); return; }
      send('wybor'); // stan startowy (domyślny wariant) – żeby w CRM zawsze był jakiś wybór
      if ('MutationObserver' in window){
        new MutationObserver(function(){ clearTimeout(timer); timer = setTimeout(function(){ send('wybor'); }, 1500); }).observe(n, {childList:true, subtree:true, characterData:true});
      }
      document.addEventListener('click', function(e){
        var a = e.target.closest && e.target.closest('[data-book], a[href="#akceptacja"], #send, a[href="#rezerwacja"]');
        if (a) setTimeout(function(){ send('akceptacja'); }, 50);
      }, true);
    }
    arm();
  })();

  // ── Dymek kontaktowy ──
  var T = TY
    ? {h:'Masz pytania?', p:'Napisz albo zadzwoń – odpowiem od razu.', wa:'WhatsApp', call:'Zadzwoń', msg:'Cześć Tomek, mam pytanie do oferty: '}
    : {h:'Mają Państwo pytania?', p:'Proszę napisać albo zadzwonić – odpowiem od razu.', wa:'WhatsApp', call:'Zadzwoń', msg:'Dzień dobry, mam pytanie do oferty: '};
  var shown = false;
  function bubble(why){
    if (shown) return; shown = true;
    try{ if (sessionStorage.getItem('pmb_kx_'+ID)) return; }catch(e){}
    var img = (O.assets || '../wesele/assets/') + 'tomek.jpg';
    var css = document.createElement('style');
    css.textContent = '.pmbk{position:fixed;right:16px;bottom:'+(document.querySelector('.bar')?'92px':'20px')+';z-index:60;width:min(320px,calc(100vw - 32px));background:#fff;color:#1c1714;border:1px solid #e6e0da;border-radius:18px;box-shadow:0 18px 40px -18px rgba(28,23,20,.45);padding:14px 14px 12px;font:15px/1.4 "Instrument Sans",system-ui,sans-serif;transform:translateY(16px);opacity:0;transition:transform .35s cubic-bezier(.2,.8,.2,1),opacity .35s}'
      + '.pmbk.on{transform:none;opacity:1}.pmbk .r{display:flex;gap:12px;align-items:center}.pmbk img{width:52px;height:52px;border-radius:50%;object-fit:cover;flex:none}'
      + '.pmbk b{display:block;font-size:16px}.pmbk small{display:block;color:#5f5650;font-size:13.5px}.pmbk .x{position:absolute;top:6px;right:8px;border:0;background:none;font-size:20px;line-height:1;color:#8d847d;cursor:pointer;padding:4px}'
      + '.pmbk .a{display:flex;gap:8px;margin-top:12px}.pmbk .a a{flex:1;text-align:center;text-decoration:none;font-weight:600;font-size:14.5px;padding:10px 8px;border-radius:999px}'
      + '.pmbk .w{background:#a3591b;color:#fff}.pmbk .t{background:#f2efeb;color:#1c1714}@media (prefers-reduced-motion:reduce){.pmbk{transition:none}}';
    document.head.appendChild(css);
    var d = document.createElement('div'); d.className = 'pmbk'; d.setAttribute('role','dialog'); d.setAttribute('aria-label', T.h);
    d.innerHTML = '<button class="x" type="button" aria-label="Zamknij">×</button><div class="r"><img src="'+img+'" alt="Tomasz Malinowski"><div><b>'+T.h+'</b><small>'+T.p+'</small></div></div>'
      + '<div class="a"><a class="w" target="_blank" rel="noopener" href="https://wa.me/'+WA+'?text='+encodeURIComponent(T.msg+TITLE.replace(/\s*\(.*\)\s*$/,''))+'">'+T.wa+'</a><a class="t" href="tel:'+TEL+'">'+T.call+'</a></div>';
    document.body.appendChild(d);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ d.classList.add('on'); }); });
    track('dymek', why);
    d.querySelector('.x').addEventListener('click', function(){ d.remove(); try{ sessionStorage.setItem('pmb_kx_'+ID,'1'); }catch(e){} track('dymek_zamkniety', why); });
    d.querySelector('.w').addEventListener('click', function(){ ping('💬 Kliknął WhatsApp w dymku – zaraz napisze','speech_balloon',5); });
    d.querySelector('.t').addEventListener('click', function(){ ping('📞 Kliknął „Zadzwoń” w dymku – odbierz telefon!','telephone_receiver',5); });
  }
  // przy powrocie: po 12 s; przy pierwszej wizycie: po 2 min aktywnego czytania
  if (visit >= 2) setTimeout(function(){ bubble('powrót'); }, 12000);
  else { var w = setInterval(function(){ if (active >= 120){ clearInterval(w); bubble('2 min czytania'); } }, 5000); }
})();
