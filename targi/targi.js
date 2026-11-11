/* Pimp My Bar – oferta targowa v2: coffee bar na stoisku, wiele dni, cena każdego dnia i suma.
   Dane oferty: window.OFFER w index.html danej oferty. Silnik nie zna klienta – dni, stawki, limit kaw,
   dodatki, teksty i formularz umowy to konfiguracja. Nowa oferta = nowy folder z index.html i blokiem window.OFFER.
   Analityka jak w silniku weselnym: offer_events (Supabase, tylko zapis) + ntfy; ?ja = właściciel, ?test = bez alertów. */
(function(){
  var O = window.OFFER; if (!O || !O.days || !O.rates) return;
  var T = O.t || {}, M = O.media || '../expo-real-lds/assets/', C = O.coffee || {per100:200, options:[100,150,200], def:100};
  var $ = function(id){ return document.getElementById(id); };
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function nf(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function zl(n){ return nf(n) + ' zł'; }
  function plain(s){ return String(s).replace(/ /g, ' '); }
  function dni(n){ return n === 1 ? 'dzień' : 'dni'; }
  function mins(t){ var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function hhmm(m){ return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
  function fill(s){ return String(s == null ? '' : s).replace(/\{([a-zA-Z0-9]+)\}/g, '<span data-v="$1"></span>'); }

  // ── Dni i terminy (bloki) ──
  var WD = ['nd','pn','wt','śr','czw','pt','sob'];
  var DAYS = O.days.map(function(x, i){
    var p = x.d.split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    return { i:i, iso:x.d, day:+p[2], mm:p[1], yy:p[0], dm:(+p[2]) + '.' + p[1], full:(+p[2]) + '.' + p[1] + '.' + p[0], wd:WD[dt.getDay()], from:x.from, to:x.to, b:x.b || 1 };
  });
  var BLOCKS = [];
  DAYS.forEach(function(d){ var b = BLOCKS.filter(function(x){ return x.id === d.b; })[0]; if (!b){ b = {id:d.b, days:[]}; BLOCKS.push(b); } b.days.push(d); });
  BLOCKS.forEach(function(b){
    var a = b.days[0], z = b.days[b.days.length - 1];
    b.range = a === z ? a.dm : (a.mm === z.mm ? a.day + '–' + z.day + '.' + z.mm : a.dm + '–' + z.dm);
    b.wd = a === z ? a.wd : a.wd + '–' + z.wd;
  });

  // ── Cennik: stawka dzienna obsługi zależy od liczby dni (O.rates = [[od ilu dni, zł za dzień], …]) ──
  var RATES = O.rates.slice().sort(function(a, b){ return a[0] - b[0]; });
  function rate(n){ var r = RATES[0][1]; RATES.forEach(function(x){ if (n >= x[0]) r = x[1]; }); return r; }
  function tierOf(n){ var k = 0; RATES.forEach(function(x, i){ if (n >= x[0]) k = i; }); return k; }
  function tierLabel(i){ var a = RATES[i][0], z = RATES[i + 1] ? RATES[i + 1][0] - 1 : DAYS.length; return (a === z ? a + ' ' + dni(a) : a + '–' + z + ' dni') + ' · ' + zl(RATES[i][1]); }

  var S = { on: DAYS.map(function(){ return true; }), limit: C.def, brand: false, cups: false, lids: false };
  // Nakład kubków i pokrywek idzie za liczbą kaw: limit dzienny × dni, w górę do pełnej paczki (np. 1 000 szt.).
  function pack(lim, n, per){ return Math.max(per, Math.ceil(lim * n / per) * per); }
  function calc(lim){
    var L = lim || S.limit;
    var sel = DAYS.filter(function(d){ return S.on[d.i]; }), n = sel.length, r = rate(n), top = RATES[0][1];
    var svc = n * r, cofDay = L / 100 * C.per100, cof = n * cofDay;
    var brand = S.brand && O.brand ? O.brand.price : 0;
    var cupsQty = O.cups ? pack(L, n, O.cups.per) : 0, lidsQty = O.lids ? pack(L, n, O.lids.per) : 0;
    var cups = S.cups && O.cups ? O.cups.price * cupsQty / O.cups.per : 0;
    var lids = S.lids && O.lids ? O.lids.price * lidsQty / O.lids.per : 0;
    var total = svc + cof + brand + cups + lids;
    var dep = O.deposit ? Math.min(O.deposit, Math.round(total * 0.3 / 100) * 100) : 0;
    return { sel:sel, n:n, rate:r, svc:svc, cofDay:cofDay, cof:cof, brand:brand, cups:cups, cupsQty:cupsQty, lids:lids, lidsQty:lidsQty, total:total, perDay:r + cofDay, save:n * (top - r), dep:dep, daysTotal:svc + cof };
  }
  function datesShort(sel){
    var by = {}, ord = [];
    sel.forEach(function(d){ var k = d.mm + '.' + d.yy; if (!by[k]){ by[k] = []; ord.push(k); } by[k].push(d.day); });
    return ord.map(function(k){ return by[k].join(', ') + '.' + k; }).join(' i ');
  }

  // ── Budowa strony ──
  function li(arr){ return (arr || []).map(function(x){ return '<li><span>' + x + '</span></li>'; }).join(''); }
  function build(){
    var h = '';
    h += '<div class="ownerbar">Podgląd właściciela: żółte pola są do potwierdzenia. Klient ich nie widzi, a z tej przeglądarki nie idą powiadomienia.</div>';
    h += '<div class="wrap">';
    h += '<div class="printhead"><b>Pimp My Bar / Coffee</b><span>' + esc(T.offerFor) + ' · nr ' + esc(O.nr) + ' · przygotowana ' + esc(O.prepared) + ' · ważna do ' + esc(O.validUntil) + '</span></div>';
    h += '<header class="top"><a class="brand" href="https://www.pimpmybar.pl" target="_blank" rel="noopener">Pimp My Bar <span>/ Coffee</span></a><div class="label">' + esc(T.offerFor) + '<br>nr ' + esc(O.nr) + '</div></header>';
    h += '<div class="hero"><div class="hero-copy"><div class="label">' + esc(T.kicker) + '</div><h1>' + T.h1 + '</h1><p class="lead">' + T.lead + '</p>';
    h += '<dl class="facts">' + (T.facts || []).map(function(f){ return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>';
    h += '<div class="price-peek"><div class="big num" id="peek"></div><a class="btn" href="#wycena">Zobacz wycenę ↓</a></div></div>';
    h += '<div class="reel" aria-label="Film z naszych realizacji: targi, kawa i koktajle"><video id="reel-v" src="' + (O.heroVideo || M + 'hero.mp4') + '" poster="' + (O.heroPoster || M + 'poster.jpg') + '" autoplay muted loop playsinline preload="auto"></video><div class="ticker" aria-live="off"><span class="label">Pimp My Bar · Coffee</span><span class="line" id="tick"></span></div></div></div></div>';

    // 1. Odpowiedź na zapytanie – każdy punkt z maila i liczba obok
    h += '<section id="odpowiedz"><div class="wrap"><div class="ans"><div class="ans-head"><h2>' + esc(T.ansH) + '</h2>' + (T.ansOk ? '<span class="okchip">✓ ' + esc(T.ansOk) + '</span>' : '') + '</div><dl>';
    (T.answers || []).forEach(function(a){ h += '<div><dt>' + esc(a.q) + '</dt><dd>' + fill(a.a) + '</dd></div>'; });
    h += '</dl><div class="ans-foot"><a class="btn" href="#akceptacja">' + esc(T.bookShort || 'Rezerwuję terminy') + ' ↓</a><button class="btn ghost" type="button" data-print>Wersja do druku (PDF)</button><span class="valid">Oferta ważna do <b>' + esc(O.validUntil) + '</b></span></div></div></div></section>';

    // 2. Wycena: tabela dni, stawki, limit kaw, dodatki, suma
    h += '<section id="wycena"><div class="wrap"><div class="sec-head"><h2>' + esc(T.priceH || 'Wycena') + '</h2><p>' + fill(T.priceP) + '</p></div><div class="pricing"><div>';
    h += '<div class="daytab">';
    BLOCKS.forEach(function(b, bi){
      h += '<div class="blk"><span class="label">Termin ' + (bi + 1) + '</span><span>' + b.range + ' · ' + b.wd + '</span></div>';
      b.days.forEach(function(d){
        h += '<label class="dayrow" for="day-' + d.i + '"><input type="checkbox" id="day-' + d.i + '" data-day="' + d.i + '" checked><span class="dd">' + d.dm + ' <small>' + d.wd + '</small><span class="hh">' + d.from + '–' + d.to + '</span></span><span class="pp"><span id="pp-' + d.i + '"></span><small id="ps-' + d.i + '"></small></span></label>';
      });
    });
    h += '<div class="dsum"><span id="dsum-l"></span><b id="dsum-v"></b></div></div>';
    h += '<div class="tiers" id="tiers">' + RATES.map(function(r, i){ return '<span class="tier" data-tier="' + i + '">' + tierLabel(i) + '</span>'; }).join('') + '</div>';
    h += '<p class="hint np">' + fill(T.tiersP) + '</p>';
    h += '<div class="ctl"><span class="label">' + esc(T.limitL) + '</span><div class="seg' + (C.options.length === 3 ? ' s3' : '') + '" role="group" aria-label="' + esc(T.limitL) + '">' + C.options.map(function(v){ return '<button type="button" data-limit="' + v + '">do ' + v + ' kaw</button>'; }).join('') + '</div><p class="note" style="margin-top:0">' + fill(T.limitP) + '</p></div>';
    if (O.brand) h += '<div class="addon" id="brand-box"><input type="checkbox" id="brand"><div class="ab"><label for="brand"><strong>' + esc(T.brandH) + ', +\u00a0' + zl(O.brand.price) + '</strong><small>' + T.brandP + '</small></label></div></div>';
    if (O.cups) h += '<div class="addon" id="cups-box"><input type="checkbox" id="cups"><div class="ab"><label for="cups"><strong>' + esc(T.cupsOptH) + ', <span data-v="cupsQty"></span> szt., +\u00a0<span data-v="cupsSel"></span></strong><small>' + fill(T.cupsOptP) + '</small></label></div></div>';
    if (O.lids) h += '<div class="addon" id="lids-box"><input type="checkbox" id="lids"><div class="ab"><label for="lids"><strong>' + esc(T.lidsH || 'Pokrywki do kubków') + ', <span data-v="lidsQty"></span> szt., +\u00a0<span data-v="lidsSel"></span></strong><small>' + fill(T.lidsP || '') + '</small></label></div></div>';
    h += '</div><aside class="total" aria-live="polite"><span class="label" id="variant-name"></span><div class="sum" id="sum"></div><span class="sub" id="sum-sub"></span><hr><ul class="brk" id="brk"></ul><hr><ul class="terms">';
    h += (O.deposit ? '<li>Zaliczka <b id="dep"></b></li>' : '') + '<li>Reszta <b>' + esc(T.restTerm || 'faktura po ostatnim terminie') + '</b></li><li>Kawa <b>rozliczana za otwarte kg</b></li><li>Oferta ważna do <b>' + esc(O.validUntil) + '</b></li></ul>';
    h += '<a class="btn" href="#akceptacja">' + esc(T.bookShort || 'Rezerwuję terminy') + '</a><button class="btn ghost" type="button" data-print>Wersja do druku (PDF)</button></aside></div></div></section>';

    // 3. Co jest w cenie
    h += '<section id="zakres"><div class="wrap"><div class="sec-head"><h2>' + esc(T.inclH || 'Co jest w cenie') + '</h2><p>' + (T.inclP || '') + '</p></div><ul class="incl">' + li(T.incl) + '</ul></div></section>';

    // Film: showreel między zakresem a wymaganiami
    if (T.reel !== false){ var R = T.reel || {}; h += '<section id="film" class="noprint"><div class="wrap"><div class="showreel"><button type="button" class="srmedia" id="sr" aria-label="Odtwórz film"><video id="sr-v" src="' + (R.src || '../wesele/assets/showreel-loop.mp4') + '" poster="' + (R.poster || '../targi/showreel-poster.jpg') + '" preload="none" playsinline></video><span class="play"><span class="tri" aria-hidden="true"></span>' + esc(R.btn || 'Zobacz film · 76 s') + '</span></button><div class="srtext"><span class="label">' + esc(R.label || 'Showreel') + '</span><h3>' + esc(R.h || 'Targi, kawa i koktajle w 76 sekund') + '</h3><p>' + (R.p || 'Tak pracujemy na stoiskach i eventach firmowych: bar kawowy i koktajlowy, wszystko robione na żywo przy gościach.') + '</p></div></div></div></section>'; }
    // 4. Wymagania na stoisku: miejsce, prąd, woda, wjazd
    h += '<section id="wymagania"><div class="wrap"><div class="sec-head"><h2>' + esc(T.specH || 'Czego potrzebujemy na stoisku') + '</h2><p>' + (T.specP || '') + '</p></div><div class="kit"><img src="' + M + 'machine.jpg" alt="Ekspres kolbowy na barze kawowym" loading="lazy"><div><table class="spec">' + (T.spec || []).map(function(r){ return '<tr><th>' + esc(r[0]) + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>' + (T.specNote ? '<p class="note">' + T.specNote + '</p>' : '') + '</div></div></div></section>';

    // 5. Plan terminów
    h += '<section id="plan"><div class="wrap"><div class="sec-head"><h2>' + esc(T.planH || 'Plan terminów') + '</h2><p>' + (T.planP || '') + '</p></div><div class="days">';
    BLOCKS.forEach(function(b){
      var a = b.days[0], z = b.days[b.days.length - 1], rows = [[hhmm(mins(a.from) - 60), 'przyjazd, montaż baru, rozgrzanie ekspresu']];
      b.days.forEach(function(d, k){ rows.push([d.from.replace(':00', '') + '–' + d.to.replace(':00', ''), d.dm + ': serwis kawy' + (k < b.days.length - 1 ? ', bar zostaje na noc' : '')]); });
      rows.push([z.to, 'demontaż, ok. pół godziny']);
      h += '<div class="day fair"><div class="d">' + b.range + '<small>' + b.wd + '</small></div><ul>' + rows.map(function(r){ return '<li><time>' + r[0] + '</time>' + r[1] + '</li>'; }).join('') + '</ul></div>';
    });
    h += '</div></div></section>';

    // 6. Kubki z logo (opcja)
    if (O.cups){
      h += '<section id="kubki"><div class="wrap"><div class="sec-head"><h2>' + esc(T.cupsH) + '</h2><p>' + (T.cupsP || '') + '</p></div><div class="cups"><ul class="blist">' + (T.cupsList || []).map(function(x){ return '<li><span>' + fill(x) + '</span></li>'; }).join('') + '</ul>';
      h += '<div class="cupbox"><span class="label">Cena nadruku</span><div class="n num">' + zl(O.cups.price) + '<small>netto za ' + nf(O.cups.per) + ' szt.</small></div><p>' + (T.cupsBox || '') + '</p>' + (O.cups.template ? '<p><a class="btn ghost" id="cup-tpl" href="' + O.cups.template + '" download>Pobierz wykrojnik kubka (PDF)</a></p>' : '') + '</div></div></div></section>';
    }

    // 7. Kto przyjedzie
    h += '<section id="ekipa" class="noprint"><div class="wrap"><div class="sec-head"><h2>' + esc(T.teamH || 'Kto przyjedzie') + '</h2><p>' + (T.teamP || '') + '</p></div>';
    h += '<figure class="duo"><img src="' + M + 'team-photo.jpg" alt="Bar kawowy Pimp My Bar na stoisku targowym" loading="lazy"></figure><div class="team one">';
    (T.team || []).forEach(function(p){
      h += '<div class="person' + (p.img ? '' : ' plain') + '">' + (p.img ? '<img class="avatar" src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy">' : '') + '<div class="who"><span class="label">' + esc(p.role) + '</span><h3>' + esc(p.name) + '</h3><div class="chips">' + (p.chips || []).map(function(c, i){ return '<span class="chip' + (i ? '' : ' k') + '">' + esc(c) + '</span>'; }).join('') + '</div><p>' + p.bio + '</p></div></div>';
    });
    h += '</div></div></section>';

    // 8. Realizacje
    h += '<section id="realizacje" class="noprint"><div class="wrap"><div class="sec-head"><h2>' + esc(T.refsH || 'Z naszych realizacji') + '</h2><p>' + (T.refsP || '') + '</p></div>';
    h += '<div class="gallery">';
    h += '<figure class="g1"><img src="' + M + 'stand-wide.jpg" alt="Bar kawowy Pimp My Bar na stoisku targowym" loading="lazy"></figure><figure class="g2"><img src="' + M + 'stand-barista.jpg" alt="Baristka za barem" loading="lazy"></figure><figure class="g3"><img src="' + M + 'latte.jpg" alt="Cappuccino z latte art" loading="lazy"></figure><figure class="g4"><img src="' + M + 'bar-team.jpg" alt="Barista za drewnianym barem" loading="lazy"></figure><figure class="g5"><img src="' + M + 'cup-bar.jpg" alt="Filiżanka kawy na barze" loading="lazy"></figure></div>';
    if (T.film) h += '<div class="feature"><a class="fmedia" href="' + T.film.url + '" target="_blank" rel="noopener" aria-label="' + esc(T.film.h) + '"><img src="' + M + 'bar-wood.jpg" alt="Barista przy barze kawowym Pimp My Bar" loading="lazy" style="object-position:50% 40%"><span class="play"><span class="tri" aria-hidden="true"></span>Zobacz film</span></a><div class="ftext"><span class="label">' + esc(T.film.label) + '</span><h3>' + esc(T.film.h) + '</h3><p>' + T.film.p + '</p><a class="more" href="' + T.film.url + '" target="_blank" rel="noopener">Film na YouTube →</a></div></div>';
    h += '</div></section>';

    // 9. Pytania
    h += '<section id="pytania"><div class="wrap"><div class="sec-head"><h2>' + esc(T.faqH || 'Pytania, które zwykle padają') + '</h2><p>' + (T.faqP || 'Jeśli czegoś tu brakuje, wystarczy odpisać na maila.') + '</p></div><div class="faq">' + (T.faq || []).map(function(f){ return '<details><summary>' + esc(f[0]) + '</summary><p>' + fill(f[1]) + '</p></details>'; }).join('') + '</div></div></section>';

    // 10. Rezerwacja: formularz umowy z wpisanym wyborem
    h += '<section id="akceptacja"><div class="wrap"><div class="accept"><div style="display:flex;flex-direction:column;gap:14px"><h2>' + esc(T.accH || 'Rezerwujemy terminy') + '</h2><p>' + fill(T.accP) + '</p><ol class="steps">' + (T.steps || []).map(function(x){ return '<li>' + fill(x) + '</li>'; }).join('') + '</ol>';
    h += '<div class="choice"><span class="label">Wybrany wariant</span><span id="choice-text"></span></div><div class="acts">' + (O.form ? '<a class="btn" id="form-btn" data-book href="#" target="_blank" rel="noopener">' + esc(T.formBtn || 'Rezerwuję terminy – formularz umowy') + '</a>' : '') + '<a class="btn ghost" id="send" href="#">' + esc(T.sendAlt || 'Wyślij wybór mailem') + '</a></div><p class="fnote">' + (T.formNote || '') + '</p><p class="printonly">Oferta online z rezerwacją terminów: ' + esc(location.origin + location.pathname) + '</p></div>';
    h += '<div class="contact"><div class="crow"><span>Tomasz Malinowski</span></div><div class="crow"><span id="c-mail">biuro@pimpmybar.pl</span><button class="copy" type="button" data-copy="c-mail">Kopiuj</button></div><div class="crow"><span id="c-tel">+48 513 916 977</span><button class="copy" type="button" data-copy="c-tel">Kopiuj</button></div></div></div></div></section>';
    h += '<footer class="wrap"><span>Pimp My Bar · Poznań · pimpmybar.pl</span><span>Ceny netto w PLN, doliczamy 23% VAT. Przygotowane ' + esc(O.prepared) + '.</span></footer>';
    $('app').innerHTML = h;
    // zakresy typu 7–8.01 i 11:00–17:00 nie łamią się po myślniku
    var tw = document.createTreeWalker($('app'), NodeFilter.SHOW_TEXT, null), tn;
    while ((tn = tw.nextNode())) if (/\d–\d/.test(tn.nodeValue)) tn.nodeValue = tn.nodeValue.replace(/(\d)–(?=\d)/g, '$1–\u2060');
  }

  // ── Podsumowania: tekst wyboru, Załącznik nr 1 do formularza, mail ──
  function addons(c){ var a = []; if (c.brand) a.push('front baru z logo (' + zl(c.brand) + ')'); if (c.cups) a.push('kubki z logo ' + nf(c.cupsQty) + ' szt. (' + zl(c.cups) + ')'); if (c.lids) a.push('pokrywki ' + nf(c.lidsQty) + ' szt. (' + zl(c.lids) + ')'); return a; }
  function choice(c){
    return c.n + ' ' + dni(c.n) + ' (' + datesShort(c.sel) + ') · 1 barista + bar + ekspres · w wycenie ' + S.limit + ' kaw dziennie · ' + (addons(c).join(', ') || 'bez dodatków') + ' · ' + zl(c.total) + ' netto';
  }
  function annex(c){
    var L = ['ZAŁĄCZNIK NR 1 – wybór z oferty online (' + O.nr + ')', T.annexTitle || 'Coffee bar na stoisku targowym', 'Terminy (' + c.n + ' ' + dni(c.n) + '):'];
    c.sel.forEach(function(d){ L.push('- ' + d.full + ' (' + d.wd + ') ' + d.from + '–' + d.to); });
    L.push('Zakres: ' + (T.annexScope || '1 barista do 8 h dziennie, moduł barowy 125 cm, ekspres kolbowy, młynek, kawa, mleko, herbata, kubki; transport, montaż i demontaż w cenie.'));
    L.push('Kawa: w wycenie ' + S.limit + ' kaw dziennie (razem ' + nf(S.limit * c.n) + '); rozliczenie po ostatnim terminie za faktycznie otwarte kilogramy, 1 kg = ok. 100 kaw = ' + zl(C.per100) + ' netto.');
    L.push('Dodatki: ' + (addons(c).join(', ') || 'brak'));
    L.push('Cena: ' + zl(c.total) + ' netto + 23% VAT (obsługa ' + c.n + ' × ' + zl(c.rate) + ', kawa ' + zl(c.cof) + (c.brand + c.cups + c.lids ? ', dodatki ' + zl(c.brand + c.cups + c.lids) : '') + ')');
    if (c.dep) L.push('Zaliczka: ' + zl(c.dep) + ' netto, faktura proforma');
    L.push('Oferta: ' + location.origin + location.pathname);
    L.push('', 'Uwagi / zmiany: ');
    return plain(L.join('\n'));
  }
  function formUrl(c){
    var F = O.form, e = F.entries || {}, q = [], pre = F.prefill || {};
    function put(k, v){ if (e[k] && v !== undefined && v !== null && v !== '') q.push('entry.' + e[k] + '=' + encodeURIComponent(v)); }
    Object.keys(pre).forEach(function(k){ put(k, pre[k]); });
    var a = c.sel[0], z = c.sel[c.sel.length - 1];
    put('dateFrom', a.iso); put('dateTo', z.iso); put('days', c.n);
    put('timeFrom', hhmm(Math.min.apply(null, c.sel.map(function(d){ return mins(d.from); }))).replace(/^(\d):/, '0$1:'));
    put('timeTo', hhmm(Math.max.apply(null, c.sel.map(function(d){ return mins(d.to); }))).replace(/^(\d):/, '0$1:'));
    put('notes', annex(c));
    return F.url + (F.url.indexOf('?') > -1 ? '&' : '?') + 'usp=pp_url&' + q.join('&');
  }

  // ── Przeliczenie i odświeżenie liczb ──
  function paint(){
    var c = calc(), altL = C.options.filter(function(v){ return v !== S.limit; })[0], ca = altL ? calc(altL) : null, V = {
      n:c.n, dni:dni(c.n), nAll:DAYS.length, total:zl(c.total), perDay:zl(c.perDay), rate:zl(c.rate), svc:zl(c.svc), coffeeDay:zl(c.cofDay), coffee:zl(c.cof),
      limit:nf(S.limit), limitAll:nf(S.limit * c.n), per100:zl(C.per100), top:zl(RATES[0][1]), rateAll:zl(rate(DAYS.length)), save:zl(c.save),
      deposit:zl(O.deposit || 0), validUntil:O.validUntil, hoursIncl:O.hoursIncl || 8, extraHour:zl(O.extraHour || 200),
      cupsPrice:O.cups ? zl(O.cups.price) : '', cupsPer:O.cups ? nf(O.cups.per) : '', cupsDeadline:O.cups ? O.cups.deadline : '', cupsSel:O.cups ? zl(O.cups.price * c.cupsQty / O.cups.per) : '', cupsQty:nf(c.cupsQty), brandPrice:O.brand ? zl(O.brand.price) : '',
      lidsPrice:O.lids ? zl(O.lids.price) : '', lidsPer:O.lids ? nf(O.lids.per) : '', lidsQty:nf(c.lidsQty), lidsSel:O.lids ? zl(O.lids.price * c.lidsQty / O.lids.per) : '',
      limitAlt:altL ? nf(altL) : '', totalAlt:ca ? zl(ca.total) : '', perDayAlt:ca ? zl(ca.perDay) : ''
    };
    [].forEach.call(document.querySelectorAll('[data-v]'), function(n){ var k = n.getAttribute('data-v'); if (V[k] !== undefined) n.textContent = V[k]; });
    DAYS.forEach(function(d){
      var on = S.on[d.i], row = $('day-' + d.i).parentNode;
      row.className = 'dayrow' + (on ? '' : ' off'); $('day-' + d.i).checked = on;
      $('pp-' + d.i).textContent = on ? zl(c.perDay) : '–';
      $('ps-' + d.i).textContent = on ? 'obsługa ' + nf(c.rate) + ' + kawa ' + nf(c.cofDay) : '';
    });
    $('dsum-l').textContent = 'Razem ' + c.n + ' ' + dni(c.n) + ': obsługa i kawa';
    $('dsum-v').textContent = zl(c.daysTotal);
    var tk = tierOf(c.n); [].forEach.call(document.querySelectorAll('[data-tier]'), function(n){ n.className = 'tier' + (+n.getAttribute('data-tier') === tk ? ' on' : ''); });
    [].forEach.call(document.querySelectorAll('[data-limit]'), function(b){ b.setAttribute('aria-pressed', String(+b.getAttribute('data-limit') === S.limit)); });
    if ($('brand')){ $('brand').checked = S.brand; $('brand-box').className = 'addon' + (S.brand ? ' picked' : ''); }
    if ($('cups')){ $('cups').checked = S.cups; $('cups-box').className = 'addon' + (S.cups ? ' picked' : ''); if ($('kubki')) $('kubki').className = S.cups ? '' : 'np-off'; } // w druku szczegóły kubków tylko, gdy opcja wybrana
    if ($('lids')){ $('lids').checked = S.lids; $('lids-box').className = 'addon' + (S.lids ? ' picked' : ''); }
    var brk = [['Obsługa, ' + c.n + ' × ' + zl(c.rate), zl(c.svc)], ['Kawa, ' + S.limit + ' dziennie', zl(c.cof)]];
    if (c.brand) brk.push(['Front baru z logo', zl(c.brand)]);
    if (c.cups) brk.push(['Kubki z logo, ' + nf(c.cupsQty) + ' szt.', zl(c.cups)]);
    if (c.lids) brk.push(['Pokrywki, ' + nf(c.lidsQty) + ' szt.', zl(c.lids)]);
    var bh = brk.map(function(r){ return '<li><span>' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></li>'; }).join('');
    if (c.save > 0) bh += '<li class="save"><span>w tym rabat za liczbę dni</span><span>−' + zl(c.save) + '</span></li>';
    $('brk').innerHTML = bh;
    $('sum').textContent = zl(c.total);
    $('sum-sub').innerHTML = 'netto, doliczamy 23% VAT · <b>' + zl(c.perDay) + '</b> za dzień';
    $('peek').innerHTML = zl(c.total) + '<small>netto za ' + c.n + ' ' + dni(c.n) + ' · <b>' + zl(c.perDay) + '</b> za dzień</small>';
    $('variant-name').textContent = 'Coffee bar · ' + c.n + ' ' + dni(c.n) + ' · 1 barista';
    if ($('dep')) $('dep').textContent = zl(c.dep) + ' netto, proforma';
    $('choice-text').textContent = choice(c);
    if ($('form-btn')) $('form-btn').href = formUrl(c);
    $('send').href = 'mailto:biuro@pimpmybar.pl?subject=' + encodeURIComponent(T.mailSubj || ('Rezerwacja – ' + O.nr)) + '&body=' + encodeURIComponent('Dzień dobry,\n\nrezerwuję terminy według oferty ' + O.nr + ':\n\n' + annex(c) + '\n\nPozdrawiam');
    return c;
  }

  // ── Powiadomienia (ntfy) i analityka (Supabase, tylko zapis) ──
  var TOPIC = 'https://ntfy.sh/pmb-oferty-0d10ca967d', owner = false, sent = {};
  var TEST = /[?&]test(=|&|$)/.test(location.search), OID = (TEST ? 'TEST-' : '') + String(O.id || O.title || '').slice(0, 75);
  try{ if (/[?&]ja(=|&|$)/.test(location.search)) localStorage.setItem('pmb_owner', '1'); owner = !TEST && localStorage.getItem('pmb_owner') === '1'; }catch(e){}
  var SB = 'https://zqpqjgxtefzojhjglppb.supabase.co/rest/v1/offer_events', SBK = 'sb_publishable__bPrQF9K35vs8RbLdWBRXQ_VBVj2esQ';
  var SID = Math.random().toString(36).slice(2, 10) + Date.now().toString(36), T0 = Date.now();
  var DEV = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'telefon' : 'komputer';
  function track(ev, detail){
    if (owner || O.noPing) return;
    try{ if (window.__pmbTrack) window.__pmbTrack(ev, detail); else (window.__pmbQ = window.__pmbQ || []).push([ev, detail]); }catch(e){}
    try{ fetch(SB, {method:'POST', keepalive:true, headers:{'apikey':SBK, 'Authorization':'Bearer ' + SBK, 'Content-Type':'application/json', 'Prefer':'return=minimal'},
      body: JSON.stringify({offer:OID, session:SID, event:String(ev).slice(0, 40), detail: detail == null ? null : plain(detail).slice(0, 300), device:DEV, lang:'pl'})}).catch(function(){}); }catch(e){}
  }
  function ping(msg, tags, prio){
    if (owner || O.noPing) return;
    track(tags || 'eyes', msg);
    if (TEST) return;
    try{ fetch(TOPIC + '?title=' + encodeURIComponent(O.title) + '&tags=' + encodeURIComponent(tags || 'eyes') + (prio ? '&priority=' + prio : ''), {method:'POST', body:plain(msg), keepalive:true}).catch(function(){}); }catch(e){}
  }
  function once(k, msg, tags, prio){ if (sent[k]) return; sent[k] = 1; ping(msg, tags, prio); }
  function seen(id, key, msg, tag, prio){ var n = $(id); if (n && 'IntersectionObserver' in window) new IntersectionObserver(function(e, o){ if (e[0].isIntersecting){ once(key, msg, tag, prio); o.disconnect(); } }, {threshold:.2}).observe(n); }

  function bind(){
    var dt;
    [].forEach.call(document.querySelectorAll('[data-day]'), function(cb){
      cb.addEventListener('change', function(){
        var i = +cb.getAttribute('data-day');
        if (!cb.checked && S.on.filter(Boolean).length === 1){ cb.checked = true; return; } // przynajmniej jeden dzień
        S.on[i] = cb.checked; var c = paint();
        clearTimeout(dt); dt = setTimeout(function(){ ping('Zmienił dni: ' + c.n + ' z ' + DAYS.length + ' (' + datesShort(c.sel) + ') → ' + zl(c.total), 'calendar', 4); }, 2500);
      });
    });
    [].forEach.call(document.querySelectorAll('[data-limit]'), function(b){ b.addEventListener('click', function(){ S.limit = +b.getAttribute('data-limit'); var c = paint(); once('lim' + S.limit, 'Sprawdził wariant: do ' + S.limit + ' kaw dziennie → ' + zl(c.total), 'coffee'); }); });
    if ($('brand')) $('brand').addEventListener('change', function(e){ S.brand = e.target.checked; paint(); if (S.brand) once('brand', 'Zaznaczył: front baru z logo', 'art', 4); });
    if ($('cups')) $('cups').addEventListener('change', function(e){ S.cups = e.target.checked; paint(); if (S.cups) once('cups', 'Zaznaczył: kubki z logo', 'art', 4); });
    if ($('lids')) $('lids').addEventListener('change', function(e){ S.lids = e.target.checked; paint(); if (S.lids) once('lids', 'Zaznaczył: pokrywki do kubków', 'art', 4); });
    [].forEach.call(document.querySelectorAll('[data-print]'), function(b){ b.addEventListener('click', function(){ once('print', 'Otworzył wersję do druku (PDF) – oferta idzie dalej w firmie', 'printer', 5); setTimeout(function(){ try{ window.print(); }catch(e){} }, 60); }); });
    var open = [];
    window.addEventListener('beforeprint', function(){ open = []; [].forEach.call(document.querySelectorAll('details'), function(d){ if (!d.open){ open.push(d); d.open = true; } }); });
    window.addEventListener('afterprint', function(){ open.forEach(function(d){ d.open = false; }); open = []; });
    if ($('form-btn')) $('form-btn').addEventListener('click', function(){ ping('Kliknął „Rezerwuję terminy” (formularz umowy) → ' + $('choice-text').textContent, 'white_check_mark', 5); });
    $('send').addEventListener('click', function(){ ping('Wysyła wybór mailem → ' + $('choice-text').textContent, 'email', 5); });
    [].forEach.call(document.querySelectorAll('a[href="#akceptacja"]'), function(a){ a.addEventListener('click', function(){ once('acc', 'Kliknął „Rezerwuję terminy” → ' + $('choice-text').textContent, 'dart', 5); }); });
    [].forEach.call(document.querySelectorAll('.copy'), function(b){
      b.addEventListener('click', function(){
        var src = $(b.getAttribute('data-copy')), txt = src.textContent;
        var ok = function(){ b.textContent = 'Skopiowano'; b.classList.add('done'); setTimeout(function(){ b.textContent = 'Kopiuj'; b.classList.remove('done'); }, 1600); };
        var fb = function(){ var r = document.createRange(); r.selectNodeContents(src); var s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Zaznaczono'; };
        try{ navigator.clipboard.writeText(txt).then(ok, fb); }catch(e){ fb(); }
        once('copy' + b.getAttribute('data-copy'), 'Skopiował kontakt (' + (b.getAttribute('data-copy') === 'c-tel' ? 'telefon' : 'e-mail') + ')', b.getAttribute('data-copy') === 'c-tel' ? 'telephone_receiver' : 'email', 5);
      });
    });
    [].forEach.call(document.querySelectorAll('a[href*="youtube.com"]'), function(a){ a.addEventListener('click', function(){ once('yt', 'Otworzył film z realizacji', 'movie_camera'); }); });
    [].forEach.call(document.querySelectorAll('details'), function(d){ d.addEventListener('toggle', function(){ if (d.open && !open.length) once('faq' + d.querySelector('summary').textContent, 'Otworzył pytanie: ' + d.querySelector('summary').textContent, 'question'); }); });
    if ($('cup-tpl')) $('cup-tpl').addEventListener('click', function(){ once('tpl', 'Pobrał wykrojnik kubka – myśli o kubkach z logo', 'arrow_down', 4); });
    seen('wycena', 'wyc', 'Ogląda wycenę', 'moneybag');
    seen('wymagania', 'spec', 'Czyta wymagania techniczne (miejsce, prąd, woda)', 'electric_plug');
    seen('kubki', 'kub', 'Czyta o kubkach z logo', 'cup_with_straw');
    seen('akceptacja', 'acc0', 'Doszedł do rezerwacji terminów', 'pushpin', 3);

    // film: autoodtwarzanie, a gdy przeglądarka je blokuje – start przy pierwszym dotknięciu
    var v = $('reel-v');
    if (v){ var play = function(){ try{ v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function(){}); }catch(e){} }; play(); document.addEventListener('touchstart', function t(){ play(); document.removeEventListener('touchstart', t); }, {passive:true}); }
    var sr = $('sr'), srv = $('sr-v');
    if (sr && srv) sr.addEventListener('click', function(){ if (sr.classList.contains('on')) return; sr.classList.add('on'); srv.controls = true; srv.muted = false; var p = srv.play(); if (p && p.catch) p.catch(function(){}); once('reel', 'Ogląda showreel z dźwiękiem', 'movie_camera'); });
    var ticks = T.ticks || [], ti = 0, el = $('tick'); if (el && ticks.length){ el.textContent = ticks[0]; if (ticks.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(function(){ el.classList.add('out'); setTimeout(function(){ ti = (ti + 1) % ticks.length; el.textContent = ticks[ti]; el.classList.remove('out'); }, 350); }, 2800); }
  }

  build();
  if (owner) document.documentElement.classList.add('owner');
  paint();
  bind();

  (function(){
    var marks = [25, 50, 75, 100], hit = {};
    window.addEventListener('scroll', function(){ var d = document.documentElement, p = (window.scrollY + window.innerHeight) / Math.max(1, d.scrollHeight) * 100;
      marks.forEach(function(m){ if (p >= m - 1 && !hit[m]){ hit[m] = 1; track('scroll', m + '%'); if (m === 100) ping('Przewinął ofertę do samego dołu', 'checkered_flag', 3); } }); }, {passive:true});
    var sentT = 0; document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'hidden'){ var s = Math.round((Date.now() - T0) / 1000); if (s - sentT >= 5){ sentT = s; track('time', s + ' s'); } } });
  })();
  var first = true; try{ first = !sessionStorage.getItem('pmb_seen_' + O.id); sessionStorage.setItem('pmb_seen_' + O.id, '1'); }catch(e){}
  track('wejscie', first ? 'pierwsze w tej karcie' : 'odświeżenie');
  if (first) ping('Ktoś otworzył ofertę (' + DEV + ')', 'eyes', 4);

  // Wspólny moduł: alarm „gorący klient”, zapis wyboru (wybor/akceptacja) i dymek kontaktowy
  try{ var ks = document.createElement('script'); ks.src = '../wspolne/kontakt.js?v=3'; document.body.appendChild(ks); }catch(e){}
})();
