
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = {
  async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong.');
    }

    return data;
  },

  getInfluencers() {
    return this.request('/influencers');
  },

  getYoutubeChannel(url) {
    return this.request(`/youtube/channel?url=${encodeURIComponent(url)}`);
  },

  searchYoutube(q) {
    return this.request(`/youtube/search?q=${encodeURIComponent(q)}`);
  },

  suggestInfluencers(q) {
    return this.request(`/influencers/suggest?q=${encodeURIComponent(q)}`);
  },

  createInfluencer(payload) {
    return this.request('/influencers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

export default api;
