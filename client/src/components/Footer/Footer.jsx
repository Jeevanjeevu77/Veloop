import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container-app ${styles.inner}`}>
        <div className={styles.badge}>
          <span>Built with <span className={styles.heart}>❤️</span> by</span>
          <span className={styles.authorName}>Sinchana</span>
        </div>
        <p className={styles.copyright}>© {new Date().getFullYear()} VELOOP Rewards Dashboard</p>
      </div>
    </footer>
  );
}
