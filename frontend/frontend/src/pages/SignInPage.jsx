import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import {
  ArrowRight,
  AtSign,
  LockKeyhole,
  ShieldCheck
} from 'lucide-react';

import api from '../services/api';


const SignInPage = () => {

  const navigate = useNavigate();

  const [identifier, setIdentifier] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);


  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError('');

    try {

      const res = await api.post(

        "/auth/login",

        {
          email: identifier,

          password: password,
        }
      );

      localStorage.setItem(

        "token",

        res.data.token
      );

      localStorage.setItem(

        "user",

        JSON.stringify(
          res.data.user
        )
      );

      alert("Login Successful");

      navigate('/admin');

    } catch (err) {

      setError(

        err.response?.data?.error ||

        'Login failed'
      );

    } finally {

      setLoading(false);
    }
  };


  return (

    <div className="min-h-screen bg-[#f5f7f4] px-4 py-8 text-slate-900">

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[0_40px_100px_-40px_rgba(15,23,42,0.4)] lg:grid-cols-[0.95fr_1.05fr]">

        <div className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.35),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.18),_transparent_28%)]" />

          <div className="relative z-10">

            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >

              <div className="rounded-2xl bg-white px-3 py-2 text-sm font-bold uppercase tracking-[0.26em] text-slate-900">
                FA
              </div>

              <div>

                <div className="text-xl font-bold">
                  Freeads
                </div>

                <div className="text-xs uppercase tracking-[0.28em] text-slate-300">
                  Local marketplace
                </div>

              </div>

            </Link>

          </div>


          <div className="relative z-10 max-w-md">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">

              <ShieldCheck size={14} />

              Secure sign in

            </div>

            <h1 className="text-4xl font-semibold leading-tight">
              Welcome back to your local deals dashboard.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-300">

              Sign in to manage ads, save favorites,
              reply to listings, report listings,
              and contact candidates.

            </p>

          </div>


          <div className="relative z-10 grid gap-4">

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">

              <div className="text-xs uppercase tracking-[0.26em] text-slate-400">
                Account format
              </div>

              <div className="mt-3 text-2xl font-semibold text-white">

                {identifier || 'username or email'}

              </div>

              <p className="mt-2 text-sm leading-6 text-slate-300">

                Use the same username or email
                you created on the register screen.

              </p>

            </div>

          </div>

        </div>


        <div className="flex items-center justify-center px-6 py-10 sm:px-10">

          <div className="w-full max-w-lg">

            <div className="mb-8 lg:hidden">

              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >

                <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-bold uppercase tracking-[0.26em] text-white">
                  FA
                </div>

                <div>

                  <div className="text-xl font-bold text-slate-900">
                    Freeads
                  </div>

                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
                    Local marketplace
                  </div>

                </div>

              </Link>

            </div>


            <div className="mb-8">

              <div className="text-sm font-semibold uppercase tracking-[0.26em] text-emerald-700">
                Account access
              </div>

              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                Sign in
              </h2>

              <p className="mt-3 text-base leading-7 text-slate-600">
                Use your username or email and password.
              </p>

            </div>


            {error && (

              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">

                {error}

              </div>
            )}


            <form
              className="space-y-5"
              onSubmit={handleLogin}
            >

              <label className="block">

                <span className="mb-2 block text-sm font-semibold text-slate-700">

                  Username or Email

                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-600 focus-within:bg-white">

                  <AtSign
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="username or name@example.com"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    value={identifier}
                    onChange={(e) =>
                      setIdentifier(
                        e.target.value
                      )
                    }
                  />

                </div>

              </label>


              <label className="block">

                <span className="mb-2 block text-sm font-semibold text-slate-700">

                  Password

                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-600 focus-within:bg-white">

                  <LockKeyhole
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                  />

                </div>

              </label>


              <div className="flex items-center justify-between gap-4 text-sm">

                <button
                  type="button"
                  className="font-medium text-slate-500 transition hover:text-slate-800"
                >

                  Forgot password?

                </button>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">

                  Local dev ready

                </span>

              </div>


              <button
                disabled={loading}
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >

                {loading
                  ? 'Signing in...'
                  : 'Sign in'}

                {!loading &&
                  <ArrowRight size={16} />
                }

              </button>

            </form>


            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5">

              <div className="text-sm font-semibold text-slate-900">

                Need an account first?

              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">

                Create one with username,
                email, and password,
                then come back here to log in.

              </p>

              <Link
                to="/signup"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
              >

                Go to sign up

                <ArrowRight size={16} />

              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SignInPage;