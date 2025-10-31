

## Corso Introduttivo a React Native 

### Prefazione: Un Nuovo "DOM"

Come sviluppatore React, sei abituato a questo flusso: `Stato -> React -> Virtual DOM -> react-dom -> DOM (browser)`.

In React Native, il flusso cambia: `Stato -> React -> Virtual DOM -> React Native -> UI NATIVA (iOS/Android)`.

React Native **non è** un "browser mobile". Il tuo codice JavaScript (React) viene eseguito, ma il risultato finale non è HTML e CSS. Il risultato è un `UIView` nativo di iOS o un `android.view.View` nativo di Android.

Questo significa:

  * **Performance Nativa:** Le tue app sono fluide e reattive.
  * **Niente HTML/CSS:** Dimentica `<div>`, `<p>` e `<span>`. Imparerai i loro equivalenti: `<View>`, `<Text>`.
  * **Niente CSS:** Lo stile si scrive in JavaScript, ma assomiglia molto al CSS. Il motore di layout (chiamato **Yoga**) implementa Flexbox, che sarà il tuo strumento principale.

-----

## Modulo 1: Avvio e Concetti Fondamentali

In questo modulo, installeremo l'ambiente e scriveremo la nostra prima app, analizzando ogni riga.

### 1.1: Setup dell'Ambiente: Expo vs. CLI (Metodo Moderno)

Hai due scelte principali per iniziare un progetto.

1.  **Expo (Il "Managed Workflow"):**

      * **Cos'è:** Un framework e una piattaforma sopra React Native. È la soluzione "tutto incluso" che gestisce per te tutta la complessa configurazione nativa (Xcode, Android Studio).
      * **Vantaggi:** Avvio istantaneo, accesso a una vasta libreria di API (fotocamera, sensori, notifiche) già pronte, e puoi testare sul tuo telefono in secondi.
      * **Svantaggi:** Meno controllo. Se hai bisogno di scrivere codice nativo personalizzato (Swift/Kotlin) non supportato, dovrai passare al "Bare Workflow".
      * **Consiglio:** **Inizia sempre qui.** È il modo più rapido e produttivo per l'80% delle app.

2.  **React Native CLI (Il "Bare Workflow"):**

      * **Cos'è:** La "pura" esperienza React Native. Ti genera una cartella `ios` e `android` con progetti nativi completi che devi gestire.
      * **Vantaggi:** Controllo totale.
      * **Svantaggi:** Setup complesso (richiede Xcode e Android Studio installati e configurati).
      * **Consiglio:** Usalo solo quando hai una ragione specifica e comprovata che Expo non può soddisfare.

**Per questo corso, useremo Expo.**

Come hai giustamente indicato, il comando corretto e moderno per creare un'app Expo è:

```bash
# NON è richiesta installazione globale
# Esegui l'ultima versione dello script di creazione
npx create-expo-app@latest IlMioProgetto

# Entra nella cartella
cd IlMioProgetto

# Avvia il server di sviluppo (Metro Bundler)
npx expo start
```

Questo aprirà una pagina nel tuo browser con un QR code. Scarica l'app **"Expo Go"** sul tuo telefono (iOS o Android) e scansiona il codice. Vedrai la tua app "Hello World" apparire istantaneamente.

### 1.2: Anatomia di un Progetto "Hello World"

Apriamo il file `App.js` che è stato generato. È il tuo punto di ingresso.

```javascript
import { StatusBar } from 'expo-status-bar'; // Componente specifico di Expo
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### 1.3: Analisi Approfondita: Componenti Primitivi

Come dev React, noti subito `export default function App()`. È un normale componente React. Ma i componenti *interni* sono diversi.

  * `import { ... } from 'react-native';`
    Questo è il tuo nuovo "renderer". Invece di `react-dom`, importi i *componenti primitivi* da `react-native`.

  * **`<View>`:**

      * **Equivalente Web:** `<div>`.
      * **Scopo:** È il contenitore più fondamentale. Serve per raggruppare altri componenti e, soprattutto, per **applicare layout Flexbox**.
      * **Importante:** Non puoi mettere del testo nudo dentro un `<View>` (es. `<View>Ciao</View>` **dà errore**).

  * **`<Text>`:**

      * **Equivalente Web:** `<p>`, `<span>`, `<h1>`, ecc.
      * **Scopo:** È l'**unico** componente che può contenere stringhe di testo. Qualsiasi testo visualizzato sullo schermo **deve** essere racchiuso in un componente `<Text>`.
      * **Stile:** È anche il componente a cui applichi stili di testo come `fontSize`, `color`, `fontWeight`.

> **Concetto Chiave:** Questa separazione tra `<View>` (per il layout) e `<Text>` (per il testo) è la prima, fondamentale differenza rispetto al DOM. Questa restrizione è imposta dalle API UI native sottostanti (un `UIView` non può renderizzare testo, serve un `UILabel`).

  * **`<StatusBar>`:**
      * Questo componente (importato da `expo-status-bar`) controlla la barra di stato nativa del telefono (quella con orologio, batteria, segnale Wi-Fi). Ti permette di cambiarne il colore (es. `style="light"` o `style="dark"`) o di nasconderla.

### 1.4: Analisi Approfondita: `StyleSheet.create`

Hai notato `const styles = StyleSheet.create({...})`. Potresti chiederti: "Perché non usare semplicemente uno stile inline?"

```javascript
// Modo A: Inline (Funziona, ma non è ottimale)
<View style={{ flex: 1, backgroundColor: '#fff' }} />

// Modo B: StyleSheet (Preferito)
<View style={styles.container} />
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

**Cosa succede "sotto il cofano":**

Anche nelle architetture moderne di React Native, `StyleSheet.create` offre un vantaggio.

1.  **Modo A (Inline):** Ad ogni *singolo render* del tuo componente, l'oggetto `{ flex: 1, ... }` viene **creato di nuovo in memoria** dal JavaScript. Se questo stile viene passato a un componente figlio, potrebbe causare una ri-renderizzazione non necessaria perché l'oggetto stile è *referenzialmente* diverso (un nuovo oggetto).

2.  **Modo B (StyleSheet):** `StyleSheet.create` fa due cose:

      * **Crea l'oggetto una sola volta** quando il modulo viene caricato.
      * Elabora lo stile e (sotto il cofano) gli assegna un ID.
      * In tutti i render successivi, `styles.container` si riferisce **allo stesso identico oggetto in memoria**.

Questo previene ri-renderizzazioni inutili e, nell'architettura legacy, riduceva drasticamente il traffico sul "Bridge" (il canale di comunicazione tra JS e Nativo).

**Regola professionale:** Usa *sempre* `StyleSheet.create` per stili statici. Usa stili inline solo per valori che dipendono dinamicamente dallo stato o dalle props (es. `style={{ opacity: fadeAnim }}`).

### 1.5: Il Layout con Flexbox (Yoga)

Analizziamo lo stile del contenitore:

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

  * `flex: 1`: Questo è il comando più importante. Dice al `<View>`: "Prendi tutto lo spazio disponibile del tuo genitore". Nel caso di `App.js`, il genitore è l'intera schermata.
  * `alignItems: 'center'`: Centra i figli lungo l'asse **trasversale**.
  * `justifyContent: 'center'`: Centra i figli lungo l'asse **principale**.

**Concetto Chiave (Differenza dal Web):**
In React Native, Flexbox è l'**unica** opzione di layout. E c'è una differenza cruciale:
**`flexDirection` è impostato su `column` per impostazione predefinita.**

Mentre sul web `flexDirection` è `row`, su mobile ha più senso impilare gli elementi verticalmente. Questo significa che, di default:

  * `justifyContent` controlla l'asse **verticale** ($y$).
  * `alignItems` controlla l'asse **orizzontale** ($x$).

Puoi cambiarlo in qualsiasi momento con `flexDirection: 'row'`.

-----




























-----

### 1.4 Il "Perché" di `StyleSheet.create`

