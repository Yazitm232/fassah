import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import SpacePopup from './components/SpacePopup';
import SubmitSpaceForm from './components/SubmitSpaceForm';
import BottomNav from './BottomNav';
import PrayerTimes from './PrayerTimes';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import { fetchVerifiedSpaces, Space } from './lib/supabase';
 
export default function App() {
  const [activePage, setActivePage] = useState('map');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page && ['map','prayer','leaderboard','settings'].includes(page)) {
      setActivePage(page);
    }
    loadSpaces();
  }, []);
 
  const handleNavigate = (page: string) => {
    setActivePage(page);
    const url = new URL(window.location.href);
    if (page === 'map') url.searchParams.delete('page');
    else url.searchParams.set('page', page);
    window.history.pushState({}, '', url.toString());
  };
 
  const loadSpaces = async () => {
    setIsLoading(true);
    try { const data = await fetchVerifiedSpaces(); setSpaces(data); } catch {}
    setIsLoading(false);
  };
 
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearchQuery(searchInput); };
 
  const filters = ['All','Outdoor','Multi-faith','Business','Mosque'];
 
  const filteredSpaces = spaces.filter(s => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Outdoor') return s.type.toLowerCase().includes('outdoor');
    if (activeFilter === 'Multi-faith') return s.type.toLowerCase().includes('multi');
    if (activeFilter === 'Business') return s.type.toLowerCase().includes('business');
    if (activeFilter === 'Mosque') return s.type.toLowerCase().includes('mosque');
    return true;
  });
 
  const blue = '#1255A0';
  const bluePale = '#EBF4FF';
  const textMid = '#3D5A7A';
  const textLight = '#7A9BBF';
 
  return (
    <div style={{ minHeight: '100vh', background: '#F6FAFE', fontFamily: 'system-ui, sans-serif' }}>
 
      {activePage === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ background: `linear-gradient(135deg, ${blue}, #2B7FD4)`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: 1 }}>FASSAH</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>Find your space to pray</span>
            </div>
            <button onClick={() => setShowSubmitForm(true)} style={{ background: 'white', color: blue, border: 'none', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add Space</button>
          </div>
 
          <div style={{ padding: '12px 16px', background: 'white', borderBottom: '1px solid #EDF3FB', flexShrink: 0 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search postcode, area or university..." style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #D4E6F5', fontSize: 14, fontFamily: 'system-ui', outline: 'none' }} />
              <button type="submit" style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: blue, color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Go</button>
            </form>
          </div>
 
          <div style={{ padding: '10px 16px', display: 'flex', gap: 8, borderBottom: '1px solid #EDF3FB', flexWrap: 'wrap' as const, background: 'white', flexShrink: 0 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'system-ui', background: activeFilter === f ? blue : bluePale, color: activeFilter === f ? 'white' : textMid }}>{f}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: textLight, alignSelf: 'center' }}>{filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''}</span>
          </div>
 
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bluePale }}>
                <p style={{ color: textMid, fontSize: 15 }}>Loading prayer spaces...</p>
              </div>
            ) : (
              <MapView spaces={filteredSpaces} onSpaceClick={setSelectedSpace} searchQuery={searchQuery} />
            )}
          </div>
 
          <div style={{ background: 'linear-gradient(90deg,#EBF4FF,#DCF0FF)', borderTop: '1px solid #C4DEFA', padding: '10px 20px 74px', display: 'flex', gap: 20, flexShrink: 0, flexWrap: 'wrap' as const }}>
            {[{n:'247',l:'Spaces'},{n:'1,840',l:'Check-ins'},{n:'12',l:'Cities'}].map(s => (
              <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: blue }}>{s.n}</span>
                <span style={{ fontSize: 11, color: textMid }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {activePage === 'prayer' && <div style={{ paddingTop: 16 }}><PrayerTimes /></div>}
      {activePage === 'leaderboard' && <div style={{ paddingTop: 16 }}><Leaderboard /></div>}
      {activePage === 'settings' && <div style={{ paddingTop: 16 }}><Settings /></div>}
 
      <BottomNav activePage={activePage} onNavigate={handleNavigate} />
 
      {selectedSpace && <SpacePopup space={selectedSpace} onClose={() => setSelectedSpace(null)} />}
      {showSubmitForm && <SubmitSpaceForm onClose={() => setShowSubmitForm(false)} onSuccess={loadSpaces} />}
    </div>
  );
}
 
