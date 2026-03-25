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
 
 
// ─── PRIVACY PAGE (inlined to avoid import path issues) ───────
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
 
// ─── COMPASS FACE ─────────────────────────────────────────────
function CompassFace({ needleRot, gold, goldLight, goldDark, active }: { needleRot: number; gold: string; goldLight: string; goldDark: string; active: boolean }) {
  const size = 260;
  return (
    <div style={{ position: 'relative', width: size, height: size, marginBottom: 8 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(${goldDark}, ${gold}, ${goldLight}, ${gold}, ${goldDark}, ${gold}, ${goldLight}, ${gold}, ${goldDark})`, boxShadow: `0 0 40px ${goldDark}88, inset 0 0 20px #00000066` }} />
      <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #2A1A08, #0D0804)', boxShadow: 'inset 0 4px 20px #00000088' }} />
      {Array.from({ length: 72 }).map((_, i) => {
        const major = i % 9 === 0; const mid = i % 3 === 0;
        return (
          <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: major ? 3 : mid ? 2 : 1, height: major ? 14 : mid ? 9 : 5, background: major ? goldLight : mid ? gold : goldDark, borderRadius: 1, transformOrigin: '50% 100%', transform: `translateX(-50%) translateY(-${size / 2 - 12}px) rotate(${i * 5}deg)` }} />
        );
      })}
      {[{ l: 'N', d: 0, c: goldLight }, { l: 'E', d: 90, c: gold }, { l: 'S', d: 180, c: gold }, { l: 'W', d: 270, c: gold }].map(({ l, d, c }) => (
        <div key={l} style={{ position: 'absolute', left: '50%', top: '50%', fontSize: l === 'N' ? 16 : 13, fontWeight: 800, color: c, transform: `rotate(${d}deg) translateY(-${size / 2 - 32}px) rotate(-${d}deg) translate(-50%,-50%)`, fontFamily: 'serif' }}>{l}</div>
      ))}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transformOrigin: '50% 100%', transform: `translateX(-50%) translateY(-100%) rotate(${needleRot}deg)`, transition: active ? 'transform 0.12s ease-out' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 2, filter: `drop-shadow(0 0 8px ${gold})` }}>🕋</div>
        <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `14px solid ${goldLight}` }} />
        <div style={{ width: 3, height: size / 2 - 50, background: `linear-gradient(to bottom, ${goldLight}, ${goldDark})`, borderRadius: '0 0 2px 2px' }} />
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 16, height: 16, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${goldLight}, ${goldDark})`, transform: 'translate(-50%,-50%)', zIndex: 10, boxShadow: `0 0 10px ${gold}88`, border: `1px solid ${gold}` }} />
      <div style={{ position: 'absolute', inset: 40, borderRadius: '50%', border: `1px solid ${goldDark}66`, pointerEvents: 'none' }} />
    </div>
  );
}
 
// ─── PRAYER TIMES PAGE ────────────────────────────────────────
function PrayerTimes() {
  const [prayers, setPrayers] = useState<{ name: string; time: string; arabic: string }[]>([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [heading, setHeading] = useState<number | null>(null);
  const [compassPermission, setCompassPermission] = useState<'unknown' | 'granted' | 'denied' | 'unavailable'>('unknown');
  const [showTimetable, setShowTimetable] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const QIBLA = 119;
  const gold = '#C9A84C'; const goldLight = '#F0D080'; const goldDark = '#7A5C1E';
  const darkBg = '#1A1008'; const darkCard = '#211508';
 
  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=London&country=GB&method=2')
      .then(r => r.json()).then(data => {
        const t = data.data.timings;
        const list = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(name => ({
          name, time: t[name],
          arabic: ({ Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' } as Record<string, string>)[name],
        }));
        setPrayers(list);
        const h = data.data.date.hijri;
        setHijriDate(`${h.day} ${h.month.en} ${h.year} AH`);
      }).catch(() => {
        setPrayers([
          { name: 'Fajr', time: '05:12', arabic: 'الفجر' }, { name: 'Sunrise', time: '06:48', arabic: 'الشروق' },
          { name: 'Dhuhr', time: '12:48', arabic: 'الظهر' }, { name: 'Asr', time: '15:55', arabic: 'العصر' },
          { name: 'Maghrib', time: '19:02', arabic: 'المغرب' }, { name: 'Isha', time: '20:30', arabic: 'العشاء' },
        ]);
      });
  }, []);
 
  useEffect(() => {
    if (!prayers.length) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const tick = () => {
      const now = new Date();
      const cur = now.getHours() * 60 + now.getMinutes();
      const idx = prayers.findIndex(p => { const [h, m] = p.time.split(':').map(Number); return h * 60 + m > cur; });
      const ni = idx === -1 ? 0 : idx;
      setNextIndex(ni);
      const [h, m] = prayers[ni].time.split(':').map(Number);
      let diff = h * 60 + m - cur; if (diff < 0) diff += 24 * 60;
      const hrs = Math.floor(diff / 60); const mins = diff % 60; const secs = 59 - now.getSeconds();
      setCountdown(`${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs < 10 ? '0' + secs : secs}s`);
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [prayers]);
 
  const handleOrientation = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
    let h: number | null = null;
    if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) h = e.webkitCompassHeading;
    else if (e.alpha !== null && e.alpha !== undefined) h = 360 - e.alpha;
    if (h !== null) setHeading(h);
  };
 
  const startListening = () => {
    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.addEventListener('deviceorientation', handleOrientation as EventListener, true);
  };
 
  useEffect(() => () => {
    window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
  }, []);
 
  const requestCompass = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') { setCompassPermission('granted'); startListening(); }
        else setCompassPermission('denied');
      } catch { setCompassPermission('denied'); }
    } else if (window.DeviceOrientationEvent) {
      setCompassPermission('granted'); startListening();
    } else { setCompassPermission('unavailable'); }
  };
 
  const needleRot = heading !== null ? QIBLA - heading : 0;
  const normalised = ((needleRot % 360) + 360) % 360;
  const nextPrayer = prayers[nextIndex];
  const followingPrayer = prayers[(nextIndex + 1) % prayers.length];
 
  return (
    <div style={{ minHeight: '100vh', background: darkBg, fontFamily: 'system-ui', paddingBottom: 100, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div style={{ padding: '20px 20px 0' }}>
        {nextPrayer && (
          <div style={{ background: darkCard, border: `1px solid ${goldDark}`, borderRadius: 18, padding: '18px 22px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 4 }}>Next Prayer</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{nextPrayer.name}</div>
              <div style={{ fontSize: 13, color: goldLight, fontFamily: 'serif', marginTop: 2 }}>{nextPrayer.arabic}</div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: goldLight, fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>{countdown}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>at {nextPrayer.time}</div>
              {followingPrayer && <div style={{ fontSize: 11, color: gold, marginTop: 6 }}>Then {followingPrayer.name} · {followingPrayer.time}</div>}
            </div>
          </div>
        )}
        <div style={{ background: darkCard, border: `1px solid ${goldDark}`, borderRadius: 22, padding: '24px 20px', marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: gold, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 4 }}>Qibla Compass</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Hold flat · arrow points to Makkah</div>
          {compassPermission === 'unknown' && (
            <div style={{ textAlign: 'center' as const }}>
              <CompassFace needleRot={QIBLA} gold={gold} goldLight={goldLight} goldDark={goldDark} active={false} />
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20, lineHeight: 1.6 }}>Tap to activate live compass.<br /><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>No location stored.</span></div>
              <button onClick={requestCompass} style={{ padding: '13px 32px', borderRadius: 100, background: `linear-gradient(135deg, ${goldDark}, ${gold})`, color: '#1A1008', border: `1px solid ${goldLight}`, fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: '1px' }}>⌖ Activate Compass</button>
            </div>
          )}
          {(compassPermission === 'denied' || compassPermission === 'unavailable') && (
            <div style={{ textAlign: 'center' as const }}>
              <CompassFace needleRot={QIBLA} gold={gold} goldLight={goldLight} goldDark={goldDark} active={false} />
              <div style={{ fontSize: 13, color: gold, marginTop: 12 }}>Static bearing: 119° SE from London</div>
            </div>
          )}
          {compassPermission === 'granted' && (
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', width: '100%' }}>
              <CompassFace needleRot={needleRot} gold={gold} goldLight={goldLight} goldDark={goldDark} active={true} />
              <div style={{ marginTop: 20, textAlign: 'center' as const }}>
                {heading !== null ? (
                  <>
                    <div style={{ fontSize: 40, fontWeight: 900, color: goldLight, fontVariantNumeric: 'tabular-nums' }}>{Math.round(normalised)}°</div>
                    <div style={{ fontSize: 15, color: normalised < 10 || normalised > 350 ? '#4ADE80' : 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: 600 }}>{normalised < 10 || normalised > 350 ? '✓ Facing Qibla' : `Rotate ${Math.round(normalised)}° to face Makkah`}</div>
                  </>
                ) : <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Move phone slowly to calibrate...</div>}
              </div>
            </div>
          )}
        </div>
        <button onClick={() => setShowTimetable(v => !v)} style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'transparent', border: `1px solid ${goldDark}`, color: gold, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 12, letterSpacing: '1px', fontFamily: 'system-ui' }}>
          {showTimetable ? '▲ Hide Timetable' : '▼ Full Prayer Timetable'}
        </button>
        {showTimetable && (
          <div style={{ background: darkCard, border: `1px solid ${goldDark}`, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            {prayers.map((p, i) => {
              const isNext = i === nextIndex;
              const [h, m] = p.time.split(':').map(Number);
              const passed = h * 60 + m < new Date().getHours() * 60 + new Date().getMinutes();
              return (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: i < prayers.length - 1 ? `1px solid ${goldDark}33` : 'none', background: isNext ? `${goldDark}44` : 'transparent' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: isNext ? 700 : 400, color: isNext ? goldLight : passed ? '#555' : 'rgba(255,255,255,0.7)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#555', fontFamily: 'serif' }}>{p.arabic}</div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: isNext ? goldLight : passed ? '#444' : 'rgba(255,255,255,0.5)' }}>{p.time}</div>
                  {isNext && <div style={{ marginLeft: 10, background: gold, color: '#1A1008', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 100, textTransform: 'uppercase' as const }}>Next</div>}
                </div>
              );
            })}
          </div>
        )}
        {hijriDate && <div style={{ textAlign: 'center' as const, fontSize: 11, color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>{hijriDate} · ISNA calculation</div>}
      </div>
    </div>
  );
}
 
// ─── LEADERBOARD PAGE ─────────────────────────────────────────
function Leaderboard() {
  const [board, setBoard] = useState<{ username: string; points: number }[]>([]);
  const [myUsername, setMyUsername] = useState('');
  const [myPoints, setMyPoints] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'global' | 'local' | 'friends'>('global');
  const blue = '#1255A0';
  const gold1 = '#C9A84C'; const gold1L = '#F0D080';
  const silver1 = '#6B8FA8'; const silver1L = '#A8C4D8';
  const bronze1 = '#8B5E3C'; const bronze1L = '#C4885A';
  const podiumColors = [
    { base: gold1, light: gold1L, label: '#3D2800' },
    { base: silver1, light: silver1L, label: '#0A1F2E' },
    { base: bronze1, light: bronze1L, label: '#2A1400' },
  ];
  const bg = '#0F0F14'; const card = '#17171F'; const cardBorder = '#2A2A3A';
  const AVIS = ['🦁', '🌙', '🌿', '🔥', '🕊️', '⭐', '🌊', '🏔️', '🌸', '✨'];
 
  useEffect(() => {
    Promise.all([fetchLeaderboard(), getOrCreateSession()]).then(([data, session]) => {
      // Merge real users with fake seed users, dedupe by username, sort by points
      const all = [...data, ...FAKE_USERS];
      const seen = new Set<string>();
      const merged = all.filter(u => { if (seen.has(u.username)) return false; seen.add(u.username); return true; });
      merged.sort((a, b) => b.points - a.points);
      setBoard(merged);
      setMyUsername(session.username);
      setMyPoints(session.points);
    });
  }, []);
 
  // Local = nearby fake users (smaller subset)
  const localBoard = board.slice(0, 6);
  // Friends = just you + 3 fake "friends"
  const friendsBoard = [
    { username: myUsername || 'You', points: myPoints },
    { username: 'Umar_786', points: 340 },
    { username: 'Zainab_NW10', points: 134 },
    { username: 'HamzaB', points: 112 },
  ].sort((a, b) => b.points - a.points);
 
  const activeBoard = tab === 'global' ? board : tab === 'local' ? localBoard : friendsBoard;
 
  const handleInvite = () => {
    const text = `I'm mapping prayer spaces across the UK with Fassah 🕌 fassah.com/?ref=${myUsername}`;
    if (navigator.share) navigator.share({ title: 'Fassah', text, url: `https://fassah.com/?ref=${myUsername}` }).catch(() => { });
    else navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
 
  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'system-ui', paddingBottom: 100, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>Hall of Fame</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 4 }}>Fassah Leaderboard</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Every check-in earns reward long after you've forgotten. ✨</div>
 
        {/* My score */}
        <div style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '16px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🦁</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{myUsername || 'Loading...'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Your score</div>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: gold1L }}>{myPoints}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>pts</div>
          </div>
        </div>
 
        {/* Tab switcher */}
        <div style={{ display: 'flex', background: card, borderRadius: 12, padding: 4, marginBottom: 20, border: `1px solid ${cardBorder}` }}>
          {(['global', 'local', 'friends'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'system-ui',
              fontSize: 12, fontWeight: 700, textTransform: 'capitalize' as const, letterSpacing: '0.5px',
              background: tab === t ? gold1 : 'transparent',
              color: tab === t ? '#1A1008' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s',
            }}>{t === 'global' ? '🌍 Global' : t === 'local' ? '📍 Local' : '👥 Friends'}</button>
          ))}
        </div>
 
        {/* Podium top 3 */}
        {activeBoard.length >= 3 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6 }}>
              {[1, 0, 2].map(idx => {
                const entry = activeBoard[idx];
                if (!entry) return null;
                const rank = idx + 1;
                const podH = rank === 1 ? 100 : rank === 2 ? 78 : 62;
                const p = podiumColors[idx];
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: rank === 1 ? 1.2 : 1 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 6, background: `linear-gradient(135deg, ${p.base}, ${p.light})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: `0 4px 16px ${p.base}66` }}>{AVIS[idx]}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', maxWidth: 90, textAlign: 'center' as const, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.username.split('_')[0]}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: p.light, marginBottom: 6 }}>{entry.points} pts</div>
                    <div style={{ width: '100%', height: podH, background: `linear-gradient(to bottom, ${p.base}, ${p.base}88)`, borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const, boxShadow: `0 -4px 20px ${p.base}44`, border: `1px solid ${p.light}33`, borderBottom: 'none' }}>
                      <div style={{ fontSize: 22 }}>{medals[idx]}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: p.label, marginTop: 2 }}>#{rank}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: '0 0 8px 8px' }} />
          </div>
        )}
 
        {/* Ranks 4+ */}
        {activeBoard.length > 3 && (
          <div style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
            {activeBoard.slice(3).map((entry, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < activeBoard.slice(3).length - 1 ? `1px solid ${cardBorder}` : 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.25)', width: 20, textAlign: 'center' as const }}>{i + 4}</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{AVIS[(i + 4) % AVIS.length]}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{entry.username}</div></div>
                <span style={{ fontSize: 14, fontWeight: 700, color: gold1 }}>{entry.points} pts</span>
              </div>
            ))}
          </div>
        )}
 
        {activeBoard.length === 0 && <div style={{ textAlign: 'center' as const, padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}><div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div><div>Be the first to earn points</div></div>}
 
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontStyle: 'italic' }}>"The place you add today could help a brother or sister pray five years from now. Imagine the reward. One click away."</div>
        </div>
 
        <div style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>Challenge a friend 🤝</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Invite a friend — when they check in you both get <strong style={{ color: gold1L }}>+5 bonus points</strong>.</div>
          <button onClick={handleInvite} style={{ width: '100%', padding: '13px', background: `linear-gradient(135deg,${blue},#2B7FD4)`, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui' }}>
            {copied ? '✅ Copied!' : '📲 Share Fassah with a friend'}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ─── SETTINGS PAGE ────────────────────────────────────────────
function Settings({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [username, setUsername] = useState('');
  const [points, setPoints] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const blue = '#1255A0';
 
  useEffect(() => {
    getOrCreateSession().then(s => { setUsername(s.username); setPoints(s.points); });
  }, []);
 
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: 'Fassah', text: 'Find somewhere to pray anywhere in the UK 🕌', url: 'https://fassah.com' }).catch(() => { });
    else { navigator.clipboard.writeText('https://fassah.com'); alert('Link copied!'); }
  };
 
  const handleDeleteAccount = () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    // Clear all local data
    localStorage.clear();
    sessionStorage.clear();
    setDeleted(true);
    setTimeout(() => window.location.reload(), 2000);
  };
 
  const Row = ({ icon, label, value, onPress, danger }: { icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean }) => (
    <div onClick={onPress} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: '1px solid #F5F8FF', cursor: onPress ? 'pointer' : 'default', WebkitTapHighlightColor: 'transparent' }}>
      <span style={{ fontSize: 20, width: 28, textAlign: 'center' as const }}>{icon}</span>
      <div style={{ flex: 1 }}><div style={{ fontSize: 14, color: danger ? '#EF4444' : '#333', fontWeight: 500 }}>{label}</div></div>
      {value && <span style={{ fontSize: 13, color: '#888' }}>{value}</span>}
      <span style={{ color: '#CCC', fontSize: 16 }}>›</span>
    </div>
  );
 
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#AAA', textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginBottom: 8, paddingLeft: 4 }}>{title}</div>
      <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(18,85,160,0.06)' }}>{children}</div>
    </div>
  );
 
  if (deleted) return (
    <div style={{ padding: '60px 20px', textAlign: 'center' as const, fontFamily: 'system-ui' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#333' }}>Account deleted</div>
      <div style={{ fontSize: 14, color: '#999', marginTop: 8 }}>Your data has been cleared. Reloading...</div>
    </div>
  );
 
  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui', paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))' }}>
      <div style={{ marginBottom: 28 }}><div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>Settings</div></div>
      <div style={{ background: `linear-gradient(135deg,${blue},#2B7FD4)`, borderRadius: 18, padding: '20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🦁</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{username || 'Loading...'}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Anonymous username</div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>{points}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>points</div>
        </div>
      </div>
 
      <div style={{ background: '#FFF9ED', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#7A5B00' }}>
        These points are the least of what you're earning. 🤲
      </div>
 
      <Section title="Points">
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px' }}>
          {[{ n: String(points), l: 'Total' }, { n: '+2', l: 'Check-in' }, { n: '+10', l: 'Space added' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' as const, flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: blue }}>{s.n}</div>
              <div style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Section>
 
      <Section title="App">
        <Row icon="📲" label="Share Fassah" onPress={handleShare} />
        <Row icon="🔒" label="Privacy Policy" onPress={() => onNavigate('privacy')} />
        <Row icon="✉️" label="Contact Us" value="hello@fassah.com" onPress={() => window.open('mailto:hello@fassah.com', '_blank')} />
        <Row icon="🚩" label="Report a Space" onPress={() => window.open('mailto:hello@fassah.com?subject=Space%20Report', '_blank')} />
        <Row icon="⭐" label="Rate Fassah" onPress={() => window.open('https://fassah.com', '_blank')} />
      </Section>
 
      <Section title="Account">
        <Row icon="🗑️" label={deleteConfirm ? 'Tap again to confirm deletion' : 'Delete My Account'} onPress={handleDeleteAccount} danger />
      </Section>
 
      <div style={{ textAlign: 'center', fontSize: 12, color: '#CCC', marginTop: 8, lineHeight: 1.8 }}>
        <div>© 2026 Fassah · Built for the ummah · UK</div>
        <div style={{ fontSize: 16, letterSpacing: '2px', marginTop: 4 }}>بِسْمِ اللهِ</div>
        <div>Free · No ads · No data sold · Ever.</div>
      </div>
    </div>
  );
}
 
 
// ─── LANDING PAGE ─────────────────────────────────────────────
function LandingPage() {
  useEffect(() => {
    // Dynamically load Google Fonts for landing only
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);
 
  const s = {
    page: { background:'#07091A', color:'white', fontFamily:"'DM Sans', system-ui, sans-serif", overflowX:'hidden' as const, minHeight:'100vh' },
    nav: { position:'fixed' as const, top:0, left:0, right:0, zIndex:100, padding:'20px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(to bottom, rgba(7,9,26,0.97), transparent)' },
    navLogo: { fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:900, letterSpacing:3, background:'linear-gradient(135deg,#fff,rgba(255,255,255,0.7))', WebkitBackgroundClip:'text' as const, WebkitTextFillColor:'transparent' as const },
    navBtn: { background:'#1255A0', color:'white', border:'none', padding:'10px 24px', borderRadius:100, fontSize:14, fontWeight:600, cursor:'pointer', textDecoration:'none' as const, display:'inline-block' },
  };
 
  const SPACES = [
    { tag:'Mosque', tagColor:'rgba(18,85,160,0.25)', tagText:'#5BA4F5', name:'Masjid At-Taqwa', addr:'Crown House, NW10 7PN', icon:'🕌', bg:'linear-gradient(160deg,#1a3a6a,#0d1f3c)', meta:['🕐 Open daily','🚿 Wudu available'] },
    { tag:'Outdoor', tagColor:'rgba(22,163,74,0.2)', tagText:'#4ADE80', name:'Roundwood Park', addr:'NW10 3SA', icon:'🌳', bg:'linear-gradient(160deg,#1a3a1a,#0d240d)', meta:['☀️ Daylight hours','🧭 Qibla marked'] },
    { tag:'Multi-faith', tagColor:'rgba(201,168,76,0.2)', tagText:'#F0D080', name:'Brunel Prayer Room', addr:'Hamilton 004, Uxbridge UB8', icon:'🏛️', bg:'linear-gradient(160deg,#2a1a4a,#150d24)', meta:['🕐 9am–9pm','🚿 Wudu available'] },
    { tag:'Business', tagColor:'rgba(139,92,246,0.2)', tagText:'#C4B5FD', name:'Westfield Prayer Room', addr:'Westfield London, W12 7GF', icon:'🏢', bg:'linear-gradient(160deg,#1a1a3a,#0d0d20)', meta:['🕐 Mall hours','♿ Accessible'] },
    { tag:'Mosque', tagColor:'rgba(18,85,160,0.25)', tagText:'#5BA4F5', name:'Darul Taclim Centre', addr:'106 High Rd, NW10', icon:'🕌', bg:'linear-gradient(160deg,#1a3060,#0d1a38)', meta:['🕐 All prayers','🚿 Wudu available'] },
    { tag:'Outdoor', tagColor:'rgba(22,163,74,0.2)', tagText:'#4ADE80', name:'Victoria Park East Lawn', addr:'Grove Road, E9 7DE', icon:'🌿', bg:'linear-gradient(160deg,#1a3020,#0d1810)', meta:['☀️ Quiet corner','🧭 SE facing'] },
  ];
  const doubled = [...SPACES, ...SPACES];
  const [speed, setSpeed] = useState(55);
  const carouselRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.animationDuration = speed + 's';
    }
  }, [speed]);
 
  return (
    <div style={s.page}>
      <style>{`
        @keyframes meshShift { 0%{opacity:.8;transform:scale(1)} 100%{opacity:1;transform:scale(1.05)} }
        @keyframes logoPulse { 0%,100%{box-shadow:0 0 60px rgba(18,85,160,.6),0 0 120px rgba(61,46,138,.3)} 50%{box-shadow:0 0 80px rgba(18,85,160,.8),0 0 160px rgba(61,46,138,.4)} }
        @keyframes scrollTrack { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
        .landing-carousel { display:flex; gap:20px; animation:scrollTrack ${speed}s linear infinite; width:max-content; }
        .landing-carousel:hover { animation-play-state:paused; }
        .space-card-land:hover { transform:translateY(-6px); }
        .step-card-land:hover { background:rgba(255,255,255,.06); transform:translateY(-4px); }
        .step-card-land::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#1255A0,#3D2E8A); opacity:0; transition:opacity .3s; }
        .step-card-land:hover::before { opacity:1; }
      `}</style>
 
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLogo}>FASSAH</div>
        <a href="/app" style={s.navBtn}>Open App</a>
      </nav>
 
      {/* HERO */}
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'120px 24px 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 20% 50%,rgba(18,85,160,.35),transparent 60%),radial-gradient(ellipse 60% 80% at 80% 30%,rgba(61,46,138,.3),transparent 60%)', animation:'meshShift 12s ease-in-out infinite alternate' }} />
        <div style={{ position:'relative', zIndex:2, maxWidth:700 }}>
          <div style={{ width:96, height:96, borderRadius:'50%', margin:'0 auto 28px', background:'linear-gradient(135deg,#1255A0,#3D2E8A)', display:'flex', alignItems:'center', justifyContent:'center', animation:'logoPulse 3s ease-in-out infinite', border:'1.5px solid rgba(255,255,255,.15)', overflow:'hidden' }}>
            <img src="/logo.png" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} alt="Fassah" />
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(52px,10vw,88px)', fontWeight:900, letterSpacing:6, lineHeight:1, marginBottom:16, background:'linear-gradient(135deg,#fff,rgba(255,255,255,.75))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>FASSAH</div>
          <div style={{ fontSize:'clamp(12px,2vw,16px)', fontWeight:500, color:'rgba(255,255,255,.45)', letterSpacing:4, textTransform:'uppercase', marginBottom:20 }}>Find · Attend · Pray</div>
          <div style={{ fontSize:'clamp(17px,3vw,24px)', fontWeight:300, color:'rgba(255,255,255,.88)', lineHeight:1.55, maxWidth:540 }}>
            The <strong style={{ fontWeight:600, color:'white' }}>community-built map</strong> helping Muslims across the UK find somewhere to pray — before the time passes.
          </div>
        </div>
        {/* Peek text */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to bottom,transparent,#07091A 80%)', padding:'60px 24px 0', textAlign:'center' }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(18px,3vw,32px)', fontWeight:700, color:'rgba(255,255,255,.12)', letterSpacing:1, lineHeight:1.4, paddingBottom:8 }}>No Muslim should ever miss a prayer because they didn't know where to go.</div>
        </div>
      </div>
 
      {/* MAP SHOWCASE */}
      <div style={{ padding:'80px 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:3, textTransform:'uppercase', color:'#2B8FE8', marginBottom:16 }}>Live on fassah.com</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:700, textAlign:'center', marginBottom:48, maxWidth:560 }}>Every prayer space in the UK — mapped by your community</div>
 
        {/* Map frame */}
        <div style={{ width:'100%', maxWidth:960, borderRadius:20, border:'2px solid rgba(43,143,232,.4)', background:'rgba(18,85,160,.08)', padding:10, boxShadow:'0 40px 80px rgba(0,0,0,.5),0 0 80px rgba(18,85,160,.15)' }}>
          <div style={{ borderRadius:12, overflow:'hidden', aspectRatio:'16/9', position:'relative', background:'#0A1628' }}>
            <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d19862.5!2d-0.2500!3d51.5350!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2suk!4v1" width="100%" height="100%" style={{ border:0, position:'absolute', inset:0, filter:'saturate(0.7) brightness(0.85)' }} allowFullScreen loading="lazy" />
            {/* App UI overlay */}
            <div style={{ position:'absolute', top:0, left:0, right:0, background:'linear-gradient(135deg,#1255A0,#2B7FD4)', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:5 }}>
              <div><div style={{ fontSize:11, fontWeight:800, letterSpacing:2, color:'white' }}>FASSAH</div><div style={{ fontSize:7, color:'rgba(255,255,255,.5)' }}>Find your space to pray</div></div>
              <div style={{ background:'white', color:'#1255A0', fontSize:8, fontWeight:700, padding:'5px 12px', borderRadius:100 }}>+ Add Space</div>
            </div>
            {/* Pins */}
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:4 }}>
              {[{t:'30%',l:'24%',c:'#1255A0'},{t:'55%',l:'58%',c:'#1255A0'},{t:'38%',l:'72%',c:'#1255A0'},{t:'45%',l:'18%',c:'#16A34A'},{t:'62%',l:'42%',c:'#16A34A'},{t:'28%',l:'48%',c:'#C9A84C'},{t:'50%',l:'82%',c:'#C9A84C'},{t:'35%',l:'35%',c:'#7C3AED'},{t:'68%',l:'66%',c:'#7C3AED'}].map((p,i) => (
                <div key={i} style={{ position:'absolute', width:18, height:18, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', background:p.c, top:p.t, left:p.l, boxShadow:`0 3px 10px rgba(0,0,0,.4)` }}>
                  <div style={{ position:'absolute', inset:4, background:'white', borderRadius:'50%' }} />
                </div>
              ))}
            </div>
            {/* Legend */}
            <div style={{ position:'absolute', bottom:52, right:12, background:'rgba(255,255,255,0.95)', borderRadius:10, padding:'10px 14px', zIndex:6 }}>
              {[['#1255A0','Mosque'],['#16A34A','Outdoor'],['#C9A84C','Multi-faith'],['#7C3AED','Business']].map(([c,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:8, fontSize:9, fontWeight:600, color:'#333', marginBottom:4 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:c, flexShrink:0 }} />{l}
                </div>
              ))}
            </div>
            {/* Bottom nav */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'white', padding:'8px 0 10px', display:'flex', borderTop:'1px solid #EDF3FB', zIndex:5 }}>
              {[['🗺️','Map',true],['🌙','Prayer',false],['🏆','Leaders',false],['⚙️','Settings',false]].map(([icon,label,active]) => (
                <div key={label as string} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, fontSize:6, color:active?'#1255A0':'#aaa', fontWeight:active?700:400 }}>
                  <span style={{ fontSize:13 }}>{icon}</span>{label}
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* Stats */}
        <div style={{ width:'100%', maxWidth:960, display:'flex', background:'rgba(18,85,160,.12)', border:'1px solid rgba(43,143,232,.2)', borderTop:'none', borderRadius:'0 0 20px 20px', overflow:'hidden' }}>
          {[['247+','Spaces mapped'],['1,840','Community check-ins'],['12','Cities covered'],['Free','Always. No ads.']].map(([n,l]) => (
            <div key={l} style={{ flex:1, padding:'16px 24px', borderRight:'1px solid rgba(255,255,255,.06)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#2B8FE8' }}>{n}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', fontWeight:300 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* STORY */}
      <div style={{ padding:'80px 24px', maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:3, textTransform:'uppercase', color:'#2B8FE8', marginBottom:16 }}>Why Fassah Exists</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(20px,3vw,28px)', fontWeight:700, lineHeight:1.4, color:'white', borderLeft:'3px solid #2B8FE8', paddingLeft:24, marginBottom:24 }}>"Salah is the first thing accounted for on the Day of Judgement."</div>
          <div style={{ fontSize:16, fontWeight:300, color:'rgba(255,255,255,.55)', lineHeight:1.8, marginBottom:16 }}>Every Muslim knows this. Yet across the UK, millions of prayers are missed — not from neglect, but from circumstance. You're travelling. At university. Between appointments in an unfamiliar city. The adhan sounds and you simply don't know where to go.</div>
          <div style={{ fontSize:16, fontWeight:300, color:'rgba(255,255,255,.55)', lineHeight:1.8 }}>Fassah exists because that moment should never be the reason a prayer is lost. Every space you add is sadaqah jariyah — reward for everyone who ever prays there.</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[['5×','Daily prayers — cannot be replaced'],['247+','Spaces mapped across the UK'],['3.5M','Muslims in the UK who need this'],['∞','Reward for every space you add']].map(([n,l]) => (
            <div key={l} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:24 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:700, color:'#2B8FE8', marginBottom:4 }}>{n}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', fontWeight:300 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* HOW IT WORKS */}
      <div style={{ padding:'80px 24px', textAlign:'center' }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:3, textTransform:'uppercase', color:'#2B8FE8', marginBottom:16 }}>Simple as it should be</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(32px,5vw,52px)', fontWeight:700, color:'white', marginBottom:48 }}>Find. Attend. Pray.</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, maxWidth:1100, margin:'0 auto' }}>
          {[['🗺️','01','Find','Open Fassah and see prayer spaces near you — mosques, multi-faith rooms, outdoor spaces — all mapped by your community.'],['✓','02','Attend','See if a space is open, how busy it is, whether wudu is available. Real-time answers from people who just left.'],['🤲','03','Pray','Pray. Check in. Help the next person. Every check-in earns points — and earns you reward that continues long after.']].map(([icon,num,title,body]) => (
            <div key={title as string} className="step-card-land" style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:20, padding:'36px 28px', textAlign:'left', transition:'all .3s', position:'relative', overflow:'hidden' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:48, fontWeight:700, color:'rgba(255,255,255,.06)', lineHeight:1, marginBottom:16 }}>{num}</div>
              <div style={{ fontSize:32, marginBottom:16 }}>{icon}</div>
              <div style={{ fontSize:18, fontWeight:600, color:'white', marginBottom:10 }}>{title}</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,.4)', lineHeight:1.7, fontWeight:300 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* SPACES CAROUSEL */}
      <div style={{ padding:'60px 0', overflow:'hidden' }}>
        <div style={{ textAlign:'center', padding:'0 24px 32px' }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:3, textTransform:'uppercase', color:'#2B8FE8', marginBottom:12 }}>Real Spaces. Real Community.</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:700, color:'white' }}>From mosques to parks — we've got you</div>
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:24 }}>
          <button onClick={() => setSpeed(s => Math.min(80, s + 12))} style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'white', fontSize:18, cursor:'pointer' }}>←</button>
          <button onClick={() => setSpeed(s => Math.max(15, s - 12))} style={{ width:44, height:44, borderRadius:'50%', background:'rgba(18,85,160,0.4)', border:'1px solid rgba(43,143,232,0.4)', color:'white', fontSize:18, cursor:'pointer' }}>→</button>
        </div>
        <div style={{ overflow:'hidden' }}>
          <div ref={carouselRef} className="landing-carousel">
            {doubled.map((sp, i) => (
              <div key={i} className="space-card-land" style={{ width:300, flexShrink:0, borderRadius:18, overflow:'hidden', border:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.03)', transition:'transform .3s' }}>
                <div style={{ width:'100%', height:180, background:sp.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, position:'relative' }}>
                  {sp.icon}
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(to top,rgba(0,0,0,.6),transparent)' }} />
                </div>
                <div style={{ padding:'18px 20px' }}>
                  <div style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, marginBottom:10, background:sp.tagColor, color:sp.tagText }}>{sp.tag}</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'white', marginBottom:4 }}>{sp.name}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:12 }}>{sp.addr}</div>
                  <div style={{ display:'flex', gap:12 }}>
                    {sp.meta.map(m => <div key={m} style={{ fontSize:11, color:'rgba(255,255,255,.3)' }}>{m}</div>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* MISSION */}
      <div style={{ margin:'0 24px 80px', borderRadius:24, background:'linear-gradient(135deg,rgba(18,85,160,.4),rgba(61,46,138,.3))', border:'1px solid rgba(255,255,255,.1)', padding:'64px 48px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 60% at 50% 50%,rgba(43,143,232,.15),transparent)' }} />
        <div style={{ fontSize:28, letterSpacing:4, color:'rgba(255,255,255,.3)', marginBottom:20 }}>بِسْمِ اللهِ</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(22px,4vw,36px)', fontWeight:700, color:'white', lineHeight:1.4, marginBottom:16, position:'relative', zIndex:1 }}>No Muslim should ever miss a prayer<br/>because they didn't know where to go.</div>
        <div style={{ fontSize:15, color:'rgba(255,255,255,.45)', marginBottom:40, fontWeight:300, position:'relative', zIndex:1 }}>Free. Always. No ads. No data sold. Built for the ummah.</div>
        <a href="/app" style={{ background:'linear-gradient(135deg,#1255A0,#1A6BC8)', color:'white', border:'none', padding:'16px 40px', borderRadius:100, fontSize:16, fontWeight:600, cursor:'pointer', textDecoration:'none', display:'inline-block', boxShadow:'0 8px 32px rgba(18,85,160,.5)', position:'relative', zIndex:1 }}>Open Fassah — It's Free →</a>
      </div>
 
      {/* FOOTER */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', padding:'40px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, letterSpacing:3, color:'rgba(255,255,255,.35)' }}>FASSAH</div>
        <div style={{ display:'flex', gap:24 }}>
          {[['Open App','/app'],['Privacy','/app?page=privacy'],['Contact','mailto:support@fassah.com']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize:13, color:'rgba(255,255,255,.3)', textDecoration:'none' }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.18)' }}>© 2026 Fassah · Built for the ummah · UK</div>
      </div>
    </div>
  );
}
 
// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState('map');
  
  // Route: / → landing page, /app → the actual app
  const path = window.location.pathname;
  const isLanding = path === '/' || path === '' || path === '/landing';
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
 
      {/* Privacy page — full screen, no bottom nav */}
      {activePage === 'privacy' && (
        <div>
          <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #EDF3FB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
            <button onClick={() => handleNavigate('settings')} style={{ background: '#F0F5FF', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: blue, cursor: 'pointer' }}>← Back</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Privacy Policy</span>
          </div>
          <Privacy />
        </div>
      )}
 
      {/* Map page */}
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
