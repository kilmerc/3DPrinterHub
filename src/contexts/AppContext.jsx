import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    printers: [],
    filaments: [],
    printQueue: [],
    interventionTimes: [],
    dropdownOptions: {
      brands: ['Overture', 'Sunlu', 'Hatchbox'],
      types: ['PLA', 'PETG', 'ABS', 'TPU'],
      colors: ['Black', 'White', 'Space Gray', 'Red', 'Blue', 'Green'],
      urgencies: ['Low', 'Medium', 'High']
    }
  });

  // Printer functions
  const addPrinter = (printer) => {
    const newPrinter = {
      ...printer,
      id: `printer_${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      printers: [...prev.printers, newPrinter]
    }));
    return newPrinter;
  };

  const updatePrinter = (id, updates) => {
    setState(prev => ({
      ...prev,
      printers: prev.printers.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deletePrinter = (id) => {
    setState(prev => ({
      ...prev,
      printers: prev.printers.filter(p => p.id !== id)
    }));
  };

  // Filament functions
  const addFilament = (filament) => {
    const newFilament = {
      ...filament,
      id: `fila_${Date.now()}`,
      remaining_g: filament.initialFilamentWeight_g
    };
    setState(prev => ({
      ...prev,
      filaments: [...prev.filaments, newFilament]
    }));
    return newFilament;
  };

  const updateFilament = (id, updates) => {
    setState(prev => ({
      ...prev,
      filaments: prev.filaments.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const deleteFilament = (id) => {
    setState(prev => ({
      ...prev,
      filaments: prev.filaments.filter(f => f.id !== id)
    }));
  };

  // Print Queue functions
  const addPrintJob = (job) => {
    const newJob = {
      ...job,
      id: `job_${Date.now()}`,
      status: 'Queued'
    };
    setState(prev => ({
      ...prev,
      printQueue: [...prev.printQueue, newJob]
    }));
    return newJob;
  };

  const updatePrintJob = (id, updates) => {
    setState(prev => ({
      ...prev,
      printQueue: prev.printQueue.map(j => j.id === id ? { ...j, ...updates } : j)
    }));
  };

  const deletePrintJob = (id) => {
    setState(prev => ({
      ...prev,
      printQueue: prev.printQueue.filter(j => j.id !== id)
    }));
  };

  // Intervention Times functions
  const addInterventionTime = (time) => {
    const newTime = {
      ...time,
      id: `time_${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      interventionTimes: [...prev.interventionTimes, newTime]
    }));
    return newTime;
  };

  const updateInterventionTime = (id, updates) => {
    setState(prev => ({
      ...prev,
      interventionTimes: prev.interventionTimes.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const deleteInterventionTime = (id) => {
    setState(prev => ({
      ...prev,
      interventionTimes: prev.interventionTimes.filter(t => t.id !== id)
    }));
  };

  // Dropdown options functions
  const addDropdownOption = (category, value) => {
    if (category && value && !state.dropdownOptions[category]?.includes(value)) {
      setState(prev => ({
        ...prev,
        dropdownOptions: {
          ...prev.dropdownOptions,
          [category]: [...(prev.dropdownOptions[category] || []), value]
        }
      }));
    }
  };

  // Load state from imported data
  const loadState = (data) => {
    setState(data);
  };

  // Get current state
  const getState = () => state;

  const value = {
    state,
    addPrinter,
    updatePrinter,
    deletePrinter,
    addFilament,
    updateFilament,
    deleteFilament,
    addPrintJob,
    updatePrintJob,
    deletePrintJob,
    addInterventionTime,
    updateInterventionTime,
    deleteInterventionTime,
    addDropdownOption,
    loadState,
    getState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
