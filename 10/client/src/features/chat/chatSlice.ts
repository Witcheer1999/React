import { createSlice } from '@reduxjs/toolkit';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ChatState {
  status: ConnectionStatus;
}

const initialState: ChatState = {
  status: 'disconnected',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Azione che useremo per dire al middleware di connettersi
    startConnecting: (state) => {
      state.status = 'connecting';
    },
    // Azioni che il middleware dispatcherà in base agli eventi del socket
    connectionEstablished: (state) => {
      state.status = 'connected';
    },
    connectionLost: (state) => {
      state.status = 'disconnected';
    },
  },
});

export const { startConnecting, connectionEstablished, connectionLost } =
  chatSlice.actions;
export default chatSlice.reducer;