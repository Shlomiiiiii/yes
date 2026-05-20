import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import styles from './styles.module.css';

export function Topbar({
  title,
  subtitle,
  actions,
  showSearch = true,
  searchPlaceholder = 'Search…',
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
}) {
  return (
    <div className={styles.topbar}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {showSearch && (
          <div className={styles.search}>
            <Search size={15} color="rgba(245,243,239,0.5)" />
            <input placeholder={searchPlaceholder} />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
