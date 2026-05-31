import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Building2, FileText, Newspaper, UserRound, WalletCards, Edit3, Save, X } from 'lucide-react';
import JobBoardNav from '../components/JobBoardNav';

const pageContent = {
  companies: {
    eyebrow: 'Companies',
    title: 'Discover companies hiring on Freeads.',
    description: 'Browse employer profiles, company details, and active job posts from teams looking for talent.',
    icon: Building2,
    items: ['Verified company profiles', 'Active vacancies by employer', 'Direct links to company websites']
  },
  profiles: {
    eyebrow: 'Profiles',
    title: 'Find candidate profiles and resumes.',
    description: 'Review candidate summaries, experience, availability, and contact details when you are signed in.',
    icon: UserRound,
    items: ['Resume and CV listings', 'Skills and availability', 'Protected contact details']
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Simple pricing for job posts.',
    description: 'This prototype keeps posting free while preserving the payment step your senior recommended.',
    icon: WalletCards,
    items: ['Standard job listing: $0', 'Review before publishing', 'Payment-ready layout for future plans']
  },
  blog: {
    eyebrow: 'Blog',
    title: 'Hiring tips and marketplace updates.',
    description: 'A place for articles about job posting, candidate screening, and getting better replies.',
    icon: Newspaper,
    items: ['Posting guides', 'Candidate search tips', 'Freeads product updates']
  }
};

const PublicInfoPage = ({ type }) => {
  const content = pageContent[type] || pageContent.companies;
  const Icon = content.icon || FileText;

  const [editing, setEditing] = useState(false);
  const storageKey = `publicInfo.${type || 'companies'}.items`;
  const [itemsState, setItemsState] = useState(content.items);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setItemsState(JSON.parse(saved));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index, value) => {
    const copy = [...itemsState];
    copy[index] = value;
    setItemsState(copy);
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(itemsState));
    setEditing(false);
  };

  const handleCancel = () => {
    const saved = localStorage.getItem(storageKey);
    setItemsState(saved ? JSON.parse(saved) : content.items);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-slate-900">
      <JobBoardNav />

      <main className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-slate-950 text-white">
            <Icon size={24} />
          </div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{content.eyebrow}</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{content.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {itemsState.map((item, idx) => (
              <div key={`${idx}-${item}`} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                {editing ? (
                  <textarea
                    value={item}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    className="w-full resize-none bg-transparent text-sm font-semibold text-slate-700 outline-none"
                    rows={3}
                  />
                ) : (
                  item
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Edit3 size={14} /> Edit
              </button>
            ) : (
              <>
                <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500">
                  <Save size={14} /> Save
                </button>
                <button onClick={handleCancel} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <X size={14} /> Cancel
                </button>
              </>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/jobs" className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Browse jobs
              <ArrowRight size={16} />
            </Link>
            <Link to="/post-a-job" className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900">
              Post a Job
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicInfoPage;
