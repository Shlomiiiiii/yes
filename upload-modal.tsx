import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { api, type Property } from './api';
import styles from './styles.module.css';

const DEMO = [
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1400&q=80',
];

export function UploadModal({
  open,
  onClose,
  property,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  property: Property | null;
  onUpdated: (p: Property) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    if (!property) return;
    const list = Array.from(files);
    if (!list.length) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.properties.upload(property.id, list);
      onUpdated(result.property);
    } catch (e: any) {
      setError(e.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  async function addDemoImage() {
    if (!property) return;
    setBusy(true);
    setError(null);
    try {
      const url = DEMO[Math.floor(Math.random() * DEMO.length)];
      const updated = await api.properties.addMedia(property.id, url, 'image');
      onUpdated(updated);
    } catch (e: any) {
      setError(e.message || 'Could not attach image.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && property && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 80,
            padding: 24,
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
            style={{
              width: '100%',
              maxWidth: 560,
              background: 'rgba(15,15,17,0.96)',
              border: '1px solid rgba(245,243,239,0.08)',
              borderRadius: 20,
              padding: 28,
              color: '#f5f3ef',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 16,
              }}
            >
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', margin: 0, fontWeight: 500 }}>
                  Upload Media
                </h2>
                <p style={{ color: 'rgba(245,243,239,0.55)', margin: '4px 0 0', fontSize: 13 }}>
                  {property.address} · {property.images.length} files
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={styles.btn}
                style={{ padding: '6px 10px' }}
              >
                <X size={14} />
              </button>
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#c4a766' : 'rgba(245,243,239,0.12)'}`,
                borderRadius: 16,
                padding: 36,
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'rgba(196,167,102,0.05)' : 'rgba(245,243,239,0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              {busy ? (
                <Loader2 size={32} color="#c4a766" />
              ) : (
                <UploadCloud size={32} color="#c4a766" />
              )}
              <p style={{ margin: '12px 0 4px', fontSize: 15 }}>
                {busy ? 'Uploading…' : 'Drop files here or click to browse'}
              </p>
              <p style={{ margin: 0, color: 'rgba(245,243,239,0.5)', fontSize: 12 }}>
                JPG, PNG, WEBP, MP4
              </p>
              <input
                ref={inputRef}
                type="file"
                hidden
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
              />
            </div>
            {error && <div style={{ color: '#e88a7a', fontSize: 13, marginTop: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                type="button"
                className={styles.btn}
                onClick={addDemoImage}
                disabled={busy}
              >
                <ImageIcon size={14} /> Add demo image
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGold}`}
                onClick={onClose}
                style={{ marginLeft: 'auto' }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
