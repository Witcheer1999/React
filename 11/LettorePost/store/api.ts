/*
 * store/api.ts
 *
 * Definiamo la nostra API slice con RTK Query.
 * La parte fondamentale è la 'axiosBaseQuery' personalizzata.
 */
import {
  createApi,
  BaseQueryFn,
} from '@reduxjs/toolkit/query/react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

// 1. Definiamo i tipi di dato che ci aspettiamo da JSONPlaceholder
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// 2. Creiamo una 'baseQuery' personalizzata che usa Axios
// Questo ci dà il massimo controllo (es. per aggiungere header, intercettori)
const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' },
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      // Esegui la chiamata Axios
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
      });
      // Restituisci i dati in un formato che RTK Query capisce
      return { data: result.data };
    } catch (axiosError) {
      // Gestisci gli errori in un formato che RTK Query capisce
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

// 3. Definiamo il nostro "API slice"
export const api = createApi({
  reducerPath: 'api', // Il nome dello slice nello store
  
  // Usiamo la nostra baseQuery personalizzata
  baseQuery: axiosBaseQuery({
    baseUrl: 'https://jsonplaceholder.typicode.com',
  }),
  
  // 4. Definiamo gli "endpoints" (le chiamate API)
  endpoints: builder => ({
    // Endpoint per ottenere tutti i post
    getPosts: builder.query<Post[], void>({
      query: () => ({ url: '/posts', method: 'GET' }),
    }),
    
    // Endpoint per ottenere un singolo post
    getPostById: builder.query<Post, number>({
      query: id => ({ url: `/posts/${id}`, method: 'GET' }),
    }),
  }),
});

// 5. Esportiamo gli hooks generati automaticamente da RTK Query
export const { useGetPostsQuery, useGetPostByIdQuery } = api;