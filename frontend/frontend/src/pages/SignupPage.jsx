import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import api from '../services/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    accountType: 'employer',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.username.trim()) return setError('Username is required');
    if (!form.email.includes('@')) return setError('Enter a valid email address');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {

  await api.post(
    '/auth/register',
    {
      username:
        form.username.trim(),

      email:
        form.email.trim(),

      accountType:
        form.accountType,

      password:
        form.password
    }
  );

  alert(
    "Registration Successful"
  );

  navigate('/signin');

}
    catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f4] px-4 py-8 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[0_40px_100px_-40px_rgba(15,23,42,0.4)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.35),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.18),_transparent_28%)]" />
          <Link to="/" className="relative z-10 inline-flex items-center gap-3">
            <div className="rounded-2xl bg-white px-3 py-2 text-sm font-bold uppercase tracking-[0.26em] text-slate-900">FA</div>
            <div>
              <div className="text-xl font-bold">Freeads</div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-300">Local marketplace</div>
            </div>
          </Link>

          <div className="relative z-10 max-w-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
              <ShieldCheck size={14} />
              Email signup
            </div>
            <h1 className="text-4xl font-semibold leading-tight">Create an account with username, email, and password.</h1>
            <p className="mt-5 text-base leading-7 text-slate-300">
              This matches the freeads.no registration pattern and unlocks posting, favorites, replies, reports, and candidate contact actions.
            </p>
          </div>

          <div className="relative z-10 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300 backdrop-blur">
            Browse is public. Posting a Job Offer, adding a Resume | CV, and revealing contact details require sign in.
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-lg">
            <div className="mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-bold uppercase tracking-[0.26em] text-white">FA</div>
                <div>
                  <div className="text-xl font-bold text-slate-900">Freeads</div>
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Local marketplace</div>
                </div>
              </Link>
            </div>

            <div className="mb-8">
              <div className="text-sm font-semibold uppercase tracking-[0.26em] text-emerald-700">Register</div>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Sign up</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">Use email registration to access all job and candidate features.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <span className="mb-2 block text-sm font-semibold text-slate-700">Account type</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: 'employer', label: 'Employer', help: 'Post jobs and manage applicants.' },
                    { value: 'jobseeker', label: 'Jobseeker', help: 'Create profiles and contact jobs.' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateForm('accountType', option.value)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        form.accountType === option.value
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className={`mt-1 block text-xs leading-5 ${form.accountType === option.value ? 'text-slate-200' : 'text-slate-500'}`}>
                        {option.help}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Username</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-600 focus-within:bg-white">
                  <UserRound size={18} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Choose username"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    value={form.username}
                    onChange={(event) => updateForm('username', event.target.value)}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-600 focus-within:bg-white">
                  <AtSign size={18} className="text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    value={form.email}
                    onChange={(event) => updateForm('email', event.target.value)}
                  />
                </div>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-600 focus-within:bg-white">
                    <LockKeyhole size={18} className="text-slate-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      value={form.password}
                      onChange={(event) => updateForm('password', event.target.value)}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-600 focus-within:bg-white">
                    <LockKeyhole size={18} className="text-slate-400" />
                    <input
                      type="password"
                      placeholder="Repeat password"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      value={form.confirmPassword}
                      onChange={(event) => updateForm('confirmPassword', event.target.value)}
                    />
                  </div>
                </label>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating account...' : 'Register'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-900">Already have an account?</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">Sign in using your username or email address.</p>
              <Link to="/signin" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
                Go to sign in
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
