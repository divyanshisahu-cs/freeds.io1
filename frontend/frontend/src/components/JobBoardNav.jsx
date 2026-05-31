import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const jobBoardNavLinks = [
  { label: "Jobs", to: "/jobs" },
  { label: "Companies", to: "/companies" },
  { label: "Profiles", to: "/profiles" },
  { label: "Pricing", to: "/pricing" },
  { label: "Blog", to: "/blog" },
];

const JobBoardNav = () => {
  const navigate = useNavigate();

  const [country, setCountry] = useState(() => localStorage.getItem("country") || "India");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  const handleCountryChange = (value) => {
    setCountry(value);
    localStorage.setItem("country", value);
    window.dispatchEvent(new CustomEvent("countrychange", { detail: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/signin");
  };

  return (

    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">

        {/* LOGO */}
        <Link
          to="/"
          className="font-serif text-3xl font-semibold tracking-tight text-slate-950"
        >
          freeds.io
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
            onChange={(e) => handleCountryChange(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
          >
            <option>India</option>
            <option>Norway</option>
          </select>


          {/* ADMIN */}
          {user && user.role === 'admin' && (
            <NavLink
              to="/admin"
              className="transition hover:text-slate-950 text-slate-600"
            >
              Admin
            </NavLink>
          )}


          <span className="h-6 w-px bg-slate-300" />


          {user ? (
            <>
              <Link to="/profile" className="transition hover:text-slate-950">
                Profile
              </Link>
              <button type="button" onClick={handleLogout} className="transition hover:text-slate-950">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="transition hover:text-slate-950">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-md border border-slate-300 px-5 py-2 transition hover:border-slate-900"
              >
                Sign Up
              </Link>
            </>
          )}


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
