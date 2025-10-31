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