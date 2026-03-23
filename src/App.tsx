import { useState, useEffect } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import SpacePopup from './components/SpacePopup';
import SubmitSpaceForm from './components/SubmitSpaceForm';
import { fetchVerifiedSpaces, fetchLeaderboard, Space } from './lib/supabase';
 
export default function App() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [leaderboard, setLeaderboard] = useState<{ username: string; points: number }[]>([]);
 
  useEffect(() => {
    loadSpaces();
    loadLeaderboard();
  }, []);
 
  const loadSpaces = async () => {
    setIsLoading(true);
    const data = await fetchVerifiedSpaces();
    setSpaces(data);
    setIsLoading(false);
  };
 
  const loadLeaderboard = async () => {
    const data = await fetchLeaderboard();
    setLeaderboard(data);
  };
 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
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
 
  const rankEmojis = ['🥇', '🥈', '🥉'];
  const rankColors = ['#E8A020', '#B0C4DE', '#CD9B6A'];
  const avis = ['🦁', '🌙', '🌿', '🔥', '🕊️', '⭐', '🌊', '🏔️', '🌸', '✨'];
 
  const blue = '#2B7FD4';
  const blueDark = '#1A5FAA';
  const bluePale = '#EBF4FF';
  const textMid = '#3D5A7A';
  const textLight = '#7A9BBF';
  const gold = '#E8A020';
 
  const steps = [
    { n: '01', h: 'Find a space', p: 'Search by postcode, area or university. Fassah shows you verified prayer spaces near you with live check-in data so you know they are still active.' },
    { n: '02', h: 'Check in', p: 'When you visit a space, tap check in. This keeps the data live for the next person. Your check-in tells them: someone prayed here today.' },
    { n: '03', h: 'Add your spot', p: 'Know a quiet corner or multi-faith room that is not on the map? Submit it in 60 seconds. Every submission helps the whole ummah.' },
  ];
 
  const types = [
    { e: '🌿', n: 'Outdoor', d: 'Parks & open spaces' },
    { e: '🏢', n: 'Multi-faith Room', d: 'Unis & offices' },
    { e: '🏪', n: 'Friendly Business', d: 'Shops & cafes' },
    { e: '🏠', n: 'Community Home', d: 'Open to visitors' },
    { e: '🕌', n: 'Mosque', d: 'Verified masjids' },
  ];
 
  const ajarPoints = [
    { icon: '📍', text: 'Add a verified space and it could help hundreds of Muslims pray on time for years to come.' },
    { icon: '✅', text: 'Check in to confirm a space is still active. Your 2 seconds keeps someone else from wasting 20 minutes.' },
    { icon: '📸', text: 'Add a photo so the next person knows exactly where to go. Clarity is an act of service.' },
    { icon: '🤲', text: 'The Prophet said: Whoever guides someone to goodness will have a reward like the one who did it.' },
  ];
 
  return (
    <div style={{ minHeight: '100vh', background: '#F6FAFE', fontFamily: 'system-ui, sans-serif' }}>
      <Header onAddSpace={() => setShowSubmitForm(true)} />
 
      {/* MAP SECTION */}
      <div style={{ background: '#F6FAFE', paddingTop: '48px' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          background: 'white', borderRadius: '24px 24px 0 0',
          boxShadow: '0 -4px 40px rgba(18,85,160,0.10)',
          overflow: 'hidden',
        }}>
 
          {/* Search bar */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EDF3FB', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1 }}>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by postcode, area or university..."
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: '12px',
                  border: '1.5px solid #D4E6F5', fontSize: '14px',
                  fontFamily: 'system-ui', outline: 'none',
                }}
              />
              <button type="submit" style={{
                padding: '10px 20px', borderRadius: '12px', border: 'none',
                background: blue, color: 'white', fontWeight: 600,
                fontSize: '14px', cursor: 'pointer', fontFamily: 'system-ui',
              }}>Search</button>
            </form>
          </div>
 
          {/* FILTER PILLS — WIRED */}
          <div style={{ padding: '12px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid #EDF3FB', flexWrap: 'wrap' as const }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', border: 'none', fontFamily: 'system-ui',
                background: activeFilter === f ? blue : bluePale,
                color: activeFilter === f ? 'white' : textMid,
                transition: 'all 0.15s',
              }}>{f}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: textLight, alignSelf: 'center' }}>
              {filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''}
            </span>
          </div>
 
          {/* Map */}
          {isLoading ? (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bluePale }}>
              <p style={{ color: textMid, fontSize: '15px' }}>Loading prayer spaces...</p>
            </div>
          ) : (
            <div style={{ height: '400px' }}>
              <MapView spaces={filteredSpaces} onSpaceClick={setSelectedSpace} searchQuery={searchQuery} />
            </div>
          )}
 
          <div style={{
            background: 'linear-gradient(90deg,#EBF4FF,#DCF0FF)',
            borderTop: '1px solid #C4DEFA', padding: '14px 24px',
            display: 'flex', gap: '24px', flexWrap: 'wrap' as const,
          }}>
            {[
              { n: '247', l: 'Verified Spaces' },
              { n: '1,840', l: 'Check-ins' },
              { n: '12', l: 'Cities' },
              { n: '320', l: 'Contributors' },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: blueDark }}>{s.n}</span>
                <span style={{ fontSize: '12px', color: textMid }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* HOW IT WORKS */}
      <div style={{ background: 'white', padding: '100px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: blue, textTransform: 'uppercase' as const, marginBottom: '12px' }}>How it works</div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#0C1B2E', margin: 0 }}>Find your space in 3 steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px' }}>
            {steps.map(s => (
              <div key={s.n}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: textLight, marginBottom: '12px' }}>{s.n}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0C1B2E', margin: '0 0 12px' }}>{s.h}</h3>
                <p style={{ fontSize: '15px', color: textMid, lineHeight: 1.7, margin: 0 }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* SPACE TYPES */}
      <div style={{ background: '#F6FAFE', padding: '100px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: blue, textTransform: 'uppercase' as const, marginBottom: '12px' }}>Space types</div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#0C1B2E', margin: 0 }}>Every kind of space counts</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
            {types.map(t => (
              <div key={t.n} style={{ background: 'white', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(18,85,160,0.06)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{t.e}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0C1B2E', marginBottom: '4px' }}>{t.n}</div>
                <div style={{ fontSize: '12px', color: textLight }}>{t.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* AJAR / LEADERBOARD — REAL DATA */}
      <div style={{ background: 'linear-gradient(170deg,#0A1628 0%,#0F2545 60%,#152E52 100%)', padding: '100px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Earn ajar</div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'white', margin: '0 0 16px', lineHeight: 1.2 }}>
              Every contribution is<br />
              <span style={{ color: gold }}>sadaqah jariyah</span>
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 40px' }}>
              Continuous charity — rewards that flow even after you have moved on.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
              {ajarPoints.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px', marginTop: '2px' }}>{p.icon}</span>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
 
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '22px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>Top contributors</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '100px' }}>Live</span>
            </div>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                Be the first to earn points 🏆
              </div>
            ) : (
              leaderboard.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: rankColors[i] ?? 'rgba(255,255,255,0.25)', width: '18px', textAlign: 'center' as const, flexShrink: 0 }}>
                    {i < 3 ? rankEmojis[i] : i + 1}
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(91,163,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {avis[i % avis.length]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{r.username}</div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#6AAEE8' }}>{r.points} pts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
 
      {/* STORY */}
      <div style={{ background: 'white', padding: '100px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
          <div style={{
            background: 'linear-gradient(145deg,#1A5FAA,#3B8FD4)', borderRadius: '28px', height: '440px',
            display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕌</div>
            <div style={{ fontWeight: 800, fontSize: '36px', color: 'white', letterSpacing: '3px' }}>FASSAH</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginTop: '8px', fontStyle: 'italic' }}>
              فَسَاح — spaciousness & ease
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: blue, textTransform: 'uppercase' as const, marginBottom: '12px' }}>Our story</div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#0C1B2E', margin: '0 0 24px', lineHeight: 1.2 }}>
              Built because we know<br />that feeling
            </h2>
            <p style={{ fontSize: '16px', color: textMid, lineHeight: 1.7, marginBottom: '20px' }}>
              Prayer time hit in the middle of Oxford Street. No mosque in sight. Phone signal patchy. Maps showing a gym. That ten-minute scramble — that is what Fassah exists to prevent.
            </p>
            <p style={{ fontSize: '16px', color: textMid, lineHeight: 1.7, marginBottom: '24px' }}>
              The word fassah comes from the Arabic for spaciousness, openness, ease. That is what we want every Muslim to feel when prayer time comes — not panic, but peace.
            </p>
            <div style={{ background: bluePale, borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', background: blue, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🕌</div>
              <div style={{ fontSize: '13px', color: textMid, lineHeight: 1.5 }}>
                <strong style={{ color: blueDark }}>Built for the ummah, by the ummah.</strong> Fassah is not owned by a corporation. Every spot on this map was added by a Muslim who wanted to help.
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* FOOTER */}
      <footer style={{ background: '#0C1B2E', padding: '56px 48px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '48px', gap: '40px', flexWrap: 'wrap' as const }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '22px', color: 'white', marginBottom: '8px' }}>🕌 Fassah</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', maxWidth: '260px', lineHeight: 1.6 }}>
              The UK's community-powered map of Muslim prayer spaces. Free forever.
            </div>
          </div>
          {[
            { h: 'Product', links: ['Map', 'Add a Space', 'How it works'] },
            { h: 'Community', links: ['Leaderboard', 'Ajar Points', 'Contributors'] },
            { h: 'About', links: ['Our Story', 'Privacy', 'Contact'] },
          ].map(col => (
            <div key={col.h}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' as const, marginBottom: '16px' }}>{col.h}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '10px', cursor: 'pointer' }}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.25)', flexWrap: 'wrap' as const, gap: '12px' }}>
          <span>© 2026 Fassah · Built for the ummah · UK</span>
          <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.15)', letterSpacing: '2px' }}>بِسْمِ اللهِ</span>
          <span>Free to use · Always</span>
        </div>
      </footer>
 
      {selectedSpace && (
        <SpacePopup space={selectedSpace} onClose={() => setSelectedSpace(null)} />
      )}
      {showSubmitForm && (
        <SubmitSpaceForm onClose={() => setShowSubmitForm(false)} onSuccess={() => { loadSpaces(); }} />
      )}
    </div>
  );
}
