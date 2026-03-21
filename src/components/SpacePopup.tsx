import { useState } from 'react';
import { X, Navigation, CheckCircle, MapPin, Clock, Compass } from 'lucide-react';
import { Space } from '../lib/supabase';
 
interface SpacePopupProps {
  space: Space;
  onClose: () => void;
  onCheckIn: (spaceId: string) => void;
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
 
function getDaysAgo(dateString: string | null): string {
  if (!dateString) return 'Not yet visited';
  const date = new Date(dateString);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}
 
export default function SpacePopup({ space, onClose, onCheckIn }: SpacePopupProps) {
  const [checkInDone, setCheckInDone] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
 
  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}`;
    window.open(url, '_blank');
  };
 
  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    await onCheckIn(space.id);
    setIsCheckingIn(false);
    setCheckInDone(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };
 
  const blue = '#2B7FD4';
  const badgeStyle = getTypeBadgeStyle(space.type);
 
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
      }}>
        {/* Check-in success overlay */}
        {checkInDone && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.96)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', borderRadius: '20px', zIndex: 10,
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0C1B2E', marginBottom: '8px' }}>
              Checked in!
            </div>
            <div style={{ fontSize: '15px', color: '#3D5A7A', marginBottom: '4px' }}>
              +2 points earned
            </div>
            <div style={{ fontSize: '13px', color: '#7A9BBF' }}>
              JazakAllah khayran 🤲
            </div>
          </div>
        )}
 
        {/* Photo */}
        {space.photo_url && (
          <div style={{ height: '220px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
            <img src={space.photo_url} alt={space.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
 
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  ...badgeStyle, fontSize: '11px', fontWeight: 700,
                  padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.5px',
                }}>
                  {getTypeEmoji(space.type)} {space.type}
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0C1B2E', margin: 0 }}>{space.name}</h2>
            </div>
            <button onClick={onClose} style={{
              background: '#F6FAFE', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', color: '#7A9BBF', flexShrink: 0, marginLeft: '12px',
            }}>✕</button>
          </div>
 
          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px', marginTop: '2px' }}>📍</span>
              <div>
                <div style={{ fontSize: '11px', color: '#7A9BBF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Address</div>
                <div style={{ fontSize: '14px', color: '#0C1B2E' }}>{space.address}</div>
              </div>
            </div>
 
            {space.description && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', marginTop: '2px' }}>💬</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#7A9BBF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>What to expect</div>
                  <div style={{ fontSize: '14px', color: '#0C1B2E', lineHeight: 1.6 }}>{space.description}</div>
                </div>
              </div>
            )}
 
            {space.best_times && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', marginTop: '2px' }}>🕐</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#7A9BBF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Best times</div>
                  <div style={{ fontSize: '14px', color: '#0C1B2E' }}>{space.best_times}</div>
                </div>
              </div>
            )}
 
            {space.qibla_notes && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', marginTop: '2px' }}>🧭</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#7A9BBF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Qibla direction</div>
                  <div style={{ fontSize: '14px', color: '#0C1B2E' }}>{space.qibla_notes}</div>
                </div>
              </div>
            )}
 
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px', marginTop: '2px' }}>✅</span>
              <div>
                <div style={{ fontSize: '11px', color: '#7A9BBF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Last visited</div>
                <div style={{ fontSize: '14px', color: '#0C1B2E' }}>{getDaysAgo(space.last_checkin)}</div>
              </div>
            </div>
          </div>
 
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDirections} style={{
              flex: 1, background: blue, color: 'white', border: 'none',
              padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'system-ui', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              🗺️ Get Directions
            </button>
            <button onClick={handleCheckIn} disabled={isCheckingIn || checkInDone} style={{
              flex: 1, background: checkInDone ? '#DCFCE7' : '#EBF4FF',
              color: checkInDone ? '#166534' : blue,
              border: `2px solid ${checkInDone ? '#86EFAC' : '#C4DEFA'}`,
              padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'system-ui', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: isCheckingIn ? 0.7 : 1,
            }}>
              {checkInDone ? '✅ Checked in!' : isCheckingIn ? 'Checking in...' : '✓ Check In'}
            </button>
          </div>
 
          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11px', color: '#7A9BBF' }}>
            Check in earns you 2 points and keeps this space live for others 🤲
          </div>
        </div>
      </div>
    </div>
  );
}
 
