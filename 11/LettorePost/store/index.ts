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