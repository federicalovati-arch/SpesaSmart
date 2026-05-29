# Spesa Smart - Risparmio Intelligente

Questa è un'applicazione web costruita con Next.js, Firebase e Genkit AI, progettata per aiutarti a gestire le liste della spesa e confrontare i prezzi tra diversi supermercati.

## Come caricare il progetto su GitHub

Per pubblicare il tuo codice su GitHub, segui questi passaggi dal tuo terminale:

### 1. Inizializza il repository locale
Apri il terminale nella cartella del progetto scaricato ed esegui:

```bash
git init
git add .
git commit -m "Primo commit: App Spesa Smart completa"
```

### 2. Collega e Invia a GitHub
1. Vai su [GitHub](https://github.com/new) e crea un nuovo repository chiamato `spesa-smart`.
2. **Importante:** Non inizializzarlo con README, licenza o .gitignore.
3. Copia l'URL del repository (es: `https://github.com/tuo-utente/spesa-smart.git`).
4. Nel tuo terminale, inserisci:

```bash
git branch -M main
git remote add origin https://github.com/tuo-utente/spesa-smart.git
git push -u origin main
```

## Funzionalità Principali
- **Gestione Catalogo:** Aggiungi prodotti con prezzi specifici per ogni negozio.
- **Liste Intelligenti:** Crea liste con suggerimenti AI per categorizzare i prodotti.
- **Analisi Costi:** Visualizza grafici sull'andamento delle tue spese mensili e risparmi ottenuti.
- **Sincronizzazione Cloud:** Accedi con Email o Google per salvare i dati su Firebase.
- **Backup Universale:** Esporta i tuoi dati in formato JSON per portarli ovunque (Supabase, PocketBase o backup personale).

## Sviluppo Locale

Per avviare l'app in modalità sviluppo dopo averla scaricata:

```bash
npm install
npm run dev
```

L'app sarà disponibile all'indirizzo [http://localhost:3000](http://localhost:3000).
