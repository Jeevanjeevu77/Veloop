import { HiOutlineSparkles } from 'react-icons/hi2';
import styles from './PlayAndEarn.module.css';

export default function GameResult({ result, onPlayAgain }) {
  const { score, xpAwarded, leveledUp, playsRemaining } = result;

  return (
    <div className={styles.resultBox}>
      <div className={styles.resultIcon}>
        <HiOutlineSparkles aria-hidden="true" />
      </div>
      <p className={styles.resultScore}>Score: {score}</p>
      <p className={styles.resultXp}>+{xpAwarded} XP earned</p>
      {leveledUp && <p className={styles.resultLevelUp}>You leveled up! 🎉</p>}

      <div className={styles.resultActions}>
        {playsRemaining > 0 ? (
          <button className={styles.primaryBtn} onClick={onPlayAgain}>
            Play Again ({playsRemaining} left)
          </button>
        ) : (
          <p className={styles.gameDesc}>You've used all your plays for today.</p>
        )}
      </div>
    </div>
  );
}
