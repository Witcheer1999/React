// Rimuovi l'import di App.css
// import './App.css'; 
import { MessageList } from './features/chat/MessageList';
import { MessageInput } from './features/chat/MessageInput';
import { ConnectionStatus } from './features/chat/ConnectionStatus';

function App() {
  return (
    // Questo è il contenitore principale dell'app
    <div className="w-full max-w-2xl h-[90vh] mx-auto my-8 bg-white 
                    rounded-lg shadow-2xl flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="p-4 bg-blue-600 text-white flex justify-between 
                       items-center shadow-md z-10">
        <h1 className="text-xl font-bold">RTK + WebSocket Chat (Tailwind)</h1>
        <ConnectionStatus />
      </header>
      
      {/* Finestra Chat (lista + input) */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Il consumatore "puro" */}
        <MessageList />
        
        {/* Il produttore di "intenzioni" */}
        <MessageInput />
      </div>

    </div>
  );
}

export default App;