// src/components/Layout.tsx
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  return (
    <div style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px' }}>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '15px' }}>
          <li><Link to="/">Home</Link></li>
          {isAuthenticated && <li><Link to="/posts">Posts (Admin)</Link></li>}
          {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
        </ul>
        {isAuthenticated && (
          <button onClick={() => dispatch(logout())}>Logout</button>
        )}
      </nav>
      <hr />
      <main style={{ marginTop: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};
export default Layout;