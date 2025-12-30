'use client';

import { useState, useEffect } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface CatalogPasswordGateProps {
  children: React.ReactNode;
}

export default function CatalogPasswordGate({ children }: CatalogPasswordGateProps) {
  const [isPasswordRequired, setIsPasswordRequired] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if password is already stored in sessionStorage
    const storedAuth = sessionStorage.getItem('catalogAuth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setIsPasswordRequired(false);
      return;
    }

    // Check if password protection is enabled
    fetch('/api/catalog/verify-password')
      .then(res => res.json())
      .then(data => {
        setIsPasswordRequired(data.enabled);
        if (!data.enabled) {
          setIsAuthenticated(true);
        }
      })
      .catch(err => {
        console.error('Error checking password status:', err);
        setIsPasswordRequired(false);
        setIsAuthenticated(true);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/catalog/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('catalogAuth', 'true');
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Incorrect password');
      }
    } catch (err) {
      setError('Failed to verify password');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isPasswordRequired === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sure-blue-600"></div>
      </div>
    );
  }

  // Show password form if required and not authenticated
  if (isPasswordRequired && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-sure-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LockClosedIcon className="h-8 w-8 text-sure-blue-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Protected Content
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Please enter the password to access the catalog
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sure-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sure-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Access Catalog'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Don't have access? Contact your administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show content if authenticated or password not required
  return <>{children}</>;
}
