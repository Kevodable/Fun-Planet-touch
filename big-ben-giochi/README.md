# Kids Fun Planet — Giochi (`big-ben-giochi`)

Raccolta di **webapp-gioco touch** per i monitor del kiosk **"Kids Fun Planet"**,
l'area bimbi del centro di intrattenimento **Big Ben Matic S.r.l.**

I giochi sono **100% statici** (vanilla HTML/CSS/JS, nessun framework, nessun
CDN, funzionano offline) e vengono pubblicati su **GitHub Pages**. Vengono
lanciati dal launcher Android in modalità kiosk, che carica i contenuti web —
**l'APK del launcher vive in un'altra parte del repo / repo separato e NON è
incluso in questa cartella.**

URL di pubblicazione (GitHub Pages, sottocartella):
`https://kevodable.github.io/Fun-Planet-touch/big-ben-giochi/`

---

## Struttura della cartella

```
big-ben-giochi/
├── index.html            # gallery: legge giochi.json e mostra le tile
├── giochi.json           # manifest centrale dei giochi
├── README.md             # questo file
├── assets/
│   ├── shared.css        # reset, palette, classi util, animazioni
│   └── shared.js         # oggetto globale BB con le utility comuni
├── memory/
│   └── index.html        # 🧠 Abbina le Coppie
├── talpe/
│   └── index.html        # 🐹 Acchiappa la Talpa
└── palloncini/
    └── index.html        # 🎈 Scoppia i Palloncini
```

Tutti i path sono **relativi**: la gallery sta in `index.html`, ogni gioco in
`cartella/index.html` e importa gli asset condivisi con `../assets/...`. Così il
sito funziona anche servito da una sottocartella di Pages.

---

## I giochi

| Gioco | Cartella | Descrizione |
|-------|----------|-------------|
| 🧠 Abbina le Coppie | `memory/` | Memory a 8 carte (4×2), gira le carte e trova le coppie. Conta le mosse, salva il record (mosse minime). |
| 🐹 Acchiappa la Talpa | `talpe/` | Griglia 3×3, colpisci le talpe che spuntano. 60s, velocità crescente, record salvato. |
| 🎈 Scoppia i Palloncini | `palloncini/` | Palloncini che salgono, tap per scoppiarli con particelle. 60s, velocità crescente, record salvato. |

---

## Vincoli kiosk rispettati

- **Touch only**: nessun input da tastiera/mouse; target tap ≥ 64px.
- **Fullscreen, zero scroll**: layout che riempie lo schermo, niente barre né
  overflow; regge **landscape e portrait**.
- **Pubblico bambini**: grafica colorata, feedback visivo e sonoro immediato,
  poco testo.
