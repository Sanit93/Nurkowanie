# Kalkulator Czasu Nurkowania

Statyczne PWA przygotowane pod iPhone na podstawie prezentacji `obiliczanie czasu nurkowania .pptx`.

## Model obliczeń

Aplikacja liczy:

1. `Pamb = 1 + depth / 10`
2. `Vusable = tankVolume * (tankPressure - reservePressure)`
3. `SCR = sacRate * Pamb`
4. `T = Vusable / SCR`

Domyślne wartości wynikające z materiału:

- ciśnienie butli: `200 bar`
- rezerwa bezpieczeństwa: `50 bar`

## Uruchomienie lokalne

Najprościej uruchomić prosty serwer HTTP w katalogu projektu, np.:

```bash
python3 -m http.server 4173
```

Potem otwórz `http://localhost:4173`.

## iPhone

Po wdrożeniu na dowolny hosting z `HTTPS`:

1. Otwórz stronę w Safari.
2. Wybierz `Udostępnij`.
3. Wybierz `Do ekranu początkowego`.

Po pierwszym wejściu aplikacja zapisuje shell offline przez service workera.
# nurkowanie
# Nurkowanie
