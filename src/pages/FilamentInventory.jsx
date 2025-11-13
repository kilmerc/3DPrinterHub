import { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Modal } from '../components/Modal';
import { DatalistInput } from '../components/DatalistInput';

export const FilamentInventory = () => {
  const context = useContext(AppContext);
  const { filaments, dropdownOptions } = context.state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedFilament, setSelectedFilament] = useState(null);

  const [formData, setFormData] = useState({
    brand: '',
    type: '',
    color: '',
    initialFilamentWeight_g: '',
    emptySpoolWeight_g: '',
    colorHex: '#000000'
  });

  const [updateWeight, setUpdateWeight] = useState('');

  const handleAddSpool = () => {
    if (!formData.brand || !formData.type || !formData.color || !formData.initialFilamentWeight_g || !formData.emptySpoolWeight_g) {
      alert('Please fill in all fields');
      return;
    }

    context.addFilament({
      ...formData,
      initialFilamentWeight_g: Number(formData.initialFilamentWeight_g),
      emptySpoolWeight_g: Number(formData.emptySpoolWeight_g)
    });

    setFormData({
      brand: '',
      type: '',
      color: '',
      initialFilamentWeight_g: '',
      emptySpoolWeight_g: '',
      colorHex: '#000000'
    });
    setShowAddModal(false);
  };

  const handleUpdateWeight = () => {
    if (!updateWeight || !selectedFilament) return;

    const newRemaining = Number(updateWeight) - selectedFilament.emptySpoolWeight_g;
    if (newRemaining < 0) {
      alert('Current weight cannot be less than empty spool weight');
      return;
    }

    context.updateFilament(selectedFilament.id, {
      remaining_g: newRemaining
    });

    setShowUpdateModal(false);
    setUpdateWeight('');
    setSelectedFilament(null);
  };

  const openUpdateModal = (filament) => {
    setSelectedFilament(filament);
    setUpdateWeight((filament.remaining_g + filament.emptySpoolWeight_g).toString());
    setShowUpdateModal(true);
  };

  const isLowFilament = (filament) => filament.remaining_g < 100;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Filament Inventory</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add New Spool
        </button>
      </div>

      {filaments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No filaments added yet. Click "Add New Spool" to get started.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filaments.map((filament) => (
            <div key={filament.id} className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderColor: filament.colorHex || '#000' }}>
              {isLowFilament(filament) && (
                <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-800 text-sm font-medium">
                  Low Filament ⚠️
                </div>
              )}

              <h3 className="text-lg font-bold mb-2">{filament.brand} - {filament.type}</h3>
              <p className="text-sm text-gray-600 mb-3">Color: {filament.color}</p>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{filament.remaining_g}g / {filament.initialFilamentWeight_g}g</span>
                  <span className="text-gray-500">{Math.round((filament.remaining_g / filament.initialFilamentWeight_g) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, Math.min(100, (filament.remaining_g / filament.initialFilamentWeight_g) * 100))}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openUpdateModal(filament)}
                  className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Update Weight
                </button>
                <button
                  onClick={() => context.deleteFilament(filament.id)}
                  className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Finish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({
            brand: '',
            type: '',
            color: '',
            initialFilamentWeight_g: '',
            emptySpoolWeight_g: '',
            colorHex: '#000000'
          });
        }}
        title="Add New Filament Spool"
        onConfirm={handleAddSpool}
        confirmText="Add Spool"
      >
        <DatalistInput
          label="Brand"
          value={formData.brand}
          onChange={(val) => setFormData({ ...formData, brand: val })}
          options={dropdownOptions.brands}
          placeholder="e.g., Overture"
          category="brands"
        />
        <DatalistInput
          label="Type"
          value={formData.type}
          onChange={(val) => setFormData({ ...formData, type: val })}
          options={dropdownOptions.types}
          placeholder="e.g., PLA"
          category="types"
        />
        <DatalistInput
          label="Color"
          value={formData.color}
          onChange={(val) => setFormData({ ...formData, color: val })}
          options={dropdownOptions.colors}
          placeholder="e.g., Black"
          category="colors"
        />
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Color Hex</label>
          <input
            type="color"
            value={formData.colorHex}
            onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Initial Filament Weight (g)</label>
          <input
            type="number"
            value={formData.initialFilamentWeight_g}
            onChange={(e) => setFormData({ ...formData, initialFilamentWeight_g: e.target.value })}
            placeholder="e.g., 1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Empty Spool Weight (g)</label>
          <input
            type="number"
            value={formData.emptySpoolWeight_g}
            onChange={(e) => setFormData({ ...formData, emptySpoolWeight_g: e.target.value })}
            placeholder="e.g., 215"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Modal>

      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setUpdateWeight('');
          setSelectedFilament(null);
        }}
        title="Update Filament Weight"
        onConfirm={handleUpdateWeight}
        confirmText="Update"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Enter Current Total Weight (on scale, in grams)</label>
          <input
            type="number"
            value={updateWeight}
            onChange={(e) => setUpdateWeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {selectedFilament && (
            <p className="text-sm text-gray-500 mt-2">
              Empty spool weight: {selectedFilament.emptySpoolWeight_g}g
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
