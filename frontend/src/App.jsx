
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
  managementAgency: ''
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleChannel = (channel) => {
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

    if (form.channels.includes('instagram') && !form.instagramLink.trim()) {
      setMessage({ type: 'error', text: 'Please enter the Instagram profile link.' });
      return;
    }

    if (!/^\d{7,15}$/.test(form.contact.replace(/[\s+()-]/g, ''))) {
      setMessage({ type: 'error', text: 'Please enter a valid contact number.' });
      return;
    }

    setLoading(true);

    try {
      const result = await api.createInfluencer(form);
      setMessage({ type: 'success', text: result.message || 'Influencer registered successfully!' });
      setForm(initialForm);
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
          audience insights and management details in one place.
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
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>Social Media Channels <span>*</span></label>
              <p className="field-hint">Select one or both platforms.</p>
              <div className="channel-options">
                <label className={`channel-card youtube-card ${form.channels.includes('youtube') ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.channels.includes('youtube')}
                    onChange={() => toggleChannel('youtube')}
                  />
                  <span className="channel-symbol youtube-symbol">▶</span>
                  <span className="channel-info">
                    <strong>YouTube</strong>
                    <small>Video creator</small>
                  </span>
                  <span className="channel-check">{form.channels.includes('youtube') ? '✓' : '+'}</span>
                </label>

                <label className={`channel-card instagram-card ${form.channels.includes('instagram') ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.channels.includes('instagram')}
                    onChange={() => toggleChannel('instagram')}
                  />
                  <span className="channel-symbol instagram-symbol">◎</span>
                  <span className="channel-info">
                    <strong>Instagram</strong>
                    <small>Social creator</small>
                  </span>
                  <span className="channel-check">{form.channels.includes('instagram') ? '✓' : '+'}</span>
                </label>
              </div>
            </div>

            {form.channels.includes('youtube') && (
              <div className="form-group conditional-field">
                <label htmlFor="youtubeLink">YouTube Profile Link <span>*</span></label>
                <div className="input-with-icon">
                  <span>▶</span>
                  <input
                    id="youtubeLink"
                    name="youtubeLink"
                    type="url"
                    placeholder="https://youtube.com/@username"
                    value={form.youtubeLink}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>
            )}

            {form.channels.includes('instagram') && (
              <div className="form-group conditional-field">
                <label htmlFor="instagramLink">Instagram Profile Link <span>*</span></label>
                <div className="input-with-icon">
                  <span>◎</span>
                  <input
                    id="instagramLink"
                    name="instagramLink"
                    type="url"
                    placeholder="https://instagram.com/username"
                    value={form.instagramLink}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-divider">
              <span>CREATOR INFORMATION</span>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category <span>*</span></label>
              <input
                id="category"
                name="category"
                type="text"
                placeholder="e.g. Fashion, Lifestyle, Tech, Food..."
                value={form.category}
                onChange={updateField}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location <span>*</span></label>
              <select
                id="location"
                name="location"
                value={form.location}
                onChange={updateField}
                required
              >
                <option value="">Select creator's city</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="form-divider">
              <span>AUDIENCE INSIGHTS</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="followers">Total Followers <span>*</span></label>
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
                <small className="input-note">Combined audience across selected channels</small>
              </div>

              <div className="form-group">
                <label htmlFor="avgReelViews">Avg. Reel Views <span>*</span></label>
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

              <div className="form-group full-width">
                <label htmlFor="engagement">Engagement Rate (%) <span>*</span></label>
                <div className="percentage-input">
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

            <div className="form-divider">
              <span>CONTACT & MANAGEMENT</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contact">Contact Number <span>*</span></label>
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  placeholder="Enter phone number"
                  value={form.contact}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address <span>*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="creator@email.com"
                  value={form.email}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="managementAgency">Management Agency Name <span>*</span></label>
                <input
                  id="managementAgency"
                  name="managementAgency"
                  type="text"
                  placeholder="Enter management agency name"
                  value={form.managementAgency}
                  onChange={updateField}
                  required
                  maxLength={150}
                />
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
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Registering...
                  </>
                ) : (
                  <>
                    Submit Influencer <span>↗</span>
                  </>
                )}
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
