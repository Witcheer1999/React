import type { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { chatApi, type Message } from '../features/chat/chatApi';
import {
  startConnecting,
  connectionEstablished,
  connectionLost,
} from '../features/chat/chatSlice';

// La Factory Function per creare il middleware
export const createSocketMiddleware = (
  url: string,
  api: typeof chatApi
): Middleware => {
  return (storeApi) => {
    // Questa istanza del socket sarà un singleton per l'app
    let socket: Socket | null = null;

    return (next) => (action) => {
      // ==================================================================
      // === FLUSSO 1: "IN ENTRATA" (Avvio e Ascolto Eventi) ===
      // ==================================================================

      // 1. Intercetta l'azione "startConnecting"
      if (startConnecting.match(action)) {
        console.log('[Socket Middleware] Avvio connessione...');
        // Previene connessioni multiple
        if (!socket) {
          socket = io(url);

          // Listener di connessione base
          socket.on('connect', () => {
            console.log('[Socket.IO] Connesso al server.');
            // Informa il resto dell'app che siamo connessi
            storeApi.dispatch(connectionEstablished());
          });

          socket.on('disconnect', () => {
            console.warn('[Socket.IO] Disconnesso dal server.');
            storeApi.dispatch(connectionLost());
          });

          // --- IL LISTENER CRUCIALE ---
          // Ascolta l'evento 'receiveMessage' dal server
          socket.on('receiveMessage', (message: Message) => {
            console.log('[Socket.IO] Messaggio ricevuto:', message);
            
            // 2. Iniettiamo il nuovo messaggio nella cache di RTK Query
            storeApi.dispatch(
              api.util.updateQueryData(
                'getMessages', // Endpoint da aggiornare
                undefined,     // Argomenti della query (void)
                (draft) => {   // La "ricetta" Immer
                  // Aggiunge il messaggio all'array esistente
                  draft.push(message);
                }
              ) as any
            );
          });
        }
      }

      // ==================================================================
      // === FLUSSO 2: "IN USCITA" (Invio Eventi su Azione) ===
      // ==================================================================
      
      // 3. Intercetta l'azione "pending" della mutation 'sendMessage'
      // Usiamo 'matchPending' per catturare l'azione *prima* che venga eseguita
      if (api.endpoints.sendMessage.matchPending(action)) {
        console.log('[Socket Middleware] Intercettata azione sendMessage:', action);
        // Controlla se il socket è connesso
        if (socket && socket.connected) {
          // 4. Esegui la logica imperativa: emetti l'evento al server
          socket.emit(
            'sendMessage', 
            action.meta.arg.originalArgs // Questo è il payload NewMessage
          );
        } else {
          console.error('[Socket Middleware] Socket non connesso. Impossibile inviare.');
          // Opzionale: potremmo dispatchare un'azione di errore qui
        }
      }

      // **Importante:** Lascia che l'azione prosegua il suo corso
      // Questo permette a RTK Query di aggiornare lo stato (es. 'isLoading')
      return next(action);
    };
  };
};