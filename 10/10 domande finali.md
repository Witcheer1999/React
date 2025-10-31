
## Modulo 0: Introduzione e Contesto


### 1. Presentazione del Problema Architetturale: Il Conflitto "Pull" vs. "Push"

Nelle moderne applicazioni single-page (SPA), la gestione dei dati del server è tipicamente dominata da un paradigma **"Pull" (a richiesta)**.

* **Il Mondo "Pull" (REST & RTK Query):** Questa è l'architettura che conoscete. L'applicazione è *padrona* del ciclo di vita dei dati. Quando un componente necessita di informazioni, invoca un hook (es. `useGetPostsQuery()`). RTK Query gestisce il fetching, la cache, la normalizzazione e gli stati (`isLoading`, `isSuccess`). È un modello **dichiarativo**: "Dichiaro di aver bisogno di questi dati", e il sistema li procura.

* **Il Mondo "Push" (WebSocket):** I WebSocket introducono un paradigma opposto. Il client apre una connessione persistente e bidirezionale con il server. A questo punto, il client *cede il controllo*. È il server che decide *quando* inviare nuovi dati. L'applicazione non "chiede" più, ma "ascolta" passivamente. Questo è un modello **imperativo** (basato su eventi): "Quando *accade* l'evento 'X', esegui *questa* funzione".

**Il Conflitto Architetturale:**
Cosa accade quando questi due mondi coesistono? La nostra applicazione carica la cronologia dei messaggi via RTK Query (Pull), popolando la sua cache. Pochi secondi dopo, il server *spinge* un nuovo messaggio (Push).

Ora abbiamo un problema:

1.  **Stato Duplicato:** Dove va a finire il nuovo messaggio? Se lo mettiamo in un `useState` o in un altro slice Redux, abbiamo creato **due fonti di verità** (la cache RTK Query e questo nuovo stato), che andranno inevitabilmente fuori sincrono.
2.  **Rottura del Flusso Dichiarativo:** Se il WebSocket aggiorna direttamente il DOM o uno stato locale, bypassa l'intero sistema di state management (RTK), rompendo la reattività, la memoization dei selettori e la prevedibilità dell'UI.

La nostra sfida, quindi, non è *come usare* un WebSocket, ma *come integrarlo* in modo che la nostra cache RTK Query rimanga l'**unica fonte di verità (Single Source of Truth)** per l'intera interfaccia utente.

---




















---

### 0.2. Definizione dell'Obiettivo Finale: Il Principio di Disaccoppiamento

Il nostro obiettivo non è semplicemente "far funzionare" una chat, ma progettarla in modo che sia **manutenibile**, **testabile** e **scalabile**. Per raggiungere questo, applicheremo un rigoroso principio di **Separazione delle Competenze (Separation of Concerns)**.

L'architettura finale che costruiremo garantirà che ogni parte del sistema abbia una sola, chiara responsabilità:

* **1. I Componenti (UI):** I nostri componenti React (es. `<MessageList>`, `<MessageInput>`) avranno un'unica responsabilità: **renderizzare lo stato** e **comunicare intenzioni** utente.
    * `MessageList` non saprà nulla di WebSocket, HTTP o come i dati arrivano. Il suo contratto sarà semplice: "Usa `useGetMessagesQuery()` per ottenere un array di messaggi e renderizzalo".
    * `MessageInput` non saprà come inviare un messaggio. Il suo contratto sarà: "Al `submit`, `dispatch`a un'azione semantica (un'intenzione) come `sendMessage({ text: '...' })`".

* **2. Lo Stato (RTK Query):** La cache di RTK Query sarà la nostra **unica fonte di verità (Single Source of Truth)** per i dati del server. Tutta l'applicazione leggerà i messaggi da qui. Non ci saranno `useState` o slice Redux concorrenti per contenere i messaggi.

* **3. La Logica di Business (Il Middleware):** Qui sta la vera intelligenza del nostro sistema. Tutta la logica "sporca" e imperativa dei WebSocket sarà confinata in un **Middleware RTK personalizzato**.
    * Questo middleware sarà l'unico punto del sistema a "sapere" dell'esistenza di `socket.io`.
    * **In ascolto:** Intercetterà le azioni `sendMessage` dai componenti ed eseguirà `socket.emit()`.
    * **In ricezione:** Ascolterà gli eventi `socket.on('receiveMessage')` dal server e, invece di popolare uno stato, `dispatch`erà un'azione interna di RTK Query (`api.util.updateQueryData`) per **iniettare** il nuovo messaggio direttamente nella cache.

Questo design porta a un sistema perfettamente disaccoppiato: i componenti sono "puri", la gestione dello stato è centralizzata e la logica di comunicazione real-time è isolata. Questo è l'obiettivo verso cui lavoreremo.

---















-----

### **Modulo 1: Il Backend – La Nostra "Black Box"**

#### 1\. Obiettivo: Costruire un Simulatore di Backend Affidabile

In questo modulo, il nostro obiettivo non è ingegnerizzare un backend complesso, persistente o scalabile. Il nostro scopo è costruire un **simulatore di backend** affidabile: una "black box" che implementa un contratto di API WebSocket ben definito.

Tratteremo questo server come un servizio esterno dato. Questo approccio ci permette di isolare il problema e concentrare il 100% della nostra attenzione sull'architettura frontend e sulla sua integrazione con Redux Toolkit, che è il vero cuore di questo corso.

#### 2\. Decisione Architetturale: Perché Socket.IO?

Una domanda sorge immediatamente: perché utilizzare Socket.IO anziché l'API nativa WebSocket (`ws`)? La risposta risiede nella robustezza e nelle astrazioni pronte per la produzione.

L'API nativa WebSocket è un protocollo a basso livello. Socket.IO è una libreria *costruita sopra* questo protocollo, che risolve problemi comuni del mondo reale:

1.  **Gestione Automatica delle Riconnessioni:** Se un client perde la connessione (es. un laptop che cambia rete WiFi), un WebSocket nativo "muore". Socket.IO gestisce automaticamente logiche complesse (come l'exponential backoff) per tentare la riconnessione.
2.  **Fallback (Degrado Grazioso):** Alcuni ambienti di rete (es. firewall aziendali) bloccano il protocollo WebSocket. In questi scenari, Socket.IO degrada automaticamente la connessione a meccanismi più vecchi ma universalmente supportati, come l'**HTTP Long Polling**, garantendo che la funzionalità real-time persista.
3.  **Astrazione delle "Stanze" (Rooms):** Socket.IO fornisce un'API server-side (`socket.join('roomName')`) che astrae la logica di "pub/sub" in modo pulito, permettendoci di inviare messaggi a gruppi specifici di client anziché a tutti.

Per i nostri scopi, questi vantaggi lo rendono la scelta ideale per una "black box".

-----

#### 3\. Implementazione del Server

Costruiremo il nostro server passo dopo passo, creando i quattro file fondamentali necessari per eseguirlo in un ambiente containerizzato e isolato.

##### File 1: `server/package.json`

Questo file definisce il nostro progetto Node.js.

  * **`socket.io`**: La nostra dipendenza principale.
  * **`nodemon`**: Una dipendenza di sviluppo essenziale. Monitora i nostri file sorgente e riavvia automaticamente il server a ogni modifica, un ciclo di feedback cruciale per lo sviluppo.
  * **`"type": "module"`**: Questa è un'istruzione critica. Dice a Node.js di trattare i file `.js` come **Moduli ES (ESM)**, permettendoci di usare la sintassi moderna `import/export` anziché `require()`.

<!-- end list -->

```json
{
  "name": "chat-server-blackbox",
  "version": "1.0.0",
  "description": "Black Box Echo Server per il corso RTK Middleware",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "socket.io": "^4.7.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

##### File 2: `server/index.js`

Questo è il cuore logico del nostro server. È volutamente semplice.

1.  Importiamo e creiamo un server `http` nativo di Node e vi associamo una nuova istanza del `Server` Socket.IO.
2.  Configuriamo **CORS** (`cors: { origin: "*" }`). Questo è fondamentale. Senza di esso, il nostro client React (che verrà servito da un container e una porta diversi) vedrebbe le sue richieste di connessione bloccate dal browser per motivi di sicurezza (Same-Origin Policy).
3.  Definiamo la logica `io.on("connection", ...)`:
      * Quando un client si connette, registriamo il suo `socket.id`.
      * Ascoltiamo un evento specifico: `sendMessage`.
      * Quando riceviamo `sendMessage`, inoltriamo (o "facciamo eco") i dati ricevuti a *tutti* i client connessi emettendo un nuovo evento: `receiveMessage`.

Questo semplice pattern "ricevi-e-trasmetti" è tutto ciò di cui abbiamo bisogno per simulare una chat room.

```javascript
// Importa il modulo http di Node e la classe Server da socket.io
import { createServer } from "http";
import { Server } from "socket.io";

// Definiamo la porta. Usiamo 8080 come da convenzione per i server custom.
const PORT = process.env.PORT || 8080;

// Creiamo un server HTTP standard
const httpServer = createServer();

// Creiamo un'istanza del server Socket.IO e la colleghiamo al server HTTP
const io = new Server(httpServer, {
  // Configurazione CORS: essenziale per permettere al client React 
  // (che gira su un'altra porta/dominio) di connettersi.
  cors: {
    origin: "*", // Per la demo, accettiamo connessioni da ovunque.
    methods: ["GET", "POST"]
  }
});

// Logica principale: cosa fare quando un client si connette
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Nuovo client connesso: ${socket.id}`);

  // 1. Ascolta l'evento 'sendMessage' inviato dal client (Modulo 3)
  socket.on("sendMessage", (data) => {
    
    // Log nel terminale del server (per il debug)
    console.log(`[Socket.IO] Messaggio ricevuto da ${socket.id}:`, data);
    
    // 2. Emette l'evento 'receiveMessage' a *TUTTI* i client connessi (Modulo 4)
    // Questo simula la logica di broadcast della chat.
    io.emit("receiveMessage", data);
  });

  // Gestisce la disconnessione del client
  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnesso: ${socket.id}`);
  });
});

