import { useState } from 'react';
import { X, MailCheck } from 'lucide-react';
import { signIn, signUp } from './lib/auth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password || (mode === 'signup' && !fullName)) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const result = await signUp(email, password, fullName);
        if (result.status === 'confirmation_required') {
          setConfirmationSent(true);
          setSubmitting(false);
          return;
        }
      } else {
        await signIn(email, password);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  if (confirmationSent) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <MailCheck size={40} style={{ marginBottom: 12 }} />
            <p className="eyebrow">Almost there</p>
            <h2>Check your email</h2>
            <p style={{ marginTop: 8 }}>We've sent a confirmation link to <strong>{email}</strong>. Click it, then come back and log in.</p>
            <button
              className="button button-dark"
              style={{ marginTop: 20 }}
              onClick={() => { setConfirmationSent(false); setMode('login'); setPassword(''); }}
            >
              Back to log in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create your account'}</p>
        <h2>{mode === 'login' ? 'Log in to Threadly' : 'Join Threadly Market'}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="profile-field">
              <label>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Rivera" autoComplete="name" />
            </div>
          )}
          <div className="profile-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="profile-field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="button button-dark" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button className="text-button" type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}