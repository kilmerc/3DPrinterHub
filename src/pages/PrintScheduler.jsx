import { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Modal } from '../components/Modal';

export const PrintScheduler = () => {
  const context = useContext(AppContext);
  const { printers, filaments, printQueue, interventionTimes } = context.state;

  const [draggedJob, setDraggedJob] = useState(null);
  const [showValidationError, setShowValidationError] = useState('');
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    filamentId: '',
    bufferHr: 0.25
  });

  const queuedJobs = printQueue.filter(j => j.status === 'Queued' || !j.status);
  const scheduledJobs = printQueue.filter(j => j.status === 'Scheduled');

  const validateJobForPrinter = (job, printer) => {
    // 1. Printer Match
    if (job.compatiblePrinterIds && job.compatiblePrinterIds.length > 0) {
      if (!job.compatiblePrinterIds.includes(printer.id)) {
        return 'This printer is not compatible with this job';
      }
    }

    // 2. AMS Match
    if (job.amsRequired && !printer.hasAMS) {
      return 'This job requires AMS, but the printer does not have AMS';
    }

    // 3. Bed Size Match
    if (job.printSizeX && job.printSizeY) {
      if (job.printSizeX > printer.bedSizeX || job.printSizeY > printer.bedSizeY) {
        // Check if rotated fit
        if (!(job.printSizeX <= printer.bedSizeY && job.printSizeY <= printer.bedSizeX)) {
          return `Print size (${job.printSizeX}x${job.printSizeY}mm) exceeds bed size (${printer.bedSizeX}x${printer.bedSizeY}mm)`;
        }
      }
    }

    return null;
  };

  const handleDragStart = (job) => {
    setDraggedJob(job);
    setShowValidationError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (printer) => {
    if (!draggedJob) return;

    const validationError = validateJobForPrinter(draggedJob, printer);
    if (validationError) {
      setShowValidationError(validationError);
      setTimeout(() => setShowValidationError(''), 3000);
      setDraggedJob(null);
      return;
    }

    setPendingAssignment({ job: draggedJob, printer });
    setShowInterventionModal(true);
    setDraggedJob(null);
  };

  const handleInterventionChoice = (choice) => {
    // choice: 'START' or 'FINISH'
    setPendingAssignment(prev => ({
      ...prev,
      interventionChoice: choice
    }));
    setShowInterventionModal(false);
    setShowAssignmentModal(true);
  };

  const handleConfirmAssignment = () => {
    if (!assignmentData.filamentId) {
      alert('Please select a filament');
      return;
    }

    const { job, printer } = pendingAssignment;
    context.updatePrintJob(job.id, {
      status: 'Scheduled',
      assignedPrinterId: printer.id,
      assignedFilamentId: assignmentData.filamentId,
      buffer_hr: Number(assignmentData.bufferHr)
    });

    context.updatePrinter(printer.id, { status: 'Printing' });

    setShowAssignmentModal(false);
    setAssignmentData({ filamentId: '', bufferHr: 0.25 });
    setPendingAssignment(null);
  };

  const handleStartPrint = (job) => {
    context.updatePrintJob(job.id, { status: 'Printing' });
  };

  const handleCompletePrint = (job) => {
    if (!job.assignedFilamentId) {
      alert('No filament assigned to this job');
      return;
    }

    // Deduct filament
    const filament = filaments.find(f => f.id === job.assignedFilamentId);
    if (filament) {
      const newRemaining = filament.remaining_g - job.filamentUsage_g;
      context.updateFilament(filament.id, { remaining_g: Math.max(0, newRemaining) });
    }

    // Update job and printer
    context.updatePrintJob(job.id, { status: 'Completed' });
    if (job.assignedPrinterId) {
      context.updatePrinter(job.assignedPrinterId, { status: 'Idle' });
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Print Complete', { body: `${job.name} has finished printing!` });
    }
  };

  const getCompatibleFilaments = (job) => {
    if (!job.requiredType && !job.requiredColor) {
      return filaments;
    }
    return filaments.filter(f => {
      const typeMatch = !job.requiredType || f.type === job.requiredType;
      const colorMatch = !job.requiredColor || f.color === job.requiredColor;
      return typeMatch && colorMatch;
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Print Scheduler</h1>

      {showValidationError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded">
          {showValidationError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Queue Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-6">
            <h2 className="font-bold text-lg mb-4">Queue</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {queuedJobs.length === 0 ? (
                <p className="text-gray-500 text-sm">No jobs in queue</p>
              ) : (
                queuedJobs.map(job => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={() => handleDragStart(job)}
                    className="p-2 bg-blue-100 border-l-4 border-blue-500 rounded cursor-move hover:bg-blue-200 text-sm"
                  >
                    <p className="font-medium">{job.name}</p>
                    <p className="text-xs text-gray-600">{job.printTime_hr}h</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Timeline / Printers */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold text-lg mb-4">Printer Schedule</h2>

            {printers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No printers configured. Add printers in Settings.</p>
            ) : (
              <div className="space-y-4">
                {printers.map(printer => (
                  <div key={printer.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-lg">{printer.name}</h3>
                      <span className={`px-3 py-1 rounded text-sm ${
                        printer.status === 'Idle' ? 'bg-green-100 text-green-800' :
                        printer.status === 'Printing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {printer.status || 'Idle'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Bed Size:</span>
                        <p className="font-medium">{printer.bedSizeX}x{printer.bedSizeY}mm</p>
                      </div>
                      <div>
                        <span className="text-gray-600">AMS:</span>
                        <p className="font-medium">{printer.hasAMS ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(printer)}
                      className="border-2 border-dashed border-gray-300 rounded p-4 min-h-20 bg-gray-50 hover:bg-gray-100"
                    >
                      <p className="text-gray-400 text-center text-sm mb-3">Drop job here</p>

                      {/* Show scheduled jobs for this printer */}
                      <div className="space-y-2">
                        {scheduledJobs
                          .filter(j => j.assignedPrinterId === printer.id)
                          .map(job => (
                            <div key={job.id} className="bg-blue-500 text-white p-3 rounded">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium">{job.name}</p>
                                  <p className="text-sm opacity-90">{job.printTime_hr}h • {job.filamentUsage_g}g</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  job.status === 'Printing' ? 'bg-yellow-500 text-yellow-900' :
                                  job.status === 'Completed' ? 'bg-green-500 text-green-900' :
                                  'bg-blue-600'
                                }`}>
                                  {job.status}
                                </span>
                              </div>

                              <div className="mt-2 flex gap-1 text-xs">
                                {job.status === 'Scheduled' && (
                                  <button
                                    onClick={() => handleStartPrint(job)}
                                    className="flex-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                  >
                                    Start
                                  </button>
                                )}
                                {job.status === 'Printing' && (
                                  <button
                                    onClick={() => handleCompletePrint(job)}
                                    className="flex-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Intervention Times Display */}
      {interventionTimes.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">Intervention Times</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {interventionTimes.map(time => (
              <div key={time.id} className="border rounded p-3 text-sm">
                <p className="font-medium">{time.name}</p>
                <p className="text-gray-600">{time.time}</p>
                <p className="text-xs text-gray-500">
                  {time.days.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intervention Modal */}
      <Modal
        isOpen={showInterventionModal}
        onClose={() => {
          setShowInterventionModal(false);
          setPendingAssignment(null);
        }}
        title="Schedule Relative to Intervention"
      >
        {pendingAssignment && (
          <div>
            <p className="mb-4 text-gray-700">
              How would you like to schedule <strong>{pendingAssignment.job.name}</strong> relative to an intervention time?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleInterventionChoice('FINISH')}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-left"
              >
                <p className="font-medium">Option 1: FINISH at Intervention Time</p>
                <p className="text-sm opacity-90">Job will finish at the selected intervention time</p>
              </button>
              <button
                onClick={() => handleInterventionChoice('START')}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-left"
              >
                <p className="font-medium">Option 2: START at Intervention Time</p>
                <p className="text-sm opacity-90">Job will start at the selected intervention time</p>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setAssignmentData({ filamentId: '', bufferHr: 0.25 });
          setPendingAssignment(null);
        }}
        title="Assign Filament"
        onConfirm={handleConfirmAssignment}
        confirmText="Assign"
      >
        {pendingAssignment && (
          <div className="space-y-4">
            <p className="text-gray-700 font-medium">
              Assigning <strong>{pendingAssignment.job.name}</strong> to <strong>{pendingAssignment.printer.name}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">Select Filament</label>
              <select
                value={assignmentData.filamentId}
                onChange={(e) => setAssignmentData({ ...assignmentData, filamentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a filament --</option>
                {getCompatibleFilaments(pendingAssignment.job).map(fil => (
                  <option key={fil.id} value={fil.id}>
                    {fil.brand} - {fil.type} - {fil.color} ({fil.remaining_g}g remaining)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Buffer Time (hours)</label>
              <input
                type="number"
                step="0.25"
                value={assignmentData.bufferHr}
                onChange={(e) => setAssignmentData({ ...assignmentData, bufferHr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
