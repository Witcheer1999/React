/*
 * navigation/types.ts
 *
 * Definiamo la "mappa" delle nostre schermate e dei parametri
 * che si aspettano.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  PostList: undefined; // La schermata 'PostList' non riceve parametri
  PostDetail: { postId: number }; // 'PostDetail' DEVE ricevere un 'postId'
};

// Tipi helper per le props di ogni schermata
export type PostListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PostList'
>;
export type PostDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PostDetail'
>;