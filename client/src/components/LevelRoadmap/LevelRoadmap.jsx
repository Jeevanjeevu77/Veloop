import { FiCheck, FiLock } from 'react-icons/fi';
import styles from './LevelRoadmap.module.css';

export default function LevelRoadmap({ roadmap }) {
  return (
    <section className={styles.wrap} aria-label="Level roadmap">
      <h2 className={styles.title}>Level Roadmap</h2>
      <div className={styles.track}>
        {roadmap.map((lvl, idx) => (
          <div key={lvl.level} className={styles.stepWrap}>
            <div
              className={`${styles.step} ${styles[lvl.state]}`}
              title={
                lvl.state === 'locked'
                  ? `Reach ${lvl.requiredXP.toLocaleString()} XP to unlock`
                  : undefined
              }
            >
              <div className={styles.circle}>
                {lvl.state === 'completed' && <FiCheck aria-hidden="true" />}
                {lvl.state === 'locked' && <FiLock aria-hidden="true" />}
                {lvl.state === 'current' && <span>{lvl.level}</span>}
              </div>
              <p className={styles.stepLabel}>Level {String(lvl.level).padStart(2, '0')}</p>
              <p className={styles.stepReward}>
                {lvl.rewardAmount > 0
                  ? `${lvl.rewardAmount.toLocaleString()} ${lvl.rewardType}`
                  : 'Start'}
              </p>
              {lvl.state === 'current' && <span className={styles.here}>You are here</span>}
            </div>
            {idx < roadmap.length - 1 && (
              <div
                className={`${styles.connector} ${
                  lvl.state === 'completed' ? styles.connectorDone : ''
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
