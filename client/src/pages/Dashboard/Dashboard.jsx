import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import LevelHero from '../../components/LevelHero/LevelHero';
import LevelRoadmap from '../../components/LevelRoadmap/LevelRoadmap';
import PlayAndEarn from '../../components/PlayAndEarn/PlayAndEarn';
import EarnMoreXP from '../../components/EarnMoreXP/EarnMoreXP';
import XPActivity from '../../components/XPActivity/XPActivity';
import LevelUpModal from '../../components/LevelUpModal/LevelUpModal';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import Footer from '../../components/Footer/Footer';
import { useDashboard } from '../../hooks/useDashboard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { data, status, refresh } = useDashboard();
  const [levelUpInfo, setLevelUpInfo] = useState(null);

  const handleXpAwarded = (result) => {
    if (result.leveledUp) {
      setLevelUpInfo({ newLevel: result.newLevel, reward: result.reward });
    }
    refresh();
  };

  return (
    <div className={styles.page}>
      <Navbar level={data?.level} currentXP={data?.currentXP} />

      <main className={`container-app ${styles.main}`}>
        {status === 'loading' && (
          <>
            <div className={styles.loadingHero}>
              <Skeleton height={18} width="40%" style={{ marginBottom: 16 }} />
              <Skeleton height={28} width="70%" style={{ marginBottom: 24 }} />
              <Skeleton height={64} width={64} radius={18} />
              <Skeleton height={14} width="100%" style={{ marginTop: 24 }} />
            </div>
            <Skeleton height={140} radius={22} />
            <div className={styles.row}>
              <Skeleton height={260} radius={22} />
              <Skeleton height={260} radius={22} />
            </div>
          </>
        )}

        {status === 'error' && (
          <ErrorState
            title="Unable to Load Level Progress"
            message="We couldn't load your level information right now."
            onRetry={refresh}
          />
        )}

        {status === 'ready' && data && (
          <>
            <LevelHero dashboard={data} />
            <LevelRoadmap roadmap={data.roadmap} />
            <div className={styles.row}>
              <PlayAndEarn onXpAwarded={handleXpAwarded} />
              <XPActivity activity={data.recentActivity} />
            </div>
            <EarnMoreXP onXpAwarded={handleXpAwarded} />
          </>
        )}
      </main>

      <Footer />

      {levelUpInfo && (
        <LevelUpModal
          newLevel={levelUpInfo.newLevel}
          reward={levelUpInfo.reward}
          onClose={() => setLevelUpInfo(null)}
        />
      )}
    </div>
  );
}