Come sviluppatore React, sei abituato a diverse opzioni di styling: CSS vanilla, SASS, CSS-in-JS (come `styled-components` o `Emotion`), o stili inline.

In React Native, il metodo canonico è `StyleSheet.create`.

```javascript
// Opzione 1: Inline
<View style={{ padding: 10, backgroundColor: 'red' }} />

// Opzione 2: Oggetto JS semplice (Sconsigliato)
const myStyle = { padding: 10, backgroundColor: 'red' };
<View style={myStyle} />

// Opzione 3: StyleSheet.create (Il modo corretto)
const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'red',
  },
});
<View style={styles.container} />
```

Tutte e tre le opzioni *funzioneranno* visivamente. Ma l'Opzione 3 è **drasticamente** più performante. Per capire il perché, dobbiamo guardare sotto il cofano, prima all'architettura classica (il Bridge) e poi a quella moderna.

#### 1\. Sotto il cofano: L'Architettura "Bridge" (Classica)

Per anni, React Native ha funzionato su un'architettura a due thread:

1.  **Il JS Thread:** Dove gira il tuo codice React, lo stato, la logica.
2.  **Il Native Thread (UI Thread):** Dove gira il codice nativo (Swift/Kotlin) che disegna effettivamente i pixel sullo schermo.

Questi due mondi sono isolati. Per comunicare, usano un "Ponte" (il **Bridge**), che è un canale di comunicazione **asincrono** su cui viaggiano messaggi **serializzati (JSON)**.

**Analizziamo l'Opzione 1 (Inline):**

```javascript
<View style={{ padding: 10, backgroundColor: 'red' }} />
```

1.  Il componente esegue il `render`.
2.  **[JS Thread]** Un **nuovo** oggetto `{ padding: 10, ... }` viene creato in memoria.
3.  **[JS Thread]** React Native deve dire al lato Nativo come disegnare questa View.
4.  **[JS Thread]** L'oggetto stile `{ padding: 10, ... }` viene **serializzato in una stringa JSON**.
5.  **[Bridge]** La stringa JSON `"{\"padding\":10,\"backgroundColor\":\"red\"}"` viene inviata attraverso il Bridge.
6.  **[Native Thread]** Il lato Nativo riceve la stringa, la **deserializza** (la ritrasforma in un dizionario/mappa nativa).
7.  **[Native Thread]** Applica le proprietà di stile alla `UIView` o `android.view.View`.

Questo accade **ad ogni singolo render** del componente. Se il componente si ri-renderizza 60 volte al secondo durante un'animazione, stai inviando 60 messaggi JSON pesanti attraverso il ponte, intasandolo.

**Analizziamo l'Opzione 3 (`StyleSheet.create`):**

```javascript
const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'red',
  },
});
```

1.  **Avvio dell'App (una sola volta):** Quando il tuo file JS viene caricato per la prima volta, `StyleSheet.create` viene eseguito.
2.  **[JS Thread]** L'oggetto `{ padding: 10, ... }` viene creato.
3.  **[JS Thread]** React Native "registra" questo stile. Lo invia attraverso il Bridge **una sola volta** e gli assegna un ID numerico (es. `101`).
4.  Il JS Thread ora sa che `styles.container` non è più un oggetto, ma è semplicemente un riferimento all'ID `101`.
5.  ...
6.  **Durante il Render:** Il tuo componente esegue il `render`.
7.  **[JS Thread]** Deve inviare lo stile. Invece di un oggetto, invia solo l'ID: `101`.
8.  **[Bridge]** Il messaggio inviato è **incredibilmente leggero** (un singolo numero).
9.  **[Native Thread]** Riceve `101` e sa già (dalla registrazione iniziale) che `101` significa "applica padding 10 e sfondo rosso".

**Riepilogo del Vantaggio sul Bridge:** `StyleSheet.create` trasforma un costoso oggetto JSON, inviato ad ogni render, in un semplice ID numerico. È la differenza tra spedire un manuale di istruzioni completo 60 volte al secondo e spedire solo il numero della pagina.

#### 2\. Sotto il cofano: Architettura Moderna (JSI) e Ottimizzazione della Memoria

Potresti pensare: "Ok, ma l'architettura moderna di React Native (Fabric, JSI) sta eliminando il Bridge e la serializzazione JSON, quindi questo è irrilevante".

Non esattamente. Anche nel mondo moderno, `StyleSheet.create` offre due vantaggi cruciali:

1.  **Identità Referenziale Stabile (Memoization):**
    Questo è un concetto che conosci bene da React.
    Con lo stile inline, ad ogni render crei un **nuovo** oggetto:
    `const style_render_1 = { padding: 10 };`
    `const style_render_2 = { padding: 10 };`
    `style_render_1 === style_render_2` è **`false`**.

    Se passi questo stile come prop a un componente figlio ottimizzato con `React.memo`, il figlio si ri-renderizzerà inutilmente, perché la prop `style` è *tecnicamente* cambiata (è un nuovo oggetto).

    Con `StyleSheet.create`, l'oggetto `styles.container` viene creato **una sola volta** e messo in cache.
    `styles_render_1.container === styles_render_2.container` è **`true`**.
    Questo garantisce l'identità referenziale, permettendo a `React.memo` e ad altre ottimizzazioni di funzionare correttamente.

2.  **Validazione degli Stili:**
    `StyleSheet.create` non si limita a memorizzare l'oggetto. Esegue anche una validazione. Se scrivi una proprietà di stile non valida (es. `pading: 10` con un errore di battitura, o una proprietà CSS web non supportata), React Native ti avviserà immediatamente in fase di sviluppo. Gli stili inline vengono processati "al volo" e possono portare a errori più silenziosi o difficili da debuggare.

-----

### Riepilogo (Perché `StyleSheet`?)

Usiamo `StyleSheet.create` perché è una **dichiarazione di intenti** professionale che porta a performance migliori.

  * **Dichiara che lo stile è statico:** Comunichi a React Native che questo stile non cambierà.
  * **Ottimizza la comunicazione (Legacy):** Evita la serializzazione JSON e l'intasamento del Bridge inviando solo un ID.
  * **Ottimizza la Memoria (Moderno):** Garantisce l'identità referenziale, prevenendo ri-renderizzazioni inutili nei componenti figli.
  * **Fornisce Sicurezza:** Valida i tuoi stili e ti avvisa di errori di battitura.

**Regola professionale:**

  * Usa `StyleSheet.create` per il 95% dei tuoi stili.
  * Usa stili inline *solo* per proprietà che **dipendono dinamicamente dallo stato o da props** (es. opacità di un'animazione, un colore scelto dall'utente).

Esempio ibrido corretto:

```javascript
const MyComponent = ({ isSelected }) => (
  <View 
    style={[
      styles.container, // Lo stile statico da StyleSheet
      isSelected && styles.selected // Stile condizionale da StyleSheet
    ]} 
  />
);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'grey',
  },
  selected: {
    backgroundColor: 'blue',
    borderColor: 'black',
  },
});
```




































---

### 1. Il Vantaggio Chiave: Sviluppo Cross-Platform Nativo

Questo è il motivo per cui React Native esiste.

**Il Problema:**
Prima, se volevi un'app mobile performante, dovevi costruire **due app separate**:
1.  Una in **Swift** o **Objective-C** per iOS.
2.  Una in **Kotlin** o **Java** per Android.
Questo significa due team, due codebase, costi e tempi raddoppiati.

**La Soluzione (Sbagliata): le WebView**
Le prime soluzioni "cross-platform" (come Cordova o Ionic) erano "WebView". In pratica, impacchettavano un sito web dentro un'app nativa.
* **Svantaggio:** Erano lente. L'UI non si sentiva "nativa", ma goffa e laggosa, perché era solo HTML e CSS che *cercavano* di assomigliare a un'app.

