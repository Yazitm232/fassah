import { useState } from 'react';
import { Space } from '../lib/supabase';

interface SpacePopupProps {
  space: Space;
  onClose: () => void;
  onCheckIn: (spaceId: string) => void;
}

function getTypeBadgeStyle(type: string) {
  switch (type) {
    case 'Outdoor Space': return { background: '#DCFCE7', color: '#166534' };
    case 'Multi-faith Room': return { background: '#DBEAFE', color: '#1E40AF' };
    case 'Friendly Business': return { background: '#EDE9FE', color: '#6B21A8' };
    case 'Community Home': return { background: '#FEF3C7', color: '#92400E' };
    case 'Mosque': return { background: '#E0F2FE', color: '#075985' };
    default: return { background: '#F3F4F6', color: '#374151' };
  }
}

function getTypeEmoji(type: string): string {
  switch (type) {
    case 'Outdoor Space': return '🌿';
    case 'Multi-faith Room': return '🏢';
    case 'Friendly Business': return '🏪';
    case 'Community Home': return '🏠';
    case 'Mosque': return '🕌';
    default: return '📍';
  }
}

function getDaysAgo(dateString: string | null): string {
  if (!dateString) return 'Not yet visited';
  const date = new Date(dateString);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

type CheckInStep = 'idle' | 'questions' | 'done';

export default function SpacePopup({ space, onClose, onCheckIn }: SpacePopupProps) {
  const [step, setStep] = useState<CheckInStep>('idle');
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [isBusy, setIsBusy] = useState<boolean | null>(null);
  const [wuduAvailable, setWuduAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const blue = '#2B7FD4';
  const blueDark = '#1A5FAA';
  const bluePale = '#EBF4FF';
  const badgeStyle = getTypeBadgeStyle(space.type);

  const handleDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}`, '_blank');
  };

  const handleStartCheckIn = () => {
    setStep('questions');
  };

  const handleSubmitCheckIn = async () => {
    setIsSubmitting(true);
    await onCheckIn(space.id);
    setIsSubmitting(false);
    setStep('done');
    setTimeout(() => onClose(), 2500);
  };

  const allAnswered = isOpen !== null && isBusy !== null && wuduAvailable !== null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '16px',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        maxWidth: '520px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        position: 'relative',
      }}>

        {/* DONE SCREEN */}
        {step === 'done' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', borderRadius: '20px', zIndex: 10, padding: '32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0C1B2E', marginBottom: '8px' }}>Checked in!</div>
            <div style={{ fontSize: '15px', color: '#3D5A7A', marginBottom: '4px' }}>+2 points earned</div>
            <div style={{ fontSize: '13px', color: '#7A9BBF' }}>JazakAllah khayran — you just helped the next person 🤲</div>
          </div>
        )}

        {/* PHOTO */}
        {space.photo_url && (
          <div style={{ height: '200px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
            <img src={space.photo_url} alt={space.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ padding: '24px' }}>
          {/* HEADER */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ ...badgeStyle, fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', display: 'inline-block', marginBottom: '8px' }}>
                {getTypeEmoji(space.type)} {space.type}
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0C1B2E', margin: 0 }}>{space.name}</h2>
            </div>
            <button onClick={onClose} style={{ background: '#F6FAFE', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', color: '#7A9BBF', flexShrink: 0, marginLeft: '12px' }}>✕</button>
          </div>

          {/* DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <Row icon="📍" label="Address" value={space.address} />
            {space.description && <Row icon="💬" label="What to expect" value={space.description} />}
            {space.best_times && <Row icon="🕐" label="Best times" value={space.best_times} />}
            {space.qibla_notes && <Row icon="🧭" label="Qibla" value={space.qibla_notes} />}
            <Row icon="✅" label="Last visited" value={getDaysAgo(space.last_checkin)} />
          </div>

          {/* CHECKIN QUESTIONS */}
          {step === 'questions' && (
            <div style={{ background: bluePale, borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: blueDark, marginBottom: '14px' }}>
                Quick check — helps the next person 🤲
              </div>

              <Question
                q="Is the space currently open?"
                value={isOpen}
                onChange={setIsOpen}
                yes="Yes, open" no="Closed"
                blue={blue}
              />
              <Question
                q="How busy is it?"
                value={isBusy}
                onChange={setIsBusy}
                yes="Busy" no="Quiet"
                blue={blue}
              />
              <Question
                q="Is wudu available?"
                value={wuduAvailable}
                onChange={setWuduAvailable}
                yes="Yes" no="No"
                blue={blue}
              />

              {allAnswered && (
                <button onClick={handleSubmitCheckIn} disabled={isSubmitting} style={{
                  width: '100%', background: blue, color: 'white', border: 'none',
                  padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'system-ui', marginTop: '8px',
                }}>
                  {isSubmitting ? 'Submitting...' : 'Submit check-in (+2 pts)'}
                </button>
              )}
            </div>
          )}

          {/* BUTTONS */}
          {step === 'idle' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleDirections} style={{
                flex: 1, background: blue, color: 'white', border: 'none',
                padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'system-ui',
              }}>🗺️ Get Directions</button>
              <button onClick={handleStartCheckIn} style={{
                flex: 1, background: bluePale, color: blue,
                border: `2px solid #C4DEFA`, padding: '13px', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui',
              }}>✓ Check In</button>
            </div>
          )}

          {step === 'idle' && (
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#7A9BBF', marginTop: '10px' }}>
              Check in earns 2 points and helps others know this space is active 🤲
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '15px', marginTop: '2px' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '10px', color: '#7A9BBF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: '#0C1B2E', lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  );
}

function Question({ q, value, onChange, yes, no, blue }: {
  q: string; value: boolean | null;
  onChange: (v: boolean) => void;
  yes: string; no: string; blue: string;
}) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', color: '#0C1B2E', fontWeight: 500, marginBottom: '8px' }}>{q}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={() => onChange(true)} style={{
          flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
          border: `1.5px solid ${value === true ? blue : '#D4E6F5'}`,
          background: value === true ? blue : 'white',
          color: value === true ? 'white' : '#3D5A7A',
          cursor: 'pointer', fontFamily: 'system-ui',
        }}>{yes}</button>
        <button type="button" onClick={() => onChange(false)} style={{
          flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
          border: `1.5px solid ${value === false ? '#EF4444' : '#D4E6F5'}`,
          background: value === false ? '#FEE2E2' : 'white',
          color: value === false ? '#991B1B' : '#3D5A7A',
          cursor: 'pointer', fontFamily: 'system-ui',
        }}>{no}</button>
      </div>
    </div>
  );
}
