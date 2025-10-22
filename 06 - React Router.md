

##  1. Cos’è un SPA Router

### 1.1 Introduzione: dalla navigazione tradizionale alla navigazione client-side

Nelle applicazioni web tradizionali (Multi-Page Applications, MPA), ogni volta che clicchiamo su un link o inviamo un form, il browser effettua **una nuova richiesta HTTP al server**, il quale risponde con **una nuova pagina HTML**.
Questo ciclo comporta:

* Ricaricamento completo della pagina
* Reset dello stato JavaScript
* Perdita di eventuali stati temporanei della UI
* Tempi di attesa maggiori per l’utente

Le Single Page Applications (**SPA**) come quelle create con React funzionano in modo diverso: il browser **carica un’unica pagina HTML iniziale**, e la navigazione tra le varie “pagine” dell’app avviene **interamente lato client**, senza ricaricare tutto il documento.
Il routing non è più gestito dal server, ma **da JavaScript nel browser**.

---

### 1.2 Come funziona la navigazione client-side: History API

Il cuore di questa logica è la **History API** del browser, che fornisce metodi per manipolare la cronologia e l’URL **senza ricaricare la pagina**.
I metodi principali sono:

* `window.history.pushState(state, title, url)`
  Aggiunge una nuova voce nella cronologia e cambia l’URL **senza ricaricare la pagina**.
* `window.history.replaceState(state, title, url)`
  Sostituisce la voce corrente nella cronologia con un nuovo stato e URL.
* `window.onpopstate`
  Listener dell’evento generato quando l’utente usa i pulsanti “indietro” o “avanti”.

Questi metodi permettono a librerie come **React Router** di intercettare i cambiamenti di URL e aggiornare **solo i componenti React necessari**, mantenendo l’esperienza dell’utente fluida e istantanea.

---

### 1.3 Location: l’oggetto che rappresenta l’URL corrente

L’oggetto `window.location` fornisce informazioni sull’URL attuale (protocollo, host, pathname, query, hash).
React Router utilizza un concetto simile (il proprio oggetto `location`) per capire **quale componente mostrare** in base al percorso richiesto.

Esempio:

```ts
console.log(window.location.pathname)
// "/dashboard"
```

Ogni volta che il pathname cambia tramite `pushState`, `replaceState` o pulsanti di navigazione, React Router riceve la notifica e decide **quale parte dell’interfaccia deve essere renderizzata**.

---

### 1.4 Differenza tra navigazione server-side e client-side

| Aspetto                  | Navigazione Tradizionale (MPA)        | SPA con Router (client-side)   |
| ------------------------ | ------------------------------------- | ------------------------------ |
| **Gestione URL**         | Server                                | Browser (History API)          |
| **Ricaricamento pagina** | Sì (ogni navigazione)                 | No                             |
| **Prestazioni**          | Più lente (nuova richiesta e parsing) | Più veloci (solo update DOM)   |
| **Stato applicazione**   | Si perde tra pagine                   | Rimane in memoria              |
| **SEO**                  | Gestito dal server                    | Necessita SSR o routing ibrido |
| **Gestione logica**      | Basata su file HTML                   | Basata su componenti React     |

---

### 1.5 Come React Router usa la History API “dietro le quinte”

Capire cosa accade internamente è cruciale per ottimizzare il comportamento del router.
Quando scriviamo:

```tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/about">Chi siamo</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
```

Ecco cosa succede **passo dopo passo**:

1. `<BrowserRouter>` crea un **listener sull’History API**: ascolta i cambiamenti di URL.
2. Quando clicchiamo `<Link to="/about">`, **non viene inviata nessuna richiesta al server**.
   React Router chiama internamente `history.pushState(null, "", "/about")`.
3. Il listener del router intercetta questo cambiamento e aggiorna l’oggetto `location` interno.
4. `Routes` verifica tutte le `<Route>` e cerca quella il cui `path` corrisponde al nuovo `location.pathname`.
5. Il componente associato viene renderizzato senza ricaricare la pagina e senza perdere lo stato globale o locale dell’app.

---

### 1.6 Perché è importante capire questa logica

Molti sviluppatori si limitano a usare `<Route>` e `<Link>` senza sapere cosa accade dietro.
Capire il funzionamento della History API e come React Router costruisce la navigazione ti permette di:

* **Debuggare comportamenti strani** (es. URL che cambia ma UI no)
* **Ottimizzare prestazioni** evitando render inutili
* **Gestire casi complessi** (es. modali con routing, query dinamiche, SSR)
* **Scrivere codice più prevedibile e robusto**

---

###  Best practice iniziali

* Usare sempre `<Link>` invece di `<a href>` per evitare ricaricamenti completi.
* Non manipolare direttamente `window.history` se non sai cosa stai facendo: lascia che lo gestisca React Router.
* Mantieni l’URL come **fonte di verità** per rappresentare lo stato di navigazione dell’app.
* Non pensare al router come a un semplice switch tra componenti: è un sistema di gestione dello **stato di navigazione**.

---

































## 1.2 Installazione e Setup: `react-router-dom`, `BrowserRouter` vs `HashRouter`

Dopo aver compreso cos’è un router in una Single Page Application e come funziona a livello di browser, il passo successivo è imparare a configurare correttamente React Router nel nostro progetto. Questa fase, apparentemente banale, è in realtà fondamentale per evitare errori architetturali e garantire che la navigazione sia stabile, performante e scalabile.

---

### 1.2.1 Installazione di React Router

React Router è una libreria esterna sviluppata dal team di Remix e non fa parte del core di React. Per usarla, è necessario installare il pacchetto dedicato al DOM (esiste anche una versione per React Native, ma qui ci concentreremo sulle applicazioni web):

```bash
npm install react-router-dom
```

oppure con Yarn:

```bash
yarn add react-router-dom
```

Questa libreria fornisce tutti i componenti e gli hook necessari per implementare il routing, tra cui:

* `BrowserRouter` e `HashRouter`: router principali che gestiscono l’URL
* `Routes` e `Route`: definiscono la mappa delle pagine
* `Link` e `NavLink`: permettono la navigazione client-side
* `useNavigate`, `useParams`, `useLocation`: hook per gestire e leggere lo stato di navigazione

---

### 1.2.2 Inizializzare il router nel progetto

Il primo passo in ogni applicazione React è avvolgere la root del progetto con un router. Il più comune è `BrowserRouter`, che utilizza la **History API** del browser.

