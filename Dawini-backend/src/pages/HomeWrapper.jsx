import React, { Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

// Lazy load the Home component
const Home = React.lazy(() => import('./Home.jsx'));

const HomeWrapper = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
          <LoadingSpinner size="xl" text="Chargement de la page d'accueil..." />
        </div>
      }>
        <Home />
      </Suspense>
    </ErrorBoundary>
  );
};

export default HomeWrapper;
