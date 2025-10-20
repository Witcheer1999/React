

## 1. Introduzione a Redux e RTK: contesto e motivazioni

---

### Basi

#### 1.1 Perché nasce Redux: gestione dello stato globale in applicazioni complesse

In un’applicazione React, lo stato rappresenta i dati che determinano cosa viene renderizzato sullo schermo. Quando un progetto cresce in complessità, gestire e sincronizzare questo stato diventa complesso, soprattutto quando è necessario condividerlo tra componenti distanti o aggiornarlo da punti diversi dell’applicazione.

Con `useState` o `useReducer`, lo stato è locale al componente. Quando serve in componenti lontani nella gerarchia, si ricorre spesso a:

* Propagazione dello stato tramite props (props drilling)
* Passaggio di funzioni callback a livelli superiori
* Gestione manuale della sincronizzazione tra componenti

Questi approcci portano a duplicazione dello stato, incoerenze e codice difficile da mantenere.

**Esempio: gestione dello stato globale con props drilling**

```tsx
function App() {
  const [theme, setTheme] = useState('light');
  return <Layout theme={theme} setTheme={setTheme} />;
}

function Layout({ theme, setTheme }) {
  return (
    <>
      <Header theme={theme} />
      <Sidebar theme={theme} setTheme={setTheme} />
      <MainContent theme={theme} />
    </>
  );
}
```

In questo esempio, lo stato relativo al tema viene passato attraverso molti livelli di componenti, anche a quelli che non ne hanno bisogno direttamente. Questo rende il codice meno chiaro e difficile da mantenere.

Redux nasce per risolvere questi problemi, offrendo:

* Una singola fonte di verità centralizzata per lo stato dell’applicazione
* Un modo per leggere e aggiornare lo stato da qualsiasi parte dell’app senza passaggi intermedi
* Un flusso di aggiornamento prevedibile e tracciabile

---

#### 1.2 Limitazioni di `useState` e `Context API`

Un approccio comune per condividere lo stato tra componenti è l’utilizzo della Context API. Tuttavia, Context non è un gestore di stato vero e proprio e presenta limiti significativi.

**Limitazioni di `useState`:**

* Ottimo per stato locale e semplice, ma non scalabile in caso di stato condiviso
* Non adatto per sincronizzare dati complessi tra più componenti
* Non fornisce strumenti per debugging, time-travel o DevTools

**Limitazioni di Context API:**

* Risolve il problema del props drilling, ma causa re-render in tutti i componenti che lo utilizzano ogni volta che cambia il valore
* Nessuna separazione chiara tra lettura e aggiornamento dello stato
* Mancanza di supporto per middleware, logging e gestione avanzata delle azioni asincrone
* Nessun sistema di selettori ottimizzati per ridurre i re-render

**Esempio di Context inefficiente:**

```tsx
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <Sidebar />
      <Content />
    </ThemeContext.Provider>
  );
}

function Header() {
  const { theme } = useContext(ThemeContext);
  return <h1>{theme}</h1>;
}
```

Ogni volta che cambia `theme`, tutti i componenti che leggono il valore dal contesto vengono renderizzati nuovamente, anche se non necessario.

In sintesi:

* `useState` è ideale per stato locale e UI-specifico
* `Context` è utile per configurazioni statiche o globali con rari aggiornamenti
* Entrambi non sono adatti per stato condiviso complesso, aggiornamenti frequenti, derivazioni di dati, middleware o strumenti di debug avanzati

Redux fornisce invece un sistema di gestione dello stato centralizzato, scalabile e prevedibile, con supporto per flussi complessi e strumenti avanzati.

---

#### 1.3 Differenza tra Client State e Server State

Uno dei concetti fondamentali per scrivere applicazioni React scalabili è distinguere tra **client state** e **server state**, poiché non tutti i dati devono essere gestiti nello stesso modo.

**Client state**: dati gestiti direttamente dal frontend.
Esempi:

* Filtri e selezioni dell’utente
* Stato dell’interfaccia (ad esempio, modale aperta o chiusa)
* Step di un wizard
* Dati derivati o temporanei

Caratteristiche:

* Vive e cambia solo nel browser
* È sincronizzato dal frontend
* Può essere derivato o combinato con altri stati

**Server state**: dati provenienti da API o backend.
Esempi:

* Liste di elementi (utenti, prodotti, articoli)
* Risultati di query o ricerca
* Token e dati sincronizzati con database

Caratteristiche:

* Vive sul server e viene recuperato tramite richieste HTTP
* La fonte di verità è esterna all’applicazione
* Necessita spesso di caching, invalidazione e aggiornamento

Distinguere correttamente tra questi due tipi di stato è fondamentale per progettare un’architettura solida. Un errore comune è quello di memorizzare tutto nello store Redux, compresi i dati provenienti dal server.

**Best practice moderna:**

* Client state → `useState` o Redux slice
* Server state → RTK Query o librerie dedicate come React Query

**Esempio errato: duplicazione di server state nello store**

```tsx
// Errato: copiare manualmente i dati nel Redux store
const todos = await fetch('/api/todos').then(r => r.json());
dispatch(setTodos(todos));
```

**Esempio corretto: gestione automatica con RTK Query**

```tsx
// Corretto: usare RTK Query per caching e invalidazione automatica
const { data: todos, isLoading } = useGetTodosQuery();
```

---

### Sintesi

| Concetto      | Quando usarlo                                            |
| ------------- | -------------------------------------------------------- |
| `useState`    | Stato locale e semplice                                  |
| `Context`     | Configurazioni statiche o globali con aggiornamenti rari |
| Redux Toolkit | Stato client complesso, condiviso e derivato             |
| RTK Query     | Stato server sincronizzato, cache-ato e invalidato       |

---





















## Best practice

---

### 1. Usare Redux solo dove serve: shared state e derived state complesso

Uno degli errori più frequenti quando si inizia ad usare Redux è pensare che **tutto** debba essere inserito nello store globale. Questo porta rapidamente a complessità inutile, stato difficile da mantenere e codice meno performante.

Redux deve essere visto come uno **strumento strategico**, non come il contenitore universale dello stato. La sua vera forza emerge quando è utilizzato nei casi per cui è stato progettato.

#### Quando usare Redux

1. **Stato condiviso (shared state)**
   Dati utilizzati da componenti lontani nella gerarchia o appartenenti a feature diverse.
   Esempi:

   * Informazioni sull’utente loggato
   * Preferenze dell’applicazione (tema, lingua, impostazioni globali)
   * Stato dell’autenticazione o del carrello in un e-commerce

2. **Derived state complesso**
   Dati che richiedono trasformazioni, calcoli o derivazioni da più sorgenti.
   Esempi:

   * Filtri combinati su una lista (ricerca + categoria + range di prezzo)
   * Dati aggregati provenienti da più slice dello stato
   * Stato dipendente da più azioni asincrone

3. **Business logic centralizzata**
   Quando la logica di aggiornamento dello stato deve essere riutilizzata o tracciata in più punti dell’applicazione.
   Esempi:

   * Workflow complessi
   * Gestione di permessi e ruoli
   * Stato sincronizzato con WebSocket o eventi esterni

#### Quando non usare Redux

1. **Stato locale di UI**
   Se un’informazione riguarda un singolo componente o un piccolo gruppo di componenti, `useState` o `useReducer` sono la scelta migliore.
   Esempi:

   * Stato di apertura di un modale
   * Input di un campo testo
   * Checkbox selezionata

2. **Dati temporanei o non condivisi**
   Qualunque dato che non necessita di essere letto o aggiornato da componenti esterni non dovrebbe essere globale.

3. **Server state**
   Dati provenienti da API che necessitano di caching, invalidazione o aggiornamento dinamico dovrebbero essere gestiti da strumenti dedicati come **RTK Query**.

#### Esempio errato: uso eccessivo di Redux

```tsx
// Stato locale inutile nello store globale
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isModalOpen: false
  },
  reducers: {
    openModal: state => { state.isModalOpen = true },
    closeModal: state => { state.isModalOpen = false }
  }
});
```

Questo stato riguarda un singolo componente e non deve essere globale. È preferibile gestirlo localmente:

```tsx
// Stato locale corretto
function ModalButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Apri Modale</button>
      {isOpen && <Modal onClose={() => setIsOpen(false)} />}
    </>
  );
}
```

L’obiettivo è mantenere lo store Redux **pulito, focalizzato e significativo**. In questo modo sarà più facile da testare, scalare e comprendere nel tempo.

---

### 2. Distinguere stato locale e globale sin dall’inizio del progetto

Una delle decisioni più importanti nella progettazione di un’app React complessa è stabilire **dove** deve vivere ciascun pezzo di stato. Farlo all’inizio evita refactoring costosi e facilita l’evoluzione dell’architettura.

#### Criteri per decidere dove collocare lo stato

1. **Scopo del dato**:

   * Se il dato è legato strettamente a un componente, deve restare locale.
   * Se il dato influenza più parti dell’app, deve essere globale.

2. **Durata e persistenza**:

   * Se lo stato è temporaneo (ad esempio, input di un form), mantienilo locale.
   * Se deve persistere per tutta la durata dell’app, considera Redux.

3. **Origine e frequenza degli aggiornamenti**:

   * Se lo stato è derivato da API o fonti esterne, valuta RTK Query.
   * Se cambia frequentemente e influenza il comportamento globale, spostalo nello store.

4. **Dipendenze tra componenti**:

   * Se più componenti dipendono dallo stesso dato, è un candidato per lo store globale.

#### Schema decisionale pratico

| Domanda                                                  | Risposta | Soluzione consigliata      |
| -------------------------------------------------------- | -------- | -------------------------- |
| Lo stato serve solo a un componente?                     | Sì       | `useState` / `useReducer`  |
| È condiviso tra componenti distanti?                     | Sì       | Redux                      |
| È recuperato da API e necessita di caching/invalidation? | Sì       | RTK Query                  |
| È derivato o dipende da più fonti?                       | Sì       | Redux con `createSelector` |

#### Esempio pratico di combinazione corretta

```tsx
// Stato locale per UI
function Filters() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // Stato globale per lista filtrata
  const filteredProducts = useSelector(selectFilteredProducts);

  return (
    <>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="all">Tutti</option>
        <option value="tech">Tech</option>
      </select>
      <ProductList products={filteredProducts} />
    </>
  );
}
```

In questo esempio:

* I filtri sono **stato locale**, perché servono solo al componente `Filters`.
* La lista filtrata è **stato globale derivato**, perché può essere utilizzata in più parti dell’applicazione.

---

### Conclusioni

* Redux è uno strumento potente, ma va utilizzato solo nei casi giusti.
* Uno store sovraccarico con stato locale o irrilevante è difficile da mantenere e ottimizzare.
* Separare chiaramente stato locale, globale e server fin dall’inizio è una decisione architetturale strategica che determina la qualità e la scalabilità del progetto.
* Mantenere questa distinzione consente di ottenere applicazioni più efficienti, prevedibili e facili da evolvere.

---























## Approfondimento

---

### 1. Filosofia di Redux: single source of truth, stato immutabile, predictable state changes

Redux è nato per risolvere un problema fondamentale: mantenere la gestione dello stato **prevedibile, centralizzata e scalabile** anche in applicazioni molto grandi. La sua architettura è ispirata al modello *Flux* di Facebook, ma ne rafforza i principi con alcune regole precise che, se rispettate, rendono il comportamento dell’applicazione altamente controllabile e tracciabile.

I tre principi fondamentali di Redux sono:

---

#### 1.1 Single Source of Truth

Tutto lo stato globale dell’applicazione è contenuto in **un unico oggetto store**.
Questa caratteristica offre diversi vantaggi:

* Ogni parte dell’applicazione legge i dati dalla stessa fonte, riducendo il rischio di inconsistenze.
* Debug e testing diventano più semplici perché lo stato dell’intera applicazione è rappresentabile come un unico snapshot.
* È possibile serializzare e deserializzare lo stato in qualsiasi momento (per esempio per implementare il time-travel debugging).
* Tutti i componenti vedono lo stato aggiornato nello stesso momento.

**Esempio di stato globale unico:**

```ts
const state = {
  user: { id: 1, name: "Alice" },
  cart: { items: [1, 2, 3], total: 129.90 },
  ui: { theme: "dark", language: "it" }
};
```

---

#### 1.2 Stato immutabile

In Redux, lo stato è **immutabile**, ovvero non viene mai modificato direttamente.
Ogni cambiamento produce **una nuova versione** dello stato.

Questa scelta non è stilistica, ma tecnica. L’immutabilità consente:

* Confronti rapidi tra versioni dello stato tramite confronto referenziale (`===`)
* Undo/redo e time-travel debugging
* Evitare effetti collaterali non intenzionali dovuti alla condivisione di riferimenti

**Esempio scorretto (mutazione diretta):**

```ts
state.user.name = "Bob"; // modifica diretta
```

**Esempio corretto (immutabilità):**

```ts
return {
  ...state,
  user: {
    ...state.user,
    name: "Bob"
  }
};
```

Nel caso di Redux Toolkit, l’immutabilità è garantita automaticamente da **Immer**, una libreria che utilizza i *Proxy* per intercettare le mutazioni apparenti e produrre un nuovo stato immutabile.

---

#### 1.3 Cambiamenti di stato prevedibili (Predictable State Changes)

In Redux, i cambiamenti di stato avvengono **solo** attraverso l’invio di un’azione (`dispatch`) e la gestione di questa azione da parte di un **reducer puro**.

Questa rigidità ha uno scopo preciso:

* Ogni cambiamento dello stato è **tracciabile** (ogni azione è loggata con il suo tipo e payload).
* Il flusso è **deterministico**: dato uno stato iniziale e una sequenza di azioni, il risultato sarà sempre lo stesso.
* Si ottiene una migliore **manutenibilità e debuggabilità** anche in applicazioni di grandi dimensioni.

---

### 2. Come funziona il flusso unidirezionale dei dati (Action → Reducer → Store → View)

Il cuore di Redux è il suo **flusso unidirezionale dei dati**, un modello progettuale che garantisce ordine e prevedibilità nella gestione dello stato.

Il flusso segue quattro passaggi fondamentali:

---

#### 2.1 Action – La descrizione di cosa deve accadere

Un’**azione** è un oggetto JavaScript semplice che descrive un evento che ha avuto luogo nell’applicazione.
Contiene sempre almeno una proprietà `type` e, facoltativamente, un `payload` con i dati necessari alla modifica dello stato.

Esempio:

```ts
{
  type: "cart/addItem",
  payload: { id: 4, name: "Monitor", price: 199.99 }
}
```

Le azioni non contengono logica: non dicono *come* lo stato deve cambiare, ma solo *cosa è successo*.

---

#### 2.2 Reducer – La funzione pura che decide il nuovo stato

Un **reducer** è una funzione pura che riceve lo stato corrente e un’azione, e restituisce un nuovo stato.

Caratteristiche fondamentali:

* Non deve avere effetti collaterali (niente fetch, DOM, date, random, ecc.).
* Non deve mutare lo stato originale.
* Deve restituire sempre un nuovo oggetto di stato (o lo stesso, se nulla cambia).

Esempio:

```ts
function cartReducer(state = initialState, action) {
  switch (action.type) {
    case "cart/addItem":
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    default:
      return state;
  }
}
```

---

#### 2.3 Store – Il contenitore unico dello stato e dei reducer

Lo **store** è un oggetto che:

* Contiene lo stato globale dell’applicazione
* Offre un metodo `dispatch(action)` per inviare azioni
* Fornisce `getState()` per leggere lo stato corrente
* Permette di registrare listener tramite `subscribe()`

Esempio:

```ts
import { createStore } from 'redux';
const store = createStore(cartReducer);

// Leggere lo stato
console.log(store.getState());

// Inviare un’azione
store.dispatch({ type: "cart/addItem", payload: { id: 4, name: "Monitor" } });
```

---

#### 2.4 View – L’interfaccia utente che reagisce ai cambiamenti di stato

Quando il reducer restituisce un nuovo stato, lo store **notifica automaticamente** tutti i componenti React collegati. Questi componenti leggono il nuovo stato e si aggiornano di conseguenza.

La UI, quindi, non modifica direttamente lo stato:

* Invia un’azione (descrive cosa è successo)
* Redux aggiorna lo stato tramite il reducer
* Il nuovo stato aggiorna la vista

---

### 3. Riassunto del ciclo dei dati

Il flusso unidirezionale di Redux segue sempre lo stesso schema:

1. **UI** – L’utente interagisce con l’app (ad esempio clicca un pulsante).
2. **Action** – L’app invia un’azione con `dispatch()`.
3. **Reducer** – Il reducer elabora l’azione e restituisce un nuovo stato.
4. **Store** – Lo stato aggiornato sostituisce quello precedente.
5. **View** – I componenti React leggono il nuovo stato e si aggiornano.

Questo ciclo si ripete indefinitamente. È semplice, lineare e soprattutto prevedibile.

---

### 4. Vantaggi dell’approccio unidirezionale

