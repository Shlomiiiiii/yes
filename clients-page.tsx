import { useMemo, useState } from 'react';
import { Mail, Phone, Loader2, Plus, X } from 'lucide-react';
import { Topbar } from './topbar';
import { api, type Client, type CreateClientInput } from './api';
import { useApi } from './use-api';

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
        subtitle={`${clients.length} clients · A → Z`}
        showSearch={false}
        actions={
          <>
            <div className="search">
              <input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button className="btn btnGold" onClick={() => setShowForm(true)}>
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
      {!clientsQ.loading && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Galleries</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td><strong style={{ fontWeight: 500 }}>{c.fullName}</strong></td>
                  <td><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Mail size={12} color="rgba(245,243,239,0.4)" /> {c.email}</span></td>
                  <td><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Phone size={12} color="rgba(245,243,239,0.4)" /> {c.phone}</span></td>
                  <td>{c.galleries}</td>
                  <td style={{ color: '#c4a766' }}>${c.totalSpent.toLocaleString()}</td>
                </tr>
              ))}
              {!list.length && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(245,243,239,0.4)', padding: 32 }}>No clients yet — add one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <AddClientModal
          onClose={() => setShowForm(false)}
          onCreated={() => { clientsQ.refetch(); setShowForm(false); }}
        />
      )}
    </div>
  );
}

function AddClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Client) => void }) {
  const [form, setForm] = useState<CreateClientInput>({ fullName: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.fullName || !form.email) { setError('Name and email required.'); return; }
    setSubmitting(true);
    try {
      const c = await api.clients.create(form);
      onCreated(c);
    } catch (e: any) {
      setError(e.message || 'Could not create client.');
      setSubmitting(false);
    }
  }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 200, padding: 24 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ width: '100%', maxWidth: 440, background: 'rgba(15,15,17,0.97)', border: '1px solid rgba(245,243,239,0.08)', borderRadius: 20, padding: 28, color: '#f5f3ef', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', margin: 0, fontWeight: 500 }}>New Client</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#f5f3ef', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <label className="label">Full Name</label>
        <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Camille Whitfield" />
        <label className="label">Email</label>
        <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@example.com" />
        <label className="label">Phone</label>
        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (212) 555-0100" />
        {error && <div style={{ color: '#e88a7a', fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose} className="btn">Cancel</button>
          <button type="submit" className="btn btnGold" disabled={submitting}>
            {submitting ? <Loader2 size={14} /> : null}{submitting ? 'Adding…' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
