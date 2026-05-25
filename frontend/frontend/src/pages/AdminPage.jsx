import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CreditCard,
  Edit3,
  Flag,
  Globe2,
  ImagePlus,
  Lock,
  Megaphone,
  Plus,
  Search,
  Star,
  Trash2,
  Unlock,
  Users,
} from "lucide-react";
import api from "../services/api";
import JobBoardNav from "../components/JobBoardNav";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyPostForm = {
  title: "",
  description: "",
  location: "",
  country: "India",
  category: "General",
  price: "",
  featured: false,
  startDate: "",
  endDate: "",
};

const currencyByCountry = {
  India: "INR",
  Norway: "NOK",
};

const durationOptions = [
  { label: "1 Day", value: "1" },
  { label: "10 Days", value: "10" },
  { label: "30 Days", value: "30" },
  { label: "Permanent", value: "permanent" },
];

const categories = [
  "General",
  "Jobs",
  "Rooms",
  "Devices",
  "Services",
  "Vehicles",
];

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-4 focus:ring-cyan-50";

const panelClass =
  "rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.75)]";

const SectionTitle = ({ icon: Icon, title, meta }) => (
  <div className="mb-5 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
        <Icon size={18} />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {meta && <p className="mt-0.5 text-sm text-slate-500">{meta}</p>}
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, tone = "cyan" }) => {
  const toneClass = {
    cyan: "bg-cyan-50 text-cyan-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-4 inline-flex rounded-md p-3 ${toneClass}`}>
      <Icon size={20} />
      </div>
      <div className="text-3xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-500">{label}</div>
    </div>
  );
};

