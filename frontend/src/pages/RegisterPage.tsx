import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-display text-3xl font-semibold text-ink">TaskFlow</h1>
        <p className="mb-8 text-center text-sm text-muted">Create your team's workspace.</p>

        <form onSubmit={handleSubmit} className="card p-6" noValidate>
          {error && (
            <p role="alert" className="mb-4 rounded bg-rust-light px-3 py-2 text-sm text-rust">
              {error}
            </p>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="field-label">
              Full name
            </label>
            <input
              id="name"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <p className="mb-6 text-xs text-muted">
            At least 8 characters, with one uppercase letter and one number.
          </p>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-flow hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
