import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Phone, RefreshCw, ArrowRight, MailCheck } from 'lucide-react';
import api from '../services/api';
import JobBoardNav from '../components/JobBoardNav';

const OTP_LENGTH = 6;

const VerifyMobilePage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [mobile, setMobile] = useState(params.get('mobile') || '');
  const email = params.get('email') || '';
  const emailLink = params.get('emailLink') || '';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error' | 'info'
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);
  const cooldownRef = useRef(null);

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
    if (!mobile.trim()) {
      setMessage('Enter your mobile number first.');
      setMessageType('error');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      // Try the new /verify-otp endpoint first, fall back to /verify-mobile
      const res = await api.post('/auth/verify-otp', { phoneNumber: mobile, otp });
      if (res.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user));
      setVerified(true);
      setMessage('Phone number verified successfully!');
      setMessageType('success');

      if (emailLink || email) {
        setTimeout(() =>
          navigate(emailLink || `/verify-email?email=${encodeURIComponent(email)}`), 2000);
      } else {
        setTimeout(() => navigate('/signin'), 2000);
      }
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
    if (!mobile.trim()) { setMessage('Enter your mobile number first.'); setMessageType('error'); return; }
    if (resendCooldown > 0) return;
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/auth/send-otp', { phoneNumber: mobile });
      const devOtp = res.data?.otp;
      setMessage(devOtp ? `New code: ${devOtp}` : 'A new OTP has been sent to your phone number.');
      setMessageType('info');
      setResendCooldown(60);
      setDigits(Array(OTP_LENGTH).fill(''));
      focusBox(0);
    } catch (err) {
      // Fallback to resend-verification for backward compat
      try {
        const res2 = await api.post('/auth/resend-verification', { mobile });
        const mobileOtp = res2.data?.verification?.mobileOtp;
        setMessage(mobileOtp ? `New OTP: ${mobileOtp}` : 'New OTP sent.');
        setMessageType('info');
        setResendCooldown(60);
        setDigits(Array(OTP_LENGTH).fill(''));
        focusBox(0);
      } catch {
        setMessage(err.response?.data?.error || 'Could not resend OTP.');
        setMessageType('error');
      }
    } finally {
      setLoading(false);
    }
  };

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
                  <Phone size={26} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold">Verify your phone</h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  We generated a 6-digit OTP for
                  {mobile && <strong className="ml-1 text-white">{mobile}</strong>}
                  {!mobile && ' your phone number'}.
                </p>
              </div>
            </div>

            <div className="px-8 py-8">

              {/* Email pending notice */}
              {(emailLink || email) && !verified && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <MailCheck size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Email verification also pending</p>
                    <p className="mt-0.5 text-xs text-amber-700">
                      After verifying your phone, you'll be redirected to verify your email too.
                    </p>
                  </div>
                </div>
              )}

              {/* Success state */}
              {verified ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 size={36} className="text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">Phone Verified!</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {emailLink || email
                      ? 'Redirecting to email verification…'
                      : 'Redirecting to sign in…'}
                  </p>
                </div>
              ) : (
                <form onSubmit={verifyOtp} noValidate>

                  {/* Mobile input */}
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Phone number</span>
                    <input
                      type="tel"
                      placeholder="+91..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
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
                      messageType === 'error'   ? 'border border-rose-200 bg-rose-50 text-rose-700'     :
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
                      <>Verify Phone <ArrowRight size={15} /></>
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

export default VerifyMobilePage;