**La Soluzione di React Native: "Learn Once, Write Anywhere"**
React Native ti permette di scrivere **un'unica codebase** in JavaScript/React. Quando l'app viene compilata, React Native **non crea una WebView**. Traduce i tuoi componenti React nei loro equivalenti **reali e nativi**:

* Il tuo `<View>` **diventa** un `UIView` (iOS) o un `android.view.View` (Android).
* Il tuo `<Text>` **diventa** un `UILabel` (iOS) o un `TextView` (Android).

L'utente finale ottiene un'app che è **indistinguibile da un'app nativa**, con performance native, animazioni fluide a 60fps e accesso completo alle funzionalità del dispositivo.

---

### 2. Il Vantaggio 

* **Curva di Apprendimento Bassissima:** Non devi imparare due nuovi linguaggi (Swift, Kotlin) e due nuovi framework UI (UIKit, Android UI). **Sai già React.** Devi solo imparare i nuovi componenti (es. `<View>` invece di `<div>`) e le API mobile (es. la fotocamera). Il 90% del lavoro (state, props, hooks, logica) è identico.
* **Ecosistema Condiviso:** Puoi usare i tuoi strumenti preferiti. `npm`/`yarn`, **TypeScript**, **Redux**, **Zustand**, **TanStack Query**, **Axios**. L'intero ecosistema JavaScript è a tua disposizione per la logica di business.
* **Massima Produttività:** Non solo scrivi un'unica codebase, ma benefici del "Fast Refresh". Quando salvi un file, l'app si aggiorna sul tuo telefono in meno di un secondo, *mantenendo lo stato*. (Nello sviluppo nativo tradizionale, devi ricompilare, un processo che può richiedere minuti).

---

### 3. Efficienza e Vantaggi di Business

Quando lavori per un'azienda (o come freelance), questi sono i punti che vendi:

* **Time-to-Market Ridotto:** Lanci l'app su iOS e Android simultaneamente, dimezzando i tempi di sviluppo.
* **Costi di Manutenzione Bassi:** Un bugfix sulla logica di business (es. nel calcolo del carrello) viene scritto una volta e risolve il problema su entrambe le piattaforme.
* **Team Unificati:** Un'azienda può avere un unico team di sviluppatori JavaScript che gestisce il sito web (React), il backend (Node.js) e le app mobili (React Native).

---

### 4. Svantaggi e Limiti

Nessuno strumento è perfetto. React Native è la scelta giusta per l'80-90% delle app, ma ha dei limiti:

1.  **Non per Grafica 3D o Giochi:** Se devi costruire un gioco 3D ad alta intensità o un'app di video editing con filtri complessi in tempo reale, React Native non è lo strumento giusto. In quel caso, si usa nativo (Swift/Kotlin) o motori come Unity/Unreal.
2.  **La "Frazione" Nativa:** A volte, hai bisogno di una funzionalità così nuova o specifica (es. un SDK per un particolare hardware Bluetooth) che non esiste un modulo React Native. In questi casi, *devi* scrivere un "ponte" in codice nativo (Swift/Kotlin). Questo spezza il flusso, ma framework come **Expo** (con le sue "Config Plugins") stanno rendendo questo processo molto più facile.
3.  **Performance "Quasi" Native:** Un'app nativa pura, ottimizzata al 100%, sarà *marginalmente* più veloce di un'app React Native. Ma per la stragrande maggioranza delle app (social media, e-commerce, banche, utility), la differenza è impercettibile per l'utente finale, mentre la differenza nella velocità di sviluppo è enorme.

---

### In sintesi: Perché dovresti usarlo?

Perché React Native occupa il "punto debole" perfetto: **offre performance e UI native con la velocità di sviluppo e l'ecosistema del web.**

Per uno sviluppatore React, è il modo più rapido, efficiente e potente per passare dallo sviluppo web allo sviluppo di app mobili professionali e di alta qualità.

---



























-----

## Modulo 2: I "Nuovi Primitivi" - Tradurre React dal Web al Nativo

Come sviluppatore React, la notizia migliore è che **tutta la tua conoscenza della logica di React rimane invariata**.

### 2.1: Cosa Tieni (Il 90%)

L'intero "cervello" di React è identico. Continuerai a usare:

  * **`import React from 'react';`**: Il cuore pulsante.
  * **Hooks:** `useState`, `useEffect`, `useContext`, `useReducer`, `useCallback`, `useMemo`. Funzionano tutti *esattamente* allo stesso modo. Un `useState` in React Native gestisce lo stato e scatena un re-render, proprio come sul web.
  * **Props:** Il flusso di dati dall'alto verso il basso (genitore -\> figlio) è lo stesso.
  * **Componenti:** La creazione di componenti funzionali (o a classe, sebbene sconsigliate) è identica.
  * **Gestione degli Eventi:** Passerai funzioni come callback alle props (es. `onPress`), proprio come faresti con `onClick`.
  * **Context API:** Per lo state management globale.
  * **Librerie di State Management:** Puoi installare e usare **Zustand**, **Redux**, **Jotai**, ecc. senza alcuna differenza.

Non stai imparando un nuovo framework. Stai solo imparando un **nuovo set di "mattoncini" (componenti) per la UI**.

### 2.2: Cosa Cambia (Il 10% - La UI)

Sul web, il tuo target di rendering è il **DOM**. I tuoi "mattoncini" sono forniti da `react-dom` e sono tag HTML:

  * `<div>`
  * `<span>`, `<p>`, `<h1>`
  * `<img>`
  * `<input>`
  * `<button>`

In React Native, il tuo target di rendering è la **UI Nativa di iOS e Android**. I tuoi "mattoncini" sono forniti da `react-native` e sono componenti nativi.

Questo modulo presenta i sostituti diretti.

-----

### 2.3: `<div>` diventa `<View>`

Il `<View>` è il componente più fondamentale. È un contenitore per layout e raggruppamento.

  * **Equivalente Web:** `<div>`
  * **Cosa cambia:** Assolutamente nulla nella funzione. È un contenitore.
  * **Cosa tieni (concettualmente):** Lo usi per applicare stili (specialmente Flexbox) e per contenere altri elementi.

<!-- end list -->

```javascript
// Web (React DOM)
<div style={{ padding: 10, backgroundColor: 'blue' }}>
  <p>Ciao</p>
</div>

// React Native
import { View, Text, StyleSheet } from 'react-native';

<View style={styles.container}>
  <Text>Ciao</Text>
</View>

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'blue',
  },
});
```

-----

### 2.4: `<p>`, `<span>` diventano `<Text>`

Questo è un cambiamento **fondamentale e obbligatorio**.

  * **Equivalente Web:** Qualsiasi tag di testo (`<p>`, `<span>`, `<h1>`, `<strong>`).
  * **Cosa cambia (REGOLA CRUCIALE):** In React Native, qualsiasi stringa di testo che vuoi mostrare sullo schermo **DEVE** essere racchiusa in un componente `<Text>`.
      * Sul web, questo è valido: `<div>Ciao mondo</div>`
      * In React Native, questo **causerà un errore**: `<View>Ciao mondo</View>`
      * Il modo corretto è: `<View><Text>Ciao mondo</Text></View>`
  * **Cosa tieni:** Applichi stili come `fontSize`, `fontWeight`, `color` direttamente al componente `<Text>`.

<!-- end list -->

```javascript
// React Native
<View style={styles.container}>
  <Text style={styles.title}>Titolo</Text>
  <Text style={styles.body}>
    Questo è un paragrafo di testo. Puoi anche
    <Text style={styles.bold}> annidare </Text>
    i componenti Text per stili inline.
  </Text>
</View>

const styles = StyleSheet.create({
  container: { padding: 10 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: 'red',
  },
});
```

-----

### 2.5: `<img>` diventa `<Image>`

Molto simile, ma con una gestione delle `source` (sorgenti) specifica.

  * **Equivalente Web:** `<img>`

  * **Cosa cambia:** La prop `src` diventa `source`. La prop `source` accetta due tipi di valori:

    1.  **Immagini Locali (preferito):** Usa `require()` per includere un'immagine dal tuo progetto.
    2.  **Immagini di Rete:** Usa un oggetto `{ uri: '...' }`.

  * **Cosa tieni:** Il concetto di caricare una risorsa e mostrarla.

