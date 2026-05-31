import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CreditCard,
  Image,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound
} from 'lucide-react';
import api from '../services/api';
import JobBoardNav from '../components/JobBoardNav';

const initialForm = {
  company: '',
  companyWebsite: '',
  employerName: '',
  email: '',
  password: '',
  confirmPassword: '',
  title: '',
  location: '',
  type: 'Full Time',
  salary: '',
  experience: '00-05 Years',
  phone: '',
  description: '',
  imageUrl: '',
  imageFile: null,
  country: 'India',
  state: '',
  city: '',
  startDate: '',
  endDate: '',
  listingPlan: 'standard',
  paymentProvider: 'Razorpay'
};

const currencyByCountry = {
  India: 'INR',
  Norway: 'NOK'
};

const fallbackFeaturedPrice = {
  India: 499,
  Norway: 99
};

const paymentProviders = ['Razorpay', 'Stripe', 'PayPal'];

const steps = [
  { label: 'Company Details', icon: Building2 },
  { label: 'Job Details', icon: Briefcase },
  { label: 'Payment', icon: CreditCard }
];

const Field = ({ label, children, required }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">
      {label}{required && <span className="text-rose-500">*</span>}
    </span>
    {children}
  </label>
);

const inputClass = 'w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100';

const PostJobPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [featuredPrice, setFeaturedPrice] = useState(fallbackFeaturedPrice);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const isSignedIn = Boolean(localStorage.getItem('token'));

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === 'listingPlan' && value === 'standard') {
      setPaymentComplete(false);
    }
  };

  const visibleLogo = useMemo(() => form.imageUrl || '', [form.imageUrl]);
  const selectedCurrency = currencyByCountry[form.country] || 'INR';
  const selectedFeaturedPrice = featuredPrice[form.country] ?? fallbackFeaturedPrice[form.country];
  const isFeatured = form.listingPlan === 'featured';

  useEffect(() => {
    api
      .get('/api/posts/admin/dashboard')
      .then((res) => {
        setFeaturedPrice({
          India: res.data.settings?.featuredPrice?.India || fallbackFeaturedPrice.India,
          Norway: res.data.settings?.featuredPrice?.Norway || fallbackFeaturedPrice.Norway
        });
      })
      .catch(() => {});
  }, []);

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({
      ...current,
      imageFile: file,
      imageUrl: String(reader.result || '')
    }));
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    setMessage('');

    if (step === 0) {
      if (!form.company.trim()) return 'Company name is required.';
      if (!form.employerName.trim()) return 'Name is required.';
      if (!form.email.includes('@')) return 'Enter a valid email address.';
      if (!isSignedIn) {
        if (form.password.length < 6) return 'Password must be at least 6 characters.';
        if (form.password !== form.confirmPassword) return 'Passwords do not match.';
      }
    }

    if (step === 1) {
      if (!form.title.trim()) return 'Job title is required.';
      if (!form.location.trim()) return 'Location is required.';
      if (!form.salary.trim()) return 'Salary is required.';
      if (!form.description.trim()) return 'Job description is required.';
    }

    return '';
  };

  const buildVerificationNotice = (verification) => {
    const notes = ['Account created. Verification required before posting.'];

    if (verification.emailOtp) {
      notes.push(`Email OTP: ${verification.emailOtp}`);
    } else if (verification.emailVerificationLink) {
      notes.push(`Email verification link: ${verification.emailVerificationLink}`);
    }

    if (verification.mobileOtp) {
      notes.push(`Mobile OTP: ${verification.mobileOtp}`);
    }

    return notes.join('\n');
  };

  const goToVerification = (verification) => {
    const emailLink = verification.emailVerificationLink || '';
    const emailOtp = verification.emailOtp || '';
    const mobilePending = verification.pending?.mobile || Boolean(verification.mobileOtp);
    const emailPending = verification.pending?.email || Boolean(emailLink || emailOtp);

    if (mobilePending) {
      const params = new URLSearchParams({ mobile: form.phone.trim() });
      if (form.email.trim()) params.set('email', form.email.trim());
      if (emailLink) params.set('emailLink', emailLink);
      navigate(`/verify-mobile?${params.toString()}`);
      return;
    }

    if (emailPending) {
      navigate(form.email.trim() ? `/verify-email?email=${encodeURIComponent(form.email.trim())}` : emailLink);
      return;
    }

    navigate('/signin');
  };

  const createAccountForPosting = async () => {
    const response = await api.post('/auth/register', {
      username: form.employerName.trim(),
      email: form.email.trim(),
      accountType: 'employer',
      password: form.password
    });

    const verification = response?.data?.verification || {};
    alert(buildVerificationNotice(verification));
    goToVerification(verification);
  };

  const goNext = async () => {
    const error = validateStep();
    if (error) return setMessage(error);

    if (step === 0 && !isSignedIn) {
      setSubmitting(true);
      try {
        await createAccountForPosting();
      } catch (err) {
        setMessage(err.response?.data?.error || 'Account could not be created. Please try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submitJob = async ({ paymentPaid = false } = {}) => {
    const error = validateStep();
    if (error) return setMessage(error);

    if (isFeatured && !paymentComplete && !paymentPaid) {
      return setMessage('Please complete payment for the featured listing.');
    }

    setSubmitting(true);
    setMessage('');

    try {
      if (!localStorage.getItem('token')) {
        await api.post('/auth/register', {
          username: form.employerName.trim(),
          email: form.email.trim(),
          accountType: 'employer',
          password: form.password
        });

        const login = await api.post('/auth/login', {
          identifier: form.email.trim(),
          password: form.password
        });
        localStorage.setItem('token', login.data.token);
      }

      const payload = new FormData();
      payload.append('title', form.title.trim());
      payload.append('description', form.description.trim());
      payload.append('country', form.country);
      payload.append('state', form.state.trim());
      payload.append('city', form.city.trim());
      payload.append('category', 'Jobs');
      payload.append('company', form.company.trim());
      payload.append('location', form.location.trim());
      payload.append('mobile', form.phone.trim());
      payload.append('email', form.email.trim());
      payload.append('adType', isFeatured ? 'Featured' : 'Standard');
      payload.append('price', isFeatured ? selectedFeaturedPrice : 0);
      payload.append('currency', selectedCurrency);
      payload.append('featured', String(isFeatured));
      payload.append('paymentProvider', isFeatured ? form.paymentProvider : '');
      payload.append('paymentStatus', isFeatured ? 'paid' : 'not_required');
      payload.append('startDate', form.startDate || new Date().toISOString().slice(0, 10));
      payload.append('endDate', form.endDate || '');
      payload.append('experience', form.experience);
      if (form.imageFile) payload.append('image', form.imageFile);

      await api.post('/api/posts/add', payload);

      navigate('/jobs');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Could not post this job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentAndPublish = () => {
    setPaymentComplete(true);
    setMessage(`${form.paymentProvider} payment successful. Publishing featured listing...`);
    submitJob({ paymentPaid: true });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-slate-900">
      <JobBoardNav />

      <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        <Link to="/jobs" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
          <ArrowLeft size={16} />
          Back to jobs
        </Link>

        <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-950">Post a Job</h1>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isActive = step === index;
            const isDone = step > index;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => index < step && setStep(index)}
                className="group text-left"
              >
                <div className={`mb-3 h-1 rounded-full ${isActive || isDone ? 'bg-slate-950' : 'bg-slate-300'}`} />
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-md border ${isActive || isDone ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 text-slate-500'}`}>
                    {isDone ? <Check size={17} /> : <Icon size={17} />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-700">Step {index + 1}</span>
                    <span className="block text-sm text-slate-500">{item.label}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {message && (
            <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {message}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">Company Details</h2>
                <div className="mt-6">
                  <Field label="Upload logo">
                    <div className="relative flex min-h-36 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50">
                      {visibleLogo ? (
                        <img src={visibleLogo} alt="Company logo preview" className="max-h-28 max-w-48 object-contain" />
                      ) : (
                        <div className="text-center text-slate-500">
                          <Image size={34} className="mx-auto mb-3 text-slate-300" />
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            Upload logo <Upload size={15} />
                          </span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 cursor-pointer opacity-0" />
                    </div>
                  </Field>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <Field label="Company Name" required>
                    <input className={inputClass} value={form.company} onChange={(event) => updateForm('company', event.target.value)} />
                  </Field>
                  <Field label="Company Website">
                    <input className={inputClass} placeholder="www.your-company.com" value={form.companyWebsite} onChange={(event) => updateForm('companyWebsite', event.target.value)} />
                  </Field>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">Your Account Details</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <Field label="Name" required>
                    <input className={inputClass} value={form.employerName} onChange={(event) => updateForm('employerName', event.target.value)} />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" className={inputClass} value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
                  </Field>
                  {!isSignedIn && (
                    <>
                      <Field label="Password" required>
                        <div className="relative">
                          <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="password" className={`${inputClass} pl-11`} value={form.password} onChange={(event) => updateForm('password', event.target.value)} />
                        </div>
                      </Field>
                      <Field label="Confirm Password" required>
                        <div className="relative">
                          <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="password" className={`${inputClass} pl-11`} value={form.confirmPassword} onChange={(event) => updateForm('confirmPassword', event.target.value)} />
                        </div>
                      </Field>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">Job Details</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <Field label="Job Title" required>
                  <input className={inputClass} value={form.title} onChange={(event) => updateForm('title', event.target.value)} />
                </Field>
                <Field label="Location" required>
                  <input className={inputClass} placeholder="Oslo, Norway" value={form.location} onChange={(event) => updateForm('location', event.target.value)} />
                </Field>
                <Field label="Country">
                  <select className={inputClass} value={form.country} onChange={(event) => updateForm('country', event.target.value)}>
                    <option>India</option>
                    <option>Norway</option>
                  </select>
                </Field>
                <Field label="State">
                  <input className={inputClass} placeholder="All state / Kerala / Oslo" value={form.state} onChange={(event) => updateForm('state', event.target.value)} />
                </Field>
                <Field label="City">
                  <input className={inputClass} placeholder="Kochi / Bergen" value={form.city} onChange={(event) => updateForm('city', event.target.value)} />
                </Field>
                <Field label="Job Type">
                  <select className={inputClass} value={form.type} onChange={(event) => updateForm('type', event.target.value)}>
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Remote</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </Field>
                <Field label="Salary" required>
                  <input className={inputClass} placeholder="$4,500 / month" value={form.salary} onChange={(event) => updateForm('salary', event.target.value)} />
                </Field>
                <Field label="Experience">
                  <input className={inputClass} value={form.experience} onChange={(event) => updateForm('experience', event.target.value)} />
                </Field>
                <Field label="Phone">
                  <input className={inputClass} value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
                </Field>
                <Field label="Job Description" required>
                  <textarea className={`${inputClass} min-h-36 sm:col-span-2`} value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
                </Field>
                <Field label="Start date">
                  <input type="date" className={inputClass} value={form.startDate} onChange={(event) => updateForm('startDate', event.target.value)} />
                </Field>
                <Field label="End date">
                  <input type="date" className={inputClass} value={form.endDate} onChange={(event) => updateForm('endDate', event.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <span className="mb-3 block text-sm font-semibold text-slate-700">Listing package</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => updateForm('listingPlan', 'standard')}
                      className={`rounded-md border p-4 text-left transition ${form.listingPlan === 'standard' ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'}`}
                    >
                      <Check size={18} />
                      <span className="mt-3 block text-base font-semibold">Standard Ad</span>
                      <span className="mt-1 block text-sm opacity-80">Free listing, no payment needed.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm('listingPlan', 'featured')}
                      className={`rounded-md border p-4 text-left transition ${form.listingPlan === 'featured' ? 'border-amber-500 bg-amber-50 text-slate-950' : 'border-slate-200 bg-white text-slate-800 hover:border-amber-300'}`}
                    >
                      <Sparkles size={18} className="text-amber-600" />
                      <span className="mt-3 block text-base font-semibold">Featured Ad</span>
                      <span className="mt-1 block text-sm text-slate-600">
                        Better reach for {selectedCurrency} {selectedFeaturedPrice}.
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">Payment</h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-center gap-3 text-slate-800">
                    <UserRound size={20} />
                    <h3 className="text-lg font-semibold">Review your job post</h3>
                  </div>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Company</dt><dd className="font-semibold text-slate-900">{form.company || '-'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Role</dt><dd className="font-semibold text-slate-900">{form.title || '-'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Location</dt><dd className="font-semibold text-slate-900">{form.location || '-'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Package</dt><dd className="font-semibold text-slate-900">{isFeatured ? 'Featured listing' : 'Standard listing'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Country</dt><dd className="font-semibold text-slate-900">{form.country}</dd></div>
                  </dl>
                </div>

                {isFeatured ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
                      <CreditCard size={17} />
                      Payment required
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-slate-950">
                      {selectedCurrency} {selectedFeaturedPrice}
                    </div>
                    <div className="mt-5 grid gap-2">
                      {paymentProviders.map((provider) => (
                        <button
                          key={provider}
                          type="button"
                          onClick={() => updateForm('paymentProvider', provider)}
                          className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm font-semibold transition ${form.paymentProvider === provider ? 'border-slate-950 bg-white text-slate-950' : 'border-amber-200 bg-amber-100/60 text-slate-700 hover:border-amber-400'}`}
                        >
                          {provider}
                          {form.paymentProvider === provider && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                    <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-700">
                      <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-700" />
                      Click Pay & Publish to mark payment successful and publish the featured ad.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">Today</div>
                    <div className="mt-3 text-3xl font-semibold text-slate-950">Free</div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      Standard ads publish directly without opening a payment window.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {step > 0 && (
              <button type="button" onClick={() => setStep((current) => current - 1)} className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900">
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button disabled={submitting} type="button" onClick={goNext} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1197ad] px-10 py-3 text-sm font-semibold text-white transition hover:bg-[#0f8396] disabled:cursor-not-allowed disabled:opacity-70">
                {submitting ? 'Creating account...' : 'Next'}
                {!submitting && <ArrowRight size={16} />}
              </button>
            ) : (
              <button disabled={submitting} type="button" onClick={isFeatured ? handlePaymentAndPublish : submitJob} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
                {submitting ? 'Publishing...' : isFeatured ? 'Pay & Publish' : 'Publish Free Job'}
                {!submitting && (isFeatured ? <CreditCard size={16} /> : <Check size={16} />)}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PostJobPage;