// Avviamo il server HTTP sulla porta definita
httpServer.listen(PORT, () => {
  console.log(` Server Socket.IO (Black Box) in ascolto sulla porta ${PORT}`);
});
```

##### File 3: `server/Dockerfile`

Questo file è la "ricetta" per costruire l'immagine del nostro server. Definisce un ambiente isolato e riproducibile.

1.  **`FROM node:18-alpine`**: Partiamo da un'immagine Node.js ufficiale, leggera (`alpine`).
2.  **`WORKDIR /usr/src/app`**: Impostiamo la directory di lavoro predefinita all'interno del container.
3.  **`COPY package*.json ./`**: Copiamo *solo* i file `package.json` e `lock`.
4.  **`RUN npm ci`**: Installiamo le dipendenze. Usiamo `npm ci` (Clean Install) per build riproducibili.
      * *Nota importante:* **Non** usiamo `--omit=dev`. Questo perché il nostro ambiente di sviluppo Docker Compose (vedi sotto) avrà bisogno di `nodemon`, che è una dipendenza di sviluppo.
5.  **`COPY . .`**: Copiamo il resto del codice sorgente (il nostro `index.js`).
6.  **`EXPOSE 8080`**: Documentiamo che il container espone la porta `8080`.
7.  **`CMD [ "npm", "run", "start" ]`**: Questo è il comando di *default* per avviare il container (verrà usato in produzione).

<!-- end list -->

```dockerfile
# Stage 1: Usa un'immagine Node leggera (basata su Alpine Linux)
FROM node:20-alpine AS base

# Imposta la directory di lavoro all'interno del container
WORKDIR /usr/src/app

# Copia prima package.json e package-lock.json
COPY package*.json ./

# Installa *TUTTE* le dipendenze (incluse quelle di sviluppo)
# Questo è necessario affinché `nodemon` sia disponibile per lo script `dev`
# usato da docker-compose.
RUN npm ci

# Copia il resto del codice sorgente dell'app
COPY . .

# Espone la porta che il nostro server userà
EXPOSE 8080

# Il comando di default per la produzione (verrà sovrascritto da compose)
CMD [ "npm", "run", "start" ]
```

##### File 4: `docker-compose.yml` (Nella Root del Progetto)

Questo è il nostro file di orchestrazione per lo **sviluppo**. Definisce i servizi che compongono la nostra applicazione e come interagiscono.

1.  **`services.server`**: Definiamo il nostro servizio `server`.
2.  **`build`**: Diciamo a Compose di costruire l'immagine usando il `Dockerfile` che si trova nella cartella `./server`.
3.  **`ports: - "8080:8080"`**: Mappiamo la porta `8080` della nostra macchina host alla porta `8080` del container.
4.  **`volumes`**: Questa è la magia del live-reloading.
      * `./server:/usr/src/app`: Montiamo la nostra cartella locale `./server` sopra la cartella `/usr/src/app` del container. Ora, qualsiasi modifica salvata localmente si riflette *istantaneamente* all'interno del container.
      * `/usr/src/app/node_modules`: Dichiariamo un volume anonimo per `node_modules`. Questo "protegge" la cartella `node_modules` installata dal `Dockerfile` (File 3, Step 4) dall'essere sovrascritta dal mount precedente.
5.  **`command: npm run dev`**: Questo è il punto chiave. Sovrascriviamo il `CMD` di default del Dockerfile (che era `npm run start`) e usiamo invece `npm run dev`. Questo avvia `nodemon`, che, in combinazione con i `volumes`, ci dà il live-reloading.

<!-- end list -->

```yaml
version: '3.8'

services:
  # --- Modulo 1: Il Backend "Black Box" ---
  server:
    build:
      context: ./server  # Percorso alla cartella con il Dockerfile
      dockerfile: Dockerfile
    container_name: chat-server
    ports:
      - "8080:8080"  # Mappa porta host:porta container
    volumes:
      # Mount del codice sorgente per il live-reloading con nodemon
      - ./server:/usr/src/app
      # Esclude node_modules dal mount per usare quelli installati nel container
      - /usr/src/app/node_modules
    # Sovrascrive il CMD del Dockerfile per usare lo script 'dev'
    command: npm run dev
    environment:
      - NODE_ENV=development

  # --- Modulo 2: Il Frontend Client ---
  # Placeholder per il nostro client React
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: chat-client
    ports:
      - "5173:80" # Assumendo Vite su 5173 e Nginx su 80 nel container
    depends_on:
      - server 
```

-----

#### 4\. Verifica: Il "Test di Fumo" (Metodo Alternativo con Console Chrome)

Con i file al loro posto, siamo pronti per il test.

Useremo Chrome: utilizzeremo la **Console per Sviluppatori** per scrivere codice JavaScript che si connetta e interagisca con il nostro server.

-----

#### Guida al Test con la Console

1.  **Avvia il Server:**
    Apri un terminale nella directory root del progetto (dove si trova `docker-compose.yml`) ed esegui il comando:

    ```bash
    docker-compose up --build server
    ```

    Attendi di vedere il messaggio di successo nel log:
    `chat-server |  Server Socket.IO (Black Box) in ascolto sulla porta 8080`

2.  **Apri la Console di Chrome:**

      * Apri una nuova scheda vuota in Chrome. Scrivi `about:blank` nella barra degli indirizzi e premi Invio.
      * Apri gli Strumenti per Sviluppatori (premi **F12** o **Cmd+Opt+J** su Mac).
      * Clicca sulla scheda **"Console"**.

3.  **Esegui il Test:**
    Dobbiamo fare due cose: caricare la libreria client di Socket.IO (poiché non è presente sulla pagina `about:blank`) e poi usarla per connetterci.

    **Copia e incolla l'intero blocco di codice seguente** direttamente nella console e premi Invio.

    ```javascript
    // --- Incolla tutto questo blocco nella console ---

    // 1. Creiamo un elemento <script> per caricare la libreria client di Socket.IO
    var script = document.createElement('script');
    script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";

    // 2. Definiamo cosa fare *dopo* che la libreria è stata caricata
    script.onload = () => {
      console.log("Libreria Socket.IO caricata con successo.");

      // 3. Connettiamoci al nostro server
      const socket = io("http://localhost:8080");

      // 4. Definiamo i listener per verificare la connessione
      socket.on("connect", () => {
        console.log("%cVERIFICA 1: Connesso!", "color: green; font-weight: bold;", "ID Socket:", socket.id);
        
        // 5. Ora che siamo connessi, emettiamo il nostro evento di test
        console.log("Invio evento 'sendMessage'...");
        const payload = { user: "Test Console", text: "Ciao dal test!" };
        socket.emit("sendMessage", payload);
      });

      // 6. Restiamo in ascolto per l'evento di "echo" dal server
      socket.on("receiveMessage", (data) => {
        console.log("%cVERIFICA 3: Ricevuto 'receiveMessage'!", "color: blue; font-weight: bold;", data);
        console.log(" Test completato con successo!");
        socket.disconnect(); // Chiudiamo la connessione dopo il test
      });

      socket.on("disconnect", () => {
        console.log("Disconnesso dal server.");
      });
    };

    // 7. Aggiungiamo lo script alla pagina per avviare il caricamento
    document.head.appendChild(script);
    // --- Fine del blocco da incollare ---
    ```

4.  **Analizza i Risultati:**

      * **Nel terminale del Server (Docker):**
        Quasi immediatamente, dovresti vedere i log del nostro server `index.js` che confermano le connessioni e la ricezione del messaggio:

        ```
        chat-server | [Socket.IO] Nuovo client connesso: ...
        chat-server | [Socket.IO] Messaggio ricevuto da ...: { user: 'Test Console', text: 'Ciao dal test!' }
        chat-server | [Socket.IO] Client disconnesso: ...
        ```

        Questa è la **Verifica 2**.

      * **Nella Console di Chrome:**
        Vedrai una sequenza di messaggi che confermano l'intero flusso:

        ```
        Libreria Socket.IO caricata con successo.
        VERIFICA 1: Connesso! ID Socket: ...
        Invio evento 'sendMessage'...
        VERIFICA 3: Ricevuto 'receiveMessage'! { user: 'Test Console', text: 'Ciao dal test!' }
         Test completato con successo!
        Disconnesso dal server.
        ```

Se vedi i messaggi di verifica sia nel terminale del server sia nella console di Chrome, la nostra "Black Box" è costruita, verificata e pronta a servire il frontend.






















-----

###  Modulo 2: Il Frontend - Setup e Architettura "Pull"

#### 2.1. Inizializzazione del Progetto (Vite)

Per prima cosa, creiamo la nostra applicazione client. Dalla directory **root** del nostro progetto (la stessa dove si trovano `docker-compose.yml` e la cartella `server`), eseguiamo:

```bash
# Crea l'app React + TypeScript nella cartella 'client'
npm create vite@latest client -- --template react-ts

