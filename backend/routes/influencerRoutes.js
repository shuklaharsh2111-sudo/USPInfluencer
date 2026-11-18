import express from 'express';
import Influencer from '../models/influencer.js';
const router = express.Router();
const validateUrl = value => {
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
      engagement, contact, email,
      collaborationType, collaborationPrice, managementAgency
    } = req.body;
    if (!name?.trim() || !category?.trim() || !location?.trim() ||
      !contact?.trim() || !email?.trim()) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    if (!Array.isArray(channels) || channels.length === 0 ||
      !channels.every(c => ['youtube', 'instagram'].includes(c)) ||
      new Set(channels).size !== channels.length) {
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
    if (!['paid', 'unpaid'].includes(collaborationType)) {
      return res.status(400).json({ message: 'Please select a valid collaboration type.' });
    }
    if (collaborationType === 'paid' &&
      (!Number.isFinite(Number(collaborationPrice)) || Number(collaborationPrice) <= 0)) {
      return res.status(400).json({ message: 'Please enter a valid collaboration price.' });
    }
    const influencer = await Influencer.create({
      name,
      channels,
      youtubeLink: channels.includes('youtube') ? youtubeLink : '',
      instagramLink: channels.includes('instagram') ? instagramLink : '',
      category,
      location,
      followers: Number(followers),
      avgReelViews: Number(avgReelViews),
      engagement: Number(engagement),
      contact,
      email,
      managementAgency: managementAgency?.trim() || '',
      collaborationType,
      collaborationPrice: collaborationType === 'paid' ? Number(collaborationPrice) : null
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
router.get('/', async (req, res) => {
  try {
    const influencers = await Influencer.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: influencers.length,
      influencers
    });
  } catch (error) {
    console.error('Fetch influencers error:', error);
    res.status(500).json({ message: 'Unable to fetch influencers.' });
  }
});
export default router;
