# Gola Libera

App per telefono con un programma di 12 settimane di **esercizi miofunzionali** per lingua, palato molle, gola, labbra e respirazione, pensati per ridurre il russamento e le apnee notturne.

È una web app installabile (PWA): si apre dal browser, si aggiunge alla schermata Home e funziona anche offline. Non serve nessuno store e non c'è un server: i dati restano sul telefono.

## Funzioni

- **Oggi**: la sessione del giorno, costruita in base a obiettivo, livello e minuti disponibili. Ogni giorno allena tutti e 5 i gruppi muscolari e ruota gli esercizi secondari.
- **Sessione guidata**: timer a cerchio che conta ripetizioni e secondi, con segnali sonori; lo schermo resta acceso.
- **Programma**: obiettivo (russamento, apnee, bocca aperta), livello, minuti al giorno, data di inizio. Il carico cresce in 4 fasi lungo 12 settimane.
- **Esercizi**: 20 esercizi con istruzioni e scopo.
- **Notti**: diario del russamento e della stanchezza al mattino, con grafico delle ultime 2 settimane.
- **Promemoria**: crea un evento giornaliero nel calendario del telefono, con avviso.
- **Backup**: esporta e importa i dati in un file JSON.

## Installazione sul telefono

1. Apri l'indirizzo dell'app (vedi "Pubblicazione" sotto).
2. **Android (Chrome)**: menu ⋮ → *Installa app* oppure *Aggiungi a schermata Home*.
3. **iPhone (Safari)**: pulsante Condividi → *Aggiungi alla schermata Home*.

## Pubblicazione con GitHub Pages

1. Nel repository: **Settings → Pages**.
2. In *Build and deployment* scegli **Deploy from a branch**, branch `main`, cartella `/ (root)`, poi **Save**.
3. Dopo circa un minuto l'app è online su `https://<utente>.github.io/gola-libera/`.

## Sviluppo

Nessuna dipendenza e nessun passaggio di build. Per provarla in locale:

```sh
python3 -m http.server 8000
```

e apri `http://localhost:8000`. Dopo aver modificato i file, aumenta `VERSION` in `sw.js` perché i telefoni scarichino la nuova versione.

| File | Contenuto |
| --- | --- |
| `index.html` | struttura della pagina |
| `app.css` | stile, tema chiaro e scuro |
| `app.js` | esercizi, motore del programma, timer, diario, salvataggio |
| `anim.js` | animazioni degli esercizi (testa vista di lato) |
| `sw.js` | service worker per l'uso offline |
| `manifest.webmanifest`, `icons/` | dati per l'installazione |

## Fonti

- Guimarães KC et al. *Effects of oropharyngeal exercises on patients with moderate obstructive sleep apnea syndrome*. Am J Respir Crit Care Med, 2009.
- Camacho M et al. *Myofunctional therapy to treat obstructive sleep apnea: a systematic review and meta-analysis*. Sleep, 2015.
- Ieto V et al. *Effects of oropharyngeal exercises on snoring: a randomized trial*. Chest, 2015.

## Avvertenza

Gli esercizi non sostituiscono la diagnosi né le terapie prescritte. Chi ha pause respiratorie notturne, sonnolenza diurna o ipertensione dovrebbe fare un esame del sonno. Chi usa la CPAP non deve interromperla senza parlarne con il medico.
