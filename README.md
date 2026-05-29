# Spesa Smart - Risparmio Intelligente

Questa è un'applicazione web costruita con Next.js, Firebase e Genkit AI, progettata per aiutarti a gestire le liste della spesa e confrontare i prezzi tra diversi supermercati.

## Come caricare il progetto su GitHub

Segui questi passaggi per pubblicare il tuo codice su un repository GitHub:

### 1. Prerequisiti
- Assicurati di avere [Git](https://git-scm.com/) installato sul tuo computer.
- Crea un account su [GitHub](https://github.com/).

### 2. Inizializza il repository locale
Apri il terminale nella cartella del progetto ed esegui:

```bash
git init
git add .
git commit -m "Primo commit: App Spesa Smart pronta"
```

### 3. Collega GitHub
1. Vai su GitHub e crea un nuovo repository (non inizializzarlo con README o licenza).
2. Copia l'URL del repository (es: `https://github.com/tuo-utente/nome-repo.git`).
3. Nel terminale, inserisci:

```bash
git remote add origin https://github.com/tuo-utente/nome-repo.git
git branch -M main
git push -u origin main
```

## Funzionalità Principali
- **Gestione Catalogo:** Aggiungi prodotti con prezzi specifici per ogni negozio.
- **Liste Intelligenti:** Crea liste con suggerimenti AI per categorizzare i prodotti.
- **Analisi Costi:** Visualizza grafici sull'andamento delle tue spese mensili.
- **Sincronizzazione Cloud:** Accedi per salvare i dati in modo sicuro su Firebase.
- **Backup:** Esporta e importa i tuoi dati in formato JSON dal profilo.

## Sviluppo Locale

Per avviare l'app in modalità sviluppo:

```bash
npm install
npm run dev
```

L'app sarà disponibile all'indirizzo [http://localhost:9002](http://localhost:9002).