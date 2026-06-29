require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'restaurant';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';
const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

const STAFF_ROLES = ['admin', 'manager', 'waiter'];
const TABLE_STATUSES = ['available', 'occupied', 'reserved'];
const ORDER_STATUSES = ['pending', 'preparing', 'served', 'billed', 'paid'];
const ORDER_STATUS_TRANSITIONS = {
  pending: 'preparing',
  preparing: 'served',
  served: 'billed',
  billed: 'paid',
};
const RESERVATION_STATUSES = ['pending', 'confirmed', 'seated', 'cancelled'];
const PAYMENT_STATUSES = ['unpaid', 'paid'];
const TAX_RATE = 0.08;

const app = express();

app.use(cors({ origin: CLIENT_URL }));

function isStripeEnabled() {
  return Boolean(stripe && STRIPE_SECRET_KEY);
}

async function markBillAsPaid(billId, options = {}) {
  const {
    paymentMethod = 'manual',
    stripeCheckoutSessionId,
    stripePaymentIntentId,
  } = options;

  const objectId = typeof billId === 'string' ? toObjectId(billId) : billId;
  if (!objectId) {
    throw new Error('Invalid bill id');
  }

  const billsCol = await getCollection('bills');
  const bill = await billsCol.findOne({ _id: objectId });
  if (!bill) {
    const err = new Error('Bill not found');
    err.status = 404;
    throw err;
  }
  if (bill.paymentStatus === 'paid') {
    return bill;
  }

  const paidAt = new Date();
  const update = {
    paymentStatus: 'paid',
    paidAt,
    updatedAt: paidAt,
    paymentMethod,
  };
  if (stripeCheckoutSessionId) {
    update.stripeCheckoutSessionId = stripeCheckoutSessionId;
  }
  if (stripePaymentIntentId) {
    update.stripePaymentIntentId = stripePaymentIntentId;
  }

  const result = await billsCol.findOneAndUpdate(
    { _id: objectId, paymentStatus: { $ne: 'paid' } },
    { $set: update },
    { returnDocument: 'after' }
  );

  if (!result) {
    return billsCol.findOne({ _id: objectId });
  }

  const ordersCol = await getCollection('orders');
  const order = await ordersCol.findOne({ _id: bill.orderId });
  if (order) {
    await ordersCol.updateOne(
      { _id: bill.orderId },
      { $set: { status: 'paid', updatedAt: paidAt } }
    );
    const tablesCol = await getCollection('tables');
    await tablesCol.updateOne(
      { _id: order.tableId },
      { $set: { status: 'available', updatedAt: paidAt } }
    );
  }

  return result;
}

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: 'Stripe webhooks are not configured' });
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const billId = session.metadata?.billId;
        if (billId) {
          await markBillAsPaid(billId, {
            paymentMethod: 'stripe',
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id,
          });
        }
      }
      res.json({ received: true });
    } catch (err) {
      console.error('Stripe webhook handler failed:', err.message);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

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

    const tables = await getCollection('tables');
    await tables.createIndex({ number: 1 }, { unique: true });

    const orders = await getCollection('orders');
    await orders.createIndex({ status: 1, createdAt: -1 });

    const reservations = await getCollection('reservations');
    await reservations.createIndex({ dateTime: 1, status: 1 });

    const bills = await getCollection('bills');
    await bills.createIndex({ orderId: 1 }, { unique: true });
    await bills.createIndex({ paymentStatus: 1 });
    await bills.createIndex({ stripeCheckoutSessionId: 1 }, { sparse: true });
  } catch (err) {
    console.warn('Index setup warning:', err.message);
  }
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
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
  if (req.method === 'POST' && /^\/api\/bills\/[^/]+\/checkout-session$/.test(req.path)) {
    return true;
  }
  return false;
}

function isPublicReadRoute(req) {
  if (req.method !== 'GET') return false;
  if (req.path === '/api/health') return true;
  if (req.path === '/api/payments/config') return true;
  if (req.path === '/api/menu-items') return true;
  if (req.path === '/api/tables/available') return true;
  if (/^\/api\/bills\/[^/]+$/.test(req.path)) return true;
  return false;
}

app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();
  if (req.path === '/api/health') return next();
  if (req.path === '/api/stripe/webhook') return next();
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

// --- Tables ---

