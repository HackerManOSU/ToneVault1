import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuitarList from '../components/GuitarList';

interface Guitar {
  guitar_id: number;
  brand: string;
  model: string;
  year: string;
  serial_number?: string;
  genre?: string;
  body_type?: string;
  photos: Photo[];
  user: {
    username: string;
    user_id: number;
  };
}

interface Photo {
  photo_id: number;
  url: string;
  caption: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userGuitars, setUserGuitars] = useState<Guitar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUserGuitars = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`http://localhost:5001/users/${currentUser.user_id}/guitars`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
        throw new Error('Failed to fetch user guitars');
      }

      const data = await response.json();
      setUserGuitars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGuitars();
  }, []);

  const handleEditGuitar = async (guitarId: number, formData: FormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        throw new Error('Not authenticated');
      }

      const response = await fetch(`http://localhost:5001/guitars/${guitarId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update guitar');
      }

      // Refresh the guitar list after successful update
      await fetchUserGuitars();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guitar');
      console.error('Error:', err);
    }
  };

  const handleDeleteGuitar = async (guitarId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        throw new Error('Not authenticated');
      }

      const response = await fetch(`http://localhost:5001/guitars/${guitarId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete guitar');
      }

      // Remove the deleted guitar from state
      setUserGuitars(prev => prev.filter(guitar => guitar.guitar_id !== guitarId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guitar');
      console.error('Error:', err);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-3xl font-medium">{currentUser.username[0].toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{currentUser.username}</h1>
            <p className="text-gray-600">Member since {new Date(currentUser.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">My Guitars</h2>
      
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <GuitarList 
          guitars={userGuitars}
          currentUserId={currentUser.user_id}
          onEditGuitar={handleEditGuitar}
          onDeleteGuitar={handleDeleteGuitar}
        />
      )}
    </div>
  );
};

export default ProfilePage;