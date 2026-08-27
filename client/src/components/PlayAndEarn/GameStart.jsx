import { PiCoinDuotone } from 'react-icons/pi';
import styles from './PlayAndEarn.module.css';

export default function GameStart({ onStart }) {
  return (
    <div className={styles.startBox}>
      <div className={styles.startIcon}>
        <PiCoinDuotone aria-hidden="true" />
      </div>
      <h3 className={styles.gameName}>Catch the Coins</h3>
      <p className={styles.gameDesc}>
        Coins fall for 15 seconds — click or tap each one before it hits the bottom.
      </p>
      <ul className={styles.rulesList}>
        <li>Objective: catch as many coins as you can in 15 seconds.</li>
        <li>Scoring: each coin caught = 1 point. XP earned = points × 2 (up to 30 XP).</li>
        <li>You get 3 plays per day.</li>
      </ul>
      <button className={styles.primaryBtn} onClick={onStart}>
        Play Now
      </button>
    </div>
  );
}
