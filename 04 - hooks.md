

# 1) Regole degli Hook 

## Cosa sono “davvero”

Gli hook sono funzioni che permettono a React di **associare** a un componente funzione:

* uno **stato** (useState/useReducer),
* degli **effetti** (useEffect/useLayoutEffect),
* dei **dati memoizzati** (useMemo/useCallback),
* **referenze** (useRef),
  …in modo **posizionale** dentro il corpo della funzione.

> Posizionale significa: React **non** trova lo stato per “nome”, ma per **ordine di chiamata**. Alla N-esima chiamata di `useState` nello stesso componente, React si aspetta di trovare lo **stesso hook** di prima. Se l’ordine cambia, si “sfasa” la lista degli hook → bug.

## Perché non in condizioni/loop

Durante la **render phase**, React esegue il componente e per ogni `useX` consulta/aggiorna la **linked list degli hook** memorizzata sulla **fibra** del componente (`fiber.memoizedState`).
Ogni hook occupa uno “slot” in questa lista (concettualmente: *primo hook*, *secondo hook*, *terzo hook*, …). Se in un render la seconda chiamata a `useState` viene **saltata** (es. perché sei dentro un `if` non preso), tutto ciò che segue “slitta” di uno: il terzo hook prende lo stato del secondo, il quarto quello del terzo, ecc. Risultato: **stato sfasato** e comportamento imprevedibile.

## Com’è strutturato internamente (concetto)

* Ogni componente ha una **fiber** (nodo dell’albero di React).
* La fiber mantiene:

  * un puntatore a una **lista collegata di hook** (ad es., `memoizedState`),
  * code di update per ogni hook (es. per `useState`).
* In **mount** React costruisce la lista; in **update** la ripercorre **in ordine identico** di chiamata.
* Il “dispatcher” degli hook (un oggetto interno) è diverso in mount vs update (per creare o leggere gli slot corretti).

## Strict Mode (dev)

In Strict Mode (solo **dev**), React può **montare/smontare/montare** di nuovo per rilevare side-effect non idempotenti. Le **regole** degli hook impediscono che questo doppio passaggio rompa l’allineamento degli slot.

## Key e remount

Se cambi la `key` di un componente, React non riconcilia quel nodo ma lo **smonta e rimonta**: nuova fiber ⇒ **nuova lista di hook** ⇒ **stato azzerato**.














---

# 1) Cos’è la **render phase** (e perché gli hook non vanno in condizioni/loop)

Immagina che React, per **ogni componente**, faccia questo:

1. **Chiama** la tua funzione componente (es. `function Panel(){...}`) per **calcolare** cosa deve comparire a schermo (JSX).
2. Durante questa chiamata, **ogni volta** che vede `useState`, `useRef`, `useEffect`, ecc., **registra** quell’hook in una **lista ordinata**: il 1°, il 2°, il 3°…
3. **Non** tocca ancora il DOM. Sta solo preparando un “piano dei lavori”.

Questa è la **render phase**. Il DOM lo toccherà dopo, nella **commit phase**.

Per React, gli hook sono **posizionali**: il “primo” `useState` del componente è *lo stesso* “primo” `useState` del render precedente; il “secondo” è il *secondo*, ecc.
Se un giorno, a metà, **salti** un hook (perché sei entrato in un `if`), **tutti i successivi scalano** di una posizione: React assegna valori “del posto sbagliato” → **stato sfasato**.

**Per questo** gli hook non possono stare in:

* `if/else`, `switch`, `try/catch`,
* `for/map/while`,
* funzioni chiamate *dentro* il render (se non sono custom hook).

---

# 2) Cos’è una **fiber** (e cosa contiene)

Una **fiber** è la “scheda tecnica” di **un’istanza** di componente in React.
Esiste **una fibra per ogni nodo** del tuo albero React (un `<Panel />`, due `<Row />`, ecc.).

Dentro ha, semplificando:

* `props` e info sul tipo di nodo (quale componente è).
* Puntatori a **figlio / fratello / padre** per scorrere l’albero.
* **Stato memorizzato** del componente (quello che serve a “ricordare” tra un render e l’altro).
* Un puntatore al **primo hook** della lista: spesso chiamato (semplificando) `memoizedState`.

### Mini-diagramma

```
Fiber(Panel)
  ├─ type: Panel
  ├─ props: {...}
  ├─ memoizedState → Hook#1 → Hook#2 → Hook#3 → null
  ├─ child → Fiber(Row)
  ├─ sibling → null
  └─ return → Fiber(App)
```

Ogni **Hook#N** è un nodino della lista con i suoi dati (es. il valore dello stato) e **(per useState)** una piccola coda con gli aggiornamenti (gli `update` creati da `setState`).

---

# 3) La **linked list degli hook** (perché l’ordine conta)

Quando il componente viene **montato** la prima volta (**mount**):

* React chiama il componente.
* Alla prima chiamata di `useState`, crea **Hook#1** e lo appende alla lista.
* Alla seconda, crea **Hook#2**… e così via.

Al render successivo (**update**), React **non ricrea** gli hook: li **ripercorre in ordine**.
Quindi alla 1ª chiamata di `useState` **legge** l’Hook#1 esistente; alla 2ª legge l’Hook#2, ecc.

Se tu, tra un render e l’altro, **cambi l’ordine o il numero** di hook chiamati (perché li hai messi in un `if` o in un `map`), React non trova più l’allineamento:

* l’Hook#3 vecchio viene letto come se fosse l’Hook#2 nuovo,
* l’Hook#4 come l’Hook#3, …
  ⇒ **valori scambiati**, comportamenti strani.

---

# 4) Il “dispatcher” degli hook (perché “mount” ≠ “update”)

React ha un piccolo “**centralino**” interno, il **dispatcher**, che decide **cosa fare** quando chiami `useState`:

* in **mount**: “non ho ancora lo slot → crealo e mettilo in fondo alla lista”;
* in **update**: “vai al **prossimo** nodo della lista e leggilo”.

È lo stesso gancio (`useState`) visto da fuori, ma dentro passa da due “modalità” diverse.
Funziona **solo** se la **sequenza** di chiamate è identica fra i render.

---

# 5) Le **code di update** (cosa fa davvero `setState`)

Quando chiami `setCount(x => x + 1)`, **non** cambi subito il valore. Crei un piccolo **oggetto update** (tipo: “+1”) che React mette nella **coda dell’Hook** corrispondente.

Al **prossimo render**, React:

1. prende l’Hook giusto (per **posizione**),
2. **applica in ordine** tutti gli update in coda (rispettando priorità/“lanes”),
3. calcola il nuovo `state`.

Per questo più `setState` nello stesso “giro” possono essere **batchati** (accorpati) in **un solo render**.

---

# 6) Perché la `key` cambia tutto (remount e reset stato)

Le `key` servono a dire a React: “questo figlio **è lo stesso** di prima?”.

* Se **tipo + key** combaciano → **update** della *stessa fibra* (con gli stessi hook).
* Se **key** cambia → React fa finta che sia un **nuovo componente**: **smonta** la fibra vecchia e **ne crea una nuova**. Questo si chiama **remount** ⇒ **stato azzerato** (nuova lista di hook).

È utile quando vuoi **resettare** intenzionalmente uno stato; è un disastro se succede **per sbaglio** (es. key instabili).

---





















---

# Regole operative (riassunto pratico)

1. **Chiama gli hook solo a top-level** del componente o di un **custom hook**.
2. **Mai** dentro `if/for/while/switch/try/catch`, callback, map inline, ecc.
3. Mantieni **stabile** la sequenza/il numero di hook tra render.
4. Non “giocare” con le **key** dei componenti se vuoi preservare lo stato.

