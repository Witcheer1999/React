// src/pages/index.ts
import { lazy } from 'react';

export const HomePage = lazy(() => import('./HomePage'));
export const LoginPage = lazy(() => import('./LoginPage'));
export const PostsPage = lazy(() => import('./PostsPage'));
export const PostDetailPage = lazy(() => import('./PostDetailPage'));
export const NotFoundPage = lazy(() => import('./NotFoundPage'));