Esempio base di configurazione:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

Questo approccio crea un "contesto di navigazione" globale, che verrà utilizzato da tutti i componenti figli per leggere e modificare l’URL senza ricaricare la pagina.

---

### 1.2.3 `BrowserRouter` – Routing moderno basato sulla History API

`BrowserRouter` è l’implementazione più comune e consigliata.
Utilizza direttamente la History API (`pushState` e `replaceState`) per aggiornare l’URL e per intercettare i cambiamenti di navigazione.

**Vantaggi:**

* URL puliti e leggibili, senza simboli extra (`/dashboard`, `/users/42`)
* SEO-friendly (quando combinato con SSR o fallback lato server)
* Supporta nativamente la navigazione tramite pulsanti avanti/indietro del browser
* Comportamento identico a un’app web tradizionale dal punto di vista dell’utente

**Svantaggi:**

* Richiede configurazione lato server: tutte le richieste (anche quelle per `/users/42`) devono essere reindirizzate a `index.html`
  Se il server non è configurato correttamente, l’utente otterrà un errore 404 ricaricando una pagina diversa dalla root.
* Non funziona correttamente se l’app è servita da file statici locali (`file://`), ad esempio in contesti offline o prototipali.

**Quando usarlo:**

* In tutte le applicazioni React distribuite su un server web moderno (ad esempio Vercel, Netlify, Nginx, Apache).
* Quando si desidera un URL "pulito" e coerente con lo standard web.
* In applicazioni che potrebbero in futuro beneficiare di SSR, SEO o routing ibrido.

---

### 1.2.4 `HashRouter` – Routing basato su anchor `#`

`HashRouter` rappresenta un approccio alternativo che non utilizza la History API. Invece, sfrutta l’ancora (`#`) dell’URL per simulare la navigazione, ad esempio:

```
http://example.com/#/dashboard
```

Il contenuto dopo `#` non viene mai inviato al server: è gestito interamente dal browser, che non ricarica la pagina e non effettua nuove richieste.

**Vantaggi:**

* Non richiede alcuna configurazione lato server: ogni percorso dopo il `#` è trasparente per il backend.
* Funziona anche in contesti statici o offline (ad esempio con `file://` o da un disco locale).
* Più semplice da usare in ambienti dove non si ha controllo sul server (ad esempio GitHub Pages).

**Svantaggi:**

* URL meno puliti e meno leggibili (`/#/users/42` invece di `/users/42`).
* Meno adatto per SEO (i motori di ricerca ignorano o gestiscono diversamente gli anchor).
* Limitato in contesti enterprise o di produzione dove è richiesta una struttura URL standard.

**Quando usarlo:**

* In prototipi, demo, app interne o documentazioni che devono funzionare senza server.
* Quando l’applicazione viene distribuita su piattaforme statiche e non è possibile configurare il backend.
* In casi specifici dove l’URL non ha impatto su SEO o user experience.

---

### 1.2.5 Differenze chiave a confronto

| Caratteristica              | `BrowserRouter`         | `HashRouter`        |
| --------------------------- | ----------------------- | ------------------- |
| URL pulito                  | Sì (`/dashboard`)       | No (`/#/dashboard`) |
| Configurazione server       | Necessaria              | Nessuna             |
| Supporto SEO                | Sì (con SSR o fallback) | No                  |
| Supporto locale/offline     | Limitato                | Sì                  |
| Utilizzo History API        | Sì                      | No                  |
| Compatibilità retro-browser | Limitata                | Alta                |

---

### 1.2.6 Best practice di configurazione

* **Produzione**: utilizzare `BrowserRouter` e configurare il server per reindirizzare tutte le richieste a `index.html`.

  * In Nginx, ad esempio:

    ```nginx
    location / {
      try_files $uri /index.html;
    }
    ```
* **Prototipazione o ambienti statici**: utilizzare `HashRouter` per evitare problemi di routing.
* **Routing ibrido**: in rari casi è possibile combinare i due approcci, ma è sconsigliato se non strettamente necessario.

---










































## 1. Introduzione al concetto di routing dichiarativo

### 1.1 Routing imperativo vs routing dichiarativo

Prima di scrivere una singola riga di codice con React Router, è importante capire **il paradigma su cui si basa**: la **dichiaratività**.
Il routing può infatti essere gestito secondo due approcci molto diversi:

#### Routing imperativo

Nel modello imperativo, siamo **noi sviluppatori a dire esplicitamente cosa fare passo per passo** quando cambia la navigazione.
Ad esempio, in un’applicazione vanilla JavaScript potremmo scrivere:

```js
// Esempio imperativo
if (window.location.pathname === "/about") {
  renderAboutPage()
} else if (window.location.pathname === "/contact") {
  renderContactPage()
}
```

Qui la logica è manuale: leggiamo l’URL, lo confrontiamo e scegliamo quale componente renderizzare.
Questo approccio è fragile, difficile da mantenere e cresce male con l’aumentare delle rotte. Inoltre, sposta su di noi tutta la responsabilità della gestione dello stato di navigazione.

---

#### Routing dichiarativo

Il modello dichiarativo, invece, **non descrive “come” navigare ma “cosa” mostrare** in base all’URL.
In altre parole, definiamo una **mappa di corrispondenze** tra percorso e componente, e lasciamo alla libreria il compito di orchestrare tutto.

In React Router questa mappa è rappresentata da:

* `<Routes>`: un contenitore che analizza l’URL corrente e trova la rotta migliore da renderizzare.
* `<Route>`: ogni singola regola di corrispondenza tra un `path` e un componente.

Esempio minimale:

```tsx
import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}
```

In questo caso **non abbiamo scritto nessuna logica condizionale**.
Abbiamo semplicemente dichiarato:

* “Se l’URL è `/`, mostra `<Home />`”
* “Se l’URL è `/about`, mostra `<About />`”

Il router si occupa del resto:

* Analizza automaticamente l’URL corrente
* Calcola quale `<Route>` è quella corretta
* Monta e smonta i componenti necessari
* Aggiorna la UI al cambio dell’URL

---

### 1.2 Il ruolo di `<Routes>` e `<Route>` nel sistema di navigazione

Il cuore del sistema di routing di React è costituito da due componenti:

#### `<Routes>`