---

# Snippet TypeScript “production-grade” + analisi fibra/reconciliation

Di seguito una batteria di casi reali, con **versione sbagliata**, **versione corretta**, e **cosa accade a livello di fibra**.

---

## A) Hook condizionale (classico anti-pattern)

###  Sbagliato

```tsx
import { useState } from "react";

type Props = { enableExtra?: boolean };

export function ProfileCard({ enableExtra }: Props) {
  const [name, setName] = useState("Ada");
  if (enableExtra) {
    //  A volte questo useState viene chiamato, a volte no
    const [extra, setExtra] = useState<number>(0);
    void setExtra; // solo per evitare l'unused in esempio
    console.log(extra)
  }
  const [age, setAge] = useState(36);

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => setAge(a => a + 1)}>Age +1 ({age})</button>
    </div>
  );
}
```
---

# Come e perché avvengono i (ri)render — livello fibra/reconciliation

1. **Render phase**

   * React esegue la funzione componente, cammina gli **hook in ordine** usando il dispatcher (mount/update).
   * Produce un **albero di elementi** e aggiorna un **work-in-progress fiber** per ogni nodo.

2. **Reconciliation**

   * Confronta l’albero precedente e quello nuovo: **matching per tipo e key**.
   * Se tipo+key corrispondono ⇒ **update** della stessa fibra → mantiene la **linked list degli hook** e **applica gli update**.
   * Se **key cambia** o il tipo differisce ⇒ **nuova fibra** (remount) → nuova lista hook (stato perso).

3. **Commit phase**

   * Applica i cambiamenti al DOM.
   * Esegue i **cleanup** degli effect vecchi e poi i **setup** dei nuovi (`useEffect` post-paint, `useLayoutEffect` prima del paint).




---



















---

# 2) `useState` – Approfondimento professionale

## 1. Funzionamento interno di `useState`

Quando si dichiara uno stato in un componente funzionale:

```tsx
const [count, setCount] = useState(0);
```

React crea un **nodo hook** nella **lista collegata di hook** associata alla fibra del componente. Ogni nodo rappresenta un singolo stato e contiene due informazioni principali:

* `memoizedState`: il valore attuale dello stato.
* `queue`: una coda di aggiornamenti che devono ancora essere applicati.

Questa lista di hook viene creata durante la **fase di mount** (primo render) e riutilizzata nelle render successive (**fase di update**). React percorre la lista in ordine ogni volta che esegue il componente. Questo meccanismo è il motivo per cui l’ordine e il numero delle chiamate agli hook devono rimanere invariati tra un render e l’altro.

Il valore restituito da `useState` è il valore memorizzato in `memoizedState`, mentre la funzione `setCount` non aggiorna immediatamente lo stato: aggiunge invece un nuovo “aggiornamento” alla coda (`queue`) e programma un nuovo render del componente.

---

## 2. La coda di aggiornamenti (`queue`)

Ogni chiamata a `setState` non sostituisce immediatamente il valore ma crea un oggetto aggiornamento che viene inserito nella coda dell’hook. Tale oggetto può essere di due tipi:

* un valore diretto (`setCount(5)`)
* una funzione updater (`setCount(prev => prev + 1)`)

Durante la fase di render successiva, React legge il valore attuale (`memoizedState`) e applica **tutti** gli aggiornamenti presenti nella coda nell’ordine in cui sono stati inseriti. Solo dopo averli applicati, aggiorna `memoizedState` e svuota la coda.

Questa architettura consente a React di accorpare più aggiornamenti in un unico passaggio e di garantire che lo stato sia sempre calcolato in modo coerente.

---

## 3. Re-render e immutabilità

React decide se un componente deve essere ri-renderizzato in base al fatto che il valore dello stato sia cambiato o meno. Questo implica due conseguenze fondamentali:

1. **Lo stato è immutabile per React.**
   Modificare un oggetto o un array “in place” non ha effetto, perché la referenza non cambia e React non può sapere che qualcosa è mutato. Per segnalare un cambiamento, è necessario creare un nuovo valore e passarlo a `setState`.

2. **`setState` programma un nuovo render.**
   La chiamata non cambia immediatamente il valore, ma pianifica un nuovo ciclo di render nel quale verranno applicati gli aggiornamenti.

Esempio:

```tsx
const [user, setUser] = useState({ name: "Ada", age: 30 });

//  Nessun re-render, perché la referenza non cambia
user.age++;

//  Re-render, perché l’oggetto è nuovo
setUser(prev => ({ ...prev, age: prev.age + 1 }));
```

---

## 4. Batching e ottimizzazione dei render

React effettua un’ottimizzazione nota come **batching**, ossia accorpa più aggiornamenti dello stato avvenuti nello stesso ciclo di event loop in un unico render. Questo significa che anche se `setState` viene chiamato più volte nello stesso callback, il componente verrà renderizzato una sola volta.

Esempio:

```tsx
setCount(1);
setCount(2);
setCount(3);
```

In questo caso il componente verrà ri-renderizzato una sola volta con il valore finale `3`.

A partire da React 18, il batching è abilitato anche all’interno di callback asincroni (come `setTimeout` o `fetch`), cosa che in versioni precedenti non avveniva automaticamente.

---

## 5. La forma updater e le closure

Quando si utilizza `setState` con un valore diretto, React legge il valore di stato **catturato dalla closure del render corrente**. Questo significa che più chiamate consecutive a `setState` all’interno dello stesso handler leggeranno tutte lo stesso valore iniziale.
Per ovviare a questo problema, si utilizza la forma **updater function**:

```tsx
setCount(prev => prev + 1);
```

In questo caso, React non usa la closure del render, ma calcola il nuovo stato a partire dal risultato dell’aggiornamento precedente nella coda. Questo è fondamentale quando si eseguono più aggiornamenti consecutivi o quando si lavora con codice asincrono.

### Esempio – Differenza tra valore diretto e funzione updater

```tsx
//  Legge due volte lo stesso valore
setCount(count + 1);
setCount(count + 1);
// Risultato finale: count + 1

//  Calcola sul valore aggiornato
setCount(prev => prev + 1);
setCount(prev => prev + 1);
// Risultato finale: count + 2
```

Nel primo caso entrambe le chiamate leggono il valore di `count` catturato dalla closure. Nel secondo, ogni aggiornamento viene calcolato a partire dal risultato del precedente nella coda.

---

## 6. Sincronizzazione e fase di commit

Il processo di aggiornamento dello stato avviene interamente nella **fase di render**. React:

1. Legge `memoizedState` dalla fibra.
2. Applica in ordine gli aggiornamenti presenti nella coda.
3. Aggiorna `memoizedState` con il nuovo valore.
4. Svuota la coda.
5. Passa alla **fase di commit**, dove applica le modifiche al DOM.

È importante capire che la chiamata a `setState` **non cambia il valore immediatamente**: il nuovo valore sarà disponibile solo al render successivo. Per questo motivo leggere subito lo stato dopo un `setState` restituirà il valore precedente.

---

## 7. Stato e remount

Il valore di stato è legato alla fibra del componente. Se per qualche motivo React decide di creare una nuova fibra (ad esempio a causa di un cambio di `key`), la lista di hook viene ricreata da zero e lo stato precedente va perso. Questo comportamento è utile se si vuole forzare il reset di un componente, ma può causare comportamenti imprevisti se le chiavi sono instabili.

---














