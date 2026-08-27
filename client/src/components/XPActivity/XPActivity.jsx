import { HiOutlineSparkles } from 'react-icons/hi2';
import styles from './XPActivity.module.css';

function formatTime(iso) {
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function XPActivity({ activity }) {
  return (
    <section className={styles.wrap} aria-label="Recent XP activity">
      <h2 className={styles.title}>Recent XP Activity</h2>

      {activity.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Your XP journey starts here.</p>
          <p className={styles.emptyText}>
            Play the mini-game or complete a task below to start earning XP.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {activity.map((item, idx) => (
            <li key={idx} className={styles.item}>
              <span className={styles.icon}>
                <HiOutlineSparkles aria-hidden="true" />
              </span>
              <div className={styles.itemBody}>
                <p className={styles.itemSource}>{item.source}</p>
                <p className={styles.itemTime}>{formatTime(item.createdAt)}</p>
              </div>
              <span className={styles.itemXp}>+{item.xpAmount} XP</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
