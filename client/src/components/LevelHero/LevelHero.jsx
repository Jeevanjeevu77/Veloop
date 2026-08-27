import { useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { PiCoinDuotone, PiDiamondDuotone } from 'react-icons/pi';
import styles from './LevelHero.module.css';

function RewardIcon({ type }) {
  return type === 'Gems' ? (
    <PiDiamondDuotone aria-hidden="true" />
  ) : (
    <PiCoinDuotone aria-hidden="true" />
  );
}

export default function LevelHero({ dashboard }) {
  const {
    level,
    currentXP,
    xpIntoLevel,
    xpForLevel,
    xpToNextLevel,
    progressPercent,
    nextLevelReward,
    isMaxLevel,
  } = dashboard;

  // Animate the bar in from 0 on mount for a subtle "fill up" effect.
  const [animatedPercent, setAnimatedPercent] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimatedPercent(progressPercent));
    return () => cancelAnimationFrame(t);
  }, [progressPercent]);

  return (
    <section className={styles.hero} aria-label="Level progress">
      <div className={styles.left}>
        <p className={styles.eyebrow}>Level Up. Earn More. Unlock Rewards.</p>
        <h1 className={styles.heading}>
          Keep playing and earning to reach your next level.
        </h1>

        <div className={styles.levelRow}>
          <div className={styles.badge}>
            <span className={styles.badgeLevel}>{level}</span>
          </div>
          <div>
            <p className={styles.levelLabel}>Current Level</p>
            <p className={styles.levelValue}>Level {String(level).padStart(2, '0')}</p>
          </div>
          <div className={styles.xpBlock}>
            <p className={styles.levelLabel}>Current XP</p>
            <p className={styles.xpValue}>{currentXP.toLocaleString()} XP</p>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressTop}>
            <span>
              {isMaxLevel
                ? 'Max level reached'
                : `${xpIntoLevel.toLocaleString()} / ${xpForLevel.toLocaleString()} XP`}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className={styles.progressTrack} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={styles.progressFill}
              style={{ width: `${animatedPercent}%` }}
            />
          </div>
          {!isMaxLevel && (
            <p className={styles.remaining}>
              {xpToNextLevel.toLocaleString()} XP remaining to reach Level{' '}
              {String(level + 1).padStart(2, '0')}
            </p>
          )}
        </div>
      </div>

      <div className={styles.rewardCard}>
        <div className={styles.rewardHeader}>
          <span>Next Level Reward</span>
          <FiInfo
            className={styles.infoIcon}
            aria-label="The displayed reward is associated with the next level according to the current reward configuration."
            title="The displayed reward is associated with the next level according to the current reward configuration."
          />
        </div>

        {isMaxLevel || !nextLevelReward ? (
          <p className={styles.rewardMax}>You've reached the highest level. 🎉</p>
        ) : (
          <>
            <div className={styles.rewardIconWrap}>
              <RewardIcon type={nextLevelReward.type} />
            </div>
            <p className={styles.rewardAmount}>
              {nextLevelReward.amount.toLocaleString()} {nextLevelReward.type}
            </p>
            <p className={styles.rewardHint}>
              Reach Level {String(level + 1).padStart(2, '0')} to unlock
            </p>
            <div className={styles.rewardMiniTrack}>
              <div
                className={styles.rewardMiniFill}
                style={{ width: `${animatedPercent}%` }}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
