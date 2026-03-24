import { useState, useRef, useEffect } from 'react';
import { submitSpace, supabase } from '../lib/supabase';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
 
interface SubmitSpaceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}
 
const LOCATION_TYPES = ['Outdoor Space','Multi-faith Room','Friendly Business','Community Home','Mosque','Other'];
const TURNSTILE_SITE_KEY = '0x4AAAAAAACvNR-Sy-EO_v4ds';
 
// ── Strict sanitiser ──────────────────────────────────────────
function sanitize(input: string, maxLen = 1000): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/[<>'"]/g, c => ({'<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c] || c))
    .trim()
    .slice(0, maxLen);
}
 
const RULES = {
  name:        { min: 3,  max: 100, label: 'Location name' },
  address:     { min: 5,  max: 200, label: 'Address' },
  description: { min: 10, max: 1000, label: 'Description' },
  best_times:  { min: 0,  max: 200, label: 'Best times' },
  qibla_notes: { min: 0,  max: 200, label: 'Qibla notes' },
};
 
function validate(field: keyof typeof RULES, value: string): string | null {
  const rule = RULES[field];
  const clean = sanitize(value, rule.max);
  if (clean.length < rule.min) return `${rule.label} must be at least ${rule.min} characters`;
  if (clean.length > rule.max) return `${rule.label} must be under ${rule.max} characters`;
  return null;
}
 
// ── Rate limit ────────────────────────────────────────────────
const RATE_KEY = 'fassah_submit_times';
function checkRateLimit(): boolean {
  try {
    const raw = sessionStorage.getItem(RATE_KEY);
    const times: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const recent = times.filter(t => now - t < 60 * 60 * 1000);
    if (recent.length >= 5) return false;
    recent.push(now);
    sessionStorage.setItem(RATE_KEY, JSON.stringify(recent));
    return true;
  } catch { return true; }
}
 
