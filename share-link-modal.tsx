import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';
import type { Property } from './api';
import styles from './styles.module.css';

export function ShareLinkModal({
  open,
  onClose,
  property,
}: {
  open: boolean;
  onClose: () => void;
  property: Property | null;
}) {
  const [copied, setCopied] = useState(false);
  if (!property) return null;
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/gallery/${property.shareSlug}`
      : `/gallery/${property.shareSlug}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <AnimatePresence>
      {open && (
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
              maxWidth: 460,
              background: 'rgba(15,15,17,0.96)',
              border: '1px solid rgba(245,243,239,0.08)',
              borderRadius: 20,
              padding: 28,
              color: '#f5f3ef',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', margin: 0, fontWeight: 500 }}>
                  Share Gallery
                </h2>
                <p style={{ color: 'rgba(245,243,239,0.55)', margin: '4px 0 14px', fontSize: 13 }}>
                  {property.address}
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
              style={{
                background: '#f5f3ef',
                padding: 18,
                borderRadius: 14,
                display: 'inline-block',
                margin: '8px auto 20px',
              }}
            >
              <QRCodeCanvas value={url} size={180} fgColor="#0a0a0b" />
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: 10,
                background: 'rgba(245,243,239,0.05)',
                border: '1px solid rgba(245,243,239,0.08)',
                borderRadius: 12,
              }}
            >
              <input
                readOnly
                value={url}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#f5f3ef',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGold}`}
                onClick={copy}
                style={{ padding: '8px 14px' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(245,243,239,0.5)' }}>
              Send this link or QR to the client.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