- **Sessioni brevi**, riavviabili con un tap ("Rigioca" nell'overlay vittoria).
- **Static / offline**: nessuna dipendenza esterna, nessun CDN, nessun font
  esterno (system font stack).
- **`localStorage`** usato solo per i record locali, con chiavi namespaced
  (`bb.kidsfunplanet.score.<gioco>`).
- **Auto-ritorno**: dopo 60s di inattività si torna automaticamente alla gallery.

---

## Identità visiva (palette Big Ben)

Definita in `assets/shared.css`:

```css
--bb-burgundy:#7A1F3D;
--bb-pink:#E8488B;
--bb-pink-soft:#FFD3E4;
--bb-blue:#2E5BFF;
--bb-blue-soft:#D7E0FF;
--bb-ink:#2A1622;
--bb-paper:#FFF7FB;
```

Stile: angoli arrotondati generosi, ombre morbide, animazioni elastiche.

---

## Come aggiungere un nuovo gioco

1. **Crea la cartella** del gioco accanto agli altri, con dentro un
   `index.html` autocontenuto:

   ```
   big-ben-giochi/
   └── mio-gioco/
       └── index.html
   ```

2. Nell'`index.html` importa gli asset condivisi (path relativi):

   ```html
   <link rel="stylesheet" href="../assets/shared.css">
   <script src="../assets/shared.js"></script>
   ```

3. Usa la struttura standard e le utility `BB` (vedi sotto):

   ```html
   <div class="bb-screen">
     <!-- header con "← Esci" + titolo iniettato da JS -->
     <div class="bb-stage"><!-- il tuo gioco --></div>
   </div>
   <script>
     BB.lockScroll();
     var info = BB.header("🎮 Il Mio Gioco");  // header standard
     BB.idle(60000, BB.home);                  // auto-ritorno
     // ... logica di gioco ...
     // a fine partita:
     BB.win({ titolo:"Bravo!", punteggio: 42,
              record: BB.score("mio-gioco", 42), rigioca: avvia });
   </script>
   ```

4. **Aggiungi una riga a `giochi.json`** (la gallery e il launcher leggono
   questo file). Schema:

   ```json
   {
     "id": "mio-gioco",
     "nome": "Il Mio Gioco",
     "cartella": "mio-gioco",
     "icona": "🎮",
     "colore": "#2E5BFF",
     "minEta": 3,
     "descrizione": "Una frase breve",
     "attivo": true
   }
   ```

   - `cartella` deve combaciare col nome della cartella creata.
   - `colore` è lo sfondo della tile nella gallery.
   - **`"attivo": false`** nasconde il gioco senza cancellarlo (né la gallery né
     il launcher lo mostrano).

Fatto: niente build, niente registrazioni altrove.

### Utility disponibili in `BB` (`assets/shared.js`)

| Funzione | Cosa fa |
|----------|---------|
| `BB.home()` | Torna al launcher: chiama `window.AndroidLauncher.goHome()` se esiste, altrimenti naviga a `../index.html` (gallery). |
| `BB.header(titolo)` | Inserisce l'header standard (pulsante **← Esci** + titolo) e ritorna lo slot info per i punteggi. |
| `BB.sound(tipo)` | Suoni WebAudio generati: `"pop"`, `"match"`, `"win"`, `"error"`. |
| `BB.idle(ms, cb)` | Esegue `cb` dopo `ms` di inattività touch (default 60000). |
| `BB.fullscreen()` | Richiede il fullscreen (best effort). |
| `BB.lockScroll()` | Blocca scroll, pull-to-refresh e menu contestuale. |
| `BB.win(opzioni)` | Overlay di vittoria con punteggio/record e pulsanti **Rigioca** / **Esci**. |
| `BB.score(gioco[, valore])` | Legge/salva il record su `localStorage` (namespaced per gioco). |
| `BB.rand(min,max)` / `BB.shuffle(arr)` | Helper casuali. |

---

## Come testare in locale

Serve un server statico (il `fetch` di `giochi.json` non funziona aprendo il
file con `file://`). Dalla cartella `big-ben-giochi/`:

```bash
python3 -m http.server 8000
```

Poi apri `http://localhost:8000/` nel browser. In alternativa:

```bash
npx serve .        # Node
php -S localhost:8000   # PHP
```

Per simulare il kiosk: usa gli strumenti sviluppatore del browser in modalità
device (touch), prova sia landscape che portrait.

---

## Contratto launcher ↔ giochi

Il launcher Android carica i giochi in un WebView. L'unico punto di contatto è
la funzione di **ritorno alla home**:

- **Interfaccia attesa**: il launcher espone nel WebView un oggetto JavaScript
  globale `window.AndroidLauncher` con il metodo:

  ```js
  window.AndroidLauncher.goHome()   // riporta il bambino alla griglia del launcher
  ```

- **Comportamento dei giochi**: alla pressione di **← Esci** (o al termine del
  timer di inattività), il gioco chiama `BB.home()`, che:

  1. se `window.AndroidLauncher.goHome` esiste → la invoca (ritorno al launcher
     nativo);
  2. **altrimenti** (es. apertura via web/browser) → naviga a `../index.html`,
     cioè alla **gallery** di questa cartella.

Questo fallback fa sì che i giochi siano pienamente navigabili anche fuori dal
kiosk (test, uso web), senza modifiche al codice.

> La gallery (`index.html`) legge `giochi.json` via `fetch`; lo stesso manifest
> può essere consumato dal launcher per costruire la propria griglia nativa.
> Mantenere `giochi.json` come unica fonte di verità dell'elenco giochi.