```tsx
import { useState } from "react";

/**
 * Componente A: usa il valore catturato dalla closure (count).
 * Due chiamate consecutive a setCount(count + 1) leggono lo stesso valore iniziale.
 * Risultato: incrementa di +1, non di +2.
 */
function CounterWithDirectValue() {
  const [count, setCount] = useState(0);

  const handleDoubleIncrement = () => {
    setCount(count + 1); // usa count del render corrente
    setCount(count + 1); // usa ancora lo stesso count del render corrente
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="font-semibold">Direct value</h2>
      <p className="mb-2">Count: {count}</p>
      <button
        onClick={handleDoubleIncrement}
        className="px-3 py-1 border rounded"
      >
        Incrementa due volte (direct)
      </button>
      <p className="mt-2 text-sm text-gray-600">
        Atteso: +1 (le due chiamate leggono lo stesso valore catturato).
      </p>
    </div>
  );
}

/**
 * Componente B: usa la funzione updater (prev => prev + 1).
 * Le due chiamate vengono applicate in coda, ciascuna sul risultato della precedente.
 * Risultato: incrementa di +2 con un solo re-render (batching).
 */
function CounterWithUpdater() {
  const [count, setCount] = useState(0);

  const handleDoubleIncrement = () => {
    setCount(prev => prev + 1); // applicato sul valore corrente
    setCount(prev => prev + 1); // applicato sul risultato dell'update precedente
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="font-semibold">Updater function</h2>
      <p className="mb-2">Count: {count}</p>
      <button
        onClick={handleDoubleIncrement}
        className="px-3 py-1 border rounded"
      >
        Incrementa due volte (updater)
      </button>
      <p className="mt-2 text-sm text-gray-600">
        Atteso: +2 (ogni update usa il risultato del precedente).
      </p>
    </div>
  );
}

/**
 * App di confronto: mostra affiancati i due comportamenti.
 * Nota: in React 18 il batching è automatico anche in async;
 * qui restiamo su un handler sincrono per isolare la differenza di semantica.
 */
export default function App() {
  return (
    <main className="max-w-2xl mx-auto p-6 grid gap-6 sm:grid-cols-2">
      <CounterWithDirectValue />
      <CounterWithUpdater />
    </main>
  );
}
```





























---

# 3) `useRef` — Valore che sopravvive ai render

## 3.1 Concetto chiave: contenitore mutabile che non causa re-render

### Teoria avanzata (sintesi)

* `useRef` alloca un nodo hook nella linked list della fibra (`fiber.memoizedState`) che conserva **un’unica identità** tra render: un oggetto `{ current: T }`.
* A differenza di `useState`, **non esiste una coda di update**: aggiornare `ref.current` non marca la fibra come “dirty” e quindi **non pianifica** alcun re-render.
* Il ref è quindi “memoria non reattiva”: utile per valori che devono sopravvivere ai render senza entrare nel flusso di riconciliazione.

### Dimostrazione minima

```tsx
import { useRef, useState } from "react";

export function RefVsState() {
  const clicksRef = useRef(0);        // non reattivo
  const [shown, setShown] = useState(0); // reattivo

  function incrementRef() {
    clicksRef.current += 1;           // nessun re-render
  }
  function showRef() {
    setShown(clicksRef.current);      // aggiorna UI
  }

  return (
    <div>
      <button onClick={incrementRef}>+1 ref</button>
      <button onClick={showRef}>Mostra</button>
      <div>Valore mostrato: {shown}</div>
    </div>
  );
}
```

---

## 3.2 Usi tipici

### (1) Referenza al DOM

#### Teoria avanzata

* React collega i ref ai nodi DOM in **commit phase**.
* Letture/misure del layout dovrebbero avvenire in `useLayoutEffect` per garantire sincronismo con il paint (evita flicker).
* In SSR i DOM ref sono nulli; il codice che li usa deve stare in effetti che girano solo sul client.

#### Dimostrazione minima

```tsx
import { useLayoutEffect, useRef } from "react";

export function FocusInput() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="Autofocus al mount" />;
}
```

---

### (2) Variabile persistente tra render (senza re-render)

#### Teoria avanzata

* Il ref è ideale per timer id, ultime letture, flag, accumulatori, logiche di controllo concorrenza (es. “ignore stale”).
* È “persistenza” a livello di componente senza costi di riconciliazione: non entra nel diff delle props/stato.

#### Dimostrazione minima

```tsx
import { useEffect, useRef, useState } from "react";

export function TicksSnapshot() {
  const ticks = useRef(0);
  const [view, setView] = useState(0);

  useEffect(() => {
    const id = setInterval(() => { ticks.current += 1; }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <button onClick={() => setView(ticks.current)}>Snapshot</button>
      <div>Ultimo snapshot: {view}</div>
    </div>
  );
}
```

---

## 3.3 Dietro le quinte: dove vive il ref e cosa implica

### Teoria avanzata

* In **mount**, il dispatcher “mount” crea l’hook ref e ne memorizza l’oggetto `{ current }` nella linked list (`fiber.memoizedState`).
* In **update**, il dispatcher “update” **riutilizza** lo stesso nodo hook e la stessa identità dell’oggetto ref.
* Finché **tipo + key** del componente non cambiano, la fibra rimane la stessa e l’identità del ref è stabile. Se cambia la `key` (o c’è un remount), il ref viene ricreato e `current` torna al valore iniziale.
* Scrivere su `ref.current` **durante la render phase** è consentito ma non osservabile nella stessa render: l’output è calcolato prima che la tua scrittura venga “vista” da una render successiva o da un effetto.

---

# Esempio finale integrato (semplice e completo)

Obiettivo: mostrare i tre usi fondamentali insieme:

1. DOM ref per focus,
2. ref persistente che non causa re-render,
3. portare un valore da ref → stato solo quando serve.

Copia in `App.tsx`.

```tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** 1) DOM ref: focus al mount, misura opzionale */
function SearchBox() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);

  useLayoutEffect(() => {
    inputRef.current?.focus();
    setFocused(true);
  }, []);

  return (
    <div style={{ marginBottom: 12 }}>
      <input ref={inputRef} placeholder="Focus al mount" />
      <span style={{ marginLeft: 8 }}>Focused: {String(focused)}</span>
    </div>
  );
}

/** 2) Ref persistente: contatore che non ridisegna la UI */
function SilentCounter() {
  const ref = useRef(0);
  const [snapshot, setSnapshot] = useState(0);

  useEffect(() => {
    const id = setInterval(() => { ref.current += 1; }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <button onClick={() => setSnapshot(ref.current)}>Snapshot</button>
      <button onClick={() => { ref.current = 0; setSnapshot(0); }} style={{ marginLeft: 8 }}>
        Reset
      </button>
      <div style={{ marginTop: 6 }}>Valore mostrato: {snapshot}</div>
    </div>
  );
}

/** 3) App: compone i due casi in modo minimale */
export default function App() {
  return (
    <main style={{ padding: 16 }}>
      <h1>useRef: esempi minimi</h1>
      <SearchBox />
      <SilentCounter />
    </main>
  );
}
```

---

## Criteri di scelta rapidi

* Usa `useRef` per: handle DOM, timer id, flag “montato”, accumulatori, cache non reattive, coordinamento tra effetti.
* Usa `useState` per: tutto ciò che deve riflettersi nella UI o partecipare a logiche di diff e memoizzazione.
* Ricorda: cambiare la `key` o smontare il componente ricrea i ref (nuova identità; `current` resettato).































---

# 4) `useEffect` (effetti post-paint) 

## 4.1 Quando gira `useEffect` (timing)

* React aggiorna la UI in due momenti:

  1. **Render**: calcola cosa mostrare.
  2. **Commit**: applica i cambiamenti al DOM.
* `useEffect` parte **dopo** il commit e **dopo** che il browser ha disegnato (post-paint).
* La funzione di **cleanup** (quella che ritorni dall’effetto) esegue **prima** del prossimo effetto e **prima** dello smontaggio del componente.

 Usa `useEffect` per operazioni che **non devono bloccare il disegno**: fetch, timer, log, iscrizioni a eventi.

