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

async function requireAdmin(req, res, next) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const sessionRes = await fetch(`${CLIENT_URL}/api/auth/get-session`, {
      headers: { cookie: cookieHeader },
    });

    if (!sessionRes.ok) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await sessionRes.json();

    if (!data?.session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = data.session.user;
    return next();
  } catch (err) {
    console.error('Auth verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function isPublicWriteRoute(req) {
  if (req.method === 'POST' && req.path === '/api/orders') return true;
  if (req.method === 'POST' && req.path === '/api/reservations') return true;
  return false;
}

function isPublicReadRoute(req) {
  if (req.method !== 'GET') return false;
  if (req.path === '/api/health') return true;
  if (req.path === '/api/menu-items') return true;
  if (req.path === '/api/tables/available') return true;
  if (/^\/api\/bills\/[^/]+$/.test(req.path)) return true;
  return false;
}

app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();
  if (req.path === '/api/health') return next();
  if (isPublicReadRoute(req) || isPublicWriteRoute(req)) return next();

  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    return requireAdmin(req, res, next);
  }

  return next();
});

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

app.post('/api/admin/auth-check', requireAdmin, (req, res) => {
  res.json({ ok: true, user: { email: req.user.email, name: req.user.name } });
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

module.exports = { app, getCollection, requireAdmin };
