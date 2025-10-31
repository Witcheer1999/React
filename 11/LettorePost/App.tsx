/*
 * App.tsx
 *
 * Il punto di ingresso principale (root) della nostra applicazione.
 * Avvolgiamo l'app con i "Provider" necessari.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux'; // 1. Provider Redux
import { NavigationContainer } from '@react-navigation/native'; // 2. Provider Navigazione
import { store } from './store'; // Importiamo il nostro store
import { RootNavigator } from './navigation'; // Importiamo il nostro navigatore
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    // Forniamo lo store Redux all'intera app
    <Provider store={store}>
      {/* SafeAreaProvider è richiesto da native-stack */}
      <SafeAreaProvider>
        {/* NavigationContainer gestisce lo stato della navigazione */}
        <NavigationContainer>
          {/* Renderizziamo il nostro stack di schermate */}
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}