* È un **contenitore logico** per tutte le rotte della tua applicazione.
* Al suo interno React Router esegue il **matching** dell’URL corrente con tutti i percorsi dichiarati.
* Gestisce **priorità e specificità**: non importa l’ordine in cui le rotte sono scritte, sarà sempre scelta quella più precisa.
* Garantisce che **solo una rotta venga renderizzata** per ogni percorso (a differenza di versioni precedenti o altre librerie).

#### `<Route>`

* Rappresenta **una singola regola di routing**.
* Ha due proprietà principali:

  * `path`: il percorso dell’URL da intercettare (`"/"`, `"/about"`, `"/users/:id"`…)
  * `element`: il componente React da renderizzare quando il percorso corrisponde

Ogni `<Route>` è quindi una “dichiarazione” di comportamento:

> “Quando il percorso corrisponde a `X`, mostra il componente `Y`.”

---

### 1.3 Perché preferire il routing dichiarativo

Capire la filosofia dietro questo approccio è essenziale per scrivere codice React idiomatico:

* **Migliore leggibilità**: la mappa delle rotte diventa una rappresentazione diretta dell’architettura dell’applicazione.
* **Manutenibilità**: aggiungere o modificare una pagina significa aggiungere o cambiare una riga dichiarativa, senza riscrivere logica condizionale.
* **Coerenza con l’approccio React**: come per JSX, dove dichiariamo “cosa vogliamo vedere” e React gestisce il DOM, con React Router dichiariamo “cosa mostrare per ogni URL” e la libreria gestisce il resto.
* **Estensibilità**: funzionalità più avanzate (rotte dinamiche, nested, lazy loading, loader, ecc.) si integrano senza cambiare il paradigma di base.

---

### 1.4 Concetto chiave

Il routing dichiarativo **non è semplicemente una sintassi più comoda**, ma un cambio di mentalità:

* Non ci interessa **come** arriviamo a un componente, ma **quando** deve essere mostrato.
* Non diciamo al router cosa fare passo dopo passo: **dichiariamo le regole** e lasciamo che sia lui a decidere.

---





























## 2. Creazione di rotte statiche di base

Una volta compreso il concetto di **routing dichiarativo**, il passo successivo è imparare a definire le prime rotte reali della nostra applicazione. L’obiettivo di questa sezione è costruire un sistema di navigazione semplice e stabile, in cui ogni URL sia collegato direttamente a un componente React.

---

### 2.1 Struttura minima con `<Routes>` e `<Route>`

Il router di React si basa su due elementi fondamentali:

* `<Routes>`: è il **contenitore** di tutte le rotte. Analizza l’URL corrente e decide quale rotta deve essere renderizzata.
* `<Route>`: definisce la **corrispondenza** tra un `path` e un componente. Quando l’URL corrisponde al `path` dichiarato, React Router renderizza il componente specificato nella prop `element`.

Esempio minimale di configurazione:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

In questo esempio accadono alcune cose importanti:

1. `<BrowserRouter>` inizializza il contesto di navigazione e collega React Router alla History API del browser.
2. `<Routes>` contiene l’elenco delle rotte da valutare.
3. `<Route>` definisce le regole:

   * `path="/"` → renderizza `<HomePage />` quando l’URL è esattamente `/`
   * `path="/about"` → renderizza `<AboutPage />` quando l’URL è `/about`

Il router si occuperà automaticamente di:

* Analizzare l’URL
* Trovare la corrispondenza più specifica
* Montare e smontare i componenti necessari

---

### 2.2 Mapping URL → Componente

L’obiettivo principale del routing è **mappare ogni percorso dell’applicazione a un componente specifico**. In un’app reale, ogni URL rappresenta una vista distinta o una sezione logica.

Esempio di mappa più completa:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/services" element={<ServicesPage />} />
</Routes>
```

| URL richiesto | Componente renderizzato |
| ------------- | ----------------------- |
| `/`           | `<HomePage />`          |
| `/about`      | `<AboutPage />`         |
| `/contact`    | `<ContactPage />`       |
| `/services`   | `<ServicesPage />`      |

Questa mappatura diventa la “struttura logica” dell’applicazione: ogni rotta rappresenta una pagina, e ogni pagina è un componente React.

---

### 2.3 Comportamento del router “dietro le quinte”

Capire cosa accade internamente aiuta a progettare rotte più prevedibili:

1. React Router ascolta i cambiamenti dell’URL tramite la History API.
2. Quando l’utente visita o naviga verso un nuovo percorso, `<Routes>` confronta l’URL corrente con tutti i `path` dichiarati.
3. Viene scelto il percorso **più specifico e coerente** con l’URL.
4. React Router renderizza il componente associato alla `<Route>` selezionata.

Questa logica funziona in modo **reattivo**: ogni volta che cambia l’URL, React Router esegue automaticamente un nuovo matching e aggiorna la UI senza ricaricare la pagina.

---

### 2.4 Best practice iniziali

* Mantieni i percorsi **coerenti e semantici**. I path dovrebbero riflettere il contenuto (`/about`, `/products`, `/contact`).
* Utilizza sempre lettere minuscole e trattini per separare le parole (`/user-profile` invece di `/UserProfile`).
* Definisci prima le rotte principali dell’applicazione e costruisci la navigazione intorno a esse.
* Separa i componenti delle pagine in una cartella dedicata (`/pages`) per mantenere la struttura chiara e scalabile.
























## 3. Catch-all e gestione 404

Quando si costruisce un sistema di routing, un elemento spesso trascurato ma essenziale è la **gestione delle rotte non riconosciute**. In qualsiasi applicazione reale è inevitabile che l’utente possa digitare un URL errato, seguire un link non aggiornato o arrivare da un bookmark obsoleto.
Per evitare di mostrare una schermata vuota o un errore generico del browser, dobbiamo intercettare questi casi e fornire una **pagina 404** chiara e utile.

---

### 3.1 Utilizzo di `path="*"` per gestire percorsi non riconosciuti

React Router offre un meccanismo molto semplice e potente per catturare **tutti i percorsi che non corrispondono a nessuna rotta definita**: utilizzare il carattere jolly `*` nel `path`.

Questo tipo di rotta è chiamato **catch-all route**.

Esempio:

```tsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Catch-all: deve essere sempre l’ultima */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

Cosa succede:

* React Router tenta di trovare una corrispondenza tra l’URL e le rotte dichiarate.
* Se nessuna `<Route>` corrisponde, esegue quella con `path="*"`.
* Viene quindi renderizzato il componente `NotFoundPage`, che rappresenta la pagina 404.

