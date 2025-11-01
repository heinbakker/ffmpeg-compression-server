/**
 * FFmpeg Compression API Server
 * Main entry point for the Express server
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;

const compressRoutes = require('./routes/compress');
const jobManager = require('./services/jobManager');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration - Only allow requests from your website
// This prevents other websites from using your API
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    // In production, you might want to disable this
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Get allowed origins from environment variable
    const allowedOrigins = process.env.ALLOWED_ORIGINS;
    
    // If ALLOWED_ORIGINS is not set, allow all (development mode)
    if (!allowedOrigins || allowedOrigins === '*') {
      if (process.env.NODE_ENV === 'production') {
        console.warn('[Server] WARNING: CORS is open to all origins in production! Set ALLOWED_ORIGINS.');
      }
      return callback(null, true);
    }

    // Split by comma and check if origin is allowed
    const allowed = allowedOrigins.split(',').map(o => o.trim());
    
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[Server] CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rate Limiting Configuration
// Limit compression job creation (most resource-intensive)
const compressionLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '10', 10), // Default: 10 requests per window
  message: {
    error: 'Too many compression requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/health' || req.path === '/'
});

// Apply rate limiting to compression routes only
app.use('/api/jobs', compressionLimiter);

// API Key Authentication Middleware
// Skip authentication for health check endpoint
app.use((req, res, next) => {
  // Allow health check without authentication
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  // Check for API key in header
  const apiKey = req.headers['x-api-key'];
  const requiredKey = process.env.API_KEY;

  // If API_KEY is not set, allow all requests (for development)
  if (!requiredKey) {
    console.warn('[Server] WARNING: API_KEY not set - API is open to everyone!');
    return next();
  }

  // If API key is provided, validate it
  if (apiKey && apiKey === requiredKey) {
    return next();
  }

  // No valid API key provided
  return res.status(401).json({
    error: 'Unauthorized. Please provide a valid API key in the X-API-Key header.'
  });
});

// Ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = '/tmp/uploads';
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`[Server] Upload directory ready: ${uploadDir}`);
  } catch (error) {
    console.error(`[Server] Failed to create upload directory:`, error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check if FFmpeg is available
    const { execSync } = require('child_process');
    let ffmpegAvailable = false;
    
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
      ffmpegAvailable = true;
    } catch {
      ffmpegAvailable = false;
    }

    const stats = jobManager.getStats();

    res.json({
      status: 'ok',
      ffmpeg: ffmpegAvailable ? 'available' : 'unavailable',
      timestamp: new Date().toISOString(),
      jobs: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Compression routes
app.use('/api', compressRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'FFmpeg Compression API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      createJob: 'POST /api/jobs',
      getJobStatus: 'GET /api/jobs/:jobId',
      download: 'GET /api/jobs/:jobId/download'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  
  const multer = require('multer');
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: `File too large. Maximum size: ${process.env.MAX_FILE_SIZE || 100}MB` 
      });
    }
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
async function startServer() {
  await ensureUploadDir();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] FFmpeg Compression API Server running on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Server] Max file size: ${process.env.MAX_FILE_SIZE || 100}MB`);
    console.log(`[Server] Allowed origins: ${process.env.ALLOWED_ORIGINS || '*'}`);
    console.log(`[Server] Rate limit: ${process.env.RATE_LIMIT_MAX || 10} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 60000)} minutes`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer().catch(error => {
  console.error('[Server] Failed to start server:', error);
  process.exit(1);
});

