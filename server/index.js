require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'restaurant';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const STAFF_ROLES = ['admin', 'manager', 'waiter'];

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

function toObjectId(id) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

async function ensureIndexes() {
  try {
    const staff = await getCollection('staff');
    await staff.createIndex({ email: 1 }, { unique: true });

    const menuItems = await getCollection('menuItems');
    await menuItems.createIndex({ category: 1 });
    await menuItems.createIndex({ available: 1 });
  } catch (err) {
    console.warn('Index setup warning:', err.message);
  }
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

app.get('/api/staff', requireAdmin, async (req, res) => {
  try {
    const col = await getCollection('staff');
    const list = await col.find({}).sort({ createdAt: -1 }).toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

app.post('/api/staff', requireAdmin, async (req, res) => {
  const { name, email, role, active } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (role && !STAFF_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const col = await getCollection('staff');
    const doc = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role: role || 'waiter',
      active: active !== false,
      createdAt: new Date(),
    };
    const result = await col.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

app.patch('/api/staff/:id', requireAdmin, async (req, res) => {
  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid staff id' });
  }

  const updates = {};
  const { name, email, role, active } = req.body;

  if (name !== undefined) {
    if (!String(name).trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    updates.name = String(name).trim();
  }
  if (email !== undefined) {
    if (!String(email).trim()) {
      return res.status(400).json({ error: 'Email cannot be empty' });
    }
    updates.email = String(email).trim().toLowerCase();
  }
  if (role !== undefined) {
    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    updates.role = role;
  }
  if (active !== undefined) {
    updates.active = Boolean(active);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.updatedAt = new Date();

  try {
    const col = await getCollection('staff');
    const result = await col.findOneAndUpdate(
      { _id: objectId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(result);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

function parseMenuPrice(value) {
  if (value === undefined || value === null || value === '') {
    return { error: 'Price is required' };
  }
  const price = Number(value);
  if (Number.isNaN(price)) {
    return { error: 'Price must be a number' };
  }
  if (price < 0) {
    return { error: 'Price cannot be negative' };
  }
  return { price };
}

function validateMenuItemCreate(body) {
  const { name, description, price, category, available } = body;

  if (!name || !String(name).trim()) {
    return { error: 'Name is required' };
  }

  const priceResult = parseMenuPrice(price);
  if (priceResult.error) {
    return { error: priceResult.error };
  }

  if (!category || !String(category).trim()) {
    return { error: 'Category is required' };
  }

  return {
    doc: {
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      price: priceResult.price,
      category: String(category).trim(),
      available: available !== false,
      createdAt: new Date(),
    },
  };
}

app.get('/api/menu-items', async (req, res) => {
  try {
    const col = await getCollection('menuItems');
    const filter = {};

    if (req.query.available === 'true') {
      filter.available = true;
    } else if (req.query.available === 'false') {
      filter.available = false;
    }

    const list = await col.find(filter).sort({ category: 1, name: 1 }).toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu-items', requireAdmin, async (req, res) => {
  const validation = validateMenuItemCreate(req.body);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const col = await getCollection('menuItems');
    const result = await col.insertOne(validation.doc);
    res.status(201).json({ ...validation.doc, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.patch('/api/menu-items/:id', requireAdmin, async (req, res) => {
  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid menu item id' });
  }

  const updates = {};
  const { name, description, price, category, available } = req.body;

  if (name !== undefined) {
    if (!String(name).trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    updates.name = String(name).trim();
  }
  if (description !== undefined) {
    updates.description = String(description).trim();
  }
  if (price !== undefined) {
    const priceResult = parseMenuPrice(price);
    if (priceResult.error) {
      return res.status(400).json({ error: priceResult.error });
    }
    updates.price = priceResult.price;
  }
  if (category !== undefined) {
    if (!String(category).trim()) {
      return res.status(400).json({ error: 'Category cannot be empty' });
    }
    updates.category = String(category).trim();
  }
  if (available !== undefined) {
    updates.available = Boolean(available);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.updatedAt = new Date();

  try {
    const col = await getCollection('menuItems');
    const result = await col.findOneAndUpdate(
      { _id: objectId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/api/menu-items/:id', requireAdmin, async (req, res) => {
  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid menu item id' });
  }

  try {
    const col = await getCollection('menuItems');
    const result = await col.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

async function start() {
  await connectDb();
  await ensureIndexes();

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
