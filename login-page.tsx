import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../auth-context';
import styles from '../styles.module.css';

export function LoginPage() {
  const nav = useNavigate();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      nav('/admin');
    } catch (err: any) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginHero}>
        <div className={styles.brand}>
          <Camera size={22} color="#c4a766" />
          Solo<span style={{ color: '#c4a766' }}>Photography</span>
        </div>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className={styles.loginHeroTitle}
          >
            Cinematic real estate photography, delivered with quiet luxury.
          </motion.h1>
          <p className={styles.loginHeroSub}>
            An admin-only control panel for managing properties, clients, payments, and
            AI-powered workflows.
          </p>
        </div>
      </div>
      <form className={styles.loginForm} onSubmit={submit}>
        <div className={styles.loginCard}>
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', margin: 0, fontWeight: 500 }}>
              Admin Sign In
            </h2>
            <p style={{ color: 'rgba(245,243,239,0.55)', margin: '6px 0 0', fontSize: 14 }}>
              Restricted access.
            </p>
          </div>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="solophotography@icloud.com"
            autoComplete="email"
            disabled={submitting}
          />
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={submitting}
          />
          {error && <div style={{ color: '#e88a7a', fontSize: 12, marginTop: -8 }}>{error}</div>}
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnGold}`}
            style={{ marginTop: 8 }}
            disabled={submitting}
          >
            {submitting ? <Loader2 size={14} /> : <Lock size={14} />}
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
          <p
            style={{
              fontSize: 11,
              color: 'rgba(245,243,239,0.4)',
              marginTop: 14,
              textAlign: 'center',
            }}
          >
            No public signup. No client accounts.
          </p>
        </div>
      </form>
    </div>
  );
}