<!-- end list -->

```javascript
import { View, Image, StyleSheet } from 'react-native';

// 1. Immagine Locale (dal bundle)
// Con 'require', le dimensioni vengono lette automaticamente.
<Image
  source={require('./assets/mio-logo.png')}
  style={styles.logo}
/>

// 2. Immagine di Rete (da URL)
// QUI È CRUCIALE: devi specificare width e height nello stile,
// altrimenti l'immagine avrà dimensioni 0x0 e sarà invisibile.
<Image
  source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
  style={styles.remoteImage}
/>

const styles = StyleSheet.create({
  logo: {
    // 'resizeMode' è l'equivalente di 'object-fit' sul web
    resizeMode: 'contain', 
  },
  remoteImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
});
```

**Sotto il cofano (`require`):** Quando usi `require`, Metro (il bundler) processa l'immagine, la ottimizza per le varie densità di schermo (es. `@2x`, `@3x`) e la rende una risorsa nativa. È il modo più performante per caricare immagini statiche.

-----

### 2.6: `<input>` diventa `<TextInput>`

Qui vedi come la tua conoscenza di `useState` si applica perfettamente.

  * **Equivalente Web:** `<input type="text">` o `<textarea>`
  * **Cosa cambia:** La prop `onChange` (che restituisce un oggetto evento `e`) è sostituita dalla più comoda **`onChangeText`**. Questa prop riceve *direttamente la stringa* di testo aggiornata.
  * **Cosa tieni:** L'intero pattern dei **Controlled Components**. Crei uno stato con `useState` e lo usi per gestire `value` e `onChangeText`.

<!-- end list -->

```javascript
import React, { useState } from 'react'; // Tieni useState!
import { SafeAreaView, Text, TextInput, StyleSheet } from 'react-native';

export default function App() {
  // 1. Tieni 'useState' per gestire lo stato
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Email:</Text>
      
      <TextInput
        style={styles.input}
        placeholder="latuaemail@dominio.com"
        
        // 2. Tieni il pattern 'Controlled Component'
        value={email} 
        
        // 3. 'onChange' diventa 'onChangeText' (più comodo)
        onChangeText={setEmail}
        // (Equivalente web: onChange={e => setEmail(e.target.value)})
        
        // Props specifiche mobile
        keyboardType="email-address" // Mostra la tastiera giusta
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <Text style={styles.debug}>Stai scrivendo: {email}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  debug: { marginTop: 10, color: 'grey' },
});
```

-----

### 2.7: `<button>` diventa `<Button>` o (meglio) `<TouchableOpacity>`

Questo è un altro cambiamento concettuale importante.

  * **Equivalente Web:** `<button>`

#### 2.7.1: Il `<Button>` Nativo

React Native offre un `<Button>`.

```javascript
import { Button, Alert } from 'react-native';

<Button
  title="Premi qui"
  onPress={() => Alert.alert('Ciao!')}
  color="#841584"
/>
```

  * **Svantaggio:** È un componente nativo rigido. Su iOS è solo testo, su Android è un pulsante material design. **Non puoi stilizzarlo** (niente `padding`, `margin`, `backgroundColor` personalizzato, `borderRadius`).
  * **Quando usarlo:** Mai, a meno che non sia per un `Alert` ("OK" / "Cancella") o un prototipo usa e getta.

#### 2.7.2: Il "Costruttore di Pulsanti": `<TouchableOpacity>`

Per creare pulsanti *veri* e personalizzati, da sviluppatore professionista, usi i **"Touchable"**. Il più comune è `<TouchableOpacity>`.

  * **Cos'è:** Pensa a lui come a un `<View>` (un contenitore) che, quando premuto, **riduce la sua opacità** per dare un feedback visivo.
  * **Cosa cambia:** Devi costruire il tuo pulsante da zero.
  * **Cosa tieni:** Passi una funzione di callback alla prop `onPress` (l'equivalente di `onClick`).

<!-- end list -->

```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Creiamo un VERO pulsante riutilizzabile
const CustomButton = ({ onPress, title }) => (
  <TouchableOpacity 
    style={styles.button} 
    onPress={onPress}
    activeOpacity={0.7} // Controlla l'opacità al tocco
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

// Da usare così:
// <CustomButton title="Registrati" onPress={() => console.log('Toccato!')} />

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

Altri "Touchable" includono:

  * **`<TouchableHighlight>`:** Cambia il colore di sfondo al tocco (meno usato).
  * **`<Pressable>`:** Il più moderno e flessibile, ti dà ganci per `onPressIn`, `onPressOut` e uno stato `pressed` per stili dinamici.

-----

### 2.8: Lo Scorrimento: `<ScrollView>`

Sul web, se il contenuto di un `<div>` è più lungo della pagina, il browser aggiunge una barra di scorrimento automaticamente.

  * **Cosa cambia:** In React Native, un `<View>` **non scorre mai**. Se il contenuto esce dallo schermo, viene semplicemente tagliato.
  * Per abilitare lo scorrimento, devi **esplicitamente** wrappare i tuoi contenuti in un `<ScrollView>`.

<!-- end list -->

```javascript
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

const App = () => (
  <ScrollView style={styles.container}>
    <Text style={styles.text}>Elemento 1</Text>
    <Text style={styles.text}>Elemento 2</Text>
    <Text style={styles.text}>Elemento 3</Text>
    {/* ... immagina 50 elementi ... */}
    <Text style={styles.text}>Elemento 50</Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1, // Assicura che prenda lo spazio disponibile
  },
  text: {
    fontSize: 24,
    padding: 20,
    margin: 10,
    backgroundColor: '#f0f0f0',
  },
});
```

**Avvertimento (Sotto il cofano):** `<ScrollView>` renderizza **tutti i suoi figli** (Elemento 1...50) contemporaneamente. Va bene per pagine di impostazioni o articoli, ma è un disastro di performance per liste lunghe (es. social media). Questo ci porta al Modulo 3.

-----

### Riepilogo Modulo 2

  * **Logica Identica:** Tieni `useState`, `useEffect`, props, e tutto il "cervello" di React.
  * **Rendering Diverso:** Sostituisci i tag HTML con i componenti di `react-native`.
      * `div` -\> `<View>` (Contenitore)
      * `p`, `span` -\> `<Text>` (Per *tutto* il testo)
      * `img` -\> `<Image>` (Occhio a `source` e `width`/`height`)
      * `input` -\> `<TextInput>` (Usa `onChangeText` e `useState`)
      * `button` -\> `<TouchableOpacity>` (Costruisci il tuo pulsante)
      * *Scrolling* -\> `<ScrollView>` (Non è automatico)


























-----

## Modulo 3: Liste Performanti con `<FlatList>`

Invece di un componente "stupido" che renderizza tutto, React Native ci dà un componente "intelligente" che sa come gestire liste lunghe: `<FlatList>`.

### 3.1: Il Concetto Chiave: La Virtualizzazione (Virtualization)

`<FlatList>` non renderizza tutti i tuoi 5.000 elementi. Implementa una tecnica chiamata **virtualizzazione** (o "windowing").

**Cosa succede sotto il cofano:**

1.  `<FlatList>` guarda le dimensioni dello schermo. Se lo schermo può contenere 10 elementi, ne renderizza forse 15 (i 10 visibili + un piccolo "buffer" sopra e sotto).
2.  Quando scorri verso il basso, l'elemento n. 1 (che esce dallo schermo) non viene semplicemente distrutto.
3.  Viene **riciclato**: `<FlatList>` lo sposta in fondo alla lista (dove sta per apparire l'elemento n. 16) e gli **cambia solo le props** (i dati).

Questo significa che la tua app, anche con un milione di elementi, userà sempre e solo la memoria per circa 15-20 componenti. Questa è la chiave per un'app fluida a 60fps.

### 3.2: Implementazione Passo Passo

Dimentica `.map()`. Con `<FlatList>`, tu fornisci i **dati** e una **funzione per renderizzare** un singolo elemento. Sarà `<FlatList>` a decidere *quando* e *come* chiamare quella funzione.

Creiamo una lista semplice.

```javascript
import React from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  FlatList, // 1. Importa FlatList
  View, 
  Text 
} from 'react-native';

