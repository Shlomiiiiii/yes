import { useMemo, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mail, Phone, X, Loader2 } from 'lucide-react';
import { Topbar } from '../topbar';
import { api, type Client, type CreateClientInput } from '../api';
import { useApi } from '../use-api';
import styles from '../styles.module.css';

export function ClientsPage() {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const clientsQ = useApi(() => api.clients.list(), []);
  const clients = clientsQ.data || [];
  const list = useMemo(() => {
    const sorted = [...clients].sort((a, b) => a.fullName.localeCompare(b.fullName));
    const q = query.toLowerCase().trim();
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    );
  }, [query, clients]);
  return (
    <div>
      <Topbar
        title="Clients"
        subtitle={`${clients.length} clients · sorted A → Z`}
        showSearch={false}
        actions={
          <>
            <div className={styles.search}>
              <input
                placeholder="Search clients…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className={`${styles.btn} ${styles.btnGold}`} onClick={() => setShowForm(true)}>
              <Plus size={14} /> Add Client
            </button>
          </>
        }
      />
      {clientsQ.loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(245,243,239,0.5)' }}>
          <Loader2 size={20} /> Loading…
        </div>
      )}
      {!clientsQ.loading && !!clients.length && (
        <motion.div
          className={styles.card}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ overflowX: 'auto' }}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Galleries</th>
                <th>Revenue</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background:
                            'linear-gradient(135deg, rgba(196,167,102,0.3), rgba(196,167,102,0.08))',
                          display: 'grid',
                          placeItems: 'center',
                          fontFamily: 'Playfair Display, serif',
                          color: '#c4a766',
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {c.fullName
                          .split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <strong style={{ fontWeight: 500 }}>{c.fullName}</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <Mail size={12} color="rgba(245,243,239,0.4)" /> {c.email}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <Phone size={12} color="rgba(245,243,239,0.4)" /> {c.phone}
                    </span>
                  </td>
                  <td>{c.galleries}</td>
                  <td style={{ color: '#c4a766' }}>${c.totalSpent.toLocaleString()}</td>
                  <td style={{ color: 'rgba(245,243,239,0.5)' }}>{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
      <AddClientModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => clientsQ.refetch()}
      />
    </div>
  );
}

function AddClientModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (c: Client) => void;
}) {
  const [form, setForm] = useState<CreateClientInput>({ fullName: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.fullName || !form.email) {
      setError('Name and email required.');
      return;
    }
    setSubmitting(true);
    try {
      const c = await api.clients.create(form);
      onCreated(c);
      setForm({ fullName: '', email: '', phone: '' });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Could not create client.');
    } finally {
      setSubmitting(false);
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
          <motion.form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'rgba(15,15,17,0.96)',
              border: '1px solid rgba(245,243,239,0.08)',
              borderRadius: 20,
              padding: 28,
              color: '#f5f3ef',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <h2 style={{ fontFamily: 'Playfair Display, serif', margin: 0, fontWeight: 500 }}>
                New Client
              </h2>
              <button
                type="button"
                onClick={onClose}
                className={styles.btn}
                style={{ padding: '6px 10px' }}
              >
                <X size={14} />
              </button>
            </div>
            <label className={styles.label}>Full Name</label>
            <input
              className={styles.input}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <label className={styles.label}>Phone</label>
            <input
              className={styles.input}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {error && <div style={{ color: '#e88a7a', fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" onClick={onClose} className={styles.btn}>
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnGold}`}
                disabled={submitting}
              >
                {submitting ? <Loader2 size={14} /> : null}
                {submitting ? 'Adding…' : 'Add Client'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
