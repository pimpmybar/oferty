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

  function track(ev, detail){
    if (owner || O.noPing) return;
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