// 2. I tuoi dati (es. da un'API o uno stato)
// Definisci questo FUORI dal componente per evitare ricreazioni
const DATA = [
  { id: '3ac68afc', title: 'Primo Elemento' },
  { id: 'bd7acbea', title: 'Secondo Elemento' },
  { id: '58694a0f', title: 'Terzo Elemento' },
  { id: 'c1b1-46c2', title: 'Quarto Elemento' },
  { id: 'aed5-3ad5', title: 'Quinto Elemento' },
  // ... immagina che ce ne siano 10.000 ...
];

// 3. Il tuo componente per un singolo elemento
// Definisci questo FUORI dal componente App
// Spiegheremo il perché nella sezione "Ottimizzazione"
const Item = ({ title }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

// 4. La nostra App che usa FlatList
export default function App() {

  // 5. La funzione che dice a FlatList COME renderizzare un Item
  // Riceve un oggetto con la chiave 'item' (e 'index', 'separators')
  const renderItem = ({ item }) => (
    <Item title={item.title} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        // 'data' è l'array di dati da mostrare
        data={DATA}
        
        // 'renderItem' è la funzione che disegna un elemento
        renderItem={renderItem}
        
        // 'keyExtractor' dice a FlatList come trovare una chiave UNICA
        // Fondamentale per il riciclo!
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
}

// 6. Gli stili
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
  },
});
```

### 3.3: Analisi delle Props Fondamentali

Analizziamo il codice sopra:

  * **`data={DATA}`**: Questa è la prop più semplice. Passi il tuo array di dati. Se questo array cambia (es. tramite uno `useState`), `<FlatList>` si aggiornerà.
  * **`renderItem={renderItem}`**: Questa è la "ricetta" per un elemento. È una funzione che `<FlatList>` chiamerà per ogni elemento che *decide* di renderizzare.
      * Nota che non riceve solo `item`, ma un oggetto. Per questo abbiamo destrutturato: `({ item }) => ...`. `item` è l'oggetto singolo dal tuo array `DATA` (es. `{ id: '...', title: '...' }`).
  * **`keyExtractor={item => item.id}`**: Questo è **cruciale**. Come in React web, una `key` è necessaria. Ma qui è ancora più importante perché `<FlatList>` la usa per tracciare gli elementi da riciclare.
      * **Regola professionale:** `keyExtractor` **deve** restituire una **stringa** unica. Se i tuoi ID sono numeri, convertili: `item => item.id.toString()`.

-----

### 3.4: Ottimizzazione Professionale (Performance)

La tua lista funziona. Ma cosa succede se il componente `App` ha *altro* stato?

```javascript
export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const renderItem = ({ item }) => (
    <Item title={item.title} />
  );
  
  // ...
  return (
    <SafeAreaView>
      <TextInput value={searchTerm} onChangeText={setSearchTerm} />
      <FlatList ... />
    </SafeAreaView>
  )
}
```

**Problema:** Ogni volta che l'utente digita nella `TextInput`, lo stato `searchTerm` cambia. Questo causa un **re-render** del componente `App`.
Quando `App` si ri-renderizza, la funzione `renderItem` viene **ricreata in memoria** da zero.
`<FlatList>` vede una *nuova* prop `renderItem` e, per sicurezza, potrebbe ri-renderizzare tutti i suoi figli visibili, causando "scatti" (lag) durante la digitazione.

Inoltre, se `Item` non è ottimizzato, si ri-renderizzerà anche se le sue props non sono cambiate.

**La Soluzione Professionale:**

Due passaggi, che ti saranno familiari da React:

1.  **`React.memo` sul componente `Item`**: Dice a React "Non ri-renderizzare questo componente `Item` se le sue props (`title`) non sono cambiate".
2.  **`useCallback` su `renderItem`**: Dice a React "Non ricreare questa funzione `renderItem` a meno che le sue dipendenze non cambino".

Ecco il codice `App` aggiornato e professionale:

```javascript
import React, { useCallback } from 'react'; // Importa useCallback
import { StyleSheet, SafeAreaView, FlatList, View, Text } from 'react-native';

const DATA = [ /* ... */ ];

// 1. OTTIMIZZAZIONE: Avvolgi il componente Item in React.memo
const Item = React.memo(({ title }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
));

export default function App() {

  // 2. OTTIMIZZAZIONE: "Memoizza" la funzione renderItem
  // Verrà ricreata SOLO se le sue dipendenze (array vuoto) cambiano
  const renderItem = useCallback(({ item }) => (
    <Item title={item.title} />
  ), []); // Dipendenze vuote

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        // Props bonus per performance:
        initialNumToRender={10} // Carica 10 elementi subito
        maxToRenderPerBatch={10} // Carica 10 per batch
        windowSize={10} // Finestra di virtualizzazione
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ /* ... */ });
```

**Nota:** Definire `Item` fuori dal componente `App` (come abbiamo fatto nel primo esempio) è spesso sufficiente per `React.memo` per funzionare correttamente, ma `useCallback` su `renderItem` è una garanzia aggiuntiva.

-----

### 3.5: Bonus: Liste a Sezioni con `<SectionList>`

E se la tua lista fosse un menu di un ristorante (Antipasti, Primi, Dolci)?
React Native offre `<SectionList>`. È identico a `<FlatList>` (stessa virtualizzazione e riciclo), ma accetta una struttura dati diversa e sa come renderizzare le intestazioni di sezione.

  * **Struttura Dati:** Richiede un array di oggetti, dove ogni oggetto ha un `title` (per la sezione) e un array `data` (per gli elementi).
  * **Props Aggiuntive:** Richiede `renderSectionHeader`.

<!-- end list -->

```javascript
const MENU_DATA = [
  {
    title: 'Antipasti',
    data: ['Bruschetta', 'Caprese'],
  },
  {
    title: 'Primi',
    data: ['Carbonara', 'Amatriciana', 'Lasagne'],
  },
];

<SectionList
  sections={MENU_DATA}
  keyExtractor={(item, index) => item + index}
  renderItem={({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item}</Text>
    </View>
  )}
  renderSectionHeader={({ section: { title } }) => (
    <Text style={styles.header}>{title}</Text>
  )}
/>

// ... stili per 'header'
const styles = StyleSheet.create({
  // ... item, title, container
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#eee',
    padding: 10,
  },
});
```

-----

### Riepilogo Modulo 3

  * **Mai usare `.map()` + `<ScrollView>`** per liste lunghe.
  * Usa **`<FlatList>`** per la performance. Sfrutta la **virtualizzazione** e il **riciclo** dei componenti.
  * Le props chiave sono **`data`**, **`renderItem`**, e **`keyExtractor`**.
  * Ottimizza le performance con **`React.memo`** sul tuo componente `Item` per prevenire re-render inutili.
  * Usa **`<SectionList>`** quando hai dati raggruppati.



































-----

## Modulo 4: Navigazione con React Navigation

React Navigation è la soluzione di navigazione *de facto* per React Native. È una libreria separata, non fa parte del core di RN.

### 4.1: Installazione (Metodo Professionale Expo)

La navigazione tocca il codice nativo, quindi l'installazione richiede più di un pacchetto. Con Expo, il comando `npx expo install` è fondamentale perché installa la versione *corretta* di una libreria compatibile con il tuo SDK di Expo.

```bash
# Installa il pacchetto principale
npm install @react-navigation/native

