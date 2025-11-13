import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

// Lazy load the Navbar component
const Navbar = React.lazy(() => import('./Navbar.jsx'));

const NavbarWrapper = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <LoadingSpinner size="sm" text="" />
              </div>
            </div>
          </div>
        </nav>
      }>
        <Navbar />
      </Suspense>
    </ErrorBoundary>
  );
};

export default NavbarWrapper;
