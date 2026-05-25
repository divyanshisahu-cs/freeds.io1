import { Link } from 'react-router-dom';
import { ArrowRight, Building2, FileText, Newspaper, UserRound, WalletCards } from 'lucide-react';
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
            {content.items.map((item) => (
              <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
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
