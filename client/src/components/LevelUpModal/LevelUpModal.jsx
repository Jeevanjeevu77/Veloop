import { useEffect, useRef } from 'react';
import { PiCoinDuotone, PiDiamondDuotone } from 'react-icons/pi';
import styles from './LevelUpModal.module.css';

export default function LevelUpModal({ newLevel, reward, onClose }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="levelup-title">
      <div className={styles.modal}>
        <div className={styles.badge}>
          {reward?.type === 'Gems' ? (
            <PiDiamondDuotone aria-hidden="true" />
          ) : (
            <PiCoinDuotone aria-hidden="true" />
          )}
        </div>
        <p className={styles.eyebrow}>Achievement Unlocked</p>
        <h2 id="levelup-title" className={styles.title}>
          Level Up!
        </h2>
        <p className={styles.levelText}>
          You reached Level {String(newLevel).padStart(2, '0')}
        </p>
        {reward && (
          <p className={styles.rewardText}>
            +{reward.amount.toLocaleString()} {reward.type} Reward
          </p>
        )}
        <button ref={closeBtnRef} className={styles.continueBtn} onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
