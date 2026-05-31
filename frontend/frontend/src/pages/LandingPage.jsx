import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  FileText,
  Home,
  MapPin,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User
} from 'lucide-react';
import api from '../services/api';
import JobBoardNav from '../components/JobBoardNav';

const CategoryIcon = ({ icon: Icon, label, isActive, to }) => {
  const content = (
    <>
      <div
        className={`rounded-2xl p-4 transition-all duration-300 ${
          isActive
            ? 'bg-[#0f766e] text-white shadow-lg shadow-emerald-900/20'
            : 'bg-white text-slate-500 ring-1 ring-slate-200 group-hover:-translate-y-1 group-hover:text-slate-900 group-hover:shadow-lg'
        }`}
      >
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <span
        className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${
          isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'
        }`}
      >
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="group flex cursor-pointer flex-col items-center gap-3">
        {content}
      </Link>
    );
  }

  return <div className="group flex cursor-pointer flex-col items-center gap-3">{content}</div>;
};

const AdCard = ({ ad }) => (
  <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_-30px_rgba(15,23,42,0.38)]">
    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
      <img
        src={ad.imageUrl}
        alt={ad.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

      {ad.isFeatured && (
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 shadow-sm backdrop-blur">
          Featured
        </div>
      )}

      <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-700 backdrop-blur">
        {ad.tag}
      </div>
    </div>

    <div className="flex flex-grow flex-col p-6">
      <h3 className="mb-3 text-[1.65rem] font-bold leading-tight text-slate-900 transition-colors group-hover:text-teal-800">
        {ad.title}
      </h3>
      <p className="mb-4 text-sm leading-6 text-slate-600">{ad.description}</p>

      <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
        <MapPin size={16} className="text-rose-500" />
        <span>{ad.location}</span>
      </div>

      <div className="mt-auto space-y-3 border-t border-slate-100 pt-4">
        {ad.salary && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Salary</span>
            <span className="font-semibold text-slate-900">{ad.salary}</span>
          </div>
        )}
        {ad.experience && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Experience</span>
            <span className="font-medium text-slate-900">{ad.experience}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState(() => localStorage.getItem('country') || 'India');
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const onCountryChange = (event) => setCountry(event.detail || localStorage.getItem('country') || 'India');
    window.addEventListener('countrychange', onCountryChange);
    return () => window.removeEventListener('countrychange', onCountryChange);
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/api/posts', { params: { country } })
      .then((res) => {
        const posts = Array.isArray(res.data) ? res.data : [];

        setAds(
          posts.map((post) => ({
            id: post._id,
            imageUrl: post.image ? `/uploads/${post.image}` : 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80',
            title: post.title,
            description: post.description,
            location: post.location,
            salary: post.price ? `${post.currency || ''} ${post.price}`.trim() : '',
            experience: post.company || '',
            isFeatured: post.featured,
            tag: post.category || 'Listing',
          }))
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [country]);

  useEffect(() => {
    api
      .get('/api/posts/admin/dashboard')
      .then((res) => {
        const live = (res.data.settings?.announcements || []).filter((item) => !item.expiresAt || new Date(item.expiresAt) > new Date());
        setAnnouncements(live);
      })
      .catch(() => setAnnouncements([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7f4] text-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[580px] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#f7faf7_0%,_#f4f7f2_100%)]" />
      <JobBoardNav />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pb-24 lg:pt-10">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800 shadow-sm backdrop-blur">
            <Sparkles size={14} />
            Trusted local classifieds
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 md:text-6xl">
            Buy, sell, hire and discover opportunities with confidence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Freeads brings jobs, rentals, electronics and services in {country} into one clean marketplace
            experience designed for fast browsing and high-conversion listings.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/post-a-job"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f766e] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#0b5f59]"
            >
              Start posting
              <ArrowRight size={16} />
            </Link>
            <a
              href="#featured-listings"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              <Search size={16} />
              Explore listings
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="mb-3 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <Search size={20} />
              </div>
              <div className="text-sm font-semibold text-slate-900">Smart discovery</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Find jobs, rooms and devices in seconds with clean category browsing.
              </p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="mb-3 inline-flex rounded-2xl bg-amber-50 p-3 text-amber-700">
                <ShieldCheck size={20} />
              </div>
              <div className="text-sm font-semibold text-slate-900">Secure onboarding</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Email signup keeps posting, replies and contact details available to signed-in members.
              </p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="mb-3 inline-flex rounded-2xl bg-rose-50 p-3 text-rose-700">
                <Briefcase size={20} />
              </div>
              <div className="text-sm font-semibold text-slate-900">High-value listings</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Showcase featured posts with strong visuals that look ready for clients.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-10 hidden h-28 w-28 rounded-full bg-amber-300/30 blur-3xl lg:block" />
          <div className="absolute right-0 top-1/2 hidden h-36 w-36 rounded-full bg-emerald-300/30 blur-3xl lg:block" />
          <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[0_40px_90px_-45px_rgba(15,23,42,0.6)]">
            <img
              src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80"
              alt="Freeads app preview"
              className="h-[420px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="max-w-sm rounded-[28px] bg-white/92 p-5 shadow-2xl backdrop-blur">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-800">
                  Prototype preview
                </div>
                <div className="text-2xl font-semibold text-slate-950">
                  A cleaner classifieds experience for jobs, rentals and resale.
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Use this live page as your interactive prototype while you present the
                  project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-10">
          {announcements.slice(0, 1).map((item) => (
            <div key={item._id || item.title} className="grid gap-5 rounded-md border border-amber-200 bg-amber-50 p-5 md:grid-cols-[180px_1fr]">
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="h-32 w-full rounded-md object-cover" />}
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-amber-800">Announcement</div>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="mx-auto max-w-5xl px-6 py-8 lg:px-10 lg:py-14">
        <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-8 shadow-[0_25px_70px_-40px_rgba(15,23,42,0.35)] lg:px-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                Browse categories
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Everything people need in one marketplace.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-6">
            <CategoryIcon icon={Briefcase} label="Jobs" isActive={true} to="/jobs" />
            <CategoryIcon icon={FileText} label="Resume" />
            <CategoryIcon icon={Home} label="Rentals" />
            <CategoryIcon icon={Settings} label="Services" />
            <CategoryIcon icon={Briefcase} label="Furniture" />
            <CategoryIcon icon={MoreHorizontal} label="Others" />
          </div>
        </div>
      </section>

      <section id="featured-listings" className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16">
        <div className="mb-12 flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-slate-300"></div>
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-600">
            Featured Listings
            <span className="ml-3 text-slate-400">{country}</span>
          </h2>
          <div className="h-px w-12 bg-slate-300"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[430px] animate-pulse rounded-[28px] bg-white shadow-sm"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
