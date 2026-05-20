import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Bed, Bath, Maximize2, Lock, Unlock, Share2, Upload, Loader2 } from 'lucide-react';
import { Topbar } from '../topbar';
import { api, type Property } from '../api';
import { useApi } from '../use-api';
import { PropertyFormModal } from '../property-form-modal';
import { ShareLinkModal } from '../share-link-modal';
import { UploadModal } from '../upload-modal';
import styles from '../styles.module.css';

const filters = ['All', 'Locked', 'Unlocked', 'Published'] as const;

export function PropertiesPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [formOpen, setFormOpen] = useState(false);
  const [shareProp, setShareProp] = useState<Property | null>(null);
  const [uploadProp, setUploadProp] = useState<Property | null>(null);
  const propsQ = useApi(() => api.properties.list(), []);
  const clientsQ = useApi(() => api.clients.list(), []);
  const properties = propsQ.data || [];
  const list = properties.filter((p) => {
    if (filter === 'Locked') return p.isLocked;
    if (filter === 'Unlocked') return !p.isLocked;
    if (filter === 'Published') return p.published;
    return true;
  });
  return (
    <div>
      <Topbar
        title="Properties"
        subtitle={`${properties.length} galleries`}
        actions={
          <button className={`${styles.btn} ${styles.btnGold}`} onClick={() => setFormOpen(true)}>
            <Plus size={14} /> New Property
          </button>
        }
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f}
            className={styles.btn}
            onClick={() => setFilter(f)}
            style={
              filter === f
                ? {
                    borderColor: 'rgba(196,167,102,0.4)',
                    background: 'rgba(196,167,102,0.1)',
                    color: '#c4a766',
                  }
                : undefined
            }
          >
            {f}
          </button>
        ))}
      </div>
      {propsQ.loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(245,243,239,0.5)' }}>
          <Loader2 size={20} /> Loading…
        </div>
      )}
      <div className={styles.propertyGrid}>
        {list.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className={styles.propertyCard}
          >
            <div style={{ position: 'relative' }}>
              <Link to={`/gallery/${p.shareSlug}`}>
                <img src={p.coverImage} className={styles.propertyImg} alt={p.address} />
              </Link>
              <div style={{ position: 'absolute', top: 14, right: 14 }}>
                <span
                  className={`${styles.badge} ${p.isLocked ? styles.badgeLocked : styles.badgePaid}`}
                >
                  {p.isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                  {p.isLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
            </div>
            <div className={styles.propertyBody}>
              <Link
                to={`/gallery/${p.shareSlug}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <p className={styles.propertyAddress}>{p.address}</p>
                <p className={styles.propertyLoc}>
                  {p.city}, {p.state} {p.zip}
                </p>
              </Link>
              <div className={styles.propertyMeta}>
                <span>
                  <Bed size={12} /> {p.bedrooms || '—'} bd
                </span>
                <span>
                  <Bath size={12} /> {p.bathrooms || '—'} ba
                </span>
                <span>
                  <Maximize2 size={12} /> {p.squareFeet?.toLocaleString() || '—'} sqft
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 12,
                }}
              >
                <span className={styles.propertyPrice}>${p.price.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={styles.btn}
                  style={{ flex: 1, justifyContent: 'center', padding: '8px 10px', fontSize: 12 }}
                  onClick={() => setUploadProp(p)}
                >
                  <Upload size={12} /> Upload
                </button>
                <button
                  className={styles.btn}
                  style={{ flex: 1, justifyContent: 'center', padding: '8px 10px', fontSize: 12 }}
                  onClick={() => setShareProp(p)}
                >
                  <Share2 size={12} /> Share
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <PropertyFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        clients={clientsQ.data || []}
        onCreated={() => propsQ.refetch()}
      />
      <ShareLinkModal open={!!shareProp} onClose={() => setShareProp(null)} property={shareProp} />
      <UploadModal
        open={!!uploadProp}
        onClose={() => setUploadProp(null)}
        property={uploadProp}
        onUpdated={(updated) => {
          setUploadProp(updated);
          propsQ.refetch();
        }}
      />
    </div>
  );
}
