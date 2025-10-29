// src/hooks/useAuth.ts
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';

export const useAuth = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return { isAuthenticated };
};