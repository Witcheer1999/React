/*
 * screens/PostDetailScreen.tsx
 *
 * Mostra i dettagli di un singolo post.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useGetPostByIdQuery } from '../store/api';
import { PostDetailScreenProps } from '../navigation/types';

const PostDetailScreen = ({ route }: PostDetailScreenProps) => {
  // 1. Otteniamo il 'postId' dai parametri della rotta (type-safe!)
  const { postId } = route.params;

  // 2. Chiamiamo l'hook con l'ID.
  //    RTK Query gestirà il caching.
  const { data: post, isLoading, error } = useGetPostByIdQuery(postId);

  // 3. Stato di caricamento
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  // 4. Stato di errore
  if (error || !post) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Impossibile caricare il post.</Text>
      </View>
    );
  }

  // 5. Dati caricati: renderizziamo i dettagli
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      <Text style={styles.meta}>Post ID: {post.id} | User ID: {post.userId}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1, // Usa flexGrow per ScrollView
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  meta: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default PostDetailScreen;