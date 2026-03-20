import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Header from './components/Header';
import MapView from './components/MapView';
import SpacePopup from './components/SpacePopup';
import SubmitSpaceForm from './components/SubmitSpaceForm';
import { fetchVerifiedSpaces, checkInToSpace, Space } from './lib/supabase';

function App() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    setIsLoading(true);
    const data = await fetchVerifiedSpaces();
    setSpaces(data);
    setIsLoading(false);
  };

  const handleCheckIn = async (spaceId: string) => {
    const success = await checkInToSpace(spaceId);
    if (success) {
      await loadSpaces();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddSpace={() => setShowSubmitForm(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by area or postcode"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            />
          </div>
        </form>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading prayer spaces...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No prayer spaces found yet.</p>
            <button
              onClick={() => setShowSubmitForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Be the first to add one!
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <MapView
              spaces={spaces}
              onSpaceClick={setSelectedSpace}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </main>

      {selectedSpace && (
        <SpacePopup
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
          onCheckIn={handleCheckIn}
        />
      )}

      {showSubmitForm && (
        <SubmitSpaceForm
          onClose={() => setShowSubmitForm(false)}
          onSuccess={() => {
            loadSpaces();
          }}
        />
      )}
    </div>
  );
}

export default App;
