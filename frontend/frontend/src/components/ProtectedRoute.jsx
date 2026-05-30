import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requireVerification = true, requireAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        console.log('ProtectedRoute Check:', {
          path: location.pathname,
          hasToken: !!token,
          hasUser: !!userStr,
          requireVerification,
          requireAdmin
        });

        // Not logged in - redirect to signin
        if (!token || !userStr) {
          console.log('No token or user found, redirecting to signin');
          setRedirectTo(`/signin?from=${encodeURIComponent(location.pathname)}`);
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);

        // Verification not required - just check if logged in
        if (!requireVerification) {
          console.log('Verification not required, checking admin if needed');
          if (requireAdmin && user.role !== 'admin') {
            console.log('Admin role required but user has role:', user.role);
            setRedirectTo('/jobs');
            setLoading(false);
            return;
          }
          setIsAllowed(true);
          setLoading(false);
          return;
        }

        // Check email verification status
        if (user.email && !user.emailVerified) {
          console.log('Email not verified, redirecting to verify-email');
          setRedirectTo(`/verify-email?email=${encodeURIComponent(user.email)}`);
          setLoading(false);
          return;
        }

        // Check mobile verification status
        if (user.mobile && !user.mobileVerified) {
          console.log('Mobile not verified, redirecting to verify-mobile');
          setRedirectTo(`/verify-mobile?mobile=${encodeURIComponent(user.mobile)}`);
          setLoading(false);
          return;
        }

        // Check if admin is required
        if (requireAdmin && user.role !== 'admin') {
          console.log('Admin role required but user has role:', user.role);
          setRedirectTo('/jobs');
          setLoading(false);
          return;
        }

        // All checks passed
        console.log('All checks passed, allowing access');
        setIsAllowed(true);
        setLoading(false);
      } catch (error) {
        console.error('Protected route check failed:', error);
        setRedirectTo('/signin');
        setLoading(false);
      }
    };

    checkAccess();
  }, [requireVerification, requireAdmin, location.pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          </div>
          <p className="text-slate-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (redirectTo) {
    console.log('Redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return isAllowed ? children : null;
};

export default ProtectedRoute;