> **Importante:** nonostante l’ordine delle `<Route>` non sia fondamentale (il router usa un algoritmo di specificità), è buona pratica posizionare la catch-all **alla fine** per mantenere leggibile il codice.

---

### 3.2 Strutturare una pagina 404 efficace

Una pagina 404 non è semplicemente un messaggio d’errore: è un punto cruciale dell’esperienza utente. Deve informare l’utente dell’errore e allo stesso tempo **guidarlo verso un percorso utile**.

Esempio semplice di implementazione:

```tsx
export default function NotFoundPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Pagina non trovata</h1>
      <p>La pagina che stai cercando potrebbe essere stata rimossa o non esistere.</p>
      <a href="/">Torna alla home</a>
    </div>
  );
}
```

---

### 3.3 Best practice per la pagina 404

Una pagina 404 ben progettata deve soddisfare **tre obiettivi principali**:

1. **Informare chiaramente l’utente:**
   Il messaggio deve essere chiaro, diretto e comprensibile. Evita frasi vaghe come “Errore” o “Qualcosa è andato storto” e specifica che la pagina richiesta non esiste.

2. **Offrire percorsi alternativi:**
   Fornire link utili è essenziale per evitare che l’utente abbandoni il sito. Alcune opzioni comuni:

   * Link alla homepage
   * Link alle sezioni principali (es. “Vai ai prodotti”, “Torna al blog”)
   * Un campo di ricerca per trovare il contenuto desiderato

3. **Mantenere coerenza visiva:**
   La pagina 404 deve avere lo stesso layout e stile del resto dell’applicazione. Non deve sembrare “esterna” o improvvisata.
   In applicazioni più grandi, è consigliabile includerla nello stesso layout globale (header, footer, tema, ecc.).

---

### 3.4 Pattern comuni e suggerimenti pratici

* **Posizionare sempre `path="*"`** come ultima rotta per chiarezza e convenzione.
* **Non usare redirect automatici** alla home: può confondere l’utente e nascondere l’errore. Meglio una pagina informativa con link chiari.
* **Personalizzare il contenuto** in base al contesto. Ad esempio:

  * Se l’utente è autenticato, mostra link a sezioni riservate.
  * Se l’URL include parametri errati (`/users/9999`), suggerisci di tornare alla lista utenti.
* **Tracciare le visite alla 404**: in applicazioni professionali, registrare queste pagine nei log o in un sistema di analytics può aiutare a scoprire link rotti o problemi di navigazione.

---

### 3.5 Checklist operativa

Prima di considerare “completo” il sistema di routing, verifica di aver seguito questi punti:

* [ ] Hai definito una rotta `path="*"` per intercettare tutti i percorsi non riconosciuti.
* [ ] La tua pagina 404 comunica chiaramente che la pagina non esiste.
* [ ] Sono presenti link o call-to-action utili per tornare alla navigazione normale.
* [ ] La pagina mantiene lo stile e il layout dell’applicazione.
* [ ] Eventuali errori 404 vengono tracciati per analisi successive.

---
























## 4. Rotte dinamiche con parametri (`:id`)

Nelle applicazioni reali, non tutte le rotte sono statiche. Spesso dobbiamo gestire **contenuti dinamici**: ad esempio, mostrare la scheda di un utente specifico (`/users/42`), il dettaglio di un prodotto (`/products/123`) o un articolo di blog (`/posts/react-router-intro`).
Per farlo, React Router ci permette di definire **segmenti di percorso variabili** tramite i **parametri dinamici**.

---

### 4.1 Creazione di percorsi con segmenti variabili

Per definire una rotta dinamica, basta utilizzare la sintassi `:nomeParametro` all’interno del `path` di `<Route>`.
Il valore effettivo verrà catturato dall’URL e reso disponibile al componente associato.

Esempio di routing dinamico per la pagina di dettaglio di un utente:

```tsx
import { Routes, Route } from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/users" element={<UsersPage />} />
      <Route path="/users/:id" element={<UserDetailPage />} />
    </Routes>
  );
}
```

In questo esempio:

* `/users` → mostra la lista degli utenti (`<UsersPage />`)
* `/users/42` → mostra il dettaglio dell’utente con ID `42` (`<UserDetailPage />`)

Il segmento `:id` rappresenta un **parametro dinamico**: qualsiasi valore nella posizione `:id` verrà catturato e passato al componente.

---

### 4.2 Lettura dei parametri con `useParams`

Per accedere ai valori dei parametri dinamici all’interno del componente, si utilizza l’hook `useParams()` fornito da React Router.

Esempio:

```tsx
import { useParams } from "react-router-dom";

export default function UserDetailPage() {
  const params = useParams();
  return <h1>Dettagli utente: {params.id}</h1>;
}
```

Se l’URL è `/users/42`, `params.id` conterrà la stringa `"42"`.

Alcune note importanti:

* **I parametri sono sempre stringhe**, indipendentemente dal loro contenuto.
* Se il percorso non è corretto (es. `/users/` senza ID), `params.id` sarà `undefined`.
* È buona norma gestire sempre il caso `undefined` per evitare errori runtime.

---

### 4.3 Validazione e tipizzazione dei parametri in TypeScript

Poiché i parametri arrivano come stringhe (e potenzialmente `undefined`), è fondamentale **tipizzarli correttamente** e, quando necessario, **validarli**.

#### Tipizzazione con generics

L’hook `useParams` accetta un tipo generico che rappresenta la forma dei parametri attesi:

```tsx
import { useParams } from "react-router-dom";

type UserParams = {
  id: string;
};

export default function UserDetailPage() {
  const { id } = useParams<UserParams>();
  return <h1>Dettagli utente: {id}</h1>;
}
```

Così facendo:

* `id` sarà tipizzato come `string | undefined` (perché React Router non può garantire che il parametro sia sempre presente).
* TypeScript ci obbligherà a gestire il caso `undefined`.

---

#### Validazione del parametro

Poiché i parametri provengono dalla stringa dell’URL, è buona pratica **verificarne il formato** prima di usarli. Ad esempio, se ci aspettiamo un numero:

```tsx
import { useParams } from "react-router-dom";

type UserParams = { id: string };

export default function UserDetailPage() {
  const { id } = useParams<UserParams>();

  if (!id || isNaN(Number(id))) {
    return <p>ID non valido</p>;
  }

  const userId = Number(id);

  return <h1>Dettagli utente con ID: {userId}</h1>;
}
```

