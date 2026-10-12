/* Pimp My Bar – teksty dla ofert na przyjęcia (urodziny, jubileusze, rocznice). Forma „Państwo”.
   Ładować PRZED ../wesele/offer.js. Teksty z danej oferty (window.OFFER.t.pl) mają pierwszeństwo. */
(function(){
  var O = window.OFFER; O.t = O.t || {}; O.langs = O.langs || ['pl'];
  var PACK = {
    tag:'/ Przyjęcia', offerFor:'Oferta na przyjęcie', h1:'Bar koktajlowy na <em>Państwa przyjęcie</em>',
    cta:'Zobacz ofertę ↓',
    howH:'Jak to wygląda', howP:'Bar stoi na sali przez całe przyjęcie. Goście podchodzą, rozmawiają z barmanem i dostają koktajl przygotowany specjalnie dla nich, na ich oczach.',
    c1h:'Koktajl dobrany w rozmowie', c1p:'Menu stoi obok, ale barman i tak zapyta o ulubiony smak i alkohol. Dzięki temu po koktajl przychodzą też goście, którzy zwykle ich nie piją.',
    c2h:'Bar pasujący do sali', c2p:'Front baru jest podświetlany i wymienny. Wybierają Państwo jeden z gotowych wzorów, lustro albo kolor.',
    c3h:'Koktajl dla Solenizanta', c3p:'Przed przyjęciem ustalamy z Państwem koktajl autorski z dedykowaną nazwą. Dla dzieci i osób niepijących są wersje 0%.',
    cfgH:'Państwa bar', cfgP:'Kilka kroków. Cena zmienia się po każdym kliknięciu, a na końcu wysyłają nam Państwo gotowy wybór.',
    s1h:'Ilu będzie gości?', s1p:'Liczą się dorośli goście. Dzieci nie wliczamy.',
    crewHint:'{crew} · ok. {n} koktajli na całe przyjęcie',
    reprice:'Przy innej liczbie gości niż w zapytaniu cenę potwierdzimy mailowo.',
    s2h:'Czy na stołach będzie wódka?', s2p:'Od tego zależy, ile koktajli potrzeba. Gdy wódka stoi na stołach, wystarczają średnio 3 koktajle na osobę. Gdy wszystko idzie z baru, liczymy 4.',
    moreS:'Większa pula na całe przyjęcie, bez obaw, że zabraknie przed końcem.',
    s3h:'Menu koktajli', s3p:'Od {min} do {max} koktajli. Zaznaczyliśmy zestaw, który goście wybierają najczęściej. Menu nie zmienia ceny.',
    pickMore:'Wybrane: {n}. Prosimy dobrać jeszcze {k}, minimum to {min}.',
    s4h:'Front baru i dodatki', s4p:'Front wybierają Państwo w cenie: lustro srebrne lub złote, panel w wybranym kolorze albo podświetlana klisza. Dodatki są opcjonalne.',
    fColor:'Panel w wybranym kolorze', lColor:'Panel w wybranym kolorze',
    aFlair:'Pokaz barmański flair', aFlairS:'Żonglerka butelkami i shakerami, z udziałem gości.',
    aBrand:'Bar z własną grafiką', aBrandS:'Imię, data albo zdjęcie na podświetlanym froncie baru.',
    aTowerS:'Piramida kieliszków zalewana winem musującym, np. do toastu. Cena zależy od liczby kieliszków.',
    aWelcomeS:'Koktajl na powitanie gości.',
    aCoffeeS:'Espresso, cappuccino i latte z ekspresu kolbowego przez całe przyjęcie.',
    yourPrice:'Cena', perPerson:'ok. {n} za osobę',
    crewH:'Barmani, z którymi pracujemy i pracowaliśmy', crewP:'Przez nasz bar przeszło wielu barmanów. Część z nich do dziś dołącza do nas przy większych realizacjach.',
    teamH:'Kto przyjedzie', teamP:'Pracujemy w stałym składzie. Przy większej liczbie gości dołącza barman, z którym pracujemy na co dzień.',
    tomekP:'Założył Pimp My Bar w 2013 roku. Laureat konkursów barmańskich w stylu klasycznym i flair. Za barem pracował m.in. w Indiach, USA i na Wyspach Kanaryjskich. Osobiście układa menu z każdym klientem.',
    patrykP:'Prowadzi bar na weselach, przyjęciach i eventach firmowych. Obsługuje gości po polsku i po angielsku.',
    workH:'Z naszych realizacji', workP:'Wszystkie zdjęcia pochodzą z naszych realizacji. Działamy od 2013 roku i mamy za sobą ponad 2 000 eventów.',
    cofP:'Ten sam zespół prowadzi bary kawowe na targach w Polsce i za granicą. Na przyjęciu barista podaje espresso, cappuccino i latte przez cały wieczór. Bar kawowy można zaznaczyć w dodatkach.',
    faqP:'Jeśli czegoś tu brakuje, prosimy napisać albo zadzwonić.',
    talkH:'Pytania? Proszę pytać śmiało.', talkP:'Jestem Tomek, prowadzę Pimp My Bar od 2013 roku. Proszę zadzwonić albo napisać: odpowiem na wszystkie pytania i doradzę menu pod Państwa gości.', talkContact:'Telefon lub e-mail', talkErr:'Proszę wpisać telefon lub e-mail, żebym mógł potwierdzić termin.',
    accH:'Rezerwacja terminu', accP:'Po kliknięciu otworzy się gotowy mail z Państwa wyborem. Można też po prostu zadzwonić.',
    yourChoice:'Państwa wybór',
    mailSubj:'Rezerwacja baru {d} – {v}', mailHi:'Dzień dobry,\n\nchcemy zarezerwować bar koktajlowy na przyjęcie.\n', mailBye:'\nPozdrawiam'
  };
  var P = O.t.pl = O.t.pl || {};
  for (var k in PACK) if (!(k in P)) P[k] = PACK[k];
})();
