import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { AIChat } from './ai-chat';
import { useAuth } from './auth-context';
import styles from './styles.module.css';

export function AdminShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className={styles.app}>
      <div className="shell" style={{ minHeight: '100vh' }}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
      <AIChat />
    </div>
  );
}
