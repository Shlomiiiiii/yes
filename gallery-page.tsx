import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Download, Share2, Bed, Bath, Maximize2, Calendar, X, Loader2 } from 'lucide-react';
import { api, type Property } from '../api';
import styles from '../styles.module.css';

export function GalleryPage() {
  const { slug } = useParams();
  const [search] = useSearchParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    api.properties
      .bySlug(slug)
      .then((p) => {
        if (!cancelled) setProperty(p);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Could not load gallery.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, search]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0a0a0b',
          color: '#c4a766',
        }}
      >
        <Loader2 size={28} />
      </div>
    );
  }
  if (error || !property) {
    return (
      <div
        style={{
          padding: 80,
          textAlign: 'center',
          background: '#0a0a0b',
          minHeight: '100vh',
          color: '#f5f3ef',
        }}
      >
        <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Gallery not found</h2>
        <p style={{ color: 'rgba(245,243,239,0.6)' }}>{error || 'This share link is invalid.'}</p>
      </div>
    );
  }
  const unlocked = !property.isLocked;
  async function unlock() {
    setCheckingOut(true);
    try {
      const result = await api.payments.checkout(property!.id, email || 'client@example.com');
      window.location.href = result.url;
    } catch (e: any) {
      setError(e.message || 'Could not start checkout.');
      setCheckingOut(false);
    }
  }
  return (
    <div style={{ background: '#0a0a0b', minHeight: '100vh', color: '#f5f3ef' }}>
      <div
        className={styles.galleryHero}
        style={{ backgroundImage: `url(${property.coverImage})` }}
      >
        <div className={styles.galleryHeroContent}>
          <motion.h1
            className={styles.galleryTitle}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {property.address}
          </motion.h1>
          <motion.p
            className={styles.galleryAddr}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {property.city}, {property.state} {property.zip} · {property.propertyType}
          </motion.p>
        </div>
      </div>
      <div className={styles.galleryBody}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 14,
            marginBottom: 30,
          }}
        >
          {[
            { icon: Bed, label: 'Bedrooms', value: property.bedrooms || '—' },
            { icon: Bath, label: 'Bathrooms', value: property.bathrooms || '—' },
            {
              icon: Maximize2,
              label: 'Sq Ft',
              value: property.squareFeet?.toLocaleString() || '—',
            },
            { icon: Calendar, label: 'Year Built', value: property.yearBuilt || '—' },
          ].map((s) => (
            <div key={s.label} className={styles.card} style={{ textAlign: 'center', padding: 18 }}>
              <s.icon size={18} color="#c4a766" />
              <p style={{ fontSize: 11, color: 'rgba(245,243,239,0.5)', margin: '8px 0 2px' }}>
                {s.label}
              </p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, margin: 0 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
        {property.description && (
          <div className={styles.card} style={{ marginBottom: 30 }}>
            <p
              style={{
                margin: 0,
                color: 'rgba(245,243,239,0.85)',
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              {property.description}
            </p>
          </div>
        )}
        {!unlocked && (
          <div className={styles.paywall}>
            <Lock size={28} color="#c4a766" />
            <h2
              style={{
                fontFamily: 'Playfair Display, serif',
                margin: '14px 0 8px',
                fontWeight: 500,
              }}
            >
              Unlock the full gallery
            </h2>
            <p
              style={{
                color: 'rgba(245,243,239,0.6)',
                margin: '0 0 24px',
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Pay securely with Stripe to instantly unlock high-resolution downloads.
            </p>
            <input
              className={styles.input}
              type="email"
              placeholder="your@email.com (for receipt)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', maxWidth: 320, margin: '0 auto 14px' }}
            />
            <br />
            <button
              className={`${styles.btn} ${styles.btnGold}`}
              style={{ padding: '14px 28px', fontSize: 14 }}
              onClick={unlock}
              disabled={checkingOut}
            >
              {checkingOut ? <Loader2 size={14} /> : null}
              {checkingOut
                ? 'Opening Stripe…'
                : `Unlock for $${property.price.toLocaleString()}`}
            </button>
          </div>
        )}
        {unlocked && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <button className={`${styles.btn} ${styles.btnGold}`}>
              <Download size={14} /> Download All
            </button>
            <button
              className={styles.btn}
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
            >
              <Share2 size={14} /> Share Gallery
            </button>
          </div>
        )}
        <div className={styles.galleryGrid}>
          {property.images.map((src, i) => (
            <motion.img
              key={`${src}-${i}`}
              src={src}
              alt=""
              loading="lazy"
              className={`${styles.galleryItem} ${!unlocked ? styles.galleryItemLocked : ''}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              onClick={() => unlocked && setLightbox(src)}
              style={{ cursor: unlocked ? 'zoom-in' : 'default' }}
            />
          ))}
        </div>
      </div>
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 30,
            cursor: 'zoom-out',
          }}
        >
          <button
            className={styles.btn}
            style={{ position: 'absolute', top: 24, right: 24 }}
            onClick={() => setLightbox(null)}
          >
            <X size={14} /> Close
          </button>
          <img
            src={lightbox}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10 }}
          />
        </div>
      )}
    </div>
  );
}
