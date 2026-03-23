import { useState, useEffect } from 'react';
import { supabase, Space } from '../lib/supabase';
 
const ADMIN_PIN = '786786';
 
export default function Admin() {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [pending, setPending] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
 
  useEffect(() => {
    if (unlocked) loadPending();
  }, [unlocked]);
 
  const handlePin = () => {
    if (pin === ADMIN_PIN) {
      setUnlocked(true);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  };
 
  const loadPending = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .eq('verified', false)
      .order('created_at', { ascending: false });
    setPending(data ?? []);
    setLoading(false);
  };
 
  const approve = async (id: string) => {
    await supabase.from('spaces').update({ verified: true }).eq('id', id);
    setMessage('✅ Approved');
    setTimeout(() => setMessage(''), 2000);
    loadPending();
  };
 
  const reject = async (id: string) => {
    await supabase.from('spaces').delete().eq('id', id);
    setMessage('🗑️ Rejected');
    setTimeout(() => setMessage(''), 2000);
    loadPending();
  };
 
  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', background: '#0C1B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '320px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🕌</div>
          <div style={{ fontWeight: 800, fontSize: '20px', color: '#0C1B2E', marginBottom: '6px' }}>Fassah Admin</div>
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '24px' }}>Enter your PIN to continue</p>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePin()}
            placeholder="PIN"
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', fontSize: '18px', textAlign: 'center',
              border: pinError ? '2px solid #ef4444' : '2px solid #e5e7eb',
              outline: 'none', fontFamily: 'system-ui', boxSizing: 'border-box',
              background: pinError ? '#FEF2F2' : 'white',
            }}
          />
          {pinError && <p style={{ color: '#ef4444', fontSize: '13px', margin: '8px 0 0' }}>Incorrect PIN</p>}
          <button
            onClick={handlePin}
            style={{
              width: '100%', marginTop: '16px', padding: '13px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #1255A0, #2B7FD4)', color: 'white',
              fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer',
            }}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div style={{ minHeight: '100vh', background: '#F6FAFE', fontFamily: 'system-ui' }}>
      <div style={{ background: 'linear-gradient(135deg, #1255A0, #2B7FD4)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'white' }}>
          <div style={{ fontWeight: 800, fontSize: '18px' }}>🕌 Fassah Admin</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>Space approval dashboard</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {message && (
            <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
              {message}
            </span>
          )}
          <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
            {pending.length} pending
          </span>
          <button
            onClick={loadPending}
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>
 
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>Loading submissions...</div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '20px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: '18px', color: '#0C1B2E', marginBottom: '8px' }}>All clear</div>
            <div style={{ fontSize: '14px' }}>No pending submissions right now.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pending.map(space => (
              <div key={space.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {space.photo_url && (
                    <img
                      src={space.photo_url}
                      alt={space.name}
                      style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <span style={{ background: '#EFF6FF', color: '#1255A0', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px' }}>
                          {space.type}
                        </span>
                        <h3 style={{ margin: '6px 0 2px', fontSize: '17px', fontWeight: 700, color: '#0C1B2E' }}>{space.name}</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>📍 {space.address}</p>
                      </div>
                      <div style={{ fontSize: '11px', color: '#999', textAlign: 'right' }}>
                        {new Date(space.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <p style={{ margin: '8px 0', fontSize: '13px', color: '#444', lineHeight: 1.6 }}>{space.description}</p>
                    {space.best_times && (
                      <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>🕐 {space.best_times}</p>
                    )}
                    {space.qibla_notes && (
                      <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>🧭 {space.qibla_notes}</p>
                    )}
                    <p style={{ margin: '4px 0', fontSize: '11px', color: '#999' }}>
                      Coords: {space.latitude?.toFixed(4)}, {space.longitude?.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <a
                    href={`https://www.google.com/maps?q=${space.latitude},${space.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '9px 18px', borderRadius: '10px', border: '1.5px solid #e5e7eb', color: '#555', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                  >
                    🗺️ View on Maps
                  </a>
                  <button
                    onClick={() => approve(space.id)}
                    style={{ padding: '9px 24px', borderRadius: '10px', border: 'none', background: '#22C55E', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => reject(space.id)}
                    style={{ padding: '9px 24px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