* **Tracciabilità totale:** ogni cambiamento è loggato come un’azione con dati chiari.
* **Debug e testing più semplici:** è possibile simulare azioni e prevedere il risultato.
* **Maggiore stabilità:** il flusso dati è sempre lo stesso e non cambia con la complessità dell’applicazione.
* **Scalabilità:** l’architettura rimane coerente anche con centinaia di componenti e slice di stato.

---

### Conclusioni

Redux si basa su principi architetturali solidi che lo rendono particolarmente adatto ad applicazioni complesse:

* **Single source of truth:** un unico store centralizzato che rappresenta lo stato globale.
* **Stato immutabile:** ogni cambiamento produce una nuova versione dello stato.
* **Cambiamenti prevedibili:** ogni mutazione passa attraverso un’azione e un reducer puro.
* **Flusso unidirezionale:** l’interazione segue sempre il percorso UI → Action → Reducer → Store → View.

Questi principi, apparentemente rigidi, sono ciò che rendono Redux uno strumento affidabile, scalabile e adatto a sistemi complessi, soprattutto se usato in combinazione con Redux Toolkit, che automatizza molte delle complessità iniziali e fornisce un approccio più produttivo allo sviluppo.

---






























---

# Installazione

```bash
# Vite + React + TS (se parti da zero)
npm create vite@latest
cd my-rtk-counter

# Librerie
npm i @reduxjs/toolkit react-redux
```

---

# Struttura

```
src/
  app/
    store.ts
    hooks.ts
  features/
    counter/
      counterSlice.ts
  components/
    CounterA.tsx
    CounterB.tsx
  App.tsx
  main.tsx
```

---

## src/app/store.ts

```ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './features/counter/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

---

## src/app/hooks.ts

```ts
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

---

## src/features/counter/counterSlice.ts

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type CounterState = { value: number }
const initialState: CounterState = { value: 0 }

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += 1
    },
    decrement(state) {
      state.value -= 1
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
    reset() {
      return initialState
    },
  },
})

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions
export default counterSlice.reducer

// Selector di esempio
export const selectCount = (state: { counter: CounterState }) => state.counter.value
```

---

## src/components/CounterA.tsx

```tsx
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hook'
import { decrement, increment, incrementByAmount, selectCount } from '../features/counter/counterSlice'

export default function CounterA() {
  const count = useAppSelector(selectCount)
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<number>(5)

  return (
    <section style={cardStyle}>
      <h2 style={{ margin: 0 }}>Counter A</h2>
      <p aria-label="current count" style={countStyle}>{count}</p>

      <div style={rowStyle}>
        <button onClick={() => dispatch(decrement())}>-1</button>
        <button onClick={() => dispatch(increment())}>+1</button>
      </div>

      <div style={rowStyle}>
        <input
          type="number"
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          style={{ width: 80 }}
        />
        <button onClick={() => dispatch(incrementByAmount(step))}>
          +{step}
        </button>
      </div>

      <small>Questo componente legge e aggiorna lo stesso store globale.</small>
    </section>
  )
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  width: 280,
  display: 'flex',
  gap: 12,
  flexDirection: 'column',
}

const rowStyle: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center' }
const countStyle: React.CSSProperties = { fontSize: 40, margin: '8px 0' }
```

---

## src/components/CounterB.tsx

```tsx
import { useAppDispatch, useAppSelector } from '../hook'
import { decrement, increment, reset, selectCount } from '../features/counter/counterSlice'

export default function CounterB() {
  const count = useAppSelector(selectCount)
  const dispatch = useAppDispatch()

  const parity = count % 2 === 0 ? 'pari' : 'dispari'

  return (
    <section style={cardStyle}>
      <h2 style={{ margin: 0 }}>Counter B</h2>
      <p style={countStyle}>{count}</p>
      <p style={{ marginTop: -8, opacity: 0.8 }}>Il numero è {parity}</p>

      <div style={rowStyle}>
        <button onClick={() => dispatch(decrement())}>-1</button>
        <button onClick={() => dispatch(increment())}>+1</button>
        <button onClick={() => dispatch(reset())}>Reset</button>
      </div>

      <small>
        Anche questo componente osserva e modifica lo stesso stato, senza props drilling.
      </small>
    </section>
  )
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  width: 280,
  display: 'flex',
  gap: 12,
  flexDirection: 'column',
}

const rowStyle: React.CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap' }
const countStyle: React.CSSProperties = { fontSize: 40, margin: '8px 0' }
```

---

## src/App.tsx

```tsx
import CounterA from './components/CounterA'
import CounterB from './components/CounterB'

export default function App() {
  return (
    <main style={layout}>
      <h1 style={{ marginBottom: 8 }}>Redux Toolkit – Demo Counter</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Due componenti leggono e aggiornano lo stesso stato globale (niente prop drilling).
      </p>

      <div style={grid}>
        <CounterA />
        <CounterB />
      </div>
    </main>
  )
}

const layout: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial',
  padding: 24,
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16,
  alignItems: 'start',
}
```

---

## src/main.tsx

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
```
































## 2. Il cuore di Redux: Store, Action, Reducer

### – Basi –

---

### 1. Concetto di `store`, `dispatch`, `subscribe`, `getState`

Il **cuore di Redux** è lo **store**. Tutto ruota intorno ad esso: è l’unica fonte di verità dell’intera applicazione e il punto centrale in cui lo stato globale viene mantenuto, aggiornato e distribuito ai componenti.

Nel progetto d’esempio, lo store è creato così:

```ts
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})
```

Vediamo in dettaglio i suoi elementi fondamentali.

---

#### `store`

Lo **store** è un oggetto che:

* Contiene lo stato globale dell’applicazione.
* Fornisce i metodi per **leggere**, **aggiornare** e **osservare** lo stato.
* Passa lo stato a React tramite `<Provider>` e permette ai componenti di leggere i dati con `useSelector`.

Tutto lo stato è contenuto in un unico oggetto (il concetto di *single source of truth*).
Nel nostro caso, il `store` ha la seguente struttura interna:

```ts
{
  counter: {
    value: 0
  }
}
```

---

#### `dispatch(action)`

Il metodo `dispatch()` serve per inviare un’**azione**. Quando chiamiamo `dispatch`, stiamo notificando a Redux che *qualcosa è accaduto* e che lo stato deve essere aggiornato di conseguenza.

Esempio reale nel componente `CounterA.tsx`:

```tsx
<button onClick={() => dispatch(increment())}>+1</button>
```

Qui `increment()` crea un’azione che verrà inviata allo store. Redux la passerà al reducer associato, che calcolerà il nuovo stato.

Ogni chiamata a `dispatch()`:

1. Riceve un oggetto azione `{ type, payload? }`.
2. Passa questa azione al reducer.
3. Il reducer calcola e restituisce un **nuovo stato immutabile**.
4. Lo store aggiorna lo stato interno e notifica React, causando il re-render dei componenti che ne fanno uso.

---

#### `getState()`

`getState()` permette di leggere lo **stato attuale** dello store.
In applicazioni reali con React non lo si usa quasi mai direttamente (si preferisce `useSelector`), ma è utile in middleware o thunk asincroni.

Esempio d’uso (non presente nel codice, ma valido):

```ts
console.log(store.getState())
// { counter: { value: 0 } }
```

---

#### `subscribe(listener)`

`subscribe()` permette di eseguire codice ogni volta che lo stato cambia.
Anche questo non è necessario nei componenti React (perché `useSelector` lo fa internamente), ma è utile in integrazioni esterne o per logging personalizzato.

Esempio:

```ts
const unsubscribe = store.subscribe(() => {
  console.log("Nuovo stato:", store.getState())
})

// invia un’azione
store.dispatch(increment())

// -> "Nuovo stato: { counter: { value: 1 } }"
```

---

### 2. Struttura di un’azione `{ type, payload }`

Ogni cambiamento nello stato avviene tramite un’**azione**.
Un’azione è un semplice oggetto JavaScript che descrive un evento. Deve avere almeno la proprietà `type`, una stringa che indica quale cambiamento si vuole applicare. Può inoltre avere un campo opzionale `payload`, con i dati necessari a calcolare il nuovo stato.

Esempio generico:

```ts
{
  type: 'counter/incrementByAmount',
  payload: 5
}
```

* **type**: obbligatorio, indica cosa deve accadere.
* **payload**: opzionale, contiene i dati per eseguire l’operazione.

Nel nostro progetto, grazie a `createSlice`, Redux Toolkit genera automaticamente sia le azioni sia le funzioni action creator:

```ts
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions
```

Quando scriviamo:

```tsx
dispatch(incrementByAmount(5))
```

stiamo in realtà inviando l’azione:

```ts
{
  type: 'counter/incrementByAmount',
  payload: 5
}
```

Questa sarà intercettata dal reducer che conosce come modificarne lo stato.

---

### 3. Purezza dei reducer e immutabilità

Il **reducer** è il cuore logico di Redux: una funzione pura che riceve lo stato corrente e un’azione, e restituisce un nuovo stato.

Nel nostro esempio:

```ts
const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += 1
    },
    decrement(state) {
      state.value -= 1
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
    reset() {
      return initialState
    },
  },
})
```

Ci sono due concetti fondamentali qui: **purezza** e **immutabilità**.

---

#### Purezza

Un reducer deve essere **puro**. Significa che:

* Non deve modificare variabili esterne.
* Non deve fare chiamate a API, fetch, o operazioni asincrone.
* Non deve produrre effetti collaterali.
* Dato lo stesso stato e la stessa azione, deve restituire sempre lo stesso risultato.

Questo garantisce che l’app sia **deterministica e prevedibile**: lo stesso input produce sempre lo stesso output.

Esempio corretto:

```ts
function reducer(state, action) {
  if (action.type === 'INCREMENT') {
    return { ...state, value: state.value + 1 }
  }
  return state
}
```

Esempio scorretto (impuro):

```ts
function reducer(state, action) {
  if (action.type === 'INCREMENT') {
    fetch('/api/log') // effetto collaterale
    state.value++     // mutazione diretta
    return state
  }
  return state
}
```

---

#### Immutabilità

Lo stato in Redux è **immutabile**: non va mai modificato direttamente, ma sostituito con un nuovo oggetto. Questo è essenziale per:

* Rilevare i cambiamenti tramite confronto di riferimento (`===`)
* Attivare correttamente i re-render in React
* Supportare strumenti come Redux DevTools e time-travel debugging

Nell’esempio sopra, il reducer appare mutare `state.value`, ma grazie a **Immer** (integrato in Redux Toolkit) quella che sembra una mutazione è in realtà un’operazione immutabile.

**Cosa accade dietro le quinte:**

* Immer crea una copia temporanea (“draft”) dello stato.
* Le modifiche vengono applicate al draft.
* Immer genera un nuovo stato immutabile con le modifiche incorporate.
* Il nuovo oggetto viene restituito al Redux store.

Questo approccio permette di scrivere codice semplice e leggibile come:

```ts
state.value += 1
```

pur mantenendo immutabilità e sicurezza.

---

### In sintesi

| Concetto     | Significato                               | Perché è importante                    |
| ------------ | ----------------------------------------- | -------------------------------------- |
| `store`      | Contenitore unico dello stato globale     | Centralizzazione, prevedibilità        |
| `dispatch`   | Invia azioni al reducer                   | Cambiamenti controllati dello stato    |
| `getState`   | Legge lo stato attuale                    | Debug, middleware, logica condizionale |
| `subscribe`  | Esegue codice quando lo stato cambia      | Integrazione con sistemi esterni       |
| Azione       | Oggetto `{ type, payload }`               | Descrive cosa è accaduto               |
| Reducer puro | Funzione deterministica senza side effect | Comportamento affidabile e testabile   |
| Immutabilità | Nessuna modifica diretta dello stato      | Re-render efficienti e prevedibilità   |

---

### Conclusione

Lo store, le azioni e i reducer costituiscono l’architettura fondamentale su cui si basa Redux.

* Il **store** mantiene e distribuisce lo stato.
* Le **azioni** descrivono gli eventi che modificano lo stato.
* I **reducer** determinano come lo stato cambia in risposta a tali eventi, mantenendo immutabilità e prevedibilità.

Questa combinazione crea un flusso dati semplice e unidirezionale, che rende il comportamento dell’applicazione più facile da capire, da mantenere e da scalare.

---































```ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

## Cosa stiamo importando

* `useDispatch`, `useSelector` (da `react-redux`)
  Sono i due hook standard per:

  * **inviare azioni** allo store (`dispatch`)
  * **leggere porzioni di stato** (`selector`)

* `TypedUseSelectorHook`
  È un **tipo** che descrive un `useSelector` già “legato” al tipo dello stato globale. Ci permette di avere **tipi corretti automaticamente** ogni volta che facciamo `useSelector`.

* `import type { RootState, AppDispatch } from './store'`
  `RootState` è il **tipo** dell’intero stato globale (di solito: `ReturnType<typeof store.getState>`).
  `AppDispatch` è il **tipo** della `dispatch` del nostro store (di solito: `typeof store.dispatch`).
  Il prefisso `import type` dice a TypeScript che stiamo importando **solo tipi**: a runtime non entra nulla nel bundle (utile per evitare dipendenze/cicli inutili).

## Perché creiamo due “hook tipizzati”

### 1) `useAppDispatch`

```ts
export const useAppDispatch = () => useDispatch<AppDispatch>()
```

* È un **wrapper** attorno a `useDispatch` che **fissa il tipo** di `dispatch` a `AppDispatch`.
* Perché serve?

  * Con Redux Toolkit userete spesso **thunk** (es. `createAsyncThunk`). Senza un `dispatch` tipizzato, TypeScript potrebbe non accettare `dispatch(fetchUsers())` perché la versione “grezza” di `dispatch` accetta solo `Action`, non *funzioni-thunk*.
  * Con `AppDispatch` TypeScript **sa** che il vostro `dispatch` accetta anche thunk generati da RTK. Risultato: **autocomplete migliore**, **errori utili** e niente `any`.

**Esempio pratico**

```ts
const dispatch = useAppDispatch()
// Perfettamente tipizzato, anche con thunk:
dispatch(fetchUsers())          // ok
dispatch(incrementByAmount(10)) // ok
```

Senza questo wrapper, dovreste scrivere in ogni componente:

```ts
const dispatch = useDispatch<AppDispatch>()
```

…ripetendovi e rischiando incoerenze. Il wrapper standardizza.

### 2) `useAppSelector`

```ts
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

* Qui stiamo **ri-tipizzando** `useSelector` in modo che il suo parametro `state` sia **sempre** del tipo `RootState`.
* Perché serve?

  * Quando fate `useSelector(s => s.counter.value)`, TS **conosce** la forma esatta di `s` (niente `any`), quindi avete **autocomplete** per i nomi delle slice e **errori immediati** se sbagliate un path.
  * Se in futuro cambiate la struttura dello store, i componenti che selezionano stati non più esistenti **falliranno a compilazione**, non a runtime.

**Esempio pratico**

```ts
const count = useAppSelector(s => s.counter.value) // s è RootState tipato
```

Se `counter` non esiste o `value` ha tipo diverso, avrete un errore TS chiaro e precoce.

## Cosa cambia rispetto a usare direttamente `useDispatch` / `useSelector`

* Potreste **non** creare questi wrapper e scrivere ovunque:

  ```ts
  const dispatch = useDispatch<AppDispatch>()
  const value = useSelector((state: RootState) => state.counter.value)
  ```

  ma:

  * è **boilerplate** ripetuto in ogni file
  * è **facile sbagliare** o dimenticarsi i tipi
  * manutenzione peggiore, specialmente in team

Con `useAppDispatch` / `useAppSelector`:

* Scrivete meno
* Avete **tipi coerenti in tutta l’app**
* Cambi la forma dello store? Aggiorni i tipi **una sola volta** (in `store.ts`), e tutto il resto segue.

## Nota su prestazioni e corretto uso di `useSelector`

* `useSelector` per default confronta il **risultato precedente vs nuovo** con `===`.

  * Se il vostro selector **crea un nuovo oggetto/array** ad ogni render, il riferimento cambia sempre → il componente si ri-renderizza sempre.
  * Soluzione: selezionate valori primitivi o oggetti **memoizzati** (es. con `reselect/createSelector`) oppure passate una funzione di equality personalizzata (es. `shallowEqual`) quando serve.
* Questi wrapper **non cambiano** il comportamento di `useSelector`; aggiungono solo **tipi**. La disciplina su **cosa** selezionare rimane chiave per evitare re-render inutili.

## Perché `useAppDispatch` è una funzione e `useAppSelector` è una costante

* `useAppDispatch` è un **hook** vero e proprio (chiama `useDispatch`), quindi va **chiamato dentro componenti o altri hook**, rispettando le Rules of Hooks.
* `useAppSelector` è una **costante funzione** che re-esporta `useSelector` già tipizzato: si usa esattamente come `useSelector`, ma con il vantaggio del tipo di `RootState` collegato.

## Benefici concreti nel lavoro quotidiano

