import { useState, useContext, useEffect } from 'react';
import { AppContext } from './contexts/AppContext';
import { ImportModal } from './components/ImportModal';
import { FilamentInventory } from './pages/FilamentInventory';
import { PrintQueue } from './pages/PrintQueue';
import { PrintScheduler } from './pages/PrintScheduler';
import { Settings } from './pages/Settings';

function App() {
  const context = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState('filament');
  const [showImportModal, setShowImportModal] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Check if we need to show import modal on first load
  useEffect(() => {
    if (!hasLoadedData && context.state.printers.length === 0 && context.state.filaments.length === 0) {
      setShowImportModal(true);
    }
    setHasLoadedData(true);
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const pages = {
    filament: { title: 'Filament Inventory', component: FilamentInventory },
    queue: { title: 'Print Queue', component: PrintQueue },
    scheduler: { title: 'Print Scheduler', component: PrintScheduler },
    settings: { title: 'Settings', component: Settings }
  };

  const CurrentPage = pages[currentPage]?.component || FilamentInventory;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">🖨️ 3D Print Hub</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(pages).map(([key, page]) => (
              <button
                key={key}
                onClick={() => setCurrentPage(key)}
                className={`px-4 py-2 rounded font-medium transition ${
                  currentPage === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <CurrentPage />
      </main>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => setShowImportModal(false)}
      />
    </div>
  );
}

export default App;
