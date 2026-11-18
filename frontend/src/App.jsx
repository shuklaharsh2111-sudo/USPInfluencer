
import { useEffect, useRef, useState } from 'react';
import { useState } from 'react';
import api from './services/api';
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
  const nameBoxRef = useRef(null);
  const lastFetchedLink = useRef('');

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

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'youtubeLink') {
      setYtChannel(null);
      setYtError('');
      lastFetchedLink.current = '';
    }
  };

  const formatNumber = (n) => (n === null || n === undefined ? 'Hidden' : new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n));

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
      setMessage({ type: 'error', text: 'Please select at least one social channel.' });
      return;
    }
    if (form.channels.includes('youtube') && !form.youtubeLink.trim()) {
      setMessage({ type: 'error', text: 'Please enter the YouTube profile link.' });
      return;
    }

    if (form.channels.includes('youtube') && !/^https?:\/\//i.test(form.youtubeLink.trim())) {
      setMessage({ type: 'error', text: 'Pick a channel from the suggestions or paste the full YouTube link.' });
      return;
    }

    if (form.channels.includes('instagram') && !form.instagramLink.trim()) {
      setMessage({ type: 'error', text: 'Please enter the Instagram profile link.' });
      return;
    }
    if (!/^\d{7,15}$/.test(form.contact.replace(/[\s+()-]/g, ''))) {
      setMessage({ type: 'error', text: 'Please enter a valid contact number.' });
      return;
    }
    if (!form.collaborationType) {
      setMessage({ type: 'error', text: 'Please select a collaboration type.' });
      return;
    }
    if (form.collaborationType === 'paid' && (!form.collaborationPrice || Number(form.collaborationPrice) <= 0)) {
      setMessage({ type: 'error', text: 'Please enter a valid collaboration price.' });
      return;
    }
    setLoading(true);
    try {
      const payload = form.channels.includes('youtube') && ytChannel
        ? { ...form, youtubeStats: ytChannel }
        : form;
      const result = await api.createInfluencer(payload);
      setMessage({ type: 'success', text: result.message || 'Influencer registered successfully!' });
      setForm(initialForm);
      setYtChannel(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="app-shell">
      <div className="ambient ambient-purple"></div>
      <div className="ambient ambient-orange"></div>
      <div className="ambient ambient-purple-two"></div>
      <div className="ambient ambient-orange-two"></div>
      <header className="topbar">
        <a href="/" className="brand">
          <span className="brand-icon">C</span>
          <span>CREATOR<span className="brand-accent">HUB</span></span>
        </a>
        <div className="topbar-right">
          <span className="live-dot"></span>
          <span>CREATOR DATABASE</span>
        </div>
      </header>
      <section className="hero-section">
        <div className="hero-tag">
          <span className="hero-tag-icon">✳</span>
          INFLUENCER NETWORK
        </div>
        <h1>Build Your <span>Creator</span><br />Network.</h1>
        <p className="hero-description">
          Bring creators into your network. Add their social profiles,
          audience insights and collaboration details in one place.
        </p>
      </section>
      <section className="form-section">
        <div className="form-card">
          <div className="form-heading">
            <div>
              <div className="section-eyebrow">NEW REGISTRATION</div>
              <h2>Influencer Details</h2>
              <p>Fill in the information below to register a creator.</p>
            </div>
            <div className="form-number">01 <span>/ 01</span></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name <span>*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter influencer's full name"
                value={form.name}
                onChange={updateField}
                autoComplete="off"
                required
                maxLength={100}
              />
              <input id="name" name="name" type="text" placeholder="Enter influencer's full name" value={form.name} onChange={updateField} required maxLength={100} />
            </div>
            <div className="form-group">
              <label>Social Media Channels <span>*</span></label>
              <p className="field-hint">Select one or both platforms.</p>
              <div className="channel-options">
                <label className={`channel-card youtube-card ${form.channels.includes('youtube') ? 'selected' : ''}`}>
                  <input type="checkbox" checked={form.channels.includes('youtube')} onChange={() => toggleChannel('youtube')} />
                  <span className="channel-symbol youtube-symbol">▶</span>
                  <span className="channel-info"><strong>YouTube</strong><small>Video creator</small></span>
                  <span className="channel-check">{form.channels.includes('youtube') ? '✓' : '+'}</span>
                </label>
                <label className={`channel-card instagram-card ${form.channels.includes('instagram') ? 'selected' : ''}`}>
                  <input type="checkbox" checked={form.channels.includes('instagram')} onChange={() => toggleChannel('instagram')} />
                  <span className="channel-symbol instagram-symbol">◎</span>
                  <span className="channel-info"><strong>Instagram</strong><small>Social creator</small></span>
                  <span className="channel-check">{form.channels.includes('instagram') ? '✓' : '+'}</span>
                </label>
              </div>
            </div>
            {form.channels.includes('youtube') && (
              <div className="form-group conditional-field name-field" ref={nameBoxRef}>
                <label htmlFor="youtubeLink">YouTube Profile Link <span>*</span></label>
                <div className="input-with-icon">
                  <span>▶</span>
                  <input
                    id="youtubeLink"
                    name="youtubeLink"
                    type="text"
                    autoComplete="off"
                    placeholder="Type a channel name, or paste a link (youtube.com/@username)"
                    value={form.youtubeLink}
                    onChange={updateField}
                    required
                  />
                  {ytLoading && <span className="button-spinner small link-spinner"></span>}
                </div>
                {hintsLoading && <span className="hint-loading">Searching…</span>}
              {hintsOpen && (
                <div className="hint-menu" role="listbox">
                  {hintError && (
                    <div className="hint-note hint-note-error">YouTube suggestions unavailable: {hintError}</div>
                  )}
                  {!hintError && nameHints.youtube.length === 0 && nameHints.existing.length === 0 && (
                    <div className="hint-note">No matching channels found. Keep typing or enter the name manually.</div>
                  )}
                  {nameHints.existing.length > 0 && (
                    <>
                      <div className="hint-title">Already registered</div>
                      {nameHints.existing.map(item => (
                        <div key={item._id} className="hint-item hint-existing">
                          <span className="hint-dot"></span>
                          <span className="hint-text">
                            <strong>{item.name}</strong>
                            <small>{[item.category, item.location].filter(Boolean).join(' · ')}</small>
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                  {nameHints.youtube.length > 0 && (
                    <>
                      <div className="hint-title">YouTube channels</div>
                      {nameHints.youtube.map(item => (
                        <button
                          type="button"
                          key={item.channelId}
                          className="hint-item"
                          role="option"
                          onClick={() => pickYoutubeHint(item)}
                        >
                          {item.thumbnail
                            ? <img src={item.thumbnail} alt="" className="hint-avatar" />
                            : <span className="hint-dot"></span>}
                          <span className="hint-text">
                            <strong>{item.title}</strong>
                            <small>
                              {item.subscribers !== null && item.subscribers !== undefined ? `${formatNumber(item.subscribers)} subscribers` : 'YouTube channel'}
                              {item.description ? ` · ${item.description}` : ''}
                            </small>
                          </span>
                          <span className="hint-pick">Use</span>
                        </button>
                      ))}
                    </>
                  )}
                  <input id="youtubeLink" name="youtubeLink" type="url" placeholder="https://youtube.com/@username" value={form.youtubeLink} onChange={updateField} required />
                </div>
              )}
                <small className="input-note">Type a name to see channel suggestions, or paste a link. Stats load automatically.</small>

                {ytError && <div className="form-alert error inline-alert" role="alert"><span>!</span>{ytError}</div>}

                {ytChannel && (
                  <div className="yt-preview">
                    <div className="yt-head">
                      {ytChannel.thumbnail && <img src={ytChannel.thumbnail} alt="" className="yt-avatar" />}
                      <div className="yt-title">
                        <strong>{ytChannel.title}</strong>
                        <small>{ytChannel.handle || ytChannel.channelId}</small>
                      </div>
                      <button type="button" className="yt-apply" onClick={applyYoutubeStats}>Use these stats</button>
                    </div>
                    <div className="yt-stats">
                      <div><b>{formatNumber(ytChannel.subscribers)}</b><span>Subscribers</span></div>
                      <div><b>{formatNumber(ytChannel.totalViews)}</b><span>Total views</span></div>
                      <div><b>{formatNumber(ytChannel.videoCount)}</b><span>Videos</span></div>
                      <div><b>{formatNumber(ytChannel.avgViews)}</b><span>Avg views (last 10)</span></div>
                      <div><b>{ytChannel.engagement}%</b><span>Engagement</span></div>
                    </div>
                    {ytChannel.recentVideos?.length > 0 && (
                      <div className="yt-videos">
                        {ytChannel.recentVideos.map(v => (
                          <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" className="yt-video">
                            {v.thumbnail && <img src={v.thumbnail} alt="" />}
                            <span>{v.title}</span>
                            <small>{formatNumber(v.views)} views</small>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {form.channels.includes('instagram') && (
              <div className="form-group conditional-field">
                <label htmlFor="instagramLink">Instagram Profile Link <span>*</span></label>
                <div className="input-with-icon">
                  <span>◎</span>
                  <input id="instagramLink" name="instagramLink" type="url" placeholder="https://instagram.com/username" value={form.instagramLink} onChange={updateField} required />
                </div>
              </div>
            )}
            <div className="form-divider"><span>CREATOR INFORMATION</span></div>
            <div className="form-group">
              <label htmlFor="category">Category <span>*</span></label>
              <input id="category" name="category" type="text" placeholder="e.g. Fashion, Lifestyle, Tech, Food..." value={form.category} onChange={updateField} required maxLength={100} />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location <span>*</span></label>
              <select id="location" name="location" value={form.location} onChange={updateField} required>
                <option value="">Select creator's city</option>
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="form-divider"><span>AUDIENCE INSIGHTS</span></div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="followers">Total Followers <span>*</span></label>
                <input id="followers" name="followers" type="number" placeholder="e.g. 150000" min="0" step="1" value={form.followers} onChange={updateField} required />
                <small className="input-note">Combined audience across selected channels</small>
              </div>
              <div className="form-group">
                <label htmlFor="avgReelViews">Avg. Reel Views <span>*</span></label>
                <input id="avgReelViews" name="avgReelViews" type="number" placeholder="e.g. 45000" min="0" step="1" value={form.avgReelViews} onChange={updateField} required />
              </div>
              <div className="form-group full-width">
                <label htmlFor="engagement">Engagement Rate (%) <span>*</span></label>
                <div className="percentage-input">
                  <input id="engagement" name="engagement" type="number" placeholder="e.g. 4.5" min="0" max="100" step="0.01" value={form.engagement} onChange={updateField} required />
                  <span>%</span>
                </div>
              </div>
            </div>
            <div className="form-divider"><span>COLLABORATION DETAILS</span></div>
            <div className="form-group">
              <label>Collaboration Type <span>*</span></label>
              <p className="field-hint">Select the creator's preferred collaboration arrangement.</p>
              <div className="channel-options">
                <label className={`channel-card collaboration-card ${form.collaborationType === 'paid' ? 'selected' : ''}`}>
                  <input type="radio" name="collaborationType" value="paid" checked={form.collaborationType === 'paid'} onChange={updateField} />
                  <span className="channel-symbol paid-symbol">₹</span>
                  <span className="channel-info"><strong>Paid Collaboration</strong><small>Creator charges a fee</small></span>
                  <span className="channel-check">{form.collaborationType === 'paid' ? '✓' : '+'}</span>
                </label>
                <label className={`channel-card collaboration-card ${form.collaborationType === 'unpaid' ? 'selected' : ''}`}>
                  <input type="radio" name="collaborationType" value="unpaid" checked={form.collaborationType === 'unpaid'} onChange={updateField} />
                  <span className="channel-symbol unpaid-symbol">✓</span>
                  <span className="channel-info"><strong>Unpaid Collaboration</strong><small>Barter / Free promotion</small></span>
                  <span className="channel-check">{form.collaborationType === 'unpaid' ? '✓' : '+'}</span>
                </label>
              </div>
            </div>
            {form.collaborationType === 'paid' && (
              <div className="form-group conditional-field">
                <label htmlFor="collaborationPrice">Collaboration Price (₹) <span>*</span></label>
                <div className="input-with-icon price-input">
                  <span>₹</span>
                  <input id="collaborationPrice" name="collaborationPrice" type="number" placeholder="Enter creator's expected price" min="1" step="1" value={form.collaborationPrice} onChange={updateField} required />
                </div>
                <small className="input-note">Enter the creator's expected collaboration fee in INR.</small>
              </div>
            )}
            <div className="form-divider"><span>CONTACT INFORMATION</span></div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contact">Contact Number <span>*</span></label>
                <input id="contact" name="contact" type="tel" placeholder="Enter phone number" value={form.contact} onChange={updateField} required />
              </div>
              <div className="form-group">
                <label htmlFor="managementAgency">Management Agency Name <span className="optional-label">(Optional)</span></label>
                <input
                  id="managementAgency"
                  name="managementAgency"
                  type="text"
                  placeholder="Enter management agency name"
                  value={form.managementAgency}
                  onChange={updateField}
                  maxLength={150}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address <span>*</span></label>
                <input id="email" name="email" type="email" placeholder="creator@email.com" value={form.email} onChange={updateField} required />
              </div>
            </div>
            {message.text && (
              <div className={`form-alert ${message.type}`} role="alert">
                <span>{message.type === 'success' ? '✓' : '!'}</span>
                {message.text}
              </div>
            )}
            <div className="form-footer">
              <p><span>*</span> Required fields</p>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <><span className="button-spinner"></span> Registering...</> : <>Submit Influencer <span>↗</span></>}
              </button>
            </div>
          </form>
        </div>
      </section>
      <footer className="footer">
        <span>© {new Date().getFullYear()} CREATORHUB</span>
        <span>BUILT FOR THE CREATOR ECONOMY <span className="footer-heart">✳</span></span>
      </footer>
    </main>
  );
}
export default App;