* **DX migliore**: autocompletamento profondo (`s.auth.user.name`), niente `any`, niente cast, niente `@ts-ignore`.
* **Sicurezza dei refactor**: rinominate una slice o un campo? TS vi indica **tutti i punti** da aggiornare.
* **Compatibilità con RTK**: thunk e `createAsyncThunk` funzionano out-of-the-box con `dispatch` tipizzato.
* **Zero cost a runtime**: sono solo tipizzazioni; il bundle non cresce per questi wrapper.

## Mini esempio d’uso

```ts
// In un componente
import { useAppDispatch, useAppSelector } from './app/hooks'
import { incrementByAmount } from './features/counter/counterSlice'

export function Counter() {
  const count = useAppSelector(s => s.counter.value)
  const dispatch = useAppDispatch()

  return (
    <>
      <div>Valore: {count}</div>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </>
  )
}
```

Se sbagliate campo:

```ts
const x = useAppSelector(s => s.counetr.value) // Errore TS: “counetr” non esiste
```

---

### In sintesi

Queste quattro righe creano **due hook di progetto** che:

* legano **in modo centrale e tip-safe** la vostra app a Redux,
* eliminano boilerplate e incoerenze,
* vi danno **feedback immediato a compile-time** su selector e dispatch,
* preparano il terreno per scalare con thunk/RTK Query e slice aggiuntive, senza sacrificare la qualità del codice.






































---

## Best practice

---

### 1. Uso di Immer per mantenere il codice leggibile e sicuro

Una delle best practice più importanti con Redux Toolkit è **sfruttare pienamente Immer**, la libreria integrata che permette di scrivere reducer concisi come se modificassimo direttamente lo stato, pur mantenendo **immutabilità garantita**.

#### Perché è fondamentale

Redux si basa sul principio dell’immutabilità: ogni azione deve restituire **un nuovo stato** senza modificare direttamente quello precedente. Questo è cruciale per:

* Permettere a React di capire **quando** deve ri-renderizzare un componente (grazie al confronto referenziale `===`).
* Attivare strumenti avanzati come il **time-travel debugging**.
* Evitare bug difficili da tracciare dovuti a mutazioni in-place.

Tuttavia, scrivere reducer immutabili “a mano” diventa complesso e verboso, soprattutto su strutture dati annidate:

```ts
// Esempio senza Immer
function reducer(state, action) {
  return {
    ...state,
    user: {
      ...state.user,
      settings: {
        ...state.user.settings,
        darkMode: true,
      },
    },
  };
}
```

Con Immer (e `createSlice`), lo stesso codice diventa più leggibile e mantenibile:

```ts
// Esempio con Immer
userSlice.reducer = {
  enableDarkMode(state) {
    state.user.settings.darkMode = true;
  },
};
```

Immer crea internamente una copia temporanea (*draft*), registra tutte le modifiche e genera **automaticamente un nuovo stato immutabile**.

#### Buone pratiche con Immer

* Usarlo **sempre** per modificare lo stato nel reducer; non scrivere mai mutazioni manuali con `Object.assign` o spread annidati.
* Evitare comunque operazioni non pure: ad esempio, **non** chiamare API, non leggere localStorage e non modificare variabili esterne.
* Non restituire manualmente lo stato mutato: Immer gestisce il ritorno per te.
  Se vuoi reimpostare lo stato, puoi restituire direttamente un nuovo oggetto.

```ts
reset(state) {
  return initialState; // corretto
}
```

---

### 2. Mantenere reducer piccoli, focalizzati e testabili

Un errore comune nei progetti React di medio-grandi dimensioni è trasformare i reducer in “funzioni monolitiche” che gestiscono troppe responsabilità. Questo riduce la leggibilità, rende il debugging complesso e i test più difficili.

#### Linee guida fondamentali

1. **Un reducer per feature (o dominio logico)**
   Ogni reducer dovrebbe rappresentare **un singolo concetto dell’applicazione** (es. `auth`, `cart`, `ui`, `todos`).
   Esempio di struttura corretta:

   ```
   src/features/
     auth/
       authSlice.ts
     cart/
       cartSlice.ts
     ui/
       uiSlice.ts
   ```

2. **Ogni funzione nel reducer deve gestire un singolo cambiamento**
   Evita funzioni troppo generiche come `updateState` o `setAllData`. Meglio azioni specifiche come `addProduct`, `removeProduct`, `toggleSidebar`.

   ```ts
   reducers: {
     addProduct(state, action) { ... },
     removeProduct(state, action) { ... },
     toggleSidebar(state) { ... },
   }
   ```

3. **Separare la logica di business dalla logica asincrona**
   Il reducer deve solo trasformare lo stato in base a un’azione già completata.
   Operazioni come chiamate API o calcoli complessi dovrebbero stare nei thunk o nei middleware, non nel reducer.

4. **Non duplicare stato derivabile**
   Se un dato può essere calcolato da altri pezzi di stato, non deve esistere come campo separato.
   Ad esempio, non salvare sia `items` che `itemsCount`; calcola il conteggio con un selettore.

   ```ts
   export const selectItemsCount = (state: RootState) => state.cart.items.length;
   ```

5. **Usare i selettori per logica di lettura**
   I reducer gestiscono lo *scrivere* lo stato. La logica di *lettura* e trasformazione va delegata ai selettori (`createSelector`) per mantenere i reducer semplici e veloci.

6. **Tenere i reducer puri e prevedibili**

   * Nessuna chiamata di rete
   * Nessun accesso a localStorage
   * Nessuna mutazione di variabili esterne
   * Nessun `Date.now()` o `Math.random()` direttamente nel reducer

---

### 3. Altre best practice importanti

#### a) Non mescolare responsabilità diverse nello stesso slice

Ogni slice dovrebbe avere un unico scopo. Ad esempio:

* `userSlice` → autenticazione e dati dell’utente
* `uiSlice` → gestione interfaccia (tema, sidebar, modali)
* `todosSlice` → gestione dei to-do

Questo approccio permette di scalare l’applicazione aggiungendo nuove feature senza rompere il codice esistente.

---

#### b) Nominare correttamente le azioni

I nomi delle azioni devono essere **descrittivi e specifici**.
Esempio corretto:

```ts
reducers: {
  addTodo(state, action) { ... },
  toggleTodo(state, action) { ... },
  clearCompleted(state) { ... },
}
```

Esempio da evitare:

```ts
reducers: {
  updateState(state, action) { ... },
  doSomething(state, action) { ... },
}
```

Un nome ben scelto è autoesplicativo e facilita debugging, logging e analisi del flusso nello store.

---

#### c) Usare `initialState` esplicito e centralizzato

Dichiarare uno stato iniziale ben definito aiuta a mantenere consistenza e facilita il reset o l’idempotenza.

```ts
const initialState: CartState = {
  items: [],
  total: 0,
  status: 'idle',
};
```

---

#### d) Mantenere la logica di aggiornamento semplice

Ogni reducer dovrebbe essere leggibile in poche righe. Se la logica diventa troppo complessa:

* Spezzala in più reducer.
* Estrai funzioni helper pure per calcoli.
* Valuta l’uso di middleware o thunk per parti più complesse.

---

### 4. Esempio di buon design di slice

```ts
// src/features/cart/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem { id: string; name: string; price: number }
interface CartState { items: CartItem[]; total: number }

const initialState: CartState = { items: [], total: 0 }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      state.items.push(action.payload)
      state.total += action.payload.price
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload)
      state.total = state.items.reduce((acc, item) => acc + item.price, 0)
    },
    clearCart() {
      return initialState
    }
  }
})

export const { addItem, removeItem, clearCart } = cartSlice.actions
export default cartSlice.reducer
```

Questo reducer segue tutte le best practice:

* È breve e leggibile.
* Ogni azione è chiara e specifica.
* La logica asincrona è assente.
* L’immutabilità è garantita automaticamente da Immer.

---

### Conclusioni

* **Immer** è essenziale per scrivere reducer leggibili e sicuri senza rinunciare all’immutabilità.
* **Reducer piccoli e focalizzati** sono più facili da mantenere, testare ed estendere.
* La separazione tra responsabilità (slice per feature, selettori per la lettura, thunk per l’asincronia) rende l’architettura scalabile.
* L’adozione di convenzioni coerenti (nomi descrittivi, stato iniziale esplicito, azioni specifiche) migliora la qualità complessiva del codice e semplifica il lavoro del team.

---


























---

## Approfondimento

---

### 1. Ciclo interno: `dispatch` → esecuzione del reducer → creazione nuovo stato → notifiche ai subscriber

Per capire davvero come funziona Redux, bisogna andare oltre la sintassi e analizzare cosa succede **dietro le quinte** ogni volta che chiamiamo `dispatch()`.

Ogni aggiornamento dello stato segue sempre **lo stesso ciclo prevedibile**:

---

#### 1.1 `dispatch(action)`: invio dell’evento

Il ciclo inizia quando inviamo un’azione usando `dispatch()`:

```tsx
dispatch(incrementByAmount(5))
```

Questa chiamata:

* Crea un oggetto azione `{ type: "counter/incrementByAmount", payload: 5 }`
* Lo passa allo store
* Attiva la catena dei middleware (se presenti)
* Infine, lo inoltra al reducer

**Importante:** il `dispatch` non aggiorna direttamente lo stato. Si limita a notificare a Redux che è avvenuto un evento che *potrebbe* cambiare lo stato.

---

#### 1.2 Esecuzione del reducer

Redux chiama ora il reducer associato con lo stato corrente e l’azione:

```ts
newState = reducer(previousState, action)
```

Nel nostro esempio:

```ts
function counterReducer(state, action) {
  switch (action.type) {
    case "counter/incrementByAmount":
      return { ...state, value: state.value + action.payload }
    default:
      return state
  }
}
```

Il reducer deve:

* Leggere lo stato attuale e l’azione
* Calcolare il nuovo stato
* Restituirlo **senza mutare quello precedente**

Questa fase è deterministica: per lo stesso stato iniziale e la stessa azione, il risultato sarà sempre identico.

---

#### 1.3 Creazione di un nuovo stato immutabile

Il reducer restituisce un **nuovo oggetto di stato**. Questo è un punto cruciale: Redux non modifica mai lo stato esistente, lo sostituisce con una nuova versione.

Con Redux Toolkit e Immer, la creazione del nuovo stato è trasparente:

```ts
incrementByAmount(state, action) {
  state.value += action.payload // appare come mutazione, ma è immutabile
}
```

Immer crea un *draft proxy*, registra le modifiche e produce un **nuovo oggetto immutabile** con structural sharing (vedi sezione successiva).

---

#### 1.4 Aggiornamento dello store

Lo store ora sostituisce lo stato vecchio con quello nuovo:

```ts
store.state = newState
```

A questo punto:

* Il riferimento dell’oggetto radice cambia
* Tutti i valori aggiornati cambiano riferimento
* I valori non modificati riutilizzano i vecchi riferimenti (grazie allo structural sharing)

---

#### 1.5 Notifica dei subscriber

Dopo aver aggiornato lo stato, lo store **notifica tutti i subscriber** registrati tramite `subscribe()` o, nel caso di React, i componenti che usano `useSelector`.

```ts
store.subscribe(() => {
  console.log("Nuovo stato:", store.getState())
})
```

In un’app React, `useSelector` rilegge lo stato, lo confronta con il valore precedente e decide se il componente deve ri-renderizzare.

---

**Schema riassuntivo del ciclo:**

```
dispatch(action)
       ↓
Middleware (opzionale)
       ↓
Reducer(state, action) → newState
       ↓
Store aggiorna stato
       ↓
Subscriber notificati
       ↓
Componenti leggono nuovo stato e si aggiornano
```

Questo ciclo è **deterministico, prevedibile e tracciabile**, il che rende Redux uno strumento particolarmente adatto a progetti complessi.

---

### 2. Structural Sharing e Shallow Comparison: ottimizzare i re-render

L’immutabilità è un concetto chiave, ma da sola non basta a garantire performance. Redux utilizza due strategie fondamentali per rendere efficiente la gestione dello stato: **structural sharing** e **shallow comparison**.

---

#### 2.1 Structural Sharing: riuso intelligente della memoria

Ogni volta che lo stato cambia, Redux crea un **nuovo oggetto**. Tuttavia, creare copie profonde dell’intero stato sarebbe costoso.
Per questo utilizza una tecnica chiamata **structural sharing** (*condivisione strutturale*).

L’idea è semplice:

* Solo la parte dello stato che cambia viene creata nuovamente.
* Tutte le altre parti rimangono le stesse e vengono **riutilizzate per riferimento**.

Esempio pratico:

```ts
const previousState = {
  counter: { value: 0 },
  user: { name: "Alice", age: 30 }
}

const newState = {
  counter: { value: 1 },         // nuovo oggetto creato
  user: previousState.user       // riuso dello stesso riferimento
}
```

Questo significa che, pur essendo un nuovo oggetto di stato globale, solo i rami effettivamente modificati cambiano riferimento.

Vantaggi:

* Aggiornamenti molto più veloci (non si copia l’intero stato)
* Confronti rapidi (solo le parti cambiate sono nuove)
* Minor uso di memoria

---

#### 2.2 Shallow Comparison: confronto superficiale per decidere il re-render

React-Redux utilizza il **confronto superficiale (shallow comparison)** per decidere se un componente deve ri-renderizzare dopo un cambiamento di stato.

Il confronto superficiale controlla solo il **primo livello delle proprietà** di un oggetto o array:

```ts
// Shallow comparison
prev !== next
```

Oppure:

```ts
// Per oggetti: confronta chiavi e valori immediati
prev.a === next.a && prev.b === next.b
```

Grazie allo structural sharing, se nulla è cambiato in una porzione di stato, il riferimento rimane lo stesso e il confronto `===` fallisce immediatamente, evitando costosi re-render.

Esempio:

```tsx
const count = useSelector(state => state.counter.value)
```

Se `state.counter.value` non cambia, `useSelector` non triggera un re-render, anche se altre parti dello stato globale sono cambiate.

---

#### 2.3 Effetti combinati

* **Structural sharing** minimizza il lavoro durante la creazione di un nuovo stato.
* **Shallow comparison** evita re-render inutili controllando se il riferimento è cambiato.

Insieme, queste due tecniche rendono Redux altamente performante anche su applicazioni di grandi dimensioni.

---

### Considerazioni finali

* Ogni chiamata a `dispatch()` segue un ciclo preciso e prevedibile: invio dell’azione, esecuzione del reducer, generazione del nuovo stato, aggiornamento dello store e notifica ai subscriber.
* L’immutabilità è fondamentale non solo per la correttezza ma anche per l’**ottimizzazione**.
* **Structural sharing** evita copie profonde dello stato e riutilizza i riferimenti non modificati.
* **Shallow comparison** sfrutta i riferimenti immutabili per decidere in modo rapido e sicuro se un componente deve ri-renderizzare.

Insieme, questi meccanismi permettono a Redux di mantenere uno stato centralizzato, coerente e scalabile senza compromettere le performance, anche in applicazioni complesse con decine di slice e migliaia di componenti.

---




























# Esempio

1. Il ciclo interno (`dispatch` → reducer → nuovo stato → `subscribe`) in **vanilla Redux**
2. L’uso in React con **Redux Toolkit**, dimostrando **structural sharing** e **shallow comparison**
3. Selettori memoizzati e accortezze per evitare re-render

---


# 2) React + RTK: structural sharing e shallow comparison

Struttura:

```
src/
  app/
    store.ts
    hooks.ts
  features/
    profile/
      profileSlice.ts
      selectors.ts
  components/
    ProfileHeader.tsx
    ProfileSettings.tsx
  App.tsx
  main.tsx
```

## `store.ts`

```ts
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import profileReducer from './features/profile/profileSlice'

export const store = configureStore({
  reducer: {
    profile: profileReducer,
  },
  // In dev: thunk + serializable/immutable checks attivi
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

```

## `hooks.ts`

```ts
// src/app/hooks.ts
import {type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

```

## `profileSlice.ts`

Slice con stato annidato: aggiorniamo solo un ramo per mostrare **structural sharing**.
Il codice appare “mutante”, ma Immer genera un **nuovo stato immutabile**.

```ts
// src/features/profile/profileSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type Preferences = {
  theme: 'light' | 'dark'
  locale: 'it' | 'en'
}

type ProfileState = {
  id: string
  name: string
  email: string
  preferences: Preferences
}

const initialState: ProfileState = {
  id: 'u1',
  name: 'Alice',
  email: 'alice@example.com',
  preferences: { theme: 'light', locale: 'it' },
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    rename(state, action: PayloadAction<string>) {
      state.name = action.payload
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      // Cambia SOLO preferences.theme → structural sharing:
      // - newState !== prevState
      // - newState.preferences !== prevState.preferences
      // - ma newState.email === prevState.email (stesso riferimento)
      state.preferences.theme = action.payload
    },
    setLocale(state, action: PayloadAction<'it' | 'en'>) {
      state.preferences.locale = action.payload
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload
    },
  },
})

export const { rename, setTheme, setLocale, setEmail } = profileSlice.actions
export default profileSlice.reducer

```

## `selectors.ts`

Selettori **minimi** e memoizzati con `createSelector`.

