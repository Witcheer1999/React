

---

### Modulo 1: Fondamenta e Setup (L'Installazione)

#### 1. Cosa sono i Redux DevTools?

A un livello puramente tecnico, i Redux DevTools sono un'**estensione per il vostro browser** (Chrome, Firefox, Edge, ecc.) che si collega al vostro "store" Redux.

Ma questa definizione è terribilmente riduttiva.

Pensate ai Redux DevTools non come a un semplice "visualizzatore". Pensateli come una combinazione di due strumenti potentissimi:

1.  Una **Macchina del Tempo**.
2.  Un **Pannello di Controllo** completo per lo stato della vostra app.

L'analogia che preferisco, e che useremo spesso in ambito professionale, è quella della **"scatola nera"** (o *flight recorder*) di un aereo. 

Quando un aereo ha un problema, i tecnici non cercano di indovinare; recuperano la scatola nera. Quella scatola ha registrato ogni singola azione del pilota, ogni input dei sensori e ogni cambiamento nei sistemi, in perfetto ordine cronologico.

I Redux DevTools fanno **esattamente questo**:

* **Registrano ogni singola azione** che viene "dispatchata" nella vostra applicazione (es. `USER_LOGIN_REQUEST`, `ADD_TO_CART`).
* **Registrano lo stato completo** dell'applicazione *prima* e *dopo* ogni singola azione.
* **Registrano l'ordine esatto** in cui tutto è avvenuto.

Se un utente vi segnala un bug ("Ho aggiunto un prodotto, poi ho usato un coupon, e il carrello si è svuotato!"), voi non dovete più andare alla cieca aggiungendo `console.log()` ovunque.

Voi aprite la "scatola nera", trovate l'azione `APPLY_COUPON` e vedete *esattamente* cosa conteneva l'azione, quale parte del vostro reducer ha gestito (male) quell'azione e come lo stato è cambiato, portando al bug.

In sintesi: i DevTools trasformano il concetto astratto di "stato" Redux (che vive solo nella memoria JavaScript) in qualcosa di **visibile, tangibile e controllabile**.
























---

#### 2. Perché sono Indispensabili? (Il "Guadagno")

Usare Redux senza DevTools vi costringe a *indovinare* cosa succede. È il motivo per cui molti sviluppatori alle prime armi trovano Redux "difficile" o "verboso": non hanno visibilità.

##### * Visibilità immediata dello stato

**Il Problema:** Il vostro stato Redux è un oggetto JavaScript che vive in memoria. Come lo vedete? L'unico modo, senza DevTools, è spargere `console.log(store.getState())` in giro per i vostri componenti o, peggio, dentro i vostri `thunk` o `reducer`. È scomodo, lento e inquina la console.

**La Soluzione (Il Guadagno):** I DevTools vi danno un pannello dedicato che mostra **sempre** l'intero albero dello stato, aggiornato in tempo reale. 
Avete 5 "slice" nel vostro store? Le vedete. Volete sapere se `state.user.isAuthenticated` è `true` o `false` *proprio ora*? Non dovete aggiungere un log, dovete solo guardare. È come passare dal chiedere a un paziente come si sente, all'avere un monitor cardiaco (ECG) costantemente collegato che vi mostra ogni singolo battito.

##### * Tracciamento di ogni singola mutazione (azione)

**Il Problema:** Lo stato è cambiato, ma *perché*? È stato un click dell'utente? Una risposta da un'API? Un timer? Quale `payload` è arrivato esattamente?

**La Soluzione (Il Guadagno):** La colonna "Actions" dei DevTools è la vostra scatola nera. Ogni singola azione dispatchata viene registrata, in ordine cronologico. Non vedete solo lo stato *finale*, ma vedete la **sequenza di eventi** che ha *portato* a quello stato.

In un'applicazione reale, un singolo click può scatenare 3-4 azioni in rapida successione (es. `SHOW_LOADING_SPINNER`, `FETCH_DATA_PENDING`, `FETCH_DATA_FULFILLED`, `HIDE_LOADING_SPINNER`). Cercare di seguirle con i `console.log` è un incubo. Nei DevTools, le vedete impilate, pulite, ognuna con il suo `payload` e l'impatto che ha avuto.

##### * Debugging *predittivo* e *retroattivo*

Questo è il concetto più potente e divide i professionisti dai principianti.

1.  **Debugging Retroattivo (Time Travel):**
    **Il Problema:** "L'app funziona, ma dopo 10 click su 'Aggiungi al Carrello' e l'inserimento di un coupon, il totale è sbagliato. Ora devo rifare tutto da capo per capire *quando* si è rotto."
    **Il Guadagno:** Non dovete rifare nulla. La lista delle azioni è la vostra "macchina del tempo". Potete cliccare su *qualsiasi* azione passata nella lista e i DevTools **riporteranno l'intero stato dell'applicazione a quel preciso momento**. Non solo: anche la vostra interfaccia React (se ben collegata) tornerà a mostrare com'era in quel momento. Potete letteralmente "scorrere" avanti e indietro nel tempo per vedere il momento esatto in cui lo stato ha iniziato a "corrompersi".

2.  **Debugging Predittivo (Simulazione):**
    **Il Problema:** "Devo testare la mia pagina di errore 500. Devo chiedere al backend di spegnere il server?" oppure "Come si comporterà la UI se l'API mi restituisce un carrello con 200 prodotti?"
    **Il Guadagno:** Non avete bisogno della UI o del backend. Potete **dispatchare azioni manualmente** direttamente dai DevTools. Volete testare lo stato di errore? Scrivete e dispatchate un'azione `FETCH_DATA_REJECTED` con un payload di errore simulato. Volete testare uno stato limite? Dispatchate un'azione `SET_CART_ITEMS` con un array di 200 oggetti. State *predicendo* e *testando* il comportamento del vostro sistema prima ancora di scrivere il codice UI per arrivarci.

---

In sintesi, il guadagno è passare dall'**indovinare** al **sapere**. Smettete di sprecare tempo a riprodurre bug e iniziate a *osservarli* direttamente.































#### 3\. Installazione in 2 Passaggi

##### \* Passo 1: L'Estensione del Browser

Questo è il passaggio più semplice. I Redux DevTools sono un'estensione del browser, proprio come un ad-blocker o un password manager.

1.  **Aprite lo store delle estensioni** del vostro browser (es. "Chrome Web Store" o "Firefox Add-ons").
2.  **Cercate "Redux DevTools"**. Riconoscerete l'icona: è un logo a forma di fiamma stilizzata, spesso colorata.
3.  **Cliccate "Aggiungi"** o "Installa".

Fatto. Ora avete il "visore".

**Come trovarlo e aprirlo:**
Dopo l'installazione, avrete una nuova icona nella barra degli strumenti del browser. Ma il vero strumento si trova altrove:

1.  Andate su una pagina qualsiasi (per ora).
2.  Aprite i normali Strumenti per Sviluppatori (premendo **F12** o `Cmd+Opt+I` su Mac).
3.  Accanto ai tab che usate sempre ("Elements", "Console", "Network", "Sources"), noterete **due nuovi tab: "Redux" e "Profiler"**.

