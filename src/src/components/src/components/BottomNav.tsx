import { useState, useEffect } from 'react';
 
interface BottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}
 
export default function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => { setMounted(true); }, []);
 
  const tabs = [
    { id: 'map', label: 'Map', emoji: '🗺️' },
    { id: 'prayer', label: 'Prayer', emoji: '🌙' },
    { id: 'leaderboard', label: 'Leaderboard', emoji: '🏆' },
    { id: 'settings', label: 'Settings', emoji: '⚙️' },
  ];
 
  if (!mounted) return null;
 
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'white',
      borderTop: '1px solid #EDF3FB',
      display: 'flex',
      boxShadow: '0 -4px 20px rgba(18,85,160,0.08)',
    }}>
      {tabs.map(tab => {
        const active = activePage === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              flex: 1,
              padding: '10px 0 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              position: 'relative',
            }}
          >
            {active && (
              <span style={{
                position: 'absolute', top: 0, left: '25%', right: '25%',
                height: '3px', background: '#1255A0', borderRadius: '0 0 4px 4px',
              }} />
            )}
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.emoji}</span>
            <span style={{
              fontSize: '10px', fontWeight: active ? 700 : 400,
              color: active ? '#1255A0' : '#999',
              fontFamily: 'system-ui',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
 
