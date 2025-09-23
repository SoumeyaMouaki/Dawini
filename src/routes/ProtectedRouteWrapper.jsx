import React, { Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const ProtectedRouteWrapper = ({ children, ...props }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Vérification des permissions..." />
        </div>
      }>
        <ProtectedRoute {...props}>
          {children}
        </ProtectedRoute>
      </Suspense>
    </ErrorBoundary>
  );
};

export default ProtectedRouteWrapper;
