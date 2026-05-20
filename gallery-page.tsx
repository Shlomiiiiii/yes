import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Bed, Bath, Maximize2, Calendar, Loader2 } from 'lucide-react';
import { api, type Property } from './api';

export function GalleryPage() {
  const { slug } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!slug) return;
    let c = false;
    setLoading(true);
    api.properties.bySlug(slug)
      .then((p) => !c && setProperty(p))
      .catch((e) => !c && setError(e.message))
      .finally(() => !c && setLoading(false));
    return () => { c = true; };
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a0b', color: '#c4a766' }}>
      <Loader2 size={28} />
    </div>
  );

  if (error || !property) return (
    <div style={{ padding: 80, textAlign: 'center', background: '#0a0a0b', minHeight: '100vh', color: '#f5f3ef' }}>
      <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Gallery not found</h2>
      <p style={{ color: 'rgba(245,243,239,0.6)' }}>{error || 'Invalid link.'}</p>
    </div>
  );

  const unlocked = !property.isLocked;

  async function unlock() {
    setCheckingOut(true);
    try {
      const result = await api.payments.checkout(property!.id, email || 'client@example.com');
      window.location.href = result.url;
    } catch (e: any) {
      setError(e.message);
      setCheckingOut(false);
    }
  }

  return (
    <div style={{ background: '#0a0a0b', minHeight: '100vh', color: '#f5f3ef' }}>
      <div className="galleryHero" style={{ backgroundImage: `url(${property.coverImage})` }}>
        <div className="galleryHeroContent">
          <motion.h1 className="galleryTitle" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {property.address}
          </motion.h1>
          <p className="galleryAddr">{property.city}, {property.state} {property.zip} · {property.propertyType}</p>
        </div>
      </div>
      <div className="galleryBody">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 30 }}>
          {[
            { icon: Bed, label: 'Bedrooms', value: property.bedrooms || '—' },
            { icon: Bath, label: 'Bathrooms', value: property.bathrooms || '—' },
            { icon: Maximize2, label: 'Sq Ft', value: property.squareFeet?.toLocaleString() || '—' },
            { icon: Calendar, label: 'Year', value: property.yearBuilt || '—' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: 18 }}>
              <s.icon size={18} color="#c4a766" />
              <p style={{ fontSize: 11, color: 'rgba(245,243,239,0.5)', margin: '8px 0 2px' }}>{s.label}</p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
        {!unlocked && (
          <div className="paywall">
            <Lock size={28} color="#c4a766" />
            <h2 style={{ fontFamily: 'Playfair Display, serif', margin: '14px 0 8px', fontWeight: 500 }}>Unlock the full gallery</h2>
            <p style={{ color: 'rgba(245,243,239,0.6)', margin: '0 0 24px', fontSize: 14 }}>Pay securely with Stripe to instantly unlock high-resolution downloads.</p>
            <input className="input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', maxWidth: 320, margin: '0 auto 14px' }} />
            <br />
            <button className="btn btnGold" style={{ padding: '14px 28px', fontSize: 14 }} onClick={unlock} disabled={checkingOut}>
              {checkingOut ? <Loader2 size={14} /> : null}
              {checkingOut ? 'Opening Stripe…' : `Unlock for $${property.price.toLocaleString()}`}
            </button>
          </div>
        )}
        <div className="galleryGrid">
          {property.images.map((src, i) => (
            <img key={i} src={src} alt="" loading="lazy" className={`galleryItem ${!unlocked ? 'galleryItemLocked' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
