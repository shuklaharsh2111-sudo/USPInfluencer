
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import influencerRoutes from './routes/influencerRoutes.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.resolve(__dirname, '../frontend/dist');

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Influencer API is running.'
  });
});

app.use('/api/influencers', influencerRoutes);

app.use(express.static(frontendPath));

app.use('/api', (req, res) => {
  res.status(404).json({
    message: 'API route not found.'
  });
});

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(404).json({
      message: 'Route not found.'
    });
  }

  res.sendFile(path.join(frontendPath, 'index.html'), (error) => {
    if (error) next(error);
  });
});

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in environment variables.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend path: ${frontendPath}`);
    });
  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();
