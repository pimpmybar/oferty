# Szablon ofert targowych (kawa, opcjonalnie koktajle) – `targi/`

Jedna oferta = jeden folder z `index.html`, w którym jest tylko konfiguracja `window.OFFER`.
Wygląd (`targi.css`) i logika (`targi.js`) są wspólne. Wzór: `coffee-bar-polbram-targi-poznan-01-2027/`.

## Nowa oferta
1. Skopiuj folder wzorcowy pod nową nazwę.
2. W `index.html` zmień `window.OFFER`:
   - `id`, `title`, `nr`, `prepared`, `validUntil`
   - `days` – lista dni `{d:"RRRR-MM-DD", from:"9:00", to:"16:00", b:1}`; `b` = numer terminu (bloku), bar stoi przez cały blok
   - `rates` – progi stawki dziennej obsługi `[[od ilu dni, stawka netto], …]`
   - `coffee` – `per100` (cena 100 kaw), `options` (limity dzienne do wyboru), `def`
   - `deposit`, `hoursIncl`, `extraHour`
   - `brand` (front baru z logo), `cups` (kubki z nadrukiem), `lids` (pokrywki) – usuń klucz, jeśli opcji nie ma; nakład kubków i pokrywek liczy się sam: limit kaw × dni, w górę do pełnej paczki `per`
   - `bar` (opcja) – bar koktajlowy: `menu` [{n, c, alc:[[butelka, porcji z butelki, zł netto]], zero}], `levels` (butelek mocnego alkoholu na koktajl), `def`, `per` (17), `assort` (zł/koktajl z lodem), `zero` (pula 0%), `glass`; wzór: `targi-meble-polska-restese-23-02-2027/`
   - `extras` (opcja) – dodatki do zaznaczenia `{h, short, p, price, on}`; `brandSub`, `variant`, `t.crewLabel`, `t.crewShort`, `t.serviceWord`, `t.setupWord` – etykiety dla wersji z koktajlami
   - `form` – formularz umowy: `url`, `entries` (id pól), `prefill` (tylko dane firmy z rejestru, bez danych osobowych)
   - `t` – wszystkie teksty; tokeny `{total}`, `{totalAlt}` i `{limitAlt}` (suma przy drugim limicie kaw), `{perDay}`, `{rate}`, `{n}`, `{dni}`, `{limit}`, `{cupsQty}`, `{cupsSel}`, `{lidsQty}`, `{deposit}`… przeliczają się na żywo
3. Liczby do potwierdzenia przez właściciela oznacz `<span class="todo">…</span>` – podświetlają się tylko w podglądzie `?ja`.

## Podgląd
- `?ja` – podgląd właściciela: bez powiadomień i statystyk, widoczne pola do potwierdzenia
- `?test` – klikanie bez powiadomień, zdarzenia zapisują się z prefiksem `TEST-`
- „Wersja do druku (PDF)” – 3–4 strony A4 dla działu zakupów

## Zdarzenia (Supabase `offer_events`)
`wejscie`, `eyes`, `moneybag` (wycena), `electric_plug` (wymagania), `cup_with_straw` (kubki), `calendar` (zmiana dni),
`coffee` (limit), `art` (logo), `printer`, `white_check_mark` (formularz), `email`, `telephone_receiver`, `scroll`, `checkered_flag`, `time`.
