import React, { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  Camera,
  CheckCircle2,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import api from '../services/api';
import JobBoardNav from '../components/JobBoardNav';

const emptyProfile = {
  fullName: '',
  photo: '',
  contactNumber: '',
  whatsappNumber: '',
  country: 'India',
  state: '',
  city: '',
  location: '',
  bio: '',
};

const inputClass = 'w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100';
const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500';

const resolveUploadUrl = (filename) => {
  if (!filename) return '';
  if (/^https?:\/\//i.test(filename)) return filename;

  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  const uploadPath = cleanFilename.startsWith('uploads/')
    ? `/${cleanFilename}`
    : `/uploads/${cleanFilename}`;
  const baseURL = api.defaults.baseURL || window.location.origin;

  return new URL(uploadPath, baseURL).toString();
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [editingPostId, setEditingPostId] = useState('');
  const [postDraft, setPostDraft] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = (text, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  };

  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setProfile({ ...emptyProfile, ...(res.data.user?.profile || {}) });
      setPosts(res.data.posts || []);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (error) {
      setMessage(error.response?.data?.error || 'Please sign in to view your profile.');
    }
  };

  useEffect(() => {
    loadProfile();

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.put('/auth/me', { profile });
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      setProfile({ ...emptyProfile, ...(updatedUser.profile || {}) });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Profile updated.');
      showToast('Profile saved successfully.');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed.';
      setMessage(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const payload = new FormData();
    payload.append('photo', file);
    setIsUploadingPhoto(true);
    try {
      const res = await api.post('/auth/me/photo', payload);
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      setProfile({ ...emptyProfile, ...(updatedUser.profile || {}) });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Profile photo updated.');
      showToast('Profile photo updated successfully.');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile photo upload failed.';
      setMessage(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const startEditPost = (post) => {
    setEditingPostId(post._id);
    setPostDraft({
      description: post.description || '',
      location: post.location || '',
      state: post.state || '',
      city: post.city || '',
      price: post.price || '',
      startDate: post.startDate?.slice(0, 10) || '',
      endDate: post.endDate?.slice(0, 10) || '',
      imageFile: null,
    });
  };

  const savePost = async (postId) => {
    const payload = new FormData();
    ['description', 'location', 'state', 'city', 'price', 'startDate', 'endDate'].forEach((field) => {
      payload.append(field, postDraft[field] || '');
    });
    if (postDraft.imageFile) payload.append('image', postDraft.imageFile);

    await api.put(`/api/posts/${postId}`, payload);
    setEditingPostId('');
    setMessage('Ad updated. Title, category, email and mobile stay locked after posting.');
    loadProfile();
  };

  const deletePost = async (postId) => {
    if (!confirm('Delete this ad?')) return;
    await api.delete(`/api/posts/${postId}`);
    setMessage('Ad deleted.');
    loadProfile();
  };

  const deleteAccount = async () => {
    if (!confirm('Delete your account and all posted ads?')) return;
    await api.delete('/auth/me');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const photoUrl = resolveUploadUrl(profile.photo);
  const completedFields = ['fullName', 'contactNumber', 'whatsappNumber', 'country', 'state', 'city', 'location', 'bio', 'photo']
    .filter((field) => Boolean(profile[field]?.toString().trim())).length;
  const completionPercent = Math.round((completedFields / 9) * 100);
  const displayName = profile.fullName || user?.username || user?.email || user?.mobile || 'My profile';
  const displayLocation = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Location not added';

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <JobBoardNav />
      {toast && (
        <div className="fixed right-5 top-5 z-50 w-[calc(100%-2.5rem)] max-w-sm rounded-md border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 shadow-xl md:right-8 md:top-8">
          <div className="flex items-start gap-3">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <p>{toast.text}</p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-md bg-slate-950 text-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px] lg:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/10">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="m-auto mt-8 text-slate-300" size={38} />
                )}
                <label className="absolute inset-x-0 bottom-0 flex min-h-9 cursor-pointer items-center justify-center gap-1 bg-slate-900/85 px-2 py-2 text-xs font-bold transition hover:bg-slate-800">
                  {isUploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  {isUploadingPhoto ? 'Uploading' : 'Photo'}
                  <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" disabled={isUploadingPhoto} />
                </label>
              </div>
              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                  <ShieldCheck size={14} />
                  Account profile
                </div>
                <h1 className="break-words text-3xl font-semibold leading-tight md:text-4xl">{displayName}</h1>
                <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <Mail size={15} className="shrink-0 text-cyan-300" />
                    <span className="truncate">{user?.email || 'Email not added'}</span>
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <Phone size={15} className="shrink-0 text-emerald-300" />
                    <span className="truncate">{user?.mobile || profile.contactNumber || 'Mobile not added'}</span>
                  </span>
                  <span className="flex min-w-0 items-center gap-2 sm:col-span-2">
                    <MapPin size={15} className="shrink-0 text-amber-300" />
                    <span className="truncate">{displayLocation}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="grid gap-3 rounded-md border border-white/10 bg-white/5 p-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-200">Profile strength</span>
                  <span className="text-white">{completionPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-md bg-white/10">
                  <div className="h-full rounded-md bg-cyan-300 transition-all" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Briefcase size={14} />
                    Ads
                  </div>
                  <p className="mt-1 text-2xl font-semibold">{posts.length}</p>
                </div>
                <div className="rounded-md bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <CheckCircle2 size={14} />
                    Filled
                  </div>
                  <p className="mt-1 text-2xl font-semibold">{completedFields}/9</p>
                </div>
              </div>
              <button onClick={deleteAccount} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={saveProfile} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Profile Details</h2>
                <p className="mt-1 text-sm text-slate-500">Keep your contact and location information updated.</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <label className={labelClass}>Full name</label>
                <input className={inputClass} placeholder="Full name" value={profile.fullName} onChange={(e) => updateProfile('fullName', e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Contact number</label>
                  <input className={inputClass} placeholder="Contact number" value={profile.contactNumber} onChange={(e) => updateProfile('contactNumber', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>WhatsApp number</label>
                  <input className={inputClass} placeholder="WhatsApp number" value={profile.whatsappNumber} onChange={(e) => updateProfile('whatsappNumber', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Country</label>
                  <select className={inputClass} value={profile.country} onChange={(e) => updateProfile('country', e.target.value)}>
                    <option>India</option>
                    <option>Norway</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input className={inputClass} placeholder="State" value={profile.state} onChange={(e) => updateProfile('state', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} placeholder="City" value={profile.city} onChange={(e) => updateProfile('city', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Local area</label>
                <input className={inputClass} placeholder="Location" value={profile.location} onChange={(e) => updateProfile('location', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>About you</label>
                <textarea className={`${inputClass} min-h-28 resize-y`} placeholder="Write a short profile summary" value={profile.bio} onChange={(e) => updateProfile('bio', e.target.value)} />
              </div>
            </div>
            <button disabled={isSavingProfile} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500 sm:w-auto">
              {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">My Posted Ads</h2>
                <p className="mt-1 text-sm text-slate-500">Manage live listings from your profile.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                <Briefcase size={14} />
                {posts.length} ads
              </span>
            </div>
            <div className="space-y-4">
              {posts.map((post) => (
                <article key={post._id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-semibold">{post.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-700">{post.category}</span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-700">
                          <MapPin size={12} />
                          {post.city || post.state || post.country || 'Location'}
                        </span>
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">{post.adType || 'Standard'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" title="Edit ad" onClick={() => startEditPost(post)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-950">
                        <Edit3 size={16} />
                      </button>
                      <button type="button" title="Delete ad" onClick={() => deletePost(post._id)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:border-rose-500 hover:bg-rose-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {editingPostId === post._id ? (
                    <div className="mt-4 grid gap-3 rounded-md bg-slate-50 p-4 md:grid-cols-2">
                      <input className={inputClass} placeholder="Location" value={postDraft.location} onChange={(e) => setPostDraft((current) => ({ ...current, location: e.target.value }))} />
                      <input className={inputClass} placeholder="State" value={postDraft.state} onChange={(e) => setPostDraft((current) => ({ ...current, state: e.target.value }))} />
                      <input className={inputClass} placeholder="City" value={postDraft.city} onChange={(e) => setPostDraft((current) => ({ ...current, city: e.target.value }))} />
                      <input className={inputClass} type="number" placeholder="Price" value={postDraft.price} onChange={(e) => setPostDraft((current) => ({ ...current, price: e.target.value }))} />
                      <input className={inputClass} type="date" value={postDraft.startDate} onChange={(e) => setPostDraft((current) => ({ ...current, startDate: e.target.value }))} />
                      <input className={inputClass} type="date" value={postDraft.endDate} onChange={(e) => setPostDraft((current) => ({ ...current, endDate: e.target.value }))} />
                      <input className={`${inputClass} md:col-span-2`} type="file" accept="image/*" onChange={(e) => setPostDraft((current) => ({ ...current, imageFile: e.target.files?.[0] || null }))} />
                      <textarea className={`${inputClass} min-h-24 resize-y md:col-span-2`} value={postDraft.description} onChange={(e) => setPostDraft((current) => ({ ...current, description: e.target.value }))} />
                      <button type="button" onClick={() => savePost(post._id)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                        <Save size={16} />
                        Save Ad
                      </button>
                      <button type="button" onClick={() => setEditingPostId('')} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.description || 'No description added.'}</p>
                  )}
                </article>
              ))}

              {posts.length === 0 && (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Briefcase className="mx-auto text-slate-400" size={30} />
                  <p className="mt-3 text-sm font-semibold text-slate-700">No ads posted yet.</p>
                  <p className="mt-1 text-sm text-slate-500">Your active listings will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
