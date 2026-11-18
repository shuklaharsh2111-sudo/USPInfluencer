import express from 'express';

const router = express.Router();
const YT = 'https://www.googleapis.com/youtube/v3';

const ytGet = async (endpoint, params) => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    const err = new Error('YOUTUBE_API_KEY is missing on the server.');
    err.status = 500;
    throw err;
  }
  const qs = new URLSearchParams({ ...params, key });
  const response = await fetch(`${YT}/${endpoint}?${qs}`);
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data?.error?.message || 'YouTube API request failed.');
    err.status = response.status === 403 ? 502 : response.status;
    throw err;
  }
  return data;
};

// Accepts @handle, /channel/UC..., /user/name, /c/name, or a bare handle / channel id
const parseChannelRef = (input) => {
  const raw = String(input || '').trim();
  if (!raw) return null;

  if (/^UC[\w-]{22}$/.test(raw)) return { type: 'id', value: raw };
  if (/^@[\w.-]+$/.test(raw)) return { type: 'handle', value: raw };

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (!/(^|\.)youtube\.com$/i.test(url.hostname)) return null;

  const parts = url.pathname.split('/').filter(Boolean);
  if (!parts.length) return null;

  if (parts[0].startsWith('@')) return { type: 'handle', value: decodeURIComponent(parts[0]) };
  if (parts[0] === 'channel' && parts[1]) return { type: 'id', value: parts[1] };
  if (parts[0] === 'user' && parts[1]) return { type: 'username', value: parts[1] };
  if ((parts[0] === 'c' || parts[0] === 'user') && parts[1]) return { type: 'search', value: parts[1] };
  return null;
};

const resolveChannel = async (ref) => {
  const part = 'snippet,statistics,contentDetails';
  let data;

  if (ref.type === 'id') data = await ytGet('channels', { part, id: ref.value });
  else if (ref.type === 'handle') data = await ytGet('channels', { part, forHandle: ref.value });
  else if (ref.type === 'username') data = await ytGet('channels', { part, forUsername: ref.value });
  else {
    const found = await ytGet('search', { part: 'snippet', type: 'channel', q: ref.value, maxResults: '1' });
    const id = found.items?.[0]?.snippet?.channelId || found.items?.[0]?.id?.channelId;
    if (!id) return null;
    data = await ytGet('channels', { part, id });
  }
  return data.items?.[0] || null;
};

const getRecentVideoStats = async (uploadsPlaylistId, limit = 10) => {
  if (!uploadsPlaylistId) return { videos: [], avgViews: 0, engagement: 0 };

  const playlist = await ytGet('playlistItems', {
    part: 'contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: String(limit)
  });
  const ids = (playlist.items || []).map(i => i.contentDetails.videoId).filter(Boolean);
  if (!ids.length) return { videos: [], avgViews: 0, engagement: 0 };

  const vids = await ytGet('videos', { part: 'snippet,statistics', id: ids.join(',') });
  const videos = (vids.items || []).map(v => ({
    id: v.id,
    title: v.snippet.title,
    publishedAt: v.snippet.publishedAt,
    thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url || '',
    views: Number(v.statistics?.viewCount || 0),
    likes: Number(v.statistics?.likeCount || 0),
    comments: Number(v.statistics?.commentCount || 0)
  }));

  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const totalInteractions = videos.reduce((s, v) => s + v.likes + v.comments, 0);
  const avgViews = videos.length ? Math.round(totalViews / videos.length) : 0;
  const engagement = totalViews ? Number(((totalInteractions / totalViews) * 100).toFixed(2)) : 0;

  return { videos, avgViews, engagement };
};

router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 3) return res.json({ success: true, results: [] });

    const data = await ytGet('search', {
      part: 'snippet',
      type: 'channel',
      q,
      maxResults: '5'
    });

    let results = (data.items || []).map(i => ({
      channelId: i.snippet.channelId || i.id?.channelId,
      title: i.snippet.channelTitle || i.snippet.title,
      thumbnail: i.snippet.thumbnails?.default?.url || '',
      description: (i.snippet.description || '').slice(0, 80),
      subscribers: null
    })).filter(r => r.channelId);

    if (results.length) {
      try {
        const stats = await ytGet('channels', { part: 'statistics', id: results.map(r => r.channelId).join(',') });
        const bySub = new Map((stats.items || []).map(c => [
          c.id,
          c.statistics?.hiddenSubscriberCount ? null : Number(c.statistics?.subscriberCount || 0)
        ]));
        results = results.map(r => ({ ...r, subscribers: bySub.get(r.channelId) ?? null }));
      } catch {
        // subscriber counts are a nice-to-have; keep the plain results
      }
    }

    return res.json({ success: true, results });
  } catch (error) {
    console.error('YouTube search error:', error.message);
    return res.status(error.status || 500).json({ message: error.message || 'Unable to search YouTube.' });
  }
});

router.get('/channel', async (req, res) => {
  try {
    const ref = parseChannelRef(req.query.url);
    if (!ref) {
      return res.status(400).json({ message: 'Enter a valid YouTube channel link (e.g. https://youtube.com/@username).' });
    }

    const channel = await resolveChannel(ref);
    if (!channel) {
      return res.status(404).json({ message: 'No YouTube channel found for that link.' });
    }

    const stats = channel.statistics || {};
    const { videos, avgViews, engagement } = await getRecentVideoStats(
      channel.contentDetails?.relatedPlaylists?.uploads
    );

    return res.json({
      success: true,
      channel: {
        channelId: channel.id,
        title: channel.snippet.title,
        handle: channel.snippet.customUrl || '',
        description: channel.snippet.description || '',
        country: channel.snippet.country || '',
        thumbnail: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url || '',
        subscribers: stats.hiddenSubscriberCount ? null : Number(stats.subscriberCount || 0),
        totalViews: Number(stats.viewCount || 0),
        videoCount: Number(stats.videoCount || 0),
        avgViews,
        engagement,
        recentVideos: videos.slice(0, 5),
        url: `https://www.youtube.com/channel/${channel.id}`,
        fetchedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('YouTube fetch error:', error.message);
    return res.status(error.status || 500).json({ message: error.message || 'Unable to fetch YouTube channel.' });
  }
});

export default router;