Se cliccate sul tab "Redux", su un sito che non usa Redux (come https://www.google.com/search?q=Google.com), vedrete un messaggio del tipo "Nessuno store trovato". Questo è normale: abbiamo installato il visore, ma il sito non ha i "cavi" collegati.

##### \* Passo 2: La Configurazione nello Store (Il "Ponte")

Ora dobbiamo dire alla nostra applicazione React di "parlare" con l'estensione che abbiamo appena installato. Dobbiamo costruire il "ponte".

  * **Metodo Moderno (Redux Toolkit - RTK): La via facile.**

Se state imparando Redux oggi, o lavorate su un progetto moderno, state (o dovreste stare) usando **Redux Toolkit (RTK)**.

La notizia meravigliosa è questa: **gli sviluppatori di RTK hanno reso questo passaggio automatico.**

Quando voi create il vostro store usando la funzione `configureStore()` di RTK, questa funzione fa già tutto il lavoro pesante per voi.

Guardate questo codice di uno store RTK standard:

```javascript
// Nel vostro file store.js (o come lo chiamate)

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import cartReducer from './features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
  },
  // NESSUN'ALTRA CONFIGURAZIONE RICHIESTA PER I DEVTOOLS!
});
```

**Cosa succede "sotto il cofano"?**

La funzione `configureStore` controlla automaticamente due cose:

1.  "Sono in un ambiente di **sviluppo** (`development`)?" (Controlla `process.env.NODE_ENV !== 'production'`).
2.  "L'estensione **Redux DevTools** è installata nel browser?"

Se la risposta a entrambe le domande è **SÌ**, `configureStore` abilita automaticamente la connessione. Non dovete scrivere una sola riga di codice in più.

Se siete in produzione (`production`), i DevTools vengono automaticamente disabilitati per motivi di performance e sicurezza.

**Ricapitolando: se usate Redux Toolkit, il "Passo 2" consiste letteralmente nel... non fare nulla.** Basta installare l'estensione del browser (Passo 1) e `configureStore` si occupa del resto.

Ora, se aprite la vostra app React (che usa questo store) e aprite i DevTools (F12) e cliccate sul tab "Redux"... vedrete l'interfaccia completa. La scatola nera è collegata e sta già registrando.























Perfetto. Ora che abbiamo installato tutto, apriamo i DevTools (F12 -> tab "Redux").

All'inizio questa interfaccia può sembrare affollata, ma in realtà è divisa in tre sezioni logiche che userete costantemente.

---

### Modulo 2: Anatomia dell'Interfaccia (Cosa Sto Guardando?)

#### 1. Panoramica Iniziale: Le Tre Aree Principali

Immaginate di essere in una sala di controllo. Non guardate tutti i pulsanti subito, concentratevi sulle aree principali. 

1.  **La Lista delle Azioni (A sinistra):** Questa è la vostra "scatola nera", l'elenco cronologico di tutto ciò che è accaduto. Ogni volta che la vostra app esegue un `dispatch()`, una nuova riga appare qui, dall'alto (più vecchio) verso il basso (più recente). È la vostra storia.
2.  **L'Inspector (A destra):** Questo è il vostro "microscopio". Dopo aver selezionato un evento dalla lista a sinistra, l'Inspector a destra vi mostra *tutto* su quell'evento: cosa è successo, cosa è cambiato e l'intero stato del mondo in quel preciso momento.
3.  **La Barra degli Strumenti (In alto):** Questi sono i vostri "controlli attivi". Qui trovate i pulsanti per il time-travel (play, pausa, avanti, indietro), per simulare azioni e per importare/esportare sessioni.

La maggior parte del vostro tempo (90%) la passerete saltando tra la **Lista (1)** per trovare *quando* è successo un bug, e l'**Inspector (2)** per capire *perché* è successo.


















Concentriamoci sulla colonna di sinistra, il cuore del nostro *time travel*.

---

#### 2. La Lista delle Azioni (L'Archivio Storico)

Questa lista è la registrazione cronologica, minuto per minuto (o meglio, millisecondo per millisecondo), di ogni singolo evento che ha modificato lo stato della vostra applicazione.

##### * Il significato di `@@INIT` (l'azione di avvio di Redux)

Quando aprite i DevTools per la prima volta nella vostra app, vedrete che la lista non è vuota. C'è quasi sempre almeno un'azione, che di solito si chiama `@@INIT` o qualcosa di simile (es. `@@redux/INIT`).

**Cos'è questa azione?** È la vostra "Azione Zero".

Non l'avete dispatchata voi. È un'azione interna che Redux (o Redux Toolkit) dispatcha automaticamente **nel momento esatto in cui lo store viene creato**.

Il suo scopo è semplice: far passare ogni reducer attraverso il suo `switch` (o builder) per la prima volta. Dato che nessun `case` corrisponderà a `@@INIT`, ogni reducer restituirà il suo `initialState`.

**In pratica: `@@INIT` è l'azione che popola il vostro store con lo stato iniziale.**

Selezionandola, l'Inspector (a destra) vi mostrerà l'intero stato dell'applicazione così com'era al caricamento della pagina. È la vostra *baseline*.

##### * Come leggere la lista: un flusso cronologico di eventi

La lista si legge **dall'alto verso il basso**.
L'azione più in alto è la più vecchia (`@@INIT`), l'azione più in basso è l'ultima che è stata dispatchata.

Se un utente clicca su un pulsante "Login", vedrete apparire in fondo alla lista una nuova azione, magari `auth/login/pending`. Se la chiamata API fallisce, subito dopo apparirà `auth/login/rejected`.

La vostra capacità di debugging dipenderà dalla vostra capacità di "leggere" questa sequenza di eventi come se fosse una storia e identificare il punto in cui la trama "devia" da come dovrebbe essere.

##### * Icone e colori (es. azioni in errore)

Noterete che le azioni non sono tutte grigie. I DevTools usano colori e icone per darvi indizi visivi immediati:

* **Grigio/Bianco:** L'azione standard. È stata dispatchata ed eseguita senza problemi.
* **Rosso vivo (spesso con un'icona ❌):** Questo è un allarme! Significa che l'azione è stata dispatchata, ma **si è verificato un errore *dentro* il reducer** mentre la elaborava.
    * Questo è incredibilmente utile. Il bug non è nell'azione, ma nella logica del reducer che doveva gestirla.
* **Colori sbiaditi / barrati:** Questa è un'azione che avete "skippato" (saltato) voi manualmente usando il *time travel debugging* (lo vedremo nel Modulo 3).
* **Icone diverse:** Alcune librerie (come RTK Query) aggiungono piccole icone personalizzate per distinguere le loro azioni (es. un fulmine ⚡ per le chiamate API), rendendo la lista ancora più facile da scansionare visivamente.

























Eccellente. Ora che abbiamo selezionato un'azione dalla lista a sinistra, spostiamo la nostra attenzione sul pannello a destra: l'**Inspector**.

Questo è il vostro microscopio. È dove passate dal "cosa è successo" (l'azione) al "*perché* è successo e con quale *impatto*".

-----

#### 3\. L'Inspector: Il Cuore del Debugging

L'Inspector è diviso in diversi tab. In un contesto lavorativo, userete principalmente i primi tre: "Action", "Diff", e "State".

-----

##### \* Tab "Action"

Questo tab vi mostra l'oggetto "azione" così com'è. È l'esatto oggetto JavaScript che è stato passato alla vostra funzione `dispatch()`.

Un'azione Redux ha due componenti fondamentali:

1.  **`type` (Tipo):** Questa è l'etichetta, la stringa che dice ai reducer cosa fare. È il "comando". Esempio: `cart/addItem`.
2.  **`payload` (Carico utile):** Questi sono i "dati" necessari per eseguire il comando. Se il `type` è `cart/addItem`, il `payload` sarà l'oggetto del prodotto da aggiungere. Se il `type` è `auth/loginSuccess`, il `payload` sarà l'oggetto utente e il token.

**Pro Tip: L'importanza di un `payload` ben strutturato**

Un errore comune dei principianti è creare payload "pigri".

  * **Male:** `dispatch(addItem(123))` -\> `payload: 123`
  * **Bene:** `dispatch(addItem({ productId: 123, quantity: 1, source: 'HomePage' }))` -\> `payload: { productId: 123, ... }`

Quando guardate il tab "Action" tra sei mesi per sistemare un bug, il primo `payload` (123) non vi dice nulla. Cos'è 123? Un ID utente? Un ID prodotto? Il secondo `payload` è auto-esplicativo. Vi dice *esattamente* cosa stava succedendo, rendendo il debug 10 volte più veloce.

-----

##### \* Tab "Diff"

Questo, a mio parere, è **il tab più importante per il debugging dei reducer**.

Il tab "Action" vi dice l'intento. Il tab "Diff" vi mostra l'**impatto**.

  * **Concetto Chiave:** Il "Diff" non vi mostra l'intero stato. Vi mostra solo ed esclusivamente le *differenze* nello stato *prima* e *dopo* che il reducer ha processato l'azione selezionata.

È il vostro "prima e dopo" istantaneo.

Se il vostro reducer doveva *solo* cambiare `state.cart.items` ma vedete che ha anche *cancellato* `state.user`, avete trovato il vostro bug in 3 secondi. È probabile che abbiate dimenticato uno `spread operator` (`...state`) e abbiate restituito un oggetto completamente nuovo.

**I Colori del "Diff":**

  * **Verde 🟢:** Dati aggiunti. Una nuova proprietà in un oggetto, un nuovo elemento in un array.
  * **Rosso 🔴:** Dati rimossi. Una proprietà che esisteva e ora non c'è più.
  * **Arancione/Modificato 🟠:** Dati cambiati. Il valore di una proprietà esistente è stato aggiornato (es. `quantity: 1` è diventato `quantity: 2`).

In un contesto professionale, userete questo tab per verificare che i vostri reducer siano *chirurgici*: devono cambiare *solo* ciò che devono cambiare e nient'altro.

-----

##### \* Tab "State"

Questo tab è semplice ma essenziale: vi mostra l'**intero albero dello stato** dell'applicazione *dopo* che l'azione selezionata è stata completata.

È la "fotografia" completa del mondo in quel preciso istante.

Avete due modalità di visualizzazione principali:

1.  **Tree (Albero):** La vista di default. È un albero JSON interattivo che potete espandere e collassare. È perfetta per navigare rapidamente in slice nidificate (es. `state.entities.products.byId...`).
2.  **Raw (Grezzo):** Mostra l'intero stato come un singolo blocco di testo JSON. È meno navigabile, ma utilissima se volete **copiare l'intero stato** per incollarlo in un file, condividerlo, o usarlo per un test.

Userete "State" quando il "Diff" è troppo confusionario (magari l'azione ha cambiato 50 cose diverse) e volete solo vedere il risultato finale in un punto specifico.

-----

##### \* Tab "Trace" (Funzionalità Pro)

Questo tab è il vostro "detective" privato. Risponde a una domanda cruciale che gli altri tab non possono:

**"OK, l'azione `cart/addItem` è partita... ma *quale componente* l'ha dispatchata?"**

È stato il pulsante sulla card del prodotto? O il pulsante nella pagina di dettaglio? O una funzione automatica?

Il tab "Trace" vi mostra lo **stack trace** di JavaScript nel momento esatto in cui `dispatch()` è stato chiamato. Potrete vedere la catena di chiamate:

```
dispatch @ redux-toolkit.js:456
handleAddToCart @ ProductCard.jsx:82  <-- ECCOLO!
onClick @ ReactButton.js:12
...
```

**Come abilitarlo:**
Questa funzione è spesso disabilitata di default perché tracciare lo stack per *ogni singola azione* può avere un piccolo impatto sulle performance in sviluppo.

Con **Redux Toolkit**, la abilitate così nel vostro `store.js`:

```javascript
import { configureStore } from '@reduxjs/toolkit';
// ... import dei reducer

export const store = configureStore({
  reducer: {
    // ... i vostri reducer
  },
  // Abilitiamo esplicitamente il trace
  devTools: {
    trace: true, 
  }
});
```

In un progetto professionale, questo è quasi sempre abilitato in sviluppo. Il tempo risparmiato nel trovare *da dove* parte un'azione vale ampiamente il minimo costo prestazionale.






























Eccoci arrivati al modulo che, francamente, sembra magico.

Questa è la funzionalità che, da sola, giustifica l'adozione di Redux in progetti complessi. È la vera "killer feature". Ma prima di vedere *come* si fa, dobbiamo capire *perché* è possibile.

---

### Modulo 3: Il "Time Travel Debugging" (La Magia)

#### 1. Il Concetto Fondamentale: Stato = Funzione Pura

Il "Time Travel Debugging" non è stregoneria. È l'applicazione diretta e logica del principio fondamentale su cui si basa Redux.

Rinfreschiamoci la memoria sulla "regola d'oro" di Redux, la firma di un qualsiasi reducer:

$$
(state, action) \Rightarrow newState
$$

Questa non è solo una convenzione, è un **contratto**. Questo contratto stabilisce che i vostri reducer *devono* essere **funzioni pure**.

Cosa significa "pura" in questo contesto?

1.  **Stesso input, stesso output:** Dati uno stato e un'azione specifici, il reducer deve *sempre* restituire lo stesso identico nuovo stato. Non ci sono `Math.random()`, chiamate API, o `new Date()` *dentro* il reducer.
2.  **Immutabilità:** Il reducer non deve *mai* modificare lo stato originale (`state`). Deve sempre restituire un oggetto *completamente nuovo*.

**Ecco il punto chiave:** se i vostri reducer rispettano questo contratto, l'intero stato della vostra applicazione diventa prevedibile. L'intero ciclo di vita della vostra app è solo una catena di calcoli puri.

**I DevTools "registrano" semplicemente questi passaggi.**

I DevTools non sono così complessi come si pensa. Non salvano 100 copie diverse del vostro intero stato (sarebbe terribilmente inefficiente per la memoria).

Salvano solo due cose:
1.  Lo **stato iniziale** (quello dopo l'azione `@@INIT`).
2.  La **lista cronologica di tutte le azioni** che sono arrivate (`action_1`, `action_2`, `action_3`, ...).

Quando voi "viaggiate nel tempo" e chiedete di vedere lo stato dopo l'Azione 2, i DevTools non "annullano" magicamente l'Azione 3.

Semplicemente **ricalcolano** l'intero stato da zero, applicando solo le azioni che volete vedere:
`Stato Iniziale -> (con Action 1) -> Stato 1 -> (con Action 2) -> Stato 2_FINALE`

Siccome i reducer sono funzioni pure, questo ricalcolo è istantaneo e garantisce di ottenere *esattamente* lo stato in cui vi trovavate in quel momento.

Abbiamo trasformato il debugging da un'ipotesi a un calcolo matematico. E ora, vediamo come usare i pulsanti per eseguire questo calcolo.

























Bene, ora impugniamo la leva della nostra macchina del tempo. La prima cosa che faremo è imparare a "saltare" (Jumping).

---

#### 2. "Jumping" (Saltare nel Tempo)

Questa è l'azione più semplice e più comune che farete.

##### * Cliccare su un'azione passata nella lista

Prendete la vostra Lista delle Azioni (la colonna a sinistra). Supponiamo che abbiate eseguito 10 azioni (es. `ADD_ITEM`, `ADD_ITEM`, `SET_QUANTITY`, `APPLY_COUPON`, ecc.).

Ora, semplicemente **cliccate su un'azione qualsiasi nel mezzo della lista**, ad esempio la terza azione, `SET_QUANTITY`.



Cosa succede?
1.  L'azione selezionata si illumina.
2.  L'Inspector (a destra) si aggiorna immediatamente per mostrare lo stato *esattamente come era dopo* che quell'azione `SET_QUANTITY` era stata completata.
3.  Tutte le azioni *sotto* quella selezionata (come `APPLY_COUPON`) vengono "messe in pausa" e spesso appaiono sbiadite o barrate. I DevTools le stanno ignorando.

##### * Osservare l'UI di React che *magicamente* torna a quello stato

Questa è la parte che sconcerta la prima volta che la si vede. Non appena cliccate su quell'azione passata nei DevTools, **guardate la vostra applicazione nel browser.**

La vostra interfaccia utente (i componenti React) **tornerà indietro nel tempo**.

Se avete cliccato sull'azione *prima* che il coupon fosse applicato, il prezzo totale mostrato nella vostra UI tornerà al valore che aveva *prima* dello sconto.

**Perché succede?** Non è magia.
I vostri componenti React (tramite `useSelector` o `connect`) sono "abbonati" allo store Redux. Quando voi "saltate" nel tempo, i DevTools ricalcolano lo stato e poi **forzano uno stato nuovo nello store**. React rileva questo cambiamento di stato (non sa *perché* è cambiato, sa solo *che* è cambiato) e, come fa sempre, si ri-renderizza per riflettere fedelmente il nuovo stato.

##### * Caso d'uso: "L'utente dice che dopo 5 passaggi il form si rompe. Vediamo."

Questo è lo scenario professionale per eccellenza.

**Il Problema:** Un utente vi dice: "Il bug è complesso. Devi (1) aggiungere un prodotto, (2) andare alla cassa, (3) compilare l'indirizzo, (4) tornare indietro al carrello, (5) provare a cambiare la quantità. *Solo allora* il totale impazzisce."

**Il Debug (Senza DevTools):** Una tortura. Dovete eseguire tutti e 5 i passaggi. Vedete il bug. Modificate una riga di codice nel reducer. L'app si ricarica (Hot Reload). E ora? Dovete **rieseguire tutti e 5 i passaggi da capo** per vedere se la vostra modifica ha funzionato. E poi di nuovo. E di nuovo.

**Il Debug (Con il "Jumping"):**
1.  Eseguite i 5 passaggi *una sola volta*.
2.  Vedete il bug. Nella vostra Lista delle Azioni avete, ad esempio, 10 azioni.
3.  Osservate lo stato nell'ultima azione (`CHANGE_QUANTITY`) e confermate che è rotto.
4.  Ora, **cliccate sull'azione *precedente*** (`Maps_TO_CART`).
5.  Guardate lo stato. È corretto.
6.  **Ricliccate sull'ultima azione** (`CHANGE_QUANTITY`).
7.  Guardate lo stato. È rotto.

Avete appena **isolato il bug in 5 secondi**. Sapete che il problema è *dentro* il reducer che gestisce `CHANGE_QUANTITY`. Ora modificate il codice di quel reducer. L'app si ricarica, ma i DevTools *conservano* la cronologia delle azioni! Voi non dovete rifare i 5 passaggi. Cliccate di nuovo sull'ultima azione e vedete se il bug è sparito.

Avete trasformato un ciclo di debug di 2 minuti in un ciclo di debug di 2 secondi.
























Questa è un'altra tecnica fondamentale del time travel, leggermente diversa dal "Jumping" ma altrettanto potente per l'isolamento dei bug.

---

#### 3. "Skipping" (Saltare un'Azione)

Se "Jumping" significa "mostrami il mondo *fino a questo punto*", "Skipping" significa "mostrami il mondo *come sarebbe stato se questo evento non fosse mai accaduto*".

##### * Disattivare un'azione dalla lista (il pulsante "skip")

Accanto a ogni azione nella vostra lista (a sinistra), c'è un piccolo pulsante, spesso un segno di spunta (✓) o un'icona "skip".



Se fate clic su questo pulsante, l'azione non viene *eliminata*, ma viene **disattivata**. Spesso diventerà sbiadita o barrata.

##### * I DevTools ricalcolano l'intero stato *come se quell'azione non fosse mai avvenuta*

Questo è il punto cruciale. Nel momento in cui "skippate" un'azione, i DevTools non si limitano a tornare indietro. Fanno qualcosa di molto più intelligente:

1.  Tornano allo stato *precedente* all'azione che avete saltato.
2.  **Rieseguono** tutte le azioni *successive*, **ignorando completamente** quella che avete disattivato.

L'intero stato futuro viene ricalcolato da quel punto in poi, *omettendo* l'impatto di quell'unica azione.

##### * Caso d'uso: "Questo bug è causato dall'azione A o dall'azione B? Proviamo a saltare A."

Questo è lo scenario di debug perfetto per lo "skipping".

**Il Problema:** L'utente esegue un flusso complesso. A un certo punto, due azioni vengono dispatchate in rapida successione:
1.  `cart/calculateTotals` (Azione A)
2.  `user/applyMembershipDiscount` (Azione B)

Dopo queste due azioni, il prezzo finale nel carrello è sbagliato. Il bug è nel calcolo dei totali (A) o nell'applicazione dello sconto (B)?

**Il Debug (Senza DevTools):** Commentereste il codice che dispatcha l'Azione B, ricarichereste la pagina, rifareste l'intero flusso e vedreste se il bug c'è ancora. Un processo lungo e noioso.

**Il Debug (Con lo "Skipping"):**
1.  Eseguite il flusso *una sola volta*. Il bug è presente.
2.  Andate nella Lista delle Azioni.
3.  Trovate l'azione `user/applyMembershipDiscount` (Azione B).
4.  Cliccate sul pulsante **"Skip"** accanto ad essa.
5.  Guardate l'Inspector (o la vostra UI).

**Ora avete due possibili risultati, entrambi immediati:**

* **Risultato 1:** Il prezzo finale è **ancora sbagliato**. Questo vi dice che il bug *non era* nell'Azione B. Il problema è quasi certamente nell'Azione A (`cart/calculateTotals`).
* **Risultato 2:** Il prezzo finale è **ora corretto**. Avete appena trovato il colpevole. L'Azione B (`user/applyMembershipDiscount`) sta introducendo il bug.

Avete isolato la causa di un bug in un flusso complesso con un singolo clic, senza ricaricare la pagina o modificare una riga di codice. Questo è il "debugging chirurgico" che i Redux DevTools rendono possibile.




























Questa è una modalità di visualizzazione diversa, meno usata per il debugging chirurgico, ma fantastica per "rivivere" la sessione di un utente.

---

#### 4. La "Slider" View

Nella barra degli strumenti in basso (o a volte in alto, a seconda del layout), vedrete un pulsante che di solito assomiglia a un cursore (slider) o dice "Slider".

Cliccandolo, l'interfaccia cambia: la Lista delle Azioni e l'Inspector vengono sostituiti da un **grande cursore orizzontale**.

##### * Una modalità alternativa per "scrollare" nel tempo

Questo cursore rappresenta l'intera cronologia delle vostre azioni, da `@@INIT` (tutto a sinistra) all'azione più recente (tutto a destra).

**Come funziona:**
Potete afferrare il cursore e trascinarlo lentamente avanti e indietro.

Mentre lo trascinate, state facendo "Jumping" (come abbiamo visto prima), ma in modo fluido e continuo. Trascinando il cursore sull'azione 5, poi 6, poi 7, state **"scrubbando"** (dall'inglese *to scrub*, come nel montaggio video) attraverso la vostra cronologia.

##### * Vedere le transizioni di stato

Il vero valore di questa vista emerge quando la usate tenendo d'occhio la vostra applicazione.

**Caso d'uso:** Immaginate di avere un'animazione complessa o un form con molti passaggi rapidi. Invece di cliccare su ogni singola azione nella lista, potete trascinare lentamente lo slider e **guardare la vostra UI aggiornarsi in tempo reale**, quasi come se steste mandando avanti e indietro un video.

È particolarmente utile per:
* Capire flussi di azioni molto rapidi e quasi simultanei (es. azioni `pending`/`fulfilled`/`rejected` di una chiamata API).
* Mostrare a un collega (o a un product manager!) come l'interfaccia *reagisce* a una sequenza di eventi.
* Identificare visivamente il momento esatto in cui un elemento della UI "salta" o scompare inaspettatamente.

In breve: **"Jumping"** (cliccare sulla lista) è per il debugging analitico. **"Slider"** è per il debugging visivo e la revisione delle transizioni.
























Finora siamo stati degli *osservatori*: abbiamo guardato il passato e analizzato gli eventi. Ora diventiamo *agenti*: impareremo a **manipolare** lo stato a nostro piacimento.

-----

### Modulo 4: Interagire e Simulare (Diventare "Attivi")

#### 1\. Il "Dispatcher" Manuale

Nella barra degli strumenti (o in un tab dedicato in basso) troverete un pulsante etichettato **"Dispatcher"**. Cliccandolo, vi si aprirà un'area di testo dove potete *scrivere* un'azione Redux.

##### \* Scrivere e "dispatchare" azioni manualmente dal DevTool

Normalmente, le azioni vengono dispatchate dal codice (es. `onClick={() => dispatch(addItem())}`). Il Dispatcher Manuale vi permette di bypassare completamente la vostra UI e il vostro codice.

Potete scrivere un oggetto azione completo, come:

```json
{
  "type": "cart/addItem",
  "payload": { "id": "prod_123", "name": "Prodotto Simluato", "price": 99 }
}
```

E poi cliccare sul pulsante **"Dispatch"**.

Appena lo farete, succederanno due cose:

1.  Quell'azione apparirà in fondo alla vostra Lista Azioni, come qualsiasi altra azione.
2.  Il vostro store la riceverà, i reducer la elaboreranno, lo stato si aggiornerà e la vostra UI reagirà di conseguenza.

Avete appena "iniettato" un evento nella vostra applicazione.

##### \* Caso d'uso Pro: Testare stati limite

Questo è, in assoluto, uno degli utilizzi più professionali dei DevTools.

**Il Problema:** Come testate la vostra bella pagina di errore? O come appare il carrello quando ci sono 1000 prodotti? O cosa succede se l'API vi restituisce un oggetto utente *senza* il nome?

**Il Debug (Senza DevTools):** È un incubo. Dovreste simulare una disconnessione di rete, chiedere al backend di forzare un errore 500, o cliccare "Aggiungi al Carrello" 1000 volte. È impraticabile.

**Il Debug (Con il Dispatcher Manuale):**

1.  **Testare un Errore API:** Avete un thunk (es. `fetchUser`) che gestisce `pending`, `fulfilled` e `rejected`. Non c'è bisogno di spegnere la rete. Aprite il dispatcher e scrivete voi stessi l'azione di fallimento:

    ```json
    {
      "type": "user/fetchUser/rejected",
      "payload": { "error": "Simulated 500 Internal Server Error" }
    }
    ```

    Cliccate "Dispatch". Immediatamente, la vostra UI *dovrebbe* mostrare il componente `<ErrorPage>` o il messaggio di errore. Se non lo fa, avete trovato un bug nella vostra logica di gestione degli errori.

2.  **Testare lo Stato di Logout:** Volete assicurarvi che, al logout, il carrello si svuoti e l'utente venga reindirizzato?

    ```json
    { "type": "auth/logout" }
    ```

    Cliccate "Dispatch". L'intera app dovrebbe resettarsi allo stato "ospite".

3.  **Testare Stati Limite (Edge Case):** Come si comporta la UI del carrello con un nome prodotto lunghissimo?

    ```json
    {
      "type": "cart/addItem",
      "payload": { "id": "prod_long", "name": "QuestoÈUnNomeProdottoAssurdamenteLungoPerTestareIlTruncateDelTestoELaUI" }
    }
    ```

    Cliccate "Dispatch".

State **disaccoppiando** il test della logica di stato (reducer e UI) dalla logica di business (eventi del browser, chiamate API).

##### \* Simulare un'azione di un collega per riprodurre un bug

**Scenario:** Siete in un team. Un collega che lavora al micro-frontend del "Profilo" vi dice: "Quando aggiorno le preferenze, dispatcho questa azione: `user/preferencesUpdated`. Questa azione dovrebbe far cambiare il tema della tua app, ma non lo fa."

**Il Debug (Senza DevTools):** Dovreste prendere il suo branch, fare `git pull`, risolvere i conflitti, avviare la sua parte di app, e riprodurre il suo flusso.

**Il Debug (Con il Dispatcher Manuale):**
Voi gli chiedete: "Mandami l'azione esatta (type e payload) che dispatchi".
Lui vi manda questo:

```json
{
  "type": "user/preferencesUpdated",
  "payload": { "theme": "dark" }
}
```

Voi lo copiate, lo incollate nel *vostro* Dispatcher, premete "Dispatch" e vedete immediatamente se la vostra UI reagisce. Se non lo fa, il problema è nel *vostro* reducer (che forse non "ascolta" quell'azione) e potete risolverlo in 30 secondi.


























---

#### 2. Auto-dispatch (Pulsante "Play" )

Nella barra degli strumenti principale (quella in alto o in basso) troverete un set di controlli multimediali, tra cui un pulsante **"Play" (▶)**.

##### * Rieseguire la sequenza di azioni registrate

Questo pulsante fa esattamente quello che immaginate: **riesegue (re-dispatcha) l'intera sequenza di azioni** che avete registrato nella vostra sessione, dall'inizio (`@@INIT`) fino all'ultima.

Quando lo premete, vedrete la vostra lista di azioni "eseguirsi" rapidamente una dopo l'altra, e la vostra UI si aggiornerà di conseguenza in una rapida successione, riproducendo l'intero flusso di lavoro.

Questo potrebbe sembrare simile allo "Slider", ma ha uno scopo molto diverso e molto più tecnico.

##### * Caso d'uso: Verificare la riproducibilità di un flusso dopo una modifica al codice (Hot Reload)

Questo è **il** caso d'uso professionale per il pulsante "Play".

**Lo Scenario:**
1.  Avete un flusso di 10 azioni (es. `ADD_ITEM`, `ADD_ITEM`, `APPLY_COUPON`, `SET_SHIPPING`, `CALCULATE_TOTALS`...).
2.  Scoprite un bug nell'ultima azione, `CALCULATE_TOTALS`. Il totale è sbagliato.
3.  Usando il "Jumping" (Modulo 3), avete confermato che il bug è nel reducer di quell'azione.
4.  Andate nel vostro editor di codice e **modificate la logica del reducer** per correggere il calcolo.
5.  Il vostro ambiente di sviluppo (come Vite o Create React App) usa il **Hot Module Replacement (HMR)**. Questo significa che il codice del vostro reducer viene aggiornato *al volo*, **senza ricaricare la pagina**.
6.  La vostra app è aggiornata, ma i DevTools mostrano ancora lo stato *vecchio* e *rotto* di prima.

**La Domanda:** Come verificate che la vostra correzione funzioni, *senza* dover rieseguire manualmente tutti e 10 i passaggi del flusso?

**La Soluzione (con "Play"):**
1.  Nei DevTools, cliccate sul pulsante **"Commit"** (l'icona del bersaglio ) per "consolidare" lo stato attuale e pulire la lista (o semplicemente tornate all'azione `@@INIT`).
2.  Ora premete il pulsante **"Play" (▶)**.

I DevTools prenderanno la *stessa identica* sequenza di 10 azioni che avevate registrato prima e le **dispatcheranno di nuovo**, una per una, ma questa volta contro il vostro **nuovo codice corretto** del reducer.

Alla fine della riesecuzione, potete ispezionare lo stato dell'ultima azione (`CALCULATE_TOTALS`) e verificare che il totale sia, questa volta, corretto.

Avete appena rieseguito un test di regressione complesso con un solo clic.




























---

#### 3. Importare ed Esportare Sessioni

##### * Concetto Chiave (Livello Aziendale): Il "Bug Report Perfetto"

Qual è il problema numero uno nel debugging in un team? È quando un tester (o un collega) vi dice "c'è un bug" e voi rispondete: "**Non riesco a riprodurlo**" (o il classico: "Funziona sulla mia macchina").

Questo fa perdere ore, a volte giorni. L'utente ha eseguito 20 passaggi complessi che lo hanno portato a uno stato "rotto", e voi non riuscite a ricreare quegli esatti 20 passaggi.

L'import/export delle sessioni **risolve questo problema per sempre**.

Non chiederete più "Quali passaggi hai fatto?". Chiederete: "**Mandami l'export dei DevTools**".

##### * Esportare l'intera sessione di stato/azioni in un file JSON

Nella barra degli strumenti dei DevTools c'è un pulsante **"Export"** (spesso un'icona con una freccia verso l'alto ).

Quando lo cliccate, i DevTools prendono l'**intera sessione corrente** — lo stato iniziale e *ogni singola azione* che è stata dispatchata fino a quel momento — e la impacchettano in un singolo file **JSON**.

L'utente che ha trovato il bug non deve fare altro che:
1.  Vedere il bug.
2.  Aprire i DevTools.
3.  Cliccare "Export".
4.  Salvare il file (es. `bug_carrello.json`).
5.  Inviare questo file JSON a voi (via Slack, email, o allegato al ticket di bug).

##### * Inviare il file a un collega, che può *importarlo*

Ora tocca a voi, lo sviluppatore.
1.  Aprite l'applicazione sul vostro computer (anche se è in uno stato completamente diverso o iniziale).
2.  Aprite i Redux DevTools.
3.  Cliccate il pulsante **"Import"** (freccia verso il basso ).
4.  Selezionate il file `bug_carrello.json` che vi ha inviato il vostro collega.

**Cosa succede?**
La vostra Lista delle Azioni viene *istantaneamente* cancellata e **rimpiazzata con l'esatta cronologia** del vostro collega. L'intero stato della vostra applicazione "salta" magicamente allo stato finale e "rotto" del vostro collega.

Non dovete riprodurre nulla. Avete il bug.

A questo punto, avete l'intera "scatola nera" del volo che si è schiantato. Potete usare il **Jumping** (Modulo 3) per tornare indietro azione per azione, il **Diff** (Modulo 2) per vedere esattamente dove lo stato si è corrotto e lo **Skipping** (Modulo 3) per isolare quale azione ha causato il problema.

Avete appena trasformato un potenziale incubo di debugging di mezza giornata in un'analisi di 5 minuti.


























# PLUGIN

Ecco una lista di plugin e strumenti essenziali per migliorare radicalmente la tua esperienza di sviluppo (Developer Experience) quando lavori con React e Vite.

Li ho divisi per categoria, da quelli fondamentali a quelli per ottimizzazioni avanzate.

-----

### Fondamentali (Quasi Obbligatori)

Questi strumenti costituiscono la base per un'esperienza di sviluppo moderna con Vite e React.

  * **`@vitejs/plugin-react-swc`**

      * **Cos'è:** È il plugin ufficiale che fa "parlare" Vite e React. Usa [SWC (Speedy Web Compiler)](https://swc.rs/), un compilatore super-veloce basato su Rust.
      * **Perché usarlo:** È il motore del **Fast Refresh** (HMR - Hot Module Replacement). Ti permette di modificare i tuoi componenti React e vedere le modifiche nel browser *istantaneamente*, senza ricaricare la pagina e **mantenendo lo stato** (es. il testo in un form o uno stato `useState`). È significativamente più veloce della vecchia alternativa (`@vitejs/plugin-react`) che si basava su Babel.

  * **React Developer Tools (Estensione Browser)**

      * **Cos'è:** L'estensione ufficiale di React per Chrome, Firefox, ed Edge.
      * **Perché usarla:** È l'equivalente dei Redux DevTools, ma per i componenti. Ti permette di:
          * Ispezionare la gerarchia dei tuoi componenti (il "React DOM").
          * Vedere e **modificare in tempo reale** `props` e `state` di qualsiasi componente.
          * Capire perché un componente si sta ri-renderizzando (Profiler).
          * Debuggare `Context`, `Hooks` e altro.

  * **ESLint (`eslint-plugin-react-hooks`)**

      * **Cos'è:** Un linter per il tuo codice. Questo specifico plugin di ESLint è focalizzato sugli Hooks di React.
      * **Perché usarlo:** È il tuo "assistente" che previene bug prima ancora che accadano. Ti avvisa se:
          * Stai violando le "Regole degli Hooks" (es. chiamare un Hook dentro un `if`).
          * Hai dimenticato una dipendenza nell'array di `useEffect`, `useMemo` o `useCallback`, prevenendo bug di "stato vecchio" (stale state) che sono difficilissimi da trovare.

-----

### Gestione di Asset e Importazioni

Questi plugin semplificano il modo in cui importi file e gestisci i percorsi nel tuo progetto.

  * **`vite-plugin-svgr`**

      * **Cos'è:** Un plugin che ti permette di importare file `.svg` direttamente come componenti React.
      * **Perché usarlo:** Invece di usare un tag `<img>`, puoi importare un'icona e usarla come un componente, potendo passare `props` come `className` o `color`.

    <!-- end list -->

    ```jsx
    // Prima: <img src="/logo.svg" alt="logo" />
    // Dopo:
    import { ReactComponent as Logo } from './logo.svg';
    const MyComponent = () => <Logo className="my-logo-class" />;
    ```

  * **Alias di Percorso (in `vite.config.js`)**

      * **Cos'è:** Non è un plugin, ma una configurazione fondamentale in `vite.config.js`. Ti permette di creare scorciatoie per i tuoi percorsi di importazione.
      * **Perché usarlo:** Dì addio agli import "infernali" come `import Button from '../../../components/Button'`.
      * **Come si configura:**
        ```javascript
        // In vite.config.js
        import { defineConfig } from 'vite';
        import path from 'path';

        export default defineConfig({
          // ...altri plugin
          resolve: {
            alias: {
              '@': path.resolve(__dirname, './src'),
              '@components': path.resolve(__dirname, './src/components'),
              '@hooks': path.resolve(__dirname, './src/hooks'),
            },
          },
        });

        // E poi nel tuo codice:
        import Button from '@components/Button';
        ```

-----

  * **`vite-plugin-component-debugger`**

      * **Cos'è:** Un piccolo ma geniale plugin di debugging.
      * **Perché usarlo:** Aggiunge un attributo `data-component` a tutti i tuoi elementi DOM nell'inspector del browser. Invece di vedere un semplice `<div>`, vedrai `<div data-component="MyComponent">`. Questo ti aiuta a mappare istantaneamente un elemento visivo nel browser al file del componente React che lo ha renderizzato.

-----




























-----

## 1\. Il Problema: Perché i Form "Puri" in React sono Complessi

Prima di introdurre la libreria, è cruciale capire *perché* ne abbiamo bisogno. Il metodo nativo di React per gestire i form si basa sui **"Componenti Controllati" (Controlled Components)**.

  * **Come funziona:** Si usa `useState` per ogni singolo campo. Il `value` dell'input è legato allo stato e l'`onChange` aggiorna quello stato.
  * **Il "Dietro le Quinte":** Questo approccio ha un enorme impatto sulle performance. **Ogni singola pressione di un tasto** (`onChange`) in un campo scatena una chiamata `setState`, che a sua volta **provoca un nuovo re-render** del componente che contiene il form.
  * **La Conseguenza:** Se hai un form di registrazione complesso con 15 campi, digitare in un campo causa 15 re-render inutili per gli altri 14. Se aggiungi la logica di validazione *durante* l'onChange, il tutto diventa estremamente lento e difficile da gestire (stati per i valori, stati per gli errori, stati per i "touched").

-----

## 2\. La Soluzione: React Hook Form (RHF)

**React Hook Form (RHF)** è la soluzione moderna a questo problema. È costruita attorno a un principio diverso: i **Componenti Non Controllati (Uncontrolled Components)**.

  * **Cos'è:** Una libreria "hook-based" (basata su
    Hooks) che gestisce lo stato del form, la validazione e il submit in modo isolato e performante.

  * **Il "Dietro le Quinte" (Il Segreto delle Performance):**

    1.  **Nessun Re-render sull'Input:** RHF non usa `useState` per il *valore* del campo. Invece, si aggancia all'input nativo del DOM usando un `ref`.
    2.  **Come funziona `register`:** Quando chiami `{...register("email")}`, RHF sta dicendo a React: "Gestirò io questo input. Non mi interessa il suo valore fino al submit. Registra solo i suoi listener `onChange` e `onBlur` nativi del DOM".
    3.  **Isolamento:** Lo stato del form vive *all'interno* dell'hook `useForm` e non provoca re-render del tuo componente mentre l'utente digita. Il tuo componente si aggiorna solo quando è strettamente necessario (es. quando compare un errore o quando i dati vengono inviati).

### I Vantaggi Professionali

  * **Performance :** Meno re-render significa un'app più veloce.
  * **Meno Codice:** Niente più `useState` per ogni campo.
  * **Validazione Integrata:** Si integra nativamente con librerie di validazione dello schema.

-----

## 3\. Il Partner: Zod (Schema Validation)

Non basta gestire il form, devi validarlo. Invece di scrivere 10 `if` dentro una funzione, si usa un approccio dichiarativo.

  * **Cos'è Zod:** Una libreria di "dichiarazione e validazione dello schema" (schema declaration and validation) basata su TypeScript.

  * **Il "Dietro le Quinte":**

    1.  **Single Source of Truth (SSOT):** Definisci un *oggetto* (lo schema) che descrive la "forma" dei tuoi dati e le sue regole (es. "email deve essere una stringa e un'email valida", "età deve essere un numero maggiore di 18").
    2.  **Separazione delle Competenze:** Il tuo componente React *non sa* quali sono le regole. Si occupa solo di mostrare gli errori. La logica di business (le regole) vive separata nello schema Zod.
    3.  **Inferenza dei Tipi:** Zod inferisce automaticamente i tipi TypeScript dal tuo schema. Definisci le regole una sola volta e ottieni gratuitamente la validazione a runtime *e* i tipi statici (type-safety) per il tuo form.

-----

## 4\. Installazione e Esempio Professionale

Ecco come si integrano **React Hook Form + Zod**.

### A. Installazione

Hai bisogno di tre pacchetti:

```bash
# Se usi NPM
npm install react-hook-form zod @hookform/resolvers

```

  * `react-hook-form`: Il gestore del form.
  * `zod`: Il costruttore di schemi.
  * `@hookform/resolvers`: Il "ponte" che fa parlare RHF e Zod.

### B. Esempio di Codice (Un Form di Login)

Questo è un pattern completo, type-safe e performante.

```tsx
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. DEFINIZIONE DELLO SCHEMA (La "Logica")
// Questo schema definisce le regole E crea i tipi TypeScript.
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: "L'email è richiesta" })
    .email({ message: "Formato email non valido" }),
  
  password: z.string()
    .min(8, { message: "La password deve essere di almeno 8 caratteri" }),
});

// 2. INFERENZA DEI TIPI (Type-Safety)
// Zod crea il tipo "LoginFormData" dallo schema.
type LoginFormData = z.infer<typeof loginSchema>;


// 3. IL COMPONENTE (La "UI")
function LoginForm() {
  
  // 4. SETUP DELL'HOOK
  const { 
    register,          // Collega l'input al form
    handleSubmit,      // Gestisce il <form onSubmit>
    formState: { errors } // Oggetto che contiene gli errori di validazione
  } = useForm<LoginFormData>({
    // 5. IL "PONTE" (Resolver)
    // Dice a RHF: "Usa questo schema Zod per validare"
    resolver: zodResolver(loginSchema),
    mode: 'onTouched' // Valida non appena l'utente esce dal campo
  });

  // 6. FUNZIONE DI SUBMIT
  // Viene chiamata SOLO se la validazione ha successo.
  // I "data" sono già tipizzati e validati.
  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    console.log('Dati validati:', data);
    // Qui faresti la tua chiamata API
    // es. mutation.mutate(data);
  };

  return (
    // 7. GESTIONE DEL SUBMIT
    // handleSubmit previene il refresh della pagina e 
    // chiama il nostro "onSubmit" solo se valido.
    <form onSubmit={handleSubmit(onSubmit)}>
      
      <div>
        <label htmlFor="email">Email</label>
        
        {/* 8. REGISTRAZIONE DELL'INPUT */}
        {/* {...register} passa onChange, onBlur, ref */}
        <input 
          id="email" 
          type="email" 
          {...register('email')} 
        />
        
        {/* 9. VISUALIZZAZIONE DELL'ERRORE */}
        {errors.email && (
          <p style={{ color: 'red' }}>{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input 
          id="password" 
          type="password" 
          {...register('password')} 
        />
        {errors.password && (
          <p style={{ color: 'red' }}>{errors.password.message}</p>
        )}
      </div>

      <button type="submit">Accedi</button>
    </form>
  );
}
```

### Riassumendo il "Dietro le Quinte" dell'Esempio:

1.  L'utente carica la pagina. `useForm` si inizializza.
2.  L'utente digita nel campo "email". **Il componente `LoginForm` NON si ri-renderizza.** RHF sta ascoltando tramite i `ref`.
3.  L'utente clicca fuori dal campo "email" (evento `onBlur`).
4.  Il `resolver` Zod entra in azione (grazie a `mode: 'onTouched'`), valida *solo* il campo email, vede che è vuoto e aggiorna lo stato `errors`.
5.  Ora `errors.email` esiste. **Questo scatena il primo re-render**, e il messaggio "L'email è richiesta" appare.
6.  L'utente clicca "Accedi". `handleSubmit` intercetta l'evento, esegue la validazione completa, e solo se tutto è valido, chiama la tua funzione `onSubmit` con i dati puliti e tipizzati.





















# Zod

-----

## 1\. Tipi Primitivi e Concatenamento (Chaining)

Questa è la base di Zod. Ogni tipo primitivo è una funzione che restituisce un oggetto "schema" su cui puoi concatenare (chain) dei validatori.

  * `z.string()`: Per le stringhe.
  * `z.number()`: Per i numeri.
  * `z.boolean()`: Per i booleani.
  * `z.date()`: Per gli oggetti `Date` di JavaScript.

La vera potenza è il **concatenamento**. Le regole vengono aggiunte in modo fluido e leggibile.

```typescript
// Un nome utente che deve essere una stringa,
// lunga almeno 3 caratteri, massimo 20,
// e può contenere solo lettere minuscole e trattini.
const usernameSchema = z.string()
  .min(3, { message: "Deve essere almeno 3 caratteri" })
  .max(20, { message: "Non può superare i 20 caratteri" })
  .regex(/^[a-z-]+$/, { message: "Solo lettere minuscole e trattini" });

// Un'email
const emailSchema = z.string().email("Formato email non valido");

// Un'età
const ageSchema = z.number()
  .int({ message: "Deve essere un numero intero" })
  .positive({ message: "Deve essere un numero positivo" })
  .gte(18, { message: "Devi essere maggiorenne" });
```

-----

## 2\. Gestione della Nullability (Optional, Nullable, Default)

Questo è fondamentale quando si lavora con API o form.

  * `.optional()`: Il campo può essere `undefined`. In TypeScript, il tipo diventa `T | undefined`.
  * `.nullable()`: Il campo può essere `null`. Il tipo diventa `T | null`.
  * `.default(value)`: Se il campo è `undefined`, Zod fornirà un valore di default. Questo *non* si attiva per `null`.

<!-- end list -->

```typescript
const userPreferencesSchema = z.object({
  // L'avatar è opzionale, può non essere presente
  avatarUrl: z.string().url().optional(), 
  
  // Il bio può essere una stringa o null (se l'utente l'ha cancellato)
  bio: z.string().nullable(), 
  
  // Il tema ha un valore di default
  theme: z.string().default('light'),
});
```

-----

## 3\. Inferenza dei Tipi (`z.infer`) 

Questa è la *killer feature* di Zod. Non devi **mai** definire un'interfaccia TypeScript e poi uno schema Zod che la replica. Definisci *solo* lo schema Zod e Zod genera il tipo per te.

Questo principio si chiama **Single Source of Truth (SSOT)**.

```typescript
// 1. Definiamo lo SCHEMA (la validazione a runtime)
const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  email: z.string().email(),
  isAdmin: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// 2. Inferiamo il TIPO (la sicurezza a compile-time)
type User = z.infer<typeof UserSchema>;

/*
  Il tipo 'User' è stato generato automaticamente ed è:
  
  type User = {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean; // Nota: non opzionale, grazie a .default()
    tags?: string[] | undefined; // Nota: opzionale, grazie a .optional()
  }
*/

// Ora puoi usarlo nelle tue funzioni in modo type-safe
function sendWelcomeEmail(user: User) {
  // ...
}
```

-----

## 4\. Trasformazione e Coercizione (Coercion)

I dati spesso non arrivano nel formato giusto, specialmente dai form HTML (dove tutto è stringa) o dalle API.

  * **Coercizione (`z.coerce`)**: È un costruttore speciale che *forza* il tipo. È perfetto per i dati dei form.
  * **Trasformazione (`.transform()`)**: Permette di modificare il valore *dopo* che è stato validato.

<!-- end list -->

```typescript
// Esempio 1: Coercizione (Dati da un <input type="number">)
const productSchema = z.object({
  // <input name="id"> invierà "123" (stringa)
  // z.coerce.number() lo trasforma in 123 (numero) PRIMA di validarlo.
  id: z.coerce.number().int().positive(),
  name: z.string(),
});

// Esempio 2: Trasformazione (Pulizia dei dati)
const tagSchema = z.string()
  .trim() // Rimuove spazi bianchi
  .transform((val) => val.toLowerCase()); // Converte in minuscolo

// "  React  " -> "react"
```

-----




























# Ottimizzazione pagine

## 1\. Il Problema: Il "Bundle Monolitico"

Per capire la soluzione, dobbiamo prima analizzare il problema "dietro le quinte".

Quando usi un bundler come **Vite** o Webpack, questo analizza tutti i tuoi `import` e crea un unico (o pochi) file JavaScript "bundle". Questo file contiene *tutto* il codice della tua applicazione: la Homepage, la pagina Profilo, la Dashboard Admin, la pagina Contatti, ecc.

**Il "Dietro le Quinte":**

1.  Un utente visita la tua Homepage (`/`).
2.  Il browser deve scaricare, analizzare ed eseguire **l'intero `app.bundle.js` (es. 2 MB)**.
3.  L'utente sta scaricando il codice della pesante Dashboard Admin (`/admin`) anche se **potrebbe non visitarla mai**.

Questo spreco di risorse rallenta drasticamente il caricamento iniziale della tua applicazione (il TTI - Time To Interactive).

**L'analogia:** È come se, per guardare il primo episodio di una serie su Netflix, fossi costretto a scaricare l'intera stagione in 4K.

-----

## 2\. La Soluzione: `React.lazy()` e `React.Suspense`

Il **Code Splitting** è la tecnica che permette al tuo bundler (Vite) di dividere il codice in molti piccoli file, chiamati "chunk" (pezzi), che vengono caricati *solo quando sono necessari*.

### A. `React.lazy(importFunction)`

`React.lazy` è una funzione di React che ti permette di renderizzare un componente caricato dinamicamente (un "import pigro") come se fosse un componente normale.

  * **Come funziona:** `React.lazy` accetta una funzione che *deve* chiamare un `import()` dinamico. Questo `import()` restituisce una Promise che si risolve in un modulo con un'esportazione `default` (il tuo componente).
  * **Cosa dice al Bundler:** Quando Vite (o Webpack) vede la sintassi `import()`, capisce automaticamente che quel codice non è necessario subito e **crea un file "chunk" separato** (es. `admin-page.chunk.js`).

### B. `<React.Suspense fallback={...}>`

Il componente "pigro" (lazy) impiega del tempo per essere scaricato. Cosa vede l'utente in quel millisecondo (o secondo, su reti lente)?

  * **Come funziona:** `React.Suspense` è un componente che "cattura" il caricamento dei componenti pigri suoi discendenti.
  * **La prop `fallback`:** È l'elemento React (un semplice `<div>Caricamento...</div>`, uno spinner, o un componente "scheletro") da mostrare *mentre* il chunk JavaScript viene scaricato e analizzato.

-----

## 3\. Esempio Professionale: Code Splitting per Rotte

Il posto più comune e più efficace per applicare il code splitting è a livello di **rotta (pagina)**.

Supponiamo di usare `react-router-dom`.

###  PRIMA (Senza Code Splitting)

Tutto viene caricato subito nel bundle principale.

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importazioni STATICHE
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AdminDashboard from './pages/AdminDashboard'; // <-- Pesante!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```

###  DOPO (Con `lazy` e `Suspense`)

Carichiamo le pagine solo quando l'utente naviga verso quella rotta.

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Importazioni STATICHE (solo componenti leggeri e condivisi)
import HomePage from './pages/HomePage'; // La Home si carica subito
import LoadingSpinner from './components/LoadingSpinner';

// 1. Definiamo i componenti "pigri"
// L'import dinamico crea i chunk separati
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <BrowserRouter>
      {/* 2. Avvolgiamo le rotte con Suspense */}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* La Homepage è ancora statica per un caricamento istantaneo */}
          <Route path="/" element={<HomePage />} />

          {/* Queste pagine caricheranno i loro chunk solo quando visitate */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

-----

## 4\. Il Nuovo "Dietro le Quinte" 

Con la nuova configurazione, ecco cosa accade:

1.  L'utente visita `/`.
2.  Il browser scarica solo il bundle principale (`app.bundle.js` + `homepage.chunk.js`), che ora è **molto più piccolo** (es. 500 KB invece di 2 MB). L'app si carica velocemente.
3.  L'utente *non* ha ancora scaricato il codice di `/admin`.
4.  L'utente clicca sul link per `/admin`.
5.  `React Router` fa il matching della rotta e tenta di renderizzare il componente `AdminDashboard`.
6.  `React.lazy` "attiva" l'import dinamico: `import('./pages/AdminDashboard')`.
7.  Il browser esegue una **nuova richiesta di rete** per scaricare il file `admin-dashboard.chunk.js`.
8.  **Mentre** il file è in download, `React.Suspense` rileva l'attesa e mostra il `fallback`: `<LoadingSpinner />`.
9.  Il chunk arriva, viene eseguito, e `Suspense` sostituisce lo spinner con il componente `AdminDashboard` renderizzato.

###  Quando altro usarlo?

Oltre alle pagine, dovresti usare `React.lazy` per qualsiasi componente che sia:

  * **Pesante:** Grafici (es. `D3`, `Chart.js`), editor di testo complessi.
  * **Non critico:** Componenti "below the fold" (che non si vedono subito).
  * **Condizionale:** Modali, pannelli laterali o widget che vengono mostrati solo dopo un click.

































## Il Problema: Istanze Multiple e Isolamento delle Schede

Per impostazione predefinita, l'apertura di un'applicazione React (o qualsiasi Single Page Application) in più schede del browser crea uno scenario non ottimizzato.

Ogni scheda del browser opera in un ambiente di esecuzione JavaScript isolato (una "sandbox"). Di conseguenza, se un utente apre 10 schede della stessa applicazione:

1.  Vengono create **10 istanze separate** dell'applicazione.
2.  Ognuna di queste istanze mantiene il proprio stato in memoria (tramite `useState`, Redux, cache di React Query, ecc.), portando a un consumo di RAM moltiplicato per 10.
3.  Ognuna esegue i propri processi in background (come `setInterval` per il polling dei dati), causando un consumo di CPU e batteria non necessario, specialmente per le schede in background.
4.  Ognuna stabilisce connessioni di rete separate (ad esempio, **10 connessioni WebSocket**), aumentando il carico sul server e sul client.
5.  Lo stato tra le schede non è sincronizzato. Una modifica dei dati nella Scheda 1 non si riflette nella Scheda 2, portando a dati "stale" (obsoleti) e a un'esperienza utente incoerente.

---

## Soluzioni di Ottimizzazione per Scenari Multi-Scheda

Per mitigare l'impatto sulle risorse e sincronizzare l'esperienza utente, si applicano diverse tecniche basate su API native del browser.

### 1. Caching degli Asset (HTTP Cache)

Il problema del *caricamento* iniziale di ogni scheda viene risolto tramite un corretto caching HTTP.

* **Meccanismo:** La prima scheda scarica gli asset (bundle JavaScript e CSS). Il browser li memorizza nella sua cache su disco.
* **Effetto:** Le schede successive rilevano la presenza degli asset nella cache e li caricano istantaneamente dal disco, bypassando la rete. Questo viene gestito tramite header HTTP come `Cache-Control: immutable` impostati dal server.
* **Limitazione:** Questa ottimizzazione risolve solo il tempo di caricamento iniziale; non affronta i problemi di runtime (memoria, CPU, sincronizzazione).

### 2. Sincronizzazione dello Stato (BroadcastChannel API)

Per risolvere il problema dei dati "stale", è necessario che le istanze comunichino tra loro.

* **Strumento:** L'API `BroadcastChannel`.
* **Meccanismo:** Tutte le schede si iscrivono a un canale nominato (es. `new BroadcastChannel('app-updates')`). Quando un'istanza (Scheda 1) completa un'azione che modifica i dati (es. un salvataggio), invia un messaggio su questo canale (`channel.postMessage(...)`).
* **Effetto:** Tutte le altre schede (Schede 2-10) ricevono il messaggio. Al ricevimento, possono reagire invalidando le loro cache di dati (es. `queryClient.invalidateQueries(...)` in React Query) e rieseguendo il fetch dei dati aggiornati, garantendo la coerenza dell'interfaccia utente.

### 3. Sospensione delle Schede in Background (Page Visibility API)

Per ridurre il consumo di CPU e batteria, le attività non essenziali delle schede inattive devono essere sospese.

* **Strumento:** L'API `Page Visibility API`.
* **Meccanismo:** Questa API fornisce un evento (`visibilitychange`) e una proprietà (`document.hidden`) che indicano se la pagina è attualmente visibile all'utente.
* **Effetto:** L'applicazione può ascoltare questo evento. Quando `document.hidden` diventa `true`, l'applicazione deve sospendere processi come il polling (`setInterval`), le animazioni complesse o i calcoli in background. Quando la scheda torna visibile, questi processi vengono ripresi e i dati vengono aggiornati per compensare il periodo di inattività.

### 4. Centralizzazione delle Connessioni (SharedWorker API)

Per risolvere il problema della moltiplicazione delle connessioni di rete (es. WebSocket), la connessione deve essere centralizzata.

* **Strumento:** L'API `SharedWorker`.
* **Meccanismo:** Uno `SharedWorker` è uno script eseguito in un thread in background **condiviso** tra tutte le schede della stessa origine (dominio).
* **Effetto:** Invece di far aprire la connessione a ogni scheda, le 10 schede si collegano tutte a questo singolo `SharedWorker`. È il worker stesso ad aprire **una sola connessione WebSocket** con il server. Quando il worker riceve un messaggio dal server, lo inoltra (broadcast) a tutte le 10 schede collegate. Questo riduce drasticamente il carico di rete sul client e sul server.






























# Aggiornamento dei dati

-----

## 1\. Il Polling Semplice: `pollingInterval`

RTK Query ti permette di impostare un intervallo di polling direttamente nelle opzioni dell'hook generato.

**Come funziona:** Specifichi un numero (in millisecondi) e RTK Query rieseguirà la query a quell'intervallo, finché il componente è montato.

```jsx
import { useGetMessagesQuery } from './api/messagesApi';

function MessageList() {
  // Eseguirà un refetch ogni 3 secondi (3000ms)
  const { data, isLoading } = useGetMessagesQuery(
    undefined, // L'argomento della query (nessuno in questo caso)
    {
      // L'oggetto delle opzioni
      pollingInterval: 3000, 
    }
  );

  // ...
}
```

###  L'Avvertimento (La Parte Non "Intelligente")

Per impostazione predefinita, questo `pollingInterval` **continuerà a girare anche se l'utente cambia scheda o finestra**.

Questo comportamento è diverso da TanStack Query (che ha `refetchIntervalInBackground: false`). RTK Query non ferma il polling da solo, consumando risorse (CPU, batteria e rete del client, e carico sul tuo server) anche quando l'utente non sta guardando.

-----

## 2\. Il Polling "Intelligente": `pollingInterval` + `skip`

Per implementare un polling *intelligente* che si ferma quando la scheda è in background, devi combinarlo con una logica di "skip".

La strategia professionale consiste nell'usare un piccolo **custom hook** per rilevare la visibilità della pagina e passare `0` (che disabilita il polling) a `pollingInterval` quando la pagina è nascosta.

### Passaggio A: Il Custom Hook `usePageVisibility`

Crea questo hook riutilizzabile da qualche parte nel tuo progetto. Usa l'API `Page Visibility` del browser.

```jsx
// src/hooks/usePageVisibility.js
import { useState, useEffect } from 'react';

function getIsDocumentHidden() {
  return !document.hidden;
}

/**
 * Restituisce 'true' se la pagina è attualmente visibile,
 * 'false' se è in background.
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(getIsDocumentHidden());

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(getIsDocumentHidden());
    };

    // Aggiunge il listener per l'API Page Visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Pulisce il listener quando il componente si smonta
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
```

### Passaggio B: Uso nel Componente

Ora usa il tuo nuovo hook per impostare dinamicamente il `pollingInterval`.

```jsx
import { useGetMessagesQuery } from './api/messagesApi';
import { usePageVisibility } from '../hooks/usePageVisibility';

const POLLING_INTERVAL_MS = 3000; // 3 secondi

function MessageList() {
  // 1. Controlla se la pagina è visibile
  const isVisible = usePageVisibility();

  // 2. Imposta l'intervallo a 3000ms se visibile,
  //    o a 0 (polling disabilitato) se in background.
  const pollingInterval = isVisible ? POLLING_INTERVAL_MS : 0;

  // 3. Passa l'intervallo dinamico all'hook
  const { data, isLoading } = useGetMessagesQuery(
    undefined,
    {
      pollingInterval: pollingInterval,
    }
  );

  // ...
}
```

**Questo è l'approccio "intelligente" in RTK Query.** Ora l'app farà polling solo quando l'utente la sta attivamente guardando, risparmiando un'enorme quantità di risorse.

-----

## 3\. L'Alternativa: Affidarsi a `refetchOnFocus` (Default)

Ricorda che RTK Query ha un altro tipo di "intelligenza" attivo per impostazione predefinita: **`refetchOnFocus: true`**.

  * **Cosa fa:** Non fa il polling in background, ma...
  * **Quando l'utente torna** alla tua scheda dopo essere stato su un'altra, RTK Query esegue **automaticamente un refetch istantaneo**.

Per molti casi d'uso (dati che non cambiano *ogni secondo*), questo è sufficiente e persino migliore del polling, perché aggiorna i dati solo quando l'utente torna a guardarli.

### Scenari

  * **Vuoi dati aggiornati *solo* quando l'utente torna?**
      * Non fare nulla. `refetchOnFocus` (default) gestisce questo.
  * **Vuoi dati in (quasi) real-time, ma *solo* quando l'utente guarda?**
      * Usa la soluzione "Polling Intelligente" (Hook `usePageVisibility` + `pollingInterval` dinamico).
  * **Vuoi dati aggiornati *sempre*, anche in background?** (Raro, costoso)
      * Usa solo `pollingInterval: 3000`.

























---

## Traccia Finale: Progetto "PostMaster Pro" 

### Obiettivo Finale

Costruire un'applicazione di "Gestione Post" utilizzando React, **RTK Query** e **shadcn/ui**. L'applicazione dovrà gestire l'intero ciclo di vita **CRUD** (Create, Read, Update, Delete) dei post, interfacciandosi con l'API pubblica **JSONPlaceholder**.

L'obiettivo è duplice:
1.  Implementare pattern avanzati di gestione della cache di RTK Query, in particolare l'**invalidazione automatica** e gli **aggiornamenti ottimistici (Optimistic Updates)**.
2.  Costruire un'interfaccia professionale e protetta da un semplice sistema di autenticazione.

### Avvertimento Chiave 

È **vietato** l'uso di `useState` o `useEffect` per gestire i dati *del server* (dati dei post, stato di caricamento, errori). Tutta la gestione dello stato del server *deve* essere gestita da RTK Query.

---

### Risorse API (JSONPlaceholder)

Useremo principalmente la risorsa `/posts`.

* **GET** `/posts`: Recupera la lista di tutti i post.
* **GET** `/posts/:id`: Recupera un post singolo.
* **POST** `/posts`: Crea un nuovo post.
* **PUT** `/posts/:id`: Aggiorna un post esistente.
* **DELETE** `/posts/:id`: Elimina un post.

---

### Requisiti di Autenticazione e UI

#### 1. Sistema di Autenticazione (Stato Client)

* Deve essere implementato un sistema di "login" fittizio.
* Creare una pagina `/login` (rotta pubblica).
* Questa pagina deve contenere un campo password. L'accesso è garantito se la password inserita corrisponde a un valore preimpostato nel codice (es: `admin123`).
* Lo stato di autenticazione (`isAuthenticated: boolean`) deve essere gestito come **stato client** (es. tramite React Context, Zustand o un `slice` Redux separato).
* Tutte le rotte tranne `/login` devono essere protette. Se l'utente non è autenticato, deve essere reindirizzato a `/login`.
* Le funzionalità di **Create, Update e Delete** (bottoni, form) devono essere visibili *solo* se l'utente è autenticato. La visualizzazione (Read) dei post può essere pubblica (una volta superato il login).

#### 2. Interfaccia Utente (shadcn/ui)

* L'intera interfaccia utente dell'applicazione deve essere costruita utilizzando i componenti di **shadcn/ui**.
* Lo studente deve dimostrare di saper installare e configurare `shadcn/ui` (es. `npx shadcn-ui@latest init`).
* Tutti gli elementi (layout, bottoni, form, card, ecc.) devono utilizzare i componenti `shadcn` appropriati (es. `Card`, `Button`, `Input`, `Label`, `Form`).

---

### Requisiti CRUD (RTK Query)

#### 1. Setup dell'API Slice (`createApi`)

* Definisci un `apiSlice` utilizzando `createApi`.
* Configura il `baseQuery` (usando axios) puntando a `https://jsonplaceholder.typicode.com`.
* Definisci un **tag** chiamato `'Post'`. Questo è fondamentale per la gestione della cache.
* Iniettare gli endpoint generati e configurare il Redux Store.

#### 2. Visualizzazione (READ): Lista e Dettaglio

* **Componente `PostList.js`:**
    * Usa l'hook `useGetPostsQuery` per recuperare e visualizzare la lista di tutti i post (es. in `Card` di shadcn).
    * L'endpoint `getPosts` deve *fornire* (`providesTags`) un tag `'Post'` generale per la lista.
    * Gestisci correttamente gli stati `isLoading` (es. con un `Skeleton` di shadcn) e `isError`.
* **Componente `SinglePostPage.js`:**
    * La pagina deve recuperare l'ID del post dalla URL (usando `react-router-dom`).
    * Usa l'hook `useGetPostQuery(postId)` per recuperare e visualizzare i dettagli del post.
    * L'endpoint `getPost` deve *fornire* un tag specifico per quell'ID (es. `{ type: 'Post', id: arg }`).

#### 3. Creazione (CREATE): Invalidazione della Cache

* **Componente `AddPostForm.js`:**
    * Crea un form utilizzando i componenti `Form`, `Input` e `Button` di `shadcn` (integrati con `react-hook-form` e `zod` come documentato da `shadcn`).
    * Usa l'hook `useAddPostMutation` per inviare i dati (POST).
    * Alla *riuscita* della mutazione, la lista dei post in `PostList.js` deve **aggiornarsi automaticamente**.
    * **Implementazione:** L'endpoint `addPost` deve *invalidare* (`invalidatesTags`) il tag `'Post'` della lista.

#### 4. Eliminazione (DELETE): Aggiornamento Ottimistico (La Sfida)

Questo è il requisito avanzato chiave.

* Aggiungi un `Button` (con variante `destructive`) per eliminare un post.
* Usa l'hook `useDeletePostMutation`.
* **Non** devi usare la semplice invalidazione. Devi implementare un **Aggiornamento Ottimistico**.
* **Implementazione:**
    1.  Nell'endpoint `deletePost`, usa la funzione `onQueryStarted`.
    2.  Prima che la chiamata API parta (`await queryFulfilled`), devi *manualmente* aggiornare la cache (`dispatch(api.util.updateQueryData(...)`)) per rimuovere il post dalla lista `getPosts`.
    3.  L'interfaccia utente si aggiornerà *istantaneamente*.
    4.  Usa un blocco `try...catch` attorno a `queryFulfilled`.
    5.  Se il `catch` scatta (l'API fallisce), devi "annullare" l'aggiornamento ottimistico usando `patchResult.undo()`.

---

### Bonus (Se hai tempo)

#### 5. Aggiornamento (UPDATE) con Aggiornamento Ottimistico

* Crea un componente `EditPostForm.js` (magari in un `Dialog` o `Sheet` di shadcn).
* Usa l'hook `useUpdatePostMutation` (PUT).
* Implementa un aggiornamento ottimistico (simile al Delete):
    * `onQueryStarted`: aggiorna *immediatamente* la cache del post singolo (`getPost`) e l'elemento nella lista (`getPosts`) con i nuovi dati.
    * Usa `try/catch` e `patchResult.undo()` per gestire i fallimenti.