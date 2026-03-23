import React, { useState, useEffect } from 'react';
import { Space, checkInToSpace, fetchRecentCheckins, getOrCreateSession, addPoints } from '../lib/supabase';

interface SpacePopupProps {
  space: Space;
  onClose: () => void;
}

const SpacePopup: React.FC<SpacePopupProps> = ({ space, onClose }) => {
  const [stage, setStage] = useState<'idle' | 'questions' | 'done'>('idle');
  const [answers, setAnswers] = useState<{ is_open: boolean | null; is_busy: boolean | null; wudu_available: boolean | null }>({
    is_open: null, is_busy: null, wudu_available: null,
  });
  const [checkinSummary, setCheckinSummary] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    getOrCreateSession().then(s => setSessionId(s.sessionId));
    fetchRecentCheckins(space.id).then(data => {
      if (data.length === 0) return;
      const recent = data.slice(0, 5);
      const openCount = recent.filter(c => c.is_open).length;
      const busyCount = recent.filter(c => c.is_busy).length;
      const wuduCount = recent.filter(c => c.wudu_available).length;
      const parts: string[] = [];
      if (openCount >= Math.ceil(recent.length / 2)) parts.push('Usually open');
      if (busyCount >= Math.ceil(recent.length / 2)) parts.push('can be busy');
      else parts.push('usually quiet');
      if (wuduCount >= Math.ceil(recent.length / 2)) parts.push('wudu available');
      setCheckinSummary(parts.join(' · '));
    });
  }, [space.id]);

  const handleCheckinSubmit = async () => {
    if (answers.is_open === null || answers.is_busy === null || answers.wudu_available === null) return;
    const success = await checkInToSpace(space.id, sessionId, {
      is_open: answers.is_open,
      is_busy: answers.is_busy,
      wudu_available: answers.wudu_available,
    });
    if (success) {
      await addPoints(sessionId, 2);
      setEarnedPoints(2);
      setStage('done');
      setTimeout(onClose, 2500);
    }
  };

  const formatLastCheckin = (ts?: string) => {
    if (!ts) return 'No check-ins yet';
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '20px 20px 0 0', width: '100%',
        maxWidth: 480, padding: '24px', paddingBottom: '32px',
        maxHeight: '85vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>

        {stage === 'idle' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <span style={{
                  background: '#EFF6FF', color: '#1255A0', fontSize: 11,
                  fontWeight: 600, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase',
                }}>{space.type}</span>
                <h2 style={{ margin: '8px 0 4px', fontSize: 20, fontWeight: 700, color: '#111' }}>{space.name}</h2>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>{space.address}</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>✕</button>
            </div>

            {space.photo_url && (
              <img src={space.photo_url} alt={space.name} style={{
                width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 12,
              }} />
            )}

            {checkinSummary && (
              <div style={{
                background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10,
                padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#166534',
              }}>
                📊 {checkinSummary}
              </div>
            )}

            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginBottom: 12 }}>{space.description}</p>

            {space.best_times && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>🕐 Best times: </span>
                <span style={{ fontSize: 13, color: '#666' }}>{space.best_times}</span>
              </div>
            )}
            {space.qibla_notes && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>🧭 Qibla: </span>
                <span style={{ fontSize: 13, color: '#666' }}>{space.qibla_notes}</span>
              </div>
            )}

            <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
              Last check-in: {formatLastCheckin(space.last_checkin)}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              
                href={`https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: '2px solid #1255A0',
                  color: '#1255A0', fontWeight: 600, fontSize: 14, textAlign: 'center',
                  textDecoration: 'none', display: 'block',
                }}
              >
                Get Directions
              </a>
              <button onClick={() => setStage('questions')} style={{
                flex: 1, padding: '12px', borderRadius: 12,
                background: 'linear-gradient(135deg, #1255A0, #2B7FD4)',
                color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
              }}>
                ✓ Check In (+2 pts)
              </button>
            </div>
          </>
        )}

        {stage === 'questions' && (
          <>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Quick check-in</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#666' }}>Help the community with 3 quick questions</p>

            {[
              { key: 'is_open', question: 'Is the space currently open / accessible?' },
              { key: 'is_busy', question: 'Is it busy right now?' },
              { key: 'wudu_available', question: 'Is wudu (washing) facility available?' },
            ].map(({ key, question }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#333' }}>{question}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label, value }) => {
                    const current = answers[key as keyof typeof answers];
                    const active = current === value;
                    return (
                      <button key={label} onClick={() => setAnswers(prev => ({ ...prev, [key]: value }))} style={{
                        flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                        border: active ? '2px solid #1255A0' : '2px solid #e5e7eb',
                        background: active ? '#EFF6FF' : '#fff',
                        color: active ? '#1255A0' : '#666', cursor: 'pointer',
                      }}>{label}</button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={handleCheckinSubmit}
              disabled={answers.is_open === null || answers.is_busy === null || answers.wudu_available === null}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, marginTop: 8,
                background: answers.is_open !== null && answers.is_busy !== null && answers.wudu_available !== null
                  ? 'linear-gradient(135deg, #1255A0, #2B7FD4)' : '#e5e7eb',
                color: answers.is_open !== null && answers.is_busy !== null && answers.wudu_available !== null
                  ? '#fff' : '#999',
                fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
              }}
            >
              Submit Check-In
            </button>
          </>
        )}

        {stage === 'done' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🕌</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>JazakAllah Khayran</h3>
            <p style={{ color: '#666', fontSize: 15, margin: '0 0 16px' }}>Your check-in helps the community</p>
            <div style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #1255A0, #2B7FD4)',
              color: '#fff', padding: '10px 24px', borderRadius: 20, fontWeight: 700, fontSize: 16,
            }}>
              +{earnedPoints} points earned ✨
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpacePopup;
