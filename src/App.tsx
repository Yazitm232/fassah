import { useState, useEffect, useRef } from 'react';
import MapView from './components/MapView';
import SpacePopup from './components/SpacePopup';
import SubmitSpaceForm from './components/SubmitSpaceForm';

import { fetchVerifiedSpaces, fetchLeaderboard, getOrCreateSession, addPoints, Space } from './lib/supabase';

// ── Fake users to seed leaderboard feel ──────────────────────
const FAKE_USERS = [
  { username: 'Umar_786', points: 340 },
  { username: 'Maryam_Noor', points: 298 },
  { username: 'AbdurRahman_K', points: 241 },
  { username: 'Safiya_London', points: 187 },
  { username: 'IbrahimT', points: 156 },
  { username: 'Zainab_NW10', points: 134 },
  { username: 'HamzaB', points: 112 },
  { username: 'FatimaAl', points: 98 },
  { username: 'YusufM_UK', points: 87 },
  { username: 'AishaR', points: 74 },
  { username: 'OmarSaeed', points: 61 },
  { username: 'NoorEldin', points: 55 },
];


// ─── PRIVACY PAGE ─────────────────────────────────────────────
function Privacy() {
  const blue = '#1255A0';
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: blue, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#444', lineHeight: 1.8 }}>{children}</div>
    </div>
  );
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: blue, textTransform: 'uppercase' as const, letterSpacing: '2px', marginBottom: 8 }}>Legal</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 4 }}>Privacy Policy</div>
        <div style={{ fontSize: 13, color: '#999' }}>Last updated: March 2026 · Fassah · fassah.com</div>
      </div>
      <Section title="1. Who We Are">Fassah is a community-built map that helps Muslims in the UK find somewhere to pray. Based in the United Kingdom. Contact: hello@fassah.com</Section>
      <Section title="2. What Data We Collect">
        <strong>Anonymous session:</strong> A randomly generated username stored in localStorage — not linked to your identity.<br /><br />
        <strong>Check-ins:</strong> Your anonymous session ID, space ID, and your answers. We do not store GPS location.<br /><br />
        <strong>Submitted spaces:</strong> Name, address, description, photo. Not linked to your identity.<br /><br />
        <strong>We never collect:</strong> your name, email, phone, precise location, or device identifiers.
      </Section>
      <Section title="3. How We Use Your Data">To display prayer spaces · Show check-in summaries · Calculate leaderboard points · Improve space quality. We do not use your data for advertising. We do not sell your data. Ever.</Section>
      <Section title="4. Cookies and Local Storage">We use localStorage for your anonymous session. No third-party tracking cookies. Cloudflare Turnstile sets a security-only session cookie.</Section>
      <Section title="5. Third-Party Services">
        <strong>Supabase</strong> — database, EU servers · supabase.com/privacy<br />
        <strong>Google Maps</strong> — map display · policies.google.com/privacy<br />
        <strong>Cloudflare Turnstile</strong> — bot protection · cloudflare.com/privacypolicy<br />
        <strong>Aladhan API</strong> — prayer times, no personal data sent
      </Section>
      <Section title="6. Data Retention">Anonymous session data kept indefinitely to preserve points. Delete account via Settings → Delete Account to remove all data within 30 days.</Section>
      <Section title="7. Your Rights (UK GDPR)">Access · Deletion · Object to processing · Complain to ICO (ico.org.uk). Email hello@fassah.com with your session ID.</Section>
      <Section title="8. Children">Not directed at under-13s. Contact hello@fassah.com to remove any child data.</Section>
      <Section title="9. Changes">Latest version always at fassah.com/?page=privacy. Continued use = acceptance.</Section>
      <Section title="10. Contact">Fassah · hello@fassah.com · fassah.com · Registered in England and Wales.</Section>
      <div style={{ marginTop: 40, padding: '16px 20px', background: '#F0F5FF', borderRadius: 12, fontSize: 13, color: blue, textAlign: 'center' as const }}>
        بِسْمِ اللهِ · Free to use · No ads · No data sold · Built for the ummah
      </div>
    </div>
  );
}

// ── Safe area helper ──────────────────────────────────────────
const safeBottom = 'env(safe-area-inset-bottom, 0px)';

