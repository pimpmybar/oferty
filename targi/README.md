# Szablon ofert targowych (kawa) – `targi/`

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
   - `brand` (front baru z logo) i `cups` (kubki z nadrukiem) – usuń klucz, jeśli opcji nie ma
   - `form` – formularz umowy: `url`, `entries` (id pól), `prefill` (tylko dane firmy z rejestru, bez danych osobowych)
   - `t` – wszystkie teksty; tokeny `{total}`, `{perDay}`, `{rate}`, `{n}`, `{dni}`, `{limit}`, `{deposit}`… przeliczają się na żywo
3. Liczby do potwierdzenia przez właściciela oznacz `<span class="todo">…</span>` – podświetlają się tylko w podglądzie `?ja`.

## Podgląd
- `?ja` – podgląd właściciela: bez powiadomień i statystyk, widoczne pola do potwierdzenia
- `?test` – klikanie bez powiadomień, zdarzenia zapisują się z prefiksem `TEST-`
- „Wersja do druku (PDF)” – 3 strony A4 dla działu zakupów

## Zdarzenia (Supabase `offer_events`)
`wejscie`, `eyes`, `moneybag` (wycena), `electric_plug` (wymagania), `cup_with_straw` (kubki), `calendar` (zmiana dni),
`coffee` (limit), `art` (logo), `printer`, `white_check_mark` (formularz), `email`, `telephone_receiver`, `scroll`, `checkered_flag`, `time`.
