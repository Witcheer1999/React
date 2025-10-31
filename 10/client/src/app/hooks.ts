import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Usa questi hook in tutta l'app invece dei semplici `useDispatch` e `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();