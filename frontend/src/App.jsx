import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard, UserPlus, Users, Search, Wallet, Activity, Eye,
  Check, CircleAlert, Menu, X, TrendingUp
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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
    <path d="M10 9.5v5l4.5-2.5z" fill="#141218" />
  </svg>
);

const InstagramGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const pageMeta = {
  overview: { title: 'Overview', sub: 'How your creator network looks today' },
  add: { title: 'Add creator', sub: 'Register a creator with their audience and collaboration terms' }
};

function App() {
  const [view, setView] = useState('overview');
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creators, setCreators] = useState([]);
  const [listLoading, setListLoading] = useState(true);
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
  const [now, setNow] = useState(() => new Date());
  const nameBoxRef = useRef(null);
  const lastFetchedLink = useRef('');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const loadCreators = async () => {
    try {
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

  // Suggest channels while typing a name/username in the YouTube field (debounced)
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

  // Auto-load channel stats when a YouTube link is entered
  useEffect(() => {
    const link = form.youtubeLink.trim();
    if (!form.channels.includes('youtube')) return;
    if (!isLinkLike(link)) return;
    if (link === lastFetchedLink.current) return;
    const timer = setTimeout(() => fetchYoutube(link), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.youtubeLink, form.channels]);

  useEffect(() => {
    const close = (e) => {
      if (nameBoxRef.current && !nameBoxRef.current.contains(e.target)) setHintsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (next) => {
    setView(next);
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  };

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
      // Only fill what is still empty so manual edits are never overwritten
      setForm(prev => ({
        ...prev,
        name: prev.name || channel.title,
        followers: prev.followers !== '' ? prev.followers : (channel.subscribers ?? ''),
        avgReelViews: prev.avgReelViews !== '' ? prev.avgReelViews : channel.avgViews,
        engagement: prev.engagement !== '' ? prev.engagement : channel.engagement,
        location: prev.location || (cities.includes(channel.country) ? channel.country : prev.location)
      }));
    } catch (error) {
      setYtError(error.message || 'Could not fetch this channel.');
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
      avgReelViews: ytChannel.avgViews,
      engagement: ytChannel.engagement
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
      setMessage({ type: 'error', text: 'Select at least one social channel.' });
      return;
    }
    if (form.channels.includes('youtube') && !form.youtubeLink.trim()) {
      setMessage({ type: 'error', text: 'Enter the YouTube profile link.' });
      return;
    }
    if (form.channels.includes('youtube') && !/^https?:\/\//i.test(form.youtubeLink.trim())) {
      setMessage({ type: 'error', text: 'Pick a channel from the suggestions or paste the full YouTube link.' });
      return;
    }
    if (form.channels.includes('instagram') && !form.instagramLink.trim()) {
      setMessage({ type: 'error', text: 'Enter the Instagram profile link.' });
      return;
    }
    if (!/^\d{7,15}$/.test(form.contact.replace(/[\s+()-]/g, ''))) {
      setMessage({ type: 'error', text: 'Enter a valid contact number.' });
      return;
    }
    if (!form.collaborationType) {
      setMessage({ type: 'error', text: 'Select a collaboration type.' });
      return;
    }
    if (form.collaborationType === 'paid' && (!form.collaborationPrice || Number(form.collaborationPrice) <= 0)) {
      setMessage({ type: 'error', text: 'Enter a valid collaboration price.' });
      return;
    }
    setLoading(true);
    try {
      const payload = form.channels.includes('youtube') && ytChannel
        ? { ...form, youtubeStats: ytChannel }
        : form;
      const result = await api.createInfluencer(payload);
      setMessage({ type: 'success', text: result.message || 'Creator saved.' });
      setForm(initialForm);
      setYtChannel(null);
      loadCreators();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Could not save the creator. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ---------- derived data ----------
  const stats = useMemo(() => {
    const total = creators.length;
    const reach = creators.reduce((s, c) => s + (Number(c.followers) || 0), 0);
    const avgEng = total ? creators.reduce((s, c) => s + (Number(c.engagement) || 0), 0) / total : 0;
    const paid = creators.filter(c => c.collaborationType === 'paid').length;
    const cats = {};
    creators.forEach(c => {
      const key = (c.category || 'Other').trim();
      cats[key] = (cats[key] || 0) + 1;
    });
    const topCategories = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, reach, avgEng, paid, unpaid: total - paid, topCategories };
  }, [creators]);

  const visibleCreators = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter(c =>
      [c.name, c.category, c.location].some(v => (v || '').toLowerCase().includes(q))
    );
  }, [creators, query]);

  const checklist = [
    { label: 'Name and channel', done: !!form.name.trim() && form.channels.length > 0 &&
      (!form.channels.includes('youtube') || !!form.youtubeLink.trim()) &&
      (!form.channels.includes('instagram') || !!form.instagramLink.trim()) },
    { label: 'Category and city', done: !!form.category.trim() && !!form.location },
    { label: 'Audience numbers', done: form.followers !== '' && form.avgReelViews !== '' && form.engagement !== '' },
    { label: 'Collaboration terms', done: !!form.collaborationType && (form.collaborationType !== 'paid' || Number(form.collaborationPrice) > 0) },
    { label: 'Contact details', done: !!form.contact.trim() && !!form.email.trim() }
  ];
  const doneCount = checklist.filter(c => c.done).length;
  const meta = pageMeta[view];

  const renderOverview = () => (
    <>
      <section className="kpi-strip" aria-label="Network summary">
        <div className="kpi">
          <span className="kpi-label"><Users size={15} /> Creators</span>
          <b>{listLoading ? '–' : stats.total}</b>
          <small>{stats.total === 1 ? '1 profile in your network' : `${stats.total} profiles in your network`}</small>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Eye size={15} /> Total reach</span>
          <b>{listLoading ? '–' : formatNumber(stats.reach)}</b>
          <small>Followers across all creators</small>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Activity size={15} /> Avg. engagement</span>
          <b>{listLoading ? '–' : `${stats.avgEng.toFixed(1)}%`}</b>
          <small>Mean of every creator’s rate</small>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Wallet size={15} /> Paid collabs</span>
          <b>{listLoading ? '–' : stats.paid}</b>
          <small>{stats.unpaid} open to barter or free</small>
        </div>
      </section>

      <div className="grid-main">
        <section className="panel table-panel">
          <header className="panel-head">
            <div>
              <h2>Creators</h2>
              <p>{query ? `${visibleCreators.length} of ${creators.length} match “${query}”` : 'Newest first'}</p>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => go('add')}>
              <UserPlus size={15} /> Add creator
            </button>
          </header>

          {listLoading ? (
            <div className="empty">Loading creators…</div>
          ) : creators.length === 0 ? (
            <div className="empty">
              <strong>No creators yet</strong>
              <p>Add your first creator to start building the network.</p>
              <button type="button" className="btn btn-primary" onClick={() => go('add')}>Add creator</button>
            </div>
          ) : visibleCreators.length === 0 ? (
            <div className="empty">
              <strong>No matches</strong>
              <p>Try a different name, category or city.</p>
            </div>
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
                  {visibleCreators.slice(0, 12).map(c => (
                    <tr key={c._id}>
                      <td>
                        <div className="who">
                          {c.youtubeStats?.thumbnail
                            ? <img src={c.youtubeStats.thumbnail} alt="" className="avatar" />
                            : <span className="avatar avatar-letter">{(c.name || '?').charAt(0).toUpperCase()}</span>}
                          <span>
                            <strong>{c.name}</strong>
                            <small>{[c.category, c.location].filter(Boolean).join(', ')}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="chan-icons">
                          {c.channels?.includes('youtube') && <span className="chan chan-yt" title="YouTube"><YouTubeGlyph /></span>}
                          {c.channels?.includes('instagram') && <span className="chan chan-ig" title="Instagram"><InstagramGlyph /></span>}
                        </div>
                      </td>
                      <td className="num">{formatNumber(c.followers)}</td>
                      <td className="num">{Number(c.engagement).toFixed(1)}%</td>
                      <td>
                        {c.collaborationType === 'paid'
                          ? <span className="tag tag-paid">Paid · {formatINR(c.collaborationPrice || 0)}</span>
                          : <span className="tag">Unpaid</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="side-stack">
          <section className="panel">
            <header className="panel-head"><div><h2>Collaboration mix</h2><p>Paid compared with unpaid</p></div></header>
            <div className="split-bar" role="img" aria-label={`${stats.paid} paid, ${stats.unpaid} unpaid`}>
              <i style={{ width: `${stats.total ? (stats.paid / stats.total) * 100 : 0}%` }}></i>
            </div>
            <div className="split-legend">
              <span><i className="dot dot-clay"></i>Paid <b>{stats.paid}</b></span>
              <span><i className="dot"></i>Unpaid <b>{stats.unpaid}</b></span>
            </div>
          </section>

          <section className="panel">
            <header className="panel-head"><div><h2>Top categories</h2><p>By number of creators</p></div></header>
            {stats.topCategories.length === 0 ? (
              <div className="empty empty-small">Categories show up once you add creators.</div>
            ) : (
              <ul className="bars">
                {stats.topCategories.map(([name, count]) => (
                  <li key={name}>
                    <span className="bar-name">{name}</span>
                    <span className="bar-track"><i style={{ width: `${(count / stats.topCategories[0][1]) * 100}%` }}></i></span>
                    <b>{count}</b>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );

  const renderAdd = () => (
    <div className="grid-form">
      <form id="creator-form" onSubmit={handleSubmit} className="form-col">
        <section className="panel">
          <header className="panel-head"><div><h2>Profile</h2><p>Who they are and where to find them</p></div></header>
          <div className="fields">
            <div className="field span-2">
              <label htmlFor="name">Full name <i>*</i></label>
              <input id="name" name="name" type="text" placeholder="Creator’s full name" value={form.name} onChange={updateField} autoComplete="off" required maxLength={100} />
            </div>

            <div className="field span-2">
              <label>Channels <i>*</i></label>
              <div className="choice-row">
                <label className={`choice ${form.channels.includes('youtube') ? 'selected' : ''}`}>
                  <input type="checkbox" checked={form.channels.includes('youtube')} onChange={() => toggleChannel('youtube')} />
                  <span className="choice-icon chan-yt"><YouTubeGlyph /></span>
                  <span className="choice-text"><strong>YouTube</strong><small>Video creator</small></span>
                  <span className="choice-check">{form.channels.includes('youtube') && <Check size={14} />}</span>
                </label>
                <label className={`choice ${form.channels.includes('instagram') ? 'selected' : ''}`}>
                  <input type="checkbox" checked={form.channels.includes('instagram')} onChange={() => toggleChannel('instagram')} />
                  <span className="choice-icon chan-ig"><InstagramGlyph /></span>
                  <span className="choice-text"><strong>Instagram</strong><small>Reels and posts</small></span>
                  <span className="choice-check">{form.channels.includes('instagram') && <Check size={14} />}</span>
                </label>
              </div>
            </div>

            {form.channels.includes('youtube') && (
              <div className="field span-2" ref={nameBoxRef}>
                <label htmlFor="youtubeLink">YouTube channel <i>*</i></label>
                <div className="input-icon">
                  <span className="chan-yt"><YouTubeGlyph /></span>
                  <input id="youtubeLink" name="youtubeLink" type="text" autoComplete="off" placeholder="Search a name or paste a channel link" value={form.youtubeLink} onChange={updateField} required />
                  {ytLoading && <span className="spinner spinner-field"></span>}
                </div>
                {hintsLoading && <span className="note">Searching…</span>}
                {hintsOpen && (
                  <div className="hint-menu" role="listbox">
                    {hintError && <div className="hint-note hint-note-error">YouTube suggestions unavailable: {hintError}</div>}
                    {!hintError && nameHints.youtube.length === 0 && nameHints.existing.length === 0 && (
                      <div className="hint-note">No matching channels. Keep typing or paste the channel link.</div>
                    )}
                    {nameHints.existing.length > 0 && (
                      <>
                        <div className="hint-title">Already in your network</div>
                        {nameHints.existing.map(item => (
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
                        {nameHints.youtube.map(item => (
                          <button type="button" key={item.channelId} className="hint-item" role="option" onClick={() => pickYoutubeHint(item)}>
                            {item.thumbnail ? <img src={item.thumbnail} alt="" className="avatar avatar-sm" /> : <span className="hint-dot"></span>}
                            <span className="hint-text">
                              <strong>{item.title}</strong>
                              <small>
                                {item.subscribers !== null && item.subscribers !== undefined ? `${formatNumber(item.subscribers)} subscribers` : 'YouTube channel'}
                                {item.description ? `, ${item.description}` : ''}
                              </small>
                            </span>
                            <span className="hint-pick">Use</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
                <small className="note">Stats load automatically once a channel is picked.</small>
                {ytError && <div className="alert alert-error" role="alert"><CircleAlert size={15} />{ytError}</div>}
              </div>
            )}

            {form.channels.includes('instagram') && (
              <div className="field span-2">
                <label htmlFor="instagramLink">Instagram profile <i>*</i></label>
                <div className="input-icon">
                  <span className="chan-ig"><InstagramGlyph /></span>
                  <input id="instagramLink" name="instagramLink" type="url" placeholder="https://instagram.com/username" value={form.instagramLink} onChange={updateField} required />
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="category">Category <i>*</i></label>
              <input id="category" name="category" type="text" placeholder="Fashion, tech, food…" value={form.category} onChange={updateField} required maxLength={100} />
            </div>
            <div className="field">
              <label htmlFor="location">City <i>*</i></label>
              <select id="location" name="location" value={form.location} onChange={updateField} required>
                <option value="">Select a city</option>
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="panel">
          <header className="panel-head"><div><h2>Audience</h2><p>Numbers brands will compare</p></div></header>
          <div className="fields fields-3">
            <div className="field">
              <label htmlFor="followers">Total followers <i>*</i></label>
              <input id="followers" name="followers" type="number" placeholder="150000" min="0" step="1" value={form.followers} onChange={updateField} required />
            </div>
            <div className="field">
              <label htmlFor="avgReelViews">Avg. reel views <i>*</i></label>
              <input id="avgReelViews" name="avgReelViews" type="number" placeholder="45000" min="0" step="1" value={form.avgReelViews} onChange={updateField} required />
            </div>
            <div className="field">
              <label htmlFor="engagement">Engagement rate <i>*</i></label>
              <div className="input-suffix">
                <input id="engagement" name="engagement" type="number" placeholder="4.5" min="0" max="100" step="0.01" value={form.engagement} onChange={updateField} required />
                <span>%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <header className="panel-head"><div><h2>Collaboration</h2><p>How this creator prefers to work</p></div></header>
          <div className="fields">
            <div className="field span-2">
              <label>Type <i>*</i></label>
              <div className="choice-row">
                <label className={`choice ${form.collaborationType === 'paid' ? 'selected' : ''}`}>
                  <input type="radio" name="collaborationType" value="paid" checked={form.collaborationType === 'paid'} onChange={updateField} />
                  <span className="choice-icon choice-icon-clay">₹</span>
                  <span className="choice-text"><strong>Paid</strong><small>Creator charges a fee</small></span>
                  <span className="choice-check">{form.collaborationType === 'paid' && <Check size={14} />}</span>
                </label>
                <label className={`choice ${form.collaborationType === 'unpaid' ? 'selected' : ''}`}>
                  <input type="radio" name="collaborationType" value="unpaid" checked={form.collaborationType === 'unpaid'} onChange={updateField} />
                  <span className="choice-icon"><Check size={14} /></span>
                  <span className="choice-text"><strong>Unpaid</strong><small>Barter or free promotion</small></span>
                  <span className="choice-check">{form.collaborationType === 'unpaid' && <Check size={14} />}</span>
                </label>
              </div>
            </div>
            {form.collaborationType === 'paid' && (
              <div className="field span-2">
                <label htmlFor="collaborationPrice">Price per collaboration <i>*</i></label>
                <div className="input-icon">
                  <span>₹</span>
                  <input id="collaborationPrice" name="collaborationPrice" type="number" placeholder="Expected fee in INR" min="1" step="1" value={form.collaborationPrice} onChange={updateField} required />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <header className="panel-head"><div><h2>Contact</h2><p>Where brands reach them</p></div></header>
          <div className="fields">
            <div className="field">
              <label htmlFor="contact">Phone number <i>*</i></label>
              <input id="contact" name="contact" type="tel" placeholder="98765 43210" value={form.contact} onChange={updateField} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email <i>*</i></label>
              <input id="email" name="email" type="email" placeholder="creator@email.com" value={form.email} onChange={updateField} required />
            </div>
            <div className="field span-2">
              <label htmlFor="managementAgency">Management agency <em>Optional</em></label>
              <input id="managementAgency" name="managementAgency" type="text" placeholder="Agency name" value={form.managementAgency} onChange={updateField} maxLength={150} />
            </div>
          </div>
        </section>
      </form>

      <aside className="rail">
        <section className="panel">
          <header className="panel-head"><div><h2>YouTube stats</h2><p>{ytChannel ? 'Fetched just now' : 'Appears after you pick a channel'}</p></div></header>
          {ytChannel ? (
            <div className="yt-preview">
              <div className="yt-head">
                {ytChannel.thumbnail && <img src={ytChannel.thumbnail} alt="" className="avatar" />}
                <span className="yt-title">
                  <strong>{ytChannel.title}</strong>
                  <small>{ytChannel.handle || ytChannel.channelId}</small>
                </span>
              </div>
              <div className="yt-stats">
                <div><b>{formatNumber(ytChannel.subscribers)}</b><span>Subscribers</span></div>
                <div><b>{formatNumber(ytChannel.totalViews)}</b><span>Total views</span></div>
                <div><b>{formatNumber(ytChannel.videoCount)}</b><span>Videos</span></div>
                <div><b>{formatNumber(ytChannel.avgViews)}</b><span>Avg. views</span></div>
                <div className="yt-wide"><b>{ytChannel.engagement}%</b><span>Engagement, last 10 videos</span></div>
              </div>
              <button type="button" className="btn btn-ghost btn-block" onClick={applyYoutubeStats}>Use these stats</button>
              {ytChannel.recentVideos?.length > 0 && (
                <div className="yt-videos">
                  {ytChannel.recentVideos.slice(0, 4).map(v => (
                    <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" className="yt-video">
                      {v.thumbnail && <img src={v.thumbnail} alt="" />}
                      <span>{v.title}</span>
                      <small>{formatNumber(v.views)} views</small>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="empty empty-small">
              {form.channels.includes('youtube')
                ? 'Search for the channel in the YouTube field to load subscribers, views and engagement.'
                : 'Select YouTube as a channel to load live stats.'}
            </div>
          )}
        </section>

        <section className="panel">
          <header className="panel-head"><div><h2>Ready to save</h2><p>{doneCount} of {checklist.length} sections complete</p></div></header>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={doneCount}>
            <i style={{ width: `${(doneCount / checklist.length) * 100}%` }}></i>
          </div>
          <ul className="checklist">
            {checklist.map(item => (
              <li key={item.label} className={item.done ? 'done' : ''}>
                <span className="check-dot">{item.done && <Check size={11} />}</span>{item.label}
              </li>
            ))}
          </ul>
          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-ok' : 'alert-error'}`} role="alert">
              {message.type === 'success' ? <Check size={15} /> : <CircleAlert size={15} />}
              {message.text}
            </div>
          )}
          <button type="submit" form="creator-form" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <><span className="spinner"></span> Saving…</> : 'Save creator'}
          </button>
          <p className="fine">Fields marked * are required.</p>
        </section>
      </aside>
    </div>
  );

  return (
    <div className="dash">
      <div className={`scrim ${navOpen ? 'open' : ''}`} onClick={() => setNavOpen(false)}></div>
      <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <a href="/" className="brand">
            <img src={logo} alt="" className="brand-logo" />
            <span>Collably</span>
          </a>
          <button type="button" className="icon-btn only-mobile" onClick={() => setNavOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="nav" aria-label="Main">
          <button type="button" className={view === 'overview' ? 'active' : ''} onClick={() => go('overview')}>
            <LayoutDashboard size={17} /> Overview
          </button>
          <button type="button" className={view === 'add' ? 'active' : ''} onClick={() => go('add')}>
            <UserPlus size={17} /> Add creator
          </button>
        </nav>
        <div className="sidebar-foot">
          <div className="foot-card">
            <TrendingUp size={16} />
            <p>Pick a YouTube channel and its subscribers, views and engagement fill in for you.</p>
          </div>
          <span className="copyright">© {new Date().getFullYear()} Collably</span>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button type="button" className="icon-btn only-mobile" onClick={() => setNavOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
          <div className="page-title">
            <h1>{meta.title}</h1>
            <p>{meta.sub}</p>
          </div>
          <div className="topbar-tools">
            {view === 'overview' && (
              <label className="search">
                <Search size={15} />
                <input type="search" placeholder="Search name, category, city" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
            )}
            <span className="chip chip-live"><i className="live-dot"></i>Live</span>
            <span className="chip hide-sm">
              {now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
              {', '}
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </header>
        <main className="content">
          {view === 'overview' ? renderOverview() : renderAdd()}
        </main>
      </div>
    </div>
  );
}

export default App;
