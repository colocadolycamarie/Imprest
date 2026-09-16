import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

function DefaultFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--color-paper)] p-6">
      <div className="w-full max-w-lg border-t-2 border-[var(--color-line-strong)] pt-6 text-center">
        <div className="mono-data mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-negative)]">
          Error
        </div>
        <h1 className="font-serif text-2xl text-[var(--color-ink)]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          This part of the app hit an error. The rest of the app is still
          running.
        </p>
        {/* Dev only: messages can carry API responses and other internals. */}
        {import.meta.env.DEV ? (
          <pre className="mono-data mt-4 overflow-x-auto border border-[var(--color-line)] bg-[var(--color-surface)] p-3 text-left text-xs text-[var(--color-ink)]">
            {error.message || String(error)}
          </pre>
        ) : null}
        <button
          type="button"
          onClick={resetError}
          className="mt-5 min-h-11 rounded-[3px] bg-[var(--color-ink)] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-paper)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-accent)] active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      'ErrorBoundary caught an error:',
      toError(error),
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}
