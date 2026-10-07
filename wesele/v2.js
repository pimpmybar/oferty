/* Pimp My Bar – ofertomat weselny. Dane oferty: window.OFFER (w index.html danej oferty). */
(function(){
  var O = window.OFFER, A = O.assets || '../wesele/assets/';

  // ── Cennik (PLN). Zmiana tutaj zmienia wszystkie oferty weselne. ──
  var PRICE = {
    base: 1400,        // część stała: bar, dojazd, montaż
    perGuest: 40,      // za gościa przy 3 koktajlach na osobę
    fourth: 12,        // dopłata za osobę przy 4 koktajlach na osobę  (ROBOCZE – do potwierdzenia)
    flair: 2200, branding: 200, tower: 500
  };
  var MENU_MIN = 6, MENU_MAX = 8;
  // Podgląd baru: zdjęcie bazowe + klisze nakładane na dwa fronty (bez animacji, twarde cięcie)
  var BV = { base: 'https://d8j0ntlcm91z4.cloudfront.net/user_3ErsnHFAg2T7i8FCPtDde7rCO2i/hf_20261006_120125_442f7e44-83e8-40ab-9ea9-6ce94befcf8b.png', 'bar-green': 'https://d8j0ntlcm91z4.cloudfront.net/user_3ErsnHFAg2T7i8FCPtDde7rCO2i/hf_20261006_125340_a086eced-042e-4f69-8177-964b4b406239.png', 'bar-olive': 'https://d8j0ntlcm91z4.cloudfront.net/user_3ErsnHFAg2T7i8FCPtDde7rCO2i/hf_20261006_121858_4b905690-f3c4-4c1b-b9d6-a5cb45ef529c.png' };
  var KL = ['deski-kolor','deski-jasne','deski-biale','deski-bielone','deski-czarne','paski','kamien','cegla-czarna','drewno','cegla-biala'];
  function klUrl(k, side){ return A+'klisze/'+KL[+k.slice(1)-1]+'-'+side+'.jpg'; }
  var SEQ = ['silver','k1','gold','k2','k3','black','k4','k5','sage','k6','k7','navy','k8','k9','blush','k10','bar-green','bar-olive'];
  var SOLID = {black:'#161616', sage:'#8a9a82', navy:'#1f2a44', blush:'#e2bfbf'};
  var bvTimer = null, bvStep = 0, bvTouched = false;
  var FRONT_FILM = '';  // film: ten sam bar ze zmieniającym się frontem (wizualizacja)
  // Media strony. Tymczasowe ujęcia wygenerowane (Higgsfield); podmienić na własne pliki w wesele/assets/.
  var G = 'https://d8j0ntlcm91z4.cloudfront.net/user_3ErsnHFAg2T7i8FCPtDde7rCO2i/';
  var MEDIA = {
    video: G+'hf_20261006_101447_06a450e3-0594-4c4f-9a27-633e63df528e.mp4',
    poster: G+'hf_20261006_101047_849d94f3-3601-424d-bf6a-fe90625333a0.png',
    filmPoster: G+'hf_20261006_101046_f9852898-5f10-4014-a3f3-76f4f5dcd12f.png',
    strip: [G+'hf_20261006_101046_4b001c54-4aa3-4eab-98f3-bc1beb1c1117.png', G+'hf_20261006_101048_1b39c5a1-7072-4045-b3bb-e7ef49235a78.png', G+'hf_20261006_101046_f9852898-5f10-4014-a3f3-76f4f5dcd12f.png', G+'hf_20261006_101046_75b1e636-27bb-4fab-8c96-69cf7e756ca4.png', G+'hf_20261006_101046_827827c5-2e5e-4a68-9f79-e308b0d45f9d.png', G+'hf_20261006_101048_07889199-769a-4e4b-ad03-1d0e2e20d33f.png']
  };
  // Fronty baru: img = zdjęcie kliszy, css = klasa kafelka, k = klucz nazwy w tekstach
  var FRONTS = [ {id:'silver', img:'front-lustro.jpg', k:'fSilver'}, {id:'gold', css:'f-gold', k:'fGold'}, {id:'color', css:'f-color', k:'fColor'} ].concat(KL.map(function(n,i){ return {id:'k'+(i+1), img:'klisze/'+n+'-l.jpg'}; }));

  // ── Karta koktajli (z „Mix some drinks”) ──
  var DRINKS = [
    {id:'psm', n:'Porn Star Martini', z:1, d:1, pl:'wódka, wanilia, marakuja, cytryna, wino musujące', en:'vodka, vanilla, passion fruit, lemon, sparkling wine', de:'Wodka, Vanille, Maracuja, Zitrone, Schaumwein'},
    {id:'ws',  n:'Whisky Sour', d:1, pl:'whisky, cytryna, syrop cukrowy, Angostura', en:'whisky, lemon, sugar syrup, Angostura', de:'Whisky, Zitrone, Zuckersirup, Angostura'},
    {id:'bra', n:'Bramble', z:1, d:1, pl:'gin, puree z jeżyn, cytryna', en:'gin, blackberry purée, lemon', de:'Gin, Brombeerpüree, Zitrone'},
    {id:'hug', n:'Hugo', d:1, pl:'wino musujące, mięta, limonka, kwiat bzu', en:'sparkling wine, mint, lime, elderflower', de:'Schaumwein, Minze, Limette, Holunderblüte'},
    {id:'man', n:'Mangolita', z:1, d:1, pl:'wódka, puree z mango, marakuja, limonka', en:'vodka, mango purée, passion fruit, lime', de:'Wodka, Mangopüree, Maracuja, Limette'},
    {id:'red', n:'Red Lady', z:1, d:1, pl:'wódka, puree truskawkowe, limonka', en:'vodka, strawberry purée, lime', de:'Wodka, Erdbeerpüree, Limette'},
    {id:'dns', n:"Dark'n'Stormy", z:1, d:1, pl:'ciemny rum, cytryna, Angostura, napój imbirowy', en:'dark rum, lemon, Angostura, ginger beer', de:'dunkler Rum, Zitrone, Angostura, Ginger Beer'},
    {id:'pal', n:'Paloma', pl:'tequila, grejpfrut, limonka', en:'tequila, grapefruit, lime', de:'Tequila, Grapefruit, Limette'},
    {id:'ape', n:'Aperol Spritz', pl:'Aperol, wino musujące, pomarańcza', en:'Aperol, sparkling wine, orange', de:'Aperol, Schaumwein, Orange'},
    {id:'moj', n:'Mojito', pl:'rum, mięta, limonka, woda gazowana', en:'rum, mint, lime, soda', de:'Rum, Minze, Limette, Soda'},
    {id:'esp', n:'Espresso Martini', pl:'wódka, espresso, likier kawowy', en:'vodka, espresso, coffee liqueur', de:'Wodka, Espresso, Kaffeelikör'},
    {id:'gbs', n:'Gin Basil Smash', pl:'gin, bazylia, cytryna', en:'gin, basil, lemon', de:'Gin, Basilikum, Zitrone'},
    {id:'hem', n:'Hemingway Daiquiri', pl:'rum, maraschino, grejpfrut, cytryna', en:'rum, maraschino, grapefruit, lemon', de:'Rum, Maraschino, Grapefruit, Zitrone'},
    {id:'mar', n:'Margarita', pl:'tequila, triple sec, cytryna, sól', en:'tequila, triple sec, lemon, salt', de:'Tequila, Triple Sec, Zitrone, Salz'},
    {id:'kiw', n:'Kiwi Boy', pl:'wódka, świeże kiwi, limonka', en:'vodka, fresh kiwi, lime', de:'Wodka, frische Kiwi, Limette'},
    {id:'pin', n:'Pina Colada', pl:'rum, kokos, ananas', en:'rum, coconut, pineapple', de:'Rum, Kokos, Ananas'},
    {id:'neg', n:'Negroni', pl:'gin, Martini Rosso, Campari', en:'gin, sweet vermouth, Campari', de:'Gin, roter Wermut, Campari'},
    {id:'old', n:'Old Fashioned', pl:'bourbon, Angostura, cukier', en:'bourbon, Angostura, sugar', de:'Bourbon, Angostura, Zucker'}
  ];

  // ── Teksty ──
  var T = {
  pl:{
    hook:['Koktajl robiony na żywo.','Dla każdego gościa.'], rot:['Ze świeżych owoców, przy Waszych gościach','Barman pyta o smak, zamiast podawać z karty','Jedna cena za cały wieczór, z dojazdem'],
    eveH:'Wieczór przy barze', illus:'Zdjęcia poglądowe.', filmH:'Zobacz, jak pracujemy', filmP:'Showreel Pimp My Bar, 1 min 22 s',
    eve:[['Powitanie','Welcome drink czeka na gości, zanim wejdą na salę.'],['Rozmowa przy barze','Barman pyta o ulubiony owoc, smak i alkohol. Dopiero potem robi koktajl.'],['Wasze menu','Od 6 do 8 koktajli, które wybieracie sami. Kilka także w wersji 0%.'],['Wasz koktajl','Autorski koktajl z Waszą nazwą, ustalony przed weselem.'],['Pokaz flair','Żonglerka butelkami na parkiecie, z udziałem gości. Dodatek.'],['Champagne tower','Piramida kieliszków na toast albo przed tortem. Dodatek.']],
    tag:'/ Wesela', offerFor:'Oferta weselna', h1:'Bar koktajlowy na <em>Wasze wesele</em>',
    lead:'Każdy koktajl robimy na żywo przy barze, ze świeżych owoców. Poniżej ułożycie własne menu i od razu zobaczycie cenę.',
    fDate:'Termin', fPlace:'Miejsce', fGuests:'Goście', fTime:'Czas pracy baru', hours:'8 godzin', guestsN:'{n} osób',
    cta:'Ułóż swój bar ↓', play:'Zobacz nasz showreel',
    howH:'Jak to wygląda', howP:'Bar stoi na sali przez całe wesele. Goście podchodzą, rozmawiają z barmanem i dostają koktajl zrobiony dla nich.',
    c1h:'Koktajl dobrany w rozmowie', c1p:'Menu stoi obok, ale barman i tak zapyta o ulubiony owoc, smak i alkohol. Dzięki temu po koktajl przychodzą też goście, którzy zwykle ich nie piją.',
    c2h:'Bar pasujący do sali', c2p:'Front baru jest podświetlany i wymienny. Wybieracie jeden z gotowych wzorów albo dajecie własną grafikę, np. z zaproszeń.',
    c3h:'Koktajl Pary Młodej', c3p:'Przed weselem ustalamy z Wami koktajl autorski z Waszą nazwą. Dla dzieci i osób niepijących są wersje 0%.',
    cfgH:'Ułóż swój bar', cfgP:'Cztery kroki. Cena po prawej zmienia się po każdym kliknięciu, a na końcu wysyłacie nam gotowy wybór.',
    s1:'Krok 1', s1h:'Ilu będzie gości?', s1p:'Liczą się dorośli goście. Dzieci nie wliczamy.',
    crew1:'1 barman', crew2:'2 barmanów', crew3:'3 barmanów', crewHint:'{crew} · ok. {n} koktajli na całe wesele',
    reprice:'Przy innej liczbie gości niż w zapytaniu cenę potwierdzimy mailowo.',
    s2:'Krok 2', s2h:'Czy na stołach będzie wódka?', s2p:'Od tego zależy, ile koktajli potrzeba. Gdy wódka stoi na stołach, wystarczają średnio 3 koktajle na osobę. Gdy wszystko idzie z baru, liczymy 4.',
    yes:'Tak, będzie', no:'Nie, wszystko z baru',
    more:'Chcemy 4 koktajle na osobę', moreS:'Większa pula na całe wesele, bez obaw, że zabraknie przed północą.',
    forced:'Bez wódki na stołach liczymy 4 koktajle na osobę.',
    s3:'Krok 3', s3h:'Wybierzcie menu', s3p:'Od {min} do {max} koktajli. Zaznaczyliśmy zestaw, który najczęściej wybierają pary. Menu nie zmienia ceny.',
    zero:'też 0%', picked:'Wybrane: {n} z {max}', pickMore:'Wybrane: {n}. Dobierzcie jeszcze {k}, żeby było minimum {min}.',
    s4:'Krok 4', s4h:'Front baru i dodatki', s4p:'Front wybieracie w cenie: lustro srebrne lub złote, panel pomalowany na Wasz kolor albo podświetlana klisza. Dodatki są opcjonalne.',
    frontFilm:'Ten sam bar, różne fronty. Wizualizacja.', bvPlay:'▶ Pokaż wszystkie fronty', bvStop:'■ Zatrzymaj', c_black:'Czarny mat', c_sage:'Zielony', c_navy:'Granat', c_blush:'Pudrowy róż', barGreen:'Bar zielony z kasetonami, 2 m', barOlive:'Bar oliwkowy, 3 m', own:'Własna grafika', frontN:'Klisza {n}', fSilver:'Lustro srebrne', fGold:'Lustro złote', fColor:'Panel w Waszym kolorze',
    aFlair:'Pokaz barmański flair', aFlairS:'Żonglerka butelkami i shakerami na parkiecie, z udziałem gości.',
    aBrand:'Bar z Waszą grafiką', aBrandS:'Inicjały, data albo motyw z zaproszeń na podświetlanym froncie.',
    aTower:'Champagne tower', aTowerS:'Piramida kieliszków zalewana winem musującym. Cena zależy od liczby kieliszków.',
    aWelcome:'Welcome drinks', aWelcomeS:'Koktajl na powitanie gości przed wejściem na salę.',
    aCoffee:'Bar kawowy z baristą', aCoffeeS:'Espresso, cappuccino i latte z ekspresu kolbowego przez całe wesele.',
    from:'od ', ask:'wycenimy',
    yourPrice:'Wasza cena', perPerson:'ok. {n} za osobę', lBar:'Bar koktajlowy, {g} gości', lFourth:'4 koktajle na osobę', lAsk:'do wyceny',
    inclH:'W cenie', incl:['{crew} przez 8 godzin','alkohole do koktajli, soki, puree, owoce i lód','mobilny bar z wybranym frontem','szkło w 5 rodzajach i cały sprzęt','wydrukowane menu i koktajl autorski','dojazd, montaż i demontaż'],
    valid:'Cena ważna do {d}', book:'Rezerwuję termin',
    crewH:'Barmani, z którymi pracujemy i pracowaliśmy', crewP:'Przez nasz bar przeszło wielu barmanów. Część z nich do dziś dołącza do nas przy większych weselach.',
    teamH:'Kto przyjedzie', teamP:'Na weselach pracujemy w stałym składzie. Przy większej liczbie gości dołącza barman, z którym pracujemy na co dzień.',
    tomekL:'Właściciel · barman od 2013', tomekP:'Założył Pimp My Bar w 2013 roku. Przez pięć lat występował z pokazami flair, czyli żonglerką barmańską. Osobiście układa menu z każdą parą.',
    tomekC:['flair','PL · EN · DE'],
    patrykL:'Szef baru · w Pimp My Bar od 2020', patrykP:'Prowadzi bar na weselach i eventach firmowych. Obsługuje gości po polsku i po angielsku.',
    patrykC:['koktajle na żywo','PL · EN'],
    workH:'Z naszych wesel', workP:'Wszystkie zdjęcia pochodzą z naszych realizacji. Działamy od 2013 roku i mamy za sobą ponad 2 000 eventów.',
    cofL:'Dodatek', cofH:'Bar kawowy z baristą', cofP:'Ten sam zespół prowadzi bary kawowe na targach w Polsce i za granicą. Na weselu barista podaje espresso, cappuccino i latte przez cały wieczór. Bar kawowy można zaznaczyć w dodatkach.', cofA:'Film z targów na Instagramie →',
    faqH:'Pytania, które zwykle padają', faqP:'Jeśli czegoś tu brakuje, napiszcie albo zadzwońcie.',
    faq:[
      ['Czy alkohol jest w cenie?','Tak. W cenie są alkohole do koktajli (gin, rum, whisky, tequila, likiery, wino musujące), soki, puree, owoce i lód. Wódkę do koktajli na wódce bierzemy z Waszej wódki weselnej. Ile butelek, podamy po wyborze menu.'],
      ['Płacimy za koktajl czy za godzinę?','Ani tak, ani tak. Jest jedna cena za całe wesele, liczona od liczby gości. Obejmuje 8 godzin pracy baru i pulę koktajli na wszystkich.'],
      ['Co znaczy „3 koktajle na osobę”?','To pula na całe wesele, a nie limit dla gościa. Przy {g} gościach przygotowujemy ok. {n} koktajli. Jedni wypiją pięć, inni żadnego.'],
      ['Czy możemy zmienić menu później?','Tak. Menu zamykamy z Wami przed weselem. To, co wybierzecie teraz, jest punktem wyjścia do rozmowy.'],
      ['Co musi zapewnić sala?','Miejsce na bar: ok. 2 × 2 m przy jednym barmanie i ok. 3 × 3 m przy dwóch. Do tego gniazdko prądu w pobliżu i mycie szkła w zmywalni sali. Resztę przywozimy sami.'],
      ['Jak rezerwujemy termin?','Klikacie „Rezerwuję termin” albo piszecie do nas. Wysyłamy umowę, a termin jest Wasz po jej podpisaniu. Nie pobieramy zadatku.']
    ],
    accH:'Rezerwujemy termin', accP:'Kliknijcie przycisk, a otworzy się gotowy mail z Waszym wyborem. Można też po prostu zadzwonić.',
    yourChoice:'Wasz wybór', send:'Wyślij wybór mailem', copy:'Kopiuj', copied:'Skopiowano',
    sumGuests:'{g} gości', sumVodkaY:'wódka na stołach', sumVodkaN:'bez wódki na stołach', sumPer:'{n} koktajle na osobę', sumFront:'front: {f}', sumOwn:'własna grafika',
    mailSubj:'Rezerwacja baru na wesele {d} – {v}', mailHi:'Dzień dobry,\n\nchcemy zarezerwować bar na nasze wesele.\n', mailBye:'\nPozdrawiamy',
    foot:'Pimp My Bar · Poznań · pimpmybar.pl', footR:'Ceny w PLN. Oferta przygotowana {d}.', menuL:'Menu', addL:'Dodatki', none:'brak'
  },
  en:{
    hook:['Cocktails made live.','For every guest.'], rot:['Fresh fruit, made in front of your guests','The bartender asks what you like instead of pointing at a menu','One price for the whole evening, travel included'],
    eveH:'An evening at the bar', illus:'Illustrative photos.', filmH:'See how we work', filmP:'Pimp My Bar showreel, 1 min 22 s',
    eve:[['Welcome','A welcome drink is waiting before guests enter the room.'],['A chat at the bar','The bartender asks about your favourite fruit, flavour and spirit, then makes the cocktail.'],['Your menu','Six to eight cocktails you choose yourselves. Several also alcohol-free.'],['Your cocktail','A signature cocktail with your own name, agreed before the wedding.'],['Flair show','Bottle juggling on the dance floor, with guests joining in. Optional extra.'],['Champagne tower','A pyramid of glasses for the toast or before the cake. Optional extra.']],
    tag:'/ Weddings', offerFor:'Wedding offer', h1:'A cocktail bar for <em>your wedding</em>',
    lead:'Every cocktail is made live at the bar, with fresh fruit. Build your own menu below and see the price straight away.',
    fDate:'Date', fPlace:'Venue', fGuests:'Guests', fTime:'Bar service', hours:'8 hours', guestsN:'{n} guests',
    cta:'Build your bar ↓', play:'Watch our showreel',
    howH:'What it looks like', howP:'The bar stays in the room for the whole wedding. Guests walk up, chat with the bartender and get a cocktail made for them.',
    c1h:'A cocktail chosen in conversation', c1p:'The menu is on display, but the bartender still asks about your favourite fruit, flavour and spirit. That brings over guests who rarely order cocktails.',
    c2h:'A bar that suits the room', c2p:'The front of the bar is backlit and interchangeable. Pick one of our designs or send your own artwork, for example from your invitations.',
    c3h:'Your signature cocktail', c3p:'Before the wedding we create a cocktail with your own name. Children and non-drinkers get alcohol-free versions.',
    cfgH:'Build your bar', cfgP:'Four steps. The price on the right updates with every click, and at the end you send us your selection.',
    s1:'Step 1', s1h:'How many guests?', s1p:'Count adult guests only. Children are not included.',
    crew1:'1 bartender', crew2:'2 bartenders', crew3:'3 bartenders', crewHint:'{crew} · approx. {n} cocktails for the whole wedding',
    reprice:'If the guest count differs from your enquiry, we will confirm the price by email.',
    s2:'Step 2', s2h:'Will there be vodka on the tables?', s2p:'At Polish weddings vodka is usually served on the tables. If so, 3 cocktails per guest is enough on average. If everything comes from the bar, we plan 4.',
    yes:'Yes', no:'No, bar only',
    more:'We want 4 cocktails per guest', moreS:'A bigger pool for the whole wedding, so the bar never runs short before midnight.',
    forced:'Without vodka on the tables we plan 4 cocktails per guest.',
    s3:'Step 3', s3h:'Choose your menu', s3p:'Between {min} and {max} cocktails. We have ticked the set couples choose most often. The menu does not change the price.',
    zero:'also 0%', picked:'Selected: {n} of {max}', pickMore:'Selected: {n}. Add {k} more to reach the minimum of {min}.',
    s4:'Step 4', s4h:'Bar front and extras', s4p:'The bar front is included: silver or gold mirror, a panel painted in your colour, or a backlit print. Extras are optional.',
    frontFilm:'The same bar with different fronts. Visualisation.', bvPlay:'▶ Show all fronts', bvStop:'■ Stop', c_black:'Matte black', c_sage:'Green', c_navy:'Navy', c_blush:'Blush pink', barGreen:'Green panelled bar, 2 m', barOlive:'Olive bar, 3 m', own:'Own artwork', frontN:'Print {n}', fSilver:'Silver mirror', fGold:'Gold mirror', fColor:'Panel in your colour',
    aFlair:'Flair bartending show', aFlairS:'Bottle and shaker juggling on the dance floor, with guests joining in.',
    aBrand:'Bar with your artwork', aBrandS:'Your initials, date or invitation motif on the backlit bar front.',
    aTower:'Champagne tower', aTowerS:'A pyramid of glasses filled with sparkling wine. Price depends on the number of glasses.',
    aWelcome:'Welcome drinks', aWelcomeS:'A cocktail to greet guests before they enter the room.',
    aCoffee:'Coffee bar with a barista', aCoffeeS:'Espresso, cappuccino and latte from an espresso machine all evening.',
    from:'from ', ask:'on request',
    yourPrice:'Your price', perPerson:'approx. {n} per guest', lBar:'Cocktail bar, {g} guests', lFourth:'4 cocktails per guest', lAsk:'on request',
    inclH:'Included', incl:['{crew} for 8 hours','spirits for the cocktails, juices, purées, fruit and ice','mobile bar with the front you choose','five types of glassware and all equipment','printed menu and your signature cocktail','travel, set-up and take-down'],
    valid:'Price valid until {d}', book:'Reserve our date',
    crewH:'Bartenders we work and have worked with', crewP:'Many bartenders have worked behind our bar over the years. Some still join us for larger weddings.',
    teamH:'Who is coming', teamP:'We work weddings with a fixed crew. For larger guest lists, a bartender we work with regularly joins us.',
    tomekL:'Owner · bartender since 2013', tomekP:'Founded Pimp My Bar in 2013. Performed flair bartending shows for five years. Plans the menu with every couple personally.',
    tomekC:['flair','PL · EN · DE'],
    patrykL:'Head bartender · with Pimp My Bar since 2020', patrykP:'Runs the bar at weddings and corporate events. Serves guests in Polish and English.',
    patrykC:['live cocktails','PL · EN'],
    workH:'From our weddings', workP:'All photos come from our own events. We have been running since 2013, with more than 2,000 events behind us.',
    cofL:'Extra', cofH:'Coffee bar with a barista', cofP:'The same team runs coffee bars at trade fairs in Poland and abroad. At a wedding, a barista serves espresso, cappuccino and latte all evening. You can tick the coffee bar in the extras.', cofA:'Trade-fair film on Instagram →',
    faqH:'Questions we usually get', faqP:'If something is missing here, write or call us.',
    faq:[
      ['Is the alcohol included?','Yes. The price includes the spirits for the cocktails (gin, rum, whisky, tequila, liqueurs, sparkling wine), juices, purées, fruit and ice. For vodka-based cocktails we use your wedding vodka. We will tell you how many bottles once the menu is set.'],
      ['Do you charge per drink or per hour?','Neither. There is one price for the whole wedding, based on the number of guests. It covers 8 hours of bar service and a pool of cocktails for everyone.'],
      ['What does "3 cocktails per guest" mean?','It is a pool for the whole wedding, not a limit per person. For {g} guests we prepare approx. {n} cocktails. Some guests have five, others none.'],
      ['Can we change the menu later?','Yes. We finalise the menu with you before the wedding. What you pick now is a starting point.'],
      ['What does the venue need to provide?','Space for the bar: about 2 × 2 m with one bartender and about 3 × 3 m with two. Plus a power socket nearby and glass washing in the venue kitchen. We bring everything else.'],
      ['How do we reserve the date?','Click "Reserve our date" or write to us. We send a contract, and the date is yours once it is signed. We do not take a deposit.']
    ],
    accH:'Let’s reserve your date', accP:'Click the button and an email with your selection opens, ready to send. Or simply call us.',
    yourChoice:'Your selection', send:'Send selection by email', copy:'Copy', copied:'Copied',
    sumGuests:'{g} guests', sumVodkaY:'vodka on tables', sumVodkaN:'no vodka on tables', sumPer:'{n} cocktails per guest', sumFront:'bar front: {f}', sumOwn:'own artwork',
    mailSubj:'Wedding bar reservation {d} – {v}', mailHi:'Hello,\n\nwe would like to reserve the bar for our wedding.\n', mailBye:'\nBest regards',
    foot:'Pimp My Bar · Poznań, Poland · pimpmybar.pl', footR:'Prices in PLN. Offer prepared {d}.', menuL:'Menu', addL:'Extras', none:'none'
  },
  de:{
    hook:['Cocktails, live gemixt.','Für jeden Gast.'], rot:['Mit frischen Früchten, vor euren Gästen','Der Barkeeper fragt nach eurem Geschmack, statt auf die Karte zu zeigen','Ein Preis für den ganzen Abend, Anfahrt inklusive'],
    eveH:'Ein Abend an der Bar', illus:'Beispielfotos.', filmH:'So arbeiten wir', filmP:'Pimp My Bar Showreel, 1 Min. 22 Sek.',
    eve:[['Empfang','Ein Welcome Drink wartet, bevor die Gäste den Saal betreten.'],['Gespräch an der Bar','Der Barkeeper fragt nach Lieblingsfrucht, Geschmack und Spirituose. Erst dann mixt er.'],['Eure Karte','Sechs bis acht Cocktails, die ihr selbst auswählt. Einige auch alkoholfrei.'],['Euer Cocktail','Ein Signature-Cocktail mit eurem Namen, vor der Hochzeit abgestimmt.'],['Flair-Show','Flaschenjonglage auf der Tanzfläche, die Gäste machen mit. Extra.'],['Champagnerpyramide','Eine Gläserpyramide zum Anstoßen oder vor der Torte. Extra.']],
    tag:'/ Hochzeiten', offerFor:'Hochzeitsangebot', h1:'Eine Cocktailbar für <em>eure Hochzeit</em>',
    lead:'Jeder Cocktail entsteht live an der Bar, mit frischen Früchten. Stellt unten eure eigene Karte zusammen und seht sofort den Preis.',
    fDate:'Termin', fPlace:'Ort', fGuests:'Gäste', fTime:'Barservice', hours:'8 Stunden', guestsN:'{n} Gäste',
    cta:'Bar zusammenstellen ↓', play:'Showreel ansehen',
    howH:'So sieht es aus', howP:'Die Bar steht die ganze Feier über im Saal. Die Gäste kommen vorbei, sprechen mit dem Barkeeper und bekommen einen Cocktail, der für sie gemacht wird.',
    c1h:'Cocktail im Gespräch gewählt', c1p:'Die Karte steht bereit, trotzdem fragt der Barkeeper nach Lieblingsfrucht, Geschmack und Spirituose. So kommen auch Gäste, die sonst keine Cocktails trinken.',
    c2h:'Eine Bar, die zum Saal passt', c2p:'Die Front der Bar ist beleuchtet und austauschbar. Ihr wählt eines unserer Motive oder schickt eure eigene Grafik, zum Beispiel von den Einladungen.',
    c3h:'Euer Signature-Cocktail', c3p:'Vor der Hochzeit entwickeln wir einen Cocktail mit eurem Namen. Für Kinder und Gäste ohne Alkohol gibt es alkoholfreie Varianten.',
    cfgH:'Stellt eure Bar zusammen', cfgP:'Vier Schritte. Der Preis rechts ändert sich mit jedem Klick, am Ende schickt ihr uns eure Auswahl.',
    s1:'Schritt 1', s1h:'Wie viele Gäste?', s1p:'Gezählt werden erwachsene Gäste. Kinder rechnen wir nicht mit.',
    crew1:'1 Barkeeper', crew2:'2 Barkeeper', crew3:'3 Barkeeper', crewHint:'{crew} · ca. {n} Cocktails für die ganze Feier',
    reprice:'Weicht die Gästezahl von eurer Anfrage ab, bestätigen wir den Preis per E-Mail.',
    s2:'Schritt 2', s2h:'Steht Wodka auf den Tischen?', s2p:'Auf polnischen Hochzeiten steht meist Wodka auf den Tischen. Dann reichen im Schnitt 3 Cocktails pro Gast. Kommt alles von der Bar, planen wir 4.',
    yes:'Ja', no:'Nein, nur Bar',
    more:'Wir möchten 4 Cocktails pro Gast', moreS:'Ein größeres Kontingent für die ganze Feier, damit vor Mitternacht nichts ausgeht.',
    forced:'Ohne Wodka auf den Tischen planen wir 4 Cocktails pro Gast.',
    s3:'Schritt 3', s3h:'Wählt eure Karte', s3p:'Zwischen {min} und {max} Cocktails. Vorausgewählt ist die Auswahl, die Paare am häufigsten nehmen. Die Karte ändert den Preis nicht.',
    zero:'auch 0%', picked:'Ausgewählt: {n} von {max}', pickMore:'Ausgewählt: {n}. Wählt noch {k} dazu, das Minimum sind {min}.',
    s4:'Schritt 4', s4h:'Barfront und Extras', s4p:'Die Barfront ist im Preis enthalten: Silber- oder Goldspiegel, ein Paneel in eurer Farbe oder ein beleuchtetes Motiv. Extras sind optional.',
    frontFilm:'Dieselbe Bar mit verschiedenen Fronten. Visualisierung.', bvPlay:'▶ Alle Fronten zeigen', bvStop:'■ Stopp', c_black:'Schwarz matt', c_sage:'Grün', c_navy:'Marineblau', c_blush:'Puderrosa', barGreen:'Grüne Kassettenbar, 2 m', barOlive:'Olivgrüne Bar, 3 m', own:'Eigene Grafik', frontN:'Motiv {n}', fSilver:'Silberspiegel', fGold:'Goldspiegel', fColor:'Paneel in eurer Farbe',
    aFlair:'Flair-Bartending-Show', aFlairS:'Jonglage mit Flaschen und Shakern auf der Tanzfläche, die Gäste machen mit.',
    aBrand:'Bar mit eurer Grafik', aBrandS:'Initialen, Datum oder das Motiv der Einladungen auf der beleuchteten Barfront.',
    aTower:'Champagnerpyramide', aTowerS:'Eine Pyramide aus Gläsern, gefüllt mit Schaumwein. Der Preis hängt von der Zahl der Gläser ab.',
    aWelcome:'Welcome Drinks', aWelcomeS:'Ein Cocktail zur Begrüßung, bevor die Gäste in den Saal gehen.',
    aCoffee:'Kaffeebar mit Barista', aCoffeeS:'Espresso, Cappuccino und Latte aus der Siebträgermaschine, den ganzen Abend.',
    from:'ab ', ask:'auf Anfrage',
    yourPrice:'Euer Preis', perPerson:'ca. {n} pro Gast', lBar:'Cocktailbar, {g} Gäste', lFourth:'4 Cocktails pro Gast', lAsk:'auf Anfrage',
    inclH:'Im Preis enthalten', incl:['{crew} für 8 Stunden','Spirituosen für die Cocktails, Säfte, Pürees, Früchte und Eis','mobile Bar mit der gewählten Front','fünf Glastypen und die gesamte Ausstattung','gedruckte Karte und euer Signature-Cocktail','Anfahrt, Auf- und Abbau'],
    valid:'Preis gültig bis {d}', book:'Termin reservieren',
    crewH:'Barkeeper, mit denen wir arbeiten und gearbeitet haben', crewP:'Über die Jahre standen viele Barkeeper hinter unserer Bar. Einige kommen bei größeren Hochzeiten bis heute dazu.',
    teamH:'Wer kommt', teamP:'Auf Hochzeiten arbeiten wir im festen Team. Bei mehr Gästen kommt ein Barkeeper dazu, mit dem wir regelmäßig arbeiten.',
    tomekL:'Inhaber · Barkeeper seit 2013', tomekP:'Hat Pimp My Bar 2013 gegründet und fünf Jahre lang Flair-Shows gezeigt. Von 2016 bis 2024 lebte er in Jena. Die Karte plant er mit jedem Paar persönlich.',
    tomekC:['Flair','PL · EN · DE'],
    patrykL:'Barchef · seit 2020 bei Pimp My Bar', patrykP:'Leitet die Bar auf Hochzeiten und Firmenevents. Bedient die Gäste auf Polnisch und Englisch.',
    patrykC:['Cocktails live','PL · EN'],
    workH:'Von unseren Hochzeiten', workP:'Alle Fotos stammen von unseren eigenen Events. Wir sind seit 2013 dabei, mit über 2.000 Veranstaltungen.',
    cofL:'Extra', cofH:'Kaffeebar mit Barista', cofP:'Dasselbe Team betreibt Kaffeebars auf Messen in Polen und im Ausland. Auf der Hochzeit serviert ein Barista den ganzen Abend Espresso, Cappuccino und Latte. Die Kaffeebar könnt ihr bei den Extras ankreuzen.', cofA:'Messefilm auf Instagram →',
    faqH:'Häufige Fragen', faqP:'Fehlt hier etwas, schreibt uns oder ruft an.',
    faq:[
      ['Ist der Alkohol im Preis enthalten?','Ja. Im Preis sind die Spirituosen für die Cocktails (Gin, Rum, Whisky, Tequila, Liköre, Schaumwein), Säfte, Pürees, Früchte und Eis. Für Cocktails auf Wodkabasis nehmen wir euren Hochzeitswodka. Wie viele Flaschen, sagen wir euch, sobald die Karte steht.'],
      ['Rechnet ihr pro Drink oder pro Stunde ab?','Weder noch. Es gibt einen Preis für die ganze Hochzeit, berechnet nach der Gästezahl. Er umfasst 8 Stunden Barservice und ein Cocktailkontingent für alle.'],
      ['Was bedeutet „3 Cocktails pro Gast“?','Das ist ein Kontingent für die ganze Feier, kein Limit pro Person. Für {g} Gäste bereiten wir ca. {n} Cocktails vor. Manche trinken fünf, andere keinen.'],
      ['Können wir die Karte später ändern?','Ja. Die Karte legen wir vor der Hochzeit gemeinsam fest. Eure Auswahl jetzt ist der Ausgangspunkt.'],
      ['Was muss die Location stellen?','Platz für die Bar: etwa 2 × 2 m bei einem Barkeeper und etwa 3 × 3 m bei zwei. Dazu eine Steckdose in der Nähe und das Spülen der Gläser in der Küche der Location. Alles andere bringen wir mit.'],
      ['Wie reservieren wir den Termin?','Klickt auf „Termin reservieren“ oder schreibt uns. Wir schicken den Vertrag, und der Termin gehört euch, sobald er unterschrieben ist. Eine Anzahlung nehmen wir nicht.']
    ],
    accH:'Wir reservieren euren Termin', accP:'Klickt auf den Button und es öffnet sich eine fertige E-Mail mit eurer Auswahl. Oder ruft einfach an.',
    yourChoice:'Eure Auswahl', send:'Auswahl per E-Mail senden', copy:'Kopieren', copied:'Kopiert',
    sumGuests:'{g} Gäste', sumVodkaY:'Wodka auf den Tischen', sumVodkaN:'kein Wodka auf den Tischen', sumPer:'{n} Cocktails pro Gast', sumFront:'Barfront: {f}', sumOwn:'eigene Grafik',
    mailSubj:'Reservierung Hochzeitsbar {d} – {v}', mailHi:'Hallo,\n\nwir möchten die Bar für unsere Hochzeit reservieren.\n', mailBye:'\nViele Grüße',
    foot:'Pimp My Bar · Poznań, Polen · pimpmybar.pl', footR:'Preise in PLN. Angebot erstellt am {d}.', menuL:'Karte', addL:'Extras', none:'keine'
  }};

  var LANGS = O.langs || ['pl','en','de'];
  var lang = O.lang || 'pl';
  try{
    var q = (location.search.match(/[?&]lang=(pl|en|de)/)||[])[1];
    var saved = localStorage.getItem('pmb_lang_'+O.id);
    if (q) lang = q; else if (saved && LANGS.indexOf(saved)>-1) lang = saved;
  }catch(e){}

  var state = {
    guests: O.guests, vodka: true, more: false,
    menu: DRINKS.filter(function(d){return d.d}).map(function(d){return d.id}),
    front: 'silver', own: false,
    add: {flair:false, tower:false, welcome:false, coffee:false}
  };

  var rotT;
  var $ = function(id){return document.getElementById(id)};
  function t(k, v){ var s = T[lang][k]; if (v) for (var p in v) s = s.split('{'+p+'}').join(v[p]); return s; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}); }
  function money(n){
    var s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lang==='pl' ? ' ' : (lang==='de' ? '.' : ','));
    return lang==='pl' ? s+' zł' : s+' PLN';
  }
  function crewN(g){ return g<=90 ? 1 : (g<=180 ? 2 : 3); }
  function perGuest(){ return (state.more || !state.vodka) ? 4 : 3; }

  function calc(){
    var g = state.guests, lines = [], total;
    var bar = (g === O.guests && O.price) ? O.price : PRICE.base + PRICE.perGuest*g;
    lines.push([t('lBar',{g:g}), bar]); total = bar;
    if (perGuest()===4){ var f = PRICE.fourth*g; lines.push([t('lFourth'), f]); total += f; }
    if (state.add.flair){ lines.push([t('aFlair'), PRICE.flair]); total += PRICE.flair; }
    if (state.own){ lines.push([t('aBrand'), PRICE.branding]); total += PRICE.branding; }
    if (state.add.tower){ lines.push([t('aTower'), PRICE.tower, true]); total += PRICE.tower; }
    if (state.add.welcome) lines.push([t('aWelcome'), null]);
    if (state.add.coffee) lines.push([t('aCoffee'), null]);
    return {lines:lines, total:total, from: state.add.tower};
  }
  function frontName(id){ var n = 0, r = ''; FRONTS.forEach(function(f){ if (f.img && !f.k) n++; if (f.id===id) r = f.k ? t(f.k) : t('frontN',{n:n}); }); return r; }
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
  function bvCurrent(){ return state.own ? 'sage' : (state.front==='color' ? 'sage' : state.front); }
  function menuNames(){ return DRINKS.filter(function(d){return state.menu.indexOf(d.id)>-1}).map(function(d){return d.n}); }
  function summary(){
    var c = calc(), parts = [t('sumGuests',{g:state.guests}), state.vodka?t('sumVodkaY'):t('sumVodkaN'), t('sumPer',{n:perGuest()}),
      t('sumFront',{f: state.own ? t('sumOwn') : frontName(state.front)})];
    var adds = c.lines.slice(1).filter(function(l){return l[0]!==t('lFourth')}).map(function(l){return l[0]});
    return {head: parts.join(' · '), menu: menuNames().join(', '), adds: adds.length ? adds.join(', ') : t('none'), total: (c.from?t('from'):'')+money(c.total)};
  }

  // ── Szkielet strony ──
  function build(){
    if (bvTimer){ clearInterval(bvTimer); bvTimer = null; }
    document.documentElement.lang = lang;
    var L = T[lang], P = O.t && O.t[lang] || {};
    var h = '';
    var M = O.media || MEDIA;
    h += '<header class="hero2"><div class="hero2-media">'+(M.video ? '<video src="'+M.video+'" poster="'+M.poster+'" autoplay muted loop playsinline preload="auto"></video>' : '<img class="kb" src="'+M.poster+'" alt="">')+'</div>';
    h += '<div class="hero2-top wrap"><a class="brand" href="https://www.pimpmybar.pl" target="_blank" rel="noopener">Pimp My Bar</a>';
    h += '<div class="langs" role="group" aria-label="Language">'+LANGS.map(function(l){return '<button type="button" data-lang="'+l+'" aria-pressed="'+(l===lang)+'">'+l.toUpperCase()+'</button>'}).join('')+'</div></div>';
    h += '<div class="hero2-body wrap"><p class="hero2-for">'+esc(P.label || L.offerFor)+'</p><h1 class="hook">'+L.hook.map(function(line,i){ return '<span class="hl">'+line.split(' ').map(function(w,j){ return '<span class="w" style="--d:'+(i*4+j)+'">'+esc(w)+'</span>'; }).join(' ')+'</span>'; }).join('')+'</h1>';
    h += '<p class="hero2-rot" id="rot" aria-live="off">'+esc(L.rot[0])+'</p></div>';
    h += '<div class="hero2-foot"><div class="wrap hero2-strip"><dl class="facts2"><div><dt>'+L.fDate+'</dt><dd>'+esc(O.date)+'</dd></div><div><dt>'+L.fPlace+'</dt><dd>'+esc(O.venue)+'</dd></div><div><dt>'+L.fGuests+'</dt><dd>'+esc(P.guestsLabel || t('guestsN',{n:O.guests}))+'</dd></div><div><dt>'+L.yourPrice+'</dt><dd class="num" id="peek"></dd></div></dl><a class="btn" href="#bar">'+L.cta+'</a></div></div></header>';

    h += '<section class="eve"><div class="wrap"><div class="sec-head"><h2>'+L.eveH+'</h2><p>'+esc(P.lead || L.lead)+'</p></div></div><ol class="rail" id="rail">';
    L.eve.forEach(function(e,i){ h += '<li><figure><img src="'+M.strip[i]+'" alt="" loading="lazy"><figcaption><span class="n">'+(i+1)+'</span><strong>'+e[0]+'</strong><span>'+e[1]+'</span></figcaption></figure></li>'; });
    h += '</ol><div class="wrap"><p class="illus">'+L.illus+'</p></div></section>';

    h += '<section id="bar"><div class="wrap"><div class="sec-head"><h2>'+L.cfgH+'</h2><p>'+L.cfgP+'</p></div><div class="cfg"><div>';
    h += '<div class="block"><span class="step">'+L.s1+'</span><h3>'+L.s1h+'</h3><p>'+L.s1p+'</p><div class="guests"><output id="g-out" for="g"></output><input type="range" id="g" min="40" max="200" step="5" aria-label="'+esc(L.s1h)+'"></div><p class="hint" id="g-hint"></p></div>';
    h += '<div class="block"><span class="step">'+L.s2+'</span><h3>'+L.s2h+'</h3><p>'+L.s2p+'</p><div class="seg" role="group"><button type="button" id="v-yes">'+L.yes+'</button><button type="button" id="v-no">'+L.no+'</button></div>';
    h += '<label class="addon" for="more"><input type="checkbox" id="more"><span><strong>'+L.more+'</strong><small id="more-s"></small></span><b id="more-p"></b></label></div>';
    h += '<div class="block"><span class="step">'+L.s3+'</span><h3>'+L.s3h+'</h3><p>'+t('s3p',{min:MENU_MIN,max:MENU_MAX})+'</p><div class="menu">';
    DRINKS.forEach(function(d){ h += '<label class="drink" for="d-'+d.id+'"><input type="checkbox" id="d-'+d.id+'" data-drink="'+d.id+'"><span><strong>'+esc(d.n)+(d.z?'<span class="zero">'+L.zero+'</span>':'')+'</strong><small>'+esc(d[lang])+'</small></span></label>'; });
    h += '</div><p class="count" id="m-count" aria-live="polite"></p></div>';
    h += '<div class="block"><span class="step">'+L.s4+'</span><h3>'+L.s4h+'</h3><p>'+L.s4p+'</p><figure class="barview" id="barview"><img id="bv-img" src="'+BV.base+'" alt=""><i class="pl"></i><i class="pr"></i><video id="bv-film" src="'+A+'fronty-film.mp4" muted loop playsinline preload="metadata" hidden></video><figcaption><span id="bv-cap"></span><button type="button" id="bv-play">'+L.bvPlay+'</button></figcaption></figure><div class="fronts" role="group">';
    FRONTS.forEach(function(f){ h += '<button type="button" class="front '+(f.css||'')+'" data-front="'+f.id+'" aria-label="'+esc(frontName(f.id))+'">'+(f.img ? '<img src="'+A+f.img+'" alt="" loading="lazy">' : '')+(f.k ? '<span>'+esc(frontName(f.id))+'</span>' : '')+'</button>'; });
    h += '</div><p class="hint" id="f-name">';
    h += '</p>';
    if (FRONT_FILM) h += '<figure class="frontfilm"><video src="'+FRONT_FILM+'" poster="'+A+'bar-ref.jpg" autoplay muted loop playsinline preload="metadata"></video><figcaption>'+L.frontFilm+'</figcaption></figure>';
    h += addon('own', L.aBrand, L.aBrandS, '+ '+money(PRICE.branding));
    h += addon('flair', L.aFlair, L.aFlairS, '+ '+money(PRICE.flair));
    h += addon('tower', L.aTower, L.aTowerS, L.from+money(PRICE.tower));
    h += addon('welcome', L.aWelcome, L.aWelcomeS, L.ask);
    h += addon('coffee', L.aCoffee, L.aCoffeeS, L.ask);
    h += '</div></div>';
    h += '<aside class="total" aria-live="polite"><span class="label">'+L.yourPrice+'</span><div class="sum" id="sum"></div><span class="sub" id="pp"></span><hr><ul class="lines" id="lines"></ul><hr><span class="label">'+L.inclH+'</span><ul class="incl" id="incl"></ul><hr><span class="sub">'+t('valid',{d:O.validUntil})+'</span><a class="btn" href="#rezerwacja" data-book>'+L.book+'</a></aside>';
    h += '</div></div></section>';

    h += '<section><div class="wrap"><div class="sec-head"><h2>'+L.teamH+'</h2><p>'+L.teamP+'</p></div>';
    h += '<div class="lead"><img src="'+A+'tomek.jpg" alt="Tomasz Malinowski" loading="lazy"><div class="who"><span class="label">'+L.tomekL+'</span><h3>Tomasz Malinowski</h3><div class="chips"><span class="chip k">'+L.tomekC[0]+'</span><span class="chip">'+L.tomekC[1]+'</span></div><p>'+L.tomekP+'</p></div></div><div class="team">';
    h += '<div class="person"><img class="avatar" src="'+A+'patryk.jpg" alt="Patryk Mroczkowski" loading="lazy"><div class="who"><span class="label">'+L.patrykL+'</span><h3>Patryk Mroczkowski</h3><div class="chips"><span class="chip k">'+L.patrykC[0]+'</span><span class="chip">'+L.patrykC[1]+'</span></div><p>'+L.patrykP+'</p></div></div>';
    h += '</div><div class="crew-head"><h3>'+L.crewH+'</h3><p>'+L.crewP+'</p></div><div class="crewgrid">'+[1,2,3,4].map(function(n){ return '<img src="'+A+'crew-'+n+'.jpg" alt="" loading="lazy">'; }).join('')+'</div></div></section>';

    h += '<section class="filmsec"><div class="wrap"><button type="button" class="bigfilm" id="film"><img src="'+M.filmPoster+'" alt="" loading="lazy"><span class="bigplay"><span class="tri" aria-hidden="true"></span></span><span class="bigcap"><strong>'+L.filmH+'</strong><span>'+L.filmP+'</span></span></button>';

    h += '<div class="feature"><div class="fmedia"><video src="'+A+'coffee.mp4" poster="'+A+'coffee-poster.jpg" autoplay muted loop playsinline preload="metadata"></video></div><div class="ftext"><span class="label">'+L.cofL+'</span><h3>'+L.cofH+'</h3><p>'+L.cofP+'</p><a class="more" href="https://www.instagram.com/p/C2c30XzIJnS/" target="_blank" rel="noopener" data-film2>'+L.cofA+'</a></div></div></div></section>';

    h += '<section><div class="wrap"><div class="sec-head"><h2>'+L.faqH+'</h2><p>'+L.faqP+'</p></div><div class="faq" id="faq"></div></div></section>';

    h += '<section id="rezerwacja"><div class="wrap"><div class="accept"><div class="col"><h2>'+L.accH+'</h2><p>'+L.accP+'</p><div class="choice"><span class="label">'+L.yourChoice+'</span><div id="choice"></div></div><a class="btn" id="send" href="#">'+L.send+'</a></div>';
    h += '<div class="contact"><div class="crow"><span>Tomasz Malinowski</span></div><div class="crow"><span id="c-mail">biuro@pimpmybar.pl</span><button class="copy" type="button" data-copy="c-mail">'+L.copy+'</button></div><div class="crow"><a href="tel:+48513916977" id="c-tel">+48 513 916 977</a><button class="copy" type="button" data-copy="c-tel">'+L.copy+'</button></div></div></div></div></section>';
    h += '<footer class="wrap"><span>'+L.foot+'</span><span>'+t('footR',{d:O.prepared})+'</span></footer>';
    h += '<div class="bar"><div><div class="s num" id="bar-sum"></div><small id="bar-pp"></small></div><a class="btn" href="#rezerwacja" data-book>'+L.book+'</a></div>';
    h += '<dialog id="modal" class="modal"><form method="dialog"><button class="modal-x" aria-label="Close">×</button></form><div class="modal-in"></div></dialog>';
    $('app').innerHTML = h;
    $('modal').addEventListener('close', function(){ $('modal').querySelector('.modal-in').innerHTML = ''; });
    $('modal').addEventListener('click', function(e){ if (e.target === $('modal')) $('modal').close(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function(e){ document.body.classList.toggle('at-hero', e[0].isIntersecting); },{threshold:.25}).observe(document.querySelector('.hero2'));
    clearInterval(rotT); var ri = 0, re = $('rot'); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) rotT = setInterval(function(){ re.classList.add('out'); setTimeout(function(){ ri = (ri+1)%T[lang].rot.length; re.textContent = T[lang].rot[ri]; re.classList.remove('out'); }, 400); }, 3400);
    document.title = (P.title || L.offerFor) + ' – Pimp My Bar';
    bind(); render();
  }
  function addon(id, a, b, p){ return '<label class="addon" for="a-'+id+'"><input type="checkbox" id="a-'+id+'" data-add="'+id+'"><span><strong>'+a+'</strong><small>'+b+'</small></span><b>'+p+'</b></label>'; }

  function render(){
    var L = T[lang], g = state.guests, c = calc(), n = perGuest();
    var crew = t('crew'+crewN(g));
    $('g').value = g; $('g-out').textContent = g;
    $('g-hint').textContent = t('crewHint',{crew:crew, n:g*n}) + (g!==O.guests ? ' · '+L.reprice : '');
    $('v-yes').setAttribute('aria-pressed', String(state.vodka)); $('v-no').setAttribute('aria-pressed', String(!state.vodka));
    var m = $('more'); m.checked = n===4; m.disabled = !state.vodka;
    $('more-s').textContent = state.vodka ? L.moreS : L.forced;
    $('more-p').textContent = '+ '+money(PRICE.fourth*g);
    var cnt = state.menu.length;
    document.querySelectorAll('[data-drink]').forEach(function(i){ var on = state.menu.indexOf(i.dataset.drink)>-1; i.checked = on; i.disabled = !on && cnt>=MENU_MAX; });
    var mc = $('m-count'); mc.className = 'count'+(cnt<MENU_MIN?' bad':'');
    mc.textContent = cnt<MENU_MIN ? t('pickMore',{n:cnt,k:MENU_MIN-cnt,min:MENU_MIN}) : t('picked',{n:cnt,max:MENU_MAX});
    document.querySelectorAll('[data-front]').forEach(function(b){ b.setAttribute('aria-pressed', String(!state.own && b.dataset.front===state.front)); });
    $('f-name').textContent = state.own ? t('sumOwn') : frontName(state.front);
    if (!bvTimer) bvPaint(bvCurrent());
    document.querySelectorAll('[data-add]').forEach(function(i){ i.checked = i.dataset.add==='own' ? state.own : state.add[i.dataset.add]; });
    var tot = (c.from?L.from:'')+money(c.total), pp = t('perPerson',{n:money(c.total/g)});
    $('sum').textContent = tot; $('pp').textContent = pp; $('bar-sum').textContent = tot; $('bar-pp').textContent = pp; $('peek').textContent = tot;
    $('lines').innerHTML = c.lines.map(function(l){ return '<li>'+esc(l[0])+' <b>'+(l[1]===null ? L.lAsk : (l[2]?L.from:'')+money(l[1]))+'</b></li>'; }).join('');
    $('incl').innerHTML = L.incl.map(function(s){ return '<li>'+esc(s.replace('{crew}',crew))+'</li>'; }).join('');
    $('faq').innerHTML = L.faq.map(function(f){ return '<details><summary>'+esc(f[0])+'</summary><p>'+esc(f[1].replace('{g}',g).replace('{n}',g*n))+'</p></details>'; }).join('');
    var s = summary();
    $('choice').innerHTML = '<strong>'+esc(s.total)+'</strong> · '+esc(s.head)+'<br><span class="label">'+L.menuL+'</span> '+esc(s.menu)+'<br><span class="label">'+L.addL+'</span> '+esc(s.adds);
    var body = L.mailHi+'\n'+O.date+', '+O.venue+'\n'+s.head+'\n'+L.menuL+': '+s.menu+'\n'+L.addL+': '+s.adds+'\n'+L.yourPrice+': '+s.total+'\n'+L.mailBye;
    $('send').href = 'mailto:biuro@pimpmybar.pl?subject='+encodeURIComponent(t('mailSubj',{d:O.date,v:O.venue}))+'&body='+encodeURIComponent(body);
  }

  function bind(){
    $('bv-play').addEventListener('click', function(){ if (bvTimer){ bvStop(); bvPaint(bvCurrent()); } else { bvStart(); once('bvplay','Ogląda pokaz frontów baru','art'); } });
    SEQ.forEach(function(k){ var i = new Image(); if (/^k\d+$/.test(k)){ i.src = klUrl(k,'l'); new Image().src = klUrl(k,'r'); } else i.src = BV[k] || BV.base; });
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) new IntersectionObserver(function(e,o){ if (e[0].isIntersecting){ if (!bvTouched) bvStart(); o.disconnect(); } },{threshold:.6}).observe($('barview'));
    document.querySelectorAll('[data-lang]').forEach(function(b){ b.addEventListener('click', function(){ lang = b.dataset.lang; try{localStorage.setItem('pmb_lang_'+O.id, lang)}catch(e){} once('lang'+lang,'Zmienił język na '+lang.toUpperCase(),'globe_with_meridians'); build(); }); });
    var gt; $('g').addEventListener('input', function(e){ state.guests = +e.target.value; render(); clearTimeout(gt); gt = setTimeout(function(){ ping('Ustawił liczbę gości: '+state.guests+' → '+summary().total,'busts_in_silhouette'); }, 2500); });
    $('v-yes').addEventListener('click', function(){ state.vodka = true; render(); });
    $('v-no').addEventListener('click', function(){ state.vodka = false; render(); once('vodka','Bez wódki na stołach (4 koktajle/os.) → '+summary().total,'cocktail'); });
    $('more').addEventListener('change', function(e){ state.more = e.target.checked; render(); if (state.more) once('more','Zaznaczył 4 koktajle na osobę → '+summary().total,'cocktail'); });
    var mt; document.querySelectorAll('[data-drink]').forEach(function(i){ i.addEventListener('change', function(){
      var k = state.menu.indexOf(i.dataset.drink); if (i.checked && k<0) state.menu.push(i.dataset.drink); if (!i.checked && k>-1) state.menu.splice(k,1);
      render(); clearTimeout(mt); mt = setTimeout(function(){ ping('Zmienił menu: '+menuNames().join(', '),'cocktail'); }, 6000);
    }); });
    document.querySelectorAll('[data-front]').forEach(function(b){ b.addEventListener('click', function(){ bvTouched = true; bvStop(); state.front = b.dataset.front; state.own = false; render(); ping('Front baru: '+T.pl[(FRONTS.filter(function(f){return f.id===state.front})[0]||{}).k||'frontN'].replace('{n}',''),'art'); }); });
    document.querySelectorAll('[data-add]').forEach(function(i){ i.addEventListener('change', function(){
      var id = i.dataset.add; if (id==='own') state.own = i.checked; else state.add[id] = i.checked; render();
      if (i.checked) once('add'+id,'Dodał: '+T.pl[{own:'aBrand',flair:'aFlair',tower:'aTower',welcome:'aWelcome',coffee:'aCoffee'}[id]]+' → '+summary().total,'heavy_plus_sign');
    }); });
    $('film').addEventListener('click', function(){ var d = $('modal'); d.querySelector('.modal-in').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/Btc8eqYrPd8?autoplay=1&rel=0" title="Showreel – Pimp My Bar" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'; d.showModal(); once('film','Ogląda showreel','movie_camera'); });
    document.querySelectorAll('[data-book]').forEach(function(a){ a.addEventListener('click', function(){ var s = summary(); once('book','Kliknął „Rezerwuję termin” → '+s.total+' · '+s.head,'white_check_mark',5); }); });
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
  try{ if (/[?&]ja(=|&|$)/.test(location.search)) localStorage.setItem('pmb_owner','1'); owner = localStorage.getItem('pmb_owner')==='1'; }catch(e){}
  function ping(msg, tags, prio){
    if (owner || O.noPing) return;
    try{ fetch(TOPIC+'?title='+encodeURIComponent(O.title)+'&tags='+encodeURIComponent(tags||'eyes')+(prio?'&priority='+prio:''), {method:'POST', body:msg, keepalive:true}).catch(function(){}); }catch(e){}
  }
  function once(k, msg, tags, prio){ if (sent[k]) return; sent[k] = 1; ping(msg, tags, prio); }

  build();
  var dev = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'telefon' : 'komputer', first = true;
  try{ first = !sessionStorage.getItem('pmb_seen_'+O.id); sessionStorage.setItem('pmb_seen_'+O.id,'1'); }catch(e){}
  if (first) ping('Ktoś otworzył ofertę ('+dev+')','eyes',4);
})();
