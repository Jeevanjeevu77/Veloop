import { useCallback, useEffect, useState } from 'react';
import * as api from '../../api/endpoints';
import GameStart from './GameStart';
import GamePlay from './GamePlay';
import GameResult from './GameResult';
import Skeleton from '../common/Skeleton';
import styles from './PlayAndEarn.module.css';

export default function PlayAndEarn({ onXpAwarded }) {
  const [phase, setPhase] = useState('loading'); // loading | idle | playing | result | unavailable
  const [playsRemaining, setPlaysRemaining] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(3);
  const [lastResult, setLastResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await api.fetchGamePlayStatus();
      setPlaysRemaining(res.data.playsRemaining);
      setDailyLimit(res.data.dailyLimit);
      setPhase(res.data.allowed ? 'idle' : 'unavailable');
    } catch {
      setPhase('unavailable');
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleStart = () => setPhase('playing');

  const handleFinish = async (score) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.submitGameResult(score);
      setLastResult(res.data);
      setPlaysRemaining(res.data.playsRemaining);
      setPhase('result');
      if (onXpAwarded) onXpAwarded(res.data);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error || 'Could not save your score. Please try again.'
      );
      setPhase('idle');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    setLastResult(null);
    if (playsRemaining > 0) {
      setPhase('idle');
    } else {
      setPhase('unavailable');
    }
  };

  return (
    <section className={styles.wrap} aria-label="Play and earn">
      <div className={styles.header}>
        <h2 className={styles.title}>Play &amp; Earn</h2>
        {phase !== 'loading' && phase !== 'playing' && (
          <span className={styles.plays}>
            {playsRemaining}/{dailyLimit} plays left today
          </span>
        )}
      </div>

      {submitError && <p className={styles.error}>{submitError}</p>}

      {phase === 'loading' && (
        <div className={styles.loadingBox}>
          <Skeleton height={22} width="60%" />
          <Skeleton height={100} width="100%" style={{ marginTop: 14 }} />
          <Skeleton height={38} width="140px" style={{ marginTop: 14 }} />
        </div>
      )}

      {phase === 'idle' && <GameStart onStart={handleStart} />}

      {phase === 'playing' && <GamePlay onFinish={handleFinish} submitting={submitting} />}

      {phase === 'result' && lastResult && (
        <GameResult result={lastResult} onPlayAgain={handlePlayAgain} />
      )}

      {phase === 'unavailable' && (
        <div className={styles.unavailable}>
          <p className={styles.unavailableTitle}>New challenge coming soon.</p>
          <p className={styles.unavailableText}>
            You've used all {dailyLimit} plays for today. Come back tomorrow for more chances
            to earn XP.
          </p>
        </div>
      )}
    </section>
  );
}
