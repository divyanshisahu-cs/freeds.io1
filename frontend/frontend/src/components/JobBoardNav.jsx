import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

export const jobBoardNavLinks = [
  { label: "Jobs", to: "/jobs" },
  { label: "Companies", to: "/companies" },
  { label: "Profiles", to: "/profiles" },
  { label: "Pricing", to: "/pricing" },
  { label: "Blog", to: "/blog" },
];

const JobBoardNav = () => {

  const [country, setCountry] = useState("India");

  return (

    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">

        {/* LOGO */}
        <Link
          to="/"
          className="font-serif text-3xl font-semibold tracking-tight text-slate-950"
        >
          freeads.no
        </Link>


        {/* NAV LINKS */}
        <div className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">

          {jobBoardNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition hover:text-slate-950 ${
                  isActive
                    ? "text-slate-950"
                    : "text-slate-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}


          {/* COUNTRY SELECTOR */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
          >
            <option>India</option>
            <option>Norway</option>
          </select>


          {/* ADMIN */}
          <NavLink
            to="/admin"
            className="transition hover:text-slate-950 text-slate-600"
          >
            Admin
          </NavLink>


          <span className="h-6 w-px bg-slate-300" />


          {/* LOGIN */}
          <Link
            to="/signin"
            className="transition hover:text-slate-950"
          >
            Login
          </Link>


          {/* SIGNUP */}
          <Link
            to="/signup"
            className="rounded-md border border-slate-300 px-5 py-2 transition hover:border-slate-900"
          >
            Sign Up
          </Link>


          {/* POST JOB */}
          <Link
            to="/post-a-job"
            className="rounded-md bg-slate-950 px-5 py-2 text-white transition hover:bg-slate-800"
          >
            Post a Job
          </Link>

        </div>

      </nav>

    </header>
  );
};

export default JobBoardNav;