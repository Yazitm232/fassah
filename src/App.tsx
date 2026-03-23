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

  useEffect(() => { loadSpaces(); loadLeaderboard(); }, []);

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

  const rankEmojis = ['🥇', '🥈', '🥉', '4', '5', '6', '7', '8', '9', '10'];
  const rankColors = ['#E8A020', '#B0C4DE', '#CD9B6A', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.25)'];
  const avis = ['🦁', '🌙', '🌿', '🔥', '🕊️', '⭐', '🌊', '🏔️', '🌸', '✨'];

  const blue = '#2B7FD4';
  const blueDark = '#1A5FAA';
  const bluePale = '#EBF4FF';
  const textMid = '#3D5A7A';
  const textLight = '#7A9BBF';
  const gold = '#E8A020';
  const green = '#22C55E';

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
          background: 'white', margin: '0 32px',
          borderRadius: '28px 28px 0 0', marginTop: '-40px',
          position: 'relative', zIndex: 10, overflow: 'hidden',
          boxShadow: '0 -12px 60px rgba(43,127,212,0.12)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', borderBottom: '1px solid #EDF3FB', flexWrap: 'wrap', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0C1B2E' }}>Prayer spaces near you</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: green, fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', background: green, borderRadius: '50%', display: 'inline-block' }} />
                Live data
              </span>
            </div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search area or postcode..."
                style={{
                  border: '1.5px solid #D4E6F5', borderRadius: '10px',
                  padding: '8px 16px', fontSize: '13px', outline: 'none',
                  fontFamily: 'system-ui', color: '#0C1B2E', width: '220px',
                }}
              />
              <button type="submit" style={{
                background: blue, color: 'white', border: 'none',
                borderRadius: '10px', padding: '8px 18px', fontSize: '13px',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui',
              }}>Search</button>
            </form>
          </div>

          {/* FILTER PILLS — NOW WIRED */}
          <div style={{ padding: '12px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid #EDF3FB', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', border: 'none', fontFamily: 'system-ui',
                background: activeFilter === f ? blue : '#EBF4FF',
                color: activeFilter === f ? 'white' : textMid,
                transition: 'all 0.15s',
              }}>{f}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: textLight, alignSelf: 'center' }}>
              {filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''}
            </span>
          </div>

          {isLoading ? (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EBF4FF' }}>
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
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          }}>
            <p style={{ fontSize: '13px', color: textMid, margin: 0 }}>
              <strong style={{ color: blueDark }}>Fassah is community powered</strong> — every spot you add helps another Muslim find their space to pray.
            </p>
            <button onClick={() => setShowSubmitForm(true)} style={{
              background: blue, color: 'white', border: 'none', padding: '9px 20px',
              borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'system-ui', whiteSpace: 'nowrap', flexShrink: 0,
            }}>+ Add a Space</button>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ background: 'white', padding: '100px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: blue, marginBottom: '14px' }}>How it works</div>
          <div style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#0C1B2E', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '60px', maxWidth: '500px' }}>
            Simple. Community-powered. Always live.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '48px' }}>
            {steps.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '72px', fontWeight: 800, color: '#C4DEFA', lineHeight: 1, marginBottom: '16px' }}>{s.n}</div>
                <div style={{ fontSize: '19px', fontWeight: 700, color: '#0C1B2E', marginBottom: '10px' }}>{s.h}</div>
                <div style={{ fontSize: '14px', color: textMid, lineHeight: 1.75 }}>{s.p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SPACE TYPES */}
      <div style={{ background: '#F6FAFE', padding: '100px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: blue, marginBottom: '14px' }}>Space types</div>
          <div style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#0C1B2E', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '48px' }}>
            Not just mosques. Every kind of space.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '16px' }}>
            {types.map((t, i) => (
              <div key={i} style={{
                background: 'white', border: '1.5px solid #E5EFF8',
                borderRadius: '18px', padding: '28px 16px 22px', textAlign: 'center', cursor: 'pointer',
              }}>
                <span style={{ fontSize: '34px', marginBottom: '12px', display: 'block' }}>{t.e}</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0C1B2E', marginBottom: '5px' }}>{t.n}</div>
                <div style={{ fontSize: '11px', color: textLight }}>{t.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AJAR / LEADERBOARD — REAL DATA */}
      <div style={{ background: 'linear-gradient(170deg,#0A1628 0%,#0F2545 60%,#152E52 100%)', padding: '100px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: '14px' }}>Sadaqah jariyah</div>
            <div style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: '20px' }}>
              Your contribution does not end when you leave the page.
            </div>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '36px' }}>
              Every space you add, every check-in you make — it stays on the map. It keeps helping. The next Muslim who finds that spot because of you — that is your ongoing reward. That is ajar you did not even know you were earning.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {ajarPoints.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(91,163,232,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{p.icon}</div>
                  <div>{p.text}</div>
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
                  <span style={{ fontSize: '12px', fontWeight: 800, color: rankColors[i] ?? 'rgba(255,255,255,0.25)', width: '18px', textAlign: 'center', flexShrink: 0 }}>
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
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕌</div>
            <div style={{ fontWeight: 800, fontSize: '36px', color: 'white', letterSpacing: '3px' }}>FASSAH</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginTop: '8px', fontStyle: 'italic' }}>
              فَسَاح — spaciousness & ease
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: blue, marginBottom: '14px' }}>Why we built this</div>
            <div style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, color: '#0C1B2E', lineHeight: 1.4, letterSpacing: '-0.5px', marginBottom: '20px' }}>
              What do you do when the prayer comes in and there is nowhere to go?
            </div>
            <p style={{ fontSize: '15px', color: textMid, lineHeight: 1.8, marginBottom: '14px' }}>
              Fassah was built by a Muslim student at a London university who missed Asr one too many times. Not because they did not want to pray — but because they genuinely did not know where to go.
            </p>
            <p style={{ fontSize: '15px', color: textMid, lineHeight: 1.8, marginBottom: '14px' }}>
              That problem is not unique. It is felt by every Muslim navigating a city, a campus, a shopping centre. The knowledge of where to pray exists — it lives in the community. Fassah just puts it on a map.
            </p>
            <p style={{ fontSize: '15px', color: textMid, lineHeight: 1.8, marginBottom: '28px' }}>
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '48px', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '280px' }}>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'white', letterSpacing: '1px', marginBottom: '14px' }}>FASSAH</div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: 0 }}>
              The community map of prayer spaces across the UK. Built by Muslims, for Muslims. Free forever.
            </p>
          </div>
          {[
            { title: 'Navigate', links: ['Find a space', 'Add a space', 'Leaderboard', 'How it works'] },
            { title: 'About', links: ['Our story', 'Privacy policy', 'Contact us', 'Report an issue'] },
            { title: 'Community', links: ['Islamic societies', 'University outreach', 'Partner with us'] },
          ].map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>{col.title}</div>
              {col.links.map((l, j) => (
                <div key={j} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', cursor: 'pointer' }}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.25)', flexWrap: 'wrap', gap: '12px' }}>
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
