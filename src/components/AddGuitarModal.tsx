// src/components/AddGuitarModal.tsx
import { useState } from 'react';

interface AddGuitarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (guitarData: FormData) => Promise<void>;
}

const AddGuitarModal = ({ isOpen, onClose, onSubmit }: AddGuitarModalProps) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    serial_number: '',
    caption: '',
    genre: '',
    body_type: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    
    // Add form fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    
    // Add photo file if selected
    if (photoFile) {
      data.append('photo', photoFile);
    }
    
    await onSubmit(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Guitar</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Brand"
              className="w-full p-2 border rounded"
              value={formData.brand}
              onChange={e => setFormData({...formData, brand: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Model"
              className="w-full p-2 border rounded"
              value={formData.model}
              onChange={e => setFormData({...formData, model: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Year"
              className="w-full p-2 border rounded"
              value={formData.year}
              onChange={e => setFormData({...formData, year: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Serial Number"
              className="w-full p-2 border rounded"
              value={formData.serial_number}
              onChange={e => setFormData({...formData, serial_number: e.target.value})}
              required
            />
            <input
                type="text"
                placeholder="Genre (e.g. Rock, Jazz, Blues)"
                className="w-full p-2 border rounded"
                value={formData.genre}
                onChange={e => setFormData({...formData, genre: e.target.value})}
                required
            />
            <select
                className="w-full p-2 border rounded"
                value={formData.body_type}
                onChange={e => setFormData({...formData, body_type: e.target.value})}
                required
                >
                <option value="">Select Body Type</option>
                <option value="Solid Body">Solid Body</option>
                <option value="Semi-Hollow">Semi-Hollow</option>
                <option value="Hollow Body">Hollow Body</option>
                <option value="Acoustic">Acoustic</option>
                <option value="Classical">Classical</option>
            </select>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guitar Photo
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border rounded"
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                    setPhotoFile(file);
                    } else {
                    alert('Please select an image file');
                    }
                }}
                required
                />
            </div>
            <input
              type="text"
              placeholder="Photo Caption"
              className="w-full p-2 border rounded"
              value={formData.caption}
              onChange={e => setFormData({...formData, caption: e.target.value})}
              required
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Guitar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGuitarModal;