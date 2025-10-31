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