# Entra nella nuova cartella
cd client

# Installa le dipendenze fondamentali
npm install @reduxjs/toolkit react-redux socket.io-client
```

  * **`@reduxjs/toolkit`**: Il pacchetto "tutto-in-uno" per Redux, che include RTK Query.
  * **`react-redux`**: Il connettore ufficiale tra React e Redux.
  * **`socket.io-client`**: Anche se non lo useremo in *questo* modulo, lo installiamo ora per averlo pronto per il Modulo 3.

-----

#### 2.2. Aggiunta di Docker al Frontend

Proprio come per il server, vogliamo che il nostro frontend sia containerizzato. Questo garantisce un ambiente di sviluppo e produzione identico e coerente.

##### File 1: `client/Dockerfile`

Questo è un `Dockerfile` **multi-stage**, una best practice fondamentale.

1.  **Stage `build`**: Usa un'immagine Node per installare le dipendenze (`npm ci`) e costruire l'app (`npm run build`). Questo produce i file statici (`index.html`, `.js`, `.css`).
2.  **Stage `prod`**: Inizia da un'immagine Nginx pulita e leggerissima. Copia *solo* i file statici ottimizzati dallo stage precedente e una configurazione Nginx personalizzata.

Questo produce un'immagine finale minuscola, sicura (non contiene `node_modules` o il codice sorgente) e ottimizzata per servire file statici.

```dockerfile
# ---- Stage 1: Build ----
# Costruisce l'applicazione React
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copia package.json e lockfile
COPY package*.json ./

# Installa le dipendenze di produzione
RUN npm ci

# Copia il resto del codice sorgente
COPY . .

# Esegui la build di produzione di Vite
RUN npm run build

# ---- Stage 2: Prod ----
# Serve l'app buildata con Nginx
FROM nginx:1.25-alpine AS prod

# Imposta la directory di lavoro di Nginx
WORKDIR /usr/share/nginx/html

# Rimuovi la pagina di default di Nginx
RUN rm -rf ./*

# Copia i file buildati dallo stage 'build'
COPY --from=build /usr/src/app/dist .

# Copia la nostra configurazione Nginx personalizzata
# (La creeremo nel prossimo file)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80 (standard HTTP)
EXPOSE 80

# Comando di default per avviare Nginx
CMD ["nginx", "-g", "daemon off;"]
```

##### File 2: `client/nginx.conf`

Questo file di configurazione è essenziale per qualsiasi **Single Page Application (SPA)**.

Dice a Nginx di servire normalmente i file che trova (es. `index.html`, `assets/app.js`). Tuttavia, se riceve una richiesta per un URL che *non* corrisponde a un file (es. `/chat/room/123`), **non deve rispondere 404**. Deve invece restituire `index.html`. Questo permette a React Router (o qualsiasi router client-side) di prendere il controllo e gestire la rotta.

```nginx
server {
  listen 80;
  server_name localhost;

  # Directory root dove si trovano i file della SPA
  root /usr/share/nginx/html;
  index index.html index.htm;

  location / {
    # Prova a servire il file richiesto, poi una directory,
    # e se fallisce (fallback), restituisci index.html
    try_files $uri $uri/ /index.html;
  }

  # Opzionale: gestione cache per i file statici
  location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public";
  }
}
```

##### File 3: `docker-compose.yml` (Aggiornamento)

Torniamo al file `docker-compose.yml` nella **root** del progetto e aggiungiamo il nostro nuovo servizio `client`.

```yaml

services:
  # --- Modulo 1: Il Backend "Black Box" ---
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: chat-server
    ports:
      - "8080:8080"
    volumes:
      - ./server:/usr/src/app
      - /usr/src/app/node_modules
    command: npm run dev
    environment:
      - NODE_ENV=development

  # --- Modulo 2: Il Frontend Client ---
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
      target: build
    container_name: chat-client
    ports:
      # Per la produzione, Nginx gira sulla 80.
      # Ma per lo *sviluppo*, Vite gira sulla 5173.
      # Mappiamo la porta 5173 dell'host alla 5173 del container.
      - "5173:5173"
    volumes:
      # Mount del codice sorgente per l'hot-reloading di Vite
      - ./client:/usr/src/app
      # Esclude node_modules dal mount
      - /usr/src/app/node_modules
    # Sovrascrive il CMD del Dockerfile ('nginx...')
    # con il comando di sviluppo di Vite.
    command: npm run dev -- --host 0.0.0.0
    depends_on:
      - server
    environment:
      - NODE_ENV=development
```



**Analisi di `client`:**

  * **`ports: - "5173:5173"`**: In sviluppo, *non* usiamo Nginx. Usiamo il server di sviluppo di Vite. Per convenzione, Vite 5 gira sulla porta `5173`.
  * **`volumes`**: Come per il server, montiamo il nostro codice sorgente per ottenere l'hot-reloading.
  * **`command: npm run dev -- --host 0.0.0.0`**: Questo è il punto cruciale. Sovrascriviamo il `CMD` del Dockerfile (che avviava Nginx) e avviamo il server di sviluppo di Vite. L'opzione `--host 0.0.0.0` è **obbligatoria** per far sì che il server di Vite sia accessibile dall'esterno del container (cioè dalla nostra macchina host).

-----






#### Docker Compose per prod

# --- Produzione ---
```yaml
client:
  build:
    context: ./client
    dockerfile: Dockerfile
    # target: Rimosso! <-- USA LO STAGE FINALE ('prod')
  container_name: chat-client-prod
  ports:
    - "80:80" # <-- Mappa la porta 80 di Nginx
  # volumes: Rimossi! (non servono in prod)
  # command: Rimossi! (usa il CMD del Dockerfile: "nginx -g ...")
  environment:
    - NODE_ENV=production
```


-----

#### 2.3. Configurazione dello Store (Redux Toolkit)

Ora configuriamo lo "cervello" della nostra applicazione. Creiamo le seguenti cartelle e file dentro `client/src`:

  * `client/src/app/store.ts`
  * `client/src/app/hooks.ts`
  * `client/src/features/chat/chatApi.ts`

##### File 1: `client/src/app/store.ts`

Qui definiamo il nostro store Redux. Per ora è semplice: registriamo solo il *reducer* e il *middleware* che RTK Query genererà per noi (nel prossimo passaggio).

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { chatApi } from '../features/chat/chatApi';

export const store = configureStore({
  reducer: {
    // Aggiungiamo il reducer generato da RTK Query
    [chatApi.reducerPath]: chatApi.reducer,
  },
  // Aggiungere il middleware dell'API abilita caching, invalidation, polling,
  // e altre utili funzionalità di RTK Query.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware),
});

// Inferisce i tipi `RootState` e `AppDispatch` dallo store stesso
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

##### File 2: `client/src/app/hooks.ts`

Questa è una best practice per TypeScript. Creiamo versioni pre-tipizzate degli hook di base di Redux. Questo ci eviterà di dover importare `RootState` e `AppDispatch` in ogni componente.

```typescript
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Usa questi hook in tutta l'app invece dei semplici `useDispatch` e `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

##### File 3: `client/src/main.tsx` (Aggiornamento)

Infine, "avvolgiamo" la nostra applicazione React con il `Provider` di Redux, rendendo lo store disponibile a ogni componente.

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Importa il Provider e lo store
import { Provider } from 'react-redux';
import { store } from './app/store.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Avvolgi l'App con il Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
```

-----

#### 2.4. Creazione dell'API Slice (RTK Query)

Questo è il file più importante del modulo. Definiamo la nostra "API" usando RTK Query.

**La Sfida:** Il nostro backend è *solo* WebSocket. Non ha endpoint HTTP `GET /messages` per caricare la cronologia. Come possiamo usare RTK Query, che è progettato per il fetching "Pull"?

**La Soluzione: `fakeBaseQuery`**
Usiamo `fakeBaseQuery`. È una funzione di utility che ci permette di definire endpoint RTK Query che *non* eseguono una vera chiamata di rete (come `fetch`). Questo ci dà tutti i benefici della cache di RTK Query (la nostra Single Source of Truth) senza la necessità di un endpoint REST.

##### File: `client/src/features/chat/chatApi.ts`

```typescript
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

// Definiamo i tipi di dati
// (In un progetto reale, questi sarebbero in file /types)
export interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export interface NewMessage {
  user: string;
  text: string;
}

// Crea l'API Slice
export const chatApi = createApi({
  // Il nome univoco del reducer
  reducerPath: 'chatApi',
 
  // === IL TRUCCO CHIAVE ===
  // Usiamo fakeBaseQuery perché non faremo richieste HTTP per i messaggi.
  // La nostra cache sarà popolata *solo* dal WebSocket (nel Modulo 3).
  baseQuery: fakeBaseQuery(),
 
  // Definiamo i "tag" per invalidare la cache (non usati qui, ma buona pratica)
  tagTypes: ['Message'],
 
  // Definiamo gli endpoint
  endpoints: (builder) => ({
   
    // --- 1. L'Endpoint "Pull" (Query) ---
    getMessages: builder.query<Message[], void>({
      // La nostra "query" non fa nulla se non fornire i dati di default.
      queryFn: () => {
        // Simuliamo un caricamento iniziale (opzionale)
        // In una vera app, questo potrebbe caricare da localStorage
        return { data: [] }; // Inizia con un array vuoto
      },
      // Fornisce il tag per questo set di dati
      providesTags: ['Message'],
    }),

    // --- 2. L'Endpoint "Push" (Mutation) ---
    sendMessage: builder.mutation<void, NewMessage>({
      // Anche la nostra mutation non fa nulla!
      // Non esegue un POST. Il suo unico scopo è
      // creare un'AZIONE (`chatApi/executeMutation/sendMessage`)
      // che il nostro middleware (Modulo 3) potrà INTERCETTARE.
      queryFn: () => {
        return { data: undefined };
      },
      // Non usiamo 'invalidatesTags' perché l'aggiornamento
      // sarà gestito manualmente dal WebSocket.
    }),
  }),
});

// Esporta gli hook auto-generati per l'uso nei componenti
export const { useGetMessagesQuery, useSendMessageMutation } = chatApi;
```

Abbiamo appena creato la nostra **Single Source of Truth**. L'hook `useGetMessagesQuery` fornirà un array di messaggi a qualsiasi componente che lo richieda, e RTK Query gestirà la cache.

-----

#### 2.5. Integrazione e Verifica (Punto di Controllo 1)

Abbiamo configurato tutto. Ora verifichiamo che l'app si avvii e che l'hook RTK Query funzioni.

Sostituisci il contenuto di `client/src/App.tsx` con questo codice di test temporaneo:

##### File: `client/src/App.tsx` (Temporaneo)

```typescript
import './App.css';
// Importa l'hook che abbiamo appena creato
import { useGetMessagesQuery } from './features/chat/chatApi';

function App() {
  // Usa l'hook per sottoscriverti alla cache 'getMessages'
  const { data: messages, isLoading, isError } = useGetMessagesQuery();

  console.log('Stato della query:', { messages, isLoading, isError });

  return (
    <div className="App">
      <h1>RTK Query + WebSocket (Modulo 2)</h1>
      <div className="chat-window">
        <h2>Stato Connessione: Pull (Solo Cache)</h2>
        <hr />
        <div className="messages">
          {isLoading && <p>Caricamento dati (da fakeBaseQuery)...</p>}
          {isError && <p>Errore nel caricamento.</p>}
          {messages && messages.length === 0 && (
            <p>Nessun messaggio. La cache è vuota, come previsto.</p>
          )}
          {/* Qui è dove mapperemo i messaggi nel Modulo 4 */}
        </div>
      </div>
    </div>
  );
}

export default App;
```












#### 1\. Creare il file `.dockerignore` per il Client

1.  Vai nella cartella `client`.

2.  Crea un nuovo file chiamato esattamente **`.dockerignore`** (con il punto all'inizio e nessuna estensione).

3.  Incolla il seguente contenuto al suo interno:

    ```
    # Ignora la cartella dei moduli di Node locali
    node_modules

    # Ignora la cartella di output della build (se presente localmente)
    dist

    # Altri file comuni da ignorare
    .git
    .gitignore
    npm-debug.log
    README.md
    ```




















#### Esecuzione del Test

Ora, dalla cartella **root** del progetto, eseguiamo:

```bash
docker-compose up --build
```

Questo comando costruirà *entrambe* le immagini (server e client) e avvierà entrambi i container.

Apri il tuo browser e naviga su `http://localhost:5173`.

**Risultato Atteso:**
Dovresti vedere la tua app React caricarsi. Nel terminale, vedrai i log di `vite` e del `chat-server`. Sullo schermo, vedrai:

1.  Brevemente: "Caricamento dati (da fakeBaseQuery)..."
2.  Subito dopo: "Nessun messaggio. La cache è vuota, come previsto."

Se vedi questo, il **Modulo 2 è un successo**. Abbiamo un'app React che legge da una cache RTK Query ("Pull"), anche se quella cache è (per ora) statica e vuota.

Abbiamo preparato il palcoscenico. Ora siamo pronti per il **Modulo 3**, dove costruiremo il ponte (il middleware) per popolare questa cache in tempo reale.






































-----

### Modulo 3: Il Cuore - Il Middleware WebSocket Personalizzato

#### 3.1. Definizione dell'Architettura del Middleware

##### Perché un Middleware Redux?

Un middleware è il posto perfetto per la logica "sporca" e gli effetti collaterali (come le connessioni di rete) per diversi motivi:

1.  **È Esterno ai Componenti:** I nostri componenti React devono solo *dispatchare* intenzioni (azioni) e *renderizzare* lo stato. Non dovrebbero *mai* sapere *come* quell'intenzione viene eseguita (sia essa una chiamata HTTP, un `socket.emit`, o una scrittura in `localStorage`). Il middleware vive al di fuori del ciclo di vita dei componenti React.
2.  **Accesso Completo:** Un middleware "siede nel mezzo". Ha accesso a ogni singola azione dispatchata (`action`), può dispatchare nuove azioni (`dispatch`), e può leggere lo stato corrente (`getState`).
3.  **Gestione di Connessioni Persistenti:** È il luogo ideale per inizializzare e mantenere una connessione *singleton* (una sola istanza) come un WebSocket, che deve sopravvivere per l'intera durata della sessione dell'app, indipendentemente dai componenti montati o smontati.

##### `onCacheEntryAdded` vs. Middleware Personalizzato

RTK Query offre un'opzione chiamata `onCacheEntryAdded` per gestire i WebSocket. È ottima, ma per uno scenario diverso.

  * `onCacheEntryAdded` è legata **al ciclo di vita di una query**. Quando un componente usa `useGetMessagesQuery()`, `onCacheEntryAdded` si attiva, apre un socket e inizia a iniettare dati in *quella* cache. Quando l'ultimo componente che usa quella query si smonta, la connessione si chiude. Questo è perfetto per lo *streaming* di dati (es. un feed di prezzi di borsa).
  * Un **Middleware Personalizzato** (il nostro approccio) è superiore per una chat. Vogliamo **una singola connessione** per *tutta l'applicazione*, non per query. Questa connessione deve gestire *sia* la ricezione di messaggi (`receiveMessage`) *sia* l'invio di messaggi (`sendMessage`), che sono due endpoint separati (`query` e `mutation`). Il middleware è l'unico strumento che può orchestrare elegantemente questa logica *app-wide*.

-----

#### 3.2. Un Prerequisito: Il `chatSlice` per lo Stato della Connessione

Prima di scrivere il middleware, creiamo un semplice slice Redux per tracciare lo stato della connessione WebSocket stessa. Il middleware userà questo slice per informarci se siamo "connessi" o "disconnessi".

##### File: `client/src/features/chat/chatSlice.ts`

```typescript
import { createSlice } from '@reduxjs/toolkit';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ChatState {
  status: ConnectionStatus;
}

const initialState: ChatState = {
  status: 'disconnected',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Azione che useremo per dire al middleware di connettersi
    startConnecting: (state) => {
      state.status = 'connecting';
    },
    // Azioni che il middleware dispatcherà in base agli eventi del socket
    connectionEstablished: (state) => {
      state.status = 'connected';
    },
    connectionLost: (state) => {
      state.status = 'disconnected';
    },
  },
});

export const { startConnecting, connectionEstablished, connectionLost } =
  chatSlice.actions;
export default chatSlice.reducer;
```