export default function SubmitSpaceForm({ onClose, onSuccess }: SubmitSpaceFormProps) {
  const { isLoaded } = useGoogleMaps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const widgetIdRef = useRef<string | null>(null);
 
  const [formData, setFormData] = useState({
    name: '', address: '', type: LOCATION_TYPES[0],
    description: '', best_times: '', qibla_notes: '',
    honeypot: '',
  });
 
  const blue = '#2B7FD4';
  const blueDark = '#1A5FAA';
  const bluePale = '#EBF4FF';
 
  // ── Load Turnstile script & render widget ─────────────────
  useEffect(() => {
    const scriptId = 'cf-turnstile-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
 
    const tryRender = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          size: 'invisible',
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        });
      }
    };
 
    const interval = setInterval(() => {
      if (window.turnstile) { tryRender(); clearInterval(interval); }
    }, 200);
 
    return () => {
      clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);
 
  const handleChange = (field: string, value: string) => {
    const maxLengths: Record<string, number> = { name:100, address:200, description:1000, best_times:200, qibla_notes:200 };
    const max = maxLengths[field];
    if (max && value.length > max) return;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
 
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of ['name','address','description'] as const) {
      const err = validate(field, formData[field]);
      if (err) newErrors[field] = err;
    }
    if (formData.best_times) { const e = validate('best_times', formData.best_times); if (e) newErrors.best_times = e; }
    if (formData.qibla_notes) { const e = validate('qibla_notes', formData.qibla_notes); if (e) newErrors.qibla_notes = e; }
    if (!LOCATION_TYPES.includes(formData.type)) newErrors.type = 'Invalid location type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setGlobalError('Only JPG, PNG or WebP images allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setGlobalError('Photo must be under 5MB'); return; }
    setGlobalError('');
    setPhotoFile(file);
    const r = new FileReader();
    r.onload = () => setPhotoPreview(r.result as string);
    r.readAsDataURL(file);
  };
 
  const uploadPhoto = async (file: File): Promise<string | undefined> => {
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage.from('space-photos').upload(safeName, file, { contentType: file.type });
    if (error) return undefined;
    return supabase.storage.from('space-photos').getPublicUrl(data.path).data.publicUrl;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
 
    // Honeypot
    if (formData.honeypot) { setSubmitted(true); return; }
 
    // Rate limit
    if (!checkRateLimit()) { setGlobalError('Too many submissions. Please try again in an hour.'); return; }
 
    // Turnstile
    if (!turnstileToken) {
      // Try to execute the invisible widget
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.execute(widgetIdRef.current);
        setGlobalError('Security check in progress — please try submitting again in a moment.');
      } else {
        setGlobalError('Security check failed. Please refresh and try again.');
      }
      return;
    }
 
    // Validation
    if (!validateAll()) return;
 
    setIsSubmitting(true);
 
    if (!isLoaded) { setGlobalError('Maps still loading, please wait.'); setIsSubmitting(false); return; }
 
    try {
      // Geocode
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
        geocoder.geocode({ address: sanitize(formData.address, 200) + ', UK' }, (results, status) => {
          if (status === 'OK' && results?.[0]) resolve(results[0]);
          else reject(new Error('Could not find that address. Try a full postcode.'));
        });
      });
 
      const lat = result.geometry.location.lat();
      const lng = result.geometry.location.lng();
 
      // UK bounds check
      if (lat < 49.0 || lat > 61.0 || lng < -8.0 || lng > 2.0) throw new Error('Address must be within the UK.');
 
      // Photo upload
      let photo_url: string | undefined;
      if (photoFile) photo_url = await uploadPhoto(photoFile);
 
      // Submit
      const success = await submitSpace({
        name: sanitize(formData.name, 100),
        address: sanitize(formData.address, 200),
        latitude: lat, longitude: lng,
        type: formData.type,
        description: sanitize(formData.description, 1000),
        best_times: formData.best_times ? sanitize(formData.best_times, 200) : undefined,
        qibla_notes: formData.qibla_notes ? sanitize(formData.qibla_notes, 200) : undefined,
        photo_url,
      });
 
      if (success) { setSubmitted(true); setTimeout(() => { onSuccess(); onClose(); }, 2500); }
      else setGlobalError('Submission failed. Please try again.');
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'An error occurred.');
      // Reset Turnstile on error
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        setTurnstileToken('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
 
  const inp = (hasError = false) => ({
    width: '100%', padding: '10px 14px',
    border: `1.5px solid ${hasError ? '#FCA5A5' : '#D4E6F5'}`,
    borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box' as const,
    background: hasError ? '#FFF5F5' : 'white',
  });
 
  if (submitted) return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'16px' }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'48px 32px', textAlign:'center', maxWidth:'400px', width:'100%' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>🕌</div>
        <div style={{ fontSize:'22px', fontWeight:800, color:'#0C1B2E', marginBottom:'8px' }}>JazakAllah Khayran!</div>
        <div style={{ fontSize:'15px', color:'#3D5A7A', lineHeight:1.6 }}>Your space has been submitted for review. Once verified it will appear on the map.</div>
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
 
          {/* Honeypot — hidden */}
          <div style={{ display:'none' }} aria-hidden="true">
            <input type="text" tabIndex={-1} autoComplete="off" value={formData.honeypot} onChange={e => setFormData(p => ({ ...p, honeypot: e.target.value }))} />
          </div>
 
          {/* Invisible Turnstile widget */}
          <div ref={turnstileRef} />
 
          {globalError && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', color:'#991B1B', padding:'12px 16px', borderRadius:'10px', fontSize:'14px' }}>{globalError}</div>
          )}
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Location Name * <span style={{ color:'#7A9BBF', fontWeight:400 }}>(3-100 chars)</span></label>
            <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g., Westfield Stratford Prayer Room" maxLength={100} style={inp(!!errors.name)} />
            {errors.name && <div style={{ fontSize:'12px', color:'#EF4444', marginTop:'4px' }}>{errors.name}</div>}
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>UK Address or Postcode *</label>
            <input type="text" required value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="e.g., E20 1EJ or 2 Stratford Place, London" maxLength={200} style={inp(!!errors.address)} />
            {errors.address && <div style={{ fontSize:'12px', color:'#EF4444', marginTop:'4px' }}>{errors.address}</div>}
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Space Type *</label>
            <select required value={formData.type} onChange={e => handleChange('type', e.target.value)} style={inp(!!errors.type)}>
              {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Description * <span style={{ color:'#7A9BBF', fontWeight:400 }}>(10-1000 chars)</span></label>
            <textarea required rows={3} value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Is wudu available? Any access restrictions? What should people expect?" maxLength={1000} style={{ ...inp(!!errors.description), resize:'vertical' as const }} />
            <div style={{ fontSize:'11px', color:'#7A9BBF', marginTop:'2px', textAlign:'right' }}>{formData.description.length}/1000</div>
            {errors.description && <div style={{ fontSize:'12px', color:'#EF4444', marginTop:'4px' }}>{errors.description}</div>}
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Best Times to Visit</label>
            <input type="text" value={formData.best_times} onChange={e => handleChange('best_times', e.target.value)} placeholder="e.g., Weekdays after Dhuhr, open 10am-9pm" maxLength={200} style={inp(!!errors.best_times)} />
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Qibla Notes 🧭</label>
            <input type="text" value={formData.qibla_notes} onChange={e => handleChange('qibla_notes', e.target.value)} placeholder="e.g., Faces southeast, marked on the floor" maxLength={200} style={inp(!!errors.qibla_notes)} />
          </div>
 
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#0C1B2E', marginBottom:'6px' }}>Photo <span style={{ color:'#7A9BBF', fontWeight:400 }}>(JPG/PNG/WebP, max 5MB)</span></label>
            {photoPreview ? (
              <div style={{ position:'relative' }}>
                <img src={photoPreview} style={{ width:'100%', height:'180px', objectFit:'cover', borderRadius:'10px', border:'1.5px solid #D4E6F5' }} alt="preview" />
                <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(''); }} style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.6)', color:'white', border:'none', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer', fontSize:'14px' }}>✕</button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} style={{ border:'2px dashed #C4DEFA', borderRadius:'10px', padding:'28px', textAlign:'center', cursor:'pointer', background:bluePale }}>
                <div style={{ fontSize:'28px', marginBottom:'8px' }}>📷</div>
                <div style={{ fontSize:'13px', fontWeight:600, color:blue }}>Tap to add a photo</div>
                <div style={{ fontSize:'11px', color:'#7A9BBF', marginTop:'4px' }}>JPG, PNG or WebP · Max 5MB</div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} style={{ display:'none' }} />
          </div>
 
          <div style={{ background:bluePale, border:`1px solid #C4DEFA`, borderRadius:'10px', padding:'14px 16px', fontSize:'13px', color:'#3D5A7A' }}>
            🔍 All submissions are reviewed before going live. Once verified you earn <strong>10 points</strong>.
          </div>
 
          <div style={{ display:'flex', gap:'10px' }}>
            <button type="button" onClick={onClose} style={{ flex:1, background:'#F6FAFE', color:'#3D5A7A', border:'1.5px solid #D4E6F5', padding:'13px', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ flex:1, background:isSubmitting?'#93C5FD':blue, color:'white', border:'none', padding:'13px', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:isSubmitting?'not-allowed':'pointer', fontFamily:'inherit' }}>
              {isSubmitting ? 'Submitting...' : 'Submit Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 
// Extend window type for Turnstile
declare global {
  interface Window {
    turnstile: {
      render: (el: HTMLElement, options: object) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}
 
