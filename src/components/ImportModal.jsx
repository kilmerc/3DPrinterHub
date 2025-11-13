import { useState } from 'react';
import { Modal } from './Modal';
import { useFileHandler } from '../hooks/useFileHandler';

export const ImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { importData } = useFileHandler();

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type || file.type !== 'application/json') {
      setError('Please select a valid JSON file');
      return;
    }

    try {
      await importData(file);
      setError('');
      onImportSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to import data');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Data" confirmText="Skip">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Load your 3D Print Hub data from a previously exported JSON file, or start with empty data.
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer block">
            <p className="font-medium">Drag and drop your JSON file here</p>
            <p className="text-sm text-gray-500">or click to select a file</p>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </Modal>
  );
};
