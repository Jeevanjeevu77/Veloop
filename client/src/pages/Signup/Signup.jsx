import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/auth.module.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create your account. Please try again.');
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
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start earning XP and unlocking rewards.</p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className={styles.input}
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
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
              autoComplete="new-password"
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link className={styles.switchLink} to="/login">
            Log in
          </Link>
        </p>

        <div className={styles.builtByBadge}>
          Built with <span className={styles.heart}>❤️</span> by <span className={styles.byAuthor}>Sinchana</span>
        </div>
      </div>
    </div>
  );
}
