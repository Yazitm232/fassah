import { useState, useEffect, useRef } from 'react';
import MapView from './components/MapView';
import SpacePopup from './components/SpacePopup';
import SubmitSpaceForm from './components/SubmitSpaceForm';
import { fetchVerifiedSpaces, fetchLeaderboard, getOrCreateSession, Space } from './lib/supabase';
 
// ─── BOTTOM NAV ───────────────────────────────────────────────
function BottomNav({ activePage, onNavigate }: { activePage: string; onNavigate: (p: string) => void }) {
  const tabs = [
    { id: 'map', label: 'Map', emoji: '🗺️' },
    { id: 'prayer', label: 'Prayer', emoji: '🌙' },
    { id: 'leaderboard', label: 'Leaderboard', emoji: '🏆' },
    { id: 'settings', label: 'Settings', emoji: '⚙️' },
  ];
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:9999, background:'white', borderTop:'1px solid #EDF3FB', display:'flex', boxShadow:'0 -4px 20px rgba(18,85,160,0.08)' }}>
      {tabs.map(tab => {
        const active = activePage === tab.id;
        return (
          <button key={tab.id} onClick={() => onNavigate(tab.id)} style={{ flex:1, padding:'10px 0 14px', border:'none', background:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, position:'relative' }}>
            {active && <span style={{ position:'absolute', top:0, left:'25%', right:'25%', height:3, background:'#1255A0', borderRadius:'0 0 4px 4px' }} />}
            <span style={{ fontSize:20, lineHeight:1 }}>{tab.emoji}</span>
            <span style={{ fontSize:10, fontWeight:active?700:400, color:active?'#1255A0':'#999', fontFamily:'system-ui', textTransform:'uppercase', letterSpacing:'0.5px' }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
 
// ─── PRAYER TIMES PAGE (with Qibla as hero) ───────────────────
function PrayerTimes() {
  const [prayers, setPrayers] = useState<{name:string;time:string;arabic:string}[]>([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [heading, setHeading] = useState<number | null>(null);
  const [compassPermission, setCompassPermission] = useState<'unknown'|'granted'|'denied'|'unavailable'>('unknown');
  const [showTimetable, setShowTimetable] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
 
  const QIBLA = 119;
 
  // ── Prayer times ──
  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=London&country=GB&method=2')
      .then(r => r.json()).then(data => {
        const t = data.data.timings;
        const list = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'].map(name => ({
          name, time: t[name],
          arabic: ({Fajr:'الفجر',Sunrise:'الشروق',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'} as Record<string,string>)[name],
        }));
        setPrayers(list);
        const h = data.data.date.hijri;
        setHijriDate(`${h.day} ${h.month.en} ${h.year} AH`);
      }).catch(() => {
        setPrayers([
          {name:'Fajr',time:'05:12',arabic:'الفجر'},{name:'Sunrise',time:'06:48',arabic:'الشروق'},
          {name:'Dhuhr',time:'12:48',arabic:'الظهر'},{name:'Asr',time:'15:55',arabic:'العصر'},
          {name:'Maghrib',time:'19:02',arabic:'المغرب'},{name:'Isha',time:'20:30',arabic:'العشاء'},
        ]);
      });
  }, []);
 
  useEffect(() => {
    if (!prayers.length) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const tick = () => {
      const now = new Date();
      const cur = now.getHours()*60+now.getMinutes();
      const idx = prayers.findIndex(p => { const [h,m]=p.time.split(':').map(Number); return h*60+m>cur; });
      const ni = idx===-1?0:idx;
      setNextIndex(ni);
      const [h,m] = prayers[ni].time.split(':').map(Number);
      let diff = h*60+m-cur; if(diff<0) diff+=24*60;
      const hrs = Math.floor(diff/60);
      const mins = diff%60;
      const secs = 59-now.getSeconds();
      setCountdown(`${hrs>0?hrs+'h ':''} ${mins}m ${secs < 10 ? '0'+secs : secs}s`);
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if(intervalRef.current) clearInterval(intervalRef.current); };
  }, [prayers]);
 
  // ── Compass ──
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
    } else {
      setCompassPermission('unavailable');
    }
  };
 
  const needleRot = heading !== null ? QIBLA - heading : 0;
  const normalised = ((needleRot % 360) + 360) % 360;
  const nextPrayer = prayers[nextIndex];
  const followingPrayer = prayers[(nextIndex + 1) % prayers.length];
 
  // Gold colour palette
  const gold = '#C9A84C';
  const goldLight = '#F0D080';
  const goldDark = '#7A5C1E';
  const darkBg = '#1A1008';
  const darkCard = '#211508';
  const blue = '#1255A0';
 
  return (
    <div style={{ minHeight:'100vh', background: darkBg, fontFamily:'system-ui', paddingBottom:80 }}>
 
      {/* ── TOP STRIP: next prayer countdown ── */}
      <div style={{ padding:'20px 20px 0' }}>
        {nextPrayer && (
          <div style={{
            background: darkCard,
            border: `1px solid ${goldDark}`,
            borderRadius: 18,
            padding: '18px 22px',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize:11, color: gold, textTransform:'uppercase', letterSpacing:'2px', marginBottom:4 }}>Next Prayer</div>
              <div style={{ fontSize:26, fontWeight:800, color:'white' }}>{nextPrayer.name}</div>
              <div style={{ fontSize:13, color: goldLight, fontFamily:'serif', marginTop:2 }}>{nextPrayer.arabic}</div>
            </div>
            <div style={{ textAlign:'right' as const }}>
              <div style={{ fontSize:28, fontWeight:800, color: goldLight, fontVariantNumeric:'tabular-nums', letterSpacing:'-1px' }}>{countdown}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>at {nextPrayer.time}</div>
              {followingPrayer && (
                <div style={{ fontSize:11, color: gold, marginTop:6 }}>
                  Then {followingPrayer.name} · {followingPrayer.time}
                </div>
              )}
            </div>
          </div>
        )}
 
        {/* ── QIBLA COMPASS — hero ── */}
        <div style={{
          background: darkCard,
          border: `1px solid ${goldDark}`,
          borderRadius: 22,
          padding: '24px 20px',
          marginBottom: 16,
          display: 'flex', flexDirection:'column', alignItems:'center',
        }}>
          <div style={{ fontSize:12, color: gold, textTransform:'uppercase', letterSpacing:'3px', marginBottom:4 }}>Qibla Compass</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:20 }}>Hold flat · arrow points to Makkah</div>
 
          {compassPermission === 'unknown' && (
            <div style={{ textAlign:'center' as const, paddingBottom:8 }}>
              {/* Static preview compass */}
              <CompassFace needleRot={QIBLA} gold={gold} goldLight={goldLight} goldDark={goldDark} active={false} />
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:20, lineHeight:1.6 }}>
                Tap to activate live compass.<br/>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>No location stored.</span>
              </div>
              <button onClick={requestCompass} style={{
                padding:'13px 32px', borderRadius:100,
                background:`linear-gradient(135deg, ${goldDark}, ${gold})`,
                color:'#1A1008', border:`1px solid ${goldLight}`,
                fontSize:14, fontWeight:800, cursor:'pointer', letterSpacing:'1px',
              }}>⌖ Activate Compass</button>
            </div>
          )}
 
          {(compassPermission === 'denied' || compassPermission === 'unavailable') && (
            <div style={{ textAlign:'center' as const }}>
              <CompassFace needleRot={QIBLA} gold={gold} goldLight={goldLight} goldDark={goldDark} active={false} />
              <div style={{ fontSize:13, color: gold, marginTop:12 }}>Static bearing: 119° SE from London</div>
            </div>
          )}
 
          {compassPermission === 'granted' && (
            <div style={{ display:'flex', flexDirection:'column' as const, alignItems:'center', width:'100%' }}>
              <CompassFace needleRot={needleRot} gold={gold} goldLight={goldLight} goldDark={goldDark} active={true} />
              <div style={{ marginTop:20, textAlign:'center' as const }}>
                {heading !== null ? (
                  <>
                    <div style={{ fontSize:40, fontWeight:900, color: goldLight, fontVariantNumeric:'tabular-nums' }}>
                      {Math.round(normalised)}°
                    </div>
                    <div style={{ fontSize:15, color: normalised<10||normalised>350 ? '#4ADE80' : 'rgba(255,255,255,0.7)', marginTop:6, fontWeight:600 }}>
                      {normalised<10||normalised>350 ? '✓ Facing Qibla' : `Rotate ${Math.round(normalised)}° to face Makkah`}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:4 }}>Compass: {Math.round(heading)}°</div>
                  </>
                ) : (
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Move phone slowly to calibrate...</div>
                )}
              </div>
            </div>
          )}
        </div>
 
        {/* ── Full timetable toggle ── */}
        <button
          onClick={() => setShowTimetable(v => !v)}
          style={{ width:'100%', padding:'13px', borderRadius:14, background:'transparent', border:`1px solid ${goldDark}`, color: gold, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:12, letterSpacing:'1px' }}
        >
          {showTimetable ? '▲ Hide Timetable' : '▼ Full Prayer Timetable'}
        </button>
 
        {showTimetable && (
          <div style={{ background: darkCard, border:`1px solid ${goldDark}`, borderRadius:16, overflow:'hidden', marginBottom:16 }}>
            {prayers.map((p,i) => {
              const isNext = i===nextIndex;
              const [h,m] = p.time.split(':').map(Number);
              const passed = h*60+m < new Date().getHours()*60+new Date().getMinutes();
              return (
                <div key={p.name} style={{ display:'flex', alignItems:'center', padding:'14px 18px', borderBottom:i<prayers.length-1?`1px solid ${goldDark}33`:'none', background:isNext?`${goldDark}44`:'transparent' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:isNext?700:400, color:isNext?goldLight:passed?'#555':'rgba(255,255,255,0.7)' }}>{p.name}</div>
                    <div style={{ fontSize:11, color:'#555', fontFamily:'serif' }}>{p.arabic}</div>
                  </div>
                  <div style={{ fontSize:17, fontWeight:700, color:isNext?goldLight:passed?'#444':'rgba(255,255,255,0.5)' }}>{p.time}</div>
                  {isNext && <div style={{ marginLeft:10, background: gold, color:'#1A1008', fontSize:9, fontWeight:800, padding:'3px 8px', borderRadius:100, textTransform:'uppercase' as const }}>Next</div>}
                </div>
              );
            })}
          </div>
        )}
 
        {hijriDate && (
          <div style={{ textAlign:'center' as const, fontSize:11, color:'rgba(255,255,255,0.2)', marginBottom:8 }}>
            {hijriDate} · ISNA calculation
          </div>
        )}
      </div>
    </div>
  );
}
 
