/*
 * screens/PostListScreen.tsx
 *
 * Mostra la lista di post usando FlatList e RTK Query.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useGetPostsQuery } from '../store/api';
import { PostListScreenProps } from '../navigation/types';
import { Post } from '../store/api';

// Definiamo un componente Item memoizzato per ottimizzare la FlatList
const PostItem = React.memo(
  ({ item, onPress }: { item: Post; onPress: (id: number) => void }) => {
    return (
      <TouchableOpacity onPress={() => onPress(item.id)} style={styles.item}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      </TouchableOpacity>
    );
  },
);

const PostListScreen = ({ navigation }: PostListScreenProps) => {
  // 1. Usiamo l'hook generato da RTK Query.
  //    'data', 'isLoading', 'error' sono gestiti automaticamente.
  const { data: posts, isLoading, error } = useGetPostsQuery();

  // 2. Gestiamo la navigazione con un callback memoizzato
  const handlePress = useCallback(
    (postId: number) => {
      // TypeScript sa che 'PostDetail' richiede '{ postId: number }'
      navigation.navigate('PostDetail', { postId });
    },
    [navigation],
  );

  // 3. Gestiamo lo stato di caricamento
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e88e5" />
        <Text>Caricamento...</Text>
      </View>
    );
  }

  // 4. Gestiamo lo stato di errore
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Errore nel caricamento dei post.</Text>
      </View>
    );
  }

  // 5. Funzione per renderizzare l'item (passata a FlatList)
  const renderItem = ({ item }: { item: Post }) => (
    <PostItem item={item} onPress={handlePress} />
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
    />
  );
};

// Definiamo gli stili
const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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

export default PostListScreen;