# Kalkulator Czasu Nurkowania

Statyczne PWA przygotowane pod iPhone na podstawie prezentacji `obiliczanie czasu nurkowania .pptx`.

## Model obliczeń

Aplikacja liczy:

1. `Pamb = 1 + depth / 10`
2. `Vusable = tankVolume * (tankPressure - reservePressure)`
3. `SCR = sacRate * Pamb`
4. `T = Vusable / SCR`

Domyślne wartości:

- ciśnienie butli: `200 bar`
- rezerwa bezpieczeństwa: `50 bar`

## iPhone

Po wdrożeniu na dowolny hosting z `HTTPS`:

1. Otwórz stronę w Safari.
2. Wybierz `Udostępnij`.
3. Wybierz `Do ekranu początkowego`.