### Dimostrazione minima

```tsx
import { useEffect, useState } from "react";

export function TimingDemo() {
  const [n, setN] = useState(0);

  useEffect(() => {
    console.log("Effect (post-paint), n =", n);
    return () => console.log("Cleanup precedente, n =", n);
  }, [n]);

  return <button onClick={() => setN(v => v + 1)}>n = {n}</button>;
}
```

---

## 4.2 Dependency array: confronto per **referenza**

* L’array delle dipendenze (`[dep1, dep2, ...]`) dice a React **quando** rieseguire l’effetto.
* Il confronto è **per referenza**: se una dipendenza è un **oggetto/funzione/array nuovo** a ogni render, l’effetto si riesegue ogni volta, anche se il contenuto “sembra” identico.
* Più avanti vedremo che puoi “stabilizzare” queste dipendenze con `useMemo`/`useCallback` quando serve evitare riesecuzioni inutili.

### Dimostrazione minima

```tsx
import { useEffect, useState } from "react";

export function DepsByRefDemo() {
  const [n, setN] = useState(0);

  const cfg = { step: 1 }; // nuova referenza ad ogni render

  useEffect(() => {
    // Si attiva a ogni render, perché 'cfg' cambia referenza
    console.log("Effect su cfg (referenza nuova)");
  }, [cfg]);

  return <button onClick={() => setN(v => v + 1)}>n = {n}</button>;
}
```

> Nota: più avanti, con `useMemo`/`useCallback`, potrai rendere stabile la referenza quando necessario. Per ora basta capire che **ogni nuova referenza ⇒ nuovo effetto**.


---

## 4.4 Cleanup: come e quando pulire

* Se l’effetto **iscrive** qualcosa (timer, event listener, richiesta in corso), il **cleanup** è il posto dove **disiscrivere** o **annullare**.
* Il cleanup evita duplicazioni e perdite di memoria quando le dipendenze cambiano o il componente si smonta.

### Dimostrazione minima

```tsx
import { useEffect, useState } from "react";

export function CleanupDemo() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {/* ... */}
    if (active) window.addEventListener("keydown", onKey);

    return () => {
      // Rimuove prima del prossimo effect o allo smontaggio
      if (active) window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <button onClick={() => setActive(v => !v)}>
      {active ? "Disattiva" : "Attiva"} listener
    </button>
  );
}
```

---

## 4.5 Riepilogo operativo (Parte 1)

* `useEffect` è **post-paint**: non blocca il rendering; usalo per I/O, timer, eventi.
* Le **dipendenze** sono confrontate **per referenza**: oggetti/array/funzioni nuovi ⇒ effetto si ripete. (Più avanti: stabilizzazione con `useMemo`/`useCallback`, senza dettagli ora.)
* Attenzione alle **stale closure**: l’effetto vede i valori del render in cui nasce. Includi le dipendenze necessarie o usa un ref per leggere l’ultimo valore.
* Scrivi sempre il **cleanup** quando l’effetto aggiunge risorse da rimuovere.

---
































# 4) `useEffect` 

## 4.6 Evitare aggiornamenti “fuori tempo”: flag e `AbortController`

### Spiegazione

Quando un effetto contiene logica asincrona (fetch, timer), può arrivare una risposta **dopo** che le dipendenze sono cambiate o il componente è stato smontato. In tal caso, chiamare `setState` sarebbe sbagliato: aggiornerebbe con dati obsoleti o su un componente non più presente.

Due strategie semplici:

1. **Flag booleano** nel cleanup: l’effetto imposta `active=false` quando “non è più valido”; la callback controlla `active` prima di chiamare `setState`.
2. **`AbortController`**: per API che lo supportano (es. `fetch`). In cleanup chiami `controller.abort()`, e l’operazione si interrompe.

> Nota: scegli un solo approccio per effetto. Se usi `fetch`, `AbortController` è più semantico; per promise generiche, il flag è universale.

### Esempio semplice (flag)

```tsx
import { useEffect, useState } from "react";

export function FetchWithFlag({ term }: { term: string }) {
  const [data, setData] = useState<string>("");

  useEffect(() => {
    let active = true;

    (async () => {
      // Simula fetch
      await new Promise(r => setTimeout(r, 300));
      const result = `Risultato per: ${term}`;
      if (active) setData(result);
    })();

    return () => { active = false; };
  }, [term]);

  return <div>{data || "Caricamento..."}</div>;
}
```

---

## 4.7 Dipendenze mancanti e oggetti ricreati: i due errori più frequenti

### Spiegazione

* **Dipendenze mancanti**: l’effetto usa un valore ma non lo include nell’array. Rischio di **stale closure** o logiche incoerenti.
* **Oggetti/array/funzioni ricreati**: ad ogni render cambia la **referenza** e l’effetto riesegue in loop anche se il contenuto è “uguale”.

  * Soluzioni: rendere stabili le dipendenze (più avanti con `useMemo`/`useCallback`), oppure **spostare la logica fuori dall’effetto** quando possibile, o usare un **ref** per l’ultimo valore realmente necessario.

### Esempio semplice (loop involontario)

```tsx
import { useEffect, useState } from "react";

export function LoopPitfall() {
  const [n, setN] = useState(0);
  const cfg = { step: 1 }; // referenza nuova ogni render

  useEffect(() => {
    // Si attiverà ad ogni render perché 'cfg' cambia referenza,
    // e setN provoca un nuovo render → loop potenziale
    setN(v => v + cfg.step);
  }, [cfg]);

  return <div>n = {n}</div>;
}
```

> Come evitare: rendere `cfg` stabile (accenno: `useMemo`), o non usarlo in deps, o leggere `step` da un ref/stato stabile.

---

## 4.8 `useEffect` vs `useLayoutEffect`

### Spiegazione

* **`useEffect`**: post-paint. Ottimo per codice che **non** influenza il layout immediato: fetch, timer, log, subscribe/unsubscribe, sincronizzazioni non critiche.
* **`useLayoutEffect`**: eseguito **subito dopo il commit ma prima del paint**. Serve quando devi **misurare il DOM** o applicare modifiche che devono essere visibili senza flicker (es. calcolare dimensioni, scorrere una lista, forzare focus con misure dipendenti dal layout).

Regola semplice: se l’effetto deve **leggere/sincronizzare layout** prima che l’utente veda il frame, usa `useLayoutEffect`. Altrimenti, `useEffect`.

### Esempio semplice

```tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function LayoutVsEffect() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState<number | null>(null);

  useLayoutEffect(() => {
    // Lettura sincrona del layout, evita flicker
    const rect = boxRef.current?.getBoundingClientRect();
    setW(rect ? Math.round(rect.width) : null);
  }, []);

  useEffect(() => {
    // Post-paint: es. log, fetch, subscribe
    // Non influisce sulla misura sincronizzata
  }, []);

  return <div ref={boxRef} style={{ width: 200, border: "1px solid #ccc" }}>W: {w}</div>;
}
```

---

## 4.10 Riepilogo operativo

* In effetti asincroni, **evita aggiornamenti obsoleti** con flag o `AbortController`.
* Evita **deps mancanti** e **deps oggetto/array/funzione** ricreate ad ogni render (stabilizza quando necessario o cambia approccio).
* Usa `useLayoutEffect` solo se devi **sincronizzarti col layout** prima del paint; altrimenti `useEffect`.
* In Strict Mode, assicurati che setup e cleanup siano **idempotenti**.

---





























# Perché `useEffect` deve elencare le sue dipendenze

## Idea chiave

