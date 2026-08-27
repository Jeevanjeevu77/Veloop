import { useState } from 'react';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

export default function Navbar({ level, currentXP }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className={styles.navbar}>
      <div className={`container-app ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>V</span>
          <span className={styles.logoText}>VELOOP</span>
          <span className={styles.byTag}>by <span className={styles.byAuthor}>Sinchana</span></span>
        </div>

        <div className={styles.right}>
          {typeof currentXP === 'number' && (
            <div className={styles.xpChip}>
              <HiOutlineSparkles aria-hidden="true" />
              <span>{currentXP.toLocaleString()} XP</span>
              <span className={styles.levelBadge}>Lv {level}</span>
            </div>
          )}

          <div className={styles.userMenu}>
            <button
              className={styles.userBtn}
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span className={styles.avatar}>{initials}</span>
              <span className={styles.userName}>{user?.name || 'Account'}</span>
              <FiChevronDown aria-hidden="true" />
            </button>

            {menuOpen && (
              <div className={styles.dropdown} role="menu">
                <button className={styles.dropdownItem} onClick={logout} role="menuitem">
                  <FiLogOut aria-hidden="true" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