# Installa le dipendenze richieste da Expo
# Questo è il passaggio magico: gestisce per noi 'react-native-screens' e 'react-native-safe-area-context'
npx expo install react-native-screens react-native-safe-area-context
```

### 4.2: Concetto Chiave 1: Lo Stack Navigator

Questo è il tipo di navigazione più comune. Pensa a una "pila" (stack) di carte. Ogni nuova schermata viene messa *sopra* la pila. Quando torni indietro, la carta in cima viene rimossa.

Per usarlo, dobbiamo installare il pacchetto `stack`:
`npm install @react-navigation/stack`

#### 4.2.1: Esempio Completo di Stack

Immagina un'app con due schermate: `HomeScreen` e `DetailsScreen`.

**Struttura del file (Consigliata):**

```
tuo-progetto/
├── App.js           (Il file principale)
└── screens/
    ├── HomeScreen.js
    └── DetailsScreen.js
```

**`screens/HomeScreen.js`**

```javascript
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// 'navigation' è una prop magica passata da React Navigation
// a ogni componente 'screen'.
export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Button
        title="Vai ai Dettagli"
        // 1. COME NAVIGARE: usa navigation.navigate('NomeDellaSchermata')
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

const styles = StyleSheet.create({ /* ... stili per container, title */ });
```

**`screens/DetailsScreen.js`**

```javascript
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function DetailsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Button
        title="Torna Indietro"
        // 2. COME TORNARE INDIETRO
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({ /* ... stili per container, title */ });
```

**`App.js` (Il "Direttore d'orchestra")**
Questo è il file più importante. È qui che *definisci* la struttura di navigazione.

```javascript
import React from 'react';

// 1. Importa i contenitori
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 2. Importa le tue schermate
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';

// 3. Crea l'oggetto Stack
const Stack = createStackNavigator();

