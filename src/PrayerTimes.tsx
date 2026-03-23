import { useState, useEffect, useRef } from 'react';
 
interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
}
 
export default function PrayerTimes() {
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
 
  const PRAYER_NAMES: Record<string, { arabic: string }> = {
    Fajr:    { arabic: 'الفجر' },
    Sunrise: { arabic: 'الشروق' },
    Dhuhr:   { arabic: 'الظهر' },
    Asr:     { arabic: 'العصر' },
    Maghrib: { arabic: 'المغرب' },
    Isha:    { arabic: 'العشاء' },
  };
 
  useEffect(() => {
    setLoading(true);
    fetch('https://api.aladhan.com/v1/timingsByCity?city=London&country=GB&method=2')
      .then(r => r.json())
      .then(data => {
        const t = data.data.timings;
        const list: PrayerTime[] = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'].map(name => ({
          name,
          time: t[name],
          arabic: PRAYER_NAMES[name].arabic,
        }));
        setPrayers(list);
 
        const hDate = data.data.date.hijri;
        setHijriDate(`${hDate.day} ${hDate.month.en} ${hDate.year} AH`);
 
        setLoading(false);
        updateNextPrayer(list);
      })
      .catch(() => {
        const fallback: PrayerTime[] = [
          { name: 'Fajr',    time: '05:12', arabic: 'الفجر' },
          { name: 'Sunrise', time: '06:48', arabic: 'الشروق' },
          { name: 'Dhuhr',   time: '12:48', arabic: 'الظهر' },
          { name: 'Asr',     time: '15:55', arabic: 'العصر' },
          { name: 'Maghrib', time: '19:02', arabic: 'المغرب' },
          { name: 'Isha',    time: '20:30', arabic: 'العشاء' },
        ];
        setPrayers(fallback);
        setLoading(false);
        updateNextPrayer(fallback);
      });
  }, []);
 
  const updateNextPrayer = (list: PrayerTime[]) => {
    if (!list.length) return;
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const idx = list.findIndex(p => {
      const [h, m] = p.time.split(':').map(Number);
      return h * 60 + m > cur;
    });
    setNextIndex(idx === -1 ? 0 : idx);
  };
 
  useEffect(() => {
    if (!prayers.length) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const tick = () => {
      const now = new Date();
      const cur = now.getHours() * 60 + now.getMinutes();
      const idx = prayers.findIndex(p => {
        const [h, m] = p.time.split(':').map(Number);
        return h * 60 + m > cur;
      });
      const ni = idx === -1 ? 0 : idx;
      setNextIndex(ni);
 
      const [h, m] = prayers[ni].time.split(':').map(Number);
      let diff = h * 60 + m - cur;
      if (diff < 0) diff += 24 * 60;
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      const secs = 59 - now.getSeconds();
      setCountdown(`${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`);
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [prayers]);
 
  const getCountdownColor = () => {
    if (!prayers.length) return '#1255A0';
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const [h, m] = prayers[nextIndex].time.split(':').map(Number);
    let diff = h * 60 + m - cur;
    if (diff < 0) diff += 24 * 60;
    if (diff <= 15) return '#EF4444';
    if (diff <= 60) return '#F59E0B';
    return '#1255A0';
  };
 
  const blue = '#1255A0';
  const bluePale = '#EBF4FF';
 
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#666' }}>
      Loading prayer times...
    </div>
  );
 
  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui' }}>
 
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '2px', color: blue, textTransform: 'uppercase', marginBottom: 4 }}>London Prayer Times</div>
        {hijriDate && <div style={{ fontSize: 13, color: '#999' }}>{hijriDate}</div>}
      </div>
 
      {/* Big countdown card */}
      {prayers.length > 0 && (
        <div style={{
          background: `linear-gradient(135deg, ${blue}, #2B7FD4)`,
          borderRadius: 20, padding: '32px 24px', textAlign: 'center', marginBottom: 24,
          boxShadow: '0 8px 32px rgba(18,85,160,0.25)',
        }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 }}>
            Next prayer
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 4 }}>
            {prayers[nextIndex].name}
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontFamily: 'serif' }}>
            {prayers[nextIndex].arabic}
          </div>
          <div style={{
            fontSize: 48, fontWeight: 800,
            color: getCountdownColor() === '#EF4444' ? '#FCA5A5' :
                   getCountdownColor() === '#F59E0B' ? '#FDE68A' : 'white',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-1px',
          }}>
            {countdown}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
            at {prayers[nextIndex].time}
          </div>
        </div>
      )}
 
      {/* Full timetable */}
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(18,85,160,0.07)', marginBottom: 24 }}>
        {prayers.map((p, i) => {
          const isNext = i === nextIndex;
          const [h, m] = p.time.split(':').map(Number);
          const now = new Date();
          const cur = now.getHours() * 60 + now.getMinutes();
          const passed = h * 60 + m < cur;
 
          return (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', padding: '16px 20px',
              borderBottom: i < prayers.length - 1 ? '1px solid #F0F5FF' : 'none',
              background: isNext ? bluePale : 'white',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 15, fontWeight: isNext ? 700 : 500,
                  color: isNext ? blue : passed ? '#BBB' : '#333',
                }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#BBB', fontFamily: 'serif', marginTop: 1 }}>{p.arabic}</div>
              </div>
              <div style={{
                fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                color: isNext ? blue : passed ? '#CCC' : '#444',
              }}>{p.time}</div>
              {isNext && (
                <div style={{
                  marginLeft: 12, background: blue, color: 'white',
                  fontSize: 10, fontWeight: 700, padding: '3px 8px',
                  borderRadius: 100, letterSpacing: '1px', textTransform: 'uppercase',
                }}>Next</div>
              )}
            </div>
          );
        })}
      </div>
 
      {/* Qibla card */}
      <div style={{
        background: 'white', borderRadius: 16, padding: '20px',
        boxShadow: '0 2px 16px rgba(18,85,160,0.07)', marginBottom: 24,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: blue, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>
          🧭 Qibla Direction — London
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: bluePale, border: `2px solid ${blue}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', flexShrink: 0,
          }}>
            {/* Compass needle pointing to Qibla ~119° from London */}
            <div style={{
              width: 4, height: 28, background: blue, borderRadius: 2,
              transform: 'rotate(119deg)',
              transformOrigin: 'bottom center',
              position: 'absolute', bottom: '50%', left: 'calc(50% - 2px)',
            }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: blue, position: 'relative', zIndex: 1 }}>🕋</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>119°</div>
            <div style={{ fontSize: 13, color: '#666' }}>South-East from London</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Towards Makkah al-Mukarramah</div>
          </div>
        </div>
      </div>
 
      {/* Calculation method note */}
      <div style={{ fontSize: 12, color: '#BBB', textAlign: 'center' }}>
        Calculation method: ISNA · Source: Aladhan API 🌙
      </div>
    </div>
  );
}
 