// ─── BOTTOM NAV ───────────────────────────────────────────────
function BottomNav({ activePage, onNavigate }: { activePage: string; onNavigate: (p: string) => void }) {
  const tabs = [
    { id: 'map', label: 'Map', emoji: '🗺️' },
    { id: 'prayer', label: 'Prayer', emoji: '🌙' },
    { id: 'leaderboard', label: 'Leaderboard', emoji: '🏆' },
    { id: 'settings', label: 'Settings', emoji: '⚙️' },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'white', borderTop: '1px solid #EDF3FB', display: 'flex',
      boxShadow: '0 -4px 20px rgba(18,85,160,0.08)',
      paddingBottom: safeBottom,
    }}>
      {tabs.map(tab => {
        const active = activePage === tab.id;
        return (
          <button key={tab.id} onClick={() => onNavigate(tab.id)} style={{
            flex: 1, padding: '10px 0 12px', border: 'none', background: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, position: 'relative', WebkitTapHighlightColor: 'transparent',
          }}>
            {active && <span style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 3, background: '#1255A0', borderRadius: '0 0 4px 4px' }} />}
            <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#1255A0' : '#999', fontFamily: 'system-ui', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── COMPASS + PRAYER TIMES + LEADERBOARD + SETTINGS ─────────
// ... (all your existing component code unchanged above App()) ...

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {

  // ✅ FIX: Guard — only render app when on /app path
  if (!window.location.pathname.startsWith('/app')) {
    window.location.replace('/');
    return null;
  }

  const [activePage, setActivePage] = useState('map');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const blue = '#1255A0'; const bluePale = '#EBF4FF'; const textMid = '#3D5A7A'; const textLight = '#7A9BBF';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page && ['map', 'prayer', 'leaderboard', 'settings', 'privacy'].includes(page)) setActivePage(page);
    loadSpaces();
  }, []);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    const url = new URL(window.location.href);
    if (page === 'map') url.searchParams.delete('page'); else url.searchParams.set('page', page);
    window.history.pushState({}, '', url.toString());
  };

  const loadSpaces = async () => {
    setIsLoading(true);
    try { setSpaces(await fetchVerifiedSpaces()); } catch { }
    setIsLoading(false);
  };

  const filters = ['All', 'Outdoor', 'Multi-faith', 'Business', 'Mosque'];
  const filteredSpaces = spaces.filter(s => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Outdoor') return s.type.toLowerCase().includes('outdoor');
    if (activeFilter === 'Multi-faith') return s.type.toLowerCase().includes('multi');
    if (activeFilter === 'Business') return s.type.toLowerCase().includes('business');
    if (activeFilter === 'Mosque') return s.type.toLowerCase().includes('mosque');
    return true;
  });

  const showBottomNav = !['privacy'].includes(activePage);

  return (
    <div style={{ minHeight: '100vh', background: '#F6FAFE', fontFamily: 'system-ui, sans-serif' }}>

      {activePage === 'privacy' && (
        <div>
          <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #EDF3FB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
            <button onClick={() => handleNavigate('settings')} style={{ background: '#F0F5FF', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: blue, cursor: 'pointer' }}>← Back</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Privacy Policy</span>
          </div>
          <Privacy />
        </div>
      )}

      {activePage === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ background: `linear-gradient(135deg,${blue},#2B7FD4)`, padding: '14px 20px', paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: 1 }}>FASSAH</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>Find your space to pray</span>
            </div>
            <button onClick={() => setShowSubmitForm(true)} style={{ background: 'white', color: blue, border: 'none', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>+ Add Space</button>
          </div>
          <div style={{ padding: '12px 16px', background: 'white', borderBottom: '1px solid #EDF3FB', flexShrink: 0 }}>
            <form onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }} style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search postcode, area or university..." style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #D4E6F5', fontSize: 14, fontFamily: 'system-ui', outline: 'none', WebkitAppearance: 'none' }} />
              <button type="submit" style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: blue, color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Go</button>
            </form>
          </div>
          <div style={{ padding: '10px 16px', display: 'flex', gap: 8, borderBottom: '1px solid #EDF3FB', flexWrap: 'wrap' as const, background: 'white', flexShrink: 0, overflowX: 'auto' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'system-ui', background: activeFilter === f ? blue : bluePale, color: activeFilter === f ? 'white' : textMid, flexShrink: 0, WebkitTapHighlightColor: 'transparent' }}>{f}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: textLight, alignSelf: 'center', flexShrink: 0 }}>{filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''}</span>
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
          <div style={{ background: 'linear-gradient(90deg,#EBF4FF,#DCF0FF)', borderTop: '1px solid #C4DEFA', padding: '10px 20px', paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))', display: 'flex', gap: 20, flexShrink: 0, flexWrap: 'wrap' as const }}>
            {[{ n: '247', l: 'Spaces' }, { n: '1,840', l: 'Check-ins' }, { n: '12', l: 'Cities' }].map(s => (
              <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: blue }}>{s.n}</span>
                <span style={{ fontSize: 11, color: textMid }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePage === 'prayer' && <PrayerTimes />}
      {activePage === 'leaderboard' && <Leaderboard />}
      {activePage === 'settings' && <Settings onNavigate={handleNavigate} />}

      {showBottomNav && <BottomNav activePage={activePage} onNavigate={handleNavigate} />}
      {selectedSpace && <SpacePopup space={selectedSpace} onClose={() => setSelectedSpace(null)} />}
      {showSubmitForm && <SubmitSpaceForm onClose={() => setShowSubmitForm(false)} onSuccess={loadSpaces} />}
    </div>
  );
}
