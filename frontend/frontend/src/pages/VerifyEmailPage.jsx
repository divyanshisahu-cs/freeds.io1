import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Mail, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import JobBoardNav from '../components/JobBoardNav';

const OTP_LENGTH = 6;

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState(params.get('email') || '');
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error' | 'info'
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [tokenStatus, setTokenStatus] = useState(token ? 'verifying' : ''); // 'verifying' | 'success' | 'error'

  const inputRefs = useRef([]);
  const cooldownRef = useRef(null);

  // ── Magic-link auto-verify ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setTokenStatus('verifying');
    api
      .get(`/auth/verify-email/${token}`)
      .then((res) => {
        if (res.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user));
        setTokenStatus('success');
        setTimeout(() => navigate('/signin'), 2500);
      })
      .catch((err) => {
        setMessage(err.response?.data?.error || 'Email verification failed. The link may have expired.');
        setMessageType('error');
        setTokenStatus('error');
      });
  }, [token, navigate]);

  // ── Resend cooldown countdown ───────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setResendCooldown((t) => {
        if (t <= 1) { clearInterval(cooldownRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [resendCooldown]);

  // ── OTP digit handlers ──────────────────────────────────────────────────────
  const focusBox = (index) => inputRefs.current[index]?.focus();

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        focusBox(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    focusBox(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const verifyOtp = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setMessage('Please enter all 6 digits.');
      setMessageType('error');
      return;
    }
    if (!email.trim()) {
      setMessage('Enter your email address first.');
      setMessageType('error');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      if (res.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user));
      setVerified(true);
      setMessage('Email verified successfully!');
      setMessageType('success');
      setTimeout(() => navigate('/signin'), 2500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Incorrect code. Please try again.');
      setMessageType('error');
      setDigits(Array(OTP_LENGTH).fill(''));
      focusBox(0);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (!email.trim()) { setMessage('Enter your email first.'); setMessageType('error'); return; }
    if (resendCooldown > 0) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/auth/resend-verification', { email });
      const emailOtp = res.data?.verification?.emailOtp;
      setMessage(emailOtp ? `New code: ${emailOtp}` : 'A new verification code has been sent to your email.');
      setMessageType('info');
      setResendCooldown(60);
      setDigits(Array(OTP_LENGTH).fill(''));
      focusBox(0);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Could not resend code.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // ── Magic-link loading / success screen ────────────────────────────────────
  if (token) {
    return (
      <div className="min-h-screen bg-[#f5f7f4] text-slate-900">
        <JobBoardNav />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-10 text-center shadow-[0_20px_60px_-20px_rgba(15,23,42,0.2)]">
            {tokenStatus === 'verifying' && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Verifying your email…</h1>
                <p className="mt-2 text-sm text-slate-500">This only takes a moment.</p>
              </>
            )}
            {tokenStatus === 'success' && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="text-emerald-600" size={36} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Email Verified!</h1>
                <p className="mt-2 text-sm text-slate-500">Redirecting you to sign in…</p>
              </>
            )}
            {tokenStatus === 'error' && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                  <ShieldCheck className="text-rose-500" size={36} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Link Invalid</h1>
                <p className="mt-2 text-sm text-rose-600">{message}</p>
                <Link
                  to="/verify-email"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Try OTP instead <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ── OTP form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f7f4] text-slate-900">
      <JobBoardNav />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.2)]">

            {/* Header banner */}
            <div className="relative overflow-hidden bg-slate-900 px-8 pt-8 pb-10 text-center text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.3),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.15),_transparent_35%)]" />
              <div className="relative z-10">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
                  <Mail size={26} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  We sent a 6-digit code to
                  {email && <strong className="ml-1 text-white">{email}</strong>}
                  {!email && ' your inbox'}.
                </p>
              </div>
            </div>

            <div className="px-8 py-8">

              {/* Success state */}
              {verified ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 size={36} className="text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">Email Verified!</p>
                  <p className="mt-1 text-sm text-slate-500">Redirecting you to sign in…</p>
                </div>
              ) : (
                <form onSubmit={verifyOtp} noValidate>

                  {/* Email input */}
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Email address</span>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>

                  {/* OTP boxes */}
                  <div className="mt-6">
                    <span className="mb-3 block text-sm font-semibold text-slate-700">Verification code</span>
                    <div className="flex gap-2" onPaste={handlePaste}>
                      {digits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (inputRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          onFocus={(e) => e.target.select()}
                          className={`h-14 w-full rounded-2xl border-2 text-center text-xl font-bold text-slate-900 outline-none transition
                            ${digit ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}
                            focus:border-emerald-500 focus:bg-white`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Paste your code or type one digit per box. Expires in 10 min.</p>
                  </div>

                  {/* Status message */}
                  {message && (
                    <div className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                      messageType === 'error' ? 'border border-rose-200 bg-rose-50 text-rose-700' :
                      messageType === 'success' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' :
                      'border border-blue-200 bg-blue-50 text-blue-700'
                    }`}>
                      {message}
                    </div>
                  )}

                  {/* Verify button */}
                  <button
                    type="submit"
                    disabled={loading || digits.join('').length < OTP_LENGTH}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Verifying…</>
                    ) : (
                      <>Verify Email <ArrowRight size={15} /></>
                    )}
                  </button>

                  {/* Resend */}
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={loading || resendCooldown > 0}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw size={14} className={resendCooldown > 0 ? 'animate-spin' : ''} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </form>
              )}

              {/* Footer link */}
              <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                <Link
                  to="/signin"
                  className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmailPage;