Quando React esegue un effetto, usa i **valori del render in cui l’effetto è stato creato**.
Se l’effetto usa un valore che **può cambiare** ma non lo metti tra le dipendenze, l’effetto continuerà a usare **la versione vecchia** di quel valore.

Mettere i valori nell’array delle dipendenze (`[ ... ]`) dice a React:
“Quando uno di questi cambia, ricrea l’effetto con i **valori aggiornati**.”

---

## 1) Cosa succede senza la dipendenza

### Esempio minimo: valore “vecchio”

```tsx
import { useEffect, useState } from "react";

export default function Demo() {
  const [query, setQuery] = useState("a");

  useEffect(() => {
    // ❌ gira solo al mount: userà sempre la query del primo render ("a")
    console.log("Chiamo API con:", query);
  }, []); // dipendenze vuote

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

Problema: cambi l’input, ma l’effetto continua a vedere la **vecchia** `query`.

---

## 2) Stessa cosa, ma corretta

### Esempio minimo: dipendenza corretta

```tsx
import { useEffect, useState } from "react";

export default function Demo() {
  const [query, setQuery] = useState("a");

  useEffect(() => {
    // ✅ si ricrea ogni volta che query cambia: usa sempre l’ultimo valore
    console.log("Chiamo API con:", query);
  }, [query]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

Ora l’effetto è **coerente** con la UI.

---

## 3) Oggetti/funzioni ricreati a ogni render

L’array delle dipendenze confronta per **referenza**.
Se passi un oggetto nuovo a ogni render, l’effetto riparte ogni volta, anche se “sembra” uguale.

### Esempio minimo: loop facile

```tsx
import { useEffect, useState } from "react";

export default function Demo() {
  const [n, setN] = useState(0);
  const conf = { step: 1 }; // nuova referenza ad ogni render

  useEffect(() => {
    // Si attiva ad ogni render perché 'conf' cambia referenza.
    setN(v => v + conf.step); // e questo causa un altro render...
  }, [conf]);

  return <div>n = {n}</div>;
}
```

Risultato: effetto che si innesca continuamente.
Soluzioni tipiche (senza dettagli ora): non usare oggetti instabili come dipendenze; quando serve, stabilizzarli o leggere solo i valori primitivi realmente necessari.

---

## 4) Se vuoi sempre “l’ultimo valore” ma non vuoi ricreare l’effetto

Puoi salvare l’ultimo valore in un **ref** e leggerlo nell’effetto. Così l’effetto non dipende da quel valore, ma quando esegue la sua logica legge **l’ultimo**.

### Esempio minimo: ref “specchio”

```tsx
import { useEffect, useRef, useState } from "react";

export default function Demo() {
  const [query, setQuery] = useState("a");
  const latest = useRef(query);
  latest.current = query; // aggiorno il ref ad ogni render

  useEffect(() => {
    const id = setInterval(() => {
      // legge sempre l’ultimo valore senza ricreare l’effetto
      console.log("Uso l'ultimo query:", latest.current);
    }, 500);
    return () => clearInterval(id);
  }, []); // nessuna dipendenza

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

Quando usare questo pattern: quando l’effetto non deve essere ricreato ogni volta, ma deve comunque lavorare sul **dato più recente**.


---

## Regole semplici da seguire

1. Se l’effetto **usa** una variabile che può cambiare (stato o prop), mettila nelle **dipendenze**.
2. Se l’effetto non deve ripartire ogni volta, ma ti serve l’ultimo valore, **salvalo in un ref** e leggilo nell’effetto.
3. Evita di usare direttamente in deps **oggetti/funzioni creati a ogni render**: portano a riesecuzioni continue o loop.
4. Prima assicurati della **correttezza** (tutte le dipendenze necessarie); poi, se serve, ottimizza stabilizzando referenze quando tratteremo `useMemo`/`useCallback`.



































Di seguito un esempio **semplice** in **TypeScript** che usa **`useState`**, **`useEffect`** e **`useRef`**, con una piccola app “todo”.
Mostra: **render di una lista**, **components** separati e **props drilling** (dati e handler passati giù ai figli).
I commenti mettono in evidenza le **best practice** e gli errori da evitare.

> Incolla in `App.tsx` (Vite React + TS) — non richiede librerie extra.

```tsx
import { useEffect, useRef, useState } from "react";

/**
 * Tipi espliciti per i dati della lista.
 * Vantaggi: autocompletamento, errori rilevati a compile-time, API più chiare.
 */
type Todo = {
  id: string;      // identificatore stabile e persistente (usato anche come key)
  title: string;   // testo del task
  done: boolean;   // stato di completamento
};

/**
 * -------------------------
 * App (container “smart”)
 * -------------------------
 * - Contiene lo stato “sorgente di verità” (lista, input, query).
 * - Espone funzioni di aggiornamento (add/toggle/remove) ai figli via props.
 * - Esegue side-effect non bloccanti (autofocus, finta fetch su query).
 *
 * Nota sul flusso dati:
 * App -> (props drilling) -> TodoList -> TodoItem
 * Le modifiche ritornano verso l’alto tramite callback passate come props.
 */
export default function App() {
  /**
   * Stato principale della lista. Mantenerlo qui (in alto) permette:
   * - un unico punto di verità,
   * - semplice passaggio di dati/handler ai figli,
   * - controllo centralizzato delle regole di aggiornamento.
   *
   * Importante: NON mutare array/oggetti in place; crea sempre nuove copie
   * (immutabilità) per consentire a React di percepire i cambiamenti.
   */
  const [items, setItems] = useState<Todo[]>([
    { id: "1", title: "Studiare React", done: false },
    { id: "2", title: "Fare la spesa", done: true },
  ]);

  /**
   * Stato per l’input del nuovo titolo e per il filtro di ricerca.
   * Gli input sono "controllati": il valore mostrato in UI è quello dello stato.
   */
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");

  /**
   * Ref al nodo DOM dell'input. I ref:
   * - mantengono un contenitore mutabile che sopravvive ai render,
   * - NON causano re-render quando cambiano,
   * - sono ideali per interazioni imperative con il DOM (focus, selezione, misura).
   */
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Effect post-paint: eseguito dopo commit e paint del browser.
   * Qui facciamo autofocus sul campo: non è critico per il layout, quindi useEffect va bene.
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []); // deps vuote: esegue al mount, cleanup allo smontaggio (qui non serve)

  /**
   * Finta "fetch" su query per mostrare:
   * - come includere TUTTE le dipendenze che l’effetto usa (qui: query),
   * - come usare un flag/cleanup per evitare aggiornamenti “fuori tempo”
   *   quando query cambia o il componente si smonta prima dell’esito.
   *
   * Nota: in un’app reale, qui useresti fetch/axios + AbortController.
   */
  const [fakeResult, setFakeResult] = useState<string>("(nessun risultato)");
  useEffect(() => {
    // Se il filtro è vuoto, impostiamo un hint base e non avviamo “ricerche”.
    if (!query.trim()) {
      setFakeResult("(nessun risultato)");
      return;
    }

    let active = true; // guard di validità: se cambia query, invalidiamo il “vecchio” effetto
    const id = setTimeout(() => {
      // Simuliamo una latenza di rete: se nel frattempo query è cambiata,
      // il cleanup setterà active=false e questo update verrà ignorato.
      if (active) setFakeResult(`Risultati per: "${query}"`);
    }, 300);

    // Cleanup: invalida l’effetto precedente e rimuove il timer.
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query]); // dipendenza necessaria: l’effetto usa `query` e deve “seguire” i suoi aggiornamenti

  /**
   * Aggiunge un elemento alla lista.
   * - Usa la forma updater di setState per evitare problemi di closure/concorrenti.
   * - Genera un id stabile (qui con Date.now(), in produzione meglio un uuid).
   * - Reset del campo e refocus sull’input per UX fluida.
   */
  function addItem() {
    const t = title.trim();
    if (!t) return;

    setItems(prev => [
      ...prev,
      { id: String(Date.now()), title: t, done: false },
    ]);

    setTitle("");                // reset dell’input controllato
    inputRef.current?.focus();   // UX: resta nel flusso di inserimento
  }

  /**
   * Toggle dello stato `done` del singolo elemento per id.
   * - Immutabilità: crea un nuovo array, copia il singolo item aggiornando solo il campo necessario.
   * - Niente mutazioni in place: React deve percepire una nuova referenza.
   */
  function toggleItem(id: string) {
    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, done: !it.done } : it)),
    );
  }

  /**
   * Rimozione di un elemento per id.
   * - Usa filter per costruire un nuovo array senza l’elemento target.
   */
  function removeItem(id: string) {
    setItems(prev => prev.filter(it => it.id !== id));
  }

  /**
   * Stato derivato “in render”: la lista filtrata in base alla query.
   * - Non salviamo questo risultato nello stato: evitiamo duplicazioni e incoerenze.
   * - Calcoliamo “al volo” dal dato sorgente (items) e dal filtro (query).
   */
  const visible = query
    ? items.filter(it =>
        it.title.toLowerCase().includes(query.toLowerCase().trim()),
      )
    : items;

  return (
    <main style={{ maxWidth: 560, margin: "24px auto", padding: 12 }}>
      <h1>Todo (useState, useEffect, useRef)</h1>

      {/**
       * Blocco di inserimento:
       * - input controllato (value = title, onChange aggiorna lo stato),
       * - ref DOM per il focus imperativo,
       * - bottone che invoca addItem (aggiorna la lista in modo immutabile).
       */}
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          ref={inputRef} // ref DOM
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Nuovo task…"
          style={{ flex: 1 }}
        />
        <button onClick={addItem}>Aggiungi</button>
      </div>

      {/**
       * Ricerca:
       * - altro input controllato per `query`,
       * - l’effetto sopra reagisce a query e simula una fetch (con cleanup).
       */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filtra per titolo…"
          style={{ flex: 1 }}
        />
      </div>
      <small style={{ color: "#555" }}>Hint: {fakeResult}</small>

      {/**
       * Props drilling:
       * - App passa ai figli sia i dati (`visible`) sia gli handler (`toggleItem`, `removeItem`).
       * - I figli sono “presentational”: non possiedono lo stato della lista; delegano ad App.
       */}
      <TodoList items={visible} onToggle={toggleItem} onRemove={removeItem} />
    </main>
  );
}