// ─── COMPASS FACE COMPONENT ───────────────────────────────────
function CompassFace({ needleRot, gold, goldLight, goldDark, active }: { needleRot:number; gold:string; goldLight:string; goldDark:string; active:boolean }) {
  const size = 260;
  return (
    <div style={{ position:'relative', width:size, height:size, marginBottom:8 }}>
      {/* Outer bezel — gold ring */}
      <div style={{
        position:'absolute', inset:0, borderRadius:'50%',
        background:`conic-gradient(${goldDark}, ${gold}, ${goldLight}, ${gold}, ${goldDark}, ${gold}, ${goldLight}, ${gold}, ${goldDark})`,
        boxShadow:`0 0 40px ${goldDark}88, inset 0 0 20px #00000066`,
      }} />
      {/* Inner face — dark */}
      <div style={{
        position:'absolute', inset:10, borderRadius:'50%',
        background:'radial-gradient(circle at 40% 35%, #2A1A08, #0D0804)',
        boxShadow:'inset 0 4px 20px #00000088',
      }} />
      {/* Tick marks */}
      {Array.from({length:72}).map((_,i) => {
        const major = i%9===0; const mid = i%3===0;
        const h = major ? 14 : mid ? 9 : 5;
        const w = major ? 3 : mid ? 2 : 1;
        const color = major ? goldLight : mid ? gold : goldDark;
        return (
          <div key={i} style={{
            position:'absolute', left:'50%', top:'50%',
            width:w, height:h,
            background: color,
            borderRadius:1,
            transformOrigin:'50% 100%',
            transform:`translateX(-50%) translateY(-${size/2-12}px) rotate(${i*5}deg)`,
          }} />
        );
      })}
      {/* Cardinal labels */}
      {[{l:'N',d:0,c:goldLight},{l:'E',d:90,c:gold},{l:'S',d:180,c:gold},{l:'W',d:270,c:gold}].map(({l,d,c}) => (
        <div key={l} style={{
          position:'absolute', left:'50%', top:'50%',
          fontSize: l==='N'?16:13, fontWeight:800, color:c,
          transform:`rotate(${d}deg) translateY(-${size/2-32}px) rotate(-${d}deg) translate(-50%,-50%)`,
          fontFamily:'serif',
        }}>{l}</div>
      ))}
      {/* Needle */}
      <div style={{
        position:'absolute', left:'50%', top:'50%',
        transformOrigin:'50% 100%',
        transform:`translateX(-50%) translateY(-100%) rotate(${needleRot}deg)`,
        transition: active ? 'transform 0.12s ease-out' : 'none',
        display:'flex', flexDirection:'column' as const, alignItems:'center',
        pointerEvents:'none',
      }}>
        <div style={{ fontSize:24, lineHeight:1, marginBottom:2, filter:`drop-shadow(0 0 8px ${gold})` }}>🕋</div>
        {/* Arrow */}
        <div style={{ width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderBottom:`14px solid ${goldLight}`, marginBottom:0 }} />
        <div style={{ width:3, height: size/2-50, background:`linear-gradient(to bottom, ${goldLight}, ${goldDark})`, borderRadius:'0 0 2px 2px' }} />
      </div>
      {/* Centre jewel */}
      <div style={{
        position:'absolute', left:'50%', top:'50%',
        width:16, height:16, borderRadius:'50%',
        background:`radial-gradient(circle at 35% 35%, ${goldLight}, ${goldDark})`,
        transform:'translate(-50%,-50%)',
        zIndex:10,
        boxShadow:`0 0 10px ${gold}88`,
        border:`1px solid ${gold}`,
      }} />
      {/* Decorative inner ring */}
      <div style={{
        position:'absolute', inset:40, borderRadius:'50%',
        border:`1px solid ${goldDark}66`,
        pointerEvents:'none',
      }} />
    </div>
  );
}
 
