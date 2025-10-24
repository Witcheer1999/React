

## 1.1 Introduzione alla Gestione dei Dati Asincroni in Applicazioni Frontend

### 1.1.1 Il problema della sincronizzazione dello **stato del server** con lo **stato del client**

Quando sviluppiamo applicazioni web moderne, la quasi totalità dei dati visualizzati proviene da un'origine esterna: un **server** (tramite un'API REST o GraphQL).

Si definiscono due tipi di stato cruciali:

1.  **Stato del Server (Server State):**
    * I dati risiedono sul server remoto (database).
    * Sono **persistenti** (sopravvivono al ricaricamento dell'applicazione).
    * Sono **condivisi** tra più utenti.
    * Sono **asincroni** (richiedono tempo per essere recuperati via rete).
2.  **Stato del Client (Client State) o Stato Locale:**
    * I dati risiedono nella memoria dell'applicazione React.
    * Sono spesso usati per la UI (es. un campo di input, l'apertura di un modale, il tema scuro).
    * Sono sincroni e facili da gestire (es. tramite `useState` o Redux).

**Il Problema della Sincronizzazione:**

Il problema principale nell'*application development* è che lo stato del client, che mostra i dati all'utente, deve essere costantemente **sincronizzato** e **aggiornato** rispetto allo stato del server.

Ogni volta che si effettua una richiesta al server (una *query* o una *mutazione*), bisogna gestire una serie di stati temporanei:

* **Caricamento (`loading`):** L'utente attende la risposta.
* **Successo (`success`):** I dati sono arrivati e vanno aggiornati nel client state.
* **Errore (`error`):** Si è verificato un problema di rete o di server.
* **Stale Data:** I dati recuperati in precedenza sono potenzialmente **obsoleti** perché un altro utente o un'altra operazione li ha modificati nel frattempo.

Questa gestione, se fatta manualmente, porta a codice ripetitivo (*boilerplate*) e complesso, soprattutto nel mantenere la coerenza tra le varie viste dell'applicazione.

***

### 1.1.2 Breve panoramica: *fetch* API, *Axios*, e soluzioni di stato globale (Redux/RTK)

Prima di RTK Query, l'ecosistema React ha affrontato la gestione dei dati asincroni attraverso diverse soluzioni, ognuna con i propri pro e contro:

| Strumento/Soluzione | Descrizione | Pro / Contro Principali |
| :--- | :--- | :--- |
| **Native `fetch` API** | La funzione nativa di JavaScript per effettuare richieste HTTP. | **Pro:** Nessuna dipendenza esterna. **Contro:** API di basso livello; richiede gestione manuale della *serializzazione JSON* e degli *errori di rete*. |
| **Axios / Simili** | Una libreria di client HTTP basata su *Promise* molto popolare. | **Pro:** Migliore gestione degli errori; intercettori di richiesta/risposta. **Contro:** È solo un *layer* di trasporto; non risolve i problemi di caching e sincronizzazione. |
| **Redux (Manuale con *Thunks* o *Sagas*)** | Utilizzo di una logica globale per salvare i dati del server nello stato del client. | **Pro:** Centralizzazione dello stato. **Contro:** **Massivo *boilerplate*** (è necessario scrivere *action*, *reducer* e *thunk* per *ogni singola* richiesta API); non gestisce il *caching* e la *deduplicazione* automaticamente. |

Queste soluzioni richiedono che il programmatore scriva manualmente il codice per:

1.  Avviare la richiesta.
2.  Gestire l'azione di caricamento (es. mostrare uno spinner).
3.  Salvare i dati nella store Redux in caso di successo.
4.  Salvare l'errore in caso di fallimento.
5.  **Bonus:** Gestire il *refetching* quando i dati diventano *stale*.

RTK Query nasce proprio per **eliminare questo *boilerplate*** e fornire una soluzione dichiarativa e automatizzata per la gestione dello stato del server. 



























***

## 1.3 Introduzione a RTK Query: Perché e Cosa Risolve

RTK Query non è una semplice libreria per chiamate HTTP, ma una soluzione completa e sofisticata per la gestione dei dati asincroni e del *caching* all'interno dell'ecosistema Redux Toolkit.

### 1.3.1 Definizione e ruolo di RTK Query (*data fetching*, *caching*, gestione errori)

RTK Query è un potente **add-on di Redux Toolkit (RTK)**, progettato per il *data fetching* e il *caching*. Si basa sul principio del **declarative data fetching**, ovvero, invece di *dire come* recuperare i dati (come avviene con le *thunk* manuali), tu *dichiari quali* dati ti servono.

I suoi ruoli principali sono:

#### 1. Data Fetching Centralizzato (Recupero Dati)

RTK Query ti permette di definire tutti i tuoi *endpoint* API (ad esempio `/posts`, `/users/{id}`, ecc.) in un unico luogo: l'**API Slice**.

* **Cosa risolve:** Elimina il bisogno di scrivere *thunk* e *reducer* ripetitivi per ogni operazione asincrona. Gestisce automaticamente le azioni `PENDING`, `FULFILLED` e `REJECTED`.

#### 2. Caching Automatico e Deduplicazione

Questo è il suo superpotere. RTK Query mantiene una copia in memoria dei dati recuperati (*cache*).

* **Cosa risolve:**
    * **Deduplicazione delle richieste:** Se due componenti diversi richiedono gli stessi dati (stesso *endpoint* e stessi parametri) quasi contemporaneamente, RTK Query invierà **una sola richiesta HTTP** al server. Entrambi i componenti riceveranno la stessa risposta.
    * **Riutilizzo dei dati in cache:** Se un utente lascia una pagina e poi ci torna, e i dati non sono stati contrassegnati come obsoleti (*stale*), RTK Query servirà immediatamente i dati dalla cache **senza rifare la chiamata al server**. Questo migliora drasticamente la velocità percepita (*User Experience*).

#### 3. Gestione e Normalizzazione degli Stati Asincroni

RTK Query fornisce *React Hooks* personalizzati che espongono automaticamente lo stato della richiesta in modo pulito.

* **Cosa risolve:**
    * Fornisce in modo automatico lo stato di **`isLoading`** (la richiesta è in corso), **`isFetching`** (i dati sono in cache ma stiamo chiedendo un aggiornamento) e **`isError`** (si è verificato un errore).
    * Gestisce il **Refetching Automatico**: Se la connessione di rete viene ripristinata o se la finestra del browser torna in primo piano (*focus*), RTK Query può automaticamente tentare di rifare le chiamate fallite o aggiornare i dati obsoleti.

#### 4. Invalidazione e Aggiornamento della UI

Dopo aver effettuato una mutazione (es. `POST` o `DELETE`), è necessario aggiornare i dati correlati in altre parti dell'applicazione.

* **Cosa risolve:** Tramite un sistema basato su **tag**, RTK Query permette di "invalidare" specifici set di dati dopo una mutazione. Se, ad esempio, crei un nuovo `Post`, puoi invalidare il tag 'Posts'. RTK Query vedrà che tutte le query sottoscritte a quel tag sono obsolete e le **ri-eseguirà automaticamente** per aggiornare la UI. Questo elimina la necessità di aggiornare manualmente lo stato globale dopo le mutazioni. 

























---

### 1.3 Vantaggi principali: **zero-config**, **automatic re-fetching**, **caching**

RTK Query è stato progettato per risolvere la maggior parte delle sfide del *data fetching* con uno sforzo minimo da parte dello sviluppatore, offrendo vantaggi che si traducono direttamente in applicazioni più veloci e codice più pulito.

#### 1. Zero-Config (O Quasi) 

Il termine "zero-config" si riferisce alla notevole riduzione del *boilerplate* rispetto alla gestione manuale in Redux.

* **Minore Boilerplate:** Per definire un endpoint API in sola lettura (una *query*), è necessario scrivere solo una piccola funzione dichiarativa. RTK Query si occupa di generare automaticamente:
    * Lo **Slice di Redux** completo (`reducer`).
    * Le **Action** (per *pending*, *fulfilled*, *rejected*).
    * Gli **Hooks di React** personalizzati (es. `useGetPostsQuery()`).
* **Centralizzazione:** Tutte le configurazioni relative alla rete (URL di base, *headers*) sono definite in un unico `createApi` e vengono riutilizzate in tutti gli *endpoints*.
* **Cosa significa per lo sviluppatore:** Si passa da decine di righe di codice per ogni singola chiamata API a poche righe di configurazione, permettendo di concentrarsi sulla logica di business e sulla UI.

#### 2. Automatic Re-fetching (Aggiornamento Automatico) 

RTK Query gestisce in modo intelligente quando e come i dati devono essere aggiornati, garantendo che l'utente veda sempre dati coerenti.

* **Invalidazione dei Tag:** Come visto, il meccanismo di **`invalidatesTags`** e **`providesTags`** garantisce che, dopo un'operazione di scrittura (*mutazione*), tutte le *query* che visualizzano quei dati vengano **automaticamente ri-eseguite**. Questo assicura l'aggiornamento della UI in modo coerente e automatico.
* **Focus Re-fetching:** Per impostazione predefinita, RTK Query può essere configurato per eseguire un *re-fetch* automatico quando l'utente riporta la finestra del browser in primo piano (*window focus*). Questo è fondamentale per prevenire il problema dei **Dati Obsoleti (Stale Data)**, un problema comune nelle app che rimangono aperte a lungo.
* **Connettività:** Gestisce il *refetch* se la connessione di rete viene persa e poi ripristinata.

#### 3. Caching e Deduplicazione Intelligente 

La gestione della cache è la funzionalità più potente di RTK Query e la principale differenza rispetto a un semplice *wrapper* come Axios.

* **Richieste Uniche:** Se dieci componenti diversi montati sullo schermo richiedono lo stesso elenco di utenti, RTK Query garantisce che venga inviata **una sola richiesta HTTP** al server. La risposta viene salvata in cache e distribuita a tutti i componenti sottoscritti.
* **Riutilizzo Veloce dei Dati:** Se un utente naviga tra le pagine e poi torna indietro, se i dati nella cache non sono scaduti (il tempo è configurabile tramite `keepUnusedDataFor`), i dati vengono serviti **istantaneamente**. Solo quando i dati sono scaduti o invalidati, viene inviata una nuova richiesta al server.
* **Gestione delle Sottoscrizioni:** RTK Query tiene traccia di quali componenti stanno "ascoltando" (sono sottoscritti a) una particolare query. Quando l'ultimo componente si smonta, la cache per quei dati viene mantenuta per un breve periodo di tempo prima di essere ripulita, ottimizzando l'uso della memoria e preparando l'app per un possibile rapido ritorno sulla stessa pagina.




























-----

## 2.1 L'API Slice: Il Cuore di RTK Query

L'API Slice è il luogo centrale in cui definiamo come la nostra applicazione interagirà con il server. È l'oggetto che utilizzeremo per configurare le richieste, la cache e la logica di *fetching*.

### 2.1.1 Struttura e setup iniziale: `createApi`

La funzione `createApi` di Redux Toolkit è il costruttore principale che utilizziamo per creare il nostro API Slice. Questa funzione accetta un singolo oggetto di configurazione con diverse proprietà fondamentali.

Ecco la struttura di base e i parametri essenziali:

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 1. Configurazione dell'API Slice
export const apiSlice = createApi({
    
    // a. Identificazione
    reducerPath: 'api', // Il nome dello slice nello Store Redux
    
    // b. Configurazione del client HTTP
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api/' }),
    
    // c. Tags per la cache (spiegati meglio in Sezione 3)
    tagTypes: ['Posts', 'Users', 'Products'], 
    
    // d. Definizione degli endpoint (Query e Mutazioni)
    endpoints: (builder) => ({
        // Gli endpoints vengono definiti qui...
    }),
});
```

Analizziamo i quattro elementi chiave del `createApi`:

#### a. `reducerPath` (Identificazione)

Questa proprietà è una stringa che definisce il nome della sezione del tuo **Store Redux** in cui verranno salvati tutti i dati e gli stati della cache di RTK Query.

  * **Esempio:** Se imposti `'api'`, tutti i dati di *fetching*, *loading* e *errori* saranno disponibili sotto `store.api` nello stato globale. È fondamentale che questo nome sia **unico** nel tuo Store.

#### b. `baseQuery` (Configurazione del Client HTTP)

Questa è la funzione che RTK Query utilizza per effettivamente effettuare le richieste HTTP. Indica come costruire la richiesta e gestisce la sua esecuzione.

  * **`fetchBaseQuery`:** È un *wrapper* leggero e predefinito attorno all'API nativa di JavaScript (`fetch`). È la scelta più comune e robusta.
  * **`baseUrl`:** Il parametro essenziale all'interno di `fetchBaseQuery`. È l'URL base che verrà prepeso a tutti gli *endpoint* specificati successivamente.
      * **Vantaggio:** Rende la configurazione degli *endpoint* pulita e riutilizzabile (es. scriveremo solo `/posts` invece di `http://localhost:3000/api/posts`).

#### c. `tagTypes` (Cache Invalidation)

È un array di stringhe che definiscono le "etichette" logiche dei dati gestiti dalla tua applicazione (es. `Posts`, `Users`).

  * **Ruolo:** Questi tag non fanno nulla da soli, ma sono la base per il meccanismo di **invalidazione della cache** (che affronteremo nella Sezione 3). Permettono a una *mutazione* (es. creare un Post) di notificare ad una *query* (es. elencare i Post) che i dati sono cambiati e devono essere aggiornati.

#### d. `endpoints` (Definizione delle Operazioni)

Questa è una funzione che riceve l'oggetto `builder` e restituisce un oggetto contenente tutte le *query* (lettura) e le *mutazioni* (scrittura) necessarie per comunicare con il server.

  * Questa sezione è il cuore dichiarativo di RTK Query e sarà l'oggetto della prossima spiegazione.

-----

### Passo Successivo: Integrazione nello Store

Dopo aver creato l'API Slice, l'ultimo passaggio è integrarlo nello Store di Redux:

```javascript
// store.js (Integrazione)

import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice'; // Il file che abbiamo appena creato

export const store = configureStore({
    reducer: {
        // Aggiungiamo il reducer generato da createApi
        [apiSlice.reducerPath]: apiSlice.reducer,
        // Altri slice (es. UI slice, auth slice, ecc.)
    },
    
    // Middleware è fondamentale per le operazioni asincrone e caching
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(apiSlice.middleware),
});
```

  * **Aggiungere il Reducer:** Inseriamo il `reducer` generato da RTK Query nello Store, utilizzando la chiave definita in `reducerPath`.
  * **Aggiungere il Middleware:** Il **middleware** è il motore di RTK Query. È responsabile dell'esecuzione delle richieste HTTP, della gestione del *caching*, della *deduplicazione* e di tutto l'automatic *re-fetching*. È **obbligatorio** aggiungerlo concatenandolo ai middleware di default.

Con questa configurazione, abbiamo preparato il terreno: il nostro Store è pronto per intercettare e gestire tutte le richieste API dichiarate.












































-----

### 2.1.2 `reducerPath`: Identificazione dello slice di RTK Query

In Redux Toolkit, ogni parte di stato gestita da un `createSlice` o, nel nostro caso, da un `createApi`, viene inserita nello Store globale sotto una chiave specifica. Questa chiave è definita da `reducerPath`.

#### Definizione e Scopo

Il `reducerPath` è una **proprietà obbligatoria** all'interno della configurazione di `createApi` e serve come **chiave univoca** per lo stato di RTK Query all'interno del tuo Store Redux.

Quando specifichi:

```javascript
export const apiSlice = createApi({
    reducerPath: 'api', // <--- Questo è il percorso
    // ... altre configurazioni
});
```

Stai istruendo Redux a salvare **tutti i dati della cache, gli stati di caricamento e di errore** relativi alle tue richieste API sotto la chiave `'api'`.

#### Interazione con lo Store

Per capire meglio, consideriamo come appare il tuo Store Redux dopo aver integrato l'API Slice:

**File `store.js`:**

```javascript
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
    reducer: {
        // [apiSlice.reducerPath] si risolve in 'api'
        [apiSlice.reducerPath]: apiSlice.reducer,
        
        // Esempio di un altro slice di stato locale/UI
        ui: uiReducer,
    },
    // ... middleware
});
```

**Struttura dello Stato Globale (Immagine concettuale):**

```
{
    // Stato di RTK Query: contiene cache, sottoscrizioni, ecc.
    api: { 
        queries: { ... }, 
        mutations: { ... }, 
        provided: { ... },
        // ...
    }, 
    
    // Stato di un altro slice (es. per il tema scuro o un modale aperto)
    ui: {
        isSidebarOpen: true
    }
}
```

#### Regola Fondamentale: Unicità

È cruciale che il valore di `reducerPath` sia **unico** all'interno del tuo oggetto `reducer` nello Store Redux. Se usassi, ad esempio, `'ui'` come `reducerPath` e avessi già un `uiReducer`, si verificherebbe un conflitto, e lo stato gestito da RTK Query sovrascriverebbe lo stato del tuo slice `ui` o viceversa.

**In sintesi:** `reducerPath` è la tua etichetta, il "nome del cassetto" nello Store Redux, che isola e contiene l'intero meccanismo di gestione del server state di RTK Query, compresi i dati in cache e tutti i metadati di *fetching*.



























-----

## 2.1.3 `baseQuery`: Configurazione del Client HTTP e Integrazione di Axios 

La proprietà `baseQuery` è il meccanismo che RTK Query utilizza per effettuare concretamente le richieste HTTP. Sebbene `fetchBaseQuery` sia lo standard, in contesti professionali è spesso necessario utilizzare **Axios** per sfruttare funzionalità come gli **interceptor**.

Per integrare Axios, non possiamo semplicemente passarlo a `createApi`; dobbiamo creare una **funzione adattatrice custom** che traduca la sintassi di RTK Query in una chiamata Axios e viceversa.

### Creazione della `axiosBaseQuery` Custom

Dobbiamo definire una funzione che agisca come la nostra `baseQuery`. Questa funzione deve ricevere l'oggetto contenente i dettagli della richiesta (come l'URL, il metodo, i dati) e restituire una promessa che si risolva in un oggetto nel formato atteso da RTK Query: `{ data }` (in caso di successo) o `{ error }` (in caso di errore).

#### Passo 1: Configurazione dell'Istanza Axios

È prassi comune creare un'istanza di Axios con configurazioni di base (URL, timeout, ecc.).

```javascript
// axiosBaseQuery.js (o api.js)
import axios from 'axios';
import { BaseQueryFn } from '@reduxjs/toolkit/query';

// 1. Creiamo un'istanza di Axios
const axiosInstance = axios.create({
    baseURL: 'https://miaapi.com/v1/', // L'URL di base centrale
    timeout: 10000,
});

// 2. Definiamo la funzione baseQuery adattatrice
// <any, unknown, unknown> definisce i tipi: Args, Result, Error
export const axiosBaseQuery = 
    (
        { baseUrl } = { baseUrl: '' }
    ) => 
    async ({ url, method, data, params }) => {
        try {
            const result = await axiosInstance({
                url: baseUrl + url, // Combina baseUrl (se passato qui) con l'url dell'endpoint
                method,
                data, // Per POST/PUT
                params, // Per i parametri di query (GET)
                // Altri dettagli come headers possono essere aggiunti qui
            });
            // In caso di successo, RTK Query si aspetta { data: ... }
            return { data: result.data };
        } catch (axiosError) {
            let err = axiosError;
            // In caso di errore, RTK Query si aspetta { error: ... }
            return {
                error: {
                    status: err.response?.status,
                    data: err.response?.data || err.message,
                },
            };
        }
    };
```

#### Passo 2: Integrazione in `createApi`

Ora, usiamo la funzione `axiosBaseQuery` al posto di `fetchBaseQuery` nel nostro API Slice.

```javascript
// apiSlice.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery'; // Importiamo la nostra funzione

export const apiSlice = createApi({
    reducerPath: 'api',
    // ⬇ Utilizziamo la nostra baseQuery personalizzata basata su Axios
    baseQuery: axiosBaseQuery(), 
    tagTypes: ['Posts', 'Users'], 
    endpoints: (builder) => ({
        // ... definizione degli endpoint
    }),
});
```

### Vantaggi dell'Integrazione di Axios

L'uso di una `baseQuery` basata su Axios offre benefici professionali significativi che vanno oltre il semplice trasporto dei dati:

1.  **Interceptor Globali (Il Vantaggio Maggiore):**
      * Axios permette di definire **interceptor** per le richieste e le risposte. Questi agiscono come "guardie" che possono ispezionare o modificare tutte le richieste/risposte *prima* che lascino il client o *prima* che raggiungano la logica `try/catch` di RTK Query.
      * **Esempio:** L'interceptor delle richieste può essere usato per aggiungere automaticamente il token JWT a tutti gli *header*. L'interceptor delle risposte può essere usato per gestire il caso di $401$ (Non autorizzato) **rinnovando il token** e **ritentando la richiesta**, senza sporcare la logica specifica di ogni *endpoint*.
2.  **Trasformazione JSON Automatica:** Simile a `fetchBaseQuery`, Axios gestisce nativamente la trasformazione dei dati in JSON, semplificando la risposta.
3.  **Configurazione Dettagliata:** Maggiore controllo sulla gestione di *timeout*, *cookies* e configurazioni avanzate di rete rispetto all'API nativa `fetch()`.

In sintesi, la `axiosBaseQuery` funge da **traduttore** che consente a RTK Query di sfruttare la robustezza di Axios mantenendo al contempo il proprio meccanismo di *caching*, *deduplicazione* e generazione automatica degli *hooks*.































-----

## 2.2 Definizione degli Endpoint: Query (GET)

Gli *endpoint* sono le singole operazioni che la tua applicazione deve poter eseguire, sia per leggere dati (`query`) che per modificarli (`mutation`). La definizione avviene all'interno della proprietà `endpoints` dell'oggetto `createApi`.

### 2.2.1 `endpoints: (builder) => ({...})`: Sintassi per Definire le Operazioni

La proprietà `endpoints` accetta una funzione. Questa funzione riceve un oggetto chiamato `builder` come argomento e deve **restituire un oggetto** che mappa i nomi delle tue operazioni (che diventeranno i nomi dei tuoi *hooks*) alle loro definizioni specifiche.

**Sintassi di base:**

```javascript
// apiSlice.js
import { createApi } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    // ... configurazione baseQuery, reducerPath, ecc.
    tagTypes: ['Posts'], 
    
    endpoints: (builder) => ({
        // Il builder è l'oggetto che fornisce i metodi:
        // builder.query (per GET)
        // builder.mutation (per POST, PUT, DELETE)
        
        // 1. Definiamo la nostra prima Query (GET)
        getPosts: builder.query({
            // 2. La query function
            query: () => '/posts', // Specifica il path rispetto al baseUrl
            
            // 3. (Opzionale) Tag per la cache
            providesTags: ['Posts'],
        }),
        
        // 4. Definiamo una Query che richiede un argomento (es. un ID)
        getSinglePost: builder.query({
            // 'postId' è l'argomento che passeremo al hook in React
            query: (postId) => `/posts/${postId}`, 
            
            // Tag per invalidare un singolo elemento
            providesTags: (result, error, postId) => [{ type: 'Posts', id: postId }],
        }),
        
    }),
});
```

#### Anatomia della Definizione dell'Endpoint

1.  **Nome dell'Operazione (`getPosts`, `getSinglePost`):**

      * Questa è la chiave dell'oggetto restituito dalla funzione `endpoints`.
      * **Cruciale:** Questo nome verrà utilizzato per generare automaticamente il *React Hook*. Nel nostro esempio, genererà `useGetPostsQuery()` e `useGetSinglePostQuery()`.

2.  **`builder.query({...})`:**

      * Indica che stiamo definendo un'operazione di lettura dati (equivalente a una richiesta **GET**).

3.  **`query` (La Funzione di Richiesta):**

      * Questa è una funzione che riceve eventuali argomenti (es. `postId`) e restituisce una stringa o un oggetto che la `baseQuery` utilizzerà per costruire la richiesta HTTP.
      * **Caso Semplice (Nessun Argomento):** `query: () => '/posts'` genera una richiesta `GET` a `[baseUrl]/posts`.
      * **Caso con Argomento:** `query: (postId) => \`/posts/${postId}\``genera una richiesta`GET`a, ad esempio,`[baseUrl]/posts/123\`.

4.  **`providesTags` (Gestione della Cache - Introduzione):**

      * Questa proprietà è un array di tag che associamo ai dati restituiti da questa *query*.
      * **Ruolo:** Dichiariamo che questa *query* **fornisce** dati etichettati con questi tag (es. `'Posts'`). Successivamente, una *mutazione* potrà **invalidare** questi tag, forzando questa *query* a riaggiornarsi.

La dichiarazione di questi *endpoint* è l'unico codice che dobbiamo scrivere. RTK Query si occuperà di tutto il *data fetching*, *caching* e della gestione degli stati di caricamento.































-----

## 2.2.2 `builder.query()`: Definizione di una Query per il Recupero Dati

La funzione `builder.query()` è il metodo specifico all'interno di `endpoints` che utilizziamo per definire qualsiasi operazione che corrisponda a una richiesta **GET** al server, ovvero il recupero di dati.

Quando usiamo `builder.query()`, stiamo dichiarando a RTK Query che:

1.  Vogliamo recuperare dati dal server.
2.  Questi dati verranno **messi in cache** e saranno soggetti alla logica di deduplicazione.
3.  Vogliamo un **React Hook** generato automaticamente per accedere a questi dati.

### Parametri Chiave di `builder.query()`

La funzione accetta un oggetto di configurazione con due proprietà essenziali e una opzionale ma cruciale per il *caching*:

#### 1\. `query` (Obbligatoria)

È il cuore della richiesta. Deve essere una funzione che accetta un argomento (o nessuno) e restituisce un oggetto che descrive la richiesta.

  * **Ritorno Semplice (Stringa):** Se restituisce una stringa, questa viene trattata come il **path** relativo alla `baseUrl`.

    ```javascript
    // Esempio 1: Recupera tutti i post (non prende argomenti)
    query: () => 'posts', 
    // Risulta in: GET https://miaapi.com/v1/posts
    ```

  * **Ritorno Dinamico (con Argomento):** La funzione riceve l'argomento passato dal *hook* di React e lo usa per costruire dinamicamente l'URL.

    ```javascript
    // Esempio 2: Recupera un post specifico (richiede un ID)
    query: (id) => `posts/${id}`,
    // Se chiami l'hook con useGetPostQuery(5), risulta in: GET https://miaapi.com/v1/posts/5
    ```

  * **Ritorno Oggetto (Configurazione Avanzata):** Se si deve specificare il metodo HTTP (anche se per le query è sempre GET) o passare parametri di query URL (`?param=value`), si può restituire un oggetto.

    ```javascript
    // Esempio 3: Filtra i post usando i parametri di query
    query: ({ userId, limit }) => ({
        url: 'posts',
        params: { user_id: userId, _limit: limit }, // Aggiunge ?user_id=X&_limit=Y
    }),
    ```

#### 2\. `transformResponse` (Opzionale)

Questa funzione è utile se i dati grezzi restituiti dal server devono essere rimodellati o puliti prima di essere salvati nella cache Redux.

```javascript
query: () => 'posts',
// Trasforma l'array di post grezzo in una mappa normalizzata
transformResponse: (response) => {
    // Aggiungiamo un campo 'isNew' a ogni post prima di salvarlo
    return response.map(post => ({ 
        ...post, 
        isNew: true 
    }));
},
```

#### 3\. `providesTags` (Cruciale per il Caching Intelligente)

Come accennato, questa proprietà stabilisce l'etichetta del dato in cache. È fondamentale per il meccanismo di **invalidazione**.

  * Deve restituire un array di tag, definiti precedentemente in `tagTypes`.
  * Quando una *mutazione* invalida il tag `'Posts'`, RTK Query sa che deve rifare automaticamente tutte le query che dichiarano `providesTags: ['Posts']`.

<!-- end list -->

```javascript
// Esempio: Applica il tag 'Posts' all'intera lista
providesTags: ['Posts'] 
```

**Sintesi dell'Output:**

Quando definiamo un endpoint con `builder.query()`, RTK Query utilizza il nome della chiave (es. `getPosts`) per creare un *React Hook* nel formato `useGetPostsQuery` che può essere importato e utilizzato direttamente nei componenti React.


































-----

## Guida Completa: RTK Query con `baseQuery` personalizzata (Axios e TypeScript)

Questa guida illustra l'intero processo di integrazione di RTK Query in un'applicazione React, utilizzando un'istanza Axios personalizzata come `baseQuery`.

### Passo 1: Definizione dei Tipi di Dati (TypeScript)

Iniziamo definendo le interfacce per i nostri dati e per gli argomenti che la nostra `baseQuery` personalizzata accetterà.

```typescript
// src/types.ts
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

// Interfaccia per la struttura della richiesta che l'endpoint passerà alla baseQuery
export interface BaseQueryArgs {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: unknown; // Dati per POST/PUT/PATCH (body)
  params?: unknown; // Parametri di query URL (es. ?userId=1)
}
```

-----

### Passo 2: Creazione dell'Istanza Axios Centralizzata

Creiamo un'istanza Axios che può essere condivisa. Questo è il posto ideale per inserire configurazioni globali come `baseURL`, `headers` o *interceptor*.

```typescript
// src/api/axiosInstance.ts
import axios from "axios";

const API_BASE_URL: string = "https://jsonplaceholder.typicode.com/";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

-----

### Passo 3: Creazione dell'Adattatore `axiosBaseQuery`

Questo è il "ponte" tra RTK Query e Axios. È una funzione che *restituisce* la nostra `baseQuery`. Utilizza i tipi `BaseQueryFn` di RTK e `AxiosError` di Axios per una gestione robusta e tipizzata.

```typescript
// src/api/axiosBaseQuery.ts
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosError, AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosInstance";
import { BaseQueryArgs } from "../types"; // Importiamo i nostri tipi

// Definiamo il tipo BaseQueryFn con la nostra struttura
export const axiosBaseQuery =
  (): BaseQueryFn<
    BaseQueryArgs, // Tipo degli argomenti (url, method, data, params)
    unknown, // Tipo del risultato atteso (gestito da 'data' nel successo)
    { status: number | string; data: unknown } // Tipo dell'errore
  > =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
      } as AxiosRequestConfig); // Cast per coerenza tipi

      // Successo: RTK Query si aspetta un oggetto { data: ... }
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      // Errore: RTK Query si aspetta un oggetto { error: ... }
      return {
        error: {
          status: err.response?.status ?? "UNKNOWN_ERROR",
          data: err.response?.data || err.message,
        },
      };
    }
  };
```

-----

### Passo 4: Creazione dell'API Slice (`createApi`)

Ora usiamo l'adattatore per definire il nostro *API Slice*. Qui configuriamo `createApi` e definiamo gli *endpoints*.

```typescript
// src/api/apiSlice.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { Todo } from "../types"; // Importiamo il tipo Todo

export const apiSlice = createApi({
  // 1. Definiamo il reducerPath (nome univoco)
  reducerPath: "api",

  // 2. Colleghiamo il nostro adattatore Axios come baseQuery
  baseQuery: axiosBaseQuery(),

  // 3. Definiamo i "tag" per l'invalidazione della cache
  tagTypes: ["Todos"],

  // 4. Definiamo gli endpoints
  endpoints: (builder) => ({
    // Query: Recupera tutti i todos
    // Tipo di Ritorno: Todo[] (array di Todo)
    // Tipo di Argomento: void (nessun argomento)
    getTodos: builder.query<Todo[], void>({
      query: () => ({ url: "todos", method: "GET" }),
      // Specifica quale tag viene "fornito" da questa query
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Todos" as const, id })),
              { type: "Todos", id: "LIST" },
            ]
          : [{ type: "Todos", id: "LIST" }],
    }),

    // Query con argomenti: Recupera i todos di un utente
    // Tipo di Ritorno: Todo[]
    // Tipo di Argomento: number (l'ID dell'utente)
    getUserTodos: builder.query<Todo[], number>({
      query: (userId) => ({
        url: "todos",
        method: "GET",
        // 'params' viene usato da Axios per creare l'URL query string
        params: { userId },
      }),
      providesTags: (result, error, userId) => [
        { type: "Todos", id: `USER-${userId}` },
      ],
    }),

    // Mutation: Aggiunge un nuovo todo
    // Tipo di Ritorno: Todo (il todo creato dall'API)
    // Tipo di Argomento: Partial<Todo> (un oggetto todo parziale)
    addTodo: builder.mutation<Todo, Partial<Todo>>({
      query: (body) => ({
        url: "todos",
        method: "POST",
        data: body, // 'data' viene usato da Axios come body della richiesta
      }),
      // Specifica quale tag viene "invalidato" (causando un refetch)
      invalidatesTags: [{ type: "Todos", id: "LIST" }],
    }),
  }),
});

// 5. Esportiamo gli Hooks auto-generati (tipizzati)
export const { useGetTodosQuery, useGetUserTodosQuery, useAddTodoMutation } =
  apiSlice;
```

-----

### Passo 5: Configurazione dello Store (IL PEZZO MANCANTE)

Questo è il passaggio cruciale che mancava. Dobbiamo dire a Redux Toolkit di *usare* il `reducer` e il `middleware` generati dal nostro `apiSlice`.

```typescript
// src/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./api/apiSlice"; // Importiamo l'apiSlice

export const store = configureStore({
  reducer: {
    // Aggiungiamo il reducer dell'apiSlice allo store
    // Usiamo il 'reducerPath' definito in createApi come chiave
    [apiSlice.reducerPath]: apiSlice.reducer,
    
    // ... altri reducer (es. un 'counterSlice', 'authSlice', ecc.)
  },
  
  // Aggiungiamo il middleware dell'apiSlice
  // Questo middleware gestisce caching, invalidazione, polling, ecc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Opzionale, ma consigliato per funzionalità come 'refetchOnFocus'
setupListeners(store.dispatch);

// Esportiamo i tipi per l'uso con useSelector e useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

-----

### Passo 6: Connessione all'Applicazione React (`Provider`)

Ora forniamo lo store alla nostra applicazione React.

```tsx
// src/main.tsx (o index.tsx)
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store"; // Il nostro store configurato
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Avvolgiamo l'App con il Provider di Redux */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

-----

### Passo 7: Utilizzo degli Hooks nel Componente

Infine, ecco come consumiamo i dati in un componente React utilizzando l'hook `useGetTodosQuery` che abbiamo esportato.

```tsx
// src/App.tsx
import React from "react";
import { 
  useGetTodosQuery, 
  useAddTodoMutation 
} from "./api/apiSlice"; // Importiamo gli hooks

function TodoList() {
  // 1. Chiamiamo l'hook per la query
  const { data: todos, error, isLoading, isFetching } = useGetTodosQuery();

  // 2. Chiamiamo l'hook per la mutation
  const [addTodo, { isLoading: isAddingTodo }] = useAddTodoMutation();

  const handleAddTodo = async () => {
    try {
      const newTodo = { title: "Nuovo Todo", userId: 1, completed: false };
      await addTodo(newTodo).unwrap();
      // .unwrap() gestisce il "disincartamento" della promise 
      // e lancia un errore in caso di fallimento
    } catch (err) {
      console.error("Fallimento aggiunta todo:", err);
    }
  };

  // 3. Gestiamo gli stati di caricamento ed errore
  if (isLoading) {
    return <div>Caricamento iniziale...</div>;
  }

  if (error) {
    // L'oggetto 'error' avrà la struttura { status: ..., data: ... }
    // che abbiamo definito in axiosBaseQuery
    return <div>Errore nel caricamento dei dati.</div>;
  }

  return (
    <div>
      <h1>Lista Todos (RTK Query + Axios)</h1>
      {isFetching && <span>Aggiornamento...</span>}
      
      <button onClick={handleAddTodo} disabled={isAddingTodo}>
        {isAddingTodo ? "Aggiungo..." : "Aggiungi Todo"}
      </button>

      {/* 4. Renderizziamo i dati (TypeScript ci dà l'autocomplete!) */}
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            {todo.title} - {todo.completed ? "Completato" : "Da fare"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
```

### Riepilogo Vantaggi (TypeScript)

Seguendo questo flusso completo:

1.  **Sicurezza negli Hooks:** Quando usi `useGetTodosQuery()`, TypeScript sa che `data` è `Todo[] | undefined`.
2.  **Sicurezza nei Parametri:** `useGetUserTodosQuery(1)` è valido, ma `useGetUserTodosQuery("test")` darebbe un errore TS.
3.  **Sicurezza nelle Mutations:** `addTodo({ title: "Test" })` è valido, ma `addTodo({ nome: "Test" })` darebbe un errore TS.
4.  **Gestione Errori Centralizzata:** Tutta la logica di gestione degli errori `try/catch` di Axios vive in *un solo posto* (`axiosBaseQuery`), mantenendo gli *endpoint* puliti e dichiarativi.





























-----

## 2.3 Utilizzo dei Hooks Generati (con TypeScript) 

La potenza di RTK Query si realizza nei componenti React, dove i **Hooks tipizzati** eliminano il *boilerplate* e garantiscono la sicurezza dei tipi, assicurando che i dati recuperati siano esattamente ciò che ci aspettiamo.

### 2.3.1 Spiegazione di `useQueryNameQuery()` e i Valori di Ritorno Tipizzati

Poiché abbiamo tipizzato i nostri *endpoints* (es. `getUserTodos: builder.query<Todo[], number>`), il *hook* generato (`useGetUserTodosQuery`) eredita automaticamente queste definizioni.

**Assunzioni per la Tipizzazione:**

  * **`Todo`** e **`CustomError`** sono interfacce definite (come visto in 2.1.3).
  * Il hook riceve un `number` (il `userId`) e restituisce un array di `Todo[]`.

| Valore di Ritorno | Tipo (TS) | Descrizione e Vantaggio TS |
| :--- | :--- | :--- |
| **`data`** | `Todo[] \| undefined` | I dati tipizzati. TypeScript applica il tipo **`Todo[]`** e gestisce automaticamente l'unione con `undefined` finché il dato non è disponibile. |
| **`isLoading`** | `boolean` | `true` se la richiesta iniziale è in corso. |
| **`isFetching`** | `boolean` | `true` se qualsiasi richiesta (iniziale o di aggiornamento) è in corso. |
| **`isError`** | `boolean` | `true` se la richiesta ha fallito. |
| **`error`** | `FetchBaseQueryError \| SerializedError \| undefined` | Il tipo di errore è tipizzato dal middleware di RTK Q, spesso includendo `status` e `data` (che può essere tipizzato come `CustomError`). |

-----

### Esempio Pratico nel Componente (JSX + TSX)

Usiamo le *Interfaces* per tipizzare sia le *Props* del componente che i valori ritornati dal hook, garantendo la coerenza end-to-end.

```tsx
// TodosComponent.tsx

import React from 'react';
import { useGetUserTodosQuery } from './api/apiSlice'; 
import { Todo } from './types'; // Interfaccia per i dati Todo

// 1. Tipizzazione delle Props del Componente
interface TodosComponentProps {
    userId: number; // Ci aspettiamo che l'ID sia un numero
}

// 2. Definizione del Componente (utilizzando le Props tipizzate)
const TodosComponent: React.FC<TodosComponentProps> = ({ userId }) => {
    
    // 3. Chiamata all'Hook Tipizzato
    // RTK Query sa che 'todos' sarà Todo[] | undefined
    const { 
        data: todos, 
        isLoading, 
        isError, 
        error,
        isFetching,
    } = useGetUserTodosQuery(userId); 

    // 1. Gestione del Caricamento Iniziale
    if (isLoading) {
        return <div className="loading-state">Caricamento iniziale in corso...</div>;
    }

    // 2. Gestione degli Errori (Sfruttando la tipizzazione di 'error')
    if (isError) {
        // L'errore può avere status e data (il messaggio dal server)
        const errorMessage = 'status' in error ? `Status ${error.status}: ${JSON.stringify(error.data)}` : 'Errore Sconosciuto';
        
        return <div className="error-state">
            Errore durante il recupero dei dati: {errorMessage}
        </div>;
    }
    
    // 3. Render dei Dati e Gestione del Refetch in Background
    return (
        <div className="todos-container">
            <h2>I Todos per l'Utente #{userId} 
                {/* isFetching gestisce l'aggiornamento dopo il primo load */}
                {isFetching && <span className="fetching-indicator"> (Aggiornando...)</span>}
            </h2>
            
            {/* Controllo di sicurezza: se isSuccess è true, 'todos' non sarà undefined */}
            {todos!.map((todo: Todo) => (
                //  Tipizzazione: L'IDE suggerisce title, completed, ecc.
                <p key={todo.id} className={todo.completed ? 'completed' : ''}>
                    {todo.title}
                </p>
            ))}
        </div>
    );
};

export default TodosComponent;
```

#### Vantaggi del TypeScript nell'Esempio:

  * **Sicurezza `userId`**: TypeScript assicura che `userId` sia passato come `number` all'hook.
  * **Accesso a `data`**: Il compilatore sa che `todos` è un array di `Todo`. L'uso di `todos.map(...)` è sicuro e l'accesso a `todo.title` è garantito.
  * **Gestione `error`**: Possiamo fare *narrowing* sul tipo di `error` per accedere ai campi specifici (`status`, `data`) in modo sicuro.


























## 2.3 Utilizzo dei Hooks Generati: Consumare i Dati

Una volta definito un endpoint nel vostro `apiSlice` (come `getTodos` nell'esempio precedente), RTK Query analizza la vostra definizione e **genera automaticamente un React Hook** per quell'endpoint.

Questa è la magia principale di RTK Query: elimina la necessità di scrivere `useEffect`, `useState` per i dati, `useState` per il caricamento, `useState` per l'errore e la logica `try/catch` per ogni singola chiamata API.

### 2.3.1 Nomenclatura degli Hooks

La convenzione di denominazione è standard e prevedibile:

  * Per un `builder.query()`:
      * Endpoint: `getTodos`
      * Hook generato: `useGetTodosQuery()`
  * Per un `builder.mutation()` (che vedremo tra poco):
      * Endpoint: `addTodo`
      * Hook generato: `useAddTodoMutation()`

### 2.3.2 Anatomia di `useQueryNameQuery()`

L'hook `useQuery...` non restituisce semplicemente i dati. Restituisce un **oggetto di stato completo** che descrive l'intero ciclo di vita della richiesta API. Questo vi permette di gestire in modo dichiarativo la vostra UI in base allo stato della richiesta.

Torniamo al nostro `apiSlice.ts` dell'esempio precedente (quello con Axios):

```typescript
// api/apiSlice.ts (snippet dall'esempio precedente)
// ...
export const apiSlice = createApi({
  // ...
  endpoints: (builder) => ({
    getTodos: builder.query<Todo[], void>({ 
      query: () => ({ url: "todos", method: "GET" }),
      providesTags: ["Todos"],
    }),
  }),
});

// Questo hook è ora disponibile per l'importazione
export const { useGetTodosQuery } = apiSlice;
```

Ora, vediamo come utilizzarlo in un componente:

```tsx
// components/TodoList.tsx
import React from "react";
import { useGetTodosQuery } from "../api/apiSlice";

const TodoList = () => {
  // 1. Chiamiamo l'hook
  const { 
    data, 
    isLoading, 
    isSuccess, 
    isError, 
    error 
  } = useGetTodosQuery();

  // 2. Gestiamo gli stati della UI

  // Stato #1: Caricamento iniziale
  if (isLoading) {
    return <div>Caricamento dati in corso...</div>;
  }

  // Stato #2: Errore
  if (isError) {
    console.error("Errore API:", error);
    // 'error' è l'oggetto { status: ..., data: ... } 
    // che abbiamo definito nella nostra axiosBaseQuery
    return <div>Errore nel caricamento.</div>;
  }

  // Stato #3: Successo (implica isLoading = false && isError = false)
  // Possiamo usare 'isSuccess' per esserne certi
  if (isSuccess) {
    return (
      <ul>
        {/* TypeScript sa che 'data' è di tipo Todo[] */}
        {data.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    );
  }

  return null; // O un fallback
};
```

### 2.3.3 Spiegazione Dettagliata dei Valori di Ritorno

Analizziamo i valori di ritorno più comuni che avete appena visto:

  * `data` (es. `Todo[] | undefined`):

      * Il risultato della richiesta, una volta risolta con successo.
      * È `undefined` durante il caricamento iniziale (`isLoading`) o se la richiesta è fallita.
      * Se i dati sono già presenti nella *cache* da una richiesta precedente, `data` sarà immediatamente disponibile *mentre* `isFetching` (vedi sotto) potrebbe essere `true` per un aggiornamento in background.

  * `isLoading` (`boolean`):

      * **CRUCIALE:** È `true` **solo** per la **primissima richiesta** a questo endpoint, quando non ci sono ancora dati in cache.
      * È il flag che dovete usare per mostrare *skeleton loaders* o *spinner* a schermo intero, perché indica che l'utente sta aspettando i dati per la prima volta.

  * `isFetching` (`boolean`) - *Il fratello più impegnato di `isLoading`*:

      * È `true` **ogni volta** che una richiesta a questo endpoint è in corso.
      * Questo include il caricamento iniziale (`isLoading`), ma anche i *refetch* automatici (es. l'utente torna sulla finestra del browser) o i refetch manuali.
      * **Uso pratico:** Usate `isLoading` per lo *spinner* principale e `isFetching` per un piccolo indicatore di "aggiornamento in corso..." non bloccante, quando i dati vecchi (dalla cache) sono già visibili.

  * `isSuccess` (`boolean`):

      * È `true` se la richiesta è stata completata con successo e `data` è (o sta per essere) popolato.

  * `isError` (`boolean`):

      * È `true` se l'ultima richiesta per questo endpoint è fallita.

  * `error` (`unknown` | `SerializedError` | *Il nostro tipo*):

      * L'oggetto errore restituito dalla richiesta.
      * Nel nostro esempio precedente, grazie alla `axiosBaseQuery` personalizzata, questo oggetto avrà la forma `{ status: number | string, data: unknown }` che abbiamo definito noi.

-----

### **Riepilogo della Lezione (2.3)**

Con una singola riga di codice, `const { data, ... } = useGetTodosQuery()`, RTK Query ha gestito per noi:

1.  L'avvio della richiesta API al montaggio del componente.
2.  La gestione di 3+ stati (`useState`) per `data`, `loading` ed `error`.
3.  La logica `try/catch` e l'impostazione degli stati di errore/successo.
4.  (Come vedremo più avanti) Il caching e l'aggiornamento automatico dei dati.




























-----

## Riepilogo Completo: Boilerplate RTK Query + Axios

Questo riepilogo mostra l'architettura completa, file per file, necessaria per far funzionare RTK Query con un adattatore `baseQuery` personalizzato basato su Axios.

### Passo 0: Definizione dei Tipi (Prerequisito)

Iniziamo definendo i tipi condivisi. Questo è fondamentale in TypeScript per garantire la coerenza tra l'API, l'adattatore e i componenti.

```typescript
// src/types.ts

/**
 * L'interfaccia per la risorsa che stiamo recuperando.
 * In questo caso, un singolo oggetto "Todo".
 */
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

/**
 * L'interfaccia "contratto" per la nostra baseQuery.
 * Qualsiasi endpoint che definiamo dovrà restituire un oggetto
 * che rispetta questa forma, affinché la nostra axiosBaseQuery sappia
 * cosa farsene (url, method, data, params).
 */
export interface BaseQueryArgs {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: unknown; // Usato per il body (POST, PUT, PATCH)
  params?: unknown; // Usato per i query params (GET)
}
```

-----

### Passo 1: Istanza Axios e Adattatore `baseQuery`

Creiamo l'istanza Axios e la "funzione traduttrice" (`axiosBaseQuery`) che fa da ponte tra RTK Query e Axios.

#### 1.1: L'Istanza Axios Centralizzata

```typescript
// src/api/axiosInstance.ts

import axios from "axios";

/**
 * Creiamo un'istanza Axios centralizzata.
 * Qui è dove impostiamo la baseURL, gli header di default
 * e, soprattutto, gli INTERCEPTOR (es. per aggiungere
 * token di autenticazione o gestire errori 401 globalmente).
 */
export const axiosInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com/",
  headers: {
    "Content-Type": "application/json",
  },
});
```

#### 1.2: L'Adattatore `axiosBaseQuery`

Questo è il codice più importante per l'integrazione. È il "traduttore".

```typescript
// src/api/axiosBaseQuery.ts

import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosError, AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosInstance";
import { BaseQueryArgs } from "../types"; // Importiamo il nostro "contratto"

/**
 * Definiamo la funzione adattatrice (axiosBaseQuery).
 * È una funzione di ordine superiore (una funzione che restituisce una funzione)
 * per coerenza con fetchBaseQuery e per future configurazioni.
 */
export const axiosBaseQuery =
  (): BaseQueryFn<
    BaseQueryArgs, // Tipo degli argomenti (da endpoint)
    unknown, // Tipo del risultato (data)
    { status: number | string; data: unknown } // Tipo dell'errore
  > =>
  /**
   * La funzione asincrona restituita è la vera baseQuery.
   * Riceve gli argomenti dall'endpoint (url, method, ecc.).
   */
  async ({ url, method, data, params }) => {
    try {
      // Eseguiamo la chiamata usando la nostra istanza Axios
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
      } as AxiosRequestConfig);

      // SUCCESSO: RTK Query richiede che il successo sia
      // restituito in un oggetto { data: ... }
      return { data: result.data };

    } catch (axiosError) {
      const err = axiosError as AxiosError;

      // ERRORE: RTK Query richiede che l'errore sia
      // restituito in un oggetto { error: ... }
      // Standardizziamo il formato dell'errore.
      return {
        error: {
          status: err.response?.status ?? "UNKNOWN_ERROR",
          data: err.response?.data || err.message,
        },
      };
    }
  };
```

-----

### Passo 2: Creazione dell'API Slice (`createApi`)

Qui definiamo il "cervello" di RTK Query, gli colleghiamo l'adattatore Axios e definiamo gli endpoint.

```typescript
// src/api/apiSlice.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery"; // Il nostro adattatore
import { Todo } from "../types"; // Il nostro tipo di dato

/**
 * Creiamo l'API Slice.
 * Questo singolo oggetto gestirà la definizione degli endpoint,
 * la generazione automatica dei reducer, del middleware e degli hooks.
 */
export const apiSlice = createApi({
  /**
   * 1. Il 'reducerPath'. È la chiave (obbligatoria) dove questo
   * slice verrà montato nello store Redux globale.
   */
  reducerPath: "api",

  /**
   * 2. La 'baseQuery'. Qui colleghiamo il nostro adattatore Axios
   * invece del 'fetchBaseQuery' di default.
   */
  baseQuery: axiosBaseQuery(),

  /**
   * 3. I 'tagTypes'. Sono etichette usate per il caching
   * e l'invalidazione automatica. Fondamentali per le Mutations.
   */
  tagTypes: ["Todos"],

  /**
   * 4. Gli 'endpoints'. Qui definiamo le nostre operazioni API.
   */
  endpoints: (builder) => ({
    /**
     * Definizione di una QUERY (GET)
     * builder.query<TipoRisultato, TipoArgomento>
     */
    getTodos: builder.query<Todo[], void>({
      /**
       * La funzione 'query' deve restituire l'oggetto
       * che rispetta l'interfaccia BaseQueryArgs (il nostro "contratto").
       */
      query: () => ({
        url: "todos",
        method: "GET",
      }),
      
      /**
       * 'providesTags' dice a RTK Query: "I dati restituiti
       * da questa query devono essere etichettati come 'Todos'".
       * Se un'altra operazione "invalida" 'Todos', questa query
       * verrà eseguita di nuovo automaticamente.
       */
      providesTags: ["Todos"],
    }),

    // ... qui si potrebbero aggiungere altre query o mutations
    // Esempio:
    // addTodo: builder.mutation<Todo, Partial<Todo>>({
    //   query: (newTodo) => ({
    //     url: "todos",
    //     method: "POST",
    //     data: newTodo,
    //   }),
    //   invalidatesTags: ["Todos"], // Invalida la cache 'Todos'
    // }),

  }),
});

/**
 * 5. Esportazione degli Hooks.
 * RTK Query genera automaticamente gli hooks React
 * basandosi sul nome dell'endpoint (es. getTodos -> useGetTodosQuery).
 */
export const {
  useGetTodosQuery,
  // useAddTodoMutation, // Hook per la mutation
} = apiSlice;
```

-----

### Passo 3: Configurazione dello Store

Ora dobbiamo "collegare" l'`apiSlice` appena creato al nostro store Redux.

```typescript
// src/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./api/apiSlice"; // Importiamo l'apiSlice

export const store = configureStore({
  reducer: {
    // ... qui vanno eventuali altri reducer (es. authSlice, themeSlice)
    
    /**
     * 1. Aggiungiamo il REDUCER generato dall'apiSlice.
     * La chiave [apiSlice.reducerPath] (che è 'api')
     * è obbligatoria e deve corrispondere al reducerPath.
     * Questo reducer gestisce lo stato della cache dei dati.
     */
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  /**
   * 2. Aggiungiamo il MIDDLEWARE generato dall'apiSlice.
   * Questo middleware è FONDAMENTALE. Gestisce il data fetching,
   * il caching, l'invalidazione, il polling e tutto il resto.
   */
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

/**
 * 3. (Opzionale ma consigliato)
 * Avvia i listener per funzionalità avanzate come
 * 'refetchOnFocus' e 'refetchOnReconnect'.
 */
setupListeners(store.dispatch);

// Esportiamo i tipi per l'hooking tipizzato (useSelector, useDispatch)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

-----

### Passo 4: Utilizzo nell'Applicazione (Provider e Componente)

Infine, forniamo lo store all'app e consumiamo i dati nel componente.

#### 4.1: Il `Provider` React

```tsx
// src/main.tsx (o index.tsx)

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store"; // Importiamo il nostro store configurato
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/*
     * Avvolgiamo l'intera applicazione nel Provider di Redux,
     * passandogli la nostra istanza dello store.
     * Questo rende lo store (e quindi la cache di RTK Query)
     * disponibile a qualsiasi componente.
     */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

#### 4.2: Il Componente che usa l'Hook

```tsx
// src/components/TodoList.tsx

import React from "react";
// Importiamo l'hook auto-generato!
import { useGetTodosQuery } from "../api/apiSlice"; 

export const TodoList = () => {
  /**
   * 1. Chiamiamo l'hook.
   * RTK Query si occupa di tutto:
   * - Esegue il fetch al montaggio del componente.
   * - Restituisce i dati dalla cache se disponibili.
   * - Gestisce gli stati di caricamento ed errore.
   */
  const {
    data: todos,     // I dati (tipizzati come Todo[] | undefined)
    isLoading,        // true solo al primo caricamento (no cache)
    isFetching,       // true ogni volta che è in corso un refetch
    isError,          // true se l'ultima richiesta è fallita
    error,            // L'oggetto errore (dal nostro axiosBaseQuery)
  } = useGetTodosQuery(); // Non servono argomenti (definito come 'void' nello slice)

  /**
   * 2. Gestiamo gli stati della UI in modo dichiarativo.
   */

  // Stato di caricamento iniziale
  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  // Stato di errore
  if (isError) {
    console.error("Errore nel componente:", error);
    return <div>Errore nel caricamento dei dati.</div>;
  }

  // Stato di successo (implica che 'todos' è disponibile)
  return (
    <div>
      <h1>Lista Todos</h1>
      {/* isFetching è utile per mostrare un feedback 
          durante un refetch in background */}
      {isFetching && <span>(Aggiornamento...)</span>}
      
      <ul>
        {/* TypeScript sa che 'todos' è un array di 'Todo' */}
        {todos?.map((todo) => (
          <li key={todo.id}>
            {todo.title} - {todo.completed ? "Fatto" : "Da fare"}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

























Certamente. Proseguiamo con le operazioni di modifica dei dati, note come *Mutazioni*.

-----

### **Sezione 3: Mutazioni (POST/PUT/DELETE) e Ottimizzazione della UI**

## 3.1 Definizione degli Endpoint: Mutazioni

Mentre le *Query* sono progettate per **leggere** i dati (operazioni `GET`), le *Mutazioni* sono usate per **scrivere** o **modificare** i dati sul server. Queste corrispondono tipicamente ai metodi HTTP `POST`, `PUT`, `PATCH` e `DELETE`.

### 3.1.1 `builder.mutation()`: Definizione delle Operazioni di Scrittura

Per definire un'operazione di scrittura, usiamo la funzione `builder.mutation()` all'interno dei nostri `endpoints`.

La struttura è molto simile a `builder.query()`, ma con una differenza fondamentale: una mutazione viene **attivata manualmente** (es. al click di un bottone), non automaticamente al montaggio del componente.

#### Anatomia di `builder.mutation()`

Come per le query, specifichiamo i tipi generici:

`builder.mutation<TipoRisultato, TipoArgomento>`

  * **`TipoRisultato`**: Il tipo di dato che l'API restituisce *dopo* che l'operazione è stata completata (es. l'oggetto appena creato, un messaggio di successo).
  * **`TipoArgomento`**: Il tipo di dato che *passiamo* alla mutazione quando la attiviamo (es. i dati per un nuovo post, l'ID dell'elemento da cancellare).

#### Esempio: Aggiungere (`POST`) e Aggiornare (`PUT`) un Todo

Ampliamo il nostro `apiSlice.ts` precedente (quello basato su Axios) per includere le mutazioni.

```typescript
// src/api/apiSlice.ts (continuazione)

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery'; 
import { Todo, BaseQueryArgs } from '../types'; // Importiamo i nostri tipi

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(), 
  
  // 1. I tagTypes sono FONDAMENTALI per le mutazioni
  // Ci permettono di dire a RTK Query "quali query devono essere rieseguite"
  // dopo che questa mutazione ha avuto successo.
  tagTypes: ['Todos'], // Definiamo un "Tag" per la risorsa Todo
  
  endpoints: (builder) => ({
    
    // --- QUERY (già definita) ---
    getTodos: builder.query<Todo[], void>({ 
      query: () => ({ url: 'todos', method: 'GET' }), 
      
      // 2. "Forniamo" il tag 'Todos'
      // RTK Query ora sa che questa query dipende dalla lista 'Todos'
      providesTags: ['Todos'], 
    }),
    
    // --- MUTAZIONE #1: Aggiungere un Todo (POST) ---
    // Risultato: Todo (l'oggetto creato dall'API)
    // Argomento: Partial<Todo> (un oggetto parziale, es. { title, userId })
    addTodo: builder.mutation<Todo, Partial<Todo>>({
      query: (newTodoData) => ({ 
        url: 'todos', 
        method: 'POST',
        // 'data' (nel nostro axiosBaseQuery) corrisponde al 'body'
        data: newTodoData, 
      }),
      
      // 3. "Invalidiamo" il tag 'Todos'
      // Appena questa mutazione ha successo, RTK Query sa che 
      // la cache 'Todos' non è più valida e rieseguirà 
      // automaticamente tutte le query che "forniscono" quel tag (es. getTodos).
      invalidatesTags: ['Todos'],
    }),

    // --- MUTAZIONE #2: Aggiornare un Todo (PUT) ---
    // Risultato: Todo (l'oggetto aggiornato)
    // Argomento: Todo (l'oggetto completo, incluso l'ID)
    updateTodo: builder.mutation<Todo, Todo>({
      query: (todo) => ({
        url: `todos/${todo.id}`, // URL dinamico
        method: 'PUT',
        data: todo,
      }),
      // Invalidiamo anche qui per aggiornare la lista
      invalidatesTags: ['Todos'], 
    }),

    // --- MUTAZIONE #3: Cancellare un Todo (DELETE) ---
    // Risultato: unknown (spesso le API DELETE non restituiscono nulla)
    // Argomento: number (l'ID del todo da cancellare)
    deleteTodo: builder.mutation<unknown, number>({
        query: (id) => ({
            url: `todos/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['Todos'],
    }),
    
  }),
});

// Esportiamo i nuovi hooks per le mutazioni
export const { 
  useGetTodosQuery, 
  useAddTodoMutation, // Hook per la mutazione POST
  useUpdateTodoMutation, // Hook per la mutazione PUT
  useDeleteTodoMutation, // Hook per la mutazione DELETE
} = apiSlice;
```

### Spiegazione Chiave: `providesTags` e `invalidatesTags`

Questo è il cuore della gestione automatica della cache in RTK Query:

1.  **`providesTags: ['Todos']`** (nella query `getTodos`):

      * Dice a RTK Query: "I dati che ho appena recuperato sono etichettati come 'Todos'".

2.  **`invalidatesTags: ['Todos']`** (nella mutazione `addTodo`):

      * Dice a RTK Query: "Questa operazione ha reso obsoleti (invalidato) i dati etichettati 'Todos'".

**Il Risultato:** Non appena `addTodo` ha successo, RTK Query cerca automaticamente tutte le query attive che "forniscono" il tag `['Todos']` (in questo caso, `getTodos`) e le **riesegue immediatamente in background**.

Questo aggiorna la UI (la lista dei todo) senza che noi dobbiamo scrivere una singola riga di codice per il *refetching* manuale.






























-----

## 3.2 Utilizzo dei Hooks di Mutazione

A differenza degli hook di *query* che eseguono la richiesta al montaggio del componente, gli hook di *mutazione* ci forniscono gli strumenti per eseguire la richiesta **quando vogliamo noi** (es. al click di un bottone, all'invio di un form).

### 3.2.1 Spiegazione di `useMutationNameMutation()`

RTK Query genera un hook per ogni mutazione definita (es. `addTodo` -\> `useAddTodoMutation`).

Quando chiami questo hook nel tuo componente, non restituisce un oggetto di stato come `useQuery`. Restituisce invece una **tupla** (un array con due elementi):

1.  La **Trigger Function**: Una funzione che, quando chiamata, avvierà la richiesta di mutazione.
2.  L'**Oggetto Risultato**: Un oggetto (simile a quello delle query) che descrive lo stato *attuale* dell'ultima mutazione eseguita (contiene `isLoading`, `isSuccess`, `error`, ecc.).

<!-- end list -->

```tsx
// Esempio di utilizzo base
import { useAddTodoMutation } from "../api/apiSlice";

const AddTodoComponent = () => {
    // 1. Chiamiamo l'hook nel componente
    const [
        triggerAddTodo, // <-- Elemento [0]: La Funzione Trigger
        resultObject    // <-- Elemento [1]: L'Oggetto Risultato
    ] = useAddTodoMutation();

    // Analizziamo l'oggetto risultato
    const { 
        isLoading,  // true se la mutazione è attualmente in corso
        isSuccess,  // true se l'ultima mutazione è terminata con successo
        isError,    // true se è fallita
        error,      // l'oggetto errore
        data        // i dati restituiti dalla mutazione (es. il todo creato)
    } = resultObject;

    // ...
};
```

#### 1\. La Funzione Trigger (es. `triggerAddTodo`)

Questa è la funzione che usi per *eseguire* la mutazione.

  * **Argomento**: Accetta un singolo argomento: il `TipoArgomento` che hai definito nel `builder.mutation`. Per il nostro `addTodo`, si aspetta `Partial<Todo>`.
  * **Valore di Ritorno**: Restituisce una `Promise` speciale di RTK Query che si risolve con un oggetto contenente `{ data }` o `{ error }`.

#### 2\. L'Oggetto Risultato (es. `resultObject`)

Questo oggetto descrive lo stato *dell'ultima esecuzione*. È fondamentale per aggiornare la UI *durante* e *dopo* l'operazione.

  * `isLoading: boolean`: Utile per disabilitare un bottone o mostrare uno spinner *mentre* la richiesta `POST` è in corso.
  * `isSuccess: boolean`: Utile per mostrare un messaggio di successo o resettare un form dopo che i dati sono stati inviati correttamente.
  * `isError: boolean` / `error: unknown`: Per mostrare un messaggio di errore all'utente.
  * `data`: Contiene i dati restituiti dal server dopo il successo (es. `data` conterrà l'oggetto `Todo` completo di `id` restituito dall'API).

-----

### 3.2.2 Esecuzione della Mutazione e Gestione Asincrona

Ora mettiamo tutto insieme in un componente pratico.

Vogliamo creare un semplice form che aggiunge un nuovo "Todo". Vogliamo che il bottone mostri "Aggiungo..." mentre la richiesta è in corso e che gestisca eventuali errori.

Il modo migliore per gestire la funzione trigger è usare `async/await` e il metodo `.unwrap()`.

**Cosa fa `.unwrap()`?**
La promise restituita dal *trigger* si risolve sempre, anche in caso di errore (restituendo l'oggetto `{ error }`). Questo è scomodo per la gestione `try/catch`.
Chiamando `.unwrap()` sulla promise, la si "scompatta":

  * In caso di **successo**, restituisce direttamente i `data`.
  * In caso di **errore**, **lancia un'eccezione** (throws), permettendoci di catturarla con un blocco `catch`.

#### Esempio Pratico in un Componente

```tsx
// src/components/AddTodoForm.tsx
import React, { useState } from 'react';
import { useAddTodoMutation } from '../api/apiSlice';

export const AddTodoForm = () => {
  const [title, setTitle] = useState('');

  // 1. Inizializziamo l'hook della mutazione
  const [addTodo, { isLoading, isSuccess, error }] = useAddTodoMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return; // Non inviare se vuoto

    const newTodo = {
      title,
      userId: 1, // Dati fittizi per l'esempio
      completed: false,
    };

    try {
      // 2. Eseguiamo la mutazione (trigger)
      // Usiamo await e .unwrap() per la gestione asincrona
      
      // La mutazione viene avviata...
      // 'isLoading' diventa true
      const createdTodo = await addTodo(newTodo).unwrap(); 
      // ...La mutazione è completata
      // 'isLoading' diventa false, 'isSuccess' diventa true
      
      console.log('Todo creato con successo:', createdTodo);
      setTitle(''); // Resetta il form solo in caso di successo

    } catch (err) {
      // 'isError' è true
      // 'error' contiene l'errore
      console.error('Fallimento aggiunta todo:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Aggiungi un nuovo Todo</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading} // Disabilita l'input durante il caricamento
      />
      <button type="submit" disabled={isLoading}>
        {/* 3. Usiamo lo stato 'isLoading' per il feedback UI */}
        {isLoading ? 'Aggiungo...' : 'Aggiungi'}
      </button>

      {/* 4. Feedback post-operazione */}
      {isSuccess && <div>Todo aggiunto! (La lista si aggiornerà...)</div>}
      {error && <div>Errore: Impossibile aggiungere il todo.</div>}
    </form>
  );
};
```

**Riepilogo del Flusso:**

1.  L'utente scrive "Comprare il latte" e clicca "Aggiungi".
2.  `handleSubmit` viene chiamato.
3.  `addTodo(newTodo).unwrap()` viene eseguito.
4.  L'hook `useAddTodoMutation` imposta `isLoading` a `true`.
5.  Il bottone cambia testo in "Aggiungo..." e viene disabilitato.
6.  La richiesta `POST` a `/todos` parte.
7.  L'API risponde con successo (es. `201 Created` e il nuovo oggetto todo).
8.  La promise di `unwrap()` si risolve e `createdTodo` viene popolato.
9.  Il blocco `try` prosegue, `isSuccess` diventa `true` e il form viene resettato.
10. **Contemporaneamente (la magia\!):** La mutazione `invalidatesTags: ['Todos']`. RTK Query riesegue `useGetTodosQuery` in background. Il componente `TodoList` (in un'altra parte dell'app) riceve i nuovi dati e si ri-renderizza, mostrando "Comprare il latte" nella lista.


























## 3.3 Invalidazione della Cache per l'Aggiornamento Automatico della UI

Abbiamo visto che le mutazioni aggiornano la UI "magicamente". Questa magia si basa su un sistema di etichettatura (tagging) semplice ma incredibilmente efficace.

Quando esegui una mutazione (come `addTodo`), come fa RTK Query a sapere che deve rieseguire proprio la query `getTodos` e non, per esempio, una `getUserProfile`? La risposta è: **i tag**.

### 3.3.1 I Tag: `providesTags` e `invalidatesTags`

RTK Query gestisce la cache tramite "tag" (etichette) che noi definiamo.

1.  **`providesTags` (Usato nelle Query)**

      * Questa proprietà *etichetta* i dati recuperati da una query.
      * Si usa in `builder.query()`.
      * È come mettere un'etichetta su una scatola: "Questa scatola contiene 'Todos'".
      * Può essere un semplice array di stringhe (es. `['Todos']`) o una funzione per tag più granulari (es. `[{ type: 'Todos', id: 1 }]`).

2.  **`invalidatesTags` (Usato nelle Mutazioni)**

      * Questa proprietà *dichiara* quali etichette sono diventate *obsolete* (invalide) dopo il successo della mutazione.
      * Si usa in `builder.mutation()`.
      * È come dire: "Ho appena modificato qualcosa, quindi qualsiasi scatola etichettata come 'Todos' ora è vecchia e deve essere ricontrollata".

-----

### 3.3.2 Concetto Chiave: Il Flusso di Invalidazione

Ecco come RTK Query collega i punti per automatizzare il refetching.

**Flusso:**

1.  **Montaggio Componente:** Un componente A monta e chiama `useGetTodosQuery()`.
2.  **Fetch e Tagging:** RTK Query esegue la richiesta `GET /todos`. Al successo, vede `providesTags: ['Todos']`. Quindi "ricorda" che i dati di *questa specifica query* sono associati al tag `'Todos'`.
3.  **Azione Utente:** L'utente, in un componente B, compila un form e chiama la funzione trigger `addTodo(newTodo)`.
4.  **Mutazione e Invalidazione:** RTK Query esegue la richiesta `POST /todos`. Al successo, vede `invalidatesTags: ['Todos']`.
5.  **Refetch Automatico:** RTK Query dice: "Ok, il tag `'Todos'` è stato invalidato. Devo trovare tutte le query *attualmente montate* che `provides` quel tag". Trova la query di `useGetTodosQuery()` nel componente A e la **riesegue immediatamente in background**.
6.  **Aggiornamento UI:** Il componente A riceve i nuovi dati (la lista aggiornata) e si ri-renderizza automaticamente, mostrando il nuovo todo.

Questo sistema disaccoppia completamente i componenti. Il `AddTodoForm` non ha bisogno di sapere nulla del `TodoList`. Deve solo invalidare il tag corretto; RTK Query si occupa del resto.

-----

### 3.3.3 Esempio Pratico: Lista 'Posts'

Rendiamo l'esempio ancora più chiaro usando `Posts` invece di `Todos`.

Immaginiamo di avere un blog.

```typescript
// src/api/blogApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Definiamo i tipi
interface Post {
  id: number;
  title: string;
  body: string;
}
type NewPost = Omit<Post, 'id'>; // Un post senza 'id' per la creazione

export const blogApiSlice = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.example.com/' }),
  
  // 1. Definiamo un tag per la risorsa 'Posts'
  tagTypes: ['Posts'], 
  
  endpoints: (builder) => ({
    
    // LA QUERY (Legge i dati)
    getPosts: builder.query<Post[], void>({
      query: () => 'posts',
      
      // 2. ETICHETTIAMO i dati
      // "I dati restituiti da questa query sono etichettati come 'Posts'"
      providesTags: ['Posts'], 
    }),
    
    // LA MUTAZIONE (Scrive i dati)
    addPost: builder.mutation<Post, NewPost>({
      query: (newPost) => ({
        url: 'posts',
        method: 'POST',
        body: newPost,
      }),
      
      // 3. INVALIDIAMO l'etichetta
      // "Dopo che questa operazione ha successo,
      // qualsiasi dato etichettato 'Posts' è obsoleto."
      invalidatesTags: ['Posts'],
    }),
    
    // Un'altra mutazione che fa la stessa cosa
    deletePost: builder.mutation<void, number>({
        query: (id) => ({
            url: `posts/${id}`,
            method: 'DELETE',
        }),
        // Anche cancellare un post invalida la lista
        invalidatesTags: ['Posts'], 
    }),

  }),
});

export const { useGetPostsQuery, useAddPostMutation, useDeletePostMutation } = blogApiSlice;
```

**Scenario d'uso:**

  * Un componente `AllPosts` usa `useGetPostsQuery()` (e quindi `providesTags: ['Posts']`).
  * Un componente `DeleteButton` usa `useDeletePostMutation(postId)`.
  * Quando l'utente clicca il bottone e `deletePost` ha successo, `invalidatesTags: ['Posts']` viene attivato.
  * RTK Query forza `useGetPostsQuery()` a rieseguire il fetch.
  * Il componente `AllPosts` si aggiorna e il post cancellato scompare dalla UI.





























-----

### **Sezione 4: Dietro le Quinte e Concetti Avanzati di RTK Query**

## 4.1 La Magia del Caching (e Cosa C'è Nello Slice)

Mentre usiamo gli hooks, RTK Query gestisce uno stato Redux complesso per nostro conto. Capire i principi di questa gestione ci permette di sfruttarlo al meglio.

### 4.1.1 Il meccanismo di **deduplicazione** (Request Deduplication)

Questo è uno dei vantaggi più immediati di RTK Query.

**Il Problema:** Immagina di avere un componente `Header` che mostra il nome dell'utente (`useGetUserQuery('me')`) e un componente `UserProfile` nella pagina che mostra i dettagli dello stesso utente (anch'esso usa `useGetUserQuery('me')`). In un'implementazione "naive" con `useEffect` e `fetch`, entrambi i componenti attiverebbero una richiesta `GET /user/me` al montaggio, risultando in due chiamate di rete identiche e superflue.

**La Soluzione RTK Query:**
RTK Query non identifica una richiesta solo dal nome dell'endpoint (es. `getUser`), ma da una chiave univoca composta da `endpointName + argomentiSerializzati`.

  * `useGetUserQuery('me')` -\> Chiave cache: `getUser("me")`
  * `useGetTodosQuery(1)` -\> Chiave cache: `getTodos(1)`
  * `useGetTodosQuery(2)` -\> Chiave cache: `getTodos(2)`

**Il Flusso di Deduplicazione:**

1.  Il componente `Header` si monta e chiama `useGetUserQuery('me')`.
2.  RTK Query controlla la sua cache per la chiave `getUser("me")`. Non la trova.
3.  Avvia una nuova richiesta di rete e imposta lo stato della chiave `getUser("me")` su `pending`.
4.  *Contemporaneamente*, il componente `UserProfile` si monta e chiama `useGetUserQuery('me')`.
5.  RTK Query controlla la cache per la chiave `getUser("me")`. La trova e vede che il suo stato è `pending`.
6.  **Non avvia una nuova richiesta.** Si "abbona" (sottoscrive) semplicemente alla richiesta già in corso.
7.  Quando la richiesta di rete originale (dal passo 3) ritorna con successo, RTK Query aggiorna i dati per la chiave `getUser("me")` e notifica *entrambi* i componenti (`Header` e `UserProfile`), che si ri-renderizzano con i nuovi dati.

Questo garantisce che, per una data combinazione di endpoint e parametri, **solo una richiesta di rete sia attiva in un dato momento**.

-----

### 4.1.2 La durata della cache: `keepUnusedDataFor`

Questa impostazione risponde alla domanda: "Cosa succede ai dati quando nessun componente li sta più usando?"

**Il Meccanismo (Reference Counting):**
RTK Query tiene traccia di quanti componenti sono "sottoscritti" a una specifica chiave di cache (es. `getTodos(1)`).

1.  Componente A monta e usa `useGetTodosQuery(1)`. Il contatore di sottoscrizioni per `getTodos(1)` diventa **1**.
2.  Componente B monta e usa `useGetTodosQuery(1)`. Il contatore diventa **2**.
3.  Componente A smonta (l'utente naviga via). Il contatore diventa **1**.
4.  Componente B smonta. Il contatore diventa **0**.

**Il Timer `keepUnusedDataFor`:**
Appena il contatore di sottoscrizioni per una chiave di cache raggiunge **0**, RTK Query avvia un timer.

  * **Default: 60 secondi.**
  * **Scopo:** Questo timer è un "periodo di grazia". Se l'utente naviga via e poi torna *immediatamente* (entro 60 secondi), il componente si rimonta, il contatore torna a 1 e i dati vengono serviti *istantaneamente* dalla cache, offrendo un'esperienza utente velocissima.
  * **Scadenza:** Se i 60 secondi scadono e nessun componente si è "riscritto" a quella chiave, i dati vengono rimossi dalla cache (garbage collection) per liberare memoria.

Questa impostazione può essere configurata globalmente in `createApi` o per singolo endpoint:

```typescript
// Configurazione globale
const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  keepUnusedDataFor: 120, // Tieni i dati in cache per 2 minuti (default 60)
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: (id) => `profile/${id}`,
      // Override per questo specifico endpoint
      keepUnusedDataFor: 30, // Tieni il profilo solo per 30 secondi
    }),
  }),
});
```

-----

### 4.1.3 **Anatomia dello Slice di RTK Query**

Se ispezioni il tuo stato Redux con i DevTools, vedrai che lo slice `api` (o qualunque sia il tuo `reducerPath`) non contiene semplicemente i tuoi dati. Contiene una struttura interna complessa che gestisce l'intero meccanismo di caching.

Ecco i suoi componenti principali (che **non dovresti mai modificare manualmente**):

  * `queries`:
    Un oggetto che mappa le *chiavi di cache* (es. `getTodos(undefined)`) al loro stato attuale. Per ogni query, troverai:

      * `status`: ('pending', 'fulfilled', 'rejected')
      * `data`: I dati della risposta (se `fulfilled`).
      * `error`: L'errore (se `rejected`).
      * `requestId`: L'ID dell'ultima richiesta per questa chiave.
      * `startedTimeStamp`: Quando è partita la richiesta.

  * `mutations`:
    Un oggetto che mappa `requestId` *univoci* allo stato delle mutazioni. Poiché le mutazioni non sono "condivise" come le query (puoi avviare più volte la stessa mutazione), vengono tracciate per ID univoco e non per argomento. Questo stato è generalmente effimero (dura poco).

  * `subscriptions`:
    L'oggetto che implementa il *reference counting*. Mappa le chiavi di cache (es. `getTodos(undefined)`) a un elenco di sottoscrittori (i componenti) e ai loro timer `keepUnusedDataFor`. È il cervello che decide quando rimuovere i dati.

  * `provided`:
    Questo è il cervello dietro l'**invalidazione dei tag**. È una "mappa invertita". Invece di mappare una query ai suoi tag, mappa i *tag* alle *query* che li forniscono.

      * **Esempio:** Se `useGetTodosQuery()` `providesTags: ['Todos']`, lo stato `provided` conterrà qualcosa come:
        ```json
        "provided": {
          "Todos": ["getTodos(undefined)"] 
        }
        ```
      * **Perché?** Quando una mutazione `invalidatesTags: ['Todos']`, RTK Query non deve controllare *ogni singola query* per vedere se fornisce quel tag. Guarda semplicemente in `provided['Todos']` e trova istantaneamente l'elenco di tutte le chiavi di cache (`getTodos(undefined)`) che devono essere invalidate e rieseguite. È un'ottimizzazione cruciale per le prestazioni.



































## 4.2 Ottimizzazione delle Prestazioni e Query Dettagliate

Gestire query complesse e scenari UI ad alte prestazioni (come liste virtualizzate) richiede una comprensione più approfondita di come RTK Query gestisce gli argomenti e la cache.

### 4.2.1 Query con parametri: Gestione dell'argomento (`arg`)

Finora, abbiamo visto query con argomenti semplici (un `number` per un ID) o `void` (nessun argomento). L'argomento (`arg`) che passi all'hook (o al selettore) è la chiave per la **deduplicazione** e il **caching**.

  * **Primitivi:** Se l'argomento è un primitivo (stringa, numero), RTK Query lo usa direttamente per la chiave della cache.

      * `useGetTodoQuery(1)` -\> Chiave cache: `getTodo(1)`
      * `useGetTodoQuery(2)` -\> Chiave cache: `getTodo(2)`

  * **Oggetti (Argomenti Complessi):** Se l'argomento è un oggetto (es. per paginazione, filtri, ricerca), RTK Query esegue una **serializzazione stabile** dell'oggetto per creare la chiave.

**Perché è importante?**
RTK Query riesegue la query solo se il valore serializzato dell'argomento cambia.

**Esempio (Paginazione e Filtri):**
Definiamo un endpoint che accetta un oggetto per filtrare i "todos".

```typescript
// apiSlice.ts

// 1. Definiamo il tipo per l'argomento
interface GetTodosParams {
  page: number;
  limit: number;
  completed?: boolean;
}

export const apiSlice = createApi({
  // ...
  endpoints: (builder) => ({
    
    // 2. Usiamo il tipo <Todo[], GetTodosParams>
    getTodos: builder.query<Todo[], GetTodosParams>({
      // 3. L'argomento (params) è ora un oggetto
      query: (params) => ({
        url: 'todos',
        method: 'GET',
        // Il nostro axiosBaseQuery (o fetchBaseQuery)
        // sa come trasformare 'params' in query string
        // (es. ?_page=1&_limit=10&completed=true)
        params: {
          _page: params.page,
          _limit: params.limit,
          completed: params.completed,
        },
      }),
      // ...
    }),
  }),
});

export const { useGetTodosQuery } = apiSlice;
```

**Utilizzo nel Componente:**

```tsx
// TodoListComponent.tsx
import { useState } from 'react';
import { useGetTodosQuery } from '../api/apiSlice';

const TodoList = () => {
  const [page, setPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState<boolean | undefined>(undefined);

  // 4. L'hook viene chiamato con l'oggetto dei parametri
  const { data, isLoading } = useGetTodosQuery({ 
    page, 
    limit: 10,
    completed: showCompleted,
  });

  // 5. Cosa succede:
  // - Al primo render:
  //   arg = { page: 1, limit: 10, completed: undefined }
  //   Chiave cache: 'getTodos({"page":1,"limit":10})' -> Esegue il fetch
  //
  // - L'utente clicca "Avanti":
  //   setPage(2) -> Il componente si ri-renderizza
  //   arg = { page: 2, limit: 10, completed: undefined }
  //   Chiave cache: 'getTodos({"page":2,"limit":10})' -> NUOVA CHIAVE -> Esegue il fetch
  //
  // - L'utente clicca "Indietro":
  //   setPage(1) -> Il componente si ri-renderizza
  //   arg = { page: 1, limit: 10, completed: undefined }
  //   Chiave cache: 'getTodos({"page":1,"limit":10})' -> CHIAVE ESISTENTE -> Dati istantanei dalla cache
};
```

-----

### 4.2.2 **Selettori** (Selectors): Accedere ai dati della cache al di fuori dei React Hooks

Cosa succede se hai bisogno di accedere ai dati della cache in un punto in cui non puoi usare un hook? (Ad esempio, all'interno di un altro *slice* Redux, in un *thunk*, o in una utility non-React).

Per questo, `apiSlice` esporta anche dei **selettori**.

Ogni `endpoint` (es. `apiSlice.endpoints.getTodos`) ha una funzione `.select()` che agisce come una *factory* di selettori.

1.  **Chiami `.select(arg)`** passando lo *stesso argomento* che daresti all'hook.
2.  Questo **restituisce un selettore** (simile a `createSelector` di Reselect).
3.  Puoi usare questo selettore con `store.getState()` per estrarre i dati.

**Esempio: Leggere la cache da un Thunk**

```typescript
// store.ts
import { store } from './store';
import { apiSlice } from './api/apiSlice';

// Supponiamo di voler controllare se il "Todo" con ID 1 è già in cache
// prima di eseguire un'altra logica.

export const checkTodoCacheThunk = () => (dispatch, getState) => {
  const todoId = 1;

  // 1. Creiamo il selettore specifico per l'argomento '1'
  const selectTodoById = apiSlice.endpoints.getTodoById.select(todoId);
  
  // 2. Otteniamo lo stato globale
  const globalState = getState(); 

  // 3. Eseguiamo il selettore sullo stato
  // Questo NON esegue un fetch, legge solo la cache
  const queryResult = selectTodoById(globalState);

  // 4. Analizziamo il risultato
  // queryResult è un oggetto { status, data, isSuccess, ... }
  
  if (queryResult.isSuccess) {
    // Trovato! I dati sono in cache.
    console.log('Dati trovati in cache:', queryResult.data);
    // queryResult.data è l'oggetto Todo
  } else {
    // Non in cache, o in errore, o mai richiesto
    console.log('Dati non presenti in cache.');
  }
};

// Per *avviare* un fetch al di fuori di React, si usa .initiate():
// store.dispatch(apiSlice.endpoints.getTodoById.initiate(1));
```

-----

### 4.2.3 L'interazione con l'**interfaccia utente virtualizzata** (e grandi liste)

Questo è uno scenario di ottimizzazione critico.

**Il Problema:** Le liste virtualizzate (es. `react-window` o `tanstack-virtual`) funzionano montando e smontando i componenti della lista (es. `<TodoListItem>`) man mano che l'utente scorre.

  * Utente scorre verso il basso: `<TodoListItem id={1} />` **smonta**.
  * Il contatore di sottoscrizioni per `getTodoById(1)` va a 0.
  * Il timer `keepUnusedDataFor` (default: 60s) **parte**.
  * Utente scorre molto in basso, poi (dopo 61 secondi) torna in cima: `<TodoListItem id={1} />` **rimonta**.
  * La cache per `getTodoById(1)` è stata eliminata.
  * RTK Query **esegue un nuovo fetch di rete** per `GET /todos/1`.

Questo crea un "request waterfall" (cascata di richieste) disastroso mentre l'utente scorre.

**La Soluzione (Normalizzazione dei Tag):**
Dobbiamo fare in modo che i dati degli item *non* vengano eliminati dalla cache finché la "lista" principale è attiva. Lo facciamo "normalizzando" i dati della query della lista.

Diciamo alla query `getTodos` (la lista) che essa "fornisce" non solo un tag generico `['Todos']` (o `['Todos', 'LIST']`), ma anche **i tag individuali per ogni item**.

```typescript
// apiSlice.ts

export const apiSlice = createApi({
  // ...
  tagTypes: ['Todos'], // Assicuriamoci che il tipo sia definito
  
  endpoints: (builder) => ({
    
    // 1. La query della LISTA (es. paginata)
    getTodos: builder.query<Todo[], GetTodosParams>({
      query: (params) => ({
        url: 'todos',
        params: { _page: params.page, _limit: params.limit },
      }),
      
      /**
       * 2. LA MAGIA (NORMALIZZAZIONE):
       * Diciamo a RTK Query che questa query non solo fornisce
       * il tag generale della lista, ma anche un tag specifico
       * per OGNI item della lista, usando il suo ID.
       */
      providesTags: (result, error, params) =>
        result
          ? [
              // Tag per ogni item: { type: 'Todos', id: 1 }, { type: 'Todos', id: 2 }, ...
              ...result.map(({ id }) => ({ type: 'Todos' as const, id })),
              // Tag per la lista/pagina specifica
              { type: 'Todos', id: `LIST-PAGE-${params.page}` },
            ]
          : [], // In caso di errore
    }),

    // 3. La query per l'ITEM SINGOLO
    getTodoById: builder.query<Todo, number>({
      query: (id) => `todos/${id}`,
      /**
       * 4. Anche questa query fornisce il suo tag ID specifico
       */
      providesTags: (result, error, id) => [{ type: 'Todos', id }],
    }),
  }),
});
```

**Come funziona ora (lo scenario corretto):**

1.  Il componente `<VirtualizedList>` monta e chiama `useGetTodosQuery({ page: 1, limit: 100 })`.
2.  RTK Query esegue il fetch e riceve 100 "todos".
3.  Grazie a `providesTags` (nella query `getTodos`), la cache ora contiene 101 sottoscrizioni attive: una per `LIST-PAGE-1` e 100 per i singoli item (es. `{ type: 'Todos', id: 1 }`, `{ type: 'Todos', id: 2 }`, ecc.).
4.  Il componente `<TodoListItem id={1} />` monta. Chiama `useGetTodoById(1)`.
5.  RTK Query vede che `getTodoById(1)` `providesTags: [{ type: 'Todos', id: 1 }]`.
6.  RTK Query controlla la sua cache e vede che i dati per `{ type: 'Todos', id: 1 }` sono *già* stati forniti (e sono mantenuti attivi) dalla query `getTodos`.
7.  **Risultato: Dati serviti istantaneamente dalla cache. Nessuna richiesta di rete.**
8.  L'utente scorre, `<TodoListItem id={1} />` smonta.
9.  La sottoscrizione di `useGetTodoById(1)` scompare (contatore a 0), ma...
10. ...la sottoscrizione *principale* di `useGetTodosQuery` è ancora attiva, e *continua a fornire* il tag `{ type: 'Todos', id: 1 }`.
11. **Risultato Finale:** I dati dell'item 1 **rimangono nella cache** (il timer da 60s non parte) finché la query della *lista* (`useGetTodosQuery`) rimane montata. Questo risolve completamente il problema della virtualizzazione.


































## 4.3 Interazione Avanzata con lo Slice (Stato Locale e Server)

Finora abbiamo usato `invalidatesTags` per dire a RTK Query: "Questa cache è vecchia, ricaricala". Ora vedremo come intervenire *direttamente* su quella cache per gestire side-effect (effetti collaterali), aggiornare la UI istantaneamente e manipolare i dati senza richieste di rete superflue.

-----

### 4.3.1 `onQueryStarted` / `onCacheEntryAdded`: Side Effects

Questi *lifecycle hooks* vengono definiti all'interno di un `builder.query()` e ci permettono di eseguire codice nel momento esatto in cui una voce della cache viene creata (cioè quando il *primo* componente si sottoscrive a una data query).

**Nota:** `onCacheEntryAdded` è il nome più recente e raccomandato, in sostituzione di `onQueryStarted` (che ora è preferito per le mutazioni).

Questo è lo strumento ideale per gestire connessioni persistenti, come i **WebSockets**.

**Concetto:**

1.  Un componente chiama `useGetChatMessagesQuery('channel-1')`.
2.  `onCacheEntryAdded` scatta per la chiave `'getChatMessages("channel-1")'`.
3.  Attendiamo che il fetch HTTP iniziale (`queryFulfilled`) sia completato per caricare la cronologia.
4.  Apriamo una connessione WebSocket a `'channel-1'`.
5.  Quando riceviamo un nuovo messaggio dal WebSocket, usiamo `updateQueryData` per "iniettarlo" manualmente nella cache esistente, aggiornando la UI di tutti i componenti sottoscritti.
6.  Quando l'ultimo componente si scollega e la cache scade (dopo i 60s di `keepUnusedDataFor`), chiudiamo automaticamente il WebSocket.

#### Esempio: Gestione di un WebSocket

```typescript
// apiSlice.ts
import { apiSlice } from './apiSlice';
import { wssUrl } from './config';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChatMessages: builder.query<Message[], string>({
      query: (channelId) => `chat/${channelId}`,
      
      // Definiamo il lifecycle hook
      async onCacheEntryAdded(
        channelId, // L'argomento della query
        { 
          updateQueryData, // Funzione per modificare la cache
          cacheDataLoaded, // Promise che si risolve quando i dati iniziali sono caricati
          cacheEntryRemoved, // Promise che si risolve quando la cache sta per essere rimossa
          dispatch
        }
      ) {
        // Apriamo il WebSocket
        const ws = new WebSocket(`${wssUrl}/${channelId}`);

        try {
          // 1. Attendiamo il caricamento dei dati iniziali via HTTP
          await cacheDataLoaded;

          // 2. Ci mettiamo in ascolto di nuovi messaggi
          ws.onmessage = (event) => {
            const message = JSON.parse(event.data) as Message;
            
            // 3. Modifichiamo la cache esistente
            // "updateQueryData" usa Immer, quindi possiamo "mutare" lo stato
            dispatch(
              chatApi.util.updateQueryData(
                'getChatMessages', // L'endpoint da aggiornare
                channelId,         // L'argomento da aggiornare
                (draft) => {       // La "ricetta" Immer
                  draft.push(message); 
                }
              )
            );
          };

        } catch (err) {
          // Gestione errori
          console.error('Errore nel setup del WebSocket:', err);
        }

        // 4. Cleanup: Attendiamo che la cache venga rimossa
        // (quando l'ultimo componente si scollega + 60s)
        await cacheEntryRemoved;
        ws.close(); // Chiudiamo il WebSocket
      },
    }),
  }),
});
```


















### Contesto: A Cosa Serve Questo Codice?

L'obiettivo è creare un hook `useGetChatMessagesQuery` che:

1.  **Carica la cronologia** dei messaggi da un canale (via HTTP).
2.  **Rimane in ascolto** di nuovi messaggi su quel canale (via WebSocket).
3.  **Aggiorna automaticamente** la lista dei messaggi quando ne arriva uno nuovo.
4.  **Chiude la connessione** WebSocket quando l'utente non sta più guardando la chat.

-----

### Spiegazione Passo Passo

#### Passo 1: Definizione dell'Endpoint (`getChatMessages`)

```javascript
getChatMessages: builder.query<Message[], string>({
  query: (channelId) => `chat/${channelId}`,
  // ... resto del codice
```

  * `builder.query` definisce un'operazione per "leggere" dati.
  * `query: (channelId) => \`chat/${channelId}\`` : Questa è la **richiesta HTTP standard**. Quando un componente chiama  `useGetChatMessagesQuery('canale1')` , RTK Query esegue una richiesta  `GET`all'endpoint`.../chat/canale1\` per scaricare la cronologia dei messaggi.

#### Passo 2: Avvio del "Ciclo di Vita" (`onCacheEntryAdded`)

```javascript
async onCacheEntryAdded(
  channelId, 
  { cacheDataLoaded, cacheEntryRemoved, dispatch, updateQueryData }
) {
  // ...
```

  * `onCacheEntryAdded` è una funzione speciale di RTK Query. Viene eseguita **non appena il primo componente si "abbona"** a questa query (cioè quando `useGetChatMessagesQuery` viene montato per la prima volta con un dato `channelId`).
  * Riceve `channelId` (l'argomento della query) e un set di utility:
      * `cacheDataLoaded`: Una "Promise" che si risolve quando la richiesta HTTP del Passo 1 è completata.
      * `cacheEntryRemoved`: Una "Promise" che si risolve quando la cache sta per essere eliminata (perché nessuno la usa più).
      * `dispatch` e `updateQueryData`: Funzioni per modificare lo stato della cache.

#### Passo 3: Apertura della Connessione WebSocket

```javascript
const ws = new WebSocket(`${wssUrl}/${channelId}`);
```

  * Non appena il "ciclo di vita" inizia, il codice apre immediatamente una connessione WebSocket verso il server (es. `wss://tuo-server.com/canale1`). Questa è la "linea telefonica" che rimane aperta per i messaggi in tempo reale.

#### Passo 4: Sincronizzazione con i Dati HTTP

```javascript
try {
  await cacheDataLoaded;
  // ...
```

  * Questa è una riga **fondamentale**.
  * `await cacheDataLoaded;` **mette in pausa** l'esecuzione della funzione e **attende** che la richiesta HTTP del Passo 1 sia terminata.
  * **Perché?** Per evitare una "race condition". Non vuoi iniziare ad aggiungere nuovi messaggi (dal WebSocket) a una lista che non contiene ancora la cronologia (dall'HTTP). In questo modo, sei sicuro di avere prima la cronologia e *poi* i nuovi messaggi.

#### Passo 5: Ascolto dei Messaggi in Tempo Reale

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data) as Message;
  // ...
```

  * Una volta caricata la cronologia, attacchiamo un "listener" al WebSocket.
  * `ws.onmessage` è una funzione che viene eseguita **automaticamente ogni volta che il server invia un messaggio** attraverso la connessione WebSocket.
  * Il `message` viene estratto e convertito da stringa (JSON) a oggetto.

#### Passo 6: Aggiornamento della Cache (La Magia)

```javascript
dispatch(
  chatApi.util.updateQueryData(
    'getChatMessages', // Endpoint da aggiornare
    channelId,         // Argomento specifico
    (draft) => {       // Funzione di aggiornamento
      draft.push(message); 
    }
  )
);
```

  * Qui è dove avviene l'aggiornamento in tempo reale.
  * Invece di usare `useState`, modifichiamo direttamente la cache di RTK Query.
  * `chatApi.util.updateQueryData` dice: "Trova i dati nella cache per l'endpoint `getChatMessages` che è stato chiamato con questo `channelId`."
  * `(draft) => { draft.push(message); }`: Questa funzione (che usa Immer internamente) riceve lo stato attuale della cache (`draft`) e ci "spinge" (push) dentro il nuovo messaggio.
  * **Risultato:** Qualsiasi componente React che sta usando `useGetChatMessagesQuery(channelId)` si **aggiornerà automaticamente** per mostrare il nuovo messaggio, senza dover fare un'altra richiesta HTTP.

#### Passo 7: Pulizia e Chiusura

```javascript
} catch (err) {
  // ... gestione errore
}

await cacheEntryRemoved;
ws.close(); // Chiudiamo il WebSocket
```

  * La funzione ora **si rimette in pausa** sulla riga `await cacheEntryRemoved;`.
  * Rimarrà in attesa finché RTK Query non deciderà di eliminare i dati dalla cache (questo accade quando l'ultimo componente che usa la query viene smontato + il tempo di `keepUnusedDataFor`, di default 60 secondi).
  * Appena la cache viene rimossa, il codice riprende e **esegue `ws.close()`**.
  * Questo è **fondamentale per le prestazioni**: chiude la connessione WebSocket ("riaggancia il telefono") quando non serve più, evitando di sprecare risorse del server.





















-----

### 4.3.2 Aggiornamenti Ottimistici (Optimistic Updates)

Questo è un pattern UX avanzato. L'obiettivo è far sembrare l'app **istantanea**.

**Flusso:**

1.  L'utente esegue un'azione (es. "Like" a un post).
2.  Aggiorniamo la UI *immediatamente*, prima ancora di inviare la richiesta al server. (Es. il cuore diventa rosso).
3.  Inviamo la richiesta di mutazione al server.
4.  **Se ha successo:** Fantastico, non facciamo nulla. La UI è già corretta.
5.  **Se fallisce:** Dobbiamo fare un "rollback" (annullare) l'aggiornamento della UI e mostrare un errore. (Es. il cuore torna grigio).

Si implementa usando `onQueryStarted` all'interno di un `builder.mutation()`.

#### Esempio: "Like" a un post (Aggiornamento Ottimistico)

```typescript
// apiSlice.ts

export const postsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query per un post singolo (quella che aggiorneremo)
    getPost: builder.query<Post, number>({
      query: (id) => `posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // Mutazione per il "Like"
    likePost: builder.mutation<Post, { id: number; liked: boolean }>({
      query: ({ id, liked }) => ({
        url: `posts/${id}/like`,
        method: 'POST',
        body: { liked },
      }),
      
      // NON usiamo invalidatesTags, perché farebbe un refetch
      // che sovrascriverebbe il nostro stato ottimistico.
      // Gestiamo tutto manualmente.

      async onQueryStarted(
        { id, liked }, // L'argomento della mutazione
        { dispatch, queryFulfilled }
      ) {

        // 1. Aggiorniamo ottimisticamente la cache di 'getPost'
        // "updateQueryData" restituisce un "patch" object
        const patchResult = dispatch(
          postsApi.util.updateQueryData(
            'getPost', // L'endpoint della query da aggiornare
            id,        // L'argomento della query (l'ID del post)
            (draft) => {
              // Aggiorniamo ottimisticamente i dati
              draft.liked = liked; 
              draft.likesCount += liked ? 1 : -1;
            }
          )
        );

        try {
          // 2. Attendiamo la risposta del server
          await queryFulfilled;
        } catch {
          // 3. ERRORE: Il server ha fallito. Facciamo il rollback.
          patchResult.undo(); 
        }
      },
    }),
  }),
});
```

-----

### 4.3.3 Utilizzo di `updateQueryData` per Modifiche Manuali

Questa è l'alternativa a `invalidatesTags`.

**Perché usarla?**
`invalidatesTags` è semplice ma "costoso": **causa sempre un refetch** (una nuova richiesta `GET`).

Spesso, la risposta della mutazione (es. una `POST`) contiene già i dati aggiornati (es. l'oggetto appena creato). Perché fare un'altra richiesta `GET` per dati che abbiamo già?

Possiamo usare `updateQueryData` *dopo* il successo di una mutazione (spesso dal componente) per inserire manualmente i nuovi dati nella cache della lista.

#### Esempio: Aggiungere un Todo (Aggiornamento Manuale)

**Obiettivo:** Dopo aver creato un `Todo` (POST), aggiungerlo all'array della cache di `getTodos` (GET) senza un refetch.

```typescript
// apiSlice.ts

export const todoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // La query della lista
    getTodos: builder.query<Todo[], void>({
      query: () => 'todos',
      providesTags: ['Todos'], // Usiamo ancora i tag per altri scopi
    }),
    
    // La mutazione (POST)
    addTodo: builder.mutation<Todo, Partial<Todo>>({
      query: (newTodo) => ({
        url: 'todos',
        method: 'POST',
        body: newTodo,
      }),
      // IMPORTANTE: NON invalidiamo 'Todos' per evitare il refetch
      // invalidatesTags: ['Todos'], <-- Lo omettiamo
    }),
  }),
});

export const { useGetTodosQuery, useAddTodoMutation } = todoApi;
```

**Utilizzo nel Componente:**

```tsx
// AddTodoForm.tsx
import { useDispatch } from 'react-redux';
import { useAddTodoMutation, todoApi } from './apiSlice';

const AddTodoForm = () => {
  const dispatch = useDispatch();
  const [addTodo, { isLoading }] = useAddTodoMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = (e.target as any).title.value;
    if (!title) return;

    try {
      // 1. Eseguiamo la mutazione
      const newTodo = await addTodo({ title, completed: false }).unwrap();

      // 2. La mutazione ha successo!
      // 'newTodo' contiene l'oggetto restituito dal server (es. { id: 101, ... })

      // 3. Aggiorniamo manualmente la cache di 'getTodos'
      dispatch(
        todoApi.util.updateQueryData(
          'getTodos', // L'endpoint da aggiornare
          undefined,  // L'argomento della query 'getTodos' (è 'void', quindi 'undefined')
          (draft) => {
            // 'draft' è l'array Todo[] attuale nella cache
            // Grazie a Immer, possiamo semplicemente fare .push()
            draft.push(newTodo);
          }
        )
      );
      
      (e.target as any).reset();
    } catch (err) {
      console.error('Fallimento aggiunta todo:', err);
    }
  };

  // ... (form JSX) ...
};
```





































-----

### **Sezione 5: Integrazione Complessa e Scenari Professionali**

## 5.1 Gestione degli Errori e Autenticazione

Fino ad ora, abbiamo gestito gli errori a livello di componente utilizzando `isError` e `error`. Tuttavia, alcuni errori (come "Server Impreparato" - 500) o, più comunemente, "Non Autorizzato" (401), richiedono una gestione globale e centralizzata.

### 5.1.1 Gestione Centralizzata degli Errori

La nostra `baseQuery` personalizzata (come `axiosBaseQuery` che abbiamo costruito) è il posto perfetto per questo. È un "collo di bottiglia" (middleware) attraverso cui passano *tutte* le richieste e le risposte.

Nel nostro esempio `axiosBaseQuery`, abbiamo già centralizzato la *formattazione* dell'errore:

```typescript
// axiosBaseQuery.ts (snippet)
} catch (axiosError) {
  const err = axiosError as AxiosError;
  
  // Esempio di gestione centralizzata:
  if (err.response?.status === 500) {
    // Loggiamo l'errore a un servizio esterno (es. Sentry)
    logErrorToMyService(err.response.data);
  }

  // Errore
  return {
    error: {
      status: err.response?.status ?? 'UNKNOWN_ERROR',
      data: err.response?.data || err.message,
    },
  };
}
```

Mentre questo è utile per il logging, il caso d'uso più critico è la gestione dell'autenticazione scaduta (errore 401).

-----

### 5.1.2 Refresh Token/Autenticazione: Il Meccanismo di Retry

Questo è il pattern professionale standard per gestire sessioni utente che scadono (JWT, OAuth2, ecc.).

**Lo Scenario:**

1.  L'utente ha un **Access Token** (scade velocemente, es. 15 minuti) e un **Refresh Token** (scade molto più lentamente, es. 7 giorni).
2.  L'Access Token è scaduto. L'utente prova a caricare i suoi "todos" (richiesta a `GET /todos`).
3.  Il server risponde con `401 Unauthorized`.
4.  **Invece di fallire immediatamente** e mostrare un errore all'utente (costringendolo al login), la nostra `baseQuery` deve:
    a. "Catturare" l'errore 401.
    b. Mettere in pausa la richiesta `GET /todos`.
    c. Eseguire una nuova richiesta all'endpoint `POST /refresh` (inviando il Refresh Token).
    d. Se il refresh ha successo, il server risponde con un *nuovo* Access Token.
    e. La `baseQuery` salva il nuovo token (es. nello state Redux).
    f. **Riprova** (retry) la richiesta originale (`GET /todos`), questa volta con il nuovo token.
    g. Se il refresh *fallisce* (es. anche il Refresh Token è scaduto), esegue il logout dell'utente.

**Come si implementa in RTK Query:**
Si crea una funzione "wrapper" (un HOC per la `baseQuery`) che aggiunge questa logica *prima* della chiamata di rete effettiva.

#### 1\. Prerequisito: Un `authSlice` per le Credenziali

Per prima cosa, abbiamo bisogno di un normale slice Redux per memorizzare il token (e forse l'utente).

```typescript
// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: { name: string } | null;
}

const slice = createSlice({
  name: 'auth',
  initialState: { token: null, user: null } as AuthState,
  reducers: {
    // Azione per salvare le credenziali (login/refresh)
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = user;
      state.token = token;
    },
    // Azione per il logout
    logOut: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, logOut } = slice.actions;
export default slice.reducer;
export const selectCurrentToken = (state: RootState) => state.auth.token;
```

#### 2\. La `baseQuery` con Logica di Autenticazione

Usiamo `fetchBaseQuery` per semplicità in questo esempio, ma il concetto è identico per il nostro `axiosBaseQuery` (che diventerebbe l'`internalBaseQuery`).

```typescript
// src/api/apiSlice.ts (Modificato per l'autenticazione)

import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../store'; // Importiamo il tipo RootState
import { logOut, setCredentials } from '../features/auth/authSlice';

// --- 1. Definiamo la baseQuery "grezza" ---
// Questa baseQuery si occupa solo di aggiungere il token (se esiste)
// alle richieste in uscita.
const internalBaseQuery = fetchBaseQuery({
  baseUrl: 'https://api.example.com/',
  prepareHeaders: (headers, { getState }) => {
    // Prendiamo il token dallo stato 'auth'
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// --- 2. Creiamo il "wrapper" per il Re-Auth ---
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  
  // Eseguiamo la prima richiesta
  let result = await internalBaseQuery(args, api, extraOptions);

  // 4. Controlliamo se la prima richiesta è fallita con 401
  if (result.error && result.error.status === 401) {
    console.log('Token scaduto, tentativo di refresh...');

    // 5. Tentiamo di ottenere un nuovo token
    const refreshResult = await internalBaseQuery(
      '/refresh', // Il tuo endpoint di refresh
      api, 
      extraOptions
    );

    if (refreshResult.data) {
      console.log('Refresh riuscito, nuovo token ricevuto.');
      // 6. Salviamo il nuovo token nello store
      // Assumiamo che /refresh restituisca { user, token }
      api.dispatch(setCredentials(refreshResult.data as any));
      
      // 7. Ritentiamo la richiesta originale (che era fallita)
      // Questa volta 'internalBaseQuery' userà il nuovo token
      // grazie al 'prepareHeaders'
      result = await internalBaseQuery(args, api, extraOptions);
    } else {
      // 8. Il Refresh è fallito. Eseguiamo il Logout.
      console.error('Refresh fallito, logout in corso.');
      api.dispatch(logOut());
    }
  }

  return result;
};

// --- 3. Creiamo l'API Slice ---
export const apiSlice = createApi({
  reducerPath: 'api',
  // 9. Usiamo la nostra baseQuery "wrappata"
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // ... i tuoi endpoints (es. getTodos)
    // Non hanno bisogno di sapere nulla di questo processo.
    // È tutto automatico e centralizzato.
  }),
});
```

**Riepilogo del Vantaggio:**
Con questo pattern, i tuoi componenti e le definizioni degli endpoint rimangono incredibilmente puliti. `useGetTodosQuery()` non sa (e non gli interessa) che il token è scaduto ed è stato aggiornato. Vede solo uno stato `isFetching` leggermente più lungo del solito, per poi ricevere i suoi dati. Tutta la logica di sessione è confinata e riutilizzabile.




















# Con Axios

-----

### 1\. `axiosInstance.ts` (Il Cervello)

Qui è dove va tutta la logica. Creiamo un'istanza `axios` e le "iniettiamo" lo `store` di Redux per poter leggere (`getState`) e scrivere (`dispatch`).

```typescript
// src/api/axiosInstance.ts
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { RootState } from '../store'; // Importa il tipo RootState
import { setCredentials, logOut } from '../features/auth/authSlice'; // Importa le tue azioni
import type { Store } from '@reduxjs/toolkit';

const API_BASE_URL = 'https://api.example.com/';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Funzione per "iniettare" lo store nell'istanza axios
// Questo è necessario per evitare dipendenze circolari
export const setupAxiosInterceptors = (store: Store<RootState>) => {
  
  // --- 1. Interceptor per le Richieste (Equivalente di 'prepareHeaders') ---
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Prendiamo il token dallo stato
      const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // --- 2. Interceptor per le Risposte (Equivalente di 'baseQueryWithReauth') ---
  axiosInstance.interceptors.response.use(
    // Se la risposta è 2xx, la fa passare
    (response) => response,
    
    // Se la risposta è un errore (es. 401)
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig;
      
      // Controlla se è un errore 401 e se non è un tentativo di retry
      // Il flag '_retry' serve a evitare loop infiniti di refresh
      if (error.response?.status === 401 && !(originalRequest as any)._retry) {
        (originalRequest as any)._retry = true; // Marca come tentativo di retry
        
        console.log('Token scaduto, tentativo di refresh...');

        try {
          // 5. Tentiamo di ottenere un nuovo token
          // NOTA: Usiamo 'axiosInstance.post' qui. Se anche /refresh 
          // richiede un token (diverso), potresti dover usare un'istanza axios separata.
          // Assumiamo che /refresh usi il refresh token (magari in httpOnly cookie)
          const refreshResult = await axiosInstance.post('/refresh');

          // 6. Salviamo il nuovo token nello store
          store.dispatch(setCredentials(refreshResult.data));
          
          // 7. Ritentiamo la richiesta originale (che era fallita)
          // Aggiorniamo l'header con il nuovo token (anche se il request interceptor lo farà)
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${refreshResult.data.token}`;
          originalRequest.headers['Authorization'] = `Bearer ${refreshResult.data.token}`;
          
          return axiosInstance(originalRequest);

        } catch (refreshError) {
          // 8. Il Refresh è fallito. Eseguiamo il Logout.
          console.error('Refresh fallito, logout in corso.', refreshError);
          store.dispatch(logOut());
          return Promise.reject(refreshError);
        }
      }
      
      // Per tutti gli altri errori, rigetta la promise
      return Promise.reject(error);
    }
  );
};
```

-----

### 2\. `axiosBaseQuery.ts` (L'Adattatore)

Ora che `axiosInstance` ha tutta la logica, la `baseQuery` diventa incredibilmente **semplice**. Il suo unico compito è chiamare `axios` e tradurre la sua risposta nel formato che RTK Query si aspetta.

```typescript
// src/api/axiosBaseQuery.ts
import { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import { axiosInstance } from './axiosInstance'; // Importiamo l'istanza configurata

export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      // Tutta la logica (token, refresh) è GESTITA IN AUTOMATICO
      // dagli interceptor di axiosInstance
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
```

-----

### 3\. `store.ts` (Dove si unisce tutto)

Qui devi solo importare lo `store` e passarlo alla funzione di setup degli interceptor.

```typescript
// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import { setupAxiosInterceptors } from './api/axiosInstance';
import authReducer from './features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// --- INIETTA LO STORE NEGLI INTERCEPTOR ---
setupAxiosInterceptors(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

-----

### 4\. `apiSlice.ts` (Il File Finale)

Infine, il tuo `apiSlice` ora usa semplicemente `axiosBaseQuery` e non deve più preoccuparsi di nulla.

```typescript
// src/api/apiSlice.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery'; // Importa il nostro adattatore

export const apiSlice = createApi({
  reducerPath: 'api',
  // 9. Usiamo la nostra baseQuery basata su Axios
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    // ... i tuoi endpoints (es. getTodos)
    // Non sanno nulla della logica di refresh.
    getTodos: builder.query<any, void>({
      query: () => ({ url: 'todos', method: 'GET' }),
    }),
  }),
});
```

Questo approccio è più complesso da configurare inizialmente, ma **centralizza tutta la logica di autenticazione** nell'istanza di `axios`, rendendo la `baseQuery` e gli endpoint molto più puliti e semplici.





























# ESEMPIO FINALE

-----

### Panoramica dell'Architettura Professionale

1.  **Struttura dei File:** Separeremo la logica API, lo stato, i tipi e i componenti.
2.  **`baseQuery` Personalizzata (con Axios):** Creeremo un'istanza Axios.
3.  **Wrapper di Autenticazione (`baseQueryWithReauth`):** Implementeremo un wrapper `baseQuery` che intercetta gli errori 401 (simulati) per tentare un *refresh token* prima di fallire.
4.  **API Slice (`apiSlice`):**
      * **Query Granulare:** `getTodos` con paginazione e normalizzazione dei tag (`providesTags` con ID) per ottimizzare le liste.
      * **Mutazione Pessimistica (`addTodo`):** Aggiorneremo manualmente la cache *dopo* la risposta del server (`updateQueryData`).
      * **Mutazione Ottimistica (`updateTodo`):** Aggiorneremo la UI *prima* della risposta del server (`onQueryStarted` e `undo`) per un'esperienza utente istantanea.
5.  **Store:** Configurazione standard con lo slice auth e l'API slice.
6.  **Componenti:** I componenti React che consumano gli hook.

-----

### Passo 1: Definizione dei Tipi

Definiamo i contratti per i nostri dati e per la nostra `baseQuery`.

```typescript
// src/types.ts
// Tipi di dati da JSONPlaceholder
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// Parametri per la nostra query della lista
export interface TodoListParams {
  _page: number;
  _limit: number;
}

// Struttura per il nostro adattatore Axios
export interface BaseQueryArgs {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: unknown;
}

// Struttura standard per gli errori
export interface ApiError {
  status: number | string;
  data: {
    message: string;
    details?: any;
  };
}
```

-----

### Passo 2: Slice di Autenticazione (Simulato)

Abbiamo bisogno di uno slice per gestire i nostri (finti) token.

```typescript
// src/features/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
}

// Simuliamo un token JWT che scade dopo 1 secondo per testare il refresh
const FAKE_EXPIRED_TOKEN = 'fake-expired-jwt';
const FAKE_VALID_TOKEN = 'fake-valid-jwt-xxxxxxxx';
const FAKE_REFRESH_TOKEN = 'fake-refresh-token';

const initialState: AuthState = {
  // Partiamo con un token finto scaduto per attivare il re-auth
  accessToken: FAKE_EXPIRED_TOKEN, 
  refreshToken: FAKE_REFRESH_TOKEN,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Azione per impostare i nuovi token dopo un refresh
    setCredentials: (
      state,
      { payload: { accessToken } }: PayloadAction<{ accessToken: string }>
    ) => {
      state.accessToken = accessToken;
    },
    // Azione per il logout
    logOut: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

// Selettori
export const selectCurrentToken = (state: RootState) => state.auth.accessToken;

// Mock di una chiamata di refresh (normalmente sarebbe un endpoint API)
export const mockRefreshCall = async (refreshToken: string) => {
  return new Promise<{ data: { accessToken: string } }>((resolve, reject) => {
    setTimeout(() => {
      if (refreshToken === FAKE_REFRESH_TOKEN) {
        console.log('--- Mock Refresh: Successo! ---');
        resolve({ data: { accessToken: FAKE_VALID_TOKEN } });
      } else {
        reject(new Error('Invalid refresh token'));
      }
    }, 500); // Simula 500ms di latenza di rete
  });
};
```

-----

### Passo 3: Istanza Axios e `baseQuery` con Retry (Il Cuore dell'Autenticazione)

Creiamo prima l'adattatore Axios, poi lo "wrappiamo" con la logica di *retry* dell'autenticazione.

```typescript
// src/api/axiosInstance.ts
import axios from 'axios';
export const axiosInstance = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com/',
  headers: { 'Content-Type': 'application/json' },
});
```

```typescript
// src/api/baseQueryWithReauth.ts
import { BaseQueryFn } from '@reduxjs/toolkit/query';
import { AxiosError } from 'axios';
import { axiosInstance } from './axiosInstance';
import type { BaseQueryArgs, ApiError } from '../types';
import type { RootState } from '../store';
import { selectCurrentToken, setCredentials, logOut, mockRefreshCall } from '../features/authSlice';
import { Mutex } from 'async-mutex';

// Un Mutex (Mutual Exclusion) è fondamentale per prevenire "race conditions"
// durante il refresh. Se 10 richieste falliscono contemporaneamente con 401,
// solo la *prima* deve eseguire il refresh, le altre 9 devono attendere
// il rilascio del "lock" e riprovare con il nuovo token.
const mutex = new Mutex();

/**
 * 1. L'ADATTATORE AXIOS (INTERNO)
 * Questo è il nostro adattatore base che traduce RTK Query in chiamate Axios.
 * Aggiunge anche l'Authorization header.
 */
const axiosBaseQuery =
  (): BaseQueryFn<BaseQueryArgs, unknown, ApiError> =>
  async ({ url, method, data, params }, { getState }) => {
    try {
      const token = selectCurrentToken(getState() as RootState);
      
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        headers: {
          // Aggiungiamo il token (anche se JSONPlaceholder lo ignora)
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      // Per simulare un 401 con JSONPlaceholder (che dà sempre 200)
      // decommenta questa riga se stai testando con un token scaduto
      /*
      if (err.config.headers?.Authorization === `Bearer fake-expired-jwt`) {
         return {
           error: { status: 401, data: { message: 'Token simulato scaduto!' } }
         };
      }
      */
      return {
        error: {
          status: err.response?.status ?? 'NETWORK_ERROR',
          data: (err.response?.data as any) || { message: err.message },
        },
      };
    }
  };


/**
 * 2. IL WRAPPER DI AUTENTICAZIONE (ESTERNO)
 * Questo wrapper implementa la logica di retry del refresh token.
 */
export const baseQueryWithReauth: BaseQueryFn<
  BaseQueryArgs,
  unknown,
  ApiError
> = async (args, api, extraOptions) => {
  // Otteniamo la nostra baseQuery interna
  const internalBaseQuery = axiosBaseQuery();
  
  // Attende che il mutex sia sbloccato prima di procedere
  await mutex.waitForUnlock();
  
  // Eseguiamo la prima richiesta
  let result = await internalBaseQuery(args, api, extraOptions);

  // Controlliamo se la richiesta è fallita per autenticazione (401)
  if (result.error && result.error.status === 401) {
    // Se il mutex è già bloccato, un'altra richiesta sta già facendo il refresh.
    // Attendiamo che sblocchi e riproviamo la richiesta originale.
    if (!mutex.isLocked()) {
      const release = await mutex.acquire(); // Blocchiamo il mutex
      console.log('--- baseQueryWithReauth: Acquisito Mutex, tentativo di refresh... ---');
      try {
        const refreshToken = (api.getState() as RootState).auth.refreshToken;

        if (refreshToken) {
          // 3. Eseguiamo la chiamata di refresh
          const refreshResult = await mockRefreshCall(refreshToken);
          
          // 4. Salviamo i nuovi token nello store
          api.dispatch(setCredentials(refreshResult.data));

          // 5. Ritentiamo la chiamata originale (ora con il nuovo token)
          console.log('--- baseQueryWithReauth: Refresh OK, ritento la chiamata originale ---');
          result = await internalBaseQuery(args, api, extraOptions);
        } else {
          // Non c'è un refresh token, facciamo il logout
          api.dispatch(logOut());
        }
      } catch (e) {
        // Il refresh è fallito, facciamo il logout
        console.error('--- baseQueryWithReauth: Refresh fallito, logout ---');
        api.dispatch(logOut());
      } finally {
        release(); // Sblocchiamo il mutex in ogni caso
      }
    } else {
      // Il mutex era bloccato, attendiamo e riproviamo
      console.log('--- baseQueryWithReauth: Mutex bloccato, attendo e ritento... ---');
      await mutex.waitForUnlock();
      result = await internalBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
```

-----

### Passo 4: L'API Slice Avanzato

Ora usiamo la nostra `baseQueryWithReauth` e definiamo gli endpoint con strategie di caching avanzate.

```typescript
// src/api/apiSlice.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import type { Todo, TodoListParams, User } from '../types';

export const apiSlice = createApi({
  reducerPath: 'api',
  // Usiamo il nostro wrapper avanzato per la baseQuery
  baseQuery: baseQueryWithReauth,
  
  // Definiamo i Tag per il caching. Usiamo il singolare.
  tagTypes: ['Todo', 'User'], 
  
  endpoints: (builder) => ({
    
    // === QUERY (con parametri e normalizzazione) ===
    getTodos: builder.query<Todo[], TodoListParams>({
      query: (params) => ({
        url: 'todos',
        method: 'GET',
        params, // (es. ?_page=1&_limit=10)
      }),
      /**
       * OTTIMIZZAZIONE (Normalizzazione):
       * Forniamo sia un tag 'LIST' (per la collezione) 
       * sia tag individuali '{ type: 'Todo', id }' per ogni item.
       * Questo permette alle mutazioni (update/delete) di invalidare
       * solo l'item specifico, senza ricaricare l'intera lista.
       */
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Todo' as const, id })),
        { type: 'Todo', id: 'LIST' },
      ],
    }),

    // === MUTAZIONE PESSIMISTICA (con update manuale) ===
    addTodo: builder.mutation<Todo, Omit<Todo, 'id' | 'userId' | 'completed'>>({
      query: (newTodo) => ({
        url: 'todos',
        method: 'POST',
        data: { ...newTodo, userId: 1, completed: false }, // JSONPlaceholder ignora il body, ma è per l'esempio
      }),
      /**
       * OTTIMIZZAZIONE (Pessimistic Update Manuale):
       * Invece di `invalidatesTags: ['Todo']` (che causerebbe un refetch),
       * aggiorniamo manualmente la cache 'getTodos' usando `onQueryStarted`
       * *dopo* che la mutazione ha avuto successo.
       */
      async onQueryStarted(newTodo, { dispatch, queryFulfilled }) {
        try {
          const { data: createdTodo } = await queryFulfilled;
          
          // Troviamo i parametri dell'ultima query 'getTodos' per aggiornarla
          // (Questa è una logica semplificata; in un'app reale dovresti
          // gestire quale 'getTodos' (con quali params) aggiornare)
          const params: TodoListParams = { _page: 1, _limit: 10 }; // Esempio
          
          dispatch(
            apiSlice.util.updateQueryData('getTodos', params, (draft) => {
              // Aggiungiamo il nuovo todo in cima alla lista
              draft.unshift(createdTodo);
            })
          );
        } catch (err) {
          console.error('Fallimento addTodo:', err);
        }
      },
    }),

    // === MUTAZIONE OTTIMISTICA ===
    updateTodo: builder.mutation<Todo, Todo>({
      query: (todo) => ({
        url: `todos/${todo.id}`,
        method: 'PUT',
        data: todo,
      }),
      /**
       * OTTIMIZZAZIONE (Optimistic Update):
       * Aggiorniamo la cache *prima* della risposta. Se fallisce,
       * facciamo il rollback usando `patchResult.undo()`.
       */
      async onQueryStarted(updatedTodo, { dispatch, queryFulfilled }) {
        // Troviamo i parametri della query list (semplificato)
        const params: TodoListParams = { _page: 1, _limit: 10 };
        
        // 1. Aggiorniamo ottimisticamente la lista
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getTodos', params, (draft) => {
            const index = draft.findIndex((t) => t.id === updatedTodo.id);
            if (index !== -1) {
              draft[index] = updatedTodo; // Sostituiamo l'item
            }
          })
        );

        try {
          // 2. Attendiamo la risposta del server
          await queryFulfilled;
        } catch {
          // 3. ERRORE: Facciamo il rollback!
          patchResult.undo();
          console.error('Rollback dell\'aggiornamento ottimistico');
        }
      },
    }),

    // === MUTAZIONE (con invalidazione standard) ===
    deleteTodo: builder.mutation<void, number>({
      query: (id) => ({
        url: `todos/${id}`,
        method: 'DELETE',
      }),
      /**
       * Per la delete, un'invalidazione granulare è spesso la
       * soluzione più pulita e semplice.
       * Invalidiamo solo il tag dell'ID specifico.
       * Questo rimuoverà l'item dalla cache `getTodos` (grazie
       * alla normalizzazione) senza un refetch completo della lista.
       */
      invalidatesTags: (result, error, id) => [{ type: 'Todo', id }],
    }),
  }),
});

// Esportiamo gli hook auto-generati
export const {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = apiSlice;
```

-----

### Passo 5: Store e Applicazione

```typescript
// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api/apiSlice';
import authReducer from './features/authSlice';

export const store = configureStore({
  reducer: {
    // Aggiungiamo i reducer
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  // Aggiungiamo il middleware (fondamentale)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof typeof store.dispatch;
```

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

-----

### Passo 6: I Componenti (Consumatori)

#### Componente del Form (Pessimistic Update)

```tsx
// src/components/AddTodoForm.tsx
import React, { useState } from 'react';
import { useAddTodoMutation } from '../api/apiSlice';

export const AddTodoForm = () => {
  const [title, setTitle] = useState('');
  // Usiamo la mutazione pessimistica
  const [addTodo, { isLoading, error }] = useAddTodoMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      // 1. Chiamiamo la mutazione
      // Non facciamo nulla nella UI finché non abbiamo la risposta
      await addTodo({ title }).unwrap();
      
      // 2. Successo! L'onQueryStarted nell'apiSlice
      //    sta già aggiornando la cache.
      setTitle(''); // Resettiamo il form
    } catch (err) {
      console.error('Errore nell\'aggiunta:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nuovo todo..."
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvataggio...' : 'Aggiungi'}
      </button>
      {error && <div style={{ color: 'red' }}>Errore nel salvataggio</div>}
    </form>
  );
};
```

#### Componente della Lista (Optimistic Update)

```tsx
// src/components/TodoList.tsx
import React, { useState } from 'react';
import {
  useGetTodosQuery,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} from '../api/apiSlice';
import type { Todo } from '../types';

// Componente per il singolo item (per isolare i re-render)
const TodoItem: React.FC<{ todo: Todo }> = ({ todo }) => {
  // Usiamo la mutazione ottimistica
  const [updateTodo, { isLoading: isUpdating }] = useUpdateTodoMutation();
  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation();

  const handleToggle = () => {
    // L'UI si aggiorna *istantaneamente* grazie all'Optimistic Update
    updateTodo({ ...todo, completed: !todo.completed });
  };

  const handleDelete = () => {
    // La UI si aggiorna *istantaneamente* (in questo caso con invalidatesTags by ID)
    deleteTodo(todo.id);
  };

  const isLoading = isUpdating || isDeleting;

  return (
    <li style={{ 
      opacity: isLoading ? 0.5 : 1,
      textDecoration: todo.completed ? 'line-through' : 'none',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '5px 0'
    }}>
      <span onClick={handleToggle} style={{ cursor: 'pointer' }}>
        {todo.title}
      </span>
      <button onClick={handleDelete} disabled={isLoading}>
        X
      </button>
    </li>
  );
};


// Componente Lista Principale
export const TodoList = () => {
  const [page, setPage] = useState(1);
  
  // Usiamo la query paginata
  const {
    data: todos,
    isLoading,
    isFetching,
    isError,
  } = useGetTodosQuery({ _page: page, _limit: 10 });

  if (isLoading) return <div>Caricamento iniziale...</div>;
  if (isError) return <div>Errore di rete.</div>;
  
  return (
    <div>
      <h2>Lista Todos (Avanzata)</h2>
      {isFetching && <span style={{ color: 'blue' }}>(Refetching...)</span>}
      <ul style={{ listStyle: 'none' }}>
        {todos?.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      <div>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
          Precedente
        </button>
        <span> Pagina: {page} </span>
        <button onClick={() => setPage(p => p + 1)}>
          Successiva
        </button>
      </div>
    </div>
  );
};
```

#### App Principale

```tsx
// src/App.tsx
import { AddTodoForm } from './components/AddTodoForm';
import { TodoList } from './components/TodoList';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1>Esempio RTK Query Professionale</h1>
      <AddTodoForm />
      <TodoList />
    </div>
  );
}

export default App;
```































-----

### Passo 1: Definizione dei Tipi (`types.ts`)

Questo file stabilisce i contratti di dati (interfacce) per l'intera applicazione.

  * **Cosa Fa:** Definisce le "forme" dei dati, come `Todo` e `User`, e le interfacce per la logica dell'API, come `BaseQueryArgs` (i parametri per la nostra `baseQuery`) e `ApiError`.
  * **Perché:** L'uso di interfacce dedicate garantisce la *type-safety* in tutto il progetto. Questo previene bug comuni (es. refusi nei nomi delle proprietà) e abilita un eccellente autocompletamento nell'editor.
  * **Linea Chiave:**
    ```typescript
    export interface ApiError {
      status: number | string;
      data: {
        message: string;
        details?: any;
      };
    }
    ```
    La definizione di `ApiError` è un punto cruciale. Crea un'interfaccia standard per gli errori. In questo modo, RTK Query saprà sempre che, in caso di fallimento, l'oggetto `error` avrà una proprietà `status` e una `data` con una `message`. Questo rende la gestione degli errori prevedibile e coerente.

-----

### Passo 2: Slice di Autenticazione (`authSlice.ts`)

Questo slice Redux funge da *single source of truth* (fonte unica di verità) per lo stato di autenticazione.

  * **Cosa Fa:** Gestisce le uniche due informazioni rilevanti per l'autenticazione: `accessToken` e `refreshToken`. Fornisce *reducer* (`setCredentials`, `logOut`) per aggiornare questi token e *selettori* (`selectCurrentToken`) per leggerli.
  * **Perché:** Separa le responsabilità (Separation of Concerns). L'API layer (RTK Query) non deve "possedere" lo stato di autenticazione; deve solo leggerlo (`getState`) e, se necessario, aggiornarlo (`dispatch`).
  * **Strategia Chiave:**
    ```typescript
    const initialState: AuthState = {
      accessToken: FAKE_EXPIRED_TOKEN, 
      refreshToken: FAKE_REFRESH_TOKEN,
    };
    ```
    Inizializzare lo stato con un token fittizio *già scaduto* è una strategia di sviluppo efficace. Forza la logica di refresh token a scattare alla prima chiamata API, permettendo di testare immediatamente l'intero flusso di re-autenticazione.
  * **Funzione Mock:**
    ```typescript
    export const mockRefreshCall = async (refreshToken: string) => { ... }
    ```
    Questa funzione simula una chiamata di rete a un endpoint `/refresh`. Simula una latenza di 500ms e restituisce un nuovo token valido. Questo ci permette di costruire e testare l'intera logica di refresh e il Mutex senza un backend reale.

-----

### Passo 3: Il Cuore dell'Autenticazione (`baseQueryWithReauth.ts`)

Questo file è il componente più complesso e importante. È strutturato in due parti: un adattatore interno e un wrapper esterno.

#### 1\. `axiosBaseQuery` (L'Adattatore Interno)

  * **Cosa Fa:** Funziona come un *adattatore* (Adapter Pattern). Il suo unico compito è ricevere gli argomenti standard di RTK Query (`{ url, method, data }`) e "tradurli" in una chiamata `axiosInstance`.
  * **Linea Chiave (Ottimizzazione):**
    ```typescript
    const token = selectCurrentToken(getState() as RootState);
    // ...
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ```
    Questo agisce come un *interceptor di richiesta* dinamico. Prima di *ogni* chiamata, la funzione `getState` va a prendere il token *attualmente* presente nello store. Questo garantisce che se una chiamata di refresh aggiorna il token, la chiamata successiva utilizzerà automaticamente quello nuovo.

#### 2\. `baseQueryWithReauth` (Il Wrapper di Autenticazione)

Questo è il `baseQuery` che verrà effettivamente fornito a `createApi`. "Avvolge" l'adattatore interno e aggiunge la logica di gestione degli errori 401.

  * **Concetto Chiave: `const mutex = new Mutex();`**

      * **Problema (Race Condition):** Immaginiamo che l'applicazione carichi 5 diverse chiamate API contemporaneamente (`useGetTodos`, `useGetUser`, `useGetSettings`...). Se il token è scaduto, tutte e 5 falliranno con errore 401. Senza un Mutex, tutte e 5 tenterebbero di eseguire una chiamata a `/refresh`, risultando in 5 richieste di refresh ridondanti.
      * **Soluzione (Mutex):** Un Mutex (Mutual Exclusion) è un "semaforo" o un "lock". Assicura che solo *una* richiesta alla volta possa entrare nella sezione di codice critica (il blocco di refresh).
      * **Flusso:**
        1.  La **prima** richiesta che fallisce (il "Leader") vede che il mutex non è bloccato (`!mutex.isLocked()`) e acquisisce il *lock* (`mutex.acquire()`).
        2.  Le **altre** richieste (i "Follower") che falliscono nel frattempo, vedono il mutex bloccato e si mettono in attesa (`await mutex.waitForUnlock()`).
        3.  Il Leader esegue la chiamata `mockRefreshCall`, riceve il nuovo token, fa il `dispatch` di `setCredentials` e, infine, rilascia il *lock* (`release()`).
        4.  I Follower, che erano in attesa, vengono sbloccati uno alla volta e rieseguono la loro chiamata originale, che ora avrà successo grazie al nuovo token.

  * **Flusso Logico del Codice:**

    ```typescript
    // 1. Attende se il mutex è già bloccato da un'altra chiamata
    await mutex.waitForUnlock();

    // 2. Esegue la chiamata originale
    let result = await internalBaseQuery(args, api, extraOptions);

    // 3. Controlla se è fallita per errore 401
    if (result.error && result.error.status === 401) {
      
      // 4. Controlla se è il "Leader" (il mutex è sbloccato)
      if (!mutex.isLocked()) {
        const release = await mutex.acquire(); // Acquisisce il lock
        try {
          // ...esegue il refresh e salva il token...
          api.dispatch(setCredentials(refreshResult.data));

          // ...Ritenta la chiamata originale (ora avrà successo)
          result = await internalBaseQuery(args, api, extraOptions);
        } finally {
          release(); // Rilascia il lock in ogni caso
        }
      } else {
        // 5. È un "Follower" (il mutex era bloccato)
        await mutex.waitForUnlock(); // Attende il Leader
        result = await internalBaseQuery(args, api, extraOptions); // Ritenta
      }
    }
    ```

-----

### Passo 4: API Slice (`apiSlice.ts`)

Qui definiamo gli endpoint e implementiamo le strategie di caching avanzate.

#### `getTodos` (Query con Normalizzazione)

  * **Cosa Fa:** Recupera una lista di `Todo`.
  * **Strategia (Normalizzazione):**
    ```typescript
    providesTags: (result = []) => [
      ...result.map(({ id }) => ({ type: 'Todo' as const, id })),
      { type: 'Todo', id: 'LIST' },
    ],
    ```
    Questa è un'ottimizzazione fondamentale. Invece di taggare la cache semplicemente con `['Todo']`, la "normalizziamo". Stiamo dicendo a RTK Query:
    1.  Questa query è responsabile per la *collezione* (`{ id: 'LIST' }`).
    2.  Questa query è responsabile anche per *ogni singolo item* (`{ type: 'Todo', id }`).
        Questa struttura granulare è ciò che abilita le ottimizzazioni nelle mutazioni successive.

#### `addTodo` (Mutazione Pessimistica Manuale)

  * **Cosa Fa:** Aggiunge un nuovo `Todo`.
  * **Strategia (Pessimistic Update Manuale):** "Pessimistico" significa che l'UI attende la conferma del server *prima* di aggiornarsi. "Manuale" significa che invece di forzare un refetch, aggiorniamo noi la cache.
  * **Flusso:**
    1.  `onQueryStarted`: Intercetta il ciclo di vita della mutazione.
    2.  `await queryFulfilled`: Attende che la chiamata API abbia successo.
    3.  `dispatch(apiSlice.util.updateQueryData(...))`: Se la chiamata ha successo, usa l'utility `updateQueryData` per trovare la cache di `getTodos` e *aggiungere manualmente* (`draft.unshift`) il nuovo todo.
    <!-- end list -->
      * **Vantaggio:** La lista si aggiorna senza una seconda chiamata di rete (refetch).

#### `updateTodo` (Mutazione Ottimistica)

  * **Cosa Fa:** Aggiorna un `Todo` (es. toggle completato).
  * **Strategia (Optimistic Update):** "Ottimistico" significa che l'UI viene aggiornata *immediatamente*, "assumendo" che la chiamata al server avrà successo.
  * **Flusso:**
    1.  `onQueryStarted`: Si attiva subito.
    2.  `const patchResult = dispatch(...)`: Esegue *immediatamente* l'aggiornamento manuale della cache. L'UI cambia *istantaneamente*.
    3.  `try { await queryFulfilled; }`: A questo punto, attende la risposta del server in background.
    4.  `catch { patchResult.undo(); }`: Se `queryFulfilled` fallisce (il server dà errore), `patchResult.undo()` annulla automaticamente la modifica locale, eseguendo un "rollback" dello stato della UI.
    <!-- end list -->
      * **Vantaggio:** Offre un'esperienza utente estremamente reattiva.

#### `deleteTodo` (Mutazione con Invalidazione Granulare)

  * **Cosa Fa:** Cancella un `Todo`.
  * **Strategia (Invalidazione Granulare):**
    ```typescript
    invalidatesTags: (result, error, id) => [{ type: 'Todo', id }],
    ```
    Questa è la strategia più pulita. Sfrutta la *normalizzazione* fatta in `getTodos`.
    1.  La mutazione "invalida" il tag `{ type: 'Todo', id: 5 }`.
    2.  RTK Query vede che la cache di `getTodos` "forniva" quel tag.
    3.  Invece di ricaricare l'intera lista, RTK Query è abbastanza intelligente da *rimuovere* semplicemente l'item con `id: 5` dalla cache di `getTodos`.
    <!-- end list -->
      * **Vantaggio:** La UI si aggiorna istantaneamente, senza un refetch, e con una sola riga di codice.

-----

### Passo 5: Store e Applicazione (`store.ts`, `main.tsx`)

  * **Cosa Fa:** Configurazione standard di Redux e React.
  * **Linea Chiave (`store.ts`):**
    ```typescript
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    ```
    Aggiungere il `middleware` di `apiSlice` è **obbligatorio**. È il "motore" che gestisce l'esecuzione delle query, la durata della cache, l'invalidazione, il `refetchOnFocus`, e tutta la logica asincrona.

-----

### Passo 6: I Componenti (Consumatori)

  * **`AddTodoForm.tsx` (Pessimistico):**

      * Questo componente dimostra il flusso pessimistico. L'utente clicca "Aggiungi".
      * Il bottone viene disabilitato (`disabled={isLoading}`).
      * Il codice attende (`await addTodo({ title }).unwrap();`).
      * Solo *dopo* il successo, il form viene resettato. L'aggiornamento della lista avviene in background (gestito da `onQueryStarted`). L'UI attende la conferma del server.

  * **`TodoList.tsx` (Ottimistico):**

      * **Best Practice:** L'uso di un componente `TodoItem` separato è fondamentale per le performance di React, poiché isola i re-render: solo l'item che cambia verrà ri-renderizzato, non l'intera lista.
      * **Flusso (`handleToggle`):**
        ```typescript
        const handleToggle = () => {
          updateTodo({ ...todo, completed: !todo.completed });
        };
        ```
        Nota l'assenza di `await`. Questa è una chiamata *fire-and-forget*. Il click scatena la mutazione `updateTodo`, che a sua volta scatena l'aggiornamento ottimistico in `onQueryStarted`. L'UI si aggiorna istantaneamente. Tutta la logica di successo/fallimento/rollback è gestita centralmente nell'API slice, non nel componente.














### ESERCIZIO : GESTIRE UNA LISTA CON CHIAMATE API TRAMITE JSON PLACEHOLDER