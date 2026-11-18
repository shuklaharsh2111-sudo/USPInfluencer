import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check, CircleAlert, Sparkles, Send, CheckCircle2, RotateCcw,
  Users, Eye, Activity, Wallet, Search, ArrowLeft, ArrowRight
} from 'lucide-react';
import api from './services/api';
import logo from './assets/collably-logo.png';
import './App.css';

const cities = [
  'Mumbai', 'Delhi', 'New Delhi', 'Bengaluru', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur',
  'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
  'Bhopal', 'Patna', 'Vadodara', 'Ludhiana', 'Agra',
  'Nashik', 'Rajkot', 'Varanasi', 'Meerut', 'Faridabad',
  'Ghaziabad', 'Noida', 'Gurugram', 'Thane', 'Navi Mumbai',
  'Aurangabad', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur',
  'Amritsar', 'Jalandhar', 'Chandigarh', 'Dehradun', 'Haridwar',
  'Rishikesh', 'Srinagar', 'Jammu', 'Shimla', 'Manali',
  'Guwahati', 'Shillong', 'Imphal', 'Aizawl', 'Agartala',
  'Gangtok', 'Kohima', 'Itanagar', 'Bhubaneswar', 'Cuttack',
  'Rourkela', 'Ranchi', 'Jamshedpur', 'Dhanbad', 'Raipur',
  'Bilaspur', 'Panaji', 'Margao', 'Mysuru', 'Mangaluru',
  'Hubballi', 'Belagavi', 'Vijayawada', 'Visakhapatnam',
  'Guntur', 'Tirupati', 'Warangal', 'Nizamabad', 'Kochi',
  'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam',
  'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi',
  'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa',
  'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner',
  'Alwar', 'Sikar', 'Gandhinagar', 'Anand', 'Bhavnagar',
  'Jamnagar', 'Junagadh', 'Morbi', 'Vapi', 'Valsad',
  'Prayagraj', 'Gorakhpur', 'Bareilly', 'Aligarh', 'Jhansi',
  'Moradabad', 'Muzaffarnagar', 'Mathura', 'Ayodhya',
  'Panipat', 'Karnal', 'Hisar', 'Rohtak', 'Ambala',
  'Sonipat', 'Yamunanagar', 'Kurukshetra', 'Kharagpur',
  'Durgapur', 'Asansol', 'Siliguri', 'Howrah', 'Berhampore',
  'Darbhanga', 'Muzaffarpur', 'Gaya', 'Bhagalpur',
  'Purnia', 'Saharsa', 'Bokaro', 'Hazaribagh', 'Deoghar',
  'Dibrugarh', 'Jorhat', 'Silchar', 'Tinsukia',
  'Other'
].sort((a, b) => a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b));

const initialForm = {
  name: '',
  channels: [],
  youtubeLink: '',
  instagramLink: '',
  category: '',
  location: '',
  followers: '',
  avgReelViews: '',
  engagement: '',
  contact: '',
  email: '',
  collaborationType: '',
  collaborationPrice: '',
  managementAgency: ''
};

const isLinkLike = (value) =>
  /(youtube\.com\/(@|channel\/|user\/|c\/))|^@[\w.-]+$|^UC[\w-]{22}$/i.test(value.trim());

const formatNumber = (n) =>
  n === null || n === undefined
    ? 'Hidden'
    : new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const YouTubeGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
    <path d="M10 9.5v5l4.5-2.5z" fill="#141218" />
  </svg>
);

const InstagramGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