```ts
// src/features/profile/selectors.ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../store'


export const selectProfile = (s: RootState) => s.profile
export const selectName = (s: RootState) => s.profile.name
export const selectEmail = (s: RootState) => s.profile.email
export const selectPreferences = (s: RootState) => s.profile.preferences
export const selectTheme = (s: RootState) => s.profile.preferences.theme
export const selectLocale = (s: RootState) => s.profile.preferences.locale

// Esempio di derivazione memoizzata
export const selectDisplayLabel = createSelector(
  [selectName, selectEmail, selectLocale],
  (name, email, locale) => {
    const domain = email.split('@')[1] ?? ''
    return locale === 'it' ? `${name} – ${domain}` : `${name} – ${domain.toUpperCase()}`
  }
)

```

## `ProfileHeader.tsx`

Questo componente si aggiorna solo quando **name**, **email** o **locale** cambiano (grazie ai selettori mirati). Cambi di `theme` **non** causano re-render qui.

```tsx
// src/components/ProfileHeader.tsx
import { memo } from 'react'
import { useAppSelector } from '../hook'
import { selectDisplayLabel } from '../features/profile/selectors'


// React.memo + selector mirato = re-render solo quando serve
function ProfileHeaderBase() {
  const label = useAppSelector(selectDisplayLabel)
  return (
    <header style={headerStyle}>
      <h2 style={{ margin: 0 }}>{label}</h2>
    </header>
  )
}

const headerStyle: React.CSSProperties = {
  padding: 12,
  borderBottom: '1px solid #e5e7eb',
}

export default memo(ProfileHeaderBase)

```

## `ProfileSettings.tsx`

Questo componente legge e scrive solo il ramo `preferences`. Cambiare `theme` **non** impatta `ProfileHeader` grazie allo **shallow comparison** sui selettori diversi.

```tsx
// src/components/ProfileSettings.tsx
import { useAppDispatch, useAppSelector } from '../hook'
import { selectTheme, selectLocale } from '../features/profile/selectors'
import { setTheme, setLocale } from '../features/profile/profileSlice'

export default function ProfileSettings() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const locale = useAppSelector(selectLocale)

  // Cambia dinamicamente il background in base al tema selezionato
  const containerStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 16,
    transition: 'background 0.3s ease',
    background: theme === 'dark' ? '#1f2937' : '#f9fafb', // sfondo scuro o chiaro
    color: theme === 'dark' ? '#f9fafb' : '#111827',       // testo chiaro/scuro leggibile
  }

  return (
    <section style={containerStyle}>
      <h3 style={{ marginTop: 0 }}>Impostazioni</h3>

      <div style={row}>
        <label>Theme</label>
        <select
          value={theme}
          onChange={(e) => dispatch(setTheme(e.target.value as 'light' | 'dark'))}
        >
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select>
      </div>

      <div style={row}>
        <label>Locale</label>
        <select
          value={locale}
          onChange={(e) => dispatch(setLocale(e.target.value as 'it' | 'en'))}
        >
          <option value="it">it</option>
          <option value="en">en</option>
        </select>
      </div>

      <p style={{ marginTop: 16, fontStyle: 'italic', opacity: 0.8 }}>
        Tema attuale: <strong>{theme}</strong>
      </p>
    </section>
  )
}

const row: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  marginBottom: 8,
}

```

## `App.tsx`

```tsx
// src/App.tsx
import ProfileHeader from './components/ProfileHeader'
import ProfileSettings from './components/ProfileSettings'

export default function App() {
  return (
    <main style={layout}>
      <h1 style={{ marginBottom: 8 }}>Redux Toolkit – Structural Sharing Demo</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Cambiare il tema aggiorna solo i componenti che lo leggono.
      </p>

      <div style={grid}>
        <ProfileHeader />
        <ProfileSettings />
      </div>
    </main>
  )
}

const layout: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial',
  padding: 24,
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 16,
  alignItems: 'start',
}

```

## `main.tsx`

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)

```






























---

## 1. Cosa sono i *selector* e perché servono

In Redux, uno *selector* è semplicemente una **funzione pura** che legge lo stato globale e ne restituisce una porzione o una trasformazione utile.
Il suo ruolo è separare la **logica di lettura** dalla UI e dal reducer, così da mantenere il codice più:

* **Pulito e riutilizzabile**: possiamo usare lo stesso selector in decine di componenti.
* **Manutenibile**: se cambia la struttura dello stato, basta modificare il selector una sola volta.
* **Performante**: i selector possono essere *memoizzati*, cioè ricordano i risultati finché i dati non cambiano, evitando ricalcoli e re-render inutili.

In altre parole: **i reducer scrivono lo stato, i selector lo leggono.**

---

## 2. Spiegazione dei selector base

Nel tuo codice abbiamo diverse versioni di selector base:

```ts
export const selectProfile = (s: RootState) => s.profile
export const selectName = (s: RootState) => s.profile.name
export const selectEmail = (s: RootState) => s.profile.email
export const selectPreferences = (s: RootState) => s.profile.preferences
export const selectTheme = (s: RootState) => s.profile.preferences.theme
export const selectLocale = (s: RootState) => s.profile.preferences.locale
```

### Analisi riga per riga

* **`RootState`** è il tipo dell’intero stato globale definito nel tuo store (`ReturnType<typeof store.getState>`). Lo usiamo per avere **tipizzazione sicura** e autocompletamento quando accediamo allo stato.
* **`selectProfile`**: restituisce l’intero stato `profile`. Utile quando vuoi passare tutto il blocco a un componente.
* **`selectName`, `selectEmail`**: restituiscono proprietà primitive. Questi sono *selector mirati*: leggere solo ciò che serve riduce il rischio di re-render superflui.
* **`selectPreferences`, `selectTheme`, `selectLocale`**: estraggono porzioni più profonde dello stato. Anche qui la granularità è importante: più il selector è specifico, minore sarà la superficie di cambiamento che innesca un re-render.

**Perché è utile questa granularità:**
Se in un componente leggi solo `theme` con `useSelector(selectTheme)`, esso verrà ri-renderizzato **solo** quando cambia `theme`. Se invece leggessi l’intero `profile`, il componente si ri-renderizzerebbe per qualsiasi modifica a qualsiasi proprietà di `profile`.

---

## 3. `createSelector`: selettori derivati e memoization

La seconda parte del file introduce un concetto più avanzato ma fondamentale:

```ts
export const selectDisplayLabel = createSelector(
  [selectName, selectEmail, selectLocale],
  (name, email, locale) => {
    const domain = email.split('@')[1] ?? ''
    return locale === 'it' ? `${name} – ${domain}` : `${name} – ${domain.toUpperCase()}`
  }
)
```

### Cos’è `createSelector`

`createSelector` è una funzione di **Reselect** (inclusa in Redux Toolkit) che permette di creare *selector derivati* **memoizzati**.

* Un *selector derivato* non legge semplicemente lo stato, ma **calcola un nuovo valore a partire da esso**.
* Il risultato viene **memorizzato (memoizzato)** finché i valori di input non cambiano.
* Se le parti di stato lette sono uguali rispetto al precedente ciclo di render, Redux riutilizza il risultato precedente senza ricalcolare nulla.

---

### Cosa fa nello specifico `selectDisplayLabel`

1. Riceve tre selector di input: `selectName`, `selectEmail`, `selectLocale`.
2. Ogni volta che uno di questi cambia, ricalcola il valore derivato.
3. Se nessuno di essi cambia, restituisce l’ultimo risultato **senza eseguire la funzione** (grazie alla memoization).

Il risultato è una stringa formattata, ad esempio:

* Se `locale === 'it'`: `"Alice – example.com"`
* Se `locale === 'en'`: `"Alice – EXAMPLE.COM"`

---

### Perché usare `createSelector` è una best practice

1. **Performance**: evita ricalcoli inutili a ogni re-render. Se i dati non cambiano, il selettore non viene rieseguito.
2. **Clean code**: la UI riceve già i dati “pronti per essere mostrati” e non deve preoccuparsi di formattarli.
3. **Separazione delle responsabilità**: i componenti React si occupano solo di presentazione, non di logica.
4. **Predictability**: il risultato è deterministico e dipende esclusivamente dallo stato.

---

## 4. Come funziona la memoization dietro le quinte

La memoization funziona così:

* Ogni volta che chiami `selectDisplayLabel(state)`, Redux confronta i valori di input (`name`, `email`, `locale`) con quelli dell’ultima chiamata.
* Se sono identici (confronto **referenziale** per oggetti e **===** per primitivi), restituisce il risultato memorizzato.
* Se uno cambia, ricalcola il valore.

Esempio di comportamento:

| Stato precedente                                       | Stato attuale                                          | Ricalcolo? |
| ------------------------------------------------------ | ------------------------------------------------------ | ---------- |
| name: "Alice"                                          | name: "Alice"                                          | ❌ No       |
| email: "[alice@example.com](mailto:alice@example.com)" | email: "[alice@example.com](mailto:alice@example.com)" | ❌ No       |
| locale: "it"                                           | locale: "en"                                           | ✅ Sì       |

---

## 5. Best practice con i selector

* **Non fare calcoli nei componenti**: se un dato può essere derivato dallo stato, usa `createSelector`.
* **Separa sempre lettura e trasformazione**: riduci il carico logico nei componenti.
* **Rendi i selector riutilizzabili**: puoi usarli in più punti dell’app e nei test senza dover renderizzare componenti.
* **Mantieni i selector puri**: nessun side effect, nessuna chiamata API. Devono dipendere solo dallo stato e dai parametri.

---

## 6. In sintesi

| Concetto                                 | Scopo                                        | Benefici                               |
| ---------------------------------------- | -------------------------------------------- | -------------------------------------- |
| **Selector base**                        | Estraggono porzioni specifiche di stato      | Riutilizzabili, performanti, leggibili |
| **Selector derivato (`createSelector`)** | Calcolano valori a partire da altri selector | Memoization, performance, clean code   |
| **Granularità dei selector**             | Selezionare solo ciò che serve               | Riduzione dei re-render                |
| **Memoization**                          | Evita calcoli inutili se i dati non cambiano | Performance ottimali                   |

---

### Esempio di utilizzo nel componente:

```tsx
// ProfileHeader.tsx
import { useAppSelector } from '../app/hooks'
import { selectDisplayLabel } from '../features/profile/selectors'

export default function ProfileHeader() {
  const label = useAppSelector(selectDisplayLabel)
  return <h2>{label}</h2>
}
```

Qui il componente:

* Non conosce la struttura interna dello stato.
* Riceve già la stringa pronta.
* Si aggiorna solo quando `name`, `email` o `locale` cambiano, non per altri cambiamenti nello store.

---

### Conclusione

I **selector** sono uno degli strumenti più potenti di Redux perché separano la logica di lettura dallo stato, migliorano le performance e rendono il codice molto più mantenibile.
L’uso di `createSelector` è una best practice imprescindibile in applicazioni professionali, specialmente in quelle grandi dove centinaia di componenti potrebbero leggere porzioni di stato diverse.
Capire e utilizzare bene i selector significa sfruttare **tutta la potenza architetturale di Redux**.












































---

## 4. `configureStore`: cuore dell’architettura

### Introduzione

Se Redux è il motore dell’applicazione, lo **store** è il suo **cervello centrale**: contiene tutto lo stato globale, gestisce il flusso delle azioni, orchestra i reducer e notifica i componenti delle modifiche.
In Redux classico, creare lo store era un processo piuttosto verboso e manuale. Con Redux Toolkit, invece, questa operazione è diventata **più semplice, più sicura e più potente** grazie a una funzione chiave: `configureStore`.

---

### 1. Creazione dello store con riduttori multipli

#### Redux classico: la versione “lunga”

Nel Redux originale, creare uno store con più reducer richiedeva:

* Combinare manualmente i reducer con `combineReducers`
* Configurare i middleware con `applyMiddleware`
* Attivare DevTools manualmente

Esempio:

```ts
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import counterReducer from './counterReducer'
import authReducer from './authReducer'

const rootReducer = combineReducers({
  counter: counterReducer,
  auth: authReducer,
})

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
)
```

Questo approccio funziona, ma richiede **molto codice ripetitivo**, è **facile da sbagliare** e non offre protezioni o verifiche automatiche.

---

#### Redux Toolkit: la versione moderna

Con RTK, tutto questo si riduce a poche righe:

```ts
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

Vediamo cosa accade qui dietro le quinte:

1. **`reducer`**

   * Possiamo passare un singolo reducer o un oggetto di reducer multipli.
   * `configureStore` li combina automaticamente con `combineReducers` senza bisogno di scrivere nulla a mano.

2. **`getState()` e `dispatch`**

   * Vengono tipizzati automaticamente, migliorando l’esperienza con TypeScript.
   * Da qui deriviamo `RootState` e `AppDispatch`, che useremo nei custom hook.

3. **Struttura dello stato**

   * Ogni chiave dell’oggetto `reducer` corrisponde a un “ramo” dello stato globale.

```ts
// Stato globale risultante
{
  counter: { value: 0 },
  auth: { user: null, status: 'idle' }
}
```

---

#### Collegamento con i componenti

Grazie a `Provider`, lo store è disponibile ovunque nella tua app React:

```tsx
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

A questo punto puoi leggere lo stato con `useSelector` e inviare azioni con `useDispatch`.

---

### 2. Integrazione automatica dei middleware e DevTools

Uno dei vantaggi principali di `configureStore` è che non crea solo lo store, ma **configura anche tutto l’ecosistema Redux per te**.

Vediamolo in dettaglio.

---

#### 2.1 Middleware integrati di default

Ogni store creato con `configureStore` include automaticamente tre middleware fondamentali:

1. **`redux-thunk`**

   * Permette l’uso di azioni asincrone (`createAsyncThunk`).
   * Consente di scrivere funzioni invece di oggetti come azioni.

2. **`serializableCheck`**

   * Controlla che lo stato e le azioni siano sempre serializzabili.
   * Previene bug dovuti all’inserimento di oggetti complessi come `Date`, `Map`, `class`, ecc.

3. **`immutableCheck`**

   * Verifica che lo stato non sia mutato direttamente.
   * Aiuta a individuare bug in fase di sviluppo.

Questi middleware sono attivi solo in **modalità sviluppo**, quindi non hanno impatto sulle performance in produzione.

Esempio di configurazione custom:

```ts
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // disabilita il controllo se necessario
    }),
})
```

---

#### 2.2 DevTools integrati automaticamente

Redux DevTools è uno strumento potentissimo per:

* Tracciare ogni azione inviata
* Navigare nella storia dello stato (time travel debugging)
* Analizzare il payload delle azioni e l’evoluzione dello stato

Nel Redux classico era necessario configurarlo manualmente. Con RTK è **già incluso**:

* Se sei in ambiente `development`, i DevTools vengono abilitati automaticamente.
* Non serve aggiungere plugin o configurazioni extra.

```ts
export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production', // opzionale
})
```

---

### 3. Architettura risultante con `configureStore`

Grazie a `configureStore`, l’architettura Redux diventa molto più lineare e leggibile:

```
Action → Reducer → Store → View
            ↑
         configureStore
            ↓
     - Combina i reducer
     - Aggiunge i middleware
     - Attiva DevTools
     - Applica controlli di sicurezza
