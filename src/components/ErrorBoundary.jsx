import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[9999] bg-red-900 text-white p-10 overflow-auto">
                    <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
                    <h2 className="text-xl font-bold mb-2">Error:</h2>
                    <pre className="bg-black p-4 rounded mb-4 whitespace-pre-wrap">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <h2 className="text-xl font-bold mb-2">Component Stack:</h2>
                    <pre className="bg-black p-4 rounded whitespace-pre-wrap">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
