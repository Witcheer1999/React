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