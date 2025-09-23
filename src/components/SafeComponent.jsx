import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

const SafeComponent = ({ 
  children, 
  fallback = null, 
  errorFallback = null,
  loadingText = 'Chargement...'
}) => {
  const defaultErrorFallback = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Erreur de chargement
        </h2>
        <p className="text-gray-600 mb-4">
          Impossible de charger ce composant
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Recharger
        </button>
      </div>
    </div>
  );

  const defaultFallback = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text={loadingText} />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <ErrorBoundary fallback={errorFallback || defaultErrorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

// ErrorBoundary component for SafeComponent
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SafeComponent ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur de composant
            </h2>
            <p className="text-gray-600 mb-4">
              Ce composant a rencontré une erreur
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeComponent;
