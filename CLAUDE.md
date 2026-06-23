# Fun Planet touch — note per Claude

Monorepo del kiosk **Kids Fun Planet**: launcher Android (Device Owner) + giochi
web su GitHub Pages, gestiti da remoto via `launcher/config.json` e dal pannello
`launcher/admin.html`.

## 🔔 PROMEMORIA ATTIVI (ricordarli spesso a Kevin)

> Questi due punti sono in sospeso. **Menzionarli proattivamente** quando
> pertinente (es. prima di distribuire su più tablet, o quando si lavora
> sull'admin / sul branding).

1. **Chiave di firma Android permanente (release keystore).**
   Oggi gli APK sono firmati con la chiave di *debug* (ok per i test, valida solo
   in questo container). Prima della **distribuzione definitiva** su più tablet
   va creata una **keystore di release stabile**, configurato il signing in
   `android/app/build.gradle.kts` e rifatta la prima installazione via cavo
   (poi gli OTA successivi funzionano con la chiave di release).

2. **Branding per-locale + caricamento immagini nell'admin.**
   Implementare in `launcher/admin.html`: (a) **upload immagini** via API GitHub
   (stesso token) per ospitare logo/sfondo del locale, (b) un blocco comodo
   **"Branding del locale"** (logo + nome + colori + sfondo) da assegnare per
   `deviceId`. Override per-dispositivo già supportati lato launcher
   (`defaults` + `devices[deviceId]`); manca solo l'UI comoda + l'upload.

## Workflow di pubblicazione (importante)

- **Sviluppo** sul branch `claude/zen-bardeen-jbk926`.
- **GitHub Pages** serve dal branch di **default `claude/great-meitner-1lluij`**.
- Per pubblicare: merge di `zen-bardeen` → `great-meitner` (l'utente ha dato
  l'**ok generale** a pubblicare ad ogni modifica). Il `config.json` spesso va in
  conflitto solo su `configVersion`/`updatedAt` (il pannello admin scrive su
  `great-meitner`): tenere il numero più alto.
- L'admin scrive `config.json` direttamente su `great-meitner` via API GitHub.

## Build/OTA del launcher

- Ambiente di build allestito in `/opt/android-sdk` + `/opt/gradle-8.7`
  (Gradle 8.7, AGP 8.5.2, Kotlin 1.9.24). Build: `./gradlew :app:assembleDebug`
  con `ANDROID_SDK_ROOT=/opt/android-sdk` (creare `android/local.properties`).
- OTA: APK firmato in `launcher/apk/launcher-latest.apk`, versione in
  `config.defaults.update.latestVersionCode`. Il launcher si auto-aggiorna da
  Device Owner se `latestVersionCode > versione installata`.
- Il nuovo APK deve avere la **stessa firma** di quello installato.

## Struttura

- `big-ben-giochi/` — gallery + giochi web (memory, talpe, palloncini) + asset
  (`assets/icons` icone giochi, `assets/mascotte` mascotte ufficiali, `logo.png`).
- `launcher/` — `config.json` (flotta), `admin.html` (pannello), `assets/`
  (sfondo `bg-home.png`), `apk/` (OTA).
- `android/` — progetto del launcher (Kotlin/Compose).