function App() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [ytChannel, setYtChannel] = useState(null);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState('');
  const [nameHints, setNameHints] = useState({ youtube: [], existing: [] });
  const [hintsOpen, setHintsOpen] = useState(false);
  const [hintsLoading, setHintsLoading] = useState(false);
  const [hintError, setHintError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Optional database / submissions view (kept accessible via toggle)
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [creators, setCreators] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [query, setQuery] = useState('');

  const nameBoxRef = useRef(null);
  const lastFetchedLink = useRef('');

  const loadCreators = async () => {
    try {
      setListLoading(true);
      const data = await api.getInfluencers();
      setCreators(Array.isArray(data.influencers) ? data.influencers : []);
    } catch {
      setCreators([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadCreators();
  }, []);

  // Debounced channel search while typing in YouTube field
  useEffect(() => {
    const q = form.youtubeLink.trim();
    if (!form.channels.includes('youtube') || q.length < 3 || isLinkLike(q)) {
      setNameHints({ youtube: [], existing: [] });
      setHintError('');
      setHintsLoading(false);
      setHintsOpen(false);
      return;
    }
    let cancelled = false;
    setHintsLoading(true);
    const timer = setTimeout(async () => {
      const [yt, ex] = await Promise.allSettled([api.searchYoutube(q), api.suggestInfluencers(q)]);
      if (cancelled) return;
      setHintError(yt.status === 'rejected' ? (yt.reason?.message || 'YouTube search failed.') : '');
      setNameHints({
        youtube: yt.status === 'fulfilled' ? yt.value.results : [],
        existing: ex.status === 'fulfilled' ? ex.value.results : []
      });
      setHintsLoading(false);
      setHintsOpen(true);
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.youtubeLink, form.channels]);

  // Auto-fetch channel stats on valid URL entry
  useEffect(() => {
    const link = form.youtubeLink.trim();
    if (!form.channels.includes('youtube')) return;
    if (!isLinkLike(link)) return;
    if (link === lastFetchedLink.current) return;
    const timer = setTimeout(() => fetchYoutube(link), 700);
    return () => clearTimeout(timer);
  }, [form.youtubeLink, form.channels]);

  useEffect(() => {
    const close = (e) => {
      if (nameBoxRef.current && !nameBoxRef.current.contains(e.target)) setHintsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'youtubeLink') {
      setYtChannel(null);
      setYtError('');
      lastFetchedLink.current = '';
    }
  };

  const fetchYoutube = async (urlOverride) => {
    const link = (typeof urlOverride === 'string' ? urlOverride : form.youtubeLink).trim();
    if (!link) {
      setYtError('Paste a YouTube channel link first.');
      return;
    }
    lastFetchedLink.current = link;
    setYtLoading(true);
    setYtError('');
    setYtChannel(null);
    try {
      const { channel } = await api.getYoutubeChannel(link);
      setYtChannel(channel);
      // Auto-fill empty fields
      setForm(prev => ({
        ...prev,
        name: prev.name || channel.title,
        followers: prev.followers !== '' ? prev.followers : (channel.subscribers ?? ''),
        avgReelViews: prev.avgReelViews !== '' ? prev.avgReelViews : channel.avgViews,
        engagement: prev.engagement !== '' ? prev.engagement : channel.engagement,
        location: prev.location || (cities.includes(channel.country) ? channel.country : prev.location)
      }));
    } catch (error) {
      setYtError(error.message || 'Could not fetch this YouTube channel.');
    } finally {
      setYtLoading(false);
    }
  };

  const pickYoutubeHint = (hint) => {
    const url = `https://www.youtube.com/channel/${hint.channelId}`;
    setHintsOpen(false);
    setForm(prev => ({
      ...prev,
      name: prev.name || hint.title,
      youtubeLink: url,
      channels: prev.channels.includes('youtube') ? prev.channels : [...prev.channels, 'youtube']
    }));
    fetchYoutube(url);
  };

  const applyYoutubeStats = () => {
    if (!ytChannel) return;
    setForm(prev => ({
      ...prev,
      followers: ytChannel.subscribers ?? prev.followers,
      avgReelViews: ytChannel.avgViews ?? prev.avgReelViews,
      engagement: ytChannel.engagement ?? prev.engagement
    }));
  };

  const toggleChannel = (channel) => {
    if (channel === 'youtube') {
      setYtChannel(null);
      setYtError('');
      lastFetchedLink.current = '';
    }
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(item => item !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (form.channels.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one social channel.' });
      return;
    }
    if (form.channels.includes('youtube') && !form.youtubeLink.trim()) {
      setMessage({ type: 'error', text: 'Enter your YouTube channel link or search name.' });
      return;
    }
    if (form.channels.includes('youtube') && !/^https?:\/\//i.test(form.youtubeLink.trim())) {
      setMessage({ type: 'error', text: 'Pick a channel from suggestions or paste the full YouTube channel link.' });
      return;
    }
    if (form.channels.includes('instagram') && !form.instagramLink.trim()) {
      setMessage({ type: 'error', text: 'Enter your Instagram profile link.' });
      return;
    }
    if (!/^\d{7,15}$/.test(form.contact.replace(/[\s+()-]/g, ''))) {
      setMessage({ type: 'error', text: 'Enter a valid contact number (7 to 15 digits).' });
      return;
    }
    if (!form.collaborationType) {
      setMessage({ type: 'error', text: 'Select a collaboration type (Paid or Unpaid).' });
      return;
    }
    if (form.collaborationType === 'paid' && (!form.collaborationPrice || Number(form.collaborationPrice) <= 0)) {
      setMessage({ type: 'error', text: 'Enter a valid collaboration price in INR.' });
      return;
    }

    setLoading(true);
    try {
      const payload = form.channels.includes('youtube') && ytChannel
        ? { ...form, youtubeStats: ytChannel }
        : form;
      const result = await api.createInfluencer(payload);
      setSubmittedData({ ...payload });
      setIsSubmitted(true);
      setMessage({ type: 'success', text: result.message || 'Form submitted successfully!' });
      setForm(initialForm);
      setYtChannel(null);
      loadCreators();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Could not submit the form. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const visibleCreators = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter(c =>
      [c.name, c.category, c.location].some(v => (v || '').toLowerCase().includes(q))
    );
  }, [creators, query]);

  return (
    <div className="form-dash">
      <div className="form-container">
        {/* Brand & Header */}
        <header className="form-header">
          <div className="form-brand">
            <img src={logo} alt="Collably" className="form-brand-logo" />
            <span className="form-brand-name">Collably</span>
          </div>
          <h1>Creator Registration Form</h1>
          <p>
            Join our creator collaboration network. Share your channel links, audience reach,
            and collaboration terms.
          </p>
        </header>

        {showSubmissions ? (
          /* Submissions List View (toggleable) */
          <div className="submissions-wrapper">
            <div className="submissions-head">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowSubmissions(false)}
              >
                <ArrowLeft size={15} /> Back to Form
              </button>
              <div className="search">
                <Search size={15} />
                <input
                  type="search"
                  placeholder="Search name, category, city..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="panel table-panel">
              <div className="panel-head">
                <div>
                  <h2>Registered Creators ({creators.length})</h2>
                  <p>All creator profiles saved in the database</p>
                </div>
              </div>

              {listLoading ? (
                <div className="empty">Loading creators…</div>
              ) : visibleCreators.length === 0 ? (
                <div className="empty">No creators found.</div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Creator</th>
                        <th>Channels</th>
                        <th className="num">Followers</th>
                        <th className="num">Engagement</th>
                        <th>Collaboration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCreators.map((c) => (
                        <tr key={c._id || c.name + Math.random()}>
                          <td>
                            <div className="who">
                              {c.youtubeStats?.thumbnail ? (
                                <img src={c.youtubeStats.thumbnail} alt="" className="avatar" />
                              ) : (
                                <span className="avatar avatar-letter">
                                  {(c.name || '?').charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span>
                                <strong>{c.name}</strong>
                                <small>{[c.category, c.location].filter(Boolean).join(', ')}</small>
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="chan-icons">
                              {c.channels?.includes('youtube') && (
                                <span className="chan chan-yt" title="YouTube"><YouTubeGlyph /></span>
                              )}
                              {c.channels?.includes('instagram') && (
                                <span className="chan chan-ig" title="Instagram"><InstagramGlyph /></span>
                              )}
                            </div>
                          </td>
                          <td className="num">{formatNumber(c.followers)}</td>
                          <td className="num">{Number(c.engagement).toFixed(1)}%</td>
                          <td>
                            {c.collaborationType === 'paid' ? (
                              <span className="tag tag-paid">
                                Paid · {formatINR(c.collaborationPrice || 0)}
                              </span>
                            ) : (
                              <span className="tag">Unpaid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : isSubmitted ? (
          /* Success Screen */
          <div className="form-card form-success">
            <div className="success-icon">
              <CheckCircle2 size={36} />
            </div>
            <h2>Form Submitted Successfully!</h2>
            <p>
              Thank you, <strong>{submittedData?.name}</strong>! Your creator profile has been
              registered in our database.
            </p>

            <div className="success-summary">
              <div className="summary-row">
                <span>Creator Name:</span>
                <span>{submittedData?.name}</span>
              </div>
              <div className="summary-row">
                <span>Category & City:</span>
                <span>{[submittedData?.category, submittedData?.location].filter(Boolean).join(', ')}</span>
              </div>
              <div className="summary-row">
                <span>Followers:</span>
                <span>{formatNumber(submittedData?.followers)}</span>
              </div>
              <div className="summary-row">
                <span>Collaboration:</span>
                <span>
                  {submittedData?.collaborationType === 'paid'
                    ? `Paid (${formatINR(submittedData?.collaborationPrice || 0)})`
                    : 'Unpaid / Barter'}
                </span>
              </div>
              <div className="summary-row">
                <span>Contact Email:</span>
                <span>{submittedData?.email}</span>
              </div>
            </div>

            <div className="success-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmittedData(null);
                  setMessage({ type: '', text: '' });
                }}
              >
                <RotateCcw size={15} /> Submit Another Response
              </button>
            </div>
          </div>
        ) : (
          /* The Form */
          <form id="creator-main-form" onSubmit={handleSubmit} className="form-body">
            {/* 1. Profile Section */}
            <section className="form-card">
              <div className="form-section-title">
                <span className="section-badge">1</span>
                <div>
                  <h2>Basic Profile</h2>
                  <p>Tell us who you are and where you are based</p>
                </div>
              </div>

              <div className="fields">
                <div className="field span-2">
                  <label htmlFor="name">Full name <i>*</i></label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={updateField}
                    autoComplete="off"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="field">
                  <label htmlFor="category">Category <i>*</i></label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    placeholder="Fashion, Tech, Food, Gaming…"
                    value={form.category}
                    onChange={updateField}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="field">
                  <label htmlFor="location">City <i>*</i></label>
                  <select
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    required
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Social Channels Section */}
            <section className="form-card">
              <div className="form-section-title">
                <span className="section-badge">2</span>
                <div>
                  <h2>Social Channels</h2>
                  <p>Select your active platforms and link your handles</p>
                </div>
              </div>

              <div className="fields">
                <div className="field span-2">
                  <label>Channels <i>*</i></label>
                  <div className="choice-row">
                    <label className={`choice ${form.channels.includes('youtube') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.channels.includes('youtube')}
                        onChange={() => toggleChannel('youtube')}
                      />
                      <span className="choice-icon chan-yt"><YouTubeGlyph /></span>
                      <span className="choice-text">
                        <strong>YouTube</strong>
                        <small>Long & short-form video creator</small>
                      </span>
                      <span className="choice-check">
                        {form.channels.includes('youtube') && <Check size={14} />}
                      </span>
                    </label>

                    <label className={`choice ${form.channels.includes('instagram') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.channels.includes('instagram')}
                        onChange={() => toggleChannel('instagram')}
                      />
                      <span className="choice-icon chan-ig"><InstagramGlyph /></span>
                      <span className="choice-text">
                        <strong>Instagram</strong>
                        <small>Reels, posts & stories</small>
                      </span>
                      <span className="choice-check">
                        {form.channels.includes('instagram') && <Check size={14} />}
                      </span>
                    </label>
                  </div>
                </div>

                {form.channels.includes('youtube') && (
                  <div className="field span-2" ref={nameBoxRef}>
                    <label htmlFor="youtubeLink">YouTube channel link or name <i>*</i></label>
                    <div className="input-icon">
                      <span className="chan-yt"><YouTubeGlyph /></span>
                      <input
                        id="youtubeLink"
                        name="youtubeLink"
                        type="text"
                        autoComplete="off"
                        placeholder="Search channel name or paste URL (e.g. youtube.com/@handle)"
                        value={form.youtubeLink}
                        onChange={updateField}
                        required
                      />
                      {ytLoading && <span className="spinner spinner-field"></span>}
                    </div>

                    {hintsLoading && <span className="note">Searching YouTube channels…</span>}

                    {hintsOpen && (
                      <div className="hint-menu" role="listbox">
                        {hintError && (
                          <div className="hint-note hint-note-error">
                            Suggestions unavailable: {hintError}
                          </div>
                        )}
                        {!hintError && nameHints.youtube.length === 0 && nameHints.existing.length === 0 && (
                          <div className="hint-note">
                            No channels found. Keep typing or paste full channel URL.
                          </div>
                        )}
                        {nameHints.existing.length > 0 && (
                          <>
                            <div className="hint-title">Already in network</div>
                            {nameHints.existing.map((item) => (
                              <div key={item._id} className="hint-item hint-existing">
                                <span className="hint-dot"></span>
                                <span className="hint-text">
                                  <strong>{item.name}</strong>
                                  <small>{[item.category, item.location].filter(Boolean).join(', ')}</small>
                                </span>
                              </div>
                            ))}
                          </>
                        )}
                        {nameHints.youtube.length > 0 && (
                          <>
                            <div className="hint-title">YouTube channels</div>
                            {nameHints.youtube.map((item) => (
                              <button
                                type="button"
                                key={item.channelId}
                                className="hint-item"
                                role="option"
                                onClick={() => pickYoutubeHint(item)}
                              >
                                {item.thumbnail ? (
                                  <img src={item.thumbnail} alt="" className="avatar avatar-sm" />
                                ) : (
                                  <span className="hint-dot"></span>
                                )}
                                <span className="hint-text">
                                  <strong>{item.title}</strong>
                                  <small>
                                    {item.subscribers !== null && item.subscribers !== undefined
                                      ? `${formatNumber(item.subscribers)} subscribers`
                                      : 'YouTube channel'}
                                  </small>
                                </span>
                                <span className="hint-pick">Select</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    {ytError && (
                      <div className="alert alert-error" role="alert">
                        <CircleAlert size={15} />
                        {ytError}
                      </div>
                    )}

                    {/* Inline YouTube channel preview with one-click stats autofill */}
                    {ytChannel && (
                      <div className="yt-form-preview">
                        <div className="yt-head">
                          {ytChannel.thumbnail && (
                            <img src={ytChannel.thumbnail} alt="" className="avatar" />
                          )}
                          <div className="yt-title">
                            <strong>{ytChannel.title}</strong>
                            <small>{ytChannel.handle || ytChannel.channelId}</small>
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm yt-fill-btn"
                            onClick={applyYoutubeStats}
                            title="Auto-fill numbers into the Audience section"
                          >
                            <Sparkles size={14} /> Auto-fill Audience Stats
                          </button>
                        </div>
                        <div className="yt-stats">
                          <div>
                            <b>{formatNumber(ytChannel.subscribers)}</b>
                            <span>Subscribers</span>
                          </div>
                          <div>
                            <b>{formatNumber(ytChannel.totalViews)}</b>
                            <span>Total views</span>
                          </div>
                          <div>
                            <b>{formatNumber(ytChannel.videoCount)}</b>
                            <span>Videos</span>
                          </div>
                          <div>
                            <b>{formatNumber(ytChannel.avgViews)}</b>
                            <span>Avg. views</span>
                          </div>
                          <div className="yt-wide">
                            <b>{ytChannel.engagement}%</b>
                            <span>Engagement rate (last 10 videos)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {form.channels.includes('instagram') && (
                  <div className="field span-2">
                    <label htmlFor="instagramLink">Instagram profile link <i>*</i></label>
                    <div className="input-icon">
                      <span className="chan-ig"><InstagramGlyph /></span>
                      <input
                        id="instagramLink"
                        name="instagramLink"
                        type="url"
                        placeholder="https://instagram.com/yourhandle"
                        value={form.instagramLink}
                        onChange={updateField}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Audience Section */}
            <section className="form-card">
              <div className="form-section-title">
                <span className="section-badge">3</span>
                <div>
                  <h2>Audience & Metrics</h2>
                  <p>Your reach and engagement metrics</p>
                </div>
              </div>

              <div className="fields fields-3">
                <div className="field">
                  <label htmlFor="followers">Total followers / subscribers <i>*</i></label>
                  <input
                    id="followers"
                    name="followers"
                    type="number"
                    placeholder="e.g. 150000"
                    min="0"
                    step="1"
                    value={form.followers}
                    onChange={updateField}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="avgReelViews">Avg. views per video/reel <i>*</i></label>
                  <input
                    id="avgReelViews"
                    name="avgReelViews"
                    type="number"
                    placeholder="e.g. 45000"
                    min="0"
                    step="1"
                    value={form.avgReelViews}
                    onChange={updateField}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="engagement">Engagement rate <i>*</i></label>
                  <div className="input-suffix">
                    <input
                      id="engagement"
                      name="engagement"
                      type="number"
                      placeholder="e.g. 4.5"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.engagement}
                      onChange={updateField}
                      required
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Collaboration Section */}
            <section className="form-card">
              <div className="form-section-title">
                <span className="section-badge">4</span>
                <div>
                  <h2>Collaboration Preferences</h2>
                  <p>How you prefer to collaborate with brands</p>
                </div>
              </div>

              <div className="fields">
                <div className="field span-2">
                  <label>Collaboration type <i>*</i></label>
                  <div className="choice-row">
                    <label className={`choice ${form.collaborationType === 'paid' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="collaborationType"
                        value="paid"
                        checked={form.collaborationType === 'paid'}
                        onChange={updateField}
                      />
                      <span className="choice-icon choice-icon-clay">₹</span>
                      <span className="choice-text">
                        <strong>Paid Collaboration</strong>
                        <small>Charge fixed/custom fee per campaign</small>
                      </span>
                      <span className="choice-check">
                        {form.collaborationType === 'paid' && <Check size={14} />}
                      </span>
                    </label>

                    <label className={`choice ${form.collaborationType === 'unpaid' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="collaborationType"
                        value="unpaid"
                        checked={form.collaborationType === 'unpaid'}
                        onChange={updateField}
                      />
                      <span className="choice-icon"><Check size={14} /></span>
                      <span className="choice-text">
                        <strong>Unpaid / Barter</strong>
                        <small>Open to product gifts or barter deals</small>
                      </span>
                      <span className="choice-check">
                        {form.collaborationType === 'unpaid' && <Check size={14} />}
                      </span>
                    </label>
                  </div>
                </div>

                {form.collaborationType === 'paid' && (
                  <div className="field span-2">
                    <label htmlFor="collaborationPrice">Fee per collaboration (₹ INR) <i>*</i></label>
                    <div className="input-icon">
                      <span>₹</span>
                      <input
                        id="collaborationPrice"
                        name="collaborationPrice"
                        type="number"
                        placeholder="Expected fee in INR (e.g. 25000)"
                        min="1"
                        step="1"
                        value={form.collaborationPrice}
                        onChange={updateField}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 5. Contact Section */}
            <section className="form-card">
              <div className="form-section-title">
                <span className="section-badge">5</span>
                <div>
                  <h2>Contact Information</h2>
                  <p>Where brands can get in touch with you</p>
                </div>
              </div>

              <div className="fields">
                <div className="field">
                  <label htmlFor="contact">Phone number <i>*</i></label>
                  <input
                    id="contact"
                    name="contact"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.contact}
                    onChange={updateField}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email address <i>*</i></label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="creator@example.com"
                    value={form.email}
                    onChange={updateField}
                    required
                  />
                </div>

                <div className="field span-2">
                  <label htmlFor="managementAgency">
                    Management agency <em>Optional</em>
                  </label>
                  <input
                    id="managementAgency"
                    name="managementAgency"
                    type="text"
                    placeholder="Leave blank if self-managed"
                    value={form.managementAgency}
                    onChange={updateField}
                    maxLength={150}
                  />
                </div>
              </div>
            </section>

            {/* Error or validation alert */}
            {message.text && (
              <div
                className={`alert ${message.type === 'success' ? 'alert-ok' : 'alert-error'}`}
                role="alert"
              >
                {message.type === 'success' ? <Check size={16} /> : <CircleAlert size={16} />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="form-submit-row">
              <button
                type="submit"
                className="btn btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> Submitting…
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit Form
                  </>
                )}
              </button>
              <p className="form-footnote">
                Fields marked <i>*</i> are required. By submitting, your details will be registered.
              </p>
            </div>
          </form>
        )}

        {/* Subtle footer with link to view submissions database if needed */}
        <footer className="form-footer">
          <span>Collably &copy; {new Date().getFullYear()}</span>
          <span className="footer-sep">&bull;</span>
          <button
            type="button"
            className="footer-link"
            onClick={() => setShowSubmissions(prev => !prev)}
          >
            {showSubmissions ? 'Return to Form' : `View Network Submissions (${creators.length})`}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;
