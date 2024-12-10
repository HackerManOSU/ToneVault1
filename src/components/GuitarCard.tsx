// src/components/GuitarCard.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EditGuitarModal from './EditGuitarModal';

interface Photo {
  photo_id: number;
  url: string;
  caption: string;
}

interface GuitarCardProps {
  guitar: {
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
  };
  currentUserId: number | null;
  onEditGuitar: (guitarId: number, formData: FormData) => Promise<void>;
  onDeleteGuitar: (guitarId: number) => Promise<void>;
}

const GuitarCard = ({ guitar, currentUserId, onEditGuitar, onDeleteGuitar }: GuitarCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this guitar?')) {
      await onDeleteGuitar(guitar.guitar_id);
    }
  };

  return (
    <div className="bg-white border rounded-lg mb-6">
      {/* Header - User info and options */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium">{guitar.user.username[0].toUpperCase()}</span>
          </div>
          <span className="ml-3 font-medium">{guitar.user.username}</span>
        </div>
        {guitar.user.user_id === currentUserId && (
          <div className="relative">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-gray-600 hover:text-gray-800 text-xl"
            >
              ⋮
            </button>
          </div>
        )}
      </div>

      {/* Image */}
      <div className="aspect-square">
        {guitar.photos[0] ? (
          <img 
            src={`http://localhost:5001/photos/${guitar.photos[0].photo_id}`}
            alt={`${guitar.brand} ${guitar.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Actions and Details */}
      <div className="p-4">
        {guitar.user.user_id === currentUserId && (
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}

        {/* Guitar Info */}
        <div className="space-y-2">
          <h2 className="font-bold text-sm">
            {guitar.brand} {guitar.model}
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Year: {guitar.year}</span>
            {guitar.serial_number && (
              <span className="text-sm text-gray-500">• S/N: {guitar.serial_number}</span>
            )}
          </div>
          {(guitar.genre || guitar.body_type) && (
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              {guitar.genre && <span>#{guitar.genre.replace(/\s+/g, '')}</span>}
              {guitar.body_type && <span>#{guitar.body_type.replace(/\s+/g, '')}</span>}
            </div>
          )}
          {guitar.photos[0]?.caption && (
            <p className="text-sm mt-2 text-gray-700">{guitar.photos[0].caption}</p>
          )}
        </div>
      </div>

      <EditGuitarModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        guitar={guitar}
        onSubmit={onEditGuitar}
      />
    </div>
  );
};

export default GuitarCard;