

import React, { useState } from 'react';
import { useSendMessageMutation } from './chatApi';

export const MessageInput: React.FC = () => {
  const [text, setText] = useState('');
  const [username] = useState('Utente' + Math.floor(Math.random() * 1000));

  // 1. Logica hook invariata
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isSending) {
      // 2. Logica di dispatch invariata
      sendMessage({
        user: username,
        text: text,
      });
      setText(''); // Svuota l'input
    }
  };

  // 3. Renderizza il form con classi Tailwind
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center p-4 border-t border-gray-200 bg-gray-50"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Scrivi un messaggio..."
        disabled={isSending}
        className="flex-grow border border-gray-300 rounded-full py-2 px-4 mr-3
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:bg-gray-100"
      />
      <button 
        type="submit" 
        disabled={isSending}
        className="bg-blue-500 text-white rounded-full py-2 px-5 font-semibold
                   hover:bg-blue-600 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:ring-offset-2
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSending ? 'Invio...' : 'Invia'}
      </button>
    </form>
  );
};