Esempio con validazione più avanzata (UUID o slug):

```tsx
function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
}

if (!id || !isValidUUID(id)) {
  return <p>Parametro non valido</p>;
}
```

---

### 4.4 Utilizzo di più parametri dinamici

Puoi definire più segmenti dinamici nella stessa rotta.
Esempio: dettaglio di un prodotto all’interno di una categoria:

```tsx
<Route path="/categories/:categoryId/products/:productId" element={<ProductPage />} />
```

Lettura dei parametri:

```tsx
const { categoryId, productId } = useParams<{
  categoryId: string;
  productId: string;
}>();
```

---

### 4.5 Quando usare parametri dinamici

I parametri dinamici sono particolarmente utili quando l’URL rappresenta **una risorsa specifica**, ad esempio:

* `/users/:id` → dettaglio utente
* `/products/:id` → scheda prodotto
* `/posts/:slug` → articolo del blog
* `/courses/:courseId/lessons/:lessonId` → lezione specifica di un corso

In generale, è buona pratica usarli quando:

* Il contenuto varia in base a un identificativo univoco
* L’URL deve essere condivisibile e leggibile
* L’applicazione deve essere REST-like o SEO-friendly

---

### 4.6 Best practice

* **Sempre validare i parametri** prima di utilizzarli, soprattutto se rappresentano ID numerici o formati specifici.
* **Tipizzare `useParams`** in TypeScript per evitare errori di runtime.
* **Gestire il caso `undefined`** in modo esplicito: non assumere mai che il parametro esista.
* Se un parametro è opzionale, valuta di definire due rotte separate (una con e una senza parametro) oppure usare un comportamento di fallback.

---


























## 5. Rotte annidate e layout condivisi

Quando un’applicazione React cresce, è comune dover gestire **sezioni complesse composte da più sottopagine** — ad esempio una dashboard con diverse viste interne (`/dashboard/overview`, `/dashboard/users`, `/dashboard/settings`) oppure un’area utente con sottosezioni (`/account/profile`, `/account/orders`, ecc.).
In questi casi diventa inefficiente definire ogni pagina come rotta indipendente: è molto più pulito e scalabile **organizzare le rotte in modo gerarchico**, sfruttando le **rotte annidate** e i **layout condivisi**.

---

### 5.1 Concetto di routing annidato

Il routing annidato (nested routing) permette di definire **rotte figlie all’interno di una rotta padre**.
Questo significa che un componente “layout” può rimanere costante mentre cambiano solo le sotto-sezioni interne. È uno dei meccanismi più potenti di React Router perché consente:

* Riutilizzo di layout comuni (sidebar, header, footer, breadcrumb)
* Struttura URL chiara e gerarchica
* Separazione delle responsabilità e codice più modulare

---

### 5.2 Uso di `<Outlet>` per rendere componenti figli

Il componente chiave per implementare le rotte annidate è `<Outlet>`.
`<Outlet>` è un **placeholder** che rappresenta il punto in cui React Router renderizzerà la rotta figlia corrispondente all’URL.

Esempio: dashboard con layout condiviso

```tsx
// DashboardLayout.tsx
import { Outlet, NavLink } from "react-router-dom";

export function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside>
        <nav>
          <NavLink to="">Overview</NavLink>
          <NavLink to="users">Utenti</NavLink>
          <NavLink to="settings">Impostazioni</NavLink>
        </nav>
      </aside>
      <main>
        <Outlet /> {/* Qui verrà renderizzata la rotta figlia */}
      </main>
    </div>
  );
}
```

Configurazione delle rotte:

```tsx
import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
```

Cosa succede qui:

* `/dashboard` → renderizza `DashboardLayout` + `OverviewPage`
* `/dashboard/users` → renderizza `DashboardLayout` + `UsersPage`
* `/dashboard/settings` → renderizza `DashboardLayout` + `SettingsPage`

Il componente `DashboardLayout` **rimane sempre montato** mentre cambia solo il contenuto dentro `<Outlet>`.

---

### 5.3 Index route: la pagina predefinita di un segmento

In un gruppo di rotte annidate è comune voler definire **una pagina di default** quando l’utente visita il percorso padre senza specificare sottosezioni.

Per questo si utilizza la proprietà speciale `index`:

```tsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<OverviewPage />} />     // default
  <Route path="users" element={<UsersPage />} />
  <Route path="settings" element={<SettingsPage />} />
</Route>
```

* Quando l’utente visita `/dashboard`, React Router renderizza `OverviewPage`.
* Quando visita `/dashboard/users`, renderizza `UsersPage`.

Senza una `index route`, visitare `/dashboard` non renderizzerebbe nessuna pagina figlia (a meno di gestirlo manualmente).

---

### 5.4 Strutturazione gerarchica di rotte complesse

Il vero vantaggio delle rotte annidate si manifesta in applicazioni di grandi dimensioni.
Si possono creare strutture multilivello in modo chiaro e leggibile:

```tsx
<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<OverviewPage />} />
    <Route path="users" element={<UsersLayout />}>
      <Route index element={<UsersList />} />
      <Route path=":id" element={<UserDetail />} />
      <Route path=":id/edit" element={<EditUser />} />
    </Route>
    <Route path="settings" element={<SettingsPage />} />
  </Route>
</Routes>
```

Questa struttura genera percorsi come:

* `/dashboard/users` → lista utenti
* `/dashboard/users/42` → dettaglio utente 42
* `/dashboard/users/42/edit` → form di modifica
* `/dashboard/settings` → impostazioni

Ogni livello può avere il proprio layout, i propri componenti condivisi e il proprio `<Outlet>`.

---

### 5.5 Best practice per il routing annidato

* **Un layout per sezione logica:** crea layout dedicati per aree distinte (es. dashboard, profilo utente, area admin).
* **Non duplicare layout comuni:** evita di re-importare header/footer in ogni pagina, usa un layout padre e `<Outlet>`.
* **Mantieni le URL semantiche:** ogni livello dovrebbe rappresentare un’entità logica (es. `/users/:id/edit` è più leggibile di `/editUser?id=42`).
* **Gestisci le `index route` con cura:** definisci sempre una rotta di default nei segmenti principali per evitare pagine vuote.
* **Rendi le sezioni modulari:** raggruppa rotte, componenti e layout di ogni sezione in una propria cartella per mantenere l’architettura scalabile.