```

Questo approccio ha due grandi vantaggi didattici e pratici:

* **Standardizzazione:** tutti i progetti RTK hanno lo stesso punto d’ingresso (`store.ts`), con struttura chiara e riconoscibile.
* **Scalabilità:** aggiungere nuove feature richiede solo l’aggiunta di un nuovo slice e la registrazione nel `reducer`.

---

### 4. Takeaway didattico

| Funzionalità         | Redux classico              | Redux Toolkit (`configureStore`)                            |
| -------------------- | --------------------------- | ----------------------------------------------------------- |
| Creazione store      | Manuale (`createStore`)     | Automatica e tipizzata                                      |
| Combinazione reducer | Manuale (`combineReducers`) | Automatica                                                  |
| Middleware           | Manuale (`applyMiddleware`) | Automatici (`thunk`, `serializableCheck`, `immutableCheck`) |
| DevTools             | Configurazione manuale      | Attivi di default                                           |
| Tipizzazione         | Manuale e prolissa          | Automatica (`RootState`, `AppDispatch`)                     |

---

### Conclusione

`configureStore` rappresenta il **cuore dell’architettura Redux Toolkit**.
Risolve quasi tutti i punti deboli di Redux classico:

* Riduce drasticamente il boilerplate.
* Automatizza DevTools e middleware.
* Migliora la sicurezza e la manutenzione del codice.
* Fornisce tipizzazione robusta out-of-the-box.

Grazie a questa funzione, la creazione dello store passa da un’attività tecnica e ripetitiva a un’operazione **immediata, standardizzata e scalabile**, pronta per supportare anche progetti di livello enterprise.

---
































---

## Perché Redux richiede che stato e azioni siano “serializzabili”

Uno dei principi cardine di Redux è che **lo stato globale e le azioni devono essere semplici oggetti JavaScript serializzabili**.
In altre parole, tutto ciò che salvi nello store e tutto ciò che invii con `dispatch` dovrebbe poter essere:

* Convertito in **stringa JSON** senza perdere informazioni.
* Clonato facilmente senza rompere riferimenti.
* Salvato e ripristinato in altri contesti (per esempio DevTools o persistenza lato server).

Esempio corretto:

```ts
// Stato serializzabile 
{
  user: { id: '123', name: 'Alice' },
  settings: { darkMode: true },
  notifications: ['msg1', 'msg2']
}
```

Esempio **non** corretto:

```ts
// Stato non serializzabile 
{
  user: new UserClass('Alice'), // istanza di classe
  settings: { lastLogin: new Date() }, // oggetto Date
  data: new Map() // struttura non serializzabile
}
```

---

### Perché è un problema se non è serializzabile?

1. **DevTools e time travel smettono di funzionare**
   Redux DevTools salva ogni stato nel tempo per permettere il “time-travel debugging”.
   Se lo stato contiene oggetti non serializzabili (come `Date`, `Map`, `class` o funzioni), DevTools non può clonarlo o riprodurlo correttamente.

2. **Persistenza dello stato diventa inaffidabile**
   Se vuoi salvare lo stato nel `localStorage` o inviarlo al server, un oggetto non serializzabile può rompere la conversione `JSON.stringify`.

3. **Bug silenziosi e imprevedibili**
   Alcuni oggetti mantengono **riferimenti mutabili interni** (es. `Map`, `Set`), che possono cambiare senza passare da un’azione → questo rompe il principio di **immutabilità** e può causare re-render mancati o comportamenti non deterministici.

4. **Testing e debugging più complessi**
   I test diventano difficili se lo stato contiene istanze di classe con metodi o proprietà non previste.
   Inoltre, azioni con payload non serializzabili diventano difficili da ispezionare nei log.

---

## Esempi pratici di cosa evitare

###  Uso di `Date` direttamente nello stato

```ts
const initialState = {
  lastLogin: new Date() 
}
```

Perché è un problema:

* `new Date()` non è rappresentabile come JSON puro.
* DevTools mostrerà `[object Object]` e non potrai ripristinarlo.

 **Soluzione:** salva un valore serializzabile (timestamp o stringa):

```ts
const initialState = {
  lastLogin: Date.now() 
}
```

---

###  Uso di `Map` o `Set`

```ts
const initialState = {
  permissions: new Map([['read', true]])
}
```

Problema:

* `Map` non è serializzabile.
* DevTools e `JSON.stringify` la trasformeranno in `{}`.

 **Soluzione:** usa un oggetto o un array normale:

```ts
const initialState = {
  permissions: { read: true }
}
```

---

###  Istanza di classe nello stato

```ts
class User {
  constructor(public name: string) {}
}

const initialState = {
  user: new User('Alice') 
}
```

Problema:

* Le classi non sono serializzabili, non si può ispezionare lo stato.
* Le proprietà possono cambiare fuori dal flusso Redux.

 **Soluzione:** salva solo i dati primitivi:

```ts
const initialState = {
  user: { name: 'Alice' }  
}
```

---

## Come RTK ti aiuta: il `serializableCheck` middleware

Quando usi `configureStore`, Redux Toolkit **attiva automaticamente** un middleware chiamato `serializableCheck`.
Il suo compito è:

* Scansionare **ogni azione** inviata e **ogni stato** prodotto.
* Verificare se i dati sono serializzabili.
* Lanciare un **warning** nel terminale se trova oggetti “pericolosi” (come `Date`, `Map`, `Set`, classi, funzioni…).

Esempio di warning tipico:

```
A non-serializable value was detected in the state, in the path: 'user.lastLogin'.
Value: 2025-10-17T09:13:00.000Z
```

Questo non blocca l’esecuzione dell’app, ma ti avvisa che potresti avere problemi futuri con DevTools, persist, testing o debugging.

---

## Eccezioni: quando è accettabile violare la serializzabilità

In rari casi (ad esempio, quando gestisci socket, cancelli, o reference a DOM elements), potresti **voler salvare qualcosa di non serializzabile**.
RTK ti permette di **disabilitare o configurare** il controllo:

```ts
export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['connection.socket'],
        ignoredActions: ['socket/connect']
      }
    })
})
```

Ma è importante capire che **queste devono essere eccezioni consapevoli**, non la norma.

---

## In sintesi

| Elemento            | Serializzabile? | Alternativa consigliata     |
| ------------------- | --------------- | --------------------------- |
| `Date`              | ❌ No            | `Date.now()` o stringa ISO  |
| `Map` / `Set`       | ❌ No            | Oggetti o array             |
| Classi              | ❌ No            | Oggetti plain               |
| Funzioni / DOM refs | ❌ No            | Evitare nello stato globale |

**Regola d’oro:** lo stato Redux deve contenere **solo dati JSON-serializzabili**: oggetti, array, numeri, stringhe e booleani.

---







































Perfetto — questa è una delle parti **più avanzate e formative** del corso su Redux Toolkit: imparare a **costruire, comporre e utilizzare middleware personalizzati**.
Qui spiegheremo non solo **cos’è un middleware**, ma soprattutto **come funziona internamente**, **come scriverne più di uno correttamente**, e **come sfruttarli per potenziare il flusso delle azioni**.

---

## 4.3 Middleware personalizzati: costruzione, funzionamento e composizione

---

### 1. Cos’è davvero un middleware in Redux

Un **middleware** è una funzione che si inserisce **tra il momento in cui un’azione viene “dispatchata”** e il momento in cui questa azione raggiunge i **reducer**.
È un meccanismo per **intercettare, leggere, modificare o bloccare** le azioni in transito, oltre a eseguire **side-effect controllati** come logging, validazione, sicurezza o chiamate a servizi esterni.

Il ciclo completo di un’azione è sempre questo:

```
Component → dispatch(action)
           ↓
[Middleware 1] → [Middleware 2] → [Middleware 3] 
           ↓
Reducer → nuovo stato
           ↓
UI aggiornata
```

Ogni middleware è come un **“filtro” o “anello”** che l’azione deve attraversare.
Capire questa pipeline è cruciale: ti permette di **inserire logica globale in un punto unico dell’applicazione**, senza modificare i componenti o i reducer.

---

### 2. La firma di un middleware: come è fatto e come funziona

Un middleware in Redux ha sempre la stessa forma: è una **funzione a tre livelli**:

```ts
const myMiddleware = (storeAPI) => (next) => (action) => {
  // 1. codice prima che l’azione arrivi al reducer
  console.log('Azione ricevuta:', action)

  // 2. passiamo l’azione al prossimo middleware o al reducer
  const result = next(action)

  // 3. codice eseguito dopo che il reducer ha aggiornato lo stato
  console.log('Nuovo stato:', storeAPI.getState())

  return result
}
```

Vediamo i tre livelli nel dettaglio:

| Livello    | Parametri                | Significato                                                       |
| ---------- | ------------------------ | ----------------------------------------------------------------- |
| `storeAPI` | `{ getState, dispatch }` | Permette al middleware di leggere lo stato o inviare nuove azioni |
| `next`     | funzione                 | Fa avanzare l’azione al prossimo middleware o al reducer          |
| `action`   | qualsiasi oggetto        | L’azione originale inviata con `dispatch()`                       |

**Nota:** se non chiami `next(action)`, l’azione non arriverà mai al reducer (viene “bloccata”).

---

### 3. Esempio 1 – Logger personalizzato

Un logger è il middleware più classico: stampa l’azione ricevuta, lo stato precedente e lo stato successivo.

```ts
import { Middleware } from '@reduxjs/toolkit'

export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.group(`[LOGGER] ${action.type}`)
  console.log('Prev state:', store.getState())
  console.log('Action:', action)

  const result = next(action)

  console.log('Next state:', store.getState())
  console.groupEnd()
  return result
}
```

**Cosa fa:**

* Intercetta ogni azione prima che arrivi ai reducer.
* Mostra lo stato precedente.
* Lascia passare l’azione (`next(action)`).
* Mostra lo stato aggiornato.

---

### 4. Esempio 2 – Middleware per aggiungere metadati

Un middleware può anche **modificare l’azione prima che arrivi ai reducer**.
Questo è utile per aggiungere informazioni globali come timestamp, utente loggato, o ID di richiesta.

```ts
export const metadataMiddleware: Middleware = (store) => (next) => (action) => {
  const enhancedAction = {
    ...action,
    meta: {
      dispatchedAt: new Date().toISOString(),
      userId: store.getState().auth?.user?.id || 'guest',
    },
  }

  return next(enhancedAction)
}
```

**Cosa succede:**

* L’azione originale viene arricchita con un campo `meta`.
* I reducer ricevono direttamente l’azione arricchita.

---

### 5. Esempio 3 – Middleware di sicurezza

Un middleware può anche **bloccare o rifiutare certe azioni** se non rispettano condizioni specifiche.

```ts
export const authGuardMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState()

  // Blocca ogni azione che inizia con "admin/" se l’utente non è admin
  if (action.type.startsWith('admin/') && !state.auth.isAdmin) {
    console.warn(`[SECURITY] Azione bloccata: ${action.type}`)
    return
  }

  return next(action)
}
```

In questo caso, l’azione **non arriva mai ai reducer** se la condizione non è soddisfatta.

---

### 6. Registrare più middleware nello store

La vera potenza arriva quando vuoi usare **più middleware** insieme. Redux Toolkit rende questa operazione semplice e ordinata grazie alla funzione `middleware` dentro `configureStore`.

Esempio con più middleware personalizzati:

```ts
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './rootReducer'
import { loggerMiddleware } from './middlewares/logger'
import { metadataMiddleware } from './middlewares/metadata'
import { authGuardMiddleware } from './middlewares/authGuard'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(loggerMiddleware)       // 1. logga tutte le azioni
      .concat(metadataMiddleware)     // 2. aggiunge metadati
      .concat(authGuardMiddleware),   // 3. blocca azioni non autorizzate
})
```

L’ordine **è importante**:

* I middleware vengono eseguiti **nell’ordine in cui li concateni**.
* Ogni middleware riceve l’azione già modificata dal precedente.

Quindi nel flusso qui sopra:

```
dispatch(action)
  ↓
loggerMiddleware
  ↓
metadataMiddleware (l’azione ha ora il campo meta)
  ↓
authGuardMiddleware (può bloccare o lasciar passare)
  ↓
Reducer
```

---

### 7. Middleware e performance: consigli avanzati

Scrivere middleware è potentissimo, ma anche delicato. Alcune **best practice professionali**:

* **Evita operazioni pesanti** all’interno dei middleware (es. loop complessi, chiamate di rete bloccanti).
* **Non mutare mai l’azione originale** direttamente: crea sempre una copia (`{ ...action }`).
* **Chiama sempre `next(action)`**, a meno che tu non voglia *intenzionalmente* bloccare l’azione.
* **Log selettivo:** filtra le azioni loggate per tipo, altrimenti i log diventeranno ingestibili.
* **Ordina con logica:** ad esempio, un middleware di sicurezza dovrebbe essere eseguito prima di uno di logging, per evitare di loggare azioni non autorizzate.

---

### 8. Debugging con i middleware

Una volta compresa la pipeline, puoi usare i middleware per:

* **Monitorare tutte le azioni:** vedere in tempo reale cosa accade nello store.
* **Misurare performance:** confrontare i tempi tra dispatch e riduzione.
* **Tracciare errori globali:** catturare eccezioni e inviarle a un servizio di logging.

Esempio di performance middleware:

```ts
export const performanceMiddleware: Middleware = () => (next) => (action) => {
  const start = performance.now()
  const result = next(action)
  const duration = performance.now() - start
  console.log(`[PERF] ${action.type} ha impiegato ${duration.toFixed(2)}ms`)
  return result
}
```

---

## In sintesi: cosa devi ricordare

| Concetto            | Cosa significa                                                  | Quando usarlo                             |
| ------------------- | --------------------------------------------------------------- | ----------------------------------------- |
| Middleware          | Funzioni che intercettano le azioni prima dei reducer           | Logging, validazione, sicurezza, metadati |
| `storeAPI`          | Accesso a `dispatch` e `getState`                               | Per leggere stato o inviare nuove azioni  |
| `next(action)`      | Fa avanzare l’azione nella pipeline                             | Sempre necessario se non vuoi bloccarla   |
| Ordine              | L’ordine dei `.concat()` determina l’ordine di esecuzione       | Pianificalo con cura                      |
| Multipli middleware | Più middleware possono trasformare o filtrare l’azione a catena | Standard nelle app reali                  |

---






























# Demo Middleware

---

# Struttura

```
src/
  app/
    store.ts
    hooks.ts
  features/
    auth/
      authSlice.ts
    admin/
      adminSlice.ts
  middlewares/
    logger.ts
    authGuard.ts
    performance.ts
  components/
    AdminPanel.tsx
  App.tsx
  main.tsx
```

---

## src/features/auth/authSlice.ts

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type User = { id: string; name: string; isAdmin: boolean } | null

type AuthState = {
  user: User
}

const initialState: AuthState = {
  user: { id: 'u1', name: 'Alice', isAdmin: false },
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAsUser(state, action: PayloadAction<{ id: string; name: string }>) {
      state.user = { ...action.payload, isAdmin: false }
    },
    loginAsAdmin(state, action: PayloadAction<{ id: string; name: string }>) {
      state.user = { ...action.payload, isAdmin: true }
    },
    logout(state) {
      state.user = null
    },
  },
})

export const { loginAsUser, loginAsAdmin, logout } = authSlice.actions
export default authSlice.reducer

```

---

## src/features/admin/adminSlice.ts

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type AdminState = {
  executions: number
  lastJob?: { id: string; params: Record<string, unknown> }
}

const initialState: AdminState = {
  executions: 0,
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    runJob(state, action: PayloadAction<{ id: string; params?: Record<string, unknown> }>) {
      state.executions += 1
      state.lastJob = { id: action.payload.id, params: action.payload.params ?? {} }
    },
    reset(state) {
      state.executions = 0
      state.lastJob = undefined
    },
  },
})

export const { runJob, reset } = adminSlice.actions
export default adminSlice.reducer

```

---

## src/middlewares/logger.ts

```ts
import type { Middleware } from '@reduxjs/toolkit'

export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  // Log selettivo: evita rumore stampando solo ciò che serve
  const shouldLog =
    action.type.startsWith('admin/') ||
    action.type.startsWith('auth/')

  if (shouldLog) {
    const prev = store.getState()
    console.group(`[LOGGER] ${action.type}`)
    console.log('Prev state:', prev)
    console.log('Action:', action)
    const result = next(action)
    console.log('Next state:', store.getState())
    console.groupEnd()
    return result
  }

  return next(action)
}

```

---

## src/middlewares/authGuard.ts

```ts
import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export const authGuardMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Esempio di policy: blocca tutte le azioni "admin/*" se l’utente non è admin
  if (action.type.startsWith('admin/')) {
    const state = store.getState()
    const isAdmin = Boolean(state.auth.user?.isAdmin)
    if (!isAdmin) {
      console.warn(`[SECURITY] Azione bloccata: ${action.type}. Permessi insufficienti.`)
      return
    }
  }
  return next(action)
}

```

---

## src/middlewares/performance.ts

```ts
import type { Middleware } from '@reduxjs/toolkit'

export const performanceMiddleware: Middleware = () => (next) => (action) => {
  const start = performance.now()
  const result = next(action)
  const duration = performance.now() - start
  // Nota: il tempo include il passaggio attraverso il resto della pipeline + reducer
  console.log(`[PERF] ${action.type} in ${duration.toFixed(2)}ms`)
  return result
}

```

---

## src/app/store.ts

```ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import adminReducer from './features/admin/adminSlice'
import { loggerMiddleware } from './middlewares/logger'
import { authGuardMiddleware } from './middlewares/authGuard'
import { performanceMiddleware } from './middlewares/performance'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    // Ordine importante:
    // 1) authGuard prima del logger: evita di loggare azioni bloccate
    // 2) logger prima del performance se vuoi il timing del "post-reducer"; è soggettivo
    getDefaultMiddleware()
      .concat(authGuardMiddleware)
      .concat(loggerMiddleware)
      .concat(performanceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

```

---

## src/app/hooks.ts

```ts
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

```

---

## src/components/AdminPanel.tsx

```tsx
import { useAppDispatch, useAppSelector } from '../hooks'
import { loginAsAdmin, loginAsUser, logout } from '../features/auth/authSlice'
import { runJob, reset } from '../features/admin/adminSlice'

export default function AdminPanel() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const executions = useAppSelector((s) => s.admin.executions)
  const lastJob = useAppSelector((s) => s.admin.lastJob)

  const handleRunJob = () => {
    // Questo dispatch sarà bloccato se non admin (vedi authGuardMiddleware)
    dispatch(runJob({ id: crypto.randomUUID(), params: { priority: 'high' } }))
  }

  return (
    <section style={card}>
      <h2 style={{ marginTop: 0 }}>Admin Panel</h2>

      <div style={row}>
        <strong>User:</strong>
        <span>{user ? `${user.name} (${user.isAdmin ? 'admin' : 'user'})` : 'anonimo'}</span>
      </div>

      <div style={row}>
        <button onClick={() => dispatch(loginAsUser({ id: 'u2', name: 'Bob' }))}>Login user</button>
        <button onClick={() => dispatch(loginAsAdmin({ id: 'a1', name: 'Carol' }))}>Login admin</button>
        <button onClick={() => dispatch(logout())}>Logout</button>
      </div>

      <hr />

      <div style={row}>
        <button onClick={handleRunJob}>Esegui job</button>
        <button onClick={() => dispatch(reset())}>Reset contatore</button>
      </div>

      <p style={{ margin: '8px 0' }}>
        Esecuzioni: <strong>{executions}</strong>
      </p>

      <pre style={pre}>
        {lastJob ? JSON.stringify(lastJob, null, 2) : 'Nessun job eseguito'}
      </pre>

      <small>
        Prova: premi “Esegui job” da utente normale → middleware di sicurezza blocca l’azione. Effettua il login admin e riprova: l’azione passa, i reducer aggiornano lo stato, i middleware loggano e misurano le performance.
      </small>
    </section>
  )
}

