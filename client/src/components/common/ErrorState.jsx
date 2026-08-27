import styles from './ErrorState.module.css';

export default function ErrorState({
  title = 'Something went wrong.',
  message = "We couldn't load this right now.",
  onRetry,
}) {
  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