---

### 5.6 Quando usare le rotte annidate

Usale ogni volta che:

* Vuoi mantenere un **layout persistente** mentre cambia il contenuto centrale.
* L’app è organizzata in sezioni con più sottopagine.
* Vuoi gestire **entità relazionate** (lista → dettaglio → modifica).
* Devi costruire una gerarchia di percorsi REST-like (`/projects/:id/tasks/:taskId`).

---






























## 6. Pattern comuni con rotte dinamiche

L’uso dei parametri dinamici è uno degli strumenti più potenti di React Router perché consente di creare URL significativi e strutturati in modo REST-like. Tuttavia, nei progetti reali, i parametri vengono quasi sempre utilizzati secondo **pattern ricorrenti**: conoscere questi pattern permette di progettare rotte **leggibili, scalabili e prevedibili** fin dalle prime fasi di sviluppo.

In questa sezione analizziamo i due più comuni:

1. **Lista + dettaglio** – il caso più classico, utilizzato in CRUD, cataloghi, dashboard e blog.
2. **Statico vs dinamico** – un pattern fondamentale per evitare conflitti tra segmenti fissi e parametri variabili.

---

### 6.1 Pattern “Lista e dettaglio”

Il caso d’uso più frequente di una rotta dinamica è quello che collega una **lista di elementi** con la relativa **pagina di dettaglio**.

**Obiettivo:**

* `/users` → mostra la lista di tutti gli utenti
* `/users/42` → mostra il dettaglio dell’utente con ID `42`

#### Esempio pratico

```tsx
import { Routes, Route } from "react-router-dom";
import UsersListPage from "./pages/UsersListPage";
import UserDetailPage from "./pages/UserDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/users" element={<UsersListPage />} />
      <Route path="/users/:id" element={<UserDetailPage />} />
    </Routes>
  );
}
```

**Struttura URL risultante:**

* `/users` → lista
* `/users/17` → dettaglio utente 17
* `/users/abc123` → dettaglio utente con ID `abc123`

---

#### Navigazione dalla lista al dettaglio

Generalmente si naviga dalla lista al dettaglio tramite un link costruito dinamicamente:

```tsx
// UsersListPage.tsx
import { Link } from "react-router-dom";

export default function UsersListPage() {
  const users = [
    { id: "1", name: "Mario Rossi" },
    { id: "2", name: "Luca Bianchi" }
  ];

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <Link to={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```

All’interno della pagina di dettaglio si recupera l’`id` con `useParams()`:

```tsx
// UserDetailPage.tsx
import { useParams } from "react-router-dom";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <h1>Dettagli utente ID: {id}</h1>;
}
```

---

#### Miglioramenti consigliati

* **Gestione degli errori:** mostra un messaggio chiaro se l’`id` non è valido o l’elemento non esiste.
* **Breadcrumb:** facilita la navigazione indietro verso la lista.
* **URL leggibili:** se possibile, usa slug descrittivi (`/users/mario-rossi`) invece di ID numerici.

---

### 6.2 Pattern “Statico vs dinamico” (`/new` vs `/:id`)

Un altro scenario molto frequente è la necessità di combinare **segmenti statici** e **segmenti dinamici** nello stesso livello di routing.
Il caso più classico: una pagina di creazione (`/new`) e una pagina di dettaglio (`/:id`).

**Problema:** se dichiariamo solo la rotta dinamica, l’URL `/users/new` verrà interpretato come `id = "new"`.
**Soluzione:** dichiarare esplicitamente la rotta statica.

---

#### Esempio corretto

```tsx
<Routes>
  <Route path="/users" element={<UsersListPage />} />
  <Route path="/users/new" element={<NewUserPage />} />
  <Route path="/users/:id" element={<UserDetailPage />} />
</Routes>
```

**Comportamento:**

* `/users` → lista utenti
* `/users/new` → form di creazione utente
* `/users/42` → dettaglio utente con ID `42`

Grazie alla regola di **specificità** del router (i path statici vincono su quelli dinamici), la rotta `/new` verrà scelta correttamente senza entrare in conflitto con `/:id`.

---

#### Best practice di progettazione

* **Dichiara sempre prima la rotta statica**, anche se l’ordine non è determinante per React Router v6: migliora la leggibilità e previene errori futuri.
* **Evita nomi ambigui** per i segmenti dinamici (es. `/users/create` se usi anche `:id`, perché “create” potrebbe sembrare un ID valido).
* **Pianifica le rotte a lungo termine:** se prevedi di aggiungere nuove pagine statiche (es. `/users/stats` o `/users/import`), riservale fin da subito.

---

### 6.3 Altri casi comuni derivati

Oltre ai due pattern principali, nella pratica troverai anche combinazioni derivate:

* **Dettaglio con azioni:**

  * `/users/:id/edit`
  * `/users/:id/delete`
* **Risorse annidate:**

  * `/projects/:projectId/tasks/:taskId`
* **Filtri o sezioni secondarie:**

  * `/products/:id/reviews`
  * `/products/:id/specs`

Questi pattern seguono sempre la stessa logica di base: **segmenti statici più specifici vincono sui dinamici**, e la struttura dell’URL deve riflettere la gerarchia dei dati o delle azioni.

---

### 6.4 Riepilogo e raccomandazioni

* Il pattern **lista + dettaglio** è la base del routing REST-like e va utilizzato ogni volta che esistono entità replicabili (utenti, prodotti, articoli…).
* Quando mixi statici e dinamici, dichiara sempre **prima i percorsi statici** per evitare conflitti.
* Mantieni i percorsi **descrittivi e semantici**: l’URL deve raccontare chiaramente cosa rappresenta.
* Pensa alla **scalabilità futura**: aggiungere nuove rotte statiche o sottosezioni non deve rompere quelle dinamiche già esistenti.

---





























# ESEMPIO

---

# Struttura file

```
src/
  app/
    store.ts
    hooks.ts
  features/
    items/
      itemsSlice.ts
      selectors.ts
  pages/
    ItemsListPage.tsx
    ItemDetailPage.tsx
    NewItemPage.tsx
  routes/
    AppRoutes.tsx
  main.tsx
```

---

## `src/app/store.ts`

```ts
import { configureStore } from '@reduxjs/toolkit';
import itemsReducer from '@/features/items/itemsSlice';

export const store = configureStore({
  reducer: {
    items: itemsReducer,
  },
  // middleware: (getDefault) => getDefault().concat(customMiddleware) // se ti serve
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## `src/app/hooks.ts`

```ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## `src/features/items/itemsSlice.ts`

