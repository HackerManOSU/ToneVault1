// src/components/GuitarList.tsx
import GuitarCard from './GuitarCard';

interface Guitar {
  guitar_id: number;
  brand: string;
  model: string;
  year: string;
  serial_number?: string;
  genre?: string;
  body_type?: string;
  photos: Photo[];
  last_modified: string; // Add this line
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

interface GuitarListProps {
  guitars: Guitar[];
  currentUserId: number | null;
  onEditGuitar: (guitarId: number, formData: FormData) => Promise<void>;
  onDeleteGuitar: (guitarId: number) => Promise<void>;
}

const GuitarList = ({ guitars, currentUserId, onEditGuitar, onDeleteGuitar }: GuitarListProps) => (
  <div className="flex flex-col space-y-6">
    {guitars.map((guitar) => (
      <GuitarCard
        key={guitar.guitar_id}
        guitar={guitar}
        currentUserId={currentUserId}
        onEditGuitar={onEditGuitar}
        onDeleteGuitar={onDeleteGuitar}
      />
    ))}
  </div>
);

export default GuitarList;