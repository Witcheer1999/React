import React from 'react';
import { useAppSelector } from '../../app/hooks';

export const ConnectionStatus: React.FC = () => {
  const status = useAppSelector((state) => state.chat.status);

  // Mappa gli stati alle classi Tailwind
  const statusStyles = {
    disconnected: 'bg-red-500 text-white',
    connecting: 'bg-yellow-400 text-gray-800',
    connected: 'bg-green-500 text-white',
    error: 'bg-red-700 text-white',
  };

  return (
    <div 
      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusStyles[status]}`}
    >
      {status}
    </div>
  );
};