const card: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  maxWidth: 560,
  display: 'flex',
  gap: 12,
  flexDirection: 'column',
}

const row: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
}

const pre: React.CSSProperties = {
  background: '#0b1020',
  color: '#e5e7eb',
  padding: 12,
  borderRadius: 8,
  maxHeight: 180,
  overflow: 'auto',
}

```

---

## src/App.tsx

```tsx
import AdminPanel from './components/AdminPanel'

export default function App() {
  return (
    <main style={layout}>
      <h1 style={{ marginBottom: 8 }}>Redux Toolkit – Middleware demo</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Logger, Auth Guard e Performance monitor in pipeline con configureStore.
      </p>
      <AdminPanel />
    </main>
  )
}

const layout: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial',
  padding: 24,
}

```

---

## src/main.tsx

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
```

---

# Note didattiche e operative

1. **Pipeline e ordine**

   * `authGuard` viene prima: blocca subito le azioni non autorizzate.
   * `logger` dopo: non logga ciò che è stato bloccato (meno rumore).
   * `performance` infine: misura la durata complessiva dell’elaborazione dell’azione (passaggio nei middleware + reducer).

2. **Purezza e prevedibilità**

   * I middleware **non** devono mutare lo stato direttamente; possono leggere con `getState()` e inviare altre azioni con `dispatch()` se serve.
   * Se non chiami `next(action)`, l’azione si ferma.

3. **Composizione e scalabilità**

   * Aggiungere nuovi middleware è banale: `.concat(newMiddleware)`.
   * Scomponi le responsabilità: ogni middleware fa una cosa sola, ma bene.

4. **Debugging**

   * Apri la console: vedrai i log del `loggerMiddleware`, i warning dell’`authGuard`, e i tempi del `performanceMiddleware`.
   * Usa Redux DevTools per osservare la timeline e lo stato.




































---

## Best practice – Tipizzazione e Hook personalizzati

---

### 1. Tipizzazione con `RootState` e `AppDispatch`

In un’applicazione React moderna scritta in TypeScript, **tipizzare correttamente Redux** è essenziale.
RTK semplifica molto questa parte, ma dobbiamo comunque creare due tipi fondamentali:

* `RootState` → rappresenta **l’intero stato globale** dell’applicazione.
* `AppDispatch` → rappresenta il tipo della funzione `dispatch` del nostro store.

---

#### 1.1 `RootState`: perché è importante

`RootState` è il tipo restituito da `store.getState()`.
Serve per:

* Tipizzare `useSelector` e selettori custom
* Garantire autocompletamento e intellisense in tutto il progetto
* Prevenire errori di accesso a proprietà inesistenti nello stato

Crearlo è semplice:

```ts
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import adminReducer from '../features/admin/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
})

// Tipo globale dello stato
export type RootState = ReturnType<typeof store.getState>
```

Ora `RootState` riflette esattamente la forma del tuo store:

```ts
// RootState è equivalente a:
type RootState = {
  auth: AuthState
  admin: AdminState
}
```

---

#### 1.2 `AppDispatch`: perché è altrettanto importante

`AppDispatch` è il tipo di `store.dispatch`.
Serve per:

* Tipizzare l’hook `useDispatch`
* Supportare `thunk` e altre azioni asincrone con autocompletamento corretto
* Evitare errori quando si passano azioni a `dispatch`

Esempio:

```ts
// src/app/store.ts
export type AppDispatch = typeof store.dispatch
```

---

### 2. Creare hook personalizzati: `useAppSelector` e `useAppDispatch`

Di default, React Redux esporta due hook:

* `useSelector` → per leggere dallo stato
* `useDispatch` → per inviare azioni

Il problema è che **non sono tipizzati** automaticamente con i tipi specifici del tuo store.
Questo significa che ogni volta dovresti scrivere:

```ts
const dispatch: AppDispatch = useDispatch()
const value = useSelector((state: RootState) => state.auth.user)
```

Questo approccio è scomodo e soggetto a errori.
La soluzione è creare **due hook personalizzati e tipizzati** una volta sola, e usarli ovunque.

---

#### 2.1 Creare `useAppDispatch`

```ts
// src/app/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// Hook tipizzato per dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
```

Ora puoi scrivere semplicemente:

```tsx
const dispatch = useAppDispatch()
dispatch(loginAsAdmin({ id: 'a1', name: 'Carol' }))
```

* `dispatch` conosce tutti i tipi delle azioni disponibili.
* Supporta anche i thunk con autocompletamento.

---

#### 2.2 Creare `useAppSelector`

```ts
// src/app/hooks.ts
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

Ora puoi scrivere:

```tsx
const user = useAppSelector((state) => state.auth.user)
```

* `state` è automaticamente riconosciuto come `RootState`.
* Ottieni autocompletamento su ogni ramo dello stato.
* Se sbagli a scrivere un campo (`state.auth.usr` invece di `state.auth.user`), TypeScript lo segnala subito.

---

### 3. Perché è una best practice imprescindibile

Questi due step sembrano piccoli, ma cambiano radicalmente la qualità del tuo codice:

| Senza tipizzazione                  | Con tipizzazione                           |
| ----------------------------------- | ------------------------------------------ |
| Nessun autocompletamento su `state` | Completamento automatico su ogni proprietà |
| Facile sbagliare campo o tipo       | Errori segnalati in compilazione           |
| Dispatch non riconosce i thunk      | Dispatch tipizzato supporta async          |
| Boilerplate per ogni componente     | Hook puliti e riutilizzabili               |

Inoltre:

* `useAppDispatch` e `useAppSelector` diventano **standard di progetto**.
* Puoi importarli ovunque senza pensare ai tipi.
* Se cambi il tipo dello store, i tipi si aggiornano automaticamente.

---

### 4. Best practice extra

* **Tipizza sempre i selettori**: anche se non usi `createSelector`, annota il tipo di ritorno quando serve.
* **Esporta `RootState` e `AppDispatch` solo da `store.ts`**: non ridefinirli mai altrove.
* **Evita `any` o `unknown` negli hook**: se li usi, stai perdendo i benefici di TypeScript.
* **Crea sempre i tuoi hook in `app/hooks.ts`**: tenerli in un file separato è uno standard diffuso in tutte le codebase professionali Redux.

---

### Esempio finale di utilizzo

```tsx
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { loginAsAdmin } from '../features/auth/authSlice'

export default function AdminButton() {
  const dispatch = useAppDispatch()
  const isAdmin = useAppSelector((state) => state.auth.user?.isAdmin)

  return (
    <button
      disabled={isAdmin}
      onClick={() => dispatch(loginAsAdmin({ id: 'a1', name: 'Carol' }))}
    >
      {isAdmin ? 'Sei già admin' : 'Diventa admin'}
    </button>
  )
}
```

---

## In sintesi

| Elemento         | Scopo                               | Vantaggio                                   |
| ---------------- | ----------------------------------- | ------------------------------------------- |
| `RootState`      | Tipizza lo stato globale            | Autocompletamento e sicurezza nei selettori |
| `AppDispatch`    | Tipizza il dispatch                 | Supporto per thunk e azioni tipizzate       |
| `useAppSelector` | Hook tipizzato per leggere lo stato | Nessun rischio di errori di campo           |
| `useAppDispatch` | Hook tipizzato per inviare azioni   | Dispatch con intellisense e tipo corretto   |

---

### Takeaway didattico

La tipizzazione corretta dello store e l’uso di hook personalizzati non sono “optional”: sono **fondamentali per lavorare con Redux Toolkit in modo professionale**.
Questi accorgimenti:

* Eliminano intere categorie di bug.
* Rendono l’esperienza di sviluppo molto più veloce e sicura.
* Aumentano la scalabilità della codebase e facilitano il lavoro in team.

In ogni progetto professionale Redux + TypeScript, questi hook sono considerati **parte integrante dell’architettura** e vengono creati fin dalle prime fasi dello sviluppo.





























---

# Esercizio: “Admin toggle, Todos, Tema scuro — tutto via Store”

## Obiettivi

* Usare **RTK** per gestire **auth**, **ui/theme**, **todos** senza passare props.
* Abilitare azioni **add/remove** sui todos **solo** se l’utente è **admin**.
* Applicare un **tema scuro/chiaro** con render condizionale sul layout.
* (Opzionale) Bloccare le azioni vietate anche a livello store con un **middleware**.

---

## Struttura progetto (attesa)

```
src/
  app/
    store.ts
    hooks.ts
  features/
    auth/
      authSlice.ts        // user: { name, isAdmin }
    ui/
      uiSlice.ts          // theme: 'light' | 'dark'
    todos/
      todosSlice.ts       // items: { id, text }[]
      selectors.ts        // selettori mirati/memoizzati se servono
  middlewares/
    authGuard.ts          // opzionale: blocca add/remove se !isAdmin
    logger.ts             // opzionale: log selettivo
  components/
    AdminToggle.tsx       // switch admin/user (tutto via store)
    ThemeSelector.tsx     // switch light/dark (tutto via store)
    TodosPanel.tsx        // wrapper area todos
    TodosControls.tsx     // input + add (disabilitato se !isAdmin)
    TodosList.tsx         // elenco + delete per item (disabilitato se !isAdmin)
  App.tsx
  main.tsx
