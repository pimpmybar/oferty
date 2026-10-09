/* Pimp My Bar – oferta eventowa (strefa mocktaili / event bar). Zbudowana na silniku weselnym; media wspólne z ../wesele/assets/. Dane oferty: window.OFFER (w index.html danej oferty). */
(function(){
  var O = window.OFFER, A = O.assets || '../wesele/assets/';

  // ── Cennik (PLN). Zmiana tutaj zmienia wszystkie oferty weselne. ──
  var PRICE = {
    base: 1400,        // część stała: bar, dojazd, montaż
    perGuest: 40,      // za gościa przy 3 koktajlach na osobę
    fourth: 12,        // dopłata za osobę przy 4 koktajlach na osobę  (ROBOCZE – do potwierdzenia)
    flair: 2200, branding: 200, tower: 500
  };
  var MENU_MIN = 3, MENU_MAX = 4;
  // Podgląd baru: zdjęcie bazowe + klisze nakładane na dwa fronty (bez animacji, twarde cięcie)
  var BV = { base: 'https://d8j0ntlcm91z4.cloudfront.net/user_3ErsnHFAg2T7i8FCPtDde7rCO2i/hf_20261006_120125_442f7e44-83e8-40ab-9ea9-6ce94befcf8b.png', 'bar-green': 'https://d8j0ntlcm91z4.cloudfront.net/user_3ErsnHFAg2T7i8FCPtDde7rCO2i/hf_20261006_125340_a086eced-042e-4f69-8177-964b4b406239.png', 'bar-olive': 'https://d8j0ntlcm91z4.cloudfront.net/user_3ErsnHFAg2T7i8FCPtDde7rCO2i/hf_20261006_121858_4b905690-f3c4-4c1b-b9d6-a5cb45ef529c.png' };
  var KL = ['deski-kolor','deski-jasne','deski-biale','deski-bielone','deski-czarne','paski','kamien','cegla-czarna','drewno','cegla-biala'];
  function klUrl(k, side){ return A+'klisze/'+KL[+k.slice(1)-1]+'-'+side+'.jpg'; }
  var SEQ = ['silver','k1','gold','k2','k3','black','k4','k5','sage','k6','k7','navy','k8','k9','blush','k10','bar-green','bar-olive'];
  var SOLID = {black:'#161616', sage:'#8a9a82', navy:'#1f2a44', blush:'#e2bfbf'};
  var bvTimer = null, bvStep = 0, bvTouched = false;
  var FRONT_FILM = '';  // film: ten sam bar ze zmieniającym się frontem (wizualizacja)
  // Fronty baru: img = zdjęcie kliszy, css = klasa kafelka, k = klucz nazwy w tekstach
  var FRONTS_ALL = [ {id:'silver', css:'f-silver', k:'fSilver'}, {id:'gold', css:'f-gold', k:'fGold'}, {id:'color', css:'f-color', k:'fColor', extra:200, line:'lColor'} ].concat(KL.map(function(n,i){ return {id:'k'+(i+1), img:'klisze/'+n+'-l.jpg'}; })).concat([ {id:'bar-green', img:'bar-zielony-2m.jpg', k:'woodG', extra:600}, {id:'bar-olive', img:'bar-oliwkowy-3m.jpg', k:'woodO', extra:600} ]);

  var FRONTS = FRONTS_ALL.filter(function(f){ return !f.extra; });

  // ── Menu mocktaili (0%) ──
  var DRINKS = [
    {id:"man", n:"Mangolita 0%", d:1, pl:"puree z mango, marakuja, limonka", t:{pl:"tropikalny, słodki"}},
    {id:"red", n:"Red Lady 0%", d:1, pl:"puree truskawkowe, marakuja, limonka", t:{pl:"owocowy, słodko-kwaśny"}},
    {id:"psm", n:"Porn Star Martini 0%", d:1, pl:"wanilia, marakuja, cytryna, prosecco 0%", t:{pl:"owocowy, waniliowy, z bąbelkami"}},
    {id:"dns", n:"Dark'n'Stormy 0%", d:1, pl:"rum 0%, limonka, napój imbirowy", t:{pl:"imbirowy, orzeźwiający"}}
  ];

  // ── Teksty ──
  var T = { pl:{
    tag:'/ Eventy firmowe', offerFor:'Oferta eventowa', h1:'Strefa mocktaili na <em>Państwa event</em>',
    lead:'Dzień dobry! Dziękujemy za zapytanie. Poniżej oferta na strefę mocktaili: bary, barmani i koktajle bezalkoholowe przygotowywane na żywo, przy uczestnikach.',
    fDate:'Termin', fPlace:'Miejsce', fGuests:'Uczestnicy', fTime:'Godziny', guestsN:'{n} osób',
    cta:'Zobacz ofertę ↓', play:'Zobacz nasz showreel',
    howH:'Jak to wygląda', howP:'Bary stoją w strefie przez cały event. Uczestnicy podchodzą, wybierają mocktail z menu i dostają go od barmana po chwili, przygotowany na ich oczach.',
    c1h:'Mocktail robiony na żywo', c1p:'Każdy koktajl barman przygotowuje przy uczestniku, w shakerze, z lodem i dekoracją. Bez alkoholu, z pełną barmańską oprawą.',
    c2h:'Bary z Państwa logo', c2p:'Fronty barów są podświetlane i wymienne. Po potwierdzeniu realizacji przygotujemy wizualizację modułów z Państwa logo.',
    c3h:'Trzy bary, bez kolejek', c3p:'Przy {g} osobach pracujemy na trzech barach z trzema barmanami, więc uczestnicy nie czekają na swoją kolej.',
    cfgH:'Państwa strefa mocktaili', cfgP:'Trzy kroki. Wybierają Państwo menu, serwis i wygląd barów, a na końcu wysyłają nam gotowy wybór.',
    s1:'Krok 1', s1h:'Menu mocktaili', s1p:'Proponujemy cztery koktajle bezalkoholowe. Mogą Państwo zostawić wszystkie albo wybrać trzy. Menu nie zmienia ceny.',
    picked:'Wybrane: {n} z {max}', pickMore:'Wybrane: {n}. Prosimy dobrać jeszcze {k}, minimum to {min}.',
    s2:'Krok 2', s2h:'Kubki czy szkło?', s2p:'W cenie są kubki jednorazowe. Opcjonalnie podajemy w szkle. Do szkła można dodać obsługę kelnerską, która zbiera je ze strefy i z sali.',
    cup:'Kubki jednorazowe', glass:'Szkło', lGlass:'Wynajem szkła, {pool} szt.', waiter:'Obsługa kelnerska', waiterS:'Kelner zbiera szkło ze strefy i z sali przez cały event.', glassHint:'Wynajem szkła: {pool} szt. Obsługa kelnerska jest opcjonalna.', cupHint:'Kubki jednorazowe są w cenie.',
    s3:'Krok 3', s3h:'Wygląd barów i dodatki', s3p:'Front barów wybierają Państwo w cenie: lustro srebrne lub złote albo podświetlana klisza. Dodatki są opcjonalne.',
    frontFilm:'Ten sam bar, różne fronty. Wizualizacja.', bvPlay:'▶ Pokaż wszystkie fronty', bvStop:'■ Zatrzymaj', c_black:'Czarny mat', c_sage:'Zielony', c_navy:'Granat', c_blush:'Pudrowy róż', barGreen:'Bar zielony z kasetonami, 2 m', barOlive:'Bar oliwkowy, 3 m', frontN:'Klisza {n}', fSilver:'Lustro srebrne', fGold:'Lustro złote', designed:'Bary zaprojektowane przez Pimp My Bar.',
    aBrand:'Branding barów logo', aBrandS:'Państwa logo na podświetlanych frontach. Projekt graficzny po Państwa stronie, wizualizację przygotujemy po potwierdzeniu realizacji.',
    aFlair:'Pokaz barmański flair', aFlairS:'Żonglerka butelkami i shakerami, z udziałem uczestników.',
    aCoffee:'Bar kawowy z baristą', aCoffeeS:'Espresso, cappuccino i latte z ekspresu kolbowego przez cały event.',
    ask:'wycenimy', lAsk:'do wyceny',
    yourPrice:'Cena', net:' netto', vat:'+ 23% VAT', perPerson:'{a}–{b} zł netto na osobę', lBar:'Obsługa: {b} bary, {b} barmanów',
    inclH:'W cenie', incl:['{b} mobilne bary z wyposażeniem','{b} barmanów, {h}','{pool} mocktaili, {m} pozycje w menu','wszystkie składniki, lód i dodatki','{cups}','wydrukowane menu','transport, montaż i demontaż strefy'],
    inclCup:'kubki jednorazowe',
    valid:'Oferta ważna do {d}', book:'Potwierdzam realizację',
    crewH:'Barmani, z którymi pracujemy i pracowaliśmy', crewP:'Przez nasz bar przeszło wielu barmanów. Część z nich do dziś dołącza do nas przy większych realizacjach.',
    teamH:'Kto przyjedzie', teamP:'Na eventach pracujemy w stałym składzie. Przy większej liczbie uczestników dołączają barmani, z którymi pracujemy na co dzień.',
    tomekL:'Właściciel · barman od 2013', tomekP:'Założył Pimp My Bar w 2013 roku. Laureat konkursów barmańskich w stylu klasycznym i flair. Za barem pracował m.in. w Indiach, USA i na Wyspach Kanaryjskich. Osobiście prowadzi każdą realizację od zapytania do demontażu.',
    tomekC:['flair','PL · EN · DE'],
    patrykL:'Szef baru · w Pimp My Bar od 2020', patrykP:'Prowadzi bar na eventach firmowych i weselach. Obsługuje gości po polsku i po angielsku.',
    patrykC:['koktajle na żywo','PL · EN'],
    workH:'Z naszych realizacji', workP:'Wszystkie zdjęcia pochodzą z naszych realizacji. Działamy od 2013 roku i mamy za sobą ponad 2 000 eventów.',
    cofL:'Dodatek', cofH:'Bar kawowy z baristą', cofP:'Ten sam zespół prowadzi bary kawowe na targach w Polsce i za granicą. Na evencie barista podaje espresso, cappuccino i latte. Bar kawowy można zaznaczyć w dodatkach.', cofA:'Film z targów na Instagramie →',
    faqH:'Pytania, które zwykle padają', faqP:'Jeśli czegoś tu brakuje, prosimy o telefon albo maila.',
    faq:[
      ['Co obejmuje cena?','{b} mobilne bary z wyposażeniem, {b} barmanów, menu mocktaili, wszystkie składniki, lód, dodatki, kubki jednorazowe oraz transport, montaż i demontaż strefy. Razem {price} netto, do tego doliczamy 23% VAT. Szkło i obsługa kelnerska są opcjami.'],
      ['Ile mocktaili jest w cenie?','{pool} mocktaili na cały event. To pula wspólna, a nie limit dla uczestnika: jedni wypiją cztery, inni jeden. Większą pulę wycenimy na życzenie.'],
      ['Czy mocktaile mogą być w szkle?','Tak. W cenie są kubki jednorazowe, a szkło jest opcją: wynajem {pool} szt. to {glassP} netto. Obsługa kelnerska, która zbiera szkło ze strefy i z sali, to {waiterP} netto. Obie opcje zaznaczą Państwo w kroku 2.'],
      ['Czy bary mogą mieć nasze logo?','Tak. Fronty barów są wymienne i podświetlane. Projekt graficzny jest po Państwa stronie. Po potwierdzeniu realizacji prosimy o logo i zdjęcie miejsca, a my przygotujemy wizualizację modułów z Państwa grafiką.'],
      ['Co musi zapewnić biuro?','Miejsce na bary, ok. 2 × 2 m na każdy, oraz gniazdko prądu w pobliżu. Resztę przywozimy sami.'],
      ['Jak potwierdzamy realizację?','Klikają Państwo „Potwierdzam realizację” albo odpisują na naszego maila. Przesyłamy umowę, a termin jest zarezerwowany po jej podpisaniu.']
    ],
    talkStep:'Porozmawiajmy', talkH:'Mają Państwo pytania? Proszę pytać.', talkP:'Jestem Tomek, prowadzę Pimp My Bar od 2013 roku. Proszę zadzwonić albo napisać: odpowiem na wszystkie pytania i dopasuję strefę do Państwa eventu.', talkCall:'Zadzwoń', talkMail:'Napisz maila',
    accH:'Potwierdzamy realizację', accP:'Po kliknięciu otworzy się gotowy mail z Państwa wyborem. Można też po prostu zadzwonić.',
    yourChoice:'Państwa wybór', send:'Wyślij wybór mailem', copy:'Kopiuj', copied:'Skopiowano',
    sumGuests:'{g} osób', sumPer:'{pool} mocktaili', sumFront:'front: {f}', sumOwn:'branding logo',
    mailSubj:'Strefa mocktaili {d} – potwierdzenie', mailHi:'Dzień dobry,\n\npotwierdzamy zainteresowanie strefą mocktaili.\n', mailBye:'\nPozdrawiam',
    foot:'Pimp My Bar · Poznań · pimpmybar.pl', footR:'Ceny netto w PLN. Oferta przygotowana {d}.', menuL:'Menu', addL:'Opcje', none:'brak'
  }};

  var LANGS = ['pl'], lang = 'pl';
  var E = { bars: O.bars || 3, per: O.perGuest || 3, gMin: O.guestsMin || O.guests, gMax: O.guestsMax || O.guests };
  var state = {
    menu: DRINKS.map(function(d){return d.id}),
    front: 'silver', own: false, glass: false, waiter: false,
    add: {flair:false, coffee:false}
  };

  var $ = function(id){return document.getElementById(id)};
  function t(k, v){ var s = T[lang][k]; if (v) for (var p in v) s = s.split('{'+p+'}').join(v[p]); return s; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}); }
  function money(n){ var r = Math.round(n*100)/100, z = Math.floor(r), gr = Math.round((r-z)*100); return String(z).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')+(gr ? ','+(gr<10?'0':'')+gr : '')+' zł'; }
  function gLabel(){ var P = O.t && O.t[lang] || {}; return P.guestsLabel || t('guestsN',{n:O.guests}); }
  function gRange(){ return E.gMin===E.gMax ? String(E.gMin) : E.gMin+'–'+E.gMax; }
  function pool(){ return String(O.pool || E.gMin*E.per); }
  function fill(s){ return s.split('{b}').join(E.bars).split('{p}').join(E.per).split('{g}').join(gRange()).split('{pool}').join(pool()).split('{m}').join(state.menu.length).split('{h}').join(O.hours).split('{price}').join(money(baseTotal())).split('{glassP}').join(money(O.glass)).split('{waiterP}').join(money(O.waiter)).split('{cups}').join(T[lang].inclCup); }
  function baseTotal(){ var x = O.price; (O.items||[]).forEach(function(it){ if (it[1] !== null) x += it[1]; }); return x; }

  function calc(){
    var lines = [[fill(t('lBar')), O.price]], total = O.price;
    (O.items || []).forEach(function(it){ lines.push([it[0], it[1]]); if (it[1] !== null) total += it[1]; });
    if (state.glass){ lines.push([fill(t('lGlass')), O.glass]); total += O.glass; }
    if (state.glass && state.waiter){ lines.push([t('waiter'), O.waiter]); total += O.waiter; }
    if (state.own) lines.push([t('aBrand'), null]);
    if (state.add.flair) lines.push([t('aFlair'), null]);
    if (state.add.coffee) lines.push([t('aCoffee'), null]);
    return {lines:lines, total:total};
  }
  function frontName(id){ var n = 0, r = ''; FRONTS_ALL.forEach(function(f){ if (f.img && !f.k) n++; if (f.id===id) r = f.k ? (T[lang][f.k]||'') : t('frontN',{n:n}); }); return r; }
  function bvName(k){ var L = T[lang]; if (k==='silver') return L.fSilver; if (k==='gold') return L.fGold; if (SOLID[k]) return L['c_'+k]; if (k==='bar-green') return L.barGreen; if (k==='bar-olive') return L.barOlive; return frontName(k); }
  function bvPaint(k){
    var fig = $('barview'); if (!fig) return; var im = $('bv-img'), ov = fig.querySelectorAll('i');
    var src = BV[k] || BV.base; if (im.getAttribute('src') !== src) im.src = src;
    for (var i=0;i<ov.length;i++){ var s = ov[i].style; s.display = (BV[k] || k==='silver') ? 'none' : 'block'; s.backgroundImage = 'none'; s.backgroundColor = 'transparent'; s.mixBlendMode = 'normal';
      if (k==='gold'){ s.backgroundColor = '#e0b25a'; s.mixBlendMode = 'multiply'; }
      else if (SOLID[k]) s.backgroundColor = SOLID[k];
      else if (/^k\d+$/.test(k)) s.backgroundImage = 'url('+klUrl(k, i ? 'r' : 'l')+')'; }
    $('bv-cap').textContent = bvName(k);
  }
  function bvStop(){ bvTimer = null; var v = $('bv-film'); if (v){ v.pause(); v.hidden = true; } var b = $('bv-play'); if (b) b.textContent = T[lang].bvPlay; }
  function bvStart(){ var v = $('bv-film'); if (!v) return; bvPaint('silver'); bvTimer = 1; v.hidden = false; try { v.currentTime = 0; } catch(e){} var p = v.play(); if (p && p.catch) p.catch(function(){}); $('bv-cap').textContent = T[lang].frontFilm; $('bv-play').textContent = T[lang].bvStop; }
  function bvCurrent(){ return state.own ? 'sage' : state.front; }
  function menuNames(){ return DRINKS.filter(function(d){return state.menu.indexOf(d.id)>-1}).map(function(d){return d.n}); }
  function priceTxt(){ return money(calc().total)+T[lang].net; }
  function summary(){
    var c = calc(), parts = [gLabel(), fill(t('sumPer')), state.glass ? t('glass')+(state.waiter ? ' + '+t('waiter').toLowerCase() : '') : t('cup'), t('sumFront',{f: state.own ? t('sumOwn') : frontName(state.front)})];
    var adds = c.lines.slice(1+(O.items||[]).length).map(function(l){return l[0]+' ('+(l[1]===null ? T[lang].lAsk : money(l[1]))+')'});
    return {head: parts.join(' · '), menu: menuNames().join(', '), adds: adds.length ? adds.join(', ') : t('none'), total: priceTxt()};
  }

  // ── Szkielet strony ──
  function build(){
    document.documentElement.lang = lang;
    var L = T[lang], P = O.t && O.t[lang] || {};
    var h = '';
    h += '<div class="wrap"><header class="top"><a class="brand" href="https://www.pimpmybar.pl" target="_blank" rel="noopener">Pimp My Bar <span>'+L.tag+'</span></a></header>';
    h += '<div class="hero"><div class="hero-copy"><div class="label">'+esc(P.label || L.offerFor)+'</div><h1>'+(P.h1 || L.h1)+'</h1><p>'+esc(P.lead || L.lead)+'</p>';
    h += '<dl class="facts"><div><dt>'+L.fDate+'</dt><dd>'+esc(O.date)+'</dd></div><div><dt>'+L.fPlace+'</dt><dd>'+esc(O.venue)+'</dd></div><div><dt>'+L.fGuests+'</dt><dd>'+esc(gLabel())+'</dd></div><div><dt>'+L.fTime+'</dt><dd>'+esc(O.time)+'</dd></div></dl>';
    h += '<div class="price-peek"><div class="big num" id="peek"></div><a class="btn" href="#bar">'+L.cta+'</a></div></div>';
    h += '<button type="button" class="film" id="film" aria-label="'+esc(L.play)+'"><img src="'+A+'hero.jpg?v=2" alt=""><span class="play"><span class="tri" aria-hidden="true"></span>'+L.play+'</span></button></div></div>';

    h += '<section><div class="wrap"><div class="sec-head"><h2>'+L.howH+'</h2><p>'+L.howP+'</p></div><div class="trio">';
    [['stir.jpg','c1'],['bar-artdeco.jpg','c2'],['cocktail.jpg','c3']].forEach(function(c){ h += '<div class="card"><img src="'+A+c[0]+'" alt="" loading="lazy"><h3>'+L[c[1]+'h']+'</h3><p>'+esc(fill(L[c[1]+'p']))+'</p></div>'; });
    h += '</div></div></section>';

    h += '<section id="bar"><div class="wrap"><div class="sec-head"><h2>'+L.cfgH+'</h2><p>'+L.cfgP+'</p></div><div class="cfg"><div>';
    h += '<div class="block"><span class="step">'+L.s1+'</span><h3>'+L.s1h+'</h3><p>'+L.s1p+'</p><div class="menu">';
    DRINKS.forEach(function(d){ h += '<label class="drink" for="d-'+d.id+'"><input type="checkbox" id="d-'+d.id+'" data-drink="'+d.id+'"><span><strong>'+esc(d.n)+'</strong><em class="taste">'+esc(d.t[lang])+'</em><small>'+esc(d[lang])+'</small></span></label>'; });
    h += '</div><p class="count" id="m-count" aria-live="polite"></p></div>';
    h += '<div class="block"><span class="step">'+L.s2+'</span><h3>'+L.s2h+'</h3><p>'+L.s2p+'</p><div class="seg" role="group"><button type="button" id="s-cup">'+L.cup+'</button><button type="button" id="s-glass">'+L.glass+' · + '+money(O.glass)+'</button></div><p class="hint" id="s-hint"></p><label class="addon" for="waiter"><input type="checkbox" id="waiter"><span><strong>'+L.waiter+'</strong><small>'+L.waiterS+'</small></span><b>+ '+money(O.waiter)+'</b></label></div>';
    h += '<div class="block"><span class="step">'+L.s3+'</span><h3>'+L.s3h+'</h3><p>'+L.s3p+'</p><figure class="barview" id="barview"><img id="bv-img" src="'+BV.base+'" alt=""><i class="pl"></i><i class="pr"></i><video id="bv-film" src="'+A+'fronty-film.mp4" muted loop playsinline preload="metadata" hidden></video><figcaption><span id="bv-cap"></span><button type="button" id="bv-play">'+L.bvPlay+'</button></figcaption></figure><div class="fronts" role="group">';
    FRONTS.forEach(function(f){ h += '<button type="button" class="front '+(f.css||'')+'" data-front="'+f.id+'" aria-label="'+esc(frontName(f.id))+'">'+(f.img ? '<img src="'+A+f.img+'" alt="" loading="lazy">' : '')+(f.k ? '<span>'+esc(frontName(f.id))+'</span>' : '')+'</button>'; });
    h += '</div><p class="hint" id="f-name"></p><p class="hint designed">'+L.designed+'</p>';
    h += addon('own', L.aBrand, L.aBrandS, L.ask);
    h += addon('coffee', L.aCoffee, L.aCoffeeS, L.ask);
    h += addon('flair', L.aFlair, L.aFlairS, L.ask);
    h += '</div></div>';
    h += '<aside class="total" aria-live="polite"><span class="label">'+L.yourPrice+'</span><div class="sum" id="sum"></div><span class="sub" id="pp"></span><hr><ul class="lines" id="lines"></ul><hr><span class="label">'+L.inclH+'</span><ul class="incl" id="incl"></ul><hr><span class="sub">'+t('valid',{d:O.validUntil})+'</span><a class="btn" href="#rezerwacja" data-book>'+L.book+'</a></aside>';
    h += '</div></div></section>';

    h += '<section><div class="wrap"><div class="sec-head"><h2>'+L.teamH+'</h2><p>'+L.teamP+'</p></div>';
    h += '<div class="lead"><img src="'+A+'tomek.jpg" alt="Tomasz Malinowski" loading="lazy"><div class="who"><span class="label">'+L.tomekL+'</span><h3>Tomasz Malinowski</h3><div class="chips"><span class="chip k">'+L.tomekC[0]+'</span><span class="chip">'+L.tomekC[1]+'</span></div><p>'+L.tomekP+'</p></div></div><div class="team">';
    h += '<div class="person"><img class="avatar" src="'+A+'patryk.jpg" alt="Patryk Mroczkowski" loading="lazy"><div class="who"><span class="label">'+L.patrykL+'</span><h3>Patryk Mroczkowski</h3><div class="chips"><span class="chip k">'+L.patrykC[0]+'</span><span class="chip">'+L.patrykC[1]+'</span></div><p>'+L.patrykP+'</p></div></div>';
    h += '</div><div class="crew-head"><h3>'+L.crewH+'</h3><p>'+L.crewP+'</p></div><div class="crewgrid">'+[1,2,3,4].map(function(n){ return '<img src="'+A+'crew-'+n+'.jpg" alt="" loading="lazy">'; }).join('')+'</div></div></section>';

    h += '<section><div class="wrap"><div class="sec-head"><h2>'+L.workH+'</h2><p>'+L.workP+'</p></div><div class="gallery">';
    h += '<figure class="g1"><img src="'+A+'pour.jpg" alt="" loading="lazy"></figure><figure class="g2"><img src="'+A+'menu-board.jpg" alt="" loading="lazy"></figure><figure class="g3"><img src="'+A+'welcome.jpg" alt="" loading="lazy"></figure><figure class="g4"><img src="'+A+'lights.jpg" alt="" loading="lazy"></figure><figure class="g5"><img src="'+A+'bar-grafika.jpg" alt="" loading="lazy"></figure>';
    h += '</div><div class="feature"><div class="fmedia"><video src="'+A+'coffee.mp4" poster="'+A+'coffee-poster.jpg" autoplay muted loop playsinline preload="metadata"></video></div><div class="ftext"><span class="label">'+L.cofL+'</span><h3>'+L.cofH+'</h3><p>'+L.cofP+'</p><a class="more" href="https://www.instagram.com/p/C2c30XzIJnS/" target="_blank" rel="noopener" data-film2>'+L.cofA+'</a></div></div></div></section>';

    h += '<section><div class="wrap"><div class="sec-head"><h2>'+L.faqH+'</h2><p>'+L.faqP+'</p></div><div class="faq" id="faq"></div></div></section>';

    h += '<section id="rezerwacja"><div class="wrap"><div class="accept"><div class="col"><h2>'+L.accH+'</h2><p>'+L.accP+'</p><div class="choice"><span class="label">'+L.yourChoice+'</span><div id="choice"></div></div><a class="btn" id="send" href="#">'+L.send+'</a></div>';
    h += '<div class="contact"><div class="crow"><span>Tomasz Malinowski</span></div><div class="crow"><span id="c-mail">biuro@pimpmybar.pl</span><button class="copy" type="button" data-copy="c-mail">'+L.copy+'</button></div><div class="crow"><a href="tel:+48513916977" id="c-tel">+48 513 916 977</a><button class="copy" type="button" data-copy="c-tel">'+L.copy+'</button></div></div></div></div></section>';
    h += '<section id="rozmowa"><div class="wrap"><div class="talk"><div class="talkpics" id="talkpics" role="img" aria-label="Tomasz Malinowski">'+[1,2,3].map(function(n){ return '<img src="'+A+'tomek-k'+n+'.jpg" alt="" loading="lazy"'+(n===1?' class="on"':'')+'>'; }).join('')+'</div><div class="col"><span class="step">'+L.talkStep+'</span><h2>'+L.talkH+'</h2><p>'+L.talkP+'</p><div class="talkbtns"><a class="btn" href="tel:+48513916977" id="t-call">'+L.talkCall+' · 513 916 977</a><a class="btn ghost" href="mailto:biuro@pimpmybar.pl" id="t-mail">'+L.talkMail+'</a></div>';
    h += '</div></div></div></section>';
    h += '<footer class="wrap"><span>'+L.foot+'</span><span>'+t('footR',{d:O.prepared})+'</span></footer>';
    h += '<div class="bar"><div><div class="s num" id="bar-sum"></div><small id="bar-pp"></small></div><a class="btn" href="#rezerwacja" data-book>'+L.book+'</a></div>';
    $('app').innerHTML = h;
    document.title = (P.title || L.offerFor) + ' – Pimp My Bar';
    bind(); render();
  }
  function addon(id, a, b, p){ return '<label class="addon" for="a-'+id+'"><input type="checkbox" id="a-'+id+'" data-add="'+id+'"><span><strong>'+a+'</strong><small>'+b+'</small></span><b>'+p+'</b></label>'; }

  function render(){
    var L = T[lang], c = calc();
    var cnt = state.menu.length;
    document.querySelectorAll('[data-drink]').forEach(function(i){ var on = state.menu.indexOf(i.dataset.drink)>-1; i.checked = on; i.disabled = !on && cnt>=MENU_MAX; });
    var mc = $('m-count'); mc.className = 'count'+(cnt<MENU_MIN?' bad':'');
    mc.textContent = cnt<MENU_MIN ? t('pickMore',{n:cnt,k:MENU_MIN-cnt,min:MENU_MIN}) : t('picked',{n:cnt,max:MENU_MAX});
    $('s-cup').setAttribute('aria-pressed', String(!state.glass)); $('s-glass').setAttribute('aria-pressed', String(state.glass));
    $('s-hint').textContent = fill(state.glass ? L.glassHint : L.cupHint); var w = $('waiter'); w.disabled = !state.glass; w.checked = state.glass && state.waiter;
    document.querySelectorAll('[data-front]').forEach(function(b){ b.setAttribute('aria-pressed', String(!state.own && b.dataset.front===state.front)); });
    $('f-name').textContent = state.own ? t('sumOwn') : frontName(state.front);
    if (!bvTimer) bvPaint(bvCurrent());
    document.querySelectorAll('[data-add]').forEach(function(i){ i.checked = i.dataset.add==='own' ? state.own : state.add[i.dataset.add]; });
    var tot = priceTxt(), pp = t('perPerson',{a:Math.round(c.total/E.gMax), b:Math.round(c.total/E.gMin)})+' · '+L.vat;
    $('sum').textContent = tot; $('pp').textContent = pp; $('bar-sum').textContent = money(c.total); $('bar-pp').textContent = 'netto '+L.vat; $('peek').textContent = tot;
    $('lines').innerHTML = c.lines.map(function(l){ return '<li>'+esc(l[0])+' <b>'+(l[1]===null ? L.lAsk : money(l[1]))+'</b></li>'; }).join('');
    $('incl').innerHTML = L.incl.map(function(s){ return '<li>'+esc(fill(s))+'</li>'; }).join('');
    $('faq').innerHTML = L.faq.map(function(f){ return '<details><summary>'+esc(fill(f[0]))+'</summary><p>'+esc(fill(f[1]))+'</p></details>'; }).join('');
    var s = summary();
    $('choice').innerHTML = '<strong>'+esc(s.total)+'</strong> · '+esc(s.head)+'<br><span class="label">'+L.menuL+'</span> '+esc(s.menu)+'<br><span class="label">'+L.addL+'</span> '+esc(s.adds);
    var body = L.mailHi+'\n'+O.date+', '+O.time+', '+O.venue+'\n'+s.head+'\n'+L.menuL+': '+s.menu+'\n'+L.addL+': '+s.adds+'\n'+L.yourPrice+': '+s.total+' '+L.vat+'\n'+L.mailBye;
    $('send').href = 'mailto:biuro@pimpmybar.pl?subject='+encodeURIComponent(t('mailSubj',{d:O.date}))+'&body='+encodeURIComponent(body);
  }

  function bind(){
    $('bv-play').addEventListener('click', function(){ if (bvTimer){ bvStop(); bvPaint(bvCurrent()); } else { bvStart(); once('bvplay','Ogląda pokaz frontów baru','art'); } });
    (function(){
      if (!$('book')) { if (!matchMedia('(prefers-reduced-motion: reduce)').matches){ var tp0 = $('talkpics').children, ti0 = 0; setInterval(function(){ tp0[ti0].className = ''; ti0 = (ti0+1) % tp0.length; tp0[ti0].className = 'on'; }, 900); } $('t-call').addEventListener('click', function(){ once('tcall','Kliknął „Zadzwoń” w sekcji kontaktu','telephone_receiver',5); }); $('t-mail').addEventListener('click', function(){ once('tmail','Kliknął „Napisz maila” w sekcji kontaktu','email',4); }); return; }
      var days = $('b-days'), times = $('b-times'), bd = null, bt = null, loc = {pl:'pl-PL',en:'en-GB',de:'de-DE'}[lang] || 'pl-PL', n = 0, d = new Date();
      while (n < 7){ d.setDate(d.getDate()+1); if (d.getDay()===0) continue; var lab = d.toLocaleDateString(loc,{weekday:'short',day:'numeric',month:'numeric'}); days.insertAdjacentHTML('beforeend','<button type="button" data-v="'+esc(lab)+'">'+esc(lab)+'</button>'); n++; }
      ['10:00','12:00','14:00','16:00','18:00','20:00'].forEach(function(x){ times.insertAdjacentHTML('beforeend','<button type="button" data-v="'+x+'">'+x+'</button>'); });
      function pick(box, set){ box.addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; [].forEach.call(box.children, function(c){ c.setAttribute('aria-pressed', c===b ? 'true' : 'false'); }); set(b.dataset.v); }); box.children[0].click(); }
      pick(days, function(v){ bd = v; }); pick(times, function(v){ bt = v; }); times.children[4].click();
      $('book').addEventListener('submit', function(e){ e.preventDefault(); var c = $('b-contact').value.trim(), note = $('b-note'), L = T[lang];
        if (c.length < 5){ note.textContent = L.talkErr; note.className = 'booknote err'; $('b-contact').focus(); return; }
        var msg = 'PROŚBA O ROZMOWĘ 15 min: '+bd+', godz. '+bt+'. Kontakt: '+c;
        track('rozmowa', bd+', godz. '+bt);
        function done(){ note.textContent = L.talkOk; note.className = 'booknote ok'; $('book').querySelector('button[type=submit]').disabled = true; }
        function mail(){ location.href = 'mailto:biuro@pimpmybar.pl?subject='+encodeURIComponent('Rozmowa 15 min: '+bd+' '+bt)+'&body='+encodeURIComponent(msg+'\n'+O.title); done(); }
        try{ fetch(TOPIC+'?title='+encodeURIComponent(O.title)+'&tags=calendar&priority=5', {method:'POST', body:msg}).then(function(r){ r.ok ? done() : mail(); }).catch(mail); }catch(x){ mail(); }
      });
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches){ var tp = $('talkpics').children, ti = 0; setInterval(function(){ tp[ti].className = ''; ti = (ti+1) % tp.length; tp[ti].className = 'on'; }, 900); }
      $('t-call').addEventListener('click', function(){ once('tcall','Kliknął „Zadzwoń” w sekcji kontaktu','telephone_receiver',5); });
      $('t-mail').addEventListener('click', function(){ once('tmail','Kliknął „Napisz maila” w sekcji kontaktu','email',4); });
    })();
    SEQ.forEach(function(k){ var i = new Image(); if (/^k\d+$/.test(k)){ i.src = klUrl(k,'l'); new Image().src = klUrl(k,'r'); } else i.src = BV[k] || BV.base; });
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) new IntersectionObserver(function(e,o){ if (e[0].isIntersecting){ if (!bvTouched) bvStart(); o.disconnect(); } },{threshold:.6}).observe($('barview'));
        $('s-cup').addEventListener('click', function(){ state.glass = false; render(); });
    $('s-glass').addEventListener('click', function(){ state.glass = true; render(); once('glass','Wybrał szkło → '+summary().total,'wine_glass',4); });
    $('waiter').addEventListener('change', function(e){ state.waiter = e.target.checked; render(); if (state.waiter) once('waiter','Dodał obsługę kelnerską → '+summary().total,'heavy_plus_sign',4); });
    var mt; document.querySelectorAll('[data-drink]').forEach(function(i){ i.addEventListener('change', function(){
      var k = state.menu.indexOf(i.dataset.drink); if (i.checked && k<0) state.menu.push(i.dataset.drink); if (!i.checked && k>-1) state.menu.splice(k,1);
      render(); clearTimeout(mt); mt = setTimeout(function(){ ping('Zmienił menu: '+menuNames().join(', '),'cocktail'); }, 6000);
    }); });
    document.querySelectorAll('[data-front]').forEach(function(b){ b.addEventListener('click', function(){ bvTouched = true; bvStop(); state.front = b.dataset.front; state.own = false; render(); var _l = lang; lang = 'pl'; var _fn = frontName(state.front); lang = _l; ping('Front baru: '+_fn,'art'); }); });
    document.querySelectorAll('[data-add]').forEach(function(i){ i.addEventListener('change', function(){
      var id = i.dataset.add; if (id==='own') state.own = i.checked; else state.add[id] = i.checked; render();
      if (i.checked) once('add'+id,'Dodał: '+T.pl[{own:'aBrand',flair:'aFlair',coffee:'aCoffee'}[id]],'heavy_plus_sign',4);
    }); });
    $('film').addEventListener('click', function(){ var f = $('film'); if (f.classList.contains('playing')) return; f.classList.add('playing');
      f.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/Btc8eqYrPd8?autoplay=1&rel=0" title="Showreel – Pimp My Bar" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'; once('film','Ogląda showreel','movie_camera'); });
    document.querySelectorAll('[data-book]').forEach(function(a){ a.addEventListener('click', function(){ var s = summary(); once('book','Kliknął „Potwierdzam realizację” → '+s.total+' · '+s.head,'white_check_mark',5); }); });
    $('send').addEventListener('click', function(){ var s = summary(); once('send','WYSYŁA WYBÓR MAILEM → '+s.total+' · '+s.head+' · '+s.menu,'tada',5); });
    document.querySelector('[data-film2]').addEventListener('click', function(){ once('film2','Otworzył film kawowy z targów','coffee'); });
    document.querySelectorAll('.copy').forEach(function(b){ b.addEventListener('click', function(){
      var src = $(b.dataset.copy), txt = src.textContent, L = T[lang];
      var ok = function(){ b.textContent = L.copied; b.classList.add('done'); setTimeout(function(){ b.textContent = L.copy; b.classList.remove('done'); }, 1600); };
      try{ navigator.clipboard.writeText(txt).then(ok, function(){}) }catch(e){}
      once('copy'+b.dataset.copy,'Skopiował kontakt ('+(b.dataset.copy==='c-tel'?'telefon':'e-mail')+')','telephone_receiver',5);
    }); });
    var cfg = $('bar');
    if ('IntersectionObserver' in window) new IntersectionObserver(function(e,o){ if (e[0].isIntersecting){ once('cfg','Ogląda konfigurator i cenę','moneybag'); o.disconnect(); } },{threshold:.15}).observe(cfg);
  }

  // ── Powiadomienia (ntfy) ──
  var TOPIC = 'https://ntfy.sh/pmb-oferty-0d10ca967d', owner = false, sent = {};
  var TESTMODE = /[?&]test(=|&|$)/.test(location.search); if (TESTMODE) O.id = 'TEST-'+(O.id||'');
  try{ if (/[?&]ja(=|&|$)/.test(location.search)) localStorage.setItem('pmb_owner','1'); owner = !TESTMODE && localStorage.getItem('pmb_owner')==='1'; }catch(e){}
  function ping(msg, tags, prio){
    if (owner || O.noPing) return;
    track(tags||'eyes', msg);
    if (TESTMODE) return;
    try{ fetch(TOPIC+'?title='+encodeURIComponent(O.title)+'&tags='+encodeURIComponent(tags||'eyes')+(prio?'&priority='+prio:''), {method:'POST', body:msg, keepalive:true}).catch(function(){}); }catch(e){}
  }
  function once(k, msg, tags, prio){ if (sent[k]) return; sent[k] = 1; ping(msg, tags, prio); }

  // ── Analityka (Supabase, tylko zapis) ──
  var SB = 'https://zqpqjgxtefzojhjglppb.supabase.co/rest/v1/offer_events', SBK = 'sb_publishable__bPrQF9K35vs8RbLdWBRXQ_VBVj2esQ';
  var SID = Math.random().toString(36).slice(2,10)+Date.now().toString(36), T0 = Date.now();
  function track(ev, detail){
    if (owner || O.noPing) return;
    try{ fetch(SB, {method:'POST', keepalive:true, headers:{'apikey':SBK,'Authorization':'Bearer '+SBK,'Content-Type':'application/json','Prefer':'return=minimal'},
      body: JSON.stringify({offer:String(O.id||O.title||'').slice(0,80), session:SID, event:String(ev).slice(0,40), detail: detail==null ? null : String(detail).slice(0,300), device:DEV, lang:lang})}).catch(function(){}); }catch(e){}
  }
  var DEV = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'telefon' : 'komputer';
  (function(){
    var marks = [25,50,75,100], seen = {};
    function onScroll(){ var d = document.documentElement, p = (window.scrollY + window.innerHeight) / Math.max(1, d.scrollHeight) * 100;
      marks.forEach(function(m){ if (p >= m - 1 && !seen[m]){ seen[m] = 1; track('scroll', m+'%'); if (m===100) ping('Przewinął ofertę do samego dołu','checkered_flag',3); } }); }
    window.addEventListener('scroll', onScroll, {passive:true});
    var sentT = 0; document.addEventListener('visibilitychange', function(){ if (document.visibilityState==='hidden'){ var s = Math.round((Date.now()-T0)/1000); if (s - sentT >= 5){ sentT = s; track('time', s+' s'); } } });
  })();

  build();
  var dev = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'telefon' : 'komputer', first = true;
  try{ first = !sessionStorage.getItem('pmb_seen_'+O.id); sessionStorage.setItem('pmb_seen_'+O.id,'1'); }catch(e){}
  track('wejscie', first ? 'pierwsze w tej karcie' : 'odświeżenie');
  if (first) ping('Ktoś otworzył ofertę ('+dev+')','eyes',4);
})();