function AdminPage() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyPostForm);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dashboard, setDashboard] = useState(null);
  const [blockForm, setBlockForm] = useState({
    identifier: "",
    duration: "1",
    reason: "Policy violation",
  });
  const [broadcastText, setBroadcastText] = useState("");
  const [announcement, setAnnouncement] = useState({
    title: "",
    text: "",
    imageUrl: "",
    durationDays: "7",
  });
  const [featuredPrice, setFeaturedPrice] = useState({
    indiaPrice: 499,
    norwayPrice: 99,
  });

  const currency = currencyByCountry[form.country] || "INR";

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesKeyword =
        !keyword ||
        [post.title, post.description, post.location, post.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword));

      const matchesCountry =
        countryFilter === "all" || post.country === countryFilter;

      const matchesCategory =
        categoryFilter === "all" || post.category === categoryFilter;

      return matchesKeyword && matchesCountry && matchesCategory;
    });
  }, [posts, search, countryFilter, categoryFilter]);

  const fetchPosts = async () => {
    const res = await api.get("/api/posts");
    setPosts(res.data);
  };

  const fetchDashboard = async () => {
    const res = await api.get("/api/posts/admin/dashboard");
    setDashboard(res.data);
    setFeaturedPrice({
      indiaPrice: res.data.settings?.featuredPrice?.India || 499,
      norwayPrice: res.data.settings?.featuredPrice?.Norway || 99,
    });
  };

  const refreshAll = async () => {
    try {
      await Promise.all([fetchPosts(), fetchDashboard()]);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not load admin data.");
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addPost = async (event) => {
    event.preventDefault();

    if (!form.title || !form.description || !form.location) {
      return setMessage("Title, description and location are required.");
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      Object.entries({
        ...form,
        currency,
      }).forEach(([key, value]) => formData.append(key, value));

      if (image) {
        formData.append("image", image);
      }

      await api.post("/api/posts/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm(emptyPostForm);
      setImage(null);
      setMessage(form.featured ? "Featured ad created. Send user to payment next." : "Standard ad created.");
      refreshAll();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not add post.");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this ad?")) return;

    await api.delete(`/api/posts/${id}`);
    setMessage("Ad deleted.");
    refreshAll();
  };

  const editPost = async (post) => {
    const description = prompt("Edit description", post.description || "");
    if (description === null) return;

    const location = prompt("Edit location", post.location || "");
    if (location === null) return;

    const price = prompt("Edit price", post.price ?? "");
    if (price === null) return;

    const startDate = prompt("Edit start date (YYYY-MM-DD)", post.startDate?.slice(0, 10) || "");
    if (startDate === null) return;

    const endDate = prompt("Edit end date (YYYY-MM-DD)", post.endDate?.slice(0, 10) || "");
    if (endDate === null) return;

    await api.put(`/api/posts/${post._id}`, {
      description,
      location,
      price,
      startDate: startDate || null,
      endDate: endDate || null,
      featured: post.featured,
    });

    setMessage("Ad updated. Title and category remain locked after posting.");
    refreshAll();
  };

  const toggleFeatured = async (post) => {
    await api.put(`/api/posts/${post._id}`, {
      featured: !post.featured,
    });
    refreshAll();
  };

  const reportPost = async (id) => {
    const reason = prompt("Reason for report", "Spam Ad");
    if (!reason) return;

    await api.post(`/api/posts/report/${id}`, { reason });
    setMessage("Report saved for admin review.");
    refreshAll();
  };

  const blockUser = async (event) => {
    event.preventDefault();

    await api.post("/api/posts/admin/block-user", blockForm);
    setBlockForm({ identifier: "", duration: "1", reason: "Policy violation" });
    setMessage("Login blocked. User will see the block message on sign in.");
    refreshAll();
  };

  const unblockUser = async (userId) => {
    await api.post("/api/posts/admin/unblock-user", { userId });
    setMessage("User unblocked.");
    refreshAll();
  };

  const sendBroadcast = async (event) => {
    event.preventDefault();
    if (!broadcastText.trim()) return;

    await api.post("/api/posts/admin/message", { text: broadcastText.trim() });
    setBroadcastText("");
    setMessage("General message saved for all users.");
    refreshAll();
  };

  const sendAnnouncement = async (event) => {
    event.preventDefault();

    await api.post("/api/posts/admin/announcement", announcement);
    setAnnouncement({ title: "", text: "", imageUrl: "", durationDays: "7" });
    setMessage("Homepage announcement saved.");
    refreshAll();
  };

  const updateFeaturedPrice = async (event) => {
    event.preventDefault();

    await api.put("/api/posts/admin/featured-price", featuredPrice);
    setMessage("Featured ad prices updated.");
    refreshAll();
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <JobBoardNav />

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-[0_26px_90px_-58px_rgba(15,23,42,0.9)]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
          <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Admin Dashboard
            </div>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white">
              Ads, users, reports and featured pricing
            </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Moderate listings, control featured plans, manage subscriber access and publish site-wide updates.
              </p>
          </div>
            <div className="rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">
              <span className="inline-flex items-center gap-2">
                <CreditCard size={16} />
                Stripe / Razorpay / PayPal ready
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-md border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-900 shadow-sm">
            {message}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total ads" value={dashboard?.totalPosts ?? posts.length} icon={BarChart3} tone="cyan" />
          <StatCard label="Featured ads" value={dashboard?.featuredPosts ?? 0} icon={Star} tone="amber" />
          <StatCard label="Reported ads" value={dashboard?.reportedPosts?.length ?? 0} icon={Flag} tone="rose" />
          <StatCard label="Subscribers" value={dashboard?.users?.length ?? 0} icon={Users} tone="slate" />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={addPost} className={panelClass}>
            <SectionTitle icon={ImagePlus} title="Create ad" meta="Post standard or featured listings with country-aware currency." />

            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClass} placeholder="Ad title" value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
              <select className={inputClass} value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <select className={inputClass} value={form.country} onChange={(e) => updateForm("country", e.target.value)}>
                <option>India</option>
                <option>Norway</option>
              </select>
              <input className={inputClass} placeholder="State / city / location" value={form.location} onChange={(e) => updateForm("location", e.target.value)} />
              <input className={inputClass} type="number" placeholder={`Price in ${currency}`} value={form.price} onChange={(e) => updateForm("price", e.target.value)} />
              <input className={inputClass} value={currency} readOnly />
              <input className={inputClass} type="date" value={form.startDate} onChange={(e) => updateForm("startDate", e.target.value)} />
              <input className={inputClass} type="date" value={form.endDate} onChange={(e) => updateForm("endDate", e.target.value)} />
              <textarea className={`${inputClass} min-h-28 md:col-span-2`} placeholder="Description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
              <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-600 transition hover:border-cyan-500 hover:bg-cyan-50">
                <input className="sr-only" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                {image ? image.name : "Upload image"}
              </label>
              <label className="flex min-h-12 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                <input className="h-4 w-4 accent-cyan-700" type="checkbox" checked={form.featured} onChange={(e) => updateForm("featured", e.target.checked)} />
                Featured ad
              </label>
            </div>

            <button disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
              <Plus size={16} />
              {loading ? "Adding..." : "Add Ad"}
            </button>
          </form>

          <div className="grid gap-6">
            <form onSubmit={updateFeaturedPrice} className={panelClass}>
              <SectionTitle icon={Star} title="Featured price" meta="Control paid placement by market." />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={inputClass} type="number" placeholder="India INR" value={featuredPrice.indiaPrice} onChange={(e) => setFeaturedPrice((current) => ({ ...current, indiaPrice: e.target.value }))} />
                <input className={inputClass} type="number" placeholder="Norway NOK" value={featuredPrice.norwayPrice} onChange={(e) => setFeaturedPrice((current) => ({ ...current, norwayPrice: e.target.value }))} />
              </div>
              <button className="mt-4 rounded-md bg-[#1197ad] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f8396]">
                Save prices
              </button>
            </form>

            <form onSubmit={blockUser} className={panelClass}>
              <SectionTitle icon={Lock} title="Block login" meta="Suspend access by email or mobile number." />
              <input className={inputClass} placeholder="Email or mobile number" value={blockForm.identifier} onChange={(e) => setBlockForm((current) => ({ ...current, identifier: e.target.value }))} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <select className={inputClass} value={blockForm.duration} onChange={(e) => setBlockForm((current) => ({ ...current, duration: e.target.value }))}>
                  {durationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <input className={inputClass} placeholder="Reason" value={blockForm.reason} onChange={(e) => setBlockForm((current) => ({ ...current, reason: e.target.value }))} />
              </div>
              <button className="mt-4 rounded-md bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
                Block user
              </button>
            </form>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <form onSubmit={sendBroadcast} className={panelClass}>
            <SectionTitle icon={Megaphone} title="General message" meta="Save a message for all users." />
            <textarea className={`${inputClass} min-h-24`} value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)} placeholder="Message text" />
            <button className="mt-4 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Send message
            </button>
          </form>

          <form onSubmit={sendAnnouncement} className={panelClass}>
            <SectionTitle icon={Bell} title="Homepage announcement" meta="Publish image and text for a fixed duration." />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={inputClass} placeholder="Title" value={announcement.title} onChange={(e) => setAnnouncement((current) => ({ ...current, title: e.target.value }))} />
              <input className={inputClass} type="number" placeholder="Duration days" value={announcement.durationDays} onChange={(e) => setAnnouncement((current) => ({ ...current, durationDays: e.target.value }))} />
              <input className={`${inputClass} sm:col-span-2`} placeholder="Image URL" value={announcement.imageUrl} onChange={(e) => setAnnouncement((current) => ({ ...current, imageUrl: e.target.value }))} />
              <textarea className={`${inputClass} min-h-20 sm:col-span-2`} placeholder="Announcement text" value={announcement.text} onChange={(e) => setAnnouncement((current) => ({ ...current, text: e.target.value }))} />
            </div>
            <button className="mt-4 rounded-md bg-[#1197ad] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f8396]">
              Publish announcement
            </button>
          </form>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className={panelClass}>
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Ad moderation</h2>
                <p className="mt-1 text-sm text-slate-500">{filteredPosts.length} listings visible</p>
              </div>
              <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-cyan-700 focus-within:bg-white">
                <Search size={17} className="text-slate-400" />
                <input className="bg-transparent text-sm outline-none" placeholder="Search ads" value={search} onChange={(e) => setSearch(e.target.value)} />
              </label>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <select className={inputClass} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                <option value="all">All countries</option>
                <option value="India">India</option>
                <option value="Norway">Norway</option>
              </select>
              <select className={inputClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>

            <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
              {filteredPosts.map((post) => (
                <article key={post._id} className="grid gap-4 border-b border-slate-200 bg-white p-4 transition last:border-b-0 hover:bg-slate-50 md:grid-cols-[96px_1fr_auto]">
                  <div className="h-24 w-24 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                    {post.image ? (
                      <img src={`${API_URL}/uploads/${post.image}`} alt={post.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">No image</div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">{post.country}</span>
                      <span className="rounded-md bg-cyan-50 px-2 py-1 text-cyan-700">{post.category}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">{post.currency || currencyByCountry[post.country] || "INR"} {post.price || 0}</span>
                      {post.featured && <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">Featured</span>}
                      {post.reportCount > 0 && <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-700">{post.reportCount} reports</span>}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">{post.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{post.description}</p>
                    <p className="mt-2 text-sm font-medium text-slate-500">{post.location}</p>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 md:justify-end">
                    <button title="Edit" onClick={() => editPost(post)} className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-900 hover:text-slate-950"><Edit3 size={16} /></button>
                    <button title="Toggle featured" onClick={() => toggleFeatured(post)} className="rounded-md border border-slate-200 bg-white p-2 text-amber-600 transition hover:border-amber-500 hover:bg-amber-50"><Star size={16} /></button>
                    <button title="Report" onClick={() => reportPost(post._id)} className="rounded-md border border-slate-200 bg-white p-2 text-orange-600 transition hover:border-orange-500 hover:bg-orange-50"><Flag size={16} /></button>
                    <button title="Delete" onClick={() => deletePost(post._id)} className="rounded-md border border-slate-200 bg-white p-2 text-rose-600 transition hover:border-rose-500 hover:bg-rose-50"><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
              {filteredPosts.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">No ads found.</div>
              )}
            </div>
          </div>

          <aside className="grid gap-6">
            <div className={panelClass}>
              <SectionTitle icon={Globe2} title="Region analytics" />
              <div className="space-y-3">
                {(dashboard?.countryBreakdown || []).map((item) => (
                  <div key={item._id || "Unknown"} className="flex justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <span>{item._id || "Unknown"}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={panelClass}>
              <SectionTitle icon={Lock} title="Blocked subscribers" />
              <div className="space-y-3">
                {(dashboard?.users || []).filter((user) => user.blockedUntil && new Date(user.blockedUntil) > new Date()).map((user) => (
                  <div key={user._id} className="rounded-md border border-rose-100 bg-rose-50/60 p-3">
                    <div className="text-sm font-semibold">{user.email}</div>
                    <div className="mt-1 text-xs text-slate-500">Until {new Date(user.blockedUntil).toLocaleString()}</div>
                    <button onClick={() => unblockUser(user._id)} className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold transition hover:border-slate-900">
                      <Unlock size={14} />
                      Unblock
                    </button>
                  </div>
                ))}
                {!(dashboard?.users || []).some((user) => user.blockedUntil && new Date(user.blockedUntil) > new Date()) && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">No active login blocks.</div>
                )}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default AdminPage;