/**
 * -------------------------
 * TodoList (presentational)
 * -------------------------
 * - Responsabilità: presentare un elenco e propagare azioni verso l’alto.
 * - Best practice: usare key STABILI (id persistente), mai l’indice dell’array.
 * - Nessuna logica di business qui: mantiene i componenti piccoli e riusabili.
 */
function TodoList(props: {
  items: Todo[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { items, onToggle, onRemove } = props;

  if (items.length === 0) {
    return <p style={{ marginTop: 12 }}>Nessun elemento</p>;
  }

  return (
    <ul style={{ marginTop: 12, paddingLeft: 16 }}>
      {items.map(item => (
        /**
         * Key:
         * - guida la reconciliation di React tra render successivi,
         * - deve essere stabile e unica per quell’elemento,
         * - usare l’indice porta a bug quando si riordina/filtra/insersice.
         */
        <TodoItem
          key={item.id}
          item={item}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

/**
 * -------------------------
 * TodoItem (foglia)
 * -------------------------
 * - Componente minimale e “puro”: riceve i dati e invoca callback.
 * - Non muta direttamente il prop `item` (immutabilità).
 * - Gestisce solo la UI del singolo elemento.
 */
function TodoItem(props: {
  item: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { item, onToggle, onRemove } = props;

  return (
    <li style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0" }}>
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggle(item.id)} // chiama il parent per aggiornare lo stato
      />
      <span
        style={{
          textDecoration: item.done ? "line-through" : "none",
          flex: 1,
        }}
      >
        {item.title}
      </span>
      <button
        onClick={() => onRemove(item.id)}
        aria-label={`Rimuovi ${item.title}`}
        title="Rimuovi"
      >
        ✕
      </button>
    </li>
  );
}

```

## Best practice evidenziate nel codice

* **Stato immutabile**: crea nuovi array/oggetti (spread, `map`, `filter`), **mai** mutare in place.
* **Updater function**: `setItems(prev => ...)` per evitare problemi di closure e aggiornamenti concorrenti.
* **Effetti con cleanup**: quando usi timer/fetch, pulisci sempre (clear/abort) nel `return`.
* **Dipendenze dell’effetto**: includi sempre i valori che l’effetto **usa** (qui `query`).
* **`useRef` per DOM o memoria non reattiva**: focus al mount; non provoca re-render.
* **Derivazioni in render**: filtra la lista nel render, non duplicare lo stato (evita “source of truth” multiple).
* **Key stabili**: usa `id`, non l’indice.
* **Props drilling chiaro**: i figli sono “presentational”, non possiedono lo stato della lista.
* **Semplicità prima di ottimizzare**: evitare premature ottimizzazioni (es. stabilizzare handler) finché non serve; la versione base deve essere corretta e leggibile.


































---

# 5) `useLayoutEffect` vs `useEffect`

## 5.1 Differenza di timing (cosa succede e quando)

* **Render phase**: React esegue il componente e calcola il nuovo albero.
* **Commit phase**: React applica le mutazioni al DOM.

Poi:

* **`useLayoutEffect`**: esegue **subito dopo il commit, prima del paint**.
  → Può **leggere e scrivere** layout in modo **sincrono**; il browser **non dipinge** finché il layout effect non finisce.
  → Se fai lavoro pesante qui, **blocchi** il frame (jank).

* **`useEffect`**: esegue **dopo** il paint (effetto “passivo”).
  → Non blocca il rendering. Ideale per fetch, timer, subscribe, logging.

**Regola pratica**

* Se devi **misurare** il DOM (dimensioni/posizione) o **sincronizzare** stile/scroll **prima che l’utente veda il frame**, usa **`useLayoutEffect`**.
* Quasi tutto il resto (fetch, analytics, eventi, cache) → **`useEffect`**.

---

## 5.2 Perché `useLayoutEffect` evita flicker

Se misuri con `useEffect`, il browser potrebbe aver già dipinto: vedrai un “prima” e poi un “aggiustamento” (flicker).
Con `useLayoutEffect`, misuri/aggiusti **prima** del paint: l’utente vede solo lo stato finale.

### Esempio minimo: misura larghezza senza flicker

```tsx
import { useLayoutEffect, useRef, useState } from "react";

export function BoxMeasure() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setW(Math.round(rect.width)); // misura prima del paint
  }, []);

  return (
    <div ref={boxRef} style={{ width: 240, border: "1px solid #ccc", padding: 8 }}>
      Larghezza: {w ?? "…"}
    </div>
  );
}
```

> Se sostituisci `useLayoutEffect` con `useEffect`, potresti vedere un “…” per un frame, poi il numero (piccolo flicker).

---

## 5.3 Scrivere layout (classe/stile/scroll) prima del paint

Quando aggiorni **classi/stili** che influiscono sul layout, fallo nel layout effect per evitare che l’utente veda il frame “non stilizzato”.

### Esempio minimo: scroll alla fine prima del paint

```tsx
import { useLayoutEffect, useRef } from "react";

export function AutoScrollBottom() {
  const listRef = useRef<HTMLUListElement | null>(null);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight; // sincronizza scroll pre-paint
  }, []);

  return (
    <ul ref={listRef} style={{ maxHeight: 120, overflow: "auto", border: "1px solid #ccc" }}>
      {Array.from({ length: 40 }, (_, i) => <li key={i}>Riga {i + 1}</li>)}
    </ul>
  );
}
```

---

## 5.4 SSR: `useLayoutEffect` avvisa (warning) lato server

`useLayoutEffect` **presuppone** il DOM. In SSR non c’è DOM: React mostra un warning se lo esegui sul server.
Pattern comuni:

* **Condizionare** l’uso: usare `useEffect` sul server e `useLayoutEffect` sul client (“isomorphic layout effect”).
* **Guard** su `typeof window !== "undefined"`.





































---

# 6) `useMemo` e `useCallback` (referenze stabili)

## 6.1 Concetti chiave

* **`useMemo`**: calcola e *memorizza* un **valore** derivato (numero, stringa, oggetto, array).

  * Scopo: **evitare ricalcoli costosi** e produrre **una referenza stabile** finché le dipendenze non cambiano.
  * Nota importante: **non** evita i render da solo; aiuta altri meccanismi (es. `React.memo`) a capirsi meglio, perché conserva la *stessa referenza* quando non serve ricrearla.

* **`useCallback`**: come `useMemo`, ma per **funzioni**: `useCallback(fn, deps)` ≡ `useMemo(() => fn, deps)`.

  * Scopo: dare ai figli (specie se memoizzati) **una callback con referenza stabile**, così non “vedono” una prop nuova a ogni render.

* **Dietro le quinte**: React conserva in una piccola **cache per dipendenze** il valore/funzione e le deps usate. Se alla render successiva le deps **non cambiano** (confronto *per referenza*), React **riusa** il valore/callback precedente identico (stessa referenza).

* **Anti-pattern**: usare `useMemo`/`useCallback` “a tappeto” ovunque.

  * Ogni memoizzazione ha un costo (spazio + confronto deps).
  * Applicale dove hanno **effetto misurabile**: ricalcoli costosi, liste grandi, figli memoizzati, referenze che cambiano inutilmente.

---

## 6.2 Micro-dimostrazioni (semplici)

### A) `useMemo` per un calcolo costoso (o per stabilizzare un oggetto)

```tsx
import { useMemo, useState } from "react";

function HeavyComputeDemo() {
  const [n, setN] = useState(20);

  // Simula costo: ciclo pesante
  const primes = useMemo(() => {
    const res: number[] = [];
    outer: for (let x = 2; x < 100000; x++) {
      for (let d = 2; d * d <= x; d++) if (x % d === 0) continue outer;
      res.push(x);
      if (res.length >= n) break;
    }
    return res;
  }, [n]); // ricalcola solo se n cambia

  return (
    <div>
      <button onClick={() => setN(v => v + 1)}>n = {n}</button>
      <div>Primi calcolati: {primes.length}</div>
    </div>
  );
}
```

Senza `useMemo`, ogni render rifarebbe il calcolo. Con `useMemo`, lo eviti quando `n` è invariato.

---

### B) `useCallback` per callback stabili verso un figlio memoizzato

```tsx
import { memo, useCallback, useState } from "react";

const Child = memo(function Child(props: { onPing: () => void }) {
  // renderà solo se cambia la prop (shallow)
  return <button onClick={props.onPing}>Ping</button>;
});

function CallbackDemo() {
  const [count, setCount] = useState(0);

  // Senza useCallback, onPing sarebbe una nuova funzione ad ogni render
  const onPing = useCallback(() => {
    console.log("ping");
  }, []); // stabile finché le deps non cambiano

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>count = {count}</button>
      <Child onPing={onPing} />
    </div>
  );
}
```

`Child` è `memo`: se `onPing` resta la *stessa referenza*, l’incremento di `count` non lo fa ri-renderizzare.

---

## 6.3 Quando usarli (euristiche pratiche)

* **Usa `useMemo`** quando:

  * il calcolo è **costoso** e viene rieseguito spesso inutilmente;
  * vuoi passare a un figlio memoizzato un **oggetto/array** con referenza stabile (es. `{a:1}` creato una sola volta).
* **Usa `useCallback`** quando:

  * passi **callback** a figli memoizzati o a dipendenze di effetti/`useMemo` che altrimenti cambierebbero a ogni render.
* **Evita** di memorizzare tutto “per principio”: misura o individua i colli di bottiglia *prima* di introdurre memo.

---

## 6.4 Errori comuni

* **Dipendenze sbagliate o mancanti** → referenze “stabili” quando dovrebbero cambiare o viceversa.
  Includi sempre **tutto ciò che l’espressione usa** (regola degli effect vale anche qui).
* **Memoizzare valori primitivi** inutilmente (stringhe, numeri semplici) → costo > beneficio.
* **Memoizzare per nascondere bug**: se la prop cambia a ogni render, capire **perché** (pattern di stato/props) prima di tamponare.

---

# Esempio finale runnabile: lista con `React.memo` + `useCallback`

**Obiettivo**

* Abbiamo una lista di elementi.
* Ogni riga è un componente memoizzato (`Row`).
* Il parent passa una **callback stabile** con `useCallback`.
* Usiamo `useMemo` solo per fornire un **oggetto prop stabile** alla riga (dimostrativo).

Copia in `App.tsx` (React + TS).

```tsx
import { memo, useCallback, useMemo, useState } from "react";

type Item = { id: string; label: string };

/**
 * <Row> è MEMOIZZATO con React.memo:
 * - React lo ri-renderizza SOLO se una delle sue props cambia per SHALLOW EQUAL
 *   (cioè cambia la referenza o un primitivo diverso).
 * - Qui osserviamo in console quando la riga si ri-renderizza e perché.
 */
const Row = memo(function Row(props: {
  item: Item;                    // oggetto: cambia referenza se ricreato (immutabilità)
  onSelect: (id: string) => void; // callback: conviene renderla STABILE con useCallback
  meta: { role: string };        // oggetto: se ricreato inline rompe la memoizzazione
}) {
  const { item, onSelect, meta } = props;

  // LOG didattico: ogni volta che vedi questo, la riga ha ri-renderizzato
  console.log("render <Row>", item.id, "meta.role=", meta.role);

  return (
    <li style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span>{item.label}</span>
      <small style={{ color: "#777" }}>({meta.role})</small>
      <button onClick={() => onSelect(item.id)}>Seleziona</button>
    </li>
  );
});

/**
 * <App>:
 * - mantiene lo STATO sorgente (lista, selezione, flag UI)
 * - prepara props STABILI per i figli memoizzati:
 *   - callback con useCallback
 *   - oggetti con useMemo
 * - dimostra come un oggetto INLINE (meta instabile) rompe React.memo
 */
export default function App() {
  // Lista in stato: così possiamo fare UPDATE IMMUTABILI di una singola riga.
  const [items, setItems] = useState<Item[]>(
    Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      label: `Riga ${i + 1}`,
    }))
  );

  // Stato "non correlato" alle righe (serve per dimostrare che
  // l'aggiornamento del parent NON forza i figli se le loro props restano stabili).
  const [count, setCount] = useState(0);

  // Id della riga selezionata. NOTA: selezionare NON cambia la referenza degli item,
  // quindi le righe non dovrebbero ri-renderizzare se le altre props restano stabili.
  const [selected, setSelected] = useState<string | null>(null);

  // Flag per dimostrare l'antipattern: meta instabile (oggetto creato inline ad ogni render)
  const [useUnstableMeta, setUseUnstableMeta] = useState(false);

  /**
   * Callback STABILE:
   * - useCallback([]) restituisce SEMPRE la stessa referenza finché le deps non cambiano.
   * - React.memo su Row vede che onSelect non cambia -> non è un motivo di re-render.
   *
   * Nota: setSelected è stabile per definizione; la dipendenza [] è corretta qui.
   */
  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  /**
   * Oggetto STABILE:
   * - senza useMemo, ogni render creerebbe { role: "readonly" } con referenza nuova,
   *   rompendo React.memo su Row (che vedrebbe una prop diversa ad ogni render).
   */
  const stableMeta = useMemo(() => ({ role: "readonly" }), []);

  /**
   * Scegli tra:
   * - meta STABILE (usa stableMeta) -> righe NON ri-renderizzano al cambio di count
   * - meta INSTABILE (oggetto inline) -> ogni render del parent crea una nuova referenza
   *   e TUTTE le righe ri-renderizzano (antipattern evidenziato).
   */
  const meta = useUnstableMeta ? { role: "readonly" } : stableMeta;

  /**
   * Update IMMUTABILE solo della prima riga:
   * - crea un nuovo array (spread/Map) e un NUOVO oggetto solo per l'elemento target.
   * - Risultato atteso: React.memo farà ri-renderizzare SOLO Row con id "1".
   */
  const updateFirstLabel = () => {
    setItems(prev =>
      prev.map((it, idx) =>
        idx === 0 ? { ...it, label: it.label + " *" } : it
      )
    );
  };

  /**
   * Aggiunge una riga in coda:
   * - crea una nuova entry con id stabile,
   * - Row per la nuova riga verrà renderizzata (le altre restano ferme se props stabili).
   */
  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: String(Date.now()), label: `Riga ${prev.length + 1}` },
    ]);
  };

  // LOG didattico: per capire quando e perché <App> ri-renderizza
  console.log("render <App>", {
    count,
    selected,
    itemsLen: items.length,
    metaStable: !useUnstableMeta,
  });

  return (
    <main style={{ maxWidth: 560, margin: "24px auto", padding: 12 }}>
      <h1>Lista con React.memo + useCallback (props stabili)</h1>

      {/* Barra di controlli: prova i vari casi e osserva i log in console */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        {/* Aggiorna stato del parent NON correlato alle righe */}
        <button onClick={() => setCount(c => c + 1)}>count = {count}</button>

        {/* Aggiorna SOLO la prima riga in modo immutabile */}
        <button onClick={updateFirstLabel}>Aggiorna etichetta riga 1</button>

        {/* Aggiunge una nuova riga */}
        <button onClick={addItem}>Aggiungi riga</button>

        {/* Attiva/disattiva meta instabile per mostrare l'antipattern */}
        <label style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={useUnstableMeta}
            onChange={e => setUseUnstableMeta(e.target.checked)}
          />
          meta instabile (oggetto inline)
        </label>
      </div>

      {/* Mostra l'id selezionato (NON forza il re-render delle righe se props stabili) */}
      <div style={{ marginBottom: 8 }}>
        Selezionato: <strong>{selected ?? "—"}</strong>
      </div>

      {/* La lista: ogni Row è memoizzata. Stable props = meno re-render. */}
      <ul style={{ display: "grid", gap: 6, paddingLeft: 16 }}>
        {items.map(item => (
          <Row
            key={item.id}
            item={item}
            onSelect={handleSelect} // callback con referenza STABILE
            meta={meta}            // prova stabile vs instabile con il toggle
          />
        ))}
      </ul>

      <p style={{ color: "#666", marginTop: 12, fontSize: 12 }}>
        Apri la console:
        <br />— clic su <em>count</em>: se <code>meta</code> è stabile, le righe NON ri-renderizzano.
        <br />— clic su <em>Aggiorna etichetta riga 1</em>: si ri-renderizza SOLO la riga 1 (immutabilità).
        <br />— abilita <em>meta instabile</em>: ogni render del parent crea una referenza nuova e
        tutte le righe ri-renderizzano (antipattern).
      </p>
    </main>
  );
}



