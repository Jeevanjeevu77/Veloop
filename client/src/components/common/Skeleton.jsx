import styles from './Skeleton.module.css';

export default function Skeleton({ height = 16, width = '100%', radius = 8, style }) {
  return (
    <div
      className={styles.skeleton}
      style={{ height, width, borderRadius: radius, ...style }}
    />
  );
}
