// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuitarList from '../components/GuitarList';
import AddGuitarModal from '../components/AddGuitarModal';

interface Guitar {
  guitar_id: number;
  brand: string;
  model: string;
  year: string;
  serial_number?: string;
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
const HomePage = () => {
  const navigate = useNavigate();
  const [guitars, setGuitars] = useState<Guitar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guitarsByGenre, setGuitarsByGenre] = useState<Guitar[]>([]);
  const [activeGenre, setActiveGenre] = useState<string>('');


  const fetchGuitars = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        throw new Error('Not authenticated');
      }
  
      const response = await fetch('http://localhost:5001/guitars', {
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
        throw new Error(errorData.error || 'Failed to fetch guitars');
      }
  
      const data = await response.json();
      setGuitars(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch guitars');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchGuitars();
  }, []);

  const handleAddGuitar = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        throw new Error('Not authenticated');
      }
  
      const response = await fetch('http://localhost:5001/guitars', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Failed to add guitar');
      }
  
      const newGuitar = await response.json();
      
      // After fetching newGuitar from POST:
      const formattedGuitar: Guitar = {
        guitar_id: newGuitar.guitar_id,
        brand: newGuitar.brand,
        model: newGuitar.model,
        year: newGuitar.year,
        serial_number: newGuitar.serial_number,
        photos: newGuitar.photo_id ? [{
          photo_id: newGuitar.photo_id,
          url: `http://localhost:5001/photos/${newGuitar.photo_id}`,
          caption: newGuitar.caption || ''
        }] : [],
        user: {
          user_id: newGuitar.user_id,
          username: newGuitar.username
        }
      };


      setGuitars(prev => [formattedGuitar, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add guitar');
      console.error('Error:', err);
    }
  };

  const fetchGuitarsByGenre = async (genre: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        throw new Error('Not authenticated');
      }
  
      const response = await fetch(`http://localhost:5001/guitars/genre/${encodeURIComponent(genre)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
        throw new Error('Failed to fetch guitars by genre');
      }
  
      const data = await response.json();
      setGuitarsByGenre(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch guitars by genre');
      console.error('Error:', err);
    }
  };

  const handleGenreChange = async (genre: string) => {
    setActiveGenre(genre);
    if (genre) {
      await fetchGuitarsByGenre(genre);
    } else {
      await fetchGuitars(); // Reset to all guitars when no genre is selected
    }
  };

  useEffect(() => {
    const fetchGuitars = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/'); // Redirect to login if no token
          throw new Error('Not authenticated');
        }
    
        const response = await fetch('http://localhost:5001/guitars', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
          }
          throw new Error('Failed to fetch guitars');
        }
    
        const data = await response.json();
        setGuitars(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load guitars');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuitars();
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

      // Refresh the list of guitars
      fetchGuitars();
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
      setGuitars(prev => prev.filter(guitar => guitar.guitar_id !== guitarId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guitar');
      console.error('Error:', err);
    }
  };

  const currentUser = localStorage.getItem('user');
  const currentUserId = currentUser ? JSON.parse(currentUser).user_id : null;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container max-w-2xl mx-auto px-4 py-8"> {/* Reduced max width */}
        <div className="flex justify-evenly items-center mb-8">
          <select
            value={activeGenre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Genres</option>
            <option value="Rock">Rock</option>
            <option value="Jazz">Jazz</option>
            <option value="Blues">Blues</option>
            <option value="Country">Country</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md" // Instagram-like button
          >
            Add New Guitar
          </button>
        </div>
  
        {loading && (
          <div className="text-center p-4 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">Loading guitars...</p>
          </div>
        )}
  
        {error && (
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}
  
        {!loading && !error && (
          <div className="space-y-6"> {/* Add vertical spacing between cards */}
            <GuitarList
              guitars={activeGenre ? guitarsByGenre : guitars}
              currentUserId={currentUserId}
              onEditGuitar={handleEditGuitar}
              onDeleteGuitar={handleDeleteGuitar}
            />
          </div>
        )}
  
        <AddGuitarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddGuitar}
        />
      </div>
    </div>
  );
};

export default HomePage;