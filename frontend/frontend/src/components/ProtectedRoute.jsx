import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AccessDeniedPage from '../pages/AccessDeniedPage';

/**
 * ProtectedRoute
 *
 * Props:
 *  - requireVerification (bool, default true): also check email/mobile verification
 *  - requireAdmin        (bool, default false): user.role must be "admin"
 *
 * Outcomes:
 *  - Not logged in          → redirect to /signin?from=...
 *  - Email not verified     → redirect to /verify-email
 *  - Mobile not verified    → redirect to /verify-mobile
 *  - Not admin (admin route)→ render <AccessDeniedPage /> inline (403 UX)
 *  - All good               → render children
 */
const ProtectedRoute = ({ children, requireVerification = true, requireAdmin = false }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'allowed' | 'denied' | string (redirectTo)
  const location = useLocation();

  useEffect(() => {
    const checkAccess = () => {
      try {
        const token   = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        // ── Not logged in ─────────────────────────────────────────
        if (!token || !userStr) {
          setStatus(`/signin?from=${encodeURIComponent(location.pathname)}`);
          return;
        }

        const user = JSON.parse(userStr);

        // ── Skip verification checks if not required ──────────────
        if (!requireVerification) {
          if (requireAdmin && user.role !== 'admin') {
            setStatus('denied');
          } else {
            setStatus('allowed');
          }
          return;
        }

        // ── Email verification ────────────────────────────────────
        if (user.email && !user.emailVerified) {
          setStatus(`/verify-email?email=${encodeURIComponent(user.email)}`);
          return;
        }

        // ── Mobile verification ───────────────────────────────────
        if (user.mobile && !user.mobileVerified) {
          setStatus(`/verify-mobile?mobile=${encodeURIComponent(user.mobile)}`);
          return;
        }

        // ── Admin role check ──────────────────────────────────────
        if (requireAdmin && user.role !== 'admin') {
          setStatus('denied');
          return;
        }

        // ── All good ──────────────────────────────────────────────
        setStatus('allowed');
      } catch (err) {
        console.error('ProtectedRoute error:', err);
        setStatus('/signin');
      }
    };

    checkAccess();
  }, [requireVerification, requireAdmin, location.pathname]);

  // ── Loading spinner ───────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
          <p className="text-slate-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // ── Access denied — show 403 page inline ─────────────────────────
  if (status === 'denied') {
    return <AccessDeniedPage />;
  }

  // ── Allowed ───────────────────────────────────────────────────────
  if (status === 'allowed') {
    return children;
  }

  // ── Redirect (status is the target URL string) ────────────────────
  return <Navigate to={status} replace />;
};

export default ProtectedRoute;
