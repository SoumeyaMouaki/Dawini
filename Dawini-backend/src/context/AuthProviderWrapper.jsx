import React, { Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { AuthProvider } from './AuthContext.jsx';

const AuthProviderWrapper = ({ children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Initialisation de l'authentification..." />
        </div>
      }>
        <AuthProvider>
          {children}
        </AuthProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AuthProviderWrapper;
