import { Component } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production this is a good place to send to an error-tracking
    // service (Sentry, LogRocket, etc). Kept as console.error for now.
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle size={22} />
            </div>
            <h1 className="text-lg font-semibold text-ink-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-500">
              An unexpected error occurred. Reloading the page usually fixes this.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              <RefreshCcw size={16} />
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
