import { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Modal } from '../components/Modal';
import { useFileHandler } from '../hooks/useFileHandler';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Settings = () => {
  const context = useContext(AppContext);
  const { exportData } = useFileHandler();
  const { printers, interventionTimes } = context.state;

  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [printerForm, setPrinterForm] = useState({
    name: '',
    bedSizeX: '',
    bedSizeY: '',
    hasAMS: false
  });
  const [interventionForm, setInterventionForm] = useState({
    name: '',
    time: '12:00',
    days: [1, 2, 3, 4, 5] // Mon-Fri
  });

  const handleAddPrinter = () => {
    if (!printerForm.name || !printerForm.bedSizeX || !printerForm.bedSizeY) {
      alert('Please fill in all required fields');
      return;
    }

    context.addPrinter({
      ...printerForm,
      status: 'Idle',
      bedSizeX: Number(printerForm.bedSizeX),
      bedSizeY: Number(printerForm.bedSizeY)
    });

    setPrinterForm({
      name: '',
      bedSizeX: '',
      bedSizeY: '',
      hasAMS: false
    });
    setShowPrinterModal(false);
  };

  const handleAddInterventionTime = () => {
    if (!interventionForm.name || !interventionForm.time) {
      alert('Please fill in all fields');
      return;
    }

    if (interventionForm.days.length === 0) {
      alert('Please select at least one day');
      return;
    }

    context.addInterventionTime({
      ...interventionForm
    });

    setInterventionForm({
      name: '',
      time: '12:00',
      days: [1, 2, 3, 4, 5]
    });
    setShowInterventionModal(false);
  };

  const handleDayToggle = (dayIndex) => {
    setInterventionForm(prev => ({
      ...prev,
      days: prev.days.includes(dayIndex)
        ? prev.days.filter(d => d !== dayIndex)
        : [...prev.days, dayIndex]
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Printer Management */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Printers</h2>
            <button
              onClick={() => setShowPrinterModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Printer
            </button>
          </div>

          {printers.length === 0 ? (
            <p className="text-gray-500">No printers configured yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {printers.map(printer => (
                <div key={printer.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold mb-2">{printer.name}</h3>
                  <div className="space-y-1 text-sm mb-3">
                    <p><span className="text-gray-600">Bed Size:</span> {printer.bedSizeX}x{printer.bedSizeY}mm</p>
                    <p><span className="text-gray-600">AMS:</span> {printer.hasAMS ? 'Yes' : 'No'}</p>
                    <p><span className="text-gray-600">Status:</span> {printer.status || 'Idle'}</p>
                  </div>
                  <button
                    onClick={() => context.deletePrinter(printer.id)}
                    className="w-full px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Intervention Times */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Intervention Times</h2>
            <button
              onClick={() => setShowInterventionModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Intervention Time
            </button>
          </div>

          {interventionTimes.length === 0 ? (
            <p className="text-gray-500">No intervention times configured yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interventionTimes.map(time => (
                <div key={time.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                  <h3 className="text-lg font-bold mb-2">{time.name}</h3>
                  <div className="space-y-1 text-sm mb-3">
                    <p><span className="text-gray-600">Time:</span> {time.time}</p>
                    <p><span className="text-gray-600">Days:</span></p>
                    <p className="text-xs">
                      {time.days.map(d => days[d]).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => context.deleteInterventionTime(time.id)}
                    className="w-full px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Data Management</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-700 mb-4">
              Export your 3D Print Hub data to a JSON file. You can import this file to restore your data later.
            </p>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Export Data
            </button>
          </div>
        </section>
      </div>

      {/* Printer Modal */}
      <Modal
        isOpen={showPrinterModal}
        onClose={() => {
          setShowPrinterModal(false);
          setPrinterForm({
            name: '',
            bedSizeX: '',
            bedSizeY: '',
            hasAMS: false
          });
        }}
        title="Add New Printer"
        onConfirm={handleAddPrinter}
        confirmText="Add Printer"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Printer Name *</label>
            <input
              type="text"
              value={printerForm.name}
              onChange={(e) => setPrinterForm({ ...printerForm, name: e.target.value })}
              placeholder="e.g., Ender 3 Pro"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bed Size X (mm) *</label>
              <input
                type="number"
                value={printerForm.bedSizeX}
                onChange={(e) => setPrinterForm({ ...printerForm, bedSizeX: e.target.value })}
                placeholder="220"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bed Size Y (mm) *</label>
              <input
                type="number"
                value={printerForm.bedSizeY}
                onChange={(e) => setPrinterForm({ ...printerForm, bedSizeY: e.target.value })}
                placeholder="220"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasAMS"
              checked={printerForm.hasAMS}
              onChange={(e) => setPrinterForm({ ...printerForm, hasAMS: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="hasAMS" className="ml-2 text-sm font-medium">
              Has AMS
            </label>
          </div>
        </div>
      </Modal>

      {/* Intervention Time Modal */}
      <Modal
        isOpen={showInterventionModal}
        onClose={() => {
          setShowInterventionModal(false);
          setInterventionForm({
            name: '',
            time: '12:00',
            days: [1, 2, 3, 4, 5]
          });
        }}
        title="Add Intervention Time"
        onConfirm={handleAddInterventionTime}
        confirmText="Add Time"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              value={interventionForm.name}
              onChange={(e) => setInterventionForm({ ...interventionForm, name: e.target.value })}
              placeholder="e.g., Lunch"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time (24-hour format) *</label>
            <input
              type="time"
              value={interventionForm.time}
              onChange={(e) => setInterventionForm({ ...interventionForm, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Days</label>
            <div className="grid grid-cols-2 gap-2">
              {days.map((day, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`day_${index}`}
                    checked={interventionForm.days.includes(index)}
                    onChange={() => handleDayToggle(index)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor={`day_${index}`} className="ml-2 text-sm">
                    {day}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
