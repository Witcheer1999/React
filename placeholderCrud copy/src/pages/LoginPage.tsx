// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../features/auth/authSlice';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- Logica di Login Simulata ---
    // Confronto con la stringa "admin" e una password
    if (username === 'admin' && password === 'password123') {
      dispatch(loginSuccess(username));
      navigate('/posts', { replace: true }); // Reindirizza alla dashboard
    } else {
      setError('Credenziali errate. (Hint: admin / password123)');
    }
  };

  return (
    <div>
      <h2>Login (Solo Admin)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ marginTop: '15px' }}>Login</button>
      </form>
    </div>
  );
};
export default LoginPage;