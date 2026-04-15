const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const dotenv  = require('dotenv');

dotenv.config();

const connectDB   = require('./config/db');
const { seedAll } = require('./utils/seed');

const app = express();

connectDB().then(() => seedAll());

// ─── CORS — must come BEFORE all routes ──────────────────────────────────────
// Supports multiple allowed origins (comma-separated in CLIENT_URL env var)
// e.g. CLIENT_URL=https://placepool.vercel.app
// Also always allows localhost for local development
const getAllowedOrigins = () => {
  const origins = ['http://localhost:3000', 'http://localhost:5173'];
  const clientUrl = process.env.CLIENT_URL || '';
  // Support comma-separated list of origins
  clientUrl.split(',').map(o => o.trim()).filter(Boolean).forEach(o => {
    if (!origins.includes(o)) origins.push(o);
  });
  return origins;
};

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps, curl, Railway health checks)
    if (!origin) return callback(null, true);
    const allowed = getAllowedOrigins();
    if (allowed.includes(origin)) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin} | Allowed: ${allowed.join(', ')}`);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // Some older browsers choke on 204
};

// Handle preflight for ALL routes — Railway requires this explicitly
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/dsa',       require('./routes/dsaRoutes'));
app.use('/api/subjects',  require('./routes/subjectRoutes'));
app.use('/api/aptitude',  require('./routes/aptitudeRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/progress',  require('./routes/progressRoutes'));

// Health check
app.get('/', (_, res) => res.json({ message: 'PlacePool API ✅', env: process.env.NODE_ENV }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀  PlacePool API running on port ${PORT} | NODE_ENV=${process.env.NODE_ENV} | Allowed origins: ${getAllowedOrigins().join(', ')}`)
);
