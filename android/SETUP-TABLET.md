# Prova su un tablet — installazione APK + Device Owner (kiosk)

Guida per la **prima prova** su un singolo tablet, collegato via cavo USB a un
Mac. Obiettivo: installare il launcher e renderlo **Device Owner**, così il
kiosk (lock task) si attiva da solo e i giochi web girano dentro la WebView
interna.

> Nota: il kiosk (blocco a schermo intero) si attiva **automaticamente quando
> l'app è Device Owner** — non serve toccare `kiosk.enabled` nel config.

---

## 0) Prerequisiti sul Mac

- **Android Platform Tools** (contiene `adb`). Se non li hai:
  ```bash
  brew install --cask android-platform-tools
  ```
  Verifica: `adb version`

## 1) Prepara il tablet

1. **Impostazioni → Info sul telefono/tablet →** tocca 7 volte *Numero build*
   per sbloccare le **Opzioni sviluppatore**.
2. In **Opzioni sviluppatore** attiva **Debug USB**.
3. **IMPORTANTISSIMO per il Device Owner:** rimuovi **tutti gli account**
   (Google e altri) da *Impostazioni → Account*. Se resta anche un solo
   account, il comando `set-device-owner` fallisce.
   - Ideale: tablet appena resettato di fabbrica e **non** configurato con un
     account Google.
4. Collega il tablet al Mac con il cavo. Sul tablet autorizza il computer
   ("Consenti debug USB?").

Verifica la connessione:
```bash
adb devices
# deve elencare il tuo tablet come "device" (non "unauthorized")
```

## 2) Builda l'APK (su Android Studio — consigliato)

Il gradle wrapper nel repo è incompleto, quindi la via più semplice è
Android Studio:

1. Apri la cartella `android/` con **Android Studio** e attendi il *Gradle sync*
   (genera anche `gradlew` e scarica il necessario).
2. Menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. A fine build, clicca **locate**: l'APK di test è qui:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
   (L'APK *debug* è già firmato con la chiave di debug: perfetto per la prova.)

In alternativa, dopo il primo sync di Android Studio puoi usare la CLI:
```bash
cd android
./gradlew assembleDebug
```

## 3) Installa l'APK sul tablet

```bash
# dal Mac, sostituisci il percorso con quello del tuo app-debug.apk
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```
`-r` reinstalla mantenendo i dati se l'app c'è già.

## 4) Imposta il launcher come DEVICE OWNER

```bash
adb shell dpm set-device-owner it.bigbenmatic.gamelauncher/.DeviceOwnerReceiver
```
Risposta attesa:
```
Success: Device owner set to package it.bigbenmatic.gamelauncher
```
Se vedi *"…because there are already some accounts on the device"* → torna al
punto 1.3 (rimuovi TUTTI gli account) e ripeti.

## 5) Rendi il launcher la Home (così parte da solo)

Apri l'app una volta (o premi il tasto Home e scegli "Kids Fun Planet" come
predefinita). Su molti dispositivi funziona anche:
```bash
adb shell cmd package set-home-activity it.bigbenmatic.gamelauncher/.MainActivity
```

## 6) Verifica

```bash
# Conferma che è Device Owner
adb shell dpm list-owners
# Stato completo delle policy (cerca "Device Owner")
adb shell dumpsys device_policy | grep -i "owner"
# Versione installata (deve essere 2)
adb shell dumpsys package it.bigbenmatic.gamelauncher | grep versionCode
```
A questo punto: apri un gioco dalla griglia → si apre la WebView a tutto
schermo; **← Esci** (o il pulsante flottante) torna alla griglia. Il tasto Home
di sistema è bloccato dal lock task.

> Permesso "Mostra sopra le altre app" per il pulsante flottante "Torna ai
> giochi": vai in *Impostazioni del launcher → Diagnostica → Attiva permesso*
> (o concedilo dalle impostazioni Android).

---

## Disattivare il Device Owner (per smontare la prova)

Il Device Owner **non** si rimuove con una semplice disinstallazione. Opzioni:

```bash
# Tentativo via adb (funziona su build di test / alcune ROM):
adb shell dpm remove-active-admin it.bigbenmatic.gamelauncher/.DeviceOwnerReceiver
```
Se fallisce, l'unico modo sicuro per togliere il Device Owner è un
**ripristino di fabbrica** del tablet. Tienine conto prima di usarlo su un
dispositivo "importante".

---

## Aggiornamenti successivi (OTA, senza cavo)

Dopo questa prima installazione manuale, gli aggiornamenti possono arrivare
**da soli** via `config.json` (l'app è Device Owner e si auto-installa):

1. In Android Studio alza `versionCode` in `android/app/build.gradle.kts`
   (es. 2 → 3) e builda un APK *release* firmato.
2. Carica l'APK all'URL indicato in `config.json → defaults.update.apkUrl`
   (`launcher/apk/launcher-latest.apk`).
3. Imposta `defaults.update.latestVersionCode` al nuovo numero (es. 3) e committa.
4. Al prossimo poll della config, i tablet si aggiornano in silenzio.

(Attuale: app `versionCode = 2`, config `latestVersionCode = 2`.)
