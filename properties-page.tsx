import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, Lock, Unlock, Loader2, Plus, X, Wand2 } from 'lucide-react';
import { Topbar } from './topbar';
import { api, type Property, type CreatePropertyInput } from './api';
import { useApi } from './use-api';

const PROPERTY_TYPES = ['Single Family','Condo','Townhouse','Villa','Penthouse','Loft','Estate','Mansion','Chalet'];

export function PropertiesPage() {
  const [filter, setFilter] = useState<'All'|'Locked'|'Unlocked'|'Published'>('All');
  const [showForm, setShowForm] = useState(false);
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
          <button className="btn btnGold" onClick={() => setShowForm(true)}>
            <Plus size={14} /> New Property
          </button>
        }
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {(['All','Locked','Unlocked','Published'] as const).map((f) => (
          <button key={f} className="btn" onClick={() => setFilter(f)}
            style={filter === f ? { borderColor: 'rgba(196,167,102,0.4)', background: 'rgba(196,167,102,0.1)', color: '#c4a766' } : undefined}>
            {f}
          </button>
        ))}
      </div>
      {propsQ.loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(245,243,239,0.5)' }}>
          <Loader2 size={20} /> Loading…
        </div>
      )}
      <div className="propertyGrid">
        {list.map((p) => (
          <div key={p.id} className="propertyCard">
            <div style={{ position: 'relative' }}>
              <Link to={`/gallery/${p.shareSlug}`}>
                <img src={p.coverImage} className="propertyImg" alt={p.address} />
              </Link>
              <div style={{ position: 'absolute', top: 14, right: 14 }}>
                <span className={`badge ${p.isLocked ? 'badgeLocked' : 'badgePaid'}`}>
                  {p.isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                  {p.isLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
            </div>
            <div className="propertyBody">
              <Link to={`/gallery/${p.shareSlug}`} style={{ color: 'inherit' }}>
                <p className="propertyAddress">{p.address}</p>
                <p className="propertyLoc">{p.city}, {p.state} {p.zip}</p>
              </Link>
              <div className="propertyMeta">
                <span><Bed size={12} /> {p.bedrooms || '—'} bd</span>
                <span><Bath size={12} /> {p.bathrooms || '—'} ba</span>
                <span><Maximize2 size={12} /> {p.squareFeet?.toLocaleString() || '—'} sqft</span>
              </div>
              <span className="propertyPrice">${p.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
        {!propsQ.loading && !list.length && (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48 }}>
            <p style={{ color: 'rgba(245,243,239,0.5)' }}>No properties yet — click New Property to get started.</p>
          </div>
        )}
      </div>
      {showForm && (
        <NewPropertyModal
          clients={clientsQ.data || []}
          onClose={() => setShowForm(false)}
          onCreated={() => { propsQ.refetch(); setShowForm(false); }}
        />
      )}
    </div>
  );
}

function NewPropertyModal({ clients, onClose, onCreated }: { clients: any[]; onClose: () => void; onCreated: (p: Property) => void }) {
  const [form, setForm] = useState<CreatePropertyInput>({
    address: '', city: '', state: '', zip: '', description: '', price: 1500,
    clientId: clients[0]?.id || '', bedrooms: 0, bathrooms: 0, squareFeet: 0,
    lotSize: 0, yearBuilt: 0, estimatedValue: 0, propertyType: 'Single Family',
  });
  const [autofilling, setAutofilling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CreatePropertyInput>(key: K, value: CreatePropertyInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function autofill() {
    if (!form.address || !form.city || !form.state) { setError('Enter address, city and state first.'); return; }
    setError(null); setAutofilling(true);
    try {
      const data = await api.properties.autofill({ address: form.address, city: form.city, state: form.state, zip: form.zip });
      setForm((f) => ({
        ...f,
        bedrooms: data.bedrooms ?? f.bedrooms,
        bathrooms: data.bathrooms ?? f.bathrooms,
        squareFeet: data.squareFeet ?? f.squareFeet,
        lotSize: data.lotSize ?? f.lotSize,
        yearBuilt: data.yearBuilt ?? f.yearBuilt,
        estimatedValue: data.estimatedValue ?? f.estimatedValue,
        propertyType: data.propertyType ?? f.propertyType,
      }));
    } catch (e: any) { setError(e.message || 'Auto-fill failed.'); }
    finally { setAutofilling(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!form.address || !form.city || !form.state || !form.zip || !form.clientId) {
      setError('Address, city, state, zip and client are required.'); return;
    }
    setSubmitting(true);
    try {
      const p = await api.properties.create(form);
      onCreated(p);
    } catch (e: any) { setError(e.message || 'Could not create property.'); setSubmitting(false); }
  }

  const field = (label: string, child: React.ReactNode, full?: boolean) => (
    <div style={{ gridColumn: full ? 'span 2' : undefined, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'rgba(245,243,239,0.55)' }}>{label}</label>
      {child}
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 200, padding: 24, overflowY: 'auto' }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        style={{ width: '100%', maxWidth: 700, background: 'rgba(15,15,17,0.97)', border: '1px solid rgba(245,243,239,0.08)', borderRadius: 20, padding: 28, color: '#f5f3ef', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', margin: 0, fontWeight: 500 }}>New Property Gallery</h2>
            <p style={{ color: 'rgba(245,243,239,0.55)', margin: '4px 0 0', fontSize: 13 }}>Fill in details. Use Auto-Fill to populate from address.</p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#f5f3ef', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Street Address', <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="128 Greenwich St" />, true)}
          {field('City', <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="New York" />)}
          {field('State', <input className="input" value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="NY" />)}
          {field('ZIP', <input className="input" value={form.zip} onChange={(e) => set('zip', e.target.value)} placeholder="10006" />)}
          {field('Auto-Fill',
            <button type="button" className="btn btnGold" onClick={autofill} disabled={autofilling} style={{ justifyContent: 'center' }}>
              {autofilling ? <Loader2 size={14} /> : <Wand2 size={14} />}
              {autofilling ? 'Fetching…' : 'Auto-Fill Property Data'}
            </button>
          )}
          {field('Client',
            <select className="input" value={form.clientId} onChange={(e) => set('clientId', e.target.value)}>
              {clients.length === 0 && <option value="">No clients yet — add one first</option>}
              {clients.map((c) => <option key={c.id} value={c.id} style={{ background: '#0a0a0b' }}>{c.fullName}</option>)}
            </select>
          )}
          {field('Price (USD)', <input className="input" type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} />)}
          {field('Property Type',
            <select className="input" value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t} style={{ background: '#0a0a0b' }}>{t}</option>)}
            </select>
          )}
          {field('Bedrooms', <input className="input" type="number" value={form.bedrooms} onChange={(e) => set('bedrooms', Number(e.target.value))} />)}
          {field('Bathrooms', <input className="input" type="number" value={form.bathrooms} onChange={(e) => set('bathrooms', Number(e.target.value))} />)}
          {field('Square Feet', <input className="input" type="number" value={form.squareFeet} onChange={(e) => set('squareFeet', Number(e.target.value))} />)}
          {field('Year Built', <input className="input" type="number" value={form.yearBuilt} onChange={(e) => set('yearBuilt', Number(e.target.value))} />)}
          {field('Estimated Value', <input className="input" type="number" value={form.estimatedValue} onChange={(e) => set('estimatedValue', Number(e.target.value))} />)}
          {field('Description',
            <textarea className="input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Cinematic 1-2 line description." style={{ resize: 'vertical', fontFamily: 'inherit' }} />,
            true
          )}
        </div>
        {error && <div style={{ color: '#e88a7a', fontSize: 13, marginTop: 14 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn">Cancel</button>
          <button type="submit" className="btn btnGold" disabled={submitting}>
            {submitting ? <Loader2 size={14} /> : null}{submitting ? 'Creating…' : 'Create Gallery'}
          </button>
        </div>
      </form>
    </div>
  );
}
