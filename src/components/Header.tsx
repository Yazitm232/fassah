import { useState, useEffect } from 'react';

interface HeaderProps {
  onAddSpace: () => void;
}

export default function Header({ onAddSpace }: HeaderProps) {
  const [prayerTime, setPrayerTime] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');

  useEffect(() => {
    const prayers = [
      { name: 'Fajr', time: '05:12' },
      { name: 'Dhuhr', time: '12:48' },
      { name: 'Asr', time: '15:55' },
      { name: 'Maghrib', time: '19:02' },
      { name: 'Isha', time: '20:30' },
    ];
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const next = prayers.find(p => {
      const [h, m] = p.time.split(':').map(Number);
      return h * 60 + m > currentMins;
    }) || prayers[0];
    setNextPrayer(next.name);
    setPrayerTime(next.time);
  }, []);

  return (
    <header style={{
      background: 'linear-gradient(170deg, #1255A0 0%, #2B7FD4 50%, #4A9AE8 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Islamic geometric pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 0 L80 40 L40 80 L0 40Z' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
      }} />

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 40px', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.png"
            alt="Fassah"
            style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div style={{ fontFamily: 'system-ui', fontWeight: 800, fontSize: '20px', color: 'white', letterSpacing: '1px' }}>FASSAH</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '1px' }}>Find your space to pray</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {nextPrayer && (
            <div style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', fontSize: '12px', padding: '7px 14px', borderRadius: '100px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ width: '6px', height: '6px', background: '#F0C040', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              {nextPrayer} · {prayerTime}
            </div>
          )}
          <button
            onClick={onAddSpace}
            style={{
              background: 'white', color: '#1A5FAA', border: 'none',
              padding: '10px 22px', borderRadius: '100px', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer', marginLeft: '8px',
            }}
          >
            + Add a Space
          </button>
        </div>
      </nav>

      {/* Hero body */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '20px 24px 80px',
        position: 'relative', zIndex: 5,
      }}>
        {/* Urgency badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'white', fontSize: '12px', fontWeight: 500,
          padding: '8px 18px', borderRadius: '100px', marginBottom: '32px',
        }}>
          <span style={{ width: '7px', height: '7px', background: '#F0C040', borderRadius: '50%', display: 'inline-block' }} />
          Community powered · UK-wide · Free forever
        </div>

        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <img
            src="/logo.png"
            alt="Fassah"
            style={{ width: '90px', height: '90px', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.95 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'system-ui', fontSize: 'clamp(52px, 10vw, 90px)',
          fontWeight: 800, color: 'white', letterSpacing: '-3px',
          lineHeight: 0.95, marginBottom: '12px', margin: '0 0 12px 0',
        }}>FASSAH</h1>

        <p style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 400,
          letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px',
        }}>Find your space to pray</p>

        {/* Hook */}
        <p style={{
          maxWidth: '520px', fontSize: 'clamp(16px, 2.2vw, 20px)',
          color: 'rgba(255,255,255,0.88)', lineHeight: 1.65,
          marginBottom: '40px', fontWeight: 300,
        }}>
          The iqamah is called. The time is now.<br />
          <strong style={{ color: 'white', fontWeight: 600 }}>Where do you go?</strong><br />
          The community map of prayer spaces across the UK — built by Muslims, for Muslims.
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px',
          overflow: 'hidden', marginTop: '16px',
        }}>
          {[
            { n: '247', l: 'Spaces mapped' },
            { n: '1,840', l: 'Check-ins' },
            { n: '12', l: 'UK cities' },
            { n: '320', l: 'Contributors' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '18px 28px', textAlign: 'center',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}>
              <div style={{ fontFamily: 'system-ui', fontSize: '26px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ajar strip */}
      <div style={{
        background: 'rgba(0,0,0,0.25)', padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)',
        textAlign: 'center', position: 'relative', zIndex: 10, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '18px', opacity: 0.4 }}>﷽</span>
        <span>Every space you add could help a Muslim make their salah on time.</span>
        <span style={{ color: '#E8A020', fontWeight: 700 }}>That is your sadaqah jariyah.</span>
        <span>🤲</span>
      </div>
    </header>
  );
}
