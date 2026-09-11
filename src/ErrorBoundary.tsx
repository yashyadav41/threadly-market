import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches unexpected runtime errors anywhere in the component tree
 * and shows a friendly message instead of an unmounted blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: 40, fontFamily: "'DM Sans', sans-serif", background: '#f8f7f4', color: '#272522',
        }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ marginBottom: 20, color: '#625d56' }}>Please refresh the page and try again.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 24px', background: '#272522', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
