import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        // Auto-reload if chunk loading failed (new deployment)
        if (error.message.includes('Failed to fetch dynamically imported module') ||
            error.message.includes('Importing a module script failed')) {
            window.location.reload();
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif', direction: 'ltr' }}>
                    <h1>Something went wrong.</h1>
                    <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                        <h3>Error:</h3>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
