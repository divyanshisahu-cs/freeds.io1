import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home, LogIn } from 'lucide-react';

/**
 * AccessDeniedPage
 * Shown when a non-admin user tries to navigate to an admin-only route.
 * The user is still authenticated — they just don't have the admin role.
 */
const AccessDeniedPage = () => {
  const navigate = useNavigate();

  // Read the stored user so we can show a personalised message
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  const isLoggedIn = Boolean(localStorage.getItem('token') && user);

  return (
    <div className="min-h-screen bg-[#f5f7f9] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_40px_100px_-40px_rgba(15,23,42,0.25)]">

          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-400 to-orange-400" />

          <div className="p-8 sm:p-10">

            {/* Icon */}
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <ShieldX size={32} strokeWidth={1.5} />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Access Denied
            </h1>

            {/* Sub message */}
            <p className="mt-3 text-base leading-7 text-slate-600">
              {isLoggedIn ? (
                <>
                  Hey <span className="font-semibold text-slate-800">{user?.username || user?.email || 'there'}</span>,
                  this page is restricted to <span className="font-semibold text-rose-600">administrators</span> only.
                  Your current role is{' '}
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-700">
                    {user?.role || 'user'}
                  </span>
                  .
                </>
              ) : (
                <>
                  You need to be signed in as an <span className="font-semibold text-rose-600">administrator</span> to view this page.
                </>
              )}
            </p>

            {/* Divider */}
            <div className="my-7 border-t border-slate-100" />

            {/* Info box */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-4 text-sm text-rose-800">
              <p className="font-semibold">Why am I seeing this?</p>
              <p className="mt-1 leading-6 text-rose-700">
                Admin access is assigned by an existing administrator. If you believe this is a mistake, please contact the site owner.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                id="access-denied-go-back"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <ArrowLeft size={15} />
                Go back
              </button>

              <Link
                id="access-denied-home"
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <Home size={15} />
                Home
              </Link>

              {!isLoggedIn && (
                <Link
                  id="access-denied-signin"
                  to="/signin"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  <LogIn size={15} />
                  Sign in
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Error 403 · Forbidden · Freeds.io
        </p>

      </div>
    </div>
  );
};

export default AccessDeniedPage;
