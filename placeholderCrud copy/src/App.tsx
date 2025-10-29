// src/App.tsx
import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, LoginPage, PostsPage, PostDetailPage, NotFoundPage } from './pages';
import Layout from './components/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import Spinner from './components/Spinner';

function App() {
  return (
    <BrowserRouter>
      {/* Suspense gestisce il "caricamento..." delle pagine lazy */}
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* --- Rotte Pubbliche --- */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />

            {/* --- Rotte Protette (Admin) --- */}
            {/* ProtectedRoute fa da "guardiano" */}
            <Route element={<ProtectedRoute />}>
              <Route path="posts" element={<PostsPage />} />
              <Route path="posts/:id" element={<PostDetailPage />} />
            </Route>

            {/* --- Rotta 404 --- */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
export default App;