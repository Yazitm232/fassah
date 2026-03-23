import { useState, useEffect } from 'react';
import { fetchLeaderboard, getOrCreateSession } from '../lib/supabase';
 
interface LeaderEntry {
  username: string;
  points: number;
}
 
const AVIS = ['🦁','🌙','🌿','🔥','🕊️','⭐','🌊','🏔️','🌸','✨'];
 
export default function Leaderboard() {
  const [board, setBoard] = useState<LeaderEntry[]>([]);
  const [myUsername, setMyUsername] = useState('');
  const [myPoints, setMyPoints] = useState(0);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
 
  useEffect(() => {
    const init = async () => {
      const [data, session] = await Promise.all([
        fetchLeaderboard(),
        getOrCreateSession(),
      ]);
      setBoard(data);
      setMyUsername(session.username);
      setMyPoints(session.points);
 
      const rank = data.findIndex(e => e.username === session.username);
      setMyRank(rank === -1 ? null : rank + 1);
      setLoading(false);
    };
    init();
  }, []);
 
  const handleInvite = () => {
    const text = `I'm mapping prayer spaces across the UK with Fassah 🕌 — join me and help the ummah find somewhere to pray. fassah.com/?ref=${myUsername}`;
    if (navigator.share) {
      navigator.share({ title: 'Fassah', text, url: `https://fassah.com/?ref=${myUsername}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  };
 
  const blue = '#1255A0';
  const gold = '#E8A020';
  const silver = '#B0C4DE';
  const bronze = '#CD9B6A';
 
  const podiumColors = [silver, gold, bronze];
  const podiumOrder = board.length >= 3 ? [1, 0, 2] : [];  // 2nd, 1st, 3rd
 
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#666' }}>
      Loading leaderboard...
    </div>
  );
 
  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui' }}>
 
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '2px', color: blue, textTransform: 'uppercase', marginBottom: 6 }}>Top Contributors</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>The Fassah Leaderboard</div>
        <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Every check-in is still earning reward long after you've forgotten about it. ✨</div>
      </div>
 
      {/* YOUR SCORE CARD */}
      <div style={{
        background: `linear-gradient(135deg, ${blue}, #2B7FD4)`,
        borderRadius: 16, padding: '16px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {AVIS[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{myUsername}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
            {myRank ? `Rank #${myRank}` : 'Not yet ranked'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>{myPoints}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>pts</div>
        </div>
      </div>
 
      {/* PODIUM — top 3 */}
      {board.length >= 3 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            {podiumOrder.map((idx) => {
              const entry = board[idx];
              const rank = idx + 1;
              const height = rank === 1 ? 80 : rank === 2 ? 64 : 52;
              const color = podiumColors[idx];
              const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{AVIS[idx]}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#333', maxWidth: 90, textAlign: 'center', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.username.split('_')[0]}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: color, marginBottom: 4 }}>{entry.points} pts</div>
                  <div style={{
                    width: '100%', height, background: color,
                    borderRadius: '8px 8px 0 0', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{emoji}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
 
      {/* Ranks 4-10 */}
      {board.length > 3 && (
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(18,85,160,0.07)', marginBottom: 24 }}>
          {board.slice(3).map((entry, i) => {
            const rank = i + 4;
            const isMe = entry.username === myUsername;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < board.slice(3).length - 1 ? '1px solid #F0F5FF' : 'none',
                background: isMe ? '#EBF4FF' : 'white',
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#AAA', width: 20, textAlign: 'center' }}>{rank}</span>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: '#EBF4FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>{AVIS[rank % AVIS.length]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: isMe ? 700 : 500, color: isMe ? blue : '#333' }}>
                    {entry.username}
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#6AAEE8' }}>{entry.points} pts</span>
              </div>
            );
          })}
        </div>
      )}
 
      {board.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#BBB' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
          <div style={{ fontWeight: 700, color: '#555', marginBottom: 4 }}>Be the first to earn points</div>
          <div style={{ fontSize: 13 }}>Check in to a space or add a new one to get started.</div>
        </div>
      )}
 
      {/* Islamic copy — subtle, not preachy */}
      <div style={{
        background: '#FFF9ED', border: '1px solid #FDE68A', borderRadius: 14,
        padding: '16px 18px', marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, color: '#7A5B00', lineHeight: 1.6 }}>
          "The place you add today could help a brother or sister pray five years from now. Imagine the reward. One click away."
        </div>
      </div>
 
      {/* INVITE A FRIEND */}
      <div style={{
        background: 'white', borderRadius: 16, padding: '20px',
        boxShadow: '0 2px 16px rgba(18,85,160,0.07)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>
          Challenge a friend to beat your score 🤝
        </div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 1.5 }}>
          Invite a friend — when they make their first check-in, you both earn <strong style={{ color: blue }}>+5 bonus points</strong>.
        </div>
        <button onClick={handleInvite} style={{
          width: '100%', padding: '13px',
          background: `linear-gradient(135deg, ${blue}, #2B7FD4)`,
          color: 'white', border: 'none', borderRadius: 12,
          fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {copied ? '✅ Link copied!' : '📲 Share Fassah with a friend'}
        </button>
      </div>
    </div>
  );
}
