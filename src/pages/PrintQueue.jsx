import { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Modal } from '../components/Modal';
import { DatalistInput } from '../components/DatalistInput';

export const PrintQueue = () => {
  const context = useContext(AppContext);
  const { printQueue, printers, dropdownOptions } = context.state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState('urgency');

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    printTime_hr: '',
    filamentUsage_g: '',
    requiredType: '',
    requiredColor: '',
    urgency: '',
    printSizeX: '',
    printSizeY: '',
    amsRequired: false,
    compatiblePrinterIds: []
  });

  const handleAddJob = () => {
    if (!formData.name || !formData.printTime_hr || !formData.filamentUsage_g) {
      alert('Please fill in all required fields');
      return;
    }

    context.addPrintJob({
      ...formData,
      printTime_hr: Number(formData.printTime_hr),
      filamentUsage_g: Number(formData.filamentUsage_g),
      printSizeX: Number(formData.printSizeX || 0),
      printSizeY: Number(formData.printSizeY || 0)
    });

    setFormData({
      name: '',
      url: '',
      printTime_hr: '',
      filamentUsage_g: '',
      requiredType: '',
      requiredColor: '',
      urgency: '',
      printSizeX: '',
      printSizeY: '',
      amsRequired: false,
      compatiblePrinterIds: []
    });
    setShowAddModal(false);
  };

  const urgencyOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
  const sortedQueue = [...printQueue].sort((a, b) => {
    if (sortBy === 'urgency') {
      return (urgencyOrder[a.urgency] || 999) - (urgencyOrder[b.urgency] || 999);
    }
    return 0;
  });

  const handlePrinterToggle = (printerId) => {
    setFormData(prev => {
      const ids = prev.compatiblePrinterIds || [];
      const newIds = ids.includes(printerId)
        ? ids.filter(id => id !== printerId)
        : [...ids, printerId];
      return { ...prev, compatiblePrinterIds: newIds };
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Print Queue</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add New Job
        </button>
      </div>

      {printQueue.length > 0 && (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded"
          >
            <option value="urgency">Urgency</option>
            <option value="name">Name</option>
          </select>
        </div>
      )}

      {printQueue.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No print jobs in queue. Click "Add New Job" to get started.</p>
      ) : (
        <div className="space-y-4">
          {sortedQueue.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">{job.name}</h3>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                      {job.url}
                    </a>
                  )}
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  job.urgency === 'High' ? 'bg-red-100 text-red-800' :
                  job.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {job.urgency || 'Unknown'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Print Time:</span>
                  <p className="font-medium">{job.printTime_hr}h</p>
                </div>
                <div>
                  <span className="text-gray-600">Filament:</span>
                  <p className="font-medium">{job.filamentUsage_g}g</p>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-medium">{job.requiredType || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Color:</span>
                  <p className="font-medium">{job.requiredColor || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Size:</span>
                  <p className="font-medium">{job.printSizeX}x{job.printSizeY}mm</p>
                </div>
                <div>
                  <span className="text-gray-600">AMS:</span>
                  <p className="font-medium">{job.amsRequired ? 'Required' : 'Not required'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Navigate to scheduler and pass job
                    window.location.hash = `#scheduler/${job.id}`;
                  }}
                  className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Send to Scheduler
                </button>
                <button
                  onClick={() => context.deletePrintJob(job.id)}
                  className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete
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
            name: '',
            url: '',
            printTime_hr: '',
            filamentUsage_g: '',
            requiredType: '',
            requiredColor: '',
            urgency: '',
            printSizeX: '',
            printSizeY: '',
            amsRequired: false,
            compatiblePrinterIds: []
          });
        }}
        title="Add New Print Job"
        onConfirm={handleAddJob}
        confirmText="Add Job"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Job Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Benchy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Print Time (hours) *</label>
              <input
                type="number"
                step="0.25"
                value={formData.printTime_hr}
                onChange={(e) => setFormData({ ...formData, printTime_hr: e.target.value })}
                placeholder="1.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filament Usage (g) *</label>
              <input
                type="number"
                value={formData.filamentUsage_g}
                onChange={(e) => setFormData({ ...formData, filamentUsage_g: e.target.value })}
                placeholder="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DatalistInput
              label="Type"
              value={formData.requiredType}
              onChange={(val) => setFormData({ ...formData, requiredType: val })}
              options={dropdownOptions.types}
              category="types"
            />
            <DatalistInput
              label="Color"
              value={formData.requiredColor}
              onChange={(val) => setFormData({ ...formData, requiredColor: val })}
              options={dropdownOptions.colors}
              category="colors"
            />
          </div>

          <DatalistInput
            label="Urgency"
            value={formData.urgency}
            onChange={(val) => setFormData({ ...formData, urgency: val })}
            options={dropdownOptions.urgencies}
            category="urgencies"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Print Size X (mm)</label>
              <input
                type="number"
                value={formData.printSizeX}
                onChange={(e) => setFormData({ ...formData, printSizeX: e.target.value })}
                placeholder="40"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Print Size Y (mm)</label>
              <input
                type="number"
                value={formData.printSizeY}
                onChange={(e) => setFormData({ ...formData, printSizeY: e.target.value })}
                placeholder="31"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="amsRequired"
              checked={formData.amsRequired}
              onChange={(e) => setFormData({ ...formData, amsRequired: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="amsRequired" className="ml-2 text-sm font-medium">
              AMS Required
            </label>
          </div>

          {printers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Compatible Printers (leave empty for any)</label>
              <div className="space-y-2 border border-gray-300 rounded p-3">
                {printers.map(printer => (
                  <div key={printer.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`printer_${printer.id}`}
                      checked={formData.compatiblePrinterIds.includes(printer.id)}
                      onChange={() => handlePrinterToggle(printer.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor={`printer_${printer.id}`} className="ml-2 text-sm">
                      {printer.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
