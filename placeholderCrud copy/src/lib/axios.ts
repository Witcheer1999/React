// src/lib/axios.ts
import axios from 'axios';

export const axiosBase = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});