export default function App() {
  return (
    // 4. 'NavigationContainer' wrappa l'intera app.
    // Gestisce lo stato di navigazione.
    <NavigationContainer>
    
      {/* 5. 'Stack.Navigator' definisce la tua "pila" */}
      <Stack.Navigator 
        initialRouteName="Home" // Schermata iniziale
        screenOptions={{ // Stili globali per l'header
          headerStyle: { backgroundColor: '#f4511e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        
        {/* 6. Definisci le schermate. Collega un nome a un componente. */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Panoramica' }} // Titolo nell'header
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 4.3: Passare Dati tra Schermate (Params)

Come fai a dire alla `DetailsScreen` *quale* elemento mostrare? Passi dei parametri (le "route params") durante la navigazione.

**Modifica `HomeScreen.js`:**

```javascript
<Button
  title="Vai ai Dettagli dell'Elemento 42"
  onPress={() => {
    // 1. Passa un oggetto come secondo argomento
    navigation.navigate('Details', { 
      itemId: 42,
      otherParam: 'Qualsiasi cosa',
    });
  }}
/>
```

**Modifica `DetailsScreen.js`:**
La schermata riceve un'altra prop magica: `route`.

```javascript
// 'route' contiene i dati passati alla schermata
export default function DetailsScreen({ route, navigation }) {
  
  // 2. Estrai i parametri
  const { itemId, otherParam } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      
      {/* 3. Usa i parametri! */}
      <Text>ID Elemento: {JSON.stringify(itemId)}</Text>
      <Text>Altro: {JSON.stringify(otherParam)}</Text>
      
      <Button
        title="Torna Indietro"
        onPress={() => navigation.goBack()}
      />
      
      {/* Bonus: 'push' crea una nuova schermata nella pila,
          anche se dello stesso tipo. Utile per es. "Prodotti Correlati"
      */}
      <Button
        title="Vai ai Dettagli... di nuovo"
        onPress={() => navigation.push('Details', {
          itemId: Math.floor(Math.random() * 100),
        })}
      />
    </View>
  );
}
```

-----

### 4.4: Concetto Chiave 2: Il Tab Navigator

Lo Stack è per un flusso (es. check-out). Ma l'architettura principale di un'app (come Instagram) usa le *schede* in basso.

Per questo, usiamo il **Bottom Tab Navigator**.

Installiamolo:
`npm install @react-navigation/bottom-tabs`

**Esempio di `App.js` con i Tab:**

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// 1. Importa 'createBottomTabNavigator'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen'; // (Un nuovo file)

// 2. Crea l'oggetto Tab
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* 3. Usa 'Tab.Navigator' */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#f4511e',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        {/* 4. Definisci le tue schermate (schede) */}
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          // options={{ tabBarIcon: ({ color, size }) => ( ... ) }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

Ora la tua app avrà una barra di navigazione in basso con "Home" e "Settings". Cliccando, l'utente *cambia* schermata, non ne *spinge* una nuova.

-----

### 4.5: Il Concetto Professionale: Annidare i Navigator

Raramente un'app ha *solo* uno Stack o *solo* dei Tab. La struttura più comune è **annidarli (nesting)**.

**Scenario Comune:**

  * Una barra **Tab** in basso (Home, Cerca, Profilo).
  * Quando sei nella scheda "Home" (che è una `FlatList`), vuoi cliccare su un post e **aprire (push)** una schermata "Dettagli Post".

**Soluzione:** La scheda "Home" non sarà un singolo componente, ma sarà il suo **proprio Stack Navigator**.

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Schermate
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import ProfileScreen from './screens/ProfileScreen';

// 1. Crea entrambi i tipi di navigator
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 2. Crea il componente per lo Stack della Home
// Questo è un componente che a sua volta contiene un Navigator
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeFeed" component={HomeScreen} options={{ title: 'Tutti i Post' }} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

// 3. App.js ora definisce il Tab Navigator principale
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        
        {/* 4. Il componente della prima scheda è
             l'INTERO 'HomeStack' che abbiamo definito sopra */}
        <Tab.Screen 
          name="Home" 
          component={HomeStack} 
          // Nasconde l'header del Tab per mostrare solo quello dello Stack
          options={{ headerShown: false }} 
        />
        
        {/* 5. L'altra scheda è un componente semplice */}
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
        />
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

**Risultato:**

  * L'utente apre l'app e vede i Tab. È sulla scheda "Home".
  * Vede la `HomeScreen` (dentro `HomeStack`).
  * Clicca su "Vai ai Dettagli".
  * `navigation.navigate('Details')` **funziona\!** `HomeStack` gestisce la transizione e *spinge* la `DetailsScreen`.
  * La barra dei Tab in basso **rimane visibile** (comportamento comune, come su Instagram).

-----

### Riepilogo Modulo 4

  * **React Navigation** è la libreria standard per la navigazione.
  * `npx expo install` è fondamentale per installare le dipendenze native corrette.
  * **`NavigationContainer`**: Deve wrappare l'intera app.
  * **`createStackNavigator`**: Per la navigazione "push/pop" (es. flusso di dettagli). Si naviga con `navigation.navigate()` e si passano dati con `route.params`.
  * **`createBottomTabNavigator`**: Per la navigazione principale a schede (es. Home, Profilo).
  * **Nesting (Annidamento)**: Il pattern professionale consiste nell'annidare navigator (es. uno Stack dentro un Tab) per creare flussi di UI complessi.










































-----

## App React Native con TypeScript, RTK Query e Axios

**Obiettivo:** Creare un'app di due schermate che carica e mostra dati da JSONPlaceholder.

**Stack Tecnico:**

  * **UI/Runtime:** React Native (gestito da Expo)
  * **Linguaggio:** TypeScript
  * **Navigazione:** React Navigation (Stack)
  * **Gestione Dati Remoti:** RTK Query (per caching, loading, error states)
  * **Client HTTP:** Axios (configurato come `baseQuery` personalizzata per RTK Query)

-----

### Passo 1: Setup del Progetto

Iniziamo creando una nuova app Expo con il template TypeScript.

```bash
# 1. Crea l'app con il template TypeScript
npx create-expo-app@latest LettorePost --template blank-typescript
# 2. Entra nella cartella
cd LettorePost
```

Per mantenere un'architettura pulita, creeremo (manualmente) questa struttura di cartelle nel tuo progetto:

```
LettorePost/
├── navigation/     # Per la logica di navigazione
├── screens/        # Per le nostre schermate
├── store/          # Per tutto ciò che riguarda Redux
└── App.tsx         # Il file di ingresso
```

-----

### Passo 2: Installazione delle Dipendenze

Ora, installiamo tutte le librerie necessarie.

**Importante:** Per le librerie con codice nativo, usiamo `npx expo install` per assicurarci di ottenere versioni compatibili con il nostro SDK Expo.

```bash
# 1. Dipendenze di Navigazione (con codice nativo)
npx expo install @react-navigation/native react-native-screens react-native-safe-area-context

# 2. Navigatore Stack
npm install @react-navigation/native-stack

# 3. Dipendenze Redux (RTK e React-Redux)
npm install @reduxjs/toolkit react-redux

# 4. Client HTTP
npm install axios
```

-----

### Passo 3: Configurazione di Redux e RTK Query

Questo è il cuore della nostra logica di dati. Creeremo uno store Redux e configureremo RTK Query per usare **Axios** come client HTTP.

Crea il file `store/api.ts` e inserisci questo codice:

```typescript
/*
 * store/api.ts
 *
 * Definiamo la nostra API slice con RTK Query.
 * La parte fondamentale è la 'axiosBaseQuery' personalizzata.
 */
import {
  createApi,
  BaseQueryFn,
} from '@reduxjs/toolkit/query/react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

// 1. Definiamo i tipi di dato che ci aspettiamo da JSONPlaceholder
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// 2. Creiamo una 'baseQuery' personalizzata che usa Axios
// Questo ci dà il massimo controllo (es. per aggiungere header, intercettori)
const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' },
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      // Esegui la chiamata Axios
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
      });
      // Restituisci i dati in un formato che RTK Query capisce
      return { data: result.data };
    } catch (axiosError) {
      // Gestisci gli errori in un formato che RTK Query capisce
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

// 3. Definiamo il nostro "API slice"
export const api = createApi({
  reducerPath: 'api', // Il nome dello slice nello store
  
  // Usiamo la nostra baseQuery personalizzata
  baseQuery: axiosBaseQuery({
    baseUrl: 'https://jsonplaceholder.typicode.com',
  }),
  
  // 4. Definiamo gli "endpoints" (le chiamate API)
  endpoints: builder => ({
    // Endpoint per ottenere tutti i post
    getPosts: builder.query<Post[], void>({
      query: () => ({ url: '/posts', method: 'GET' }),
    }),
    
    // Endpoint per ottenere un singolo post
    getPostById: builder.query<Post, number>({
      query: id => ({ url: `/posts/${id}`, method: 'GET' }),
    }),
  }),
});

// 5. Esportiamo gli hooks generati automaticamente da RTK Query
export const { useGetPostsQuery, useGetPostByIdQuery } = api;
```

Ora, crea il file `store/index.ts` per configurare lo store Redux:

```typescript
/*
 * store/index.ts
 *
 * Configuriamo e creiamo lo store Redux.
 */
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';

export const store = configureStore({
  reducer: {
    // Aggiungiamo il reducer generato dall'API slice
    [api.reducerPath]: api.reducer,
  },
  // Aggiungiamo il middleware dell'API
  // (gestisce caching, invalidazione, polling)
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(api.middleware),
});

// Esportiamo i tipi per TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

-----

### Passo 4: Configurazione della Navigazione Type-Safe

Per un'app TypeScript professionale, definiamo i tipi delle nostre rotte per ottenere autocompletamento e sicurezza.

Crea il file `navigation/types.ts`:

```typescript
/*
 * navigation/types.ts
 *
 * Definiamo la "mappa" delle nostre schermate e dei parametri
 * che si aspettano.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  PostList: undefined; // La schermata 'PostList' non riceve parametri
  PostDetail: { postId: number }; // 'PostDetail' DEVE ricevere un 'postId'
};

// Tipi helper per le props di ogni schermata
export type PostListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PostList'
>;
export type PostDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PostDetail'
>;
```

Ora, crea il file `navigation/index.tsx` per definire il nostro navigatore:

```typescript
/*
 * navigation/index.tsx
 *
 * Creiamo il nostro Stack Navigator.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // Importiamo i nostri tipi

// Importiamo le schermate (che creeremo tra poco)
import PostListScreen from '../screens/PostListScreen';
import PostDetailScreen from '../screens/PostDetailScreen';

// Creiamo lo Stack usando la nostra ParamList (per la type-safety)
const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="PostList" // Schermata di partenza
      screenOptions={{
        headerStyle: { backgroundColor: '#1e88e5' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Stack.Screen
        name="PostList"
        component={PostListScreen}
        options={{ title: 'Post Recenti' }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Dettaglio Post' }}
      />
    </Stack.Navigator>
  );
};
```

-----

### Passo 5: Creazione delle Schermate

Ora creiamo le due schermate che abbiamo definito.

Crea `screens/PostListScreen.tsx`:

```typescript
/*
 * screens/PostListScreen.tsx
 *
 * Mostra la lista di post usando FlatList e RTK Query.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useGetPostsQuery } from '../store/api';
import { PostListScreenProps } from '../navigation/types';
import { Post } from '../store/api';

// Definiamo un componente Item memoizzato per ottimizzare la FlatList
const PostItem = React.memo(
  ({ item, onPress }: { item: Post; onPress: (id: number) => void }) => {
    return (
      <TouchableOpacity onPress={() => onPress(item.id)} style={styles.item}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      </TouchableOpacity>
    );
  },
);

const PostListScreen = ({ navigation }: PostListScreenProps) => {
  // 1. Usiamo l'hook generato da RTK Query.
  //    'data', 'isLoading', 'error' sono gestiti automaticamente.
  const { data: posts, isLoading, error } = useGetPostsQuery();

  // 2. Gestiamo la navigazione con un callback memoizzato
  const handlePress = useCallback(
    (postId: number) => {
      // TypeScript sa che 'PostDetail' richiede '{ postId: number }'
      navigation.navigate('PostDetail', { postId });
    },
    [navigation],
  );

  // 3. Gestiamo lo stato di caricamento
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e88e5" />
        <Text>Caricamento...</Text>
      </View>
    );
  }

  // 4. Gestiamo lo stato di errore
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Errore nel caricamento dei post.</Text>
      </View>
    );
  }

  // 5. Funzione per renderizzare l'item (passata a FlatList)
  const renderItem = ({ item }: { item: Post }) => (
    <PostItem item={item} onPress={handlePress} />
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
    />
  );
};

// Definiamo gli stili
const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default PostListScreen;
```

Crea `screens/PostDetailScreen.tsx`:

```typescript
/*
 * screens/PostDetailScreen.tsx
 *
 * Mostra i dettagli di un singolo post.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useGetPostByIdQuery } from '../store/api';
import { PostDetailScreenProps } from '../navigation/types';

const PostDetailScreen = ({ route }: PostDetailScreenProps) => {
  // 1. Otteniamo il 'postId' dai parametri della rotta (type-safe!)
  const { postId } = route.params;

  // 2. Chiamiamo l'hook con l'ID.
  //    RTK Query gestirà il caching.
  const { data: post, isLoading, error } = useGetPostByIdQuery(postId);

  // 3. Stato di caricamento
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  // 4. Stato di errore
  if (error || !post) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Impossibile caricare il post.</Text>
      </View>
    );
  }

  // 5. Dati caricati: renderizziamo i dettagli
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      <Text style={styles.meta}>Post ID: {post.id} | User ID: {post.userId}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1, // Usa flexGrow per ScrollView
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  meta: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default PostDetailScreen;
```

-----

### Passo 6: Unire il Tutto in `App.tsx`

Ora, modifichiamo il file `App.tsx` (che Expo ha creato) per "connettere" Redux e la Navigazione.

Sostituisci il contenuto di `App.tsx` con questo:

```typescript
/*
 * App.tsx
 *
 * Il punto di ingresso principale (root) della nostra applicazione.
 * Avvolgiamo l'app con i "Provider" necessari.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux'; // 1. Provider Redux
import { NavigationContainer } from '@react-navigation/native'; // 2. Provider Navigazione
import { store } from './store'; // Importiamo il nostro store
import { RootNavigator } from './navigation'; // Importiamo il nostro navigatore
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    // Forniamo lo store Redux all'intera app
    <Provider store={store}>
      {/* SafeAreaProvider è richiesto da native-stack */}
      <SafeAreaProvider>
        {/* NavigationContainer gestisce lo stato della navigazione */}
        <NavigationContainer>
          {/* Renderizziamo il nostro stack di schermate */}
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
```

-----

### Passo 7: Avvio dell'App

Congratulazioni. Hai costruito un'app React Native completa con un'architettura professionale, type-safe e performante.

Torna alla radice del progetto nella tua console ed esegui:

```bash
npx expo start
```

Scansiona il QR code con l'app Expo Go sul tuo telefono e vedrai la tua applicazione funzionare perfettamente.





















---

## Modulo Aggiuntivo: Il "Grande Scambio" - Dal DOM ai Primitivi Nativi

### Prefazione: Il Cervello Rimane, i Muscoli Cambiano

Come sviluppatore React (web), il tuo mondo è definito da questa equazione:
**`React (Stato) + react-dom (Renderer) = DOM (Browser)`**

`react-dom` è un "traduttore" esperto che sa come prendere l'albero virtuale di React e convertirlo in nodi `<div>`, `<span>`, `<img>` e manipolare il CSSOM.

React Native è semplicemente una libreria diversa che punta a un traduttore diverso:
**`React (Stato) + react-native (Renderer) = UI Nativa (iOS/Android)`**

Il "cervello" (React) è lo stesso. Ma il "traduttore" (`react-native`) parla una lingua completamente diversa. Non parla HTML/CSS; parla `UIView` (iOS) e `android.view.View` (Android).

Questo modulo analizza le implicazioni professionali di questo scambio.

---

### Sezione 1: Ciò che Rimane Identico (Il "Cervello" di React)

Questa è la parte facile e la più potente. Non devi reimparare nulla di tutto ciò:

1.  **Hooks (100% Identici):**
    * `useState` per lo stato locale.
    * `useEffect` per i cicli di vita e gli effetti collaterali (es. data fetching).
    * `useContext` per lo state management globale.
    * `useReducer` per logiche di stato complesse.
    * `useCallback` e `React.memo` per le ottimizzazioni delle performance.

2.  **Flusso di Dati (100% Identico):**
    * **Props:** Il flusso di dati rimane unidirezionale (dall'alto verso il basso).
    * **Stato:** Lo stato è ancora la "fonte della verità" che, quando aggiornata, scatena un re-render.
    * **Component Composition:** Costruirai la tua UI assemblando piccoli componenti riutilizzabili.

3.  **L'Ecosistema Logico (99% Identico):**
    * **State Management:** Puoi installare e usare **Redux (RTK)**, **Zustand**, **Jotai**, ecc. La logica è identica.
    * **Data Fetching:** Puoi usare **Axios**, `fetch`, o **RTK Query** (come abbiamo visto) esattamente allo stesso modo.
    * **TypeScript:** La logica di business, i tipi e le interfacce sono identici.

**In sintesi: Tutta la tua cartella `/store`, `/hooks`, o `/utils` potrebbe essere copiata di peso da un progetto React web.**

---

### Sezione 2: Ciò che Cambia (I "Muscoli" della UI)

Qui è dove avviene la "traduzione". Stai lasciando il mondo dei "documenti" (HTML) per entrare nel mondo delle "viste" (UI nativa). Questo ha tre implicazioni chiave.

#### 2.1: Sostituzione dei Primitivi (Il Vocabolario)

Non hai più un vocabolario flessibile di tag HTML. Hai un set **ristretto e rigoroso** di componenti nativi.

| React (Web) | React Native | Note Chiave (Differenze Concettuali) |
| :--- | :--- | :--- |
| `<div>`, `<section>`, `<nav>` | `<View>` | L'unico contenitore di layout. È il tuo "mattone" fondamentale. |
| `<p>`, `<span>`, `<h1>`, `<strong>` | `<Text>` | **REGOLA CRUCIALE:** Qualsiasi stringa di testo DEVE essere avvolta in un `<Text>`. `<View>Ciao</View>` è un ERRORE. |
| `<button>` | `<TouchableOpacity>`, `<Pressable>` | Non esiste un `<button>` flessibile. Devi *costruire* il tuo pulsante usando un "wrapper" che rileva il tocco (come `TouchableOpacity`) e al suo interno `<View>` e `<Text>` stilizzati. |
| `<input>`, `<textarea>` | `<TextInput>` | Molto simile, ma con API mobile-first (es. `onChangeText`, `keyboardType`). |
| `<img>` | `<Image>` | Simile, ma `src` diventa `source`. Per le immagini di rete, `width` e `height` esplicite sono **obbligatorie** (l'app non fa "reflow" come un browser). |
| `<a>` (link) | **(Nessuno)** | Non ci sono link. Per muoverti, usi una libreria di navigazione (come React Navigation) che gestisce uno "stack" di schermate. |
| `<ul>`, `<li>` | `<FlatList>` | Non fai `.map()` per liste lunghe. Usi `<FlatList>` che è **virtualizzata** per performance native. |



#### 2.2: La Rivoluzione dello Stile (Niente CSS)

Questo è il cambiamento più grande dopo i componenti.

1.  **Niente File `.css`:** Lo stile non è una lingua separata. È scritto in **oggetti JavaScript**.
2.  **Niente Ereditarietà (Cascading):** Questo è fondamentale. Sul web, un `font-size` sul `<body>` si applica a tutti i figli. In React Native, **gli stili NON vengono ereditati**.
    * Se metti `color: 'red'` su un `<View>`, il `<Text>` al suo interno **non** diventerà rosso. Devi applicare lo stile `color: 'red'` *direttamente* al componente `<Text>`.
3.  **`StyleSheet.create`:** Come abbiamo visto, per performance, gli stili vengono processati e inviati al lato nativo *una sola volta*. Questo oggetto `StyleSheet` è il tuo nuovo "foglio di stile".
4.  **Proprietà Limitate:** Hai solo proprietà di stile che hanno un senso nativo. Non esistono `float`, `display: grid` (recentemente `gap` è stato aggiunto), o pseudo-selettori come `:hover`.

#### 2.3: Il Nuovo Re del Layout (Solo Flexbox)

Sul web, hai `block`, `inline`, `flexbox`, `grid`, `float`, `positioning`...

In React Native, il layout è semplice e rigoroso:

1.  **Flexbox è l'unico modello di layout.**
2.  **`flexDirection` di default è `column`** (l'opposto del web, che è `row`). Questo ha senso per uno schermo verticale.
3.  Tutto è `display: flex` per impostazione predefinita.

Questo ti forza a pensare in termini di assi principali e trasversali, portando a UI più robuste e responsive.

---

### Conclusione: Un Nuovo Set di Strumenti, lo Stesso Architetto

"cambiano solo i componenti html?"

**Sì, ma "solo" è un eufemismo.**

Cambiando i componenti, stai implicitamente cambiando:
* Il **sistema di stile** (da CSS a oggetti JS senza ereditarietà).
* Il **modello di layout** (da "tutto" a "solo Flexbox").
* Il **modello di performance** (da un DOM single-thread a un'UI nativa multi-thread).

La buona notizia è che la parte difficile – la logica di business, la gestione dello stato, l'architettura dei dati – è qualcosa che **sai già fare perfettamente**. Devi solo imparare a usare un nuovo, più limitato ma più performante, set di "mattoncini" per la UI.