```

### Cosa osservare

* Clicca il bottone `count` (che aggiorna solo lo stato del parent).

  * In console vedrai che **le righe NON si ri-renderizzano**: le loro props non sono cambiate (callback e oggetto **stabili**).
* Clicca “Seleziona” su una riga.

  * Verrà aggiornato solo lo stato `selected` nel parent; le righe **restano ferme** se le loro props non cambiano.

### Linee guida applicate nell’esempio

* `Row` è `memo`: re-render solo su **cambio shallow** di props.
* `handleSelect` è **stabile** con `useCallback([])`.
* `rowMeta` è un **oggetto stabile** con `useMemo([])`.
* `useMemo` viene usato **solo dove serve davvero**; calcoli banali non vanno memoizzati “per sport”.

---

## Riepilogo

* **`useMemo`**: evita ricalcoli e fornisce **referenze stabili** per valori (inclusi oggetti/array) quando necessario.
* **`useCallback`**: fornisce **callback stabili** da passare ai figli memoizzati.
* Da soli **non evitano i render**: aiutano `React.memo` (o confronti shallow) a capire che **le props non sono cambiate**.
* Applicali in modo **mirato**, dove la stabilità di referenza ha impatto reale (liste, callback passate in profondità, calcoli costosi).






























# Esercizio Finale

##  Consegna (deliverable)

Un file `App.tsx` che implementa:

* Inserimento, filtro, toggle, rimozione **immutabili** dei task.
* **Misura DOM** dell’header con `useLayoutEffect` (no flicker).
* Effetti semplici con `useEffect`: un **timer** periodico e un **event listener** con **cleanup**.
* Lista di righe **memoizzate** (`React.memo`) con **callback/oggetti stabili**.
* Demo **key flip** per remount/reset di stato locale.
* Console log utili per osservare i re-render e l’ordine setup/cleanup.

---

##  Specifica funzionale

1. **Lista task** iniziale (≥3 elementi), ogni task è `{ id, title, done }`.
2. **Input “nuovo task”** (controllato) + **Aggiungi**:

   * Aggiunge in coda un nuovo task (id univoco), **immutabilmente**.
   * Resetta input e riporta il **focus** sull’input (via `ref`).
3. **Filtro** (input controllato):

   * Visualizza solo i task con `title` contenente la query (case-insensitive).
   * Nessuna richiesta di rete: il filtraggio è **derivato** in render, non salvato nello stato.
4. **Toggle** e **Rimozione**:

   * Aggiornamenti **immutabili** con `map` e `filter`.
5. **Misura header**:

   * Mostra la larghezza (`getBoundingClientRect().width`) calcolata con `useLayoutEffect` per evitare flicker.
6. **Righe memoizzate**:

   * Componente `Row` wrappato in `React.memo`.
   * Prop oggetto (`meta`) **stabile** con `useMemo` e toggle per passare a versione **instabile** (oggetto inline) per osservare i re-render.
   * Callback (`onToggle`, `onRemove`) **stabili** con `useCallback`.
7. **Effetti con cleanup**:

   * `useEffect` con **timer** (`setInterval`) che incrementa un contatore o logga un “heartbeat”. Cleanup con `clearInterval`.
   * `useEffect` con **event listener** (es. `keydown` o `resize`). Cleanup con `removeEventListener`.
   * Dimostrare **stale closure**: mostra un caso dove l’effetto leggerebbe un valore “vecchio” se non è tra le deps, e risolvilo **o** con dipendenze complete **o** con un `useRef` “mirror”.
8. **Key & remount**:

   * Un piccolo componente figlio con **stato locale** (input).
   * Un bottone “flip key” alterna la `key` (“A”/“B”) e mostra il **reset** dello stato al remount.
































