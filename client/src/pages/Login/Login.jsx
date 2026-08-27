import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>V</span>
          <span className={styles.logoText}>VELOOP</span>
          <span className={styles.byTag}>by <span className={styles.byAuthor}>Sinchana</span></span>
        </div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to continue your progress.</p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={styles.input}
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className={styles.switchText}>
          New to VELOOP?{' '}
          <Link className={styles.switchLink} to="/signup">
            Create an account
          </Link>
        </p>

        <div className={styles.builtByBadge}>
          Built with <span className={styles.heart}>❤️</span> by <span className={styles.byAuthor}>Sinchana</span>
        </div>
      </div>
    </div>
  );
}
