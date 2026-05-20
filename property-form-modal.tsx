import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Loader2 } from 'lucide-react';
import { api, type Property, type CreatePropertyInput, type Client } from './api';
import styles from './styles.module.css';

const propertyTypes = ['Single Family', 'Condo', 'Townhouse', 'Villa', 'Penthouse', 'Loft', 'Estate', 'Mansion', 'Chalet'];

export function PropertyFormModal({
  open,
  onClose,
  onCreated,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (property: Property) => void;
  clients: Client[];
}) {
  const [form, setForm] = useState<CreatePropertyInput>({
    address: '',
    city: '',
    state: '',
    zip: '',
    description: '',
    price: 1500,
    clientId: clients[0]?.id || '',
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    lotSize: 0,
    yearBuilt: 0,
    estimatedValue: 0,
    propertyType: 'Single Family',
  });
  const [autofilling, setAutofilling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CreatePropertyInput>(key: K, value: CreatePropertyInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function autofill() {
    if (!form.address || !form.city || !form.state) {
      setError('Enter address, city, and state first.');
      return;
    }
    setError(null);
    setAutofilling(true);
    try {
      const data = await api.properties.autofill({
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
      });
      setForm((f) => ({
        ...f,
        bedrooms: data.bedrooms ?? f.bedrooms,
        bathrooms: data.bathrooms ?? f.bathrooms,
        squareFeet: data.squareFeet ?? f.squareFeet,
        lotSize: data.lotSize ?? f.lotSize,
        yearBuilt: data.yearBuilt ?? f.yearBuilt,
        estimatedValue: data.estimatedValue ?? f.estimatedValue,
        propertyType: data.propertyType ?? f.propertyType,
        externalListingUrl: data.externalListingUrl ?? f.externalListingUrl,
      }));
    } catch (e: any) {
      setError(e.message || 'Auto-fill failed.');
    } finally {
      setAutofilling(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.address || !form.city || !form.state || !form.zip || !form.clientId) {
      setError('Address, city, state, zip, and client are required.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.properties.create(form);
      onCreated(created);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Could not create property.');
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
            overflowY: 'auto',
          }}
        >
          <motion.form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            style={{
              width: '100%',
              maxWidth: 720,
              background: 'rgba(15,15,17,0.96)',
              border: '1px solid rgba(245,243,239,0.08)',
              borderRadius: 20,
              padding: 28,
              color: '#f5f3ef',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 18,
              }}
            >
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', margin: 0, fontWeight: 500 }}>
                  New Property Gallery
                </h2>
                <p style={{ color: 'rgba(245,243,239,0.55)', margin: '4px 0 0', fontSize: 13 }}>
                  Enter the property details. Use Auto-Fill to populate metadata from the address.
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Street Address" full>
                <input
                  className={styles.input}
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="128 Greenwich St"
                />
              </Field>
              <Field label="City">
                <input
                  className={styles.input}
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="New York"
                />
              </Field>
              <Field label="State">
                <input
                  className={styles.input}
                  value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                  placeholder="NY"
                />
              </Field>
              <Field label="ZIP">
                <input
                  className={styles.input}
                  value={form.zip}
                  onChange={(e) => set('zip', e.target.value)}
                  placeholder="10006"
                />
              </Field>
              <Field label="Auto-Fill">
                <button
                  type="button"
                  onClick={autofill}
                  className={`${styles.btn} ${styles.btnGold}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={autofilling}
                >
                  {autofilling ? <Loader2 size={14} /> : <Wand2 size={14} />}
                  {autofilling ? 'Fetching…' : 'Auto-Fill Property Data'}
                </button>
              </Field>
              <Field label="Client">
                <select
                  className={styles.input}
                  value={form.clientId}
                  onChange={(e) => set('clientId', e.target.value)}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: '#0a0a0b' }}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Price (USD)">
                <input
                  className={styles.input}
                  type="number"
                  value={form.price}
                  onChange={(e) => set('price', Number(e.target.value))}
                />
              </Field>
              <Field label="Property Type">
                <select
                  className={styles.input}
                  value={form.propertyType}
                  onChange={(e) => set('propertyType', e.target.value)}
                >
                  {propertyTypes.map((t) => (
                    <option key={t} value={t} style={{ background: '#0a0a0b' }}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Bedrooms">
                <input
                  className={styles.input}
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) => set('bedrooms', Number(e.target.value))}
                />
              </Field>
              <Field label="Bathrooms">
                <input
                  className={styles.input}
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) => set('bathrooms', Number(e.target.value))}
                />
              </Field>
              <Field label="Square Feet">
                <input
                  className={styles.input}
                  type="number"
                  value={form.squareFeet}
                  onChange={(e) => set('squareFeet', Number(e.target.value))}
                />
              </Field>
              <Field label="Year Built">
                <input
                  className={styles.input}
                  type="number"
                  value={form.yearBuilt}
                  onChange={(e) => set('yearBuilt', Number(e.target.value))}
                />
              </Field>
              <Field label="Estimated Value (USD)">
                <input
                  className={styles.input}
                  type="number"
                  value={form.estimatedValue}
                  onChange={(e) => set('estimatedValue', Number(e.target.value))}
                />
              </Field>
              <Field label="Description" full>
                <textarea
                  className={styles.input}
                  rows={3}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Cinematic 1-2 line description."
                />
              </Field>
            </div>
            {error && <div style={{ color: '#e88a7a', fontSize: 13, marginTop: 14 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className={styles.btn}>
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnGold}`}
                disabled={submitting}
              >
                {submitting ? <Loader2 size={14} /> : null}
                {submitting ? 'Creating…' : 'Create Gallery'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div
      style={{
        gridColumn: full ? 'span 2' : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <label className={styles.label} style={{ marginBottom: 0 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
