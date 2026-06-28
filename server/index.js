require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'restaurant';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const app = express();

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

let client = null;
let dbConnected = false;

async function connectDb() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set — database features unavailable');
    return false;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    await client.db(DB_NAME).command({ ping: 1 });
    dbConnected = true;
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    dbConnected = false;
    return false;
  }
}

async function getCollection(name) {
  if (!client || !dbConnected) {
    throw new Error('Database not connected');
  }
  return client.db(DB_NAME).collection(name);
}

app.get('/api/health', async (req, res) => {
  if (!MONGODB_URI) {
    return res.status(503).json({
      status: 'error',
      db: 'not_configured',
      error: 'MONGODB_URI is not set',
    });
  }

  if (!dbConnected) {
    const ok = await connectDb();
    if (!ok) {
      return res.status(503).json({
        status: 'error',
        db: 'disconnected',
        error: 'Unable to connect to MongoDB',
      });
    }
  }

  try {
    await client.db(DB_NAME).command({ ping: 1 });
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    dbConnected = false;
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      error: err.message,
    });
  }
});

async function start() {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

process.on('SIGINT', async () => {
  if (client) await client.close();
  process.exit(0);
});

start();

module.exports = { app, getCollection };