```ts
import { createSlice, createEntityAdapter, nanoid, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

export interface Item {
  id: string;
  title: string;
  note?: string;
  createdAt: number;
}

const itemsAdapter = createEntityAdapter<Item>({
  sortComparer: (a, b) => b.createdAt - a.createdAt, // più recenti in alto
});

const initialState = itemsAdapter.getInitialState();

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    addItem: {
      prepare: (title: string, note?: string) => ({
        payload: { id: nanoid(), title, note, createdAt: Date.now() } as Item,
      }),
      reducer: (state, action: PayloadAction<Item>) => {
        itemsAdapter.addOne(state, action.payload);
      },
    },
    updateItem: (state, action: PayloadAction<Pick<Item, 'id' | 'title' | 'note'>>) => {
      const { id, title, note } = action.payload;
      itemsAdapter.updateOne(state, { id, changes: { title, note } });
    },
    removeItem: (state, action: PayloadAction<string>) => {
      itemsAdapter.removeOne(state, action.payload);
    },
    upsertMany: (state, action: PayloadAction<Item[]>) => {
      itemsAdapter.upsertMany(state, action.payload);
    },
  },
});

export const { addItem, updateItem, removeItem, upsertMany } = itemsSlice.actions;
export default itemsSlice.reducer;

// Selectors base
const selectors = itemsAdapter.getSelectors<RootState>((s) => s.items);
export const selectAllItems = selectors.selectAll;
export const selectItemById = selectors.selectById;
export const selectItemsIds = selectors.selectIds;
```

> Nota: in un progetto reale puoi separare i selector in un file dedicato; qui li esponiamo dal slice per brevità.














## Spiegazione

```ts
reducers: {
  addItem: {
    prepare: (title: string, note?: string) => ({
      payload: { id: nanoid(), title, note, createdAt: Date.now() } as Item,
    }),
    reducer: (state, action: PayloadAction<Item>) => {
      itemsAdapter.addOne(state, action.payload);
    },
  },
},
```

---

## 1. Cos’è questa struttura

Questa è la definizione di un **reducer con funzione `prepare`** all’interno di uno `slice` di Redux Toolkit.

Normalmente, un reducer viene dichiarato così:

```ts
reducers: {
  addItem: (state, action: PayloadAction<Item>) => {
    // ...
  }
}
```

Ma Redux Toolkit offre una **forma avanzata** quando vogliamo **costruire l’`action.payload` all’interno del reducer stesso** invece di farlo nel componente.
Questa forma è utile per creare dati **in modo coerente, centralizzato e tipizzato** — ad esempio quando dobbiamo generare un `id`, aggiungere timestamp, validare i dati o applicare trasformazioni.

---

## 2. Breakdown: funzione `prepare`

```ts
prepare: (title: string, note?: string) => ({
  payload: { id: nanoid(), title, note, createdAt: Date.now() } as Item,
}),
```

* `prepare` è una funzione opzionale che serve a **preparare l’azione prima che arrivi al reducer vero e proprio**.
* Riceve come parametri **gli stessi argomenti** che passeremo quando dispatchiamo l’azione (`dispatch(addItem("Titolo", "Nota"))`).
* Deve restituire **un oggetto con almeno la proprietà `payload`**.

Vediamo cosa fa riga per riga:

* `(title: string, note?: string)` → la funzione accetta i dati necessari per creare un nuovo `Item`.
* `id: nanoid()` → genera un ID univoco direttamente qui (in modo da non delegarlo al componente o alla view).
* `createdAt: Date.now()` → aggiunge il timestamp di creazione automaticamente.
* `payload: {...}` → costruisce il payload esattamente nel formato definito dall’interfaccia `Item`.

 **Vantaggi:**

* Il componente non deve preoccuparsi di creare un oggetto completo.
* Evitiamo duplicazione e possibili errori nella creazione degli oggetti.
* Centralizziamo la logica di creazione: se domani vogliamo aggiungere un campo, modifichiamo solo qui.

---

## 3. Breakdown: funzione `reducer`

```ts
reducer: (state, action: PayloadAction<Item>) => {
  itemsAdapter.addOne(state, action.payload);
},
```

* Questa è la funzione reducer vera e propria.
* Viene eseguita **dopo** la `prepare`, quindi riceve un `action` già formattato correttamente con un `payload` di tipo `Item`.

Parametri:

* `state` → lo stato attuale della slice (immutabile grazie a **Immer**, quindi possiamo scrivere operazioni mutanti).
* `action` → l’azione generata automaticamente da Redux Toolkit (`type: "items/addItem"`, `payload: {...}`).

La logica qui è semplice:

```ts
itemsAdapter.addOne(state, action.payload);
```

* `itemsAdapter` è un `createEntityAdapter` che fornisce metodi ottimizzati per modificare lo stato normalizzato.
* `addOne` aggiunge un nuovo elemento all’interno dello stato, usando l’`id` come chiave e il resto dell’oggetto come valore.

Questo metodo:

* Aggiorna automaticamente `state.entities` e `state.ids`
* Gestisce l’inserimento in modo efficiente e coerente
* Garantisce che l’elemento non venga duplicato se esiste già

---

## 4. Come lo usi nel componente

Grazie a questa struttura, **usare il reducer è molto semplice** nel componente:

```tsx
dispatch(addItem("Comprare il latte", "Da fare entro stasera"));
```

Il flusso interno sarà:

1. **Chiamata:** il componente invoca `addItem("Comprare il latte", "Da fare entro stasera")`.
2. **Prepare:** costruisce il payload completo:

   ```js
   {
     payload: {
       id: "a1b2c3",
       title: "Comprare il latte",
       note: "Da fare entro stasera",
       createdAt: 1734708323721
     }
   }
   ```
3. **Reducer:** riceve l’oggetto completo e lo aggiunge allo stato con `itemsAdapter.addOne`.

---

## 5. Perché questa forma è considerata “professionale”

Un senior React/Redux developer utilizza la forma `prepare + reducer` nei seguenti casi:

* **Per separare la logica di costruzione dei dati dalla UI** – il componente non deve sapere come generare l’oggetto.
* **Per mantenere coerenza e standardizzazione** – ogni item creato avrà sempre tutti i campi necessari.
* **Per aggiungere metadata automaticamente** – come `id`, `createdAt`, `createdBy`, ecc.
* **Per evitare bug futuri** – se cambiano le regole di creazione dell’entità, non devi modificare decine di componenti, solo il reducer.

