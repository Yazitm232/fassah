import { useState, useEffect } from 'react';
import { getOrCreateSession } from '../lib/supabase';
 
export default function Settings() {
  const [username, setUsername] = useState('');
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    getOrCreateSession().then(s => {
      setUsername(s.username);
      setPoints(s.points);
      setLoading(false);
    });
  }, []);
 
  const blue = '#1255A0';
  const bluePale = '#EBF4FF';
 
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#AAA',
        textTransform: 'uppercase', letterSpacing: '1.5px',
        marginBottom: 8, paddingLeft: 4,
      }}>{title}</div>
      <div style={{
        background: 'white', borderRadius: 14,
        overflow: 'hidden', boxShadow: '0 2px 12px rgba(18,85,160,0.06)',
      }}>
        {children}
      </div>
    </div>
  );
 
  const Row = ({
    icon, label, value, chevron = false, onPress,
  }: {
    icon: string; label: string; value?: string; chevron?: boolean; onPress?: () => void;
  }) => (
    <div onClick={onPress} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      borderBottom: '1px solid #F5F8FF',
      cursor: onPress ? 'pointer' : 'default',
    }}>
      <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{label}</div>
      </div>
      {value && <span style={{ fontSize: 13, color: '#888' }}>{value}</span>}
      {chevron && <span style={{ color: '#CCC', fontSize: 16 }}>›</span>}
    </div>
  );
 
  const handleShare = () => {
    const text = 'Find prayer spaces across the UK with Fassah 🕌 — built by Muslims, for Muslims. Free forever. fassah.com';
    if (navigator.share) {
      navigator.share({ title: 'Fassah', text, url: 'https://fassah.com' }).catch(() => {});
    } else {
      navigator.clipboard.writeText('https://fassah.com').then(() => alert('Link copied!'));
    }
  };
 
  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui' }}>
 
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>Settings</div>
      </div>
 
      {loading ? (
        <div style={{ textAlign: 'center', color: '#AAA', padding: 40 }}>Loading...</div>
      ) : (
        <>
          {/* Profile card */}
          <div style={{
            background: `linear-gradient(135deg, ${blue}, #2B7FD4)`,
            borderRadius: 18, padding: '20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>🦁</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{username}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Your anonymous username</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>{points}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>points</div>
            </div>
          </div>
 
          {/* Points reminder */}
          <div style={{
            background: '#FFF9ED', border: '1px solid #FDE68A',
            borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#7A5B00',
          }}>
            These points are the least of what you're earning. 🤲
          </div>
 
          <Section title="Your Contributions">
            <Row icon="📍" label="Spaces added" value="See map" chevron />
            <Row icon="✅" label="Check-ins done" value={`${Math.floor(points / 2)} approx`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: blue }}>{points}</div>
                <div style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>Total points</div>
              </div>
              <div style={{ width: 1, background: '#F0F5FF' }} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: blue }}>+2</div>
                <div style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>Per check-in</div>
              </div>
              <div style={{ width: 1, background: '#F0F5FF' }} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: blue }}>+10</div>
                <div style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>Per space added</div>
              </div>
            </div>
          </Section>
 
          <Section title="App">
            <Row icon="ℹ️" label="About Fassah" value="v1.0" chevron />
            <Row icon="🔒" label="Privacy Policy" chevron onPress={() => window.open('https://fassah.com/privacy', '_blank')} />
            <Row icon="❓" label="How points work" chevron />
            <Row icon="📲" label="Share Fassah" chevron onPress={handleShare} />
          </Section>
 
          <Section title="Support">
            <Row icon="🚩" label="Report a space issue" chevron onPress={() => window.open('mailto:hello@fassah.com?subject=Space report', '_blank')} />
            <Row icon="✉️" label="Contact us" value="hello@fassah.com" chevron onPress={() => window.open('mailto:hello@fassah.com', '_blank')} />
          </Section>
 
          <Section title="Legal">
            <Row icon="📄" label="Privacy Policy" chevron onPress={() => window.open('https://fassah.com/privacy', '_blank')} />
            <Row icon="📋" label="Terms of use" chevron />
          </Section>
 
          <div style={{
            textAlign: 'center', fontSize: 12, color: '#CCC',
            marginTop: 8, lineHeight: 1.8,
          }}>
            <div>© 2026 Fassah · Built for the ummah · UK</div>
            <div style={{ fontSize: 16, letterSpacing: '2px', marginTop: 4 }}>بِسْمِ اللهِ</div>
            <div style={{ marginTop: 4 }}>Free to use · Always · No ads · No data sold · Ever.</div>
          </div>
        </>
      )}
    </div>
  );
}
 