```

---

## Requisiti funzionali

### 1) Auth (admin toggle)

* Stato: `auth.user = { name: string; isAdmin: boolean }`.
* Azioni:

  * `setAdmin(isAdmin: boolean)`
  * (facoltativo) `setName(name: string)`
* Componente `AdminToggle`:

  * Legge `isAdmin` dallo store.
  * Con un toggle/radio, esegue `dispatch(setAdmin(true|false))`.
  * Mostra un badge “Admin” o “User”.

### 2) UI / Tema scuro

* Stato: `ui.theme = 'light' | 'dark'` (default `light`).
* Azioni:

  * `setTheme('light'|'dark')`.
* Componente `ThemeSelector`:

  * Legge `theme` e lo aggiorna con `dispatch(setTheme(...))`.
* In `App`:

  * Applica **sfondo** e **colore testo** condizionali in base a `theme` (tutto via selector):

    ```tsx
    const theme = useAppSelector(s => s.ui.theme)
    <main style={{
      background: theme === 'dark' ? '#111' : '#fafafa',
      color:      theme === 'dark' ? '#fafafa' : '#111'
    }}>
    ```

### 3) Todos (lista + permessi admin)

* Stato: `todos.items = { id: string; text: string }[]` (iniziale vuota).
* Azioni:

  * `addTodo(text: string)` → push con `id` generato.
  * `removeTodo(id: string)`.
* `TodosControls`:

  * Input controllato locale per il testo.
  * Bottone “Add” → `dispatch(addTodo(text))`.
  * Se `!isAdmin`, il bottone è **disabled** e mostra un hint (“Solo admin”).
* `TodosList`:

  * Legge `items` e renderizza la lista.
  * Bottone “Delete” per ogni item → `dispatch(removeTodo(id))`.
  * Se `!isAdmin`, i bottoni “Delete” sono **disabled** e mostrano hint.

---

## Requisiti tecnici

* **Zero prop drilling**: tutti i componenti leggono stato via `useAppSelector` e inviano azioni via `useAppDispatch`.
* **Slice RTK** con reducer “mutanti” (Immer si occupa dell’immutabilità).
* **Hooks tipizzati**:

  ```ts
  export const useAppDispatch = () => useDispatch<AppDispatch>()
  export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
  ```
* **Store** con `configureStore({ reducer: { auth, ui, todos }, middleware: getDefaultMiddleware() ... })`.

---

## Middleware (opzionale ma consigliato)

### `authGuard` (store-level)

* Blocca `todos/addTodo` e `todos/removeTodo` se `!state.auth.user.isAdmin`.
* Stampa un warning in console: `"[SECURITY] Azione bloccata: <type>"`.
* Mantieni comunque la **guard UI** (bottoni disabilitati): UX + sicurezza.

### `logger` (facoltativo)

* Logga solo azioni `auth/*`, `ui/*`, `todos/*` con prev/next state.

**Ordine suggerito**:

1. `authGuard`
2. `logger`
3. default middleware RTK

---

## API minime attese (pseudo-TS)

### `authSlice.ts`

```ts
type AuthState = { user: { name: string; isAdmin: boolean } }
initialState = { user: { name: 'Alice', isAdmin: false } }
reducers: {
  setAdmin(state, action: PayloadAction<boolean>) { state.user.isAdmin = action.payload }
  setName(state, action: PayloadAction<string>)   { state.user.name = action.payload }
}
```

### `uiSlice.ts`

```ts
type UIState = { theme: 'light' | 'dark' }
initialState = { theme: 'light' }
reducers: {
  setTheme(state, action: PayloadAction<'light'|'dark'>) { state.theme = action.payload }
}
```

### `todosSlice.ts`

```ts
type TodosState = { items: { id: string; text: string }[] }
initialState = { items: [] }
reducers: {
  addTodo(state, action: PayloadAction<string>) {
    state.items.push({ id: crypto.randomUUID(), text: action.payload })
  },
  removeTodo(state, action: PayloadAction<string>) {
    state.items = state.items.filter(t => t.id !== action.payload)
  }
}
```





























---

## 5. `createSlice`: riduzione del boilerplate e immutabilità automatica

---

### 1. Cos’è `createSlice` e perché è il cuore di RTK

`createSlice` è l’API che ha reso Redux Toolkit così popolare.
Il suo obiettivo è semplice ma rivoluzionario: **eliminare la verbosità del Redux classico** e **automatizzare tutto ciò che prima dovevamo scrivere a mano**.

Nel Redux tradizionale, ogni feature richiedeva:

* una costante per l’action type
* un action creator
* un caso nel reducer
* l’aggiornamento dello stato con sintassi immutabile

Con `createSlice`, tutte queste operazioni si condensano in **una singola dichiarazione** leggibile, scalabile e facilmente mantenibile.

---

### 2. Struttura di base di `createSlice`

La struttura è composta da tre elementi fondamentali:

1. **`name`** – il nome univoco del “pezzo” di stato gestito dallo slice
2. **`initialState`** – lo stato iniziale di quel ramo dello store
3. **`reducers`** – un oggetto con funzioni che descrivono come lo stato cambia

Esempio semplice:

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type CounterState = { value: number }

const initialState: CounterState = { value: 0 }

const counterSlice = createSlice({
  name: 'counter',              // 1. nome dello slice
  initialState,                 // 2. stato iniziale
  reducers: {                   // 3. funzioni che modificano lo stato
    increment(state) {
      state.value += 1
    },
    decrement(state) {
      state.value -= 1
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
    reset() {
      return initialState
    }
  },
})

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions
export default counterSlice.reducer
```

---

### 3. Spiegazione riga per riga

* **`name`**
  Serve come prefisso per tutti i tipi di azione generati.
  Ad esempio:

  * `counter/increment`
  * `counter/decrement`

* **`initialState`**
  Rappresenta lo stato iniziale del ramo di stato gestito da questo slice.
  Quando lo store viene creato, questo valore viene utilizzato come stato iniziale.

* **`reducers`**
  È un oggetto in cui ogni chiave è il nome di un’azione, e il valore è la funzione “reducer” che definisce **come cambia lo stato** in risposta a quell’azione.

---

### 4. Action creators automatici

Ogni funzione dentro `reducers` genera automaticamente:

1. **Un action type**

   * es: `counter/increment`
2. **Un action creator**

   * es: `increment()`
   * es: `incrementByAmount(5)`

Non serve più scrivere:

```ts
// Redux classico
const INCREMENT = 'INCREMENT'
const increment = () => ({ type: INCREMENT })
```

Con RTK:

```ts
dispatch(increment())           // { type: "counter/increment" }
dispatch(incrementByAmount(5))  // { type: "counter/incrementByAmount", payload: 5 }
```

Tutto è generato automaticamente, riducendo drasticamente il rischio di errori e typo.

---

### 5. Tipizzazione automatica con `PayloadAction`

Quando un’azione accetta un parametro (`payload`), possiamo tipizzarlo facilmente usando `PayloadAction<T>`:

```ts
incrementByAmount(state, action: PayloadAction<number>) {
  state.value += action.payload
}
```

* `action.payload` sarà automaticamente di tipo `number`.
* TypeScript segnalerà un errore se inviamo un valore non valido:

```ts
dispatch(incrementByAmount('abc')) // ❌ Errore di tipo
```

Questo livello di sicurezza non era possibile nel Redux classico senza molto codice aggiuntivo.

---

### 6. Immutabilità automatica con Immer

Una delle caratteristiche più potenti di `createSlice` è che permette di **scrivere reducer come se modificassero direttamente lo stato**, ma senza mai violare l’immutabilità.

Nel Redux classico:

```ts
// ❌ Vietato modificare direttamente lo stato
case INCREMENT:
  return { ...state, value: state.value + 1 }
```

Con RTK:

```ts
increment(state) {
  state.value += 1  // ✅ sembra mutare, ma Immer crea un nuovo stato immutabile
}
```

Cosa succede dietro le quinte:

* Immer crea una copia *draft* dello stato.
* Registra tutte le modifiche fatte all’oggetto `state`.
* Alla fine, produce un **nuovo stato immutabile** usando *structural sharing*.

Questo elimina errori comuni come mutazioni accidentali e rende il codice molto più leggibile.

---

### 7. Cosa esporta uno slice

Ogni `createSlice` produce automaticamente tre cose fondamentali:

1. **Reducer principale**

   * esportato come `counterSlice.reducer`
   * usato nello store:

     ```ts
     configureStore({ reducer: { counter: counterReducer } })
     ```

2. **Action creators**

   * esportati da `counterSlice.actions`
   * pronti da usare con `dispatch()`

3. **Action types**

   * generati automaticamente con prefisso `name`
   * usati internamente da Redux e DevTools

---

### 8. Esempio completo di utilizzo in un componente

```tsx
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { increment, decrement, incrementByAmount } from '../features/counter/counterSlice'

export default function Counter() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <div>
      <h2>Contatore: {count}</h2>
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  )
}
```

---

## In sintesi

| Elemento                   | Cosa fa                               | Vantaggio                                    |
| -------------------------- | ------------------------------------- | -------------------------------------------- |
| `name`                     | Prefisso per action types             | Evita collisioni e rende il codice leggibile |
| `initialState`             | Stato iniziale del ramo               | Inizializzazione chiara e tipizzata          |
| `reducers`                 | Logica di aggiornamento dello stato   | Scrittura più leggibile e concisa            |
| Action creators automatici | Creati automaticamente da RTK         | Nessun rischio di typo, meno boilerplate     |
| `PayloadAction`            | Tipizzazione del payload              | Controlli di tipo statici                    |
| Immer integrato            | Gestisce l’immutabilità in automatico | Codice più semplice e sicuro                 |

---






































---

## Approfondimento: `extraReducers` per gestire gli effetti tra più slice

---

### 1. Perché `extraReducers` è fondamentale in architetture complesse

In un’applicazione reale con Redux Toolkit, ogni *slice* rappresenta una **parte autonoma dello stato globale**: autenticazione, profilo utente, carrello, notifiche, ecc.
Il problema è che, per quanto autonomi, questi slice **non vivono nel vuoto**: devono spesso reagire ad azioni emesse da altri slice.

Esempi concreti:

* Quando un utente effettua il `logout`, il profilo, le preferenze e la cronologia devono essere resettati.
* Quando il carrello viene confermato, il modulo `orders` deve creare un ordine e quello `notifications` mostrare un messaggio.
* Quando un utente cambia lingua, tutti i moduli che dipendono dal `locale` devono aggiornarsi.

**Senza `extraReducers`**, questi comportamenti richiederebbero:

* Dispatch multipli da un singolo componente (fragile e difficile da mantenere).
* Accoppiamento diretto tra slice (violando il principio di separazione delle responsabilità).

Con `extraReducers`, ogni slice può **reagire autonomamente** alle azioni emesse da altri, mantenendo un’architettura **decoupled, scalabile e pulita**.

---

### 2. Come funziona `extraReducers`

All’interno di `createSlice`, oltre ai `reducers` (che gestiscono le proprie azioni), possiamo aggiungere un campo opzionale `extraReducers`.
Qui definiamo **come lo slice deve reagire ad azioni non definite al suo interno**.

```ts
extraReducers: (builder) => {
  builder.addCase(azioneDiUnAltroSlice, (state, action) => {
    // aggiorna lo stato in base a quell'azione
  })
}
```

Dietro le quinte, Redux Toolkit registra queste reazioni come se fossero normali “case” del reducer.
L’unica differenza è che **l’azione non è stata generata da questo slice**, ma da un altro.

---

### 3. Caso base: reset del profilo al logout

Immagina due slice:

* `authSlice` → gestisce login/logout
* `profileSlice` → gestisce dati utente

Quando viene dispatchata `logout`, vogliamo che anche il `profileSlice` si resetti.

#### authSlice.ts

```ts
import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: { isAuthenticated: false },
  reducers: {
    login(state) {
      state.isAuthenticated = true
    },
    logout(state) {
      state.isAuthenticated = false
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
```

#### profileSlice.ts

```ts
import { createSlice } from '@reduxjs/toolkit'
import { logout } from '../auth/authSlice'

const initialState = { name: '', email: '' }

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile(state, action) {
      state.name = action.payload.name
      state.email = action.payload.email
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const { updateProfile } = profileSlice.actions
export default profileSlice.reducer
```

 Risultato:

* `auth/logout` viene dispatchata una sola volta.
* `authSlice` aggiorna lo stato di autenticazione.
* `profileSlice` si resetta in automatico.
* Nessun componente deve sapere che due slice sono coinvolti.

---

### 4. Gestire effetti tra **3 o più slice**

Questo pattern scala perfettamente anche su più moduli.
Esempio: quando l’utente effettua il logout vogliamo:

* Cancellare i dati del profilo (`profileSlice`)
* Svuotare il carrello (`cartSlice`)
* Eliminare le notifiche (`notificationsSlice`)

Tutti questi slice possono “ascoltare” la stessa azione:

```ts
// profileSlice.ts
builder.addCase(logout, () => initialState)

// cartSlice.ts
builder.addCase(logout, () => ({ items: [] }))

// notificationsSlice.ts
builder.addCase(logout, () => [])
```

 Nessuno di questi slice conosce l’esistenza degli altri.
 Se domani aggiungiamo un nuovo modulo (`activitySlice`), basta aggiungere un altro `addCase` senza modificare codice altrove.

---

### 5. Effetti a catena e coordinamento tra moduli

Un altro caso comune è quando un’azione di un modulo **deve attivare un effetto in un altro modulo**.

Esempio: quando l’ordine viene completato (`order/checkoutSuccess`):

* Il carrello deve svuotarsi
* Le notifiche devono mostrare un messaggio
* La cronologia ordini deve aggiornarsi

#### cartSlice.ts

```ts
import { createSlice } from '@reduxjs/toolkit'
import { checkoutSuccess } from '../orders/ordersSlice'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(checkoutSuccess, () => ({ items: [] }))
  },
})
```

#### notificationsSlice.ts

```ts
import { createSlice } from '@reduxjs/toolkit'
import { checkoutSuccess } from '../orders/ordersSlice'

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [] as string[],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(checkoutSuccess, (state) => {
      state.push('Ordine completato con successo!')
    })
  },
})
```

 Il flusso è perfettamente orchestrato **senza un singolo dispatch in più**.
L’evento (`checkoutSuccess`) è il punto centrale, e tutti i moduli reagiscono autonomamente.

---

### 6. Gestione avanzata: pattern “slice reattivo”

Un pattern usato nelle architetture enterprise è il cosiddetto **“slice reattivo”**: slice che **non generano azioni proprie**, ma servono esclusivamente a reagire ad azioni esterne e trasformarle in stato.

Esempio: `auditSlice` per tenere traccia delle azioni eseguite nell’app:

```ts
import { createSlice } from '@reduxjs/toolkit'

const auditSlice = createSlice({
  name: 'audit',
  initialState: [] as string[],
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.endsWith('/fulfilled'),
      (state, action) => {
        state.push(`Azione completata: ${action.type}`)
      }
    )
  },
})

export default auditSlice.reducer
```

 Questo slice non esporta **nessuna azione propria**, ma resta fondamentale per funzionalità trasversali (monitoraggio, log, analytics).

---

### 7. Best practice architetturali

Quando inizi a costruire applicazioni grandi con Redux Toolkit, `extraReducers` diventa lo **strumento architetturale principale** per orchestrare comportamenti.
Ecco alcune best practice usate nei progetti enterprise:

| Best Practice                     | Descrizione                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| **Evita dipendenze dirette**      | Non importare lo stato di altri slice, importa solo le loro azioni.                    |
| **Un’azione = più reazioni**      | Pensa ogni azione come un “evento globale” a cui più slice possono reagire.            |
| **Nomina chiara delle azioni**    | Nomi descrittivi (`auth/logout`, `order/checkoutSuccess`) facilitano la tracciabilità. |
| **Comportamenti atomici**         | Ogni slice deve occuparsi solo della sua parte di reazione.                            |
| **Slice reattivi**                | Usa slice che servono solo a reagire a eventi globali per log, audit o metadati.       |
| **Evita side-effect nei reducer** | Mantieni i reducer puri: se serve logica asincrona, delegala a thunk o middleware.     |

---

### 8. Debugging e DevTools: vantaggi reali

Uno dei maggiori vantaggi di questo approccio è che il flusso delle azioni rimane **esplicito e tracciabile**:

* Ogni azione appare in DevTools una sola volta.
* Puoi “navigare” tra i cambiamenti di stato di slice diversi senza confusione.
* Se qualcosa non si aggiorna correttamente, è facilissimo capire quale slice non ha reagito come previsto.

---

## In sintesi – Il potere di `extraReducers` tra slice

| Concetto             | Funzione                                    | Beneficio                           |
| -------------------- | ------------------------------------------- | ----------------------------------- |
| `extraReducers`      | Reagisce ad azioni esterne                  | Disaccoppia e coordina moduli       |
| `builder.addCase`    | Risponde a eventi specifici                 | Comunicazione diretta e precisa     |
| Multi-slice reaction | Più slice reagiscono alla stessa azione     | Orchestrazione pulita e scalabile   |
| Slice reattivi       | Non emettono azioni, ma reagiscono ad altre | Ottimo per log, tracking, analytics |
| Debug centralizzato  | Tutto il flusso è visibile in DevTools      | Debug rapido e affidabile           |

---



































---

## 6. Stato normalizzato e `createEntityAdapter`

---

### 1. Il problema: gestire liste di dati nel modo “naïf”

Quando gestiamo collezioni di oggetti nello stato globale (ad esempio utenti, prodotti, post…), la forma più intuitiva è spesso un **array**:

```ts
state = {
  users: [
    { id: 'u1', name: 'Alice', age: 24 },
    { id: 'u2', name: 'Bob', age: 30 },
    { id: 'u3', name: 'Charlie', age: 28 }
  ]
}
```

Questa rappresentazione è *facile* da scrivere, ma **diventa rapidamente un problema** in progetti reali:

* **Accesso inefficiente:** per trovare un utente devi fare `.find()`, O(n).
* **Aggiornamenti complessi:** modificare un elemento richiede clonare tutto l’array.
* **Rischio di duplicazione:** lo stesso utente può apparire più volte con dati diversi.
* **Rerender inutili:** ogni modifica all’array può forzare il re-render di tutti i componenti.

In applicazioni più grandi, tutto questo rallenta la UI e rende lo stato difficile da mantenere.

---

### 2. La soluzione: normalizzare lo stato

La **normalizzazione** è un concetto preso in prestito dal mondo dei database: invece di salvare i dati come array, li salvi in una **mappa per ID**.
Lo stato normalizzato è composto da due chiavi:

* `ids`: un array con tutti gli ID in ordine
* `entities`: un oggetto con ogni entità indicizzata per ID

Esempio dello stesso stato normalizzato:

```ts
state = {
  ids: ['u1', 'u2', 'u3'],
  entities: {
    u1: { id: 'u1', name: 'Alice', age: 24 },
    u2: { id: 'u2', name: 'Bob', age: 30 },
    u3: { id: 'u3', name: 'Charlie', age: 28 }
  }
}
```

 Ora abbiamo:

* Accesso a O(1): `state.entities['u2']`
* Aggiornamenti semplici: modifichi solo l’oggetto necessario
* Nessuna duplicazione: un utente è definito in un solo posto
* Rerender ridotti: cambiano solo le parti realmente toccate

---

### 3. `createEntityAdapter`: il modo idiomatico per farlo con RTK

Redux Toolkit fornisce `createEntityAdapter` per **creare automaticamente uno stato normalizzato e funzioni CRUD immutabili**.
In altre parole: non devi più scrivere a mano logica per aggiungere, aggiornare o cancellare elementi.

---

### 4. Creare uno slice con `createEntityAdapter` (passo per passo)

#### a) Definisci il tipo di dato

```ts
// src/features/users/types.ts
export type User = {
  id: string
  name: string
  age: number
}
```

---

#### b) Crea l’adapter e lo stato iniziale

```ts
// src/features/users/usersSlice.ts
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import type { User } from './types'

// 1. Creiamo l'adapter per l'entità "User"
const usersAdapter = createEntityAdapter<User>()

// 2. Creiamo uno stato iniziale normalizzato
const initialState = usersAdapter.getInitialState()
```

Ora `initialState` sarà:

```ts
{
  ids: [],
  entities: {}
}
```

---

#### c) Definisci il slice e usa i metodi dell’adapter

```ts
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Sostituisce tutto lo stato con una nuova lista
    setAllUsers: usersAdapter.setAll,

    // Aggiunge un singolo utente
    addUser: usersAdapter.addOne,

    // Aggiunge o aggiorna automaticamente
    upsertUser: usersAdapter.upsertOne,

    // Rimuove utenti specifici
    removeUsers: usersAdapter.removeMany,
  },
})

export const { setAllUsers, addUser, upsertUser, removeUsers } = usersSlice.actions
export default usersSlice.reducer
```

 Ora hai uno slice completo con **CRUD pronto all’uso** e stato normalizzato.

---

### 5. Esempi pratici di utilizzo

#### a) Aggiungere utenti

```ts
dispatch(addUser({ id: 'u1', name: 'Alice', age: 24 }))
dispatch(addUser({ id: 'u2', name: 'Bob', age: 30 }))
```

Lo stato diventa:

```ts
{
  ids: ['u1', 'u2'],
  entities: {
    u1: { id: 'u1', name: 'Alice', age: 24 },
    u2: { id: 'u2', name: 'Bob', age: 30 }
  }
}
```

---

#### b) Aggiornare un utente

```ts
dispatch(upsertUser({ id: 'u1', name: 'Alice', age: 25 }))
```

Solo l’entità `u1` verrà aggiornata, senza toccare il resto dello stato.

---

#### c) Rimuovere più utenti

```ts
dispatch(removeUsers(['u1', 'u2']))
```

Tutti gli ID e le entità corrispondenti saranno rimossi.

---

### 6. Stato arricchito con campi extra

Spesso hai bisogno di informazioni aggiuntive oltre alla lista.
Puoi estendere lo stato iniziale aggiungendo proprietà custom:

```ts
const initialState = usersAdapter.getInitialState({
  status: 'idle',
  selectedUserId: null as string | null,
})
```

Ora il tuo stato sarà:

```ts
{
  ids: [],
  entities: {},
  status: 'idle',
  selectedUserId: null
}
```

---

### 7. Creare selettori automatici

L’adapter può generare automaticamente selettori ottimizzati per leggere i dati:

```ts
// src/features/users/usersSelectors.ts
import type { RootState } from '../../app/store'

export const {
  selectAll: selectAllUsers,         // → tutti gli utenti
  selectById: selectUserById,        // → utente per ID
  selectIds: selectUserIds,          // → solo gli ID
  selectEntities: selectUserEntities // → oggetto entities
} = usersAdapter.getSelectors((state: RootState) => state.users)
```

Uso nei componenti:

```tsx
import { useAppSelector } from '../../app/hooks'
import { selectAllUsers, selectUserById } from './usersSelectors'

function UsersList() {
  const users = useAppSelector(selectAllUsers)
  const bob = useAppSelector((state) => selectUserById(state, 'u2'))

  return (
    <>
      <h2>Lista utenti</h2>
      {users.map(u => <p key={u.id}>{u.name}</p>)}

      <h3>Utente selezionato</h3>
      <p>{bob?.name}</p>
    </>
  )
}
```

 Questi selettori sono **velocissimi** e non causano re-render inutili, perché sfruttano `shallowEqual` e la struttura normalizzata.

---

### 8. Ordinamento automatico con `sortComparer` (opzionale)

Puoi chiedere all’adapter di **mantenere l’ordine automatico** degli ID in base a un criterio:

```ts
const usersAdapter = createEntityAdapter<User>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})
```

Ora ogni volta che aggiungi o aggiorni utenti, l’array `ids` sarà **già ordinato alfabeticamente**, senza bisogno di `.sort()` manuali nei componenti.

---

### 9. Best practice con `createEntityAdapter`

| Best Practice                                 | Spiegazione                                                       |
| --------------------------------------------- | ----------------------------------------------------------------- |
| **Usalo per ogni lista dinamica**             | Post, prodotti, utenti, notifiche: se è una lista, normalizzala   |
| **Non manipolare mai `entities` manualmente** | Usa sempre le funzioni dell’adapter per garantire consistenza     |
| **Estendi lo stato con info globali**         | Aggiungi `status`, `error`, `selectedId` al bisogno               |
| **Usa i selettori generati**                  | Sono ottimizzati e leggibili                                      |
| **Aggiungi `sortComparer` se serve ordine**   | Evita ordinamenti manuali costosi nel rendering                   |
| **Combina con `extraReducers`**               | Perfetto per reagire a eventi globali (es. reset lista al logout) |

---

### 10. Esempio finale completo

```ts
// src/features/users/usersSlice.ts
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export type User = { id: string; name: string; age: number }

const usersAdapter = createEntityAdapter<User>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

const initialState = usersAdapter.getInitialState({
  status: 'idle',
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setAllUsers: usersAdapter.setAll,
    addUser: usersAdapter.addOne,
    upsertUser: usersAdapter.upsertOne,
    removeUser: usersAdapter.removeOne,
  },
})

export const { setAllUsers, addUser, upsertUser, removeUser } = usersSlice.actions
export default usersSlice.reducer

// Selettori
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
} = usersAdapter.getSelectors((state: RootState) => state.users)
```

---

## In sintesi

| Concetto                  | Cosa fa                                             | Vantaggio                          |
| ------------------------- | --------------------------------------------------- | ---------------------------------- |
| **Normalizzazione**       | Rappresenta i dati come `ids` + `entities`          | Performance e consistenza migliori |
| **`createEntityAdapter`** | Automatizza CRUD e normalizzazione                  | Codice più pulito e sicuro         |
| **Funzioni integrate**    | `setAll`, `addOne`, `upsertOne`, `removeMany`, ecc. | Aggiornamenti facili e immutabili  |
| **Selettori generati**    | Accesso veloce e ottimizzato ai dati                | UI reattiva e senza sprechi        |
| **sortComparer**          | Mantiene automaticamente l’ordine                   | Nessun `.sort()` manuale           |

---









































---

## 6.2 `createEntityAdapter` avanzato: relazioni, selettori derivati e integrazione tra slice

In questa sezione vedremo:

1. **Gestione di relazioni 1-N e N-N** tra entità (es. `users` → `posts`)
2. **Selettori derivati complessi** (filtri, aggregazioni, composizione)
3. **Integrazione con `extraReducers` per eventi globali**
4. **Gestione di dati parziali e sincronizzazione con il backend**
5. **Best practice architetturali** per mantenere stato coerente e performante

---

### 1. Gestire relazioni tra entità

Nel mondo reale, le entità raramente vivono isolate.
Esempio classico:

* `users`
* `posts` (ogni post ha un `userId`)

L’obiettivo è: **mantenere entrambe le collezioni normalizzate**, ma riuscire a **navigare le relazioni** senza perdere efficienza.

---

#### 1.1 Creiamo due adapter

```ts
// src/features/users/usersSlice.ts
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'

export type User = { id: string; name: string }

const usersAdapter = createEntityAdapter<User>()
const initialState = usersAdapter.getInitialState()

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: usersAdapter.setAll,
    addUser: usersAdapter.addOne,
  },
})

export const { setUsers, addUser } = usersSlice.actions
export default usersSlice.reducer

export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
} = usersAdapter.getSelectors((state: RootState) => state.users)
```

---

```ts
// src/features/posts/postsSlice.ts
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'

export type Post = { id: string; userId: string; title: string }

const postsAdapter = createEntityAdapter<Post>()
const initialState = postsAdapter.getInitialState()

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: postsAdapter.setAll,
    addPost: postsAdapter.addOne,
  },
})

export const { setPosts, addPost } = postsSlice.actions
export default postsSlice.reducer

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state: RootState) => state.posts)
```

---

#### 1.2 Selettori derivati per relazioni

Ora possiamo creare **selettori “compositi”** per navigare le relazioni 1-N:

```ts
// src/features/posts/selectors.ts
import { createSelector } from '@reduxjs/toolkit'
import { selectAllPosts } from './postsSlice'

// Tutti i post di un utente
export const selectPostsByUser = (userId: string) =>
  createSelector([selectAllPosts], (posts) =>
    posts.filter((p) => p.userId === userId)
  )
```

Uso nel componente:

```tsx
const userPosts = useAppSelector(selectPostsByUser('u1'))
```

 Così otteniamo relazioni dinamiche tra entità **senza mai denormalizzare lo stato.**

---

### 2. Selettori derivati complessi

Il vero potere della normalizzazione emerge quando iniziamo a creare **selettori derivati** per aggregare, filtrare o combinare dati.

#### 2.1 Filtri dinamici

```ts
export const selectPostsWithKeyword = (keyword: string) =>
  createSelector([selectAllPosts], (posts) =>
    posts.filter((p) => p.title.toLowerCase().includes(keyword.toLowerCase()))
  )
```

---

#### 2.2 Aggregazioni

```ts
export const selectUserPostCount = (userId: string) =>
  createSelector([selectAllPosts], (posts) =>
    posts.filter((p) => p.userId === userId).length
  )
```

---

#### 2.3 Composizione con altri slice

Puoi combinare selettori di slice diversi:

```ts
import { selectUserById } from '../users/usersSlice'

export const selectUserWithPosts = (userId: string) =>
  createSelector([selectUserById, selectPostsByUser(userId)], (user, posts) => ({
    ...user,
    posts,
  }))
```

 Ora puoi ottenere l’oggetto utente **arricchito con i suoi post** senza mai duplicare dati nello stato.

---

### 3. Integrare `createEntityAdapter` con `extraReducers`

L’adapter funziona perfettamente anche con eventi globali e cross-slice.
Esempio: reset della lista post al logout:

```ts
// postsSlice.ts
import { logout } from '../auth/authSlice'

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: { ... },
  extraReducers: (builder) => {
    builder.addCase(logout, () => postsAdapter.getInitialState())
  },
})
```

 Tutte le entità vengono azzerate in modo consistente e immutabile senza dover scrivere logica personalizzata.

---

### 4. Gestire dati parziali e sincronizzazione con il backend

Spesso l’app riceve dati **in più fasi** (ad esempio, prima una lista di utenti, poi dettagli aggiuntivi).
L’approccio migliore è usare `upsertOne` o `upsertMany`, che:

* Inseriscono i nuovi record se non esistono
* Aggiornano solo i campi modificati se esistono già

```ts
dispatch(upsertUser({ id: 'u1', name: 'Alice', role: 'admin' }))
```

 Non serve controllare se l’utente esiste già. L’adapter lo fa automaticamente.

---

### 5. Best practice architetturali

| Best Practice                                          | Spiegazione                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| **Ogni collezione → un adapter**                       | Crea un adapter per ogni entità principale (users, posts, orders…) |
| **Non denormalizzare mai**                             | Mantieni le relazioni tramite ID e costruisci selettori derivati   |
| **Componi selettori**                                  | Combina dati tra slice senza duplicare lo stato                    |
| **Usa `extraReducers` per eventi globali**             | Resetta, aggiorna o sincronizza stato reattivamente                |
| **Usa `upsert` per sincronizzazioni parziali**         | Evita codice condizionale inutile                                  |
| **Filtra e aggrega nel selettore, non nel componente** | Mantieni la UI leggera e dichiarativa                              |

---

### 6. Esempio completo: utenti e post collegati

```ts
// usersSlice.ts
const usersAdapter = createEntityAdapter<User>()
const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState(),
  reducers: { addUser: usersAdapter.addOne },
})

// postsSlice.ts
const postsAdapter = createEntityAdapter<Post>()
const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState(),
  reducers: { addPost: postsAdapter.addOne },
})

// selectors.ts
export const selectUserWithPosts = (userId: string) =>
  createSelector(
    (state: RootState) => selectUserById(state, userId),
    (state: RootState) => selectPostsByUser(userId)(state),
    (user, posts) => ({ ...user, posts })
  )
```

Uso in un componente:

```tsx
const user = useAppSelector(selectUserWithPosts('u1'))

return (
  <div>
    <h2>{user?.name}</h2>
    <ul>
      {user?.posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  </div>
)
```

 Stato perfettamente normalizzato, relazioni dinamiche, UI semplice e performante.

---

## In sintesi

| Concetto                             | Cosa fa                                            | Vantaggio                    |
| ------------------------------------ | -------------------------------------------------- | ---------------------------- |
| **Relazioni 1-N**                    | Mantieni entità collegate tramite ID               | Stato coerente e navigabile  |
| **Selettori derivati**               | Filtri, aggregazioni e composizione tra slice      | Logica fuori dalla UI        |
| **Integrazione con `extraReducers`** | Reazioni automatiche ad eventi globali             | Architettura modulare        |
| **Dati parziali e `upsert`**         | Gestione automatica di update e insert             | Codice più semplice e sicuro |
| **Best practice**                    | Mantieni il dato centralizzato e componi selettori | Performance e manutenibilità |

---



































# Esempio

Esempio **pulito, minimale ma realistico** per mostrare come usare:

* `createEntityAdapter` → per **gestire una lista normalizzata** (ids + entities) in Redux Toolkit.
* `extraReducers` → per **reagire ad azioni provenienti da altri slice** **senza nessuna chiamata API**.

L’esempio gestisce una semplice lista di **task** con un secondo slice `uiSlice` che resetta tutto lo stato quando clicchiamo un pulsante "Reset".

---

##  Struttura del progetto

```
src/
  app/
    store.ts
  features/
    tasks/
      tasksSlice.ts
    ui/
      uiSlice.ts
  components/
    TaskList.tsx
  main.tsx
```

---

### 1️ `tasksSlice.ts` — uso di `createEntityAdapter` + `extraReducers`

```tsx
// src/features/tasks/tasksSlice.ts
import { createSlice, createEntityAdapter, type PayloadAction } from '@reduxjs/toolkit'
import { resetAll } from '../ui/uiSlice'

export type Task = {
  id: string
  title: string
  completed: boolean
}

// 1. Adapter per la gestione normalizzata
const tasksAdapter = createEntityAdapter<Task>({
  selectId: (task) => task.id,              // opzionale se l'id è già 'id'
  sortComparer: (a, b) => a.title.localeCompare(b.title) // opzionale: ordina per titolo
})

// 2. Stato iniziale
const initialState = tasksAdapter.getInitialState()

// 3. Slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      tasksAdapter.addOne(state, action.payload)
    },
    toggleTask: (state, action: PayloadAction<string>) => {
      const task = state.entities[action.payload]
      if (task) task.completed = !task.completed
    },
    removeTask: (state, action: PayloadAction<string>) => {
      tasksAdapter.removeOne(state, action.payload)
    },
  },
  extraReducers: (builder) => {
    // Reagisce a un'azione di un altro slice
    builder.addCase(resetAll, () => tasksAdapter.getInitialState())
  }
})

export const { addTask, toggleTask, removeTask } = tasksSlice.actions

// 4. Selettori pronti forniti da adapter
export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds
} = tasksAdapter.getSelectors((state: any) => state.tasks)

export default tasksSlice.reducer
```

---

### 2️ `uiSlice.ts` — azione usata con `extraReducers`

```tsx
// src/features/ui/uiSlice.ts
import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: { darkMode: false },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    resetAll: () => {
      return { darkMode: false } // resetta solo UI, ma tasksSlice reagirà anche
    }
  }
})

export const { toggleDarkMode, resetAll } = uiSlice.actions
export default uiSlice.reducer
```

---

### 3️ `store.ts` — configurazione Redux

```tsx
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from '../features/tasks/tasksSlice'
import uiReducer from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    ui: uiReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

---

### 4️ `TaskList.tsx` — semplice componente demo

```tsx
// src/components/TaskList.tsx
import { useDispatch, useSelector } from 'react-redux'
import { selectAllTasks, addTask, toggleTask, removeTask } from '../features/tasks/tasksSlice'
import { resetAll } from '../features/ui/uiSlice'
import type { RootState } from '../app/store'

export function TaskList() {
  const dispatch = useDispatch()
  const tasks = useSelector((state: RootState) => selectAllTasks(state))

  return (
    <div style={{ padding: 20 }}>
      <h2> Task List</h2>

      <button
        onClick={() =>
          dispatch(addTask({ id: Date.now().toString(), title: 'Nuovo task', completed: false }))
        }
      >
        ➕ Aggiungi Task
      </button>

      <button style={{ marginLeft: 8 }} onClick={() => dispatch(resetAll())}>
         Reset Tutto
      </button>

      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => dispatch(toggleTask(task.id))}
            />
            {task.title}
            <button style={{ marginLeft: 8 }} onClick={() => dispatch(removeTask(task.id))}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### 5️ `main.tsx` — avvio dell’app

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { TaskList } from './components/TaskList'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <TaskList />
  </Provider>
)
```

---

##  Cosa dimostra questo esempio

* `createEntityAdapter`:

  * Crea **stato normalizzato** (`ids`, `entities`).
  * Fornisce **metodi pronti** (`addOne`, `removeOne`, `setAll`, ecc.).
  * Fornisce **selettori automatici** (`selectAll`, `selectById`, ecc.).

* `extraReducers`:

  * Permette al `tasksSlice` di reagire a un’azione `resetAll` definita in `uiSlice`.
  * Nessuna chiamata API: solo logica interna e sincronizzazione tra slice.




































# Esercizio: “Mini Catalogo con Ruoli”

Costruisci una piccola app React dove si gestisce un **catalogo di elementi** (es. “Task” o “Prodotti”) con queste regole:

* Gli elementi sono salvati in Redux con **stato normalizzato** tramite `createEntityAdapter`.
* Esiste un **ruolo utente** (admin / non admin) in uno slice separato.
* Alcune azioni (aggiungi/rimuovi) **sono permesse solo agli admin**: questa regola è applicata da un **middleware**.
* Con un bottone “Reset” viene emessa un’azione globale che **svuota** il catalogo tramite `extraReducers`.

---

## Obiettivi didattici

1. Capire come `createEntityAdapter` crea `ids` & `entities` e fornisce metodi (`addOne`, `removeOne`, `setAll`, …) e **selectors**.
2. Usare `extraReducers` per reagire ad **azioni di altri slice** (es. `resetAll`).
3. Creare e registrare un **middleware Redux** che intercetti azioni e applichi regole/side-effect (es. blocco non admin).
4. Integrare tutto in un’app React minimale.

---

## Funzionalità richieste

* **Toggle ruolo**: bottone “Diventa Admin / Esci da Admin” (stato booleano `isAdmin` nello slice `user`).
* **Lista elementi**: visualizza tutti gli elementi ordinati per `title` (usa il `sortComparer` dell’adapter).
* **Aggiungi elemento**: crea un elemento `{ id, title, completed }` con titolo da un input.
* **Toggle completed**: checkbox per segnare un elemento completato/non completato.
* **Rimuovi elemento**: solo admin.
* **Reset**: bottone che dispatcha `resetAll` → svuota il catalogo via `extraReducers` nello slice del catalogo.
* **Middleware**:

  * `authGuard`: se arriva `catalog/addItem` o `catalog/removeItem` e l’utente **non** è admin, **blocca** l’azione e mostra un `console.warn`.
  * `logger` (semplice): stampa in console `type` e `payload` di ogni azione.

> Nota: niente API. I dati partono **vuoti** o con **seed locale** opzionale.

---

## Struttura suggerita

```
src/
  app/
    store.ts
    middlewares/
      authGuard.ts
      logger.ts
  features/
    catalog/
      catalogSlice.ts
    user/
      userSlice.ts
    system/
      systemSlice.ts   // azione resetAll qui (o nello userSlice)
  components/
    CatalogControls.tsx   // input + add + reset
    CatalogList.tsx       // lista, toggle, remove
    RoleToggle.tsx        // admin on/off
  App.tsx
  main.tsx
```

---

## UI minima

**RoleToggle.tsx**

* Bottone che dispatcha `toggleAdmin`.
* Mostra stato corrente: “Sei Admin: Sì/No”.

**CatalogControls.tsx**

* Input testo + bottone “Aggiungi”.
* Bottone “Reset” → dispatch `resetAll`.

**CatalogList.tsx**

* Legge gli elementi con `adapter.getSelectors(...)` → `selectAll`.
* Per ogni item:

  * checkbox `completed` → `toggleItem(id)`
  * bottone “Rimuovi” → `removeItem(id)` (il middleware farà rispettare la regola admin).

---

## Estensioni (facoltative, per chi finisce prima)

* Aggiungi un **filtro** “Mostra tutti / Attivi / Completati” (stato UI locale o nello store).
* Mostra un **toast**/messaggio quando un’azione viene bloccata dal middleware.

---










































