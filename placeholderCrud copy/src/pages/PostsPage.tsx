// src/pages/PostsPage.tsx
import { Link } from 'react-router-dom';
import { 
  useGetPostsQuery, 
  useAddPostMutation, 
  useDeletePostMutation 
} from '../api/postsApi';

const PostsPage = () => {
  // READ (List)
  const { data: posts, isLoading, isError, error } = useGetPostsQuery();
  
  // CREATE
  const [addPost, { isLoading: isAdding }] = useAddPostMutation();

  // DELETE
  const [deletePost] = useDeletePostMutation();

  const handleAddPost = async () => {
    try {
      await addPost({
        title: 'Nuovo Post Esempio',
        body: 'Questo è il corpo del nuovo post.',
        userId: 1, // JSON Placeholder richiede un userId
      }).unwrap();
    } catch (err) {
      console.error('Errore creazione post: ', err);
    }
  };

  const handleDelete = async (id: number) => {
     if (window.confirm('Sei sicuro di voler eliminare questo post?')) {
        try {
            await deletePost(id).unwrap();
        } catch (err) {
            console.error('Errore eliminazione post: ', err);
        }
     }
  };

  if (isLoading) return <div>Caricamento post...</div>;
  if (isError) return <div>Errore nel caricamento: {JSON.stringify(error)}</div>;

  return (
    <div>
      <h2>Gestione Posts (CRUD)</h2>
      <button onClick={handleAddPost} disabled={isAdding}>
        {isAdding ? 'Creazione...' : 'Aggiungi Nuovo Post (CREATE)'}
      </button>
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts?.slice(0, 20).map((post) => ( // Limito a 20 per leggibilità
          <li key={post.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <h3>
              {/* Link alla pagina di dettaglio/modifica */}
              <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </h3>
            <p>{post.body.substring(0, 70)}...</p>
            <button onClick={() => handleDelete(post.id)} style={{color: 'red'}}>
              Elimina (DELETE)
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default PostsPage;