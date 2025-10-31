/*
 * navigation/index.tsx
 *
 * Creiamo il nostro Stack Navigator.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // Importiamo i nostri tipi

// Importiamo le schermate (che creeremo tra poco)
import PostListScreen from '../screens/PostListScreen';
import PostDetailScreen from '../screens/PostDetailScreen';

// Creiamo lo Stack usando la nostra ParamList (per la type-safety)
const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="PostList" // Schermata di partenza
      screenOptions={{
        headerStyle: { backgroundColor: '#1e88e5' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Stack.Screen
        name="PostList"
        component={PostListScreen}
        options={{ title: 'Post Recenti' }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Dettaglio Post' }}
      />
    </Stack.Navigator>
  );
};