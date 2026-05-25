import React, { useDeferredValue, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Clock,
  Eye,
  Flag,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  User,
  Users,
  X
} from 'lucide-react';
import api from '../services/api';

const fallbackJobAds = [
  {
    id: 'job-1',
    title: 'Deputy General Manager Business Development',
    company: 'Godrej Properties Limited',
    location: 'Mumbai, IN',
    type: 'Full Time',
    salary: '$5,000 / month',
    experience: '05-10 Years',
    contactEmail: 'jobs@godrej.example',
    phone: '+91 900 10 200',
    postedBy: 'Godrej Properties Limited',
    postedAt: '1d ago',
    imageUrl: '',
    description: 'Drive business development partnerships and growth opportunities for real estate projects.'
  },
  {
    id: 'job-2',
    title: 'Talent Acquisition Specialist',
    company: 'Meri',
    location: 'Mumbai, India',
    type: 'Full Time',
    salary: '$3,400 / month',
    experience: '02-05 Years',
    contactEmail: 'hiring@meri.example',
    phone: '+91 98477 45002',
    postedBy: 'Meri',
    postedAt: '1d ago',
    imageUrl: '',
    description: 'Own sourcing, screening, interview coordination, and candidate communication.'
  },
  {
    id: 'job-3',
    title: 'Molecular Biologist',
    company: 'Molecular Science',
    location: 'Noida, IN',
    type: 'Full Time',
    salary: '$2,800 / month',
    experience: '01-04 Years',
    contactEmail: 'careers@molecular.example',
    phone: '+91 98765 43210',
    postedBy: 'Molecular Science',
    postedAt: '1d ago',
    imageUrl: '',
    description: 'Support lab processes, documentation, testing workflows, and research reporting.'
  },
  {
    id: 'job-4',
    title: 'Social Media Marketing Internship in Noida',
    company: 'Fabulous',
    location: 'Noida, IN',
    type: 'Internship',
    salary: '$900 / month',
    experience: '00-01 Years',
    contactEmail: 'talent@fabulous.example',
    phone: '+91 98765 11110',
    postedBy: 'Fabulous',
    postedAt: '1d ago',
    imageUrl: '',
    description: 'Create social posts, coordinate campaigns, and learn reporting for growing brands.'
  },
  {
    id: 'job-5',
    title: 'Marketing Analyst',
    company: 'MarketPro',
    location: 'Gurgaon, IN',
    type: 'Full Time',
    salary: '$3,000 / month',
    experience: '01-03 Years',
    contactEmail: 'jobs@marketpro.example',
    phone: '+91 98765 22220',
    postedBy: 'MarketPro',
    postedAt: '2d ago',
    imageUrl: '',
    description: 'Analyze marketing performance, build reports, and support campaign planning.'
  },
  {
    id: 'job-6',
    title: 'Senior Sales Executive',
    company: 'Unilever',
    location: 'Gurgaon, IN',
    type: 'Full Time',
    salary: '$4,000 / month',
    experience: '03-06 Years',
    contactEmail: 'careers@unilever.example',
    phone: '+91 98765 33330',
    postedBy: 'Unilever',
    postedAt: '2d ago',
    imageUrl: '',
    description: 'Manage regional sales relationships, targets, forecasting, and distributor coordination.'
  }
];

const fallbackCandidateProfiles = [
  {
    id: 'candidate-1',
    name: 'Aarav Mehta',
    role: 'UI / UX Designer',
    location: 'Delhi, India',
    experience: '4 years',
    availability: 'Available immediately',
    expectedSalary: '$2,700 / month',
    contactEmail: 'aarav@example.com',
    phone: '+91 90000 11111',
    postedBy: 'Aarav Mehta',
    skills: 'Figma, product design, mobile UI',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    summary: 'Designs mobile-first product experiences with strong visual systems and clean handoff files.'
  },
  {
    id: 'candidate-2',
    name: 'Emma Larsen',
    role: 'Graphic Designer',
    location: 'Bergen, Norway',
    experience: '5 years',
    availability: 'Open to freelance',
    expectedSalary: '$35 / hour',
    contactEmail: 'emma@example.com',
    phone: '+47 922 44 100',
    postedBy: 'Emma Larsen',
    skills: 'Branding, packaging, editorial design',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    summary: 'Specializes in packaging, editorial layouts, and social campaign design for lifestyle brands.'
  },
  {
    id: 'candidate-3',
    name: 'Riya Sharma',
    role: 'Motion Designer',
    location: 'Pune, India',
    experience: '3 years',
    availability: '2 weeks notice',
    expectedSalary: '$3,200 / month',
    contactEmail: 'riya@example.com',
    phone: '+91 98888 22222',
    postedBy: 'Riya Sharma',
    skills: 'After Effects, storyboarding, motion systems',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
    summary: 'Creates explainer videos, animated ads, and product motion systems for digital teams.'
  }
];

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
    <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
      <Icon size={20} />
    </div>
    <div className="text-3xl font-semibold text-slate-950">{value}</div>
    <div className="mt-1 text-sm text-slate-500">{label}</div>
  </div>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
    <Icon size={18} className="mt-0.5 text-emerald-700" />
    <div>
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value || 'Not added'}</div>
    </div>
  </div>
);