---

 **In sintesi:**

| Parte     | Funzione                                       | Ruolo                                                           |
| --------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `prepare` | Prepara il payload prima che arrivi al reducer | Genera ID, timestamp, valida i dati, costruisce l’oggetto       |
| `reducer` | Aggiorna lo stato con i dati forniti           | Aggiunge il nuovo elemento nello store                          |
| `addOne`  | Funzione dell’`EntityAdapter`                  | Inserisce in modo ottimizzato l’entità nello stato normalizzato |

---












---

## `src/pages/ItemsListPage.tsx`

Lista con form inline “aggiungi”, link al dettaglio, e azione elimina.
Usa URL come verità di navigazione: clic su elemento → `/items/:id`.

```tsx
import { Link, useNavigate } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addItem, removeItem, selectAllItems } from '@/features/items/itemsSlice';

export default function ItemsListPage() {
  const items = useAppSelector(selectAllItems);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const action = dispatch(addItem(title.trim(), note.trim() || undefined));
    // opzionale: nav al nuovo item
    navigate(`/items/${action.payload.id}`);
  };

  return (
    <section style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Items</h1>
        <Link to="/items/new">+ Nuovo</Link>
      </header>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '.5rem', margin: '1rem 0' }}>
        <input
          placeholder="Titolo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Nota (opzionale)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
        <button type="submit">Aggiungi e vai al dettaglio</button>
      </form>

      <ul style={{ display: 'grid', gap: '.5rem' }}>
        {items.map((it) => (
          <li key={it.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e7eb', padding: '.75rem', borderRadius: 8 }}>
            <div>
              <Link to={`/items/${it.id}`} style={{ fontWeight: 600 }}>{it.title}</Link>
              {it.note && <p style={{ margin: '.25rem 0 0', color: '#4b5563' }}>{it.note}</p>}
            </div>
            <button onClick={() => dispatch(removeItem(it.id))}>Elimina</button>
          </li>
        ))}
        {items.length === 0 && <p>Nessun elemento. Aggiungi il primo sopra.</p>}
      </ul>
    </section>
  );
}
```

---

## `src/pages/ItemDetailPage.tsx`

Dettaglio con `useParams`, validazione minima, edit inline.

```tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectItemById, updateItem, removeItem } from '@/features/items/itemsSlice';
import { useEffect, useMemo, useState } from 'react';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const item = useAppSelector((s) => (id ? selectItemById(s, id) : undefined));

  useEffect(() => {
    if (!id) navigate('/items'); // id mancante, rientra in lista
  }, [id, navigate]);

  const [title, setTitle] = useState(item?.title ?? '');
  const [note, setNote] = useState(item?.note ?? '');

  // Sync form quando cambia item (es. hard refresh o nav)
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setNote(item.note ?? '');
    }
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const createdAt = useMemo(
    () => (item ? new Date(item.createdAt).toLocaleString() : ''),
    [item?.createdAt]
  );

  if (!item) {
    return (
      <section style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
        <h1>Elemento non trovato</h1>
        <Link to="/items">Torna alla lista</Link>
      </section>
    );
  }

  const onSave = () => {
    if (!title.trim()) return;
    dispatch(updateItem({ id: item.id, title: title.trim(), note: note.trim() || undefined }));
  };

  const onDelete = () => {
    dispatch(removeItem(item.id));
    navigate('/items');
  };

  return (
    <section style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/items">← Torna alla lista</Link>
      </nav>

      <h1>Dettaglio</h1>
      <p style={{ color: '#6b7280' }}>Creato: {createdAt}</p>

      <div style={{ display: 'grid', gap: '.5rem', marginTop: '1rem' }}>
        <label>
          Titolo
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Nota
          <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
          <button onClick={onSave}>Salva</button>
          <button onClick={onDelete}>Elimina</button>
        </div>
      </div>
    </section>
  );
}
```


---

## `src/pages/NewItemPage.tsx`

Pagina “/items/new” separata (statico che batte il dinamico).

```tsx
import { FormEvent, useState } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { addItem } from '@/features/items/itemsSlice';
import { Link, useNavigate } from 'react-router-dom';

export default function NewItemPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const action = dispatch(addItem(title.trim(), note.trim() || undefined));
    navigate(`/items/${action.payload.id}`);
  };

  return (
    <section style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/items">← Torna alla lista</Link>
      </nav>
      <h1>Nuovo elemento</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '.5rem', marginTop: '1rem' }}>
        <input placeholder="Titolo" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Nota (opzionale)" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit">Crea</button>
      </form>
    </section>
  );
}
```

---

## `src/routes/AppRoutes.tsx`

Gestione rotte: **lista**, **new** (statica) e **dettaglio** (dinamica).

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ItemsListPage from '@/pages/ItemsListPage';
import ItemDetailPage from '@/pages/ItemDetailPage';
import NewItemPage from '@/pages/NewItemPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/items" replace />} />
      <Route path="/items" element={<ItemsListPage />} />
      <Route path="/items/new" element={<NewItemPage />} />
      <Route path="/items/:id" element={<ItemDetailPage />} />
      <Route path="*" element={<p style={{ padding: 24 }}>404</p>} />
    </Routes>
  );
}
```

---

## `src/main.tsx`

Provider Redux + Router.

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/app/store';
import AppRoutes from '@/routes/AppRoutes';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

---

## Note architetturali e buone pratiche

* **Entity Adapter**: consente insert/update/remove/lookup efficienti e ordinati; i selector generati (`selectAll`, `selectById`) sono memoized e scalano meglio.
* **Rotte**: lo **statico `/items/new`** è separato e prevale su `/:id`, evitando conflitti (“new” scambiato per ID).
* **Tipi**: l’entità `Item` è rigorosa; la creazione passa sempre da `prepare` per garantire attributi consistenti.
* **Navigazione post-azione**: dopo `addItem` navighi al dettaglio, migliorando il flusso UX e mostrando da subito l’oggetto creato.
* **Modularità**: pages, features e routes separati per evolvere senza refactor invasivi.





























# Aggiungere logica avanzata con middleware per controllo admin sul resettare la lista, extrareducer per gestire il reset in component a parte e sezione di login aggiunta alla navigazione 