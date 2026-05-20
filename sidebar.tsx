import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  CreditCard,
  Sparkles,
  Settings,
  Camera,
  LogOut,
} from 'lucide-react';
import { useAuth } from './auth-context';
import styles from './styles.module.css';

const items = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/finances', label: 'Finances', icon: Wallet },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/ai', label: 'AI Assistant', icon: Sparkles },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Camera size={22} color="#c4a766" />
        Solo<span>Photography</span>
      </div>
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
          }
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
      <div className={styles.sidebarFoot}>
        <strong>Admin</strong>
        <br />
        {user?.email || 'solophotography@icloud.com'}
        <button
          onClick={signOut}
          className={styles.navItem}
          style={{
            marginTop: 10,
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(245,243,239,0.08)',
            fontFamily: 'inherit',
          }}
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );
}