const ListingDetail = ({ listing, type, isAuthenticated, isFavorite, onClose, onFavorite, onReply, onReport }) => {
  if (!listing) return null;
  const isJob = type === 'job';
  const title = isJob ? listing.title : listing.name;
  const category = isJob ? 'Job Offer' : 'Resume | CV';

  return (
    <section className="mb-10 rounded-[36px] border border-slate-200 bg-white p-5 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.55)] lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row">
        <img src={listing.imageUrl} alt={title} className="h-72 w-full rounded-[28px] object-cover lg:w-[42%]" />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">{category}</div>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{title}</h2>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2"><MapPin size={16} />{listing.location}</span>
                <span className="inline-flex items-center gap-2"><CalendarDays size={16} />{listing.postedAt || 'Added recently'}</span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-3 text-slate-500 transition hover:border-slate-400 hover:text-slate-900">
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <DetailRow icon={Briefcase} label={isJob ? 'Salary' : 'Expected salary'} value={isJob ? listing.salary : listing.expectedSalary} />
            <DetailRow icon={GraduationCap} label="Experience" value={listing.experience} />
            <DetailRow icon={User} label={isJob ? 'Company' : 'Role'} value={isJob ? listing.company : listing.role} />
            <DetailRow icon={Clock} label={isJob ? 'Job type' : 'Availability'} value={isJob ? listing.type : listing.availability} />
          </div>

          {!isJob && listing.skills && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
              Skills: {listing.skills}
            </div>
          )}

          <p className="mt-5 text-sm leading-7 text-slate-600">{isJob ? listing.description : listing.summary}</p>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Listing owner</div>
            <div className="mt-3 text-xl font-semibold text-slate-950">{listing.postedBy || listing.company || title}</div>
            <div className="mt-1 text-sm text-slate-600">Member since 19 October 2021</div>
            {isAuthenticated ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailRow icon={Phone} label="Phone" value={listing.phone} />
                <DetailRow icon={Mail} label="Email" value={listing.contactEmail} />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Sign in to reveal phone/email and reply to this listing.
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={onFavorite} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
              <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
              {isFavorite ? 'Saved' : 'Add to Favorites'}
            </button>
            <button type="button" onClick={() => onReply(listing, category)} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Mail size={16} />
              Reply to Listing
            </button>
            <button type="button" onClick={() => onReport(listing, category)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300">
              <Flag size={16} />
              Report Listing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const JobCard = ({ job, isFavorite, onFavorite, onView }) => (
  <article className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_70px_-42px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.38)]">
    <div className="relative h-48 overflow-hidden bg-slate-100">
      <img src={job.imageUrl} alt={job.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
        Job Offer
      </div>
      <div className="absolute bottom-4 left-4 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
        {job.postedAt}
      </div>
    </div>

    <div className="p-6">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{job.company}</div>
      <h3 className="text-2xl font-semibold leading-tight text-slate-950">{job.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{job.description}</p>

      <div className="mt-5 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-rose-500" />
          {job.location}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-600" />
          {job.type}
        </div>
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-emerald-700" />
          {job.salary}
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-slate-500" />
          Experience {job.experience || '00-05 Years'}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button type="button" onClick={() => onView(job)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Eye size={16} />
          Details
        </button>
        <button type="button" onClick={() => onFavorite(job.id)} className="rounded-full border border-slate-300 px-4 py-3 text-slate-600 transition hover:border-slate-900 hover:text-slate-900">
          <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>
    </div>
  </article>
);

const CandidateCard = ({ candidate, isAuthenticated, isFavorite, onContact, onFavorite, onView }) => (
  <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_22px_70px_-44px_rgba(15,23,42,0.42)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_-42px_rgba(15,23,42,0.35)]">
    <div className="flex gap-4">
      <img src={candidate.imageUrl} alt={candidate.name} className="h-20 w-20 rounded-3xl object-cover" />
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Resume / CV</div>
        <h3 className="mt-1 text-xl font-semibold text-slate-950">{candidate.name}</h3>
        <p className="text-sm font-medium text-slate-600">{candidate.role}</p>
      </div>
    </div>

    <p className="mt-5 text-sm leading-6 text-slate-600">{candidate.summary}</p>

    <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-rose-500" />
        {candidate.location}
      </div>
      <div className="flex items-center gap-2">
        <GraduationCap size={16} className="text-amber-600" />
        {candidate.experience}
      </div>
      <div className="flex items-center gap-2">
        <Briefcase size={16} className="text-emerald-700" />
        {candidate.expectedSalary}
      </div>
    </div>

    <div className="mt-4 rounded-full bg-emerald-50 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
      {candidate.availability}
    </div>

    {isAuthenticated ? (
      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-3">
        <button
          type="button"
          onClick={() => onContact(candidate)}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Contact candidate
        </button>
        <button type="button" onClick={() => onView(candidate)} className="rounded-full border border-slate-300 px-4 py-3 text-slate-600 transition hover:border-slate-900 hover:text-slate-900">
          <Eye size={16} />
        </button>
        <button type="button" onClick={() => onFavorite(candidate.id)} className="rounded-full border border-slate-300 px-4 py-3 text-slate-600 transition hover:border-slate-900 hover:text-slate-900">
          <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>
    ) : (
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
        <Link
          to="/signin"
          className="inline-flex justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          Sign in to contact
        </Link>
        <button type="button" onClick={() => onView(candidate)} className="rounded-full border border-slate-300 px-4 py-3 text-slate-600 transition hover:border-slate-900 hover:text-slate-900">
          <Eye size={16} />
        </button>
      </div>
    )}
  </article>
);

const getLogoText = (listing) => (listing.company || listing.name || listing.title || 'F').slice(0, 2).toUpperCase();

const JobOfferRow = ({ job, isFavorite, onFavorite, onView }) => (
  <article className="grid gap-4 border-b border-slate-200 bg-white px-4 py-7 transition hover:bg-slate-50 sm:grid-cols-[54px_1fr_auto] sm:px-6">
    <button type="button" onClick={() => onView(job)} className="flex h-14 w-14 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-700">
      {job.imageUrl ? <img src={job.imageUrl} alt={job.company} className="h-full w-full rounded-md object-cover" /> : getLogoText(job)}
    </button>

    <button type="button" onClick={() => onView(job)} className="min-w-0 text-left">
      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
        <span>{job.company}</span>
        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
        <span>{job.type}</span>
        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
        <span>{job.location}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
        <span className="rounded-md bg-slate-100 px-2.5 py-1">{job.salary}</span>
        <span className="rounded-md bg-slate-100 px-2.5 py-1">Experience {job.experience}</span>
      </div>
    </button>

    <div className="flex items-center justify-between gap-3 text-sm text-slate-500 sm:flex-col sm:items-end">
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <Clock size={15} />
        {job.postedAt || 'New'}
      </span>
      <button type="button" onClick={() => onFavorite(job.id)} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:text-rose-600">
        <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
      </button>
    </div>
  </article>
);

const CandidateProfileRow = ({ candidate, onView }) => (
  <article className="grid gap-4 border-b border-slate-200 bg-white px-4 py-7 transition hover:bg-slate-50 sm:grid-cols-[54px_1fr_auto] sm:px-6">
    <button type="button" onClick={() => onView(candidate)} className="h-14 w-14 overflow-hidden rounded-md bg-slate-100">
      <img src={candidate.imageUrl} alt={candidate.name} className="h-full w-full object-cover" />
    </button>
    <button type="button" onClick={() => onView(candidate)} className="min-w-0 text-left">
      <h3 className="text-lg font-semibold text-slate-900">{candidate.name}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
        <span>{candidate.role}</span>
        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
        <span>{candidate.location}</span>
        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
        <span>{candidate.availability}</span>
      </div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Resume / CV</div>
    </button>
    <span className="text-sm font-semibold text-slate-600">{candidate.experience}</span>
  </article>
);

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formMode, setFormMode] = useState('job');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [postedFilter, setPostedFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full Time',
    salary: '',
    experience: '00-05 Years',
    contactEmail: '',
    phone: '',
    postedBy: '',
    imageUrl: '',
    description: ''
  });
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    role: '',
    location: '',
    experience: '',
    availability: 'Available immediately',
    expectedSalary: '',
    contactEmail: '',
    phone: '',
    postedBy: '',
    skills: '',
    imageUrl: '',
    summary: ''
  });
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('token')));

    api
      .get('/ads/jobs')
      .then((res) => {
        setJobs(res.data.jobAds || []);
        setCandidates(res.data.candidateProfiles || []);
      })
      .catch((err) => {
        console.error(err);
        setJobs(fallbackJobAds);
        setCandidates(fallbackCandidateProfiles);
      })
      .finally(() => setLoading(false));
  }, []);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const matchesQuery = (item, fields) => {
    if (!normalizedQuery) return true;
    return fields.some((field) => String(item[field] || '').toLowerCase().includes(normalizedQuery));
  };

  const parseDaysAgo = (value) => {
    const text = String(value || '').toLowerCase();
    if (text.includes('new') || text.includes('just')) return 0;
    const match = text.match(/(\d+)\s*d/);
    return match ? Number(match[1]) : 30;
  };

  const parseSalary = (value) => Number(String(value || '').replace(/[^0-9]/g, '')) || 0;

  const filteredJobs = jobs
    .filter((job) => matchesQuery(job, ['title', 'company', 'location', 'type', 'salary', 'experience', 'description']))
    .filter((job) => typeFilter === 'all' || job.type === typeFilter)
    .filter((job) => locationFilter === 'all' || job.location === locationFilter)
    .filter((job) => postedFilter === 'all' || (postedFilter === 'day' ? parseDaysAgo(job.postedAt) <= 1 : parseDaysAgo(job.postedAt) <= 7))
    .filter((job) => salaryFilter === 'all' || parseSalary(job.salary) >= Number(salaryFilter))
    .sort((first, second) => {
      if (sortBy === 'newest') return parseDaysAgo(first.postedAt) - parseDaysAgo(second.postedAt);
      if (sortBy === 'salary') return parseSalary(second.salary) - parseSalary(first.salary);
      return 0;
    });
  const filteredCandidates = candidates.filter((candidate) =>
    matchesQuery(candidate, ['name', 'role', 'location', 'experience', 'availability', 'expectedSalary', 'skills', 'summary'])
  );
  const selectedCategory = categoryFilter === 'all' ? activeTab : categoryFilter;
  const showJobs = selectedCategory === 'all' || selectedCategory === 'jobs';
  const showCandidates = selectedCategory === 'all' || selectedCategory === 'candidates';
  const totalVisibleResults = (showJobs ? filteredJobs.length : 0) + (showCandidates ? filteredCandidates.length : 0);
  const availableLocations = Array.from(new Set(jobs.map((job) => job.location).filter(Boolean)));

  const updateJobForm = (field, value) => setJobForm((current) => ({ ...current, [field]: value }));
  const updateCandidateForm = (field, value) => setCandidateForm((current) => ({ ...current, [field]: value }));

  const handleJobSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await api.post('/ads/jobs', jobForm);
      setJobs((current) => [res.data, ...current]);
      setJobForm({
        title: '',
        company: '',
        location: '',
        type: 'Full Time',
        salary: '',
        experience: '00-05 Years',
        contactEmail: '',
        phone: '',
        postedBy: '',
        imageUrl: '',
        description: ''
      });
      setActiveTab('jobs');
      setMessage('Job posted successfully.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCandidateSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await api.post('/ads/candidates', candidateForm);
      setCandidates((current) => [res.data, ...current]);
      setCandidateForm({
        name: '',
        role: '',
        location: '',
        experience: '',
        availability: 'Available immediately',
        expectedSalary: '',
        contactEmail: '',
        phone: '',
        postedBy: '',
        skills: '',
        imageUrl: '',
        summary: ''
      });
      setActiveTab('candidates');
      setMessage('Candidate profile added successfully.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add candidate profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactCandidate = (candidate) => {
    if (!isAuthenticated) {
      setMessage('Please sign in to reveal candidate contact details.');
      return;
    }
    setSelectedListing({ type: 'candidate', item: candidate });
    setMessage(`Contact details are ready for ${candidate.name}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (id) => {
    if (!isAuthenticated) {
      setMessage('Please sign in to add listings to favorites.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFavoriteIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  const handleViewListing = (type, item) => {
    setSelectedListing({ type, item });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplyListing = (listing, category) => {
    if (!isAuthenticated) {
      setMessage('Please sign in to reply to listings.');
      return;
    }
    setMessage(`Reply form ready for ${category}: ${listing.title || listing.name}. Contact can continue by phone or email.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportListing = (listing, category) => {
    if (!isAuthenticated) {
      setMessage('Please sign in to report listings.');
      return;
    }
    setMessage(`Report received for ${category}: ${listing.title || listing.name}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f5f7f4] text-slate-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-bold uppercase tracking-[0.26em] text-white">FA</div>
          <div>
            <div className="text-xl font-bold tracking-tight text-slate-900">Freeads</div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Jobs marketplace</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
            <ArrowLeft size={16} />
            Landing page
          </Link>
          <Link to="/post-a-job" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            Post a Job
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-14 pt-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800 shadow-sm backdrop-blur">
              <Briefcase size={14} />
              Jobs and resumes
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 md:text-6xl">
              Find job offers and candidate profiles in one place.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              This page follows the client request: when the Jobs category is clicked, users can see both available job ads and candidate resume profiles.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <StatCard icon={Briefcase} label="Active job ads" value={jobs.length || 3} />
            <StatCard icon={Users} label="Candidate profiles" value={candidates.length || 3} />
            <StatCard icon={Search} label="Category" value="Jobs" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        {selectedListing && (
          <ListingDetail
            listing={selectedListing.item}
            type={selectedListing.type}
            isAuthenticated={isAuthenticated}
            isFavorite={favoriteIds.includes(selectedListing.item.id)}
            onClose={() => setSelectedListing(null)}
            onFavorite={() => toggleFavorite(selectedListing.item.id)}
            onReply={handleReplyListing}
            onReport={handleReportListing}
          />
        )}

        <section className="mb-10 rounded-[36px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.5)] lg:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Create listing</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Post a job or add a candidate profile</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Sign in is required only for posting jobs, adding candidate profiles, or contacting candidates.
              </p>
            </div>

            {isAuthenticated && <div className="flex rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setFormMode('job')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${formMode === 'job' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-950'}`}
              >
                Employer: Post Job
              </button>
              <button
                type="button"
                onClick={() => setFormMode('candidate')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${formMode === 'candidate' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-950'}`}
              >
                Candidate: Add Profile
              </button>
            </div>}
          </div>

          {message && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {message}
            </div>
          )}

          {!isAuthenticated ? (
            <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-800">Sign in required</div>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Posting and contact actions are protected.</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                Anyone can browse jobs and candidates. To post a job, create a candidate profile, or contact a candidate, the user must sign in or create an account first.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/signin" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Sign in
                </Link>
                <Link to="/signup" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
                  Create account
                </Link>
              </div>
            </div>
          ) : formMode === 'job' ? (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleJobSubmit}>
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Job title" value={jobForm.title} onChange={(e) => updateJobForm('title', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Company name" value={jobForm.company} onChange={(e) => updateJobForm('company', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Location" value={jobForm.location} onChange={(e) => updateJobForm('location', e.target.value)} />
              <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" value={jobForm.type} onChange={(e) => updateJobForm('type', e.target.value)}>
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Remote</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Salary, e.g. $3,000 / month" value={jobForm.salary} onChange={(e) => updateJobForm('salary', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Experience, e.g. 00-05 Years" value={jobForm.experience} onChange={(e) => updateJobForm('experience', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Contact email" value={jobForm.contactEmail} onChange={(e) => updateJobForm('contactEmail', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Phone number" value={jobForm.phone} onChange={(e) => updateJobForm('phone', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Posted by / member name" value={jobForm.postedBy} onChange={(e) => updateJobForm('postedBy', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Image URL optional" value={jobForm.imageUrl} onChange={(e) => updateJobForm('imageUrl', e.target.value)} />
              <textarea className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white md:col-span-2" placeholder="Job description" value={jobForm.description} onChange={(e) => updateJobForm('description', e.target.value)} />
              <button disabled={submitting} className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 md:col-span-2" type="submit">
                {submitting ? 'Posting job...' : 'Post Job'}
              </button>
            </form>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCandidateSubmit}>
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Candidate name" value={candidateForm.name} onChange={(e) => updateCandidateForm('name', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Role, e.g. UI Designer" value={candidateForm.role} onChange={(e) => updateCandidateForm('role', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Location" value={candidateForm.location} onChange={(e) => updateCandidateForm('location', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Experience, e.g. 3 years" value={candidateForm.experience} onChange={(e) => updateCandidateForm('experience', e.target.value)} />
              <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" value={candidateForm.availability} onChange={(e) => updateCandidateForm('availability', e.target.value)}>
                <option>Available immediately</option>
                <option>Open to freelance</option>
                <option>2 weeks notice</option>
                <option>1 month notice</option>
              </select>
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Expected salary" value={candidateForm.expectedSalary} onChange={(e) => updateCandidateForm('expectedSalary', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Contact email" value={candidateForm.contactEmail} onChange={(e) => updateCandidateForm('contactEmail', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Phone number" value={candidateForm.phone} onChange={(e) => updateCandidateForm('phone', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Posted by / member name" value={candidateForm.postedBy} onChange={(e) => updateCandidateForm('postedBy', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white" placeholder="Skills, e.g. Figma, motion, branding" value={candidateForm.skills} onChange={(e) => updateCandidateForm('skills', e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white md:col-span-2" placeholder="Image URL optional" value={candidateForm.imageUrl} onChange={(e) => updateCandidateForm('imageUrl', e.target.value)} />
              <textarea className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white md:col-span-2" placeholder="Candidate profile summary" value={candidateForm.summary} onChange={(e) => updateCandidateForm('summary', e.target.value)} />
              <button disabled={submitting} className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 md:col-span-2" type="submit">
                {submitting ? 'Adding profile...' : 'Add Candidate Profile'}
              </button>
            </form>
          )}
        </section>

        <div className="mb-10 rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] md:flex md:items-center md:justify-between md:gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: jobs.length + candidates.length },
              { key: 'jobs', label: 'Job Offers', count: jobs.length },
              { key: 'candidates', label: 'Candidate Profiles', count: candidates.length }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 md:mt-0 md:min-w-[320px]">
            <Search size={18} className="text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, location, skill..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse border-b border-slate-100 bg-white" />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-md bg-white" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
            <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">All Jobs</div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Job Offer</h2>
                  </div>
                  <span className="text-sm font-semibold text-slate-500">{totalVisibleResults} results</span>
                </div>
              </div>

              {showJobs && filteredJobs.map((job) => (
                <JobOfferRow
                  key={job.id}
                  job={job}
                  isFavorite={favoriteIds.includes(job.id)}
                  onFavorite={toggleFavorite}
                  onView={(item) => handleViewListing('job', item)}
                />
              ))}

              {showCandidates && filteredCandidates.map((candidate) => (
                <CandidateProfileRow
                  key={candidate.id}
                  candidate={candidate}
                  onView={(item) => handleViewListing('candidate', item)}
                />
              ))}

              {totalVisibleResults === 0 && (
                <div className="p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <Search size={24} />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-950">No results found</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Try searching another title, location, company, or candidate skill.
                  </p>
                </div>
              )}
            </section>

            <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
              <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                <SlidersHorizontal size={16} />
                Filters
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Category</span>
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-900">
                    <option value="all">All categories</option>
                    <option value="jobs">Job Offer</option>
                    <option value="candidates">Resume / CV</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Job Type</span>
                  <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-900">
                    <option value="all">All job types</option>
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Remote</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Posted At</span>
                  <select value={postedFilter} onChange={(event) => setPostedFilter(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-900">
                    <option value="all">Any Time</option>
                    <option value="day">Last 24 hours</option>
                    <option value="week">Last 7 days</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Location</span>
                  <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-900">
                    <option value="all">Anywhere</option>
                    {availableLocations.map((location) => (
                      <option key={location}>{location}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Salary</span>
                  <select value={salaryFilter} onChange={(event) => setSalaryFilter(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-900">
                    <option value="all">Any salary</option>
                    <option value="1000">$1,000+</option>
                    <option value="3000">$3,000+</option>
                    <option value="5000">$5,000+</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Sort By</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-900">
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="salary">Salary</option>
                  </select>
                </label>

                <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full rounded-md bg-[#1197ad] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f8396]">
                  Search
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobsPage;
