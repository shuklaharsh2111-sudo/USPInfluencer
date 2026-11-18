
import express from 'express';
import Influencer from '../models/influencer.js';

const router = express.Router();

const validateUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

router.post('/', async (req, res) => {
  try {
    const {
      name, channels, youtubeLink, instagramLink,
      category, location, followers, avgReelViews,
      engagement, contact, email, managementAgency, youtubeStats
    } = req.body;

    if (!name?.trim() || !category?.trim() || !location?.trim() ||
        !contact?.trim() || !email?.trim() || !managementAgency?.trim()) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    if (!Array.isArray(channels) || channels.length === 0 ||
        !channels.every(c => ['youtube', 'instagram'].includes(c))) {
      return res.status(400).json({ message: 'Select a valid social channel.' });
    }

    if (channels.includes('youtube') && !youtubeLink?.trim()) {
      return res.status(400).json({ message: 'YouTube profile link is required.' });
    }

    if (channels.includes('instagram') && !instagramLink?.trim()) {
      return res.status(400).json({ message: 'Instagram profile link is required.' });
    }

    if (!validateUrl(youtubeLink) || !validateUrl(instagramLink)) {
      return res.status(400).json({ message: 'Please enter valid profile URLs.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const numericFields = [followers, avgReelViews, engagement];
    if (numericFields.some(v => v === '' || v === null || v === undefined || !Number.isFinite(Number(v)))) {
      return res.status(400).json({ message: 'Enter valid numeric values.' });
    }

    if (Number(followers) < 0 || Number(avgReelViews) < 0 ||
        Number(engagement) < 0 || Number(engagement) > 100) {
      return res.status(400).json({ message: 'Please check your followers, views and engagement values.' });
    }

    const influencer = await Influencer.create({
      name, channels, youtubeLink: channels.includes('youtube') ? youtubeLink : '',
      instagramLink: channels.includes('instagram') ? instagramLink : '',
      category, location, followers: Number(followers),
      avgReelViews: Number(avgReelViews), engagement: Number(engagement),
      contact, email, managementAgency,
      youtubeStats: channels.includes('youtube') && youtubeStats?.channelId ? {
        channelId: String(youtubeStats.channelId),
        title: String(youtubeStats.title || ''),
        handle: String(youtubeStats.handle || ''),
        thumbnail: String(youtubeStats.thumbnail || ''),
        subscribers: Number.isFinite(Number(youtubeStats.subscribers)) ? Number(youtubeStats.subscribers) : null,
        totalViews: Number(youtubeStats.totalViews) || 0,
        videoCount: Number(youtubeStats.videoCount) || 0,
        avgViews: Number(youtubeStats.avgViews) || 0,
        engagement: Number(youtubeStats.engagement) || 0,
        fetchedAt: youtubeStats.fetchedAt ? new Date(youtubeStats.fetchedAt) : new Date()
      } : undefined
    });

    return res.status(201).json({
      success: true,
      message: 'Influencer registered successfully!',
      influencer
    });
  } catch (error) {
    console.error('Influencer registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error while registering influencer.' });
  }
});

router.get('/suggest', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ success: true, results: [] });
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const results = await Influencer.find({ name: { $regex: safe, $options: 'i' } })
      .select('name category location')
      .limit(5)
      .lean();
    res.json({ success: true, results });
  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({ message: 'Unable to fetch suggestions.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const influencers = await Influencer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: influencers.length, influencers });
  } catch (error) {
    console.error('Fetch influencers error:', error);
    res.status(500).json({ message: 'Unable to fetch influencers.' });
  }
});

export default router;
