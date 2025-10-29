// src/api/postsApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';
import type { Post } from '../types';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Post'], // Per invalidazione cache
  endpoints: (builder) => ({
    
    // READ (List)
    getPosts: builder.query<Post[], void>({
      query: () => ({ url: '/posts', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    // READ (Single)
    getPost: builder.query<Post, number>({
      query: (id) => ({ url: `/posts/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // CREATE
    addPost: builder.mutation<Post, Omit<Post, 'id'>>({
      query: (body) => ({ url: '/posts', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    // UPDATE (usiamo PATCH per aggiornamenti parziali)
    updatePost: builder.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
      query: ({ id, ...patch }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        data: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
    }),

    // DELETE
    deletePost: builder.mutation<{ id: number }, number>({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
  }),
});

// Esportiamo gli hook generati automaticamente
export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;