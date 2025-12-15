/**
 * JobCluster Jobs API Server
 * 
 * Jooble API Integration with Redis Caching
 * Handles job search, trending jobs, and saved jobs
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables FIRST, before anything else
require('dotenv').config({ path: __dirname + '/.env' });

// Validate required environment variables (does not log actual values)
const { validateEnv, logEnvStatus } = require('./utils/envValidator');
validateEnv([
    'MONGODB_URI',
    'JWT_SECRET'
], 'JobCluster Main Server');

// Log status (shows if set, never shows actual values)
if (process.env.NODE_ENV !== 'production') {
    logEnvStatus([
        'PORT',
        'NODE_ENV',
        'MONGODB_URI',
        'REDIS_URL',
        'JOOBLE_API_KEY',
        'RABBITMQ_URL',
        'JWT_SECRET'
    ]);
}

const app = express();

// Connect to MongoDB (will be called after app setup)
const connectDB = require('./utils/db');

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/jobs')) {
        console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    }
    next();
});

// Routes
const atsRoutes = require('./routes/atsRoutes');
const savedJobsRoutes = require('./routes/saved_jobs');
const dashboardRoutes = require('./routes/dashboardRoutes');
const resumeHistoryRoutes = require('./routes/resumeHistoryRoutes');
const profileRoutes = require('./routes/profileRoutes');

app.use('/api/resume', atsRoutes);
app.use('/api/resume', resumeHistoryRoutes); // Resume history routes under /api/resume
app.use('/api/saved-jobs', savedJobsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);

// JOOBLE ROUTES - Must be registered before other /api/jobs routes
try {
    const jobRoutes = require('./routes/jobRoutes');
    app.use('/api/jobs', jobRoutes);
    console.log('✅ Job routes registered at /api/jobs');
    console.log('   - POST /api/jobs/search');
    console.log('   - GET /api/jobs');
} catch (error) {
    console.error('❌ Error loading jobRoutes:', error.message);
    console.error(error.stack);
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'JobCluster Jobs API Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'JobCluster Jobs API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            searchJobs: 'POST /api/jobs/search',
            trendingJobs: 'GET /api/jobs',
            savedJobs: 'GET /api/saved-jobs'
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler — MUST be last
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 5000;

// Start server after MongoDB connection
async function startServer() {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Then start the server
        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                  JOBCluster JOBS API SERVER                      ║
╠══════════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                                    ║
║  Search: POST /api/jobs/search                                   ║
║  Trending: GET /api/jobs                                         ║
║  Saved Jobs: GET /api/saved-jobs                                 ║
║  Health: GET /health                                             ║
║                                                                   ║
║  Features: Jooble API + Redis Cache                             ║
║  Cache TTL: 10 minutes                                           ║
╚══════════════════════════════════════════════════════════════════╝
            `);
            console.log(`✅ Server is running and ready to accept requests!`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
