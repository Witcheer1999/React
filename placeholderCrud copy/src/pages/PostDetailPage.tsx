// src/pages/PostDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPostQuery, useUpdatePostMutation } from '../api/postsApi';

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postId = Number(id);

  // READ (Single)
  const { data: post, isLoading, isError } = useGetPostQuery(postId, {
    skip: !postId, // Non eseguire la query se l'ID non è valido
  });

  // UPDATE
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  // Stato locale per il form di modifica
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // Popola il form quando i dati del post vengono caricati
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(post.body);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    try {
      await updatePost({ id: post.id, title, body }).unwrap();
      alert('Post aggiornato!');
      navigate('/posts'); // Torna alla lista
    } catch (err) {
      console.error('Errore aggiornamento post: ', err);
    }
  };

  if (isLoading) return <div>Caricamento dettagli post...</div>;
  if (isError || !post) return <div>Errore nel caricamento del post.</div>;

  return (
    <div>
      <h2>Modifica Post (UPDATE)</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Titolo:</label> <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '80%' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Corpo:</label> <br />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ width: '80%', minHeight: '150px' }}
          />
        </div>
        <button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </form>
    </div>
  );
};
export default PostDetailPage;