-----

#### 3.3. Creazione di `src/app/socketMiddleware.ts`

Ora per il pezzo forte. Questo file esporterà una *factory function*, ovvero una funzione che *crea* il nostro middleware. Questo ci permette di passare dipendenze (come l'URL del server e l'istanza `chatApi`) al momento della creazione.

##### File: `client/src/app/socketMiddleware.ts`

```typescript
import { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { chatApi, Message } from '../features/chat/chatApi';
import {
  startConnecting,
  connectionEstablished,
  connectionLost,
} from '../features/chat/chatSlice';

// La Factory Function per creare il middleware
export const createSocketMiddleware = (
  url: string,
  api: typeof chatApi
): Middleware => {
  return (storeApi) => {
    // Questa istanza del socket sarà un singleton per l'app
    let socket: Socket | null = null;

    return (next) => (action) => {
      // ==================================================================
      // === FLUSSO 1: "IN ENTRATA" (Avvio e Ascolto Eventi) ===
      // ==================================================================

      // 1. Intercetta l'azione "startConnecting"
      if (startConnecting.match(action)) {
        console.log('[Socket Middleware] Avvio connessione...');
        // Previene connessioni multiple
        if (!socket) {
          socket = io(url);

          // Listener di connessione base
          socket.on('connect', () => {
            console.log('[Socket.IO] Connesso al server.');
            // Informa il resto dell'app che siamo connessi
            storeApi.dispatch(connectionEstablished());
          });

          socket.on('disconnect', () => {
            console.warn('[Socket.IO] Disconnesso dal server.');
            storeApi.dispatch(connectionLost());
          });

          // --- IL LISTENER CRUCIALE ---
          // Ascolta l'evento 'receiveMessage' dal server
          socket.on('receiveMessage', (message: Message) => {
            console.log('[Socket.IO] Messaggio ricevuto:', message);
            
            // 2. Iniettiamo il nuovo messaggio nella cache di RTK Query
            storeApi.dispatch(
              api.util.updateQueryData(
                'getMessages', // Endpoint da aggiornare
                undefined,     // Argomenti della query (void)
                (draft) => {   // La "ricetta" Immer
                  // Aggiunge il messaggio all'array esistente
                  draft.push(message);
                }
              ) as any
            );
          });
        }
      }

      // ==================================================================
      // === FLUSSO 2: "IN USCITA" (Invio Eventi su Azione) ===
      // ==================================================================
      
      // 3. Intercetta l'azione "pending" della mutation 'sendMessage'
      // Usiamo 'matchPending' per catturare l'azione *prima* che venga eseguita
      if (api.endpoints.sendMessage.matchPending(action)) {
        console.log('[Socket Middleware] Intercettata azione sendMessage:', action);
        // Controlla se il socket è connesso
        if (socket && socket.connected) {
          // 4. Esegui la logica imperativa: emetti l'evento al server
          socket.emit(
            'sendMessage', 
            action.meta.arg.originalArgs // Questo è il payload NewMessage
          );
        } else {
          console.error('[Socket Middleware] Socket non connesso. Impossibile inviare.');
          // Opzionale: potremmo dispatchare un'azione di errore qui
        }
      }

      // **Importante:** Lascia che l'azione prosegua il suo corso
      // Questo permette a RTK Query di aggiornare lo stato (es. 'isLoading')
      return next(action);
    };
  };
};
```

-----

### Architettura e Scopo

Questo middleware è una "Factory Function" (una funzione che *restituisce* un'altra funzione) chiamata `createSocketMiddleware`. Questo pattern consente di configurarla al momento della creazione, passando l'URL del server e l'oggetto `api` di RTK Query.

La sua responsabilità è duplice, come indicato nei commenti del codice:

1.  **Flusso IN ENTRATA (Dal Server a Redux):** Ascoltare gli eventi del server (es. `receiveMessage`) e "tradurli" in azioni o aggiornamenti di stato Redux (nello specifico, aggiornando la cache di RTK Query).
2.  **Flusso IN USCITA (Da Redux al Server):** Intercettare specifiche azioni Redux (es. l'avvio della mutation `sendMessage`) e "tradurle" in comandi imperativi per il socket (es. `socket.emit`).

-----

### Analisi Dettagliata "Passo Passo"

Seguiamo la struttura standard di un middleware Redux: `(storeApi) => (next) => (action) => { ... }`.

#### 1\. Inizializzazione e Singleton

```javascript
return (storeApi) => {
  let socket: Socket | null = null;
  return (next) => (action) => {
    // ...
```

  * **`storeApi`**: Questo oggetto (fornito da Redux) contiene `dispatch` e `getState`. È il nostro accesso allo store *all'interno* del middleware.
  * **`let socket: Socket | null = null;`**: Questa è la parte cruciale. Il socket viene dichiarato *qui*, nello scope della funzione `storeApi`. Questo lo rende un **singleton** per l'intera durata dell'applicazione. Rimarrà `null` fino a quando non decideremo di connetterci.
  * **`(next) => (action) => { ... }`**: Questo è il cuore del middleware. Ogni singola azione dispatchata nell'app (sia da un componente, sia da RTK Query) passerà attraverso questo codice.

-----

### Flusso 1: "IN ENTRATA" (Avvio e Ascolto)

Questo blocco gestisce l'inizializzazione della connessione e la ricezione dei dati.

#### Passo 1.1: Intercettazione dell'Azione di Avvio

```javascript
if (startConnecting.match(action)) {
  // ...
```

  * **Cosa succede:** Il middleware "aspetta" che venga dispatchata un'azione specifica: `startConnecting()`. L'uso di `.match(action)` è il modo idiomatico di Redux Toolkit per verificare il tipo di azione (type guard).
  * **Perché:** Non vogliamo connetterci al socket appena l'app si carica. Vogliamo un controllo programmatico. Di solito, questa azione viene dispatchata nel `useEffect` del componente principale (es. `App.tsx`).

#### Passo 1.2: Creazione e Connessione (Singleton)

```javascript
if (!socket) {
  socket = io(url);
  // ... (impostazione dei listener)
}
```

  * **Cosa succede:** Controlla se il socket è già stato creato. Se è `null` (cioè, questa è la prima volta che `startConnecting` viene chiamata), crea una nuova istanza di `io(url)`.
  * **Perché:** Se l'azione `startConnecting` venisse dispatchata accidentalmente più volte, questo blocco `if` previene la creazione di connessioni multiple e ridondanti.

#### Passo 1.3: Gestione dello Stato della Connessione

```javascript
socket.on('connect', () => {
  storeApi.dispatch(connectionEstablished());
});

socket.on('disconnect', () => {
  storeApi.dispatch(connectionLost());
});
```

  * **Cosa succede:** Vengono registrati i listener di base di Socket.IO.
  * **Perché:** Questo permette al resto dell'applicazione di "sapere" se la connessione è attiva. Uno slice Redux (`chatSlice`) può usare `connectionEstablished` e `connectionLost` per aggiornare un booleano `isConnected` nello stato. I componenti possono quindi leggere questo stato per mostrare un indicatore di connessione (es. "Connesso" vs "Riconnessione...").

#### Passo 1.4: Il Cuore — Ricezione e Iniezione nella Cache

```javascript
socket.on('receiveMessage', (message: Message) => {
  storeApi.dispatch(
    api.util.updateQueryData(
      'getMessages', // Endpoint da aggiornare
      undefined,     // Argomenti della query
      (draft) => {   // Ricetta Immer
        draft.push(message);
      }
    ) as any
  );
});
```

  * **Cosa succede:** Questo è il listener più importante. Quando il server emette un evento `receiveMessage`, questo codice si attiva.
  * **Il "Trucco":** Invece di dispatchare un'azione semplice (come `chatSlice.addMessage(message)`), utilizza una utility potentissima di RTK Query: `api.util.updateQueryData`.
  * **`updateQueryData` spiegato:**
    1.  **`'getMessages'`**: Indica quale endpoint della cache deve essere manipolato.
    2.  **`undefined`**: Indica *quale istanza* della cache di `getMessages`. Poiché la query `getMessages` non ha argomenti (è `void`), usiamo `undefined` come chiave della cache.
    3.  **`(draft) => { draft.push(message); }`**: Questa è una "ricetta" Immer. RTK Query ci fornisce la bozza (`draft`) dello stato attuale della cache per `getMessages` (che è un array di messaggi). Noi **modifichiamo in modo mutativo** (ma sicuro) questa bozza aggiungendo il nuovo messaggio.
  * **Perché è così potente:** Qualsiasi componente nell'applicazione che sta usando `useGetMessagesQuery()` **si aggiornerà automaticamente e istantaneamente** con il nuovo messaggio, senza dover eseguire un refetch. Stiamo "iniettando" dati nella cache in modo proattivo.

-----

### Flusso 2: "IN USCITA" (Invio Dati)

Questo blocco gestisce l'invio di dati al server quando un'azione Redux lo richiede.

#### Passo 2.1: Intercettazione di un'Azione "Pending"

```javascript
if (api.endpoints.sendMessage.matchPending(action)) {
  // ...
```

  * **Cosa succede:** Qui intercettiamo un'azione molto specifica: l'azione *pending* (in attesa) della mutation `sendMessage` definita nel nostro `chatApi`.
  * **Perché `matchPending`:** Quando chiamiamo `trigger(newMessage)` dal nostro hook `useSendMessageMutation` in un componente, RTK Query dispatcha automaticamente un'azione `sendMessage/pending`. Questo è il momento perfetto per "catturare" l'intento dell'utente *prima* che RTK Query provi a fare una chiamata HTTP (che in questo caso non farà).

#### Passo 2.2: Logica Imperativa (Emissione)

```javascript
if (socket && socket.connected) {
  socket.emit(
    'sendMessage', 
    action.meta.arg.originalArgs // Il payload
  );
} else {
  console.error('[Socket Middleware] Socket non connesso.');
}
```

  * **Cosa succede:** Se il socket esiste ed è connesso, eseguiamo il comando imperativo: `socket.emit()`.
  * **Il Payload:** La parte più interessante è `action.meta.arg.originalArgs`. Questo è il modo in cui RTK Query espone gli argomenti originali passati alla funzione di mutazione. In pratica, è l'oggetto `NewMessage` che il componente ha cercato di inviare.
  * **Perché:** Il componente non ha idea che esista un socket. Pensa di stare solo eseguendo una "mutation" standard di RTK Query. Il middleware intercetta questa intenzione e la dirotta verso il socket.

-----

### Fase Finale: `return next(action);`

```javascript
return next(action);
```

Questa linea è **fondamentale** e deve essere presente alla fine di ogni middleware.

  * **Cosa fa:** Passa l'azione al prossimo middleware nella catena e, infine, ai reducer.
  * **Perché è importante qui:**
    1.  Permette all'azione `startConnecting` di raggiungere il suo reducer (se ne ha uno).
    2.  Permette all'azione `sendMessage/pending` di raggiungere RTK Query, che aggiornerà il suo stato interno (es. `isLoading: true`), anche se noi abbiamo gestito l'invio dei dati. Questo mantiene la coerenza dello stato della mutation.

-----

#### 3.4. Integrazione del Middleware nello Store

Ora "installiamo" il nostro nuovo `chatSlice` e il `socketMiddleware` nello store.

##### File: `client/src/app/store.ts` (Aggiornamento)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { chatApi } from '../features/chat/chatApi';
import chatReducer from '../features/chat/chatSlice'; // 1. Importa il nuovo reducer
import { createSocketMiddleware } from './socketMiddleware'; // 2. Importa la factory

// 3. Definisci l'URL del server
const SOCKET_URL = 'http://localhost:8080';

// 4. Crea un'istanza del middleware
const socketMiddleware = createSocketMiddleware(SOCKET_URL, chatApi);

export const store = configureStore({
  reducer: {
    [chatApi.reducerPath]: chatApi.reducer,
    chat: chatReducer, // 5. Aggiungi il reducer dello slice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(chatApi.middleware) // Il middleware di RTK Query
      .concat(socketMiddleware), // 6. Aggiungi il nostro middleware DOPO
});

// Inferisce i tipi `RootState` e `AppDispatch` dallo store stesso
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Ordine Critico:** L'ordine dei middleware è importante.

1.  `chatApi.middleware` deve venire prima. Gestisce il ciclo di vita `pending`/`fulfilled`/`rejected` delle nostre query/mutation.
2.  `socketMiddleware` viene dopo, così può *reagire* a quelle azioni `pending` che `chatApi.middleware` ha appena processato.

-----

**Punto di Controllo:**
Abbiamo completato il **Modulo 3**. L'intera logica è a posto, ma non è ancora *attivata*. L'applicazione si caricherà ancora con "Nessun messaggio" perché nessun componente ha ancora dispatchato l'azione `startConnecting()`.

Siamo pronti per il **Modulo 4**, dove costruiremo finalmente l'interfaccia utente che accenderà questo motore.





























-----

###  Modulo 4: L'Interfaccia (UI) - Tailwind Edition

#### 4.0. Prerequisito: Aggiungere Tailwind CDN

Per semplicità, useremo il CDN ufficiale di Tailwind. Questo ci evita di dover configurare PostCSS e `tailwind.config.js`.

Apri il file **`client/index.html`** (il file HTML principale del tuo progetto Vite) e aggiungi lo script di Tailwind all'interno del tag `<head>`.

##### File: `client/index.html` (Aggiornamento)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <title>RTK + WebSocket Chat</title>
  </head>
  <body class="bg-gray-100"> <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Inoltre, **svuota il contenuto** dei file `client/src/App.css` e `client/src/index.css`. Non ci servono più.

-----

#### 4.1. Avvio della Connessione (L'Accensione)

Questo passo è **esattamente identico** al precedente, poiché è pura logica e non ha nulla a che fare con il rendering.

Apri `client/src/main.tsx` e assicurati che l'azione `startConnecting` venga dispatchata.

##### File: `client/src/main.tsx` (Verifica)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// Assicurati che index.css sia vuoto o rimosso
// import './index.css'; 

import { Provider } from 'react-redux';
import { store } from './app/store.ts';

// 1. Importa l'azione che avvia la connessione
import { startConnecting } from './features/chat/chatSlice.ts';

// 2. Dispatcha l'azione "startConnecting"
// Questo "accende" il nostro socketMiddleware
console.log('Dispatching startConnecting...');
store.dispatch(startConnecting());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

-----

#### 4.2. Componente `<MessageList>` (Il Consumatore "Puro")


##### File: `client/src/features/chat/MessageList.tsx` 

```typescript
import React from 'react';
import { useGetMessagesQuery } from './chatApi';

export const MessageList: React.FC = () => {
  // 1. La logica dell'hook è invariata.
  const { data: messages, isLoading, isError } = useGetMessagesQuery();

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Caricamento messaggi...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500 font-semibold">
        Errore nel caricamento dei messaggi.
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nessun messaggio. Inizia a chattare!
      </div>
    );
  }

  // 2. Renderizza la lista con le classi Tailwind
  return (
    // Questa è la nostra "finestra" di messaggi scrollabile
    <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3">
      {messages.map((msg) => (
        <div 
          key={msg.id || `${msg.user}-${msg.timestamp}`} 
          className="p-2 px-3 bg-gray-200 rounded-xl max-w-xs self-start"
        >
          <strong className="font-bold text-gray-900 mr-1">{msg.user}: </strong>
          <span className="text-gray-800 break-words">{msg.text}</span>
        </div>
      ))}
    </div>
  );
};
```

-----

#### 4.3. Componente `<MessageInput>` (Il Produttore di "Intenzioni")


##### File: `client/src/features/chat/MessageInput.tsx` 

```typescript
import React, { useState } from 'react';
import { useSendMessageMutation } from './chatApi';

export const MessageInput: React.FC = () => {
  const [text, setText] = useState('');
  const [username] = useState('Utente' + Math.floor(Math.random() * 1000));

  // 1. Logica hook invariata
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isSending) {
      // 2. Logica di dispatch invariata
      sendMessage({
        user: username,
        text: text,
      });
      setText(''); // Svuota l'input
    }
  };

  // 3. Renderizza il form con classi Tailwind
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center p-4 border-t border-gray-200 bg-gray-50"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Scrivi un messaggio..."
        disabled={isSending}
        className="flex-grow border border-gray-300 rounded-full py-2 px-4 mr-3
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:bg-gray-100"
      />
      <button 
        type="submit" 
        disabled={isSending}
        className="bg-blue-500 text-white rounded-full py-2 px-5 font-semibold
                   hover:bg-blue-600 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:ring-offset-2
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSending ? 'Invio...' : 'Invia'}
      </button>
    </form>
  );
};
```

-----

#### 4.4. Assemblaggio Finale e Stato della Connessione

Creiamo il componente di stato e assembliamo il tutto in `App.tsx`.

##### File: `client/src/features/chat/ConnectionStatus.tsx` 

Questo componente "bonus" legge lo stato dal `chatSlice` che abbiamo creato nel Modulo 3.

```typescript
import React from 'react';
import { useAppSelector } from '../../app/hooks';

export const ConnectionStatus: React.FC = () => {
  const status = useAppSelector((state) => state.chat.status);

  // Mappa gli stati alle classi Tailwind
  const statusStyles = {
    disconnected: 'bg-red-500 text-white',
    connecting: 'bg-yellow-400 text-gray-800',
    connected: 'bg-green-500 text-white',
    error: 'bg-red-700 text-white',
  };

  return (
    <div 
      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusStyles[status]}`}
    >
      {status}
    </div>
  );
};
```

##### File: `client/src/App.tsx` (Aggiornamento Finale)

Infine, `App.tsx` assembla i nostri componenti "puri" e "stupidi", ora stilizzati con Tailwind.

```typescript
// Rimuovi l'import di App.css
// import './App.css'; 
import { MessageList } from './features/chat/MessageList';
import { MessageInput } from './features/chat/MessageInput';
import { ConnectionStatus } from './features/chat/ConnectionStatus';

function App() {
  return (
    // Questo è il contenitore principale dell'app
    <div className="w-full max-w-2xl h-[90vh] mx-auto my-8 bg-white 
                    rounded-lg shadow-2xl flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="p-4 bg-blue-600 text-white flex justify-between 
                       items-center shadow-md z-10">
        <h1 className="text-xl font-bold">RTK + WebSocket Chat (Tailwind)</h1>
        <ConnectionStatus />
      </header>
      
      {/* Finestra Chat (lista + input) */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Il consumatore "puro" */}
        <MessageList />
        
        {/* Il produttore di "intenzioni" */}
        <MessageInput />
      </div>

    </div>
  );
}

export default App;
```

-----










































-----

###  Modulo 5: Verifica Finale e Analisi Approfondita

#### 5.1. Il Test End-to-End (La Prova del Nove)

Questo è il momento della verità.

1.  **Avvio:** Assicurati che tutti i file siano salvati. Dal terminale nella cartella **root** del progetto (dove si trova `docker-compose.yml`), esegui:

    ```bash
    docker-compose up --build
    ```

    Attendi che entrambi i container (`chat-server` e `chat-client`) siano in esecuzione. Vedrai i log di Vite (`➜ Network: http://localhost:5173/`) e del server (` Server Socket.IO... in ascolto`).

2.  **Preparazione:** Apri **due finestre del browser** (possono essere due schede diverse o, ancora meglio, due finestre affiancate). In entrambe, naviga a `http://localhost:5173`.

3.  **Verifica Iniziale:** In entrambe le finestre, dovresti vedere:

      * L'header "RTK + WebSocket Chat".
      * Lo stato della connessione in alto a destra cambiare da `connecting` (giallo) a **`connected`** (verde).
      * Il messaggio "Nessun messaggio. Inizia a chattare\!".

4.  **Il Test:**

      * Nella **Finestra 1**, scrivi "Ciao mondo\!" e premi Invia.
      * **Verifica:** Il messaggio "Ciao mondo\!" deve apparire **istantaneamente** nella lista dei messaggi della **Finestra 1** *e* della **Finestra 2**.
      * Ora, nella **Finestra 2**, scrivi "Risposta\!" e premi Invia.
      * **Verifica:** Il messaggio "Risposta\!" deve apparire **istantaneamente** in entrambe le finestre.

Se questo accade, hai appena costruito con successo un'applicazione real-time completamente disaccoppiata.

-----

#### 5.2. Analisi del Flusso di Dati (Il Percorso Completo)

Ripercorriamo mentalmente i due flussi di dati che hai appena testato. Capire questo è la chiave di tutto il corso.

##### Flusso A: Invio di un Messaggio (Azione -\> Push)

Quando hai digitato "Ciao mondo\!" nella Finestra 1:

1.  `[UI - MessageInput]`

      * Il submit del form chiama la funzione `sendMessage({ user: '...', text: '...' })` dall'hook `useSendMessageMutation`.

2.  `[RTK - Azione]`

      * RTK Query dispatcha un'azione **`chatApi/executeQuery/sendMessage/pending`** nel Redux store.

3.  `[Middleware - Intercettazione]`

      * Il nostro **`socketMiddleware`** intercetta questa azione specifica (usando `api.endpoints.sendMessage.matchPending(action)`).

4.  `[Middleware - Esecuzione]`

      * Il middleware estrae il payload (`action.meta.arg.originalArgs`) ed esegue la logica "sporca" e imperativa: **`socket.emit('sendMessage', payload)`**.

5.  `[Server - Black Box]`

      * Il nostro server Socket.IO riceve l'evento `sendMessage` e fa un *broadcast* a *tutti* i client connessi, emettendo un nuovo evento: **`io.emit('receiveMessage', payload)`**.

##### Flusso B: Ricezione di un Messaggio (Push -\> Cache)

Questo flusso ora si attiva in *entrambe* le finestre (inclusa quella che ha inviato il messaggio):

1.  `[Middleware - Ascolto]`

      * Il listener **`socket.on('receiveMessage', ...)`** (creato all'avvio in `startConnecting`) si attiva in entrambe le app, ricevendo il nuovo messaggio.

2.  `[Middleware - Dispatch]`

      * Il middleware esegue il comando cruciale: **`storeApi.dispatch(api.util.updateQueryData(...))`**.

3.  `[RTK - Cache]`

      * RTK Query riceve questo "Thunk". Trova la cache per l'endpoint `getMessages` e, usando Immer, esegue la nostra "ricetta" (`draft.push(message)`), **iniettando** il nuovo messaggio direttamente nella cache.

4.  `[RTK - Notifica]`

      * La cache è cambiata. RTK Query notifica automaticamente tutti i componenti che sono sottoscritti a quella cache.

5.  `[UI - MessageList]`

      * L'hook **`useGetMessagesQuery()`** nel nostro componente `<MessageList>` riceve un nuovo array di `messages` e si ri-renderizza, mostrando il nuovo messaggio.

-----

#### 5.3. Conclusione: I Vantaggi del Nostro Modello

Perché abbiamo fatto tutta questa fatica invece di mettere `socket.on` in un `useEffect`? Per ottenere tre vantaggi professionali che definiscono un'architettura robusta.

  * **1. Single Source of Truth (SSOT)**
    Non abbiamo *mai* avuto un `useState` per i messaggi. Non abbiamo *mai* avuto uno slice Redux separato per i messaggi. L'unica fonte di verità per i dati del server è sempre stata la **cache di RTK Query**. Che i dati arrivino da una `fakeBaseQuery` o vengano iniettati da un WebSocket, l'interfaccia utente non lo sa e non le interessa. Legge da un unico posto. Questo elimina il 99% dei bug di sincronizzazione dello stato.

  * **2. Separation of Concerns (SoC)**
    Questo è il vantaggio più importante a livello architetturale. Ogni pezzo del nostro sistema ha una sola, chiara responsabilità:

      * **Componenti React (UI):** Sono "stupidi". Renderizzano lo stato (da `useGetMessagesQuery`) e comunicano intenzioni (con `useSendMessageMutation`). Fine.
      * **RTK Query (Stato):** È la nostra "fonte di verità". Gestisce la cache, lo stato di `isLoading`, e notifica la UI dei cambiamenti.
      * **Middleware (Logica di Business):** È il nostro "motore sporco". È l'**unico file** nell'intera applicazione che sa cosa sia un `Socket.IO`. Confinando lì tutta la logica imperativa, abbiamo reso il resto del sistema pulito e dichiarativo.

  * **3. Testabilità**
    Questo disaccoppiamento rende i test infinitamente più semplici:

      * Possiamo testare i componenti `<MessageList>` e `<MessageInput>` isolatamente, semplicemente mockando gli hook `use...Query` e `use...Mutation`. Non c'è bisogno di un server WebSocket funzionante per testare la UI.
      * Possiamo testare il `socketMiddleware` isolatamente, fornendogli uno store e un'API finti e verificando che chiami `socket.emit` quando riceve l'azione giusta.




































-----

###  Approfondimento: Docker e Nginx per React in Produzione

Per i professionisti, dockerizzare un'app React non significa solo *servire* i file. Significa farlo nel modo più **sicuro**, **efficiente** e **configurabile** possibile.

Tratteremo tre pilastri fondamentali:

1.  **L'Immagine (Build):** L'approccio multi-stage per immagini *minime* e *sicure*.
2.  **Il Server (Sicurezza):** Esecuzione di Nginx come utente **non-root**.
3.  **La Configurazione (Flessibilità):** L'iniezione di variabili d'ambiente a *runtime* (e non a *build-time*).

-----

### 1\. Il Pilastro: Il `Dockerfile` Multi-Stage

Questo è il fondamento. Abbandoniamo l'idea di un unico `Dockerfile` che installa `node`, `npm` e `nginx`. L'obiettivo è separare l'ambiente di *build* dall'ambiente di *runtime*.

**Perché?**

  * **Sicurezza:** L'immagine finale non contiene `node`, `npm`, `package.json` o codice sorgente. La superficie d'attacco è ridotta al minimo indispensabile: solo Nginx e i file statici.
  * **Dimensione:** L'immagine finale passa da \>1GB (con `node:alpine`) a \<50MB (con `nginx:alpine`). Questo accelera drasticamente il deploy e i pull dai registry.
  * **Pulizia:** Nessun artefatto di build, `node_modules` o file temporanei finisce in produzione.

#### Il `Dockerfile` Annotato

Questo `Dockerfile` implementa i primi due pilastri: **multi-stage** e **sicurezza non-root**.

```dockerfile
# --- STAGE 1: Build (L'Officina) ---
# Usiamo un'immagine Node specifica (LTS) e leggera (alpine)
# L'alias "build" è il nostro riferimento per dopo.
FROM node:20-alpine AS build

# Stabiliamo la directory di lavoro
WORKDIR /usr/src/app

# Copiamo *solo* i file di dipendenze per sfruttare la cache di Docker
# Se package.json non cambia, Docker non riesegue 'npm ci'.
COPY package.json package-lock.json ./

# Usiamo 'npm ci' (Clean Install) per build riproducibili
RUN npm ci

# Ora copiamo il resto del codice sorgente
COPY . .

# Eseguiamo la build di produzione
# Le variabili d'ambiente (es. VITE_*) possono essere passate qui
# con --build-arg se sono necessarie *durante la build*.
RUN npm run build

# --- STAGE 2: Production (Il Negozio) ---
# Partiamo da un'immagine Nginx pulita e minimale
FROM nginx:1.27-alpine

# --- PILASTRO 2: Sicurezza Non-Root ---
# 1. Rimuoviamo la configurazione di default
RUN rm /etc/nginx/conf.d/default.conf

# 2. Creiamo un utente e un gruppo 'appuser'
RUN addgroup -S appuser && adduser -S appuser -G appuser

# 3. Diamo la proprietà delle directory vitali di Nginx al nostro nuovo utente
# Nginx ha bisogno di scrivere su cache, log e il file PID.
RUN chown -R appuser:appuser /var/cache/nginx \
    && chown -R appuser:appuser /var/log/nginx \
    && chown -R appuser:appuser /var/lib/nginx \
    && chown -R appuser:appuser /etc/nginx/conf.d

# 4. Creiamo una directory per il PID file scrivibile dal nostro utente
# Le immagini Nginx standard cercano di scriverlo in /var/run, che richiede root.
RUN mkdir -p /var/run/nginx && chown -R appuser:appuser /var/run/nginx

# 5. Copiamo la nostra configurazione Nginx personalizzata (vedi sotto)
# Notare l'estensione ".template" per il Pilastro 3
COPY --chown=appuser:appuser nginx.conf.template /etc/nginx/templates/default.conf.template
# --- Fine Sezione Non-Root ---

# 6. Copiamo i file statici buildati dallo STAGE 1 ("build")
# e impostiamo il proprietario corretto
COPY --from=build --chown=appuser:appuser /usr/src/app/dist /usr/share/nginx/html

# 7. Diciamo a Nginx di ascoltare su una porta non privilegiata (>1024)
EXPOSE 8080

# 8. Indichiamo a Docker di eseguire i processi come 'appuser'
USER appuser

# 9. Il comando di default è ereditato dall'immagine Nginx base,
# che avvia lo script di entrypoint. Questo script eseguirà
# la sostituzione delle variabili (Pilastro 3) e poi avvierà Nginx.
CMD ["nginx", "-g", "daemon off;"]
```

-----

### 2\. La Configurazione: `nginx.conf` Avanzato

Questo file `nginx.conf` (rinominato in `nginx.conf.template`) è il cervello del nostro server. Risolve tre problemi:

1.  **Routing SPA:** Gestisce `react-router` reindirizzando tutte le richieste non-file a `/index.html`.
2.  **Performance:** Abilita `gzip` e imposta header di caching aggressivi.
3.  **Flessibilità (Pilastro 3):** È un *template*, non un file statico.

#### Il `nginx.conf.template` Annotato

```nginx
# --- PILASTRO 2: Sicurezza Non-Root ---
# 1. Specifichiamo il nostro utente non-root.
# Questo è fondamentale affinché i worker process vengano eseguiti come 'appuser'.
user appuser;

# 2. Definiamo il percorso del PID file in una directory scrivibile
pid /var/run/nginx/nginx.pid;

# Il resto è una configurazione Nginx standard ma ottimizzata
worker_processes auto;
error_log /var/log/nginx/error.log warn;
events { worker_connections 1024; }

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Impostazioni di sicurezza e performance
    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;

    # --- PILASTRO 3: Flessibilità (Variabili) ---
    # Le variabili ${...} NON sono sintassi Nginx.
    # Sono placeholder che 'envsubst' (il tool di sostituzione)
    # rimpiazzerà all'avvio del container.
    # Questo ci permette di cambiare il backend senza rebuildare l'immagine.
    
    # Esempio: un upstream per il nostro backend API
    # upstream api_backend {
    #   server ${API_HOST}:${API_PORT};
    # }

    # --- Performance: Gzip ---
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        application/x-javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript
        image/svg+xml;

    server {
        # Ascolta sulla porta non-root definita nel Dockerfile
        listen ${PORT};

        # Directory root che abbiamo popolato nel Dockerfile
        root /usr/share/nginx/html;
        index index.html;
        
        # === Il Fix Cruciale per le SPA ===
        # Prova a servire il file richiesto ($uri)
        # Se è una cartella, prova a servire l'index ($uri/)
        # Se fallisce, ritorna /index.html e lascia gestire a React Router.
        location / {
            try_files $uri $uri/ /index.html;
        }

        # === Performance: Caching Aggressivo ===
        # Per i file statici con hash (CSS, JS, Web Fonts),
        # possiamo impostare una cache "immutabile" e a lunga scadenza.
        location ~* \.(?:css|js|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off; # Non loggare le richieste di file statici
        }

        # Per altri asset (immagini) usiamo una cache più breve
        location ~* \.(?:jpg|jpeg|gif|png|ico|svg)$ {
            expires 7d;
            add_header Cache-Control "public";
            access_log off;
        }

        # === Flessibilità: Proxy API ===
        # Inoltra tutte le richieste /api al nostro backend
        # location /api {
        #   proxy_pass http://api_backend;
        #   proxy_set_header Host $host;
        #   proxy_set_header X-Real-IP $remote_addr;
        #   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        #   proxy_set_header X-Forwarded-Proto $scheme;
        # }
    }
}
```

-----

### 3\. Pilastro: Flessibilità a Runtime (Envsubst)

Questo è il concetto che separa un setup amatoriale da uno professionale.

**Il Problema:** L'app React (es. `VITE_API_URL`) e Nginx (`proxy_pass`) hanno bisogno di conoscere l'URL del backend. Il modo *ingenuo* è "hardcodare" `http://api.prod.com` a *build-time*. Questo crea un **artefatto tossico**: un'immagine Docker che funziona *solo* in produzione e non può essere testata in staging (che ha un API diversa) senza essere ricostruita.

**La Soluzione:** Usiamo `envsubst`, un tool standard di Linux.

1.  L'immagine Nginx ufficiale (che usiamo come base) contiene uno script di entrypoint.
2.  Questo script cerca automaticamente i file in `/etc/nginx/templates/*.template`.
3.  Prima di avviare Nginx, esegue `envsubst` su questi file, sostituendo i placeholder `${VAR}` con le variabili d'ambiente passate al container (`docker run -e ...`).
4.  Il file risultante (es. `default.conf`) viene salvato in `/etc/nginx/conf.d/`.
5.  Infine, Nginx si avvia con la configurazione *dinamicamente generata*.

#### Come usarlo (Esempio `docker-compose.yml`)

```yaml
services:
  frontend:
    build: .
    container_name: react-spa
    ports:
      # Mappa la porta dell'host alla porta 8080 del container
      - "80:8080" 
    environment:
      # Queste variabili saranno iniettate nel .template
      - PORT=8080
      # - API_HOST=api-service
      # - API_PORT=3000
```

Avviando questo compose, l'entrypoint di Nginx prenderà il nostro `default.conf.template`, vedrà `listen ${PORT};`, lo sostituirà con `listen 8080;` e avvierà il server.

Ora hai un'unica immagine che può essere promossa in tutti gli ambienti (dev, staging, prod) semplicemente cambiando le variabili d'ambiente.

[Immagine di Docker multi-stage build diagram]

-----

### Riepilogo dei Vantaggi

Seguendo questa guida, hai ottenuto:

  * **Immagini Minime:** Piccole, veloci da scaricare e avviare.
  * **Sicurezza (Least Privilege):** I processi non vengono eseguiti come `root`, riducendo drasticamente il potenziale danno in caso di vulnerabilità.
  * **Performance Ottimizzata:** `gzip` e caching aggressivo riducono i tempi di caricamento.
  * **Routing Corretto:** La tua SPA funziona correttamente con refresh e link diretti.
  * **Flessibilità (12-Factor App):** La configurazione è disaccoppiata dall'immagine, permettendo un'unica pipeline di build per tutti gli ambienti.

Questo è un setup robusto, sicuro e scalabile, pronto per qualsiasi ambiente di produzione.

-----


























