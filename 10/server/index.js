// Importa il modulo http di Node e la classe Server da socket.io
import { createServer } from "http";
import { Server } from "socket.io";

// Definiamo la porta. Usiamo 8080 come da convenzione per i server custom.
const PORT = process.env.PORT || 8080;

// Creiamo un server HTTP standard
const httpServer = createServer();

// Creiamo un'istanza del server Socket.IO e la colleghiamo al server HTTP
const io = new Server(httpServer, {
  // Configurazione CORS: essenziale per permettere al client React 
  // (che gira su un'altra porta/dominio) di connettersi.
  cors: {
    origin: "*", // Per la demo, accettiamo connessioni da ovunque.
    methods: ["GET", "POST"]
  }
});

// Logica principale: cosa fare quando un client si connette
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Nuovo client connesso: ${socket.id}`);

  // 1. Ascolta l'evento 'sendMessage' inviato dal client (Modulo 3)
  socket.on("sendMessage", (data) => {
    
    // Log nel terminale del server (per il debug)
    console.log(`[Socket.IO] Messaggio ricevuto da ${socket.id}:`, data);
    
    // 2. Emette l'evento 'receiveMessage' a *TUTTI* i client connessi (Modulo 4)
    // Questo simula la logica di broadcast della chat.
    io.emit("receiveMessage", data);
  });

  // Gestisce la disconnessione del client
  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnesso: ${socket.id}`);
  });
});

// Avviamo il server HTTP sulla porta definita
httpServer.listen(PORT, () => {
  console.log(`🚀 Server Socket.IO (Black Box) in ascolto sulla porta ${PORT}`);
});