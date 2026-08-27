import { useCallback, useEffect, useRef, useState } from 'react';
import { PiCoinDuotone } from 'react-icons/pi';
import styles from './PlayAndEarn.module.css';

const ROUND_SECONDS = 15;
const SPAWN_INTERVAL_MS = 700;
const FALL_DURATION_S = 3;

let coinIdSeq = 0;

export default function GamePlay({ onFinish, submitting }) {
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState([]);
  const finishedRef = useRef(false);
  const scoreRef = useRef(0);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish(scoreRef.current);
  }, [onFinish]);

  // Countdown timer
  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(tick);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Spawn coins while time remains
  useEffect(() => {
    if (timeLeft <= 0) return undefined;
    const spawner = setInterval(() => {
      const id = ++coinIdSeq;
      const leftPercent = 8 + Math.random() * 80;
      setCoins((prev) => [...prev, { id, left: leftPercent }]);
    }, SPAWN_INTERVAL_MS);
    return () => clearInterval(spawner);
  }, [timeLeft]);

  // End the round shortly after time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      const t = setTimeout(finish, 500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [timeLeft, finish]);

  const catchCoin = (id) => {
    setCoins((prev) => prev.filter((c) => c.id !== id));
    setScore((s) => {
      const next = s + 1;
      scoreRef.current = next;
      return next;
    });
  };

  const removeMissed = (id) => {
    setCoins((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className={styles.playBox}>
      <div className={styles.playHud}>
        <span>
          Time: <strong>{timeLeft}s</strong>
        </span>
        <span>
          Score: <strong>{score}</strong>
        </span>
      </div>

      <div className={styles.playArea} aria-live="polite">
        {coins.map((coin) => (
          <button
            key={coin.id}
            className={styles.coin}
            style={{
              left: `${coin.left}%`,
              animationDuration: `${FALL_DURATION_S}s`,
            }}
            onClick={() => catchCoin(coin.id)}
            onAnimationEnd={() => removeMissed(coin.id)}
            aria-label="Catch coin"
          >
            <PiCoinDuotone aria-hidden="true" />
          </button>
        ))}
        {timeLeft === 0 && (
          <div className={styles.playOverlay}>
            {submitting ? 'Saving your score…' : "Time's up!"}
          </div>
        )}
      </div>
    </div>
  );
}
