import React from 'react';
import { useGetMessagesQuery } from './chatApi';

export const MessageList: React.FC = () => {
  // 1. La logica dell'hook è invariata.
  const { data: messages, isLoading, isError } = useGetMessagesQuery();

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Caricamento messaggi...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500 font-semibold">
        Errore nel caricamento dei messaggi.
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nessun messaggio. Inizia a chattare!
      </div>
    );
  }

  // 2. Renderizza la lista con le classi Tailwind
  return (
    // Questa è la nostra "finestra" di messaggi scrollabile
    <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3">
      {messages.map((msg) => (
        <div 
          key={msg.id || `${msg.user}-${msg.timestamp}`} 
          className="p-2 px-3 bg-gray-200 rounded-xl max-w-xs self-start"
        >
          <strong className="font-bold text-gray-900 mr-1">{msg.user}: </strong>
          <span className="text-gray-800 break-words">{msg.text}</span>
        </div>
      ))}
    </div>
  );
};