app.get('/api/tables', requireAdmin, async (req, res) => {
  try {
    const col = await getCollection('tables');
    const list = await col.find({}).sort({ number: 1 }).toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

app.get('/api/tables/available', async (req, res) => {
  try {
    const col = await getCollection('tables');
    const list = await col
      .find({ status: 'available' })
      .sort({ number: 1 })
      .toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch available tables' });
  }
});

app.post('/api/tables', requireAdmin, async (req, res) => {
  const { number, capacity } = req.body;

  if (number === undefined || number === null || number === '') {
    return res.status(400).json({ error: 'Table number is required' });
  }
  const tableNumber = Number(number);
  if (Number.isNaN(tableNumber) || tableNumber < 1) {
    return res.status(400).json({ error: 'Table number must be a positive number' });
  }
  const cap = Number(capacity);
  if (Number.isNaN(cap) || cap < 1) {
    return res.status(400).json({ error: 'Capacity must be at least 1' });
  }

  try {
    const col = await getCollection('tables');
    const doc = {
      number: tableNumber,
      capacity: cap,
      status: 'available',
      createdAt: new Date(),
    };
    const result = await col.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Table number already exists' });
    }
    res.status(500).json({ error: 'Failed to create table' });
  }
});

app.patch('/api/tables/:id', requireAdmin, async (req, res) => {
  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid table id' });
  }

  const updates = {};
  const { number, capacity, status } = req.body;

  if (number !== undefined) {
    const tableNumber = Number(number);
    if (Number.isNaN(tableNumber) || tableNumber < 1) {
      return res.status(400).json({ error: 'Table number must be a positive number' });
    }
    updates.number = tableNumber;
  }
  if (capacity !== undefined) {
    const cap = Number(capacity);
    if (Number.isNaN(cap) || cap < 1) {
      return res.status(400).json({ error: 'Capacity must be at least 1' });
    }
    updates.capacity = cap;
  }
  if (status !== undefined) {
    if (!TABLE_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid table status' });
    }
    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.updatedAt = new Date();

  try {
    const col = await getCollection('tables');
    const result = await col.findOneAndUpdate(
      { _id: objectId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(result);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Table number already exists' });
    }
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// --- Orders ---

app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const col = await getCollection('orders');
    const filter = {};
    if (req.query.status && ORDER_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const list = await col.find(filter).sort({ createdAt: -1 }).toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { tableId, items, customerName, notes } = req.body;

  if (!tableId) {
    return res.status(400).json({ error: 'Table is required' });
  }
  const tableObjectId = toObjectId(tableId);
  if (!tableObjectId) {
    return res.status(400).json({ error: 'Invalid table id' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item' });
  }

  try {
    const tablesCol = await getCollection('tables');
    const table = await tablesCol.findOne({ _id: tableObjectId });
    if (!table) {
      return res.status(400).json({ error: 'Table not found' });
    }
    if (table.status !== 'available') {
      return res.status(400).json({ error: 'Table is not available' });
    }

    const menuCol = await getCollection('menuItems');
    const lineItems = [];
    let subtotal = 0;

    for (const entry of items) {
      const menuItemId = toObjectId(entry.menuItemId);
      const qty = Number(entry.qty);
      if (!menuItemId || Number.isNaN(qty) || qty < 1) {
        return res.status(400).json({ error: 'Invalid order item' });
      }
      const menuItem = await menuCol.findOne({ _id: menuItemId });
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({ error: `Menu item unavailable: ${entry.menuItemId}` });
      }
      const lineTotal = menuItem.price * qty;
      lineItems.push({
        menuItemId,
        name: menuItem.name,
        qty,
        price: menuItem.price,
        lineTotal,
      });
      subtotal += lineTotal;
    }

    const ordersCol = await getCollection('orders');
    const doc = {
      tableId: tableObjectId,
      tableNumber: table.number,
      items: lineItems,
      status: 'pending',
      subtotal,
      customerName: customerName ? String(customerName).trim() : '',
      notes: notes ? String(notes).trim() : '',
      createdAt: new Date(),
    };
    const result = await ordersCol.insertOne(doc);

    await tablesCol.updateOne(
      { _id: tableObjectId },
      { $set: { status: 'occupied', updatedAt: new Date() } }
    );

    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.patch('/api/orders/:id/status', requireAdmin, async (req, res) => {
  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  try {
    const ordersCol = await getCollection('orders');
    const order = await ordersCol.findOne({ _id: objectId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const nextStatus = ORDER_STATUS_TRANSITIONS[order.status];
    if (!nextStatus) {
      return res.status(400).json({ error: 'Order cannot be advanced further' });
    }

    if (order.status === 'served' && nextStatus === 'billed') {
      return res.status(400).json({ error: 'Generate a bill to mark order as billed' });
    }

    if (order.status === 'billed' && nextStatus === 'paid') {
      return res.status(400).json({ error: 'Mark the bill as paid to complete payment' });
    }

    const result = await ordersCol.findOneAndUpdate(
      { _id: objectId },
      { $set: { status: nextStatus, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (nextStatus === 'paid') {
      const tablesCol = await getCollection('tables');
      await tablesCol.updateOne(
        { _id: order.tableId },
        { $set: { status: 'available', updatedAt: new Date() } }
      );
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.patch('/api/orders/:id', requireAdmin, async (req, res) => {
  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  const updates = {};
  const { customerName, notes } = req.body;

  if (customerName !== undefined) {
    updates.customerName = String(customerName).trim();
  }
  if (notes !== undefined) {
    updates.notes = String(notes).trim();
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.updatedAt = new Date();

  try {
    const col = await getCollection('orders');
    const result = await col.findOneAndUpdate(
      { _id: objectId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// --- Reservations ---

app.get('/api/reservations', requireAdmin, async (req, res) => {
  try {
    const col = await getCollection('reservations');
    const filter = {};

    if (req.query.status && RESERVATION_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.date) {
      const dayStart = new Date(`${req.query.date}T00:00:00`);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      if (!Number.isNaN(dayStart.getTime())) {
        filter.dateTime = { $gte: dayStart, $lt: dayEnd };
      }
    }

    const list = await col.find(filter).sort({ dateTime: 1 }).toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

app.post('/api/reservations', async (req, res) => {
  const { customerName, phone, partySize, dateTime, notes } = req.body;

  if (!customerName || !String(customerName).trim()) {
    return res.status(400).json({ error: 'Customer name is required' });
  }
  if (!phone || !String(phone).trim()) {
    return res.status(400).json({ error: 'Phone is required' });
  }
  const size = Number(partySize);
  if (Number.isNaN(size) || size < 1) {
    return res.status(400).json({ error: 'Party size must be at least 1' });
  }
  if (!dateTime) {
    return res.status(400).json({ error: 'Date and time are required' });
  }
  const when = new Date(dateTime);
  if (Number.isNaN(when.getTime())) {
    return res.status(400).json({ error: 'Invalid date and time' });
  }

  try {
    const col = await getCollection('reservations');
    const doc = {
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      partySize: size,
      dateTime: when,
      status: 'pending',
      notes: notes ? String(notes).trim() : '',
      createdAt: new Date(),
    };
    const result = await col.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

app.patch('/api/reservations/:id', requireAdmin, async (req, res) => {
  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid reservation id' });
  }

  const { status, tableId } = req.body;

  try {
    const reservationsCol = await getCollection('reservations');
    const reservation = await reservationsCol.findOne({ _id: objectId });
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const tablesCol = await getCollection('tables');
    const updates = { updatedAt: new Date() };

    if (status === 'confirmed') {
      const tableObjectId = toObjectId(tableId);
      if (!tableObjectId) {
        return res.status(400).json({ error: 'Table is required to confirm' });
      }
      const table = await tablesCol.findOne({ _id: tableObjectId });
      if (!table) {
        return res.status(400).json({ error: 'Table not found' });
      }
      if (table.status !== 'available') {
        return res.status(400).json({ error: 'Table is not available' });
      }
      if (reservation.partySize > table.capacity) {
        return res.status(400).json({ error: 'Party size exceeds table capacity' });
      }
      updates.status = 'confirmed';
      updates.tableId = tableObjectId;
      await tablesCol.updateOne(
        { _id: tableObjectId },
        { $set: { status: 'reserved', updatedAt: new Date() } }
      );
    } else if (status === 'cancelled') {
      updates.status = 'cancelled';
      if (reservation.tableId && reservation.status === 'confirmed') {
        await tablesCol.updateOne(
          { _id: reservation.tableId },
          { $set: { status: 'available', updatedAt: new Date() } }
        );
      }
    } else if (status === 'seated') {
      if (reservation.status !== 'confirmed') {
        return res.status(400).json({ error: 'Only confirmed reservations can be seated' });
      }
      updates.status = 'seated';
    } else if (status !== undefined) {
      return res.status(400).json({ error: 'Invalid reservation status update' });
    }

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const result = await reservationsCol.findOneAndUpdate(
      { _id: objectId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// --- Bills ---

app.get('/api/bills', requireAdmin, async (req, res) => {
  try {
    const col = await getCollection('bills');
    const filter = {};
    if (req.query.paymentStatus && PAYMENT_STATUSES.includes(req.query.paymentStatus)) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    const list = await col.find(filter).sort({ createdAt: -1 }).toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

app.get('/api/bills/:id', async (req, res) => {
  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid bill id' });
  }

  try {
    const col = await getCollection('bills');
    const bill = await col.findOne({ _id: objectId });
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

app.post('/api/bills', requireAdmin, async (req, res) => {
  const { orderId } = req.body;
  const orderObjectId = toObjectId(orderId);
  if (!orderObjectId) {
    return res.status(400).json({ error: 'Valid order id is required' });
  }

  try {
    const ordersCol = await getCollection('orders');
    const order = await ordersCol.findOne({ _id: orderObjectId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status !== 'served') {
      return res.status(400).json({ error: 'Bill can only be created for served orders' });
    }

    const billsCol = await getCollection('bills');
    const existing = await billsCol.findOne({ orderId: orderObjectId });
    if (existing) {
      return res.status(400).json({ error: 'Bill already exists for this order' });
    }

    const subtotal = order.subtotal;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const doc = {
      orderId: orderObjectId,
      tableNumber: order.tableNumber,
      lineItems: order.items,
      subtotal,
      taxRate: TAX_RATE,
      tax,
      total,
      paymentStatus: 'unpaid',
      paymentMethod: null,
      createdAt: new Date(),
    };

    const result = await billsCol.insertOne(doc);

    await ordersCol.updateOne(
      { _id: orderObjectId },
      { $set: { status: 'billed', updatedAt: new Date() } }
    );

    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Bill already exists for this order' });
    }
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

app.patch('/api/bills/:id/pay', requireAdmin, async (req, res) => {
  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid bill id' });
  }

  try {
    const result = await markBillAsPaid(objectId, { paymentMethod: 'manual' });
    res.json(result);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.status(500).json({ error: 'Failed to mark bill as paid' });
  }
});

app.post('/api/bills/:id/checkout-session', async (req, res) => {
  if (!isStripeEnabled()) {
    return res.status(503).json({ error: 'Stripe payments are not configured' });
  }

  const objectId = toObjectId(req.params.id);
  if (!objectId) {
    return res.status(400).json({ error: 'Invalid bill id' });
  }

  try {
    const billsCol = await getCollection('bills');
    const bill = await billsCol.findOne({ _id: objectId });
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    if (bill.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Bill is already paid' });
    }

    const amountCents = Math.round(Number(bill.total) * 100);
    if (!Number.isFinite(amountCents) || amountCents < 50) {
      return res.status(400).json({ error: 'Bill total is too low for card payment' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CURRENCY,
            product_data: {
              name: `Table ${bill.tableNumber ?? '—'} restaurant bill`,
              description: 'Restaurant dine-in bill',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        billId: String(bill._id),
      },
      success_url: `${CLIENT_URL}/bill/${bill._id}?payment=success`,
      cancel_url: `${CLIENT_URL}/bill/${bill._id}?payment=canceled`,
    });

    await billsCol.updateOne(
      { _id: objectId },
      {
        $set: {
          stripeCheckoutSessionId: session.id,
          updatedAt: new Date(),
        },
      }
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe checkout session failed:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.get('/api/payments/config', (req, res) => {
  res.json({
    stripeEnabled: isStripeEnabled(),
    publishableKey: STRIPE_PUBLISHABLE_KEY || null,
    currency: STRIPE_CURRENCY,
  });
});

// --- Dashboard stats ---

app.get('/api/dashboard/stats', requireAdmin, async (req, res) => {
  try {
    const dayStart = startOfToday();
    const dayEnd = endOfToday();

    const ordersCol = await getCollection('orders');
    const reservationsCol = await getCollection('reservations');
    const billsCol = await getCollection('bills');

    const [openOrdersCount, todayReservationsCount, unpaidBillsCount, paidToday] =
      await Promise.all([
        ordersCol.countDocuments({ status: { $nin: ['paid'] } }),
        reservationsCol.countDocuments({
          dateTime: { $gte: dayStart, $lt: dayEnd },
          status: { $ne: 'cancelled' },
        }),
        billsCol.countDocuments({ paymentStatus: 'unpaid' }),
        billsCol
          .find({
            paymentStatus: 'paid',
            createdAt: { $gte: dayStart, $lt: dayEnd },
          })
          .toArray(),
      ]);

    const todayRevenue = paidToday.reduce((sum, b) => sum + (b.total || 0), 0);

    res.json({
      openOrdersCount,
      todayReservationsCount,
      unpaidBillsCount,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
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
