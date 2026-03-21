import { useState, useRef } from 'react';
import { submitSpace } from '../lib/supabase';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { createClient } from '@supabase/supabase-js';
 
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
 
interface SubmitSpaceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}
 
const LOCATION_TYPES = ['Outdoor Space','Multi-faith Room','Friendly Business','Community Home','Mosque','Other'];
 
export default function SubmitSpaceForm({ onClose, onSuccess }: SubmitSpaceFormProps) {
  const { isLoaded } = useGoogleMaps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ name:'', address:'', type:LOCATION_TYPES[0], description:'', best_times:'', qibla_notes:'' });
  const [error, setError] = useState('');
 
  const blue = '#2B7FD4';
  const blueDark = '#1A5FAA';
  const bluePale = '#EBF4FF';
 
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be under 5MB'); return; }
    setPhotoFile(file);
    const r = new FileReader();
    r.onload = () => setPhotoPreview(r.result as string);
    r.readAsDataURL(file);
  };
 
  const uploadPhoto = async (file: File): Promise<string | undefined> => {
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from('space-photos').upload(name, file);
    if (error) return undefined;
    return supabase.storage.from('space-photos').getPublicUrl(data.path).data.publicUrl;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    if (!isLoaded) { setError('Maps loading, please wait.'); setIsSubmitting(false); return; }
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
        geocoder.geocode({ address: formData.address + ', UK' }, (results, status) => {
          if (status === 'OK' && results?.[0]) resolve(results[0]);
          else reject(new Error('Could not find that address. Try a full postcode.'));
        });
      });
      const loc = result.geometry.location;
      const photo_url = photoFile ? await uploadPhoto(photoFile) : undefined;
      const success = await submitSpace({
        name: formData.name, address: formData.address,
        latitude: loc.lat(), longitude: loc.lng(),
        type: formData.type, description: formData.description,
        best_times: formData.best_times, qibla_notes: formData.qibla_notes,
        photo_url,
      });
      if (success) { setSubmitted(true); setTimeout(() => { onSuccess(); onClose(); }, 2500); }
      else setError('Submission failed. Please try again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setIsSubmitting(false); }
  };
 
  const inp = (extra: object = {}) => ({
    width: '100%', padding: '10px 14px', border: '1.5px solid #D4E6F5',
    borderRadius: '10px', fontSize: '14px', fontFamily: 'system-ui',
    outline: 'none', boxSizing: 'border-box' as const, ...extra,
  });
 
  if (submitted) return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'16px' }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'48px 32px', textAlign:'center', maxWidth:'400px', width:'100%' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>🕌</div>
        <div style={{ fontSize:'22px', fontWeight:800, color:'#0C1B2E', marginBottom:'8px' }}>JazakAllah Khayran!</div>
        <div style={{ fontSize:'15px', color:'#3D5A7A', lineHeight:1.6 }}>Your space has been submitted for review. Once verified it will appear on the map and help Muslims in your area pray on time.</div>
        <div style={{ fontSize:'13px', color:'#7A9BBF', marginTop:'12px' }}>+10 points earned 🤲</div>
      </div>
    </div>
  );
 
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'16px', overflowY:'auto' }}>
      <div style={{ background:'white', borderRadius:'20px', boxShadow:'0 24px 80px rgba(0,0,0,0.2)', maxWidth:'560px', width:'100%', margin:'20px 0' }}>
        <div style={{ background:`linear-gradient(135deg,${blueDark},${blue})`, padding:'24px', borderRadius:'20px 20px 0 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'20px', fontWeight:800, color:'white' }}>Add a Prayer Space</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', marginTop:'4px' }}>Help the ummah find somewhere to pray</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%', width:'36px', height:'36px', cursor:'pointer', color:'white', fontSize:'18px' }}>✕</button>
        </div>
 
        <form onSubmit={handleSubmit} style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>
          {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', color:'#991B1B', padding:'12px 16px', borderRadius:'10px', fontSize:'14px' }}>{error}</div>}
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Location Name *</label>
            <input type="text" required value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="e.g., Westfield Stratford Prayer Room" style={inp()} />
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Address or Postcode *</label>
            <input type="text" required value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})} placeholder="e.g., E20 1EJ or full address" style={inp()} />
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Space Type *</label>
            <select required value={formData.type} onChange={e=>setFormData({...formData,type:e.target.value})} style={inp({ background:'white' })}>
              {LOCATION_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Description *</label>
            <textarea required rows={3} value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} placeholder="Is wudu available? Any access restrictions? What should people expect?" style={inp({ resize:'vertical' as const })} />
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Best Times to Visit</label>
            <input type="text" value={formData.best_times} onChange={e=>setFormData({...formData,best_times:e.target.value})} placeholder="e.g., Weekdays after Dhuhr, open 10am-9pm" style={inp()} />
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Qibla Notes 🧭</label>
            <input type="text" value={formData.qibla_notes} onChange={e=>setFormData({...formData,qibla_notes:e.target.value})} placeholder="e.g., Faces southeast, marked on the floor" style={inp()} />
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Photo (optional)</label>
            {photoPreview ? (
              <div style={{ position:'relative' }}>
                <img src={photoPreview} style={{ width:'100%', height:'180px', objectFit:'cover', borderRadius:'10px', border:'1.5px solid #D4E6F5' }} />
                <button type="button" onClick={()=>{setPhotoFile(null);setPhotoPreview('');}} style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.6)', color:'white', border:'none', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer', fontSize:'14px' }}>✕</button>
              </div>
            ) : (
              <div onClick={()=>fileInputRef.current?.click()} style={{ border:'2px dashed #C4DEFA', borderRadius:'10px', padding:'28px', textAlign:'center', cursor:'pointer', background:bluePale }}>
                <div style={{ fontSize:'28px', marginBottom:'8px' }}>📷</div>
                <div style={{ fontSize:'13px', fontWeight:600, color:blue }}>Tap to add a photo</div>
                <div style={{ fontSize:'11px', color:'#7A9BBF', marginTop:'4px' }}>JPG or PNG, max 5MB</div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
          </div>
 
          <div style={{ background:bluePale, border:`1px solid #C4DEFA`, borderRadius:'10px', padding:'14px 16px', fontSize:'13px', color:'#3D5A7A' }}>
            🔍 Reviewed before going live. Once verified you earn <strong>10 points</strong>.
          </div>
 
          <div style={{ display:'flex', gap:'10px' }}>
            <button type="button" onClick={onClose} style={{ flex:1, background:'#F6FAFE', color:'#3D5A7A', border:'1.5px solid #D4E6F5', padding:'13px', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'system-ui' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ flex:1, background:isSubmitting?'#93C5FD':blue, color:'white', border:'none', padding:'13px', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:isSubmitting?'not-allowed':'pointer', fontFamily:'system-ui' }}>
              {isSubmitting ? 'Submitting...' : 'Submit Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 