// ─── LEADERBOARD PAGE ─────────────────────────────────────────
function Leaderboard() {
  const [board, setBoard] = useState<{username:string;points:number}[]>([]);
  const [myUsername, setMyUsername] = useState('');
  const [myPoints, setMyPoints] = useState(0);
  const [copied, setCopied] = useState(false);
  const blue = '#1255A0';
  const gold = '#E8A020'; const silver = '#B0C4DE'; const bronze = '#CD9B6A';
  const AVIS = ['🦁','🌙','🌿','🔥','🕊️','⭐','🌊','🏔️','🌸','✨'];
 
  useEffect(() => {
    Promise.all([fetchLeaderboard(), getOrCreateSession()]).then(([data, session]) => {
      setBoard(data); setMyUsername(session.username); setMyPoints(session.points);
    });
  }, []);
 
  const handleInvite = () => {
    const text = `I'm mapping prayer spaces across the UK with Fassah 🕌 fassah.com/?ref=${myUsername}`;
    if (navigator.share) navigator.share({ title:'Fassah', text, url:`https://fassah.com/?ref=${myUsername}` }).catch(()=>{});
    else navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };
 
  return (
    <div style={{ padding:'24px 20px 100px', maxWidth:480, margin:'0 auto', fontFamily:'system-ui' }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:12, fontWeight:700, letterSpacing:'2px', color:blue, textTransform:'uppercase', marginBottom:6 }}>Top Contributors</div>
        <div style={{ fontSize:22, fontWeight:800, color:'#111' }}>The Fassah Leaderboard</div>
        <div style={{ fontSize:13, color:'#999', marginTop:4 }}>Every check-in is still earning reward long after you've forgotten about it. ✨</div>
      </div>
      <div style={{ background:`linear-gradient(135deg,${blue},#2B7FD4)`, borderRadius:16, padding:'16px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🦁</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'white' }}>{myUsername||'Loading...'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>Your score</div>
        </div>
        <div>
          <div style={{ fontSize:24, fontWeight:800, color:'white' }}>{myPoints}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textAlign:'right' as const }}>pts</div>
        </div>
      </div>
      {board.length>=3 && (
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:8, marginBottom:24 }}>
          {[1,0,2].map(idx => {
            const entry = board[idx];
            const rank = idx+1;
            const h = rank===1?80:rank===2?64:52;
            const color = [gold,silver,bronze][idx];
            const emoji = ['🥇','🥈','🥉'][idx];
            return (
              <div key={idx} style={{ display:'flex', flexDirection:'column', alignItems:'center', width:100 }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{AVIS[idx]}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'#333', maxWidth:90, textAlign:'center', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.username.split('_')[0]}</div>
                <div style={{ fontSize:13, fontWeight:800, color, marginBottom:4 }}>{entry.points} pts</div>
                <div style={{ width:'100%', height:h, background:color, borderRadius:'8px 8px 0 0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{emoji}</div>
              </div>
            );
          })}
        </div>
      )}
      {board.length>3 && (
        <div style={{ background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 16px rgba(18,85,160,0.07)', marginBottom:24 }}>
          {board.slice(3).map((entry,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<board.slice(3).length-1?'1px solid #F0F5FF':'none' }}>
              <span style={{ fontSize:13, fontWeight:800, color:'#AAA', width:20, textAlign:'center' as const }}>{i+4}</span>
              <div style={{ width:36, height:36, borderRadius:10, background:'#EBF4FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{AVIS[(i+4)%AVIS.length]}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:500, color:'#333' }}>{entry.username}</div></div>
              <span style={{ fontSize:14, fontWeight:700, color:'#6AAEE8' }}>{entry.points} pts</span>
            </div>
          ))}
        </div>
      )}
      {board.length===0 && <div style={{ textAlign:'center', padding:'40px 0', color:'#BBB' }}><div style={{ fontSize:40, marginBottom:12 }}>🏆</div><div>Be the first to earn points</div></div>}
      <div style={{ background:'#FFF9ED', border:'1px solid #FDE68A', borderRadius:14, padding:'16px 18px', marginBottom:20 }}>
        <div style={{ fontSize:13, color:'#7A5B00', lineHeight:1.6 }}>"The place you add today could help a brother or sister pray five years from now. Imagine the reward. One click away."</div>
      </div>
      <div style={{ background:'white', borderRadius:16, padding:'20px', boxShadow:'0 2px 16px rgba(18,85,160,0.07)' }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#111', marginBottom:6 }}>Challenge a friend 🤝</div>
        <div style={{ fontSize:13, color:'#666', marginBottom:14 }}>Invite a friend — when they check in you both get <strong style={{ color:blue }}>+5 bonus points</strong>.</div>
        <button onClick={handleInvite} style={{ width:'100%', padding:'13px', background:`linear-gradient(135deg,${blue},#2B7FD4)`, color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>
          {copied?'✅ Copied!':'📲 Share Fassah with a friend'}
        </button>
      </div>
    </div>
  );
}
 
// ─── SETTINGS PAGE ────────────────────────────────────────────
function Settings() {
  const [username, setUsername] = useState('');
  const [points, setPoints] = useState(0);
  const blue = '#1255A0';
 
  useEffect(() => {
    getOrCreateSession().then(s => { setUsername(s.username); setPoints(s.points); });
  }, []);
 
  const Row = ({ icon, label, value, onPress }: { icon:string; label:string; value?:string; onPress?:()=>void }) => (
    <div onClick={onPress} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom:'1px solid #F5F8FF', cursor:onPress?'pointer':'default' }}>
      <span style={{ fontSize:20, width:28, textAlign:'center' as const }}>{icon}</span>
      <div style={{ flex:1 }}><div style={{ fontSize:14, color:'#333', fontWeight:500 }}>{label}</div></div>
      {value && <span style={{ fontSize:13, color:'#888' }}>{value}</span>}
      <span style={{ color:'#CCC', fontSize:16 }}>›</span>
    </div>
  );
 
  const Section = ({ title, children }: { title:string; children:React.ReactNode }) => (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:11, fontWeight:700, color:'#AAA', textTransform:'uppercase' as const, letterSpacing:'1.5px', marginBottom:8, paddingLeft:4 }}>{title}</div>
      <div style={{ background:'white', borderRadius:14, overflow:'hidden', boxShadow:'0 2px 12px rgba(18,85,160,0.06)' }}>{children}</div>
    </div>
  );
 
  return (
    <div style={{ padding:'24px 20px 100px', maxWidth:480, margin:'0 auto', fontFamily:'system-ui' }}>
      <div style={{ marginBottom:28 }}><div style={{ fontSize:22, fontWeight:800, color:'#111' }}>Settings</div></div>
      <div style={{ background:`linear-gradient(135deg,${blue},#2B7FD4)`, borderRadius:18, padding:'20px', marginBottom:24, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🦁</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:800, color:'white' }}>{username||'Loading...'}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:2 }}>Your anonymous username</div>
        </div>
        <div style={{ textAlign:'right' as const }}>
          <div style={{ fontSize:28, fontWeight:800, color:'white' }}>{points}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>points</div>
        </div>
      </div>
      <div style={{ background:'#FFF9ED', border:'1px solid #FDE68A', borderRadius:12, padding:'12px 16px', marginBottom:24, fontSize:13, color:'#7A5B00' }}>
        These points are the least of what you're earning. 🤲
      </div>
      <Section title="Points">
        <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 16px' }}>
          {[{n:String(points),l:'Total'},{n:'+2',l:'Check-in'},{n:'+10',l:'Space added'}].map(s=>(
            <div key={s.l} style={{ textAlign:'center' as const, flex:1 }}>
              <div style={{ fontSize:22, fontWeight:800, color:blue }}>{s.n}</div>
              <div style={{ fontSize:11, color:'#AAA', marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="App">
        <Row icon="🔒" label="Privacy Policy" onPress={()=>window.open('https://fassah.com/privacy','_blank')} />
        <Row icon="📲" label="Share Fassah" onPress={()=>{if(navigator.share)navigator.share({title:'Fassah',url:'https://fassah.com'});}} />
        <Row icon="✉️" label="Contact" value="hello@fassah.com" onPress={()=>window.open('mailto:hello@fassah.com','_blank')} />
        <Row icon="🚩" label="Report a space" onPress={()=>window.open('mailto:hello@fassah.com?subject=Space report','_blank')} />
      </Section>
      <div style={{ textAlign:'center', fontSize:12, color:'#CCC', marginTop:8, lineHeight:1.8 }}>
        <div>© 2026 Fassah · Built for the ummah · UK</div>
        <div style={{ fontSize:16, letterSpacing:'2px', marginTop:4 }}>بِسْمِ اللهِ</div>
        <div>Free to use · Always · No ads · No data sold · Ever.</div>
      </div>
    </div>
  );
}
 
// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState('map');
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
    if (page && ['map','prayer','leaderboard','settings'].includes(page)) setActivePage(page);
    loadSpaces();
  }, []);
 
  const handleNavigate = (page: string) => {
    setActivePage(page);
    const url = new URL(window.location.href);
    if (page==='map') url.searchParams.delete('page'); else url.searchParams.set('page', page);
    window.history.pushState({}, '', url.toString());
  };
 
  const loadSpaces = async () => {
    setIsLoading(true);
    try { setSpaces(await fetchVerifiedSpaces()); } catch {}
    setIsLoading(false);
  };
 
  const filters = ['All','Outdoor','Multi-faith','Business','Mosque'];
  const filteredSpaces = spaces.filter(s => {
    if (activeFilter==='All') return true;
    if (activeFilter==='Outdoor') return s.type.toLowerCase().includes('outdoor');
    if (activeFilter==='Multi-faith') return s.type.toLowerCase().includes('multi');
    if (activeFilter==='Business') return s.type.toLowerCase().includes('business');
    if (activeFilter==='Mosque') return s.type.toLowerCase().includes('mosque');
    return true;
  });
 
  return (
    <div style={{ minHeight:'100vh', background:'#F6FAFE', fontFamily:'system-ui, sans-serif' }}>
      {activePage==='map' && (
        <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
          <div style={{ background:`linear-gradient(135deg,${blue},#2B7FD4)`, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontWeight:800, fontSize:18, color:'white', letterSpacing:1 }}>FASSAH</span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginLeft:4 }}>Find your space to pray</span>
            </div>
            <button onClick={()=>setShowSubmitForm(true)} style={{ background:'white', color:blue, border:'none', padding:'8px 16px', borderRadius:100, fontSize:13, fontWeight:700, cursor:'pointer' }}>+ Add Space</button>
          </div>
          <div style={{ padding:'12px 16px', background:'white', borderBottom:'1px solid #EDF3FB', flexShrink:0 }}>
            <form onSubmit={e=>{e.preventDefault();setSearchQuery(searchInput);}} style={{ display:'flex', gap:8 }}>
              <input type="text" value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search postcode, area or university..." style={{ flex:1, padding:'10px 14px', borderRadius:12, border:'1.5px solid #D4E6F5', fontSize:14, fontFamily:'system-ui', outline:'none' }} />
              <button type="submit" style={{ padding:'10px 18px', borderRadius:12, border:'none', background:blue, color:'white', fontWeight:600, fontSize:13, cursor:'pointer' }}>Go</button>
            </form>
          </div>
          <div style={{ padding:'10px 16px', display:'flex', gap:8, borderBottom:'1px solid #EDF3FB', flexWrap:'wrap' as const, background:'white', flexShrink:0 }}>
            {filters.map(f=>(
              <button key={f} onClick={()=>setActiveFilter(f)} style={{ padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', fontFamily:'system-ui', background:activeFilter===f?blue:bluePale, color:activeFilter===f?'white':textMid }}>{f}</button>
            ))}
            <span style={{ marginLeft:'auto', fontSize:11, color:textLight, alignSelf:'center' }}>{filteredSpaces.length} space{filteredSpaces.length!==1?'s':''}</span>
          </div>
          <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
            {isLoading ? (
              <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:bluePale }}>
                <p style={{ color:textMid, fontSize:15 }}>Loading prayer spaces...</p>
              </div>
            ) : (
              <MapView spaces={filteredSpaces} onSpaceClick={setSelectedSpace} searchQuery={searchQuery} />
            )}
          </div>
          <div style={{ background:'linear-gradient(90deg,#EBF4FF,#DCF0FF)', borderTop:'1px solid #C4DEFA', padding:'10px 20px 74px', display:'flex', gap:20, flexShrink:0, flexWrap:'wrap' as const }}>
            {[{n:'247',l:'Spaces'},{n:'1,840',l:'Check-ins'},{n:'12',l:'Cities'}].map(s=>(
              <div key={s.l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:14, fontWeight:800, color:blue }}>{s.n}</span>
                <span style={{ fontSize:11, color:textMid }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {activePage==='prayer' && <PrayerTimes />}
      {activePage==='leaderboard' && <div style={{ paddingTop:16 }}><Leaderboard /></div>}
      {activePage==='settings' && <div style={{ paddingTop:16 }}><Settings /></div>}
      <BottomNav activePage={activePage} onNavigate={handleNavigate} />
      {selectedSpace && <SpacePopup space={selectedSpace} onClose={()=>setSelectedSpace(null)} />}
      {showSubmitForm && <SubmitSpaceForm onClose={()=>setShowSubmitForm(false)} onSuccess={loadSpaces} />}
    </div>
  );
}
 
