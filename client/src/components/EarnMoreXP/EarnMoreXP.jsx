import { useCallback, useEffect, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import * as api from '../../api/endpoints';
import Skeleton from '../common/Skeleton';
import styles from './EarnMoreXP.module.css';

export default function EarnMoreXP({ onXpAwarded }) {
  const [tasks, setTasks] = useState(null);
  const [status, setStatus] = useState('loading');
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await api.fetchTasks();
      setTasks(res.data.tasks);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClaim = async (taskId) => {
    setClaimingId(taskId);
    setError(null);
    try {
      const res = await api.claimTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, claimedToday: true } : t))
      );
      if (onXpAwarded) onXpAwarded(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not claim this task.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <section className={styles.wrap} aria-label="Earn more XP">
      <h2 className={styles.title}>Earn More XP &amp; Rewards</h2>
      <p className={styles.subtitle}>Complete these to keep climbing toward your next level.</p>

      {error && <p className={styles.error}>{error}</p>}

      {status === 'loading' && (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={92} radius={16} />
          ))}
        </div>
      )}

      {status === 'error' && (
        <button className={styles.retryBtn} onClick={load}>
          Try again
        </button>
      )}

      {status === 'ready' && tasks && (
        <div className={styles.grid}>
          {tasks.map((task) => (
            <div key={task.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>
                  <HiOutlineSparkles aria-hidden="true" />
                </div>
                <span className={styles.xpTag}>+{task.xp} XP</span>
              </div>
              <p className={styles.cardLabel}>{task.label}</p>
              <button
                className={`${styles.claimBtn} ${task.claimedToday ? styles.claimed : ''}`}
                disabled={task.claimedToday || claimingId === task.id}
                onClick={() => handleClaim(task.id)}
              >
                {task.claimedToday ? (
                  <>
                    <FiCheckCircle aria-hidden="true" /> Completed today
                  </>
                ) : claimingId === task.id ? (
                  'Claiming…'
                ) : (
                  'Claim XP'
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
