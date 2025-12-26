const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const path = require('path');

// Load environment variables FIRST, before any modules that depend on them
require('dotenv').config({ path: __dirname + '/.env' });

// Now require modules that depend on environment variables
const { generateToken } = require('./utils/tokens');

const app = express();
const PORT = process.env.PORT;

// Validate CLIENT_URL is set
if (!process.env.CLIENT_URL) {
    console.error('\n❌ ERROR: CLIENT_URL is not defined!');
    console.error('Please add CLIENT_URL to your environment variables.');
    console.error('Example: https://job-cluster.vercel.app\n');
    process.exit(1);
}

// CORS configuration - Strict origin check (strip trailing slashes and whitespace)
const corsOptions = {
    origin: (origin, callback) => {
        // Normalize: strip trailing slash, trim whitespace, lowercase
        const allowed = (process.env.CLIENT_URL || '').trim().replace(/\/$/, '').toLowerCase();
        const requestOrigin = (origin || '').trim().replace(/\/$/, '').toLowerCase();
        
        // Log for debugging
        console.log('🔍 CORS check - Origin:', origin, '| Allowed:', allowed, '| Match:', requestOrigin === allowed);
        
        // Allow if no origin (same-origin requests) or if origins match
        if (!origin || requestOrigin === allowed) {
            callback(null, true);
        } else {
            console.error('❌ CORS blocked origin:', origin, '| Expected:', process.env.CLIENT_URL);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
// Serve static files from the project root (one level up)
app.use(express.static(path.join(__dirname, '..')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
// Validate SESSION_SECRET before use
if (!process.env.SESSION_SECRET) {
    console.error('\n❌ ERROR: SESSION_SECRET is not defined!');
    console.error('Please add SESSION_SECRET to your .env file in auth-server/');
    console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    console.error('See .env.example for the required format.\n');
    process.exit(1);
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Check for required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('\n❌ ERROR: Missing Google OAuth credentials!');
    console.error('Please copy .env.example to .env and configure your OAuth credentials.');
    console.error('See .env.example and QUICK_START.md for detailed instructions.\n');
    process.exit(1);
}

// Google OAuth Strategy
if (!process.env.GOOGLE_CALLBACK_URL) {
    console.error('\n❌ ERROR: GOOGLE_CALLBACK_URL is not defined!');
    console.error('Please add GOOGLE_CALLBACK_URL to your .env file in auth-server/');
    console.error('Example: https://jobcluster-2.onrender.com/auth/google/callback\n');
    process.exit(1);
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    // Store user info
    const user = {
        id: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        photoURL: profile.photos[0].value,
        provider: 'google'
    };

    return done(null, user);
}));

// Auth Routes

// Start Google OAuth flow
// Start Google OAuth flow
app.get('/auth/google', (req, res, next) => {
    // Store the referer (originating page) in session to redirect back correctly
    // Only use referer if CLIENT_URL is not set (for local development)
    if (!process.env.CLIENT_URL) {
    const referer = req.get('Referer');
    if (referer) {
        req.session.oauthReturnUrl = referer;
        console.log(`📌 Stored OAuth Return URL: ${referer}`);
        }
    }

    // Also support returnTo query param fallback
    if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo;
    }

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account' // Force account selection
    })(req, res, next);
});

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
  async (req, res) => {
    try {
      if (!req.user) {
        console.error('❌ No user from Google');
        return res.status(500).json({ success: false, error: 'No user data' });
      }

      const token = generateToken(req.user);

      if (!process.env.CLIENT_URL) {
        throw new Error('CLIENT_URL not set');
      }

      const redirectUrl = `${process.env.CLIENT_URL.replace(/\/$/, '')}/dashboard?token=${token}`;
      console.log('🔄 Redirecting to', redirectUrl);

      res.redirect(redirectUrl);

    } catch (err) {
      console.error('❌ OAuth callback error:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// Get current user (Protected)
app.get('/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { verifyToken } = require('./utils/tokens');
    const user = verifyToken(token);

    if (user) {
        return res.json(user);
    }
    
    res.status(401).json({ success: false, message: 'Unauthorized' });
});

// Logout
app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Failure page
app.get('/auth/google/failure', (req, res) => {
    if (!process.env.CLIENT_URL) {
        console.error('❌ CLIENT_URL missing for failure redirect');
        return res.status(500).json({ success: false, error: 'CLIENT_URL not set' });
    }
    res.redirect(`${process.env.CLIENT_URL}?auth=error`);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', port: PORT });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log('\n✅ Auth server running on port ' + PORT);
    console.log('✅ Google OAuth configured');
    if (process.env.GOOGLE_CALLBACK_URL) {
        console.log('✅ Callback URL: ' + process.env.GOOGLE_CALLBACK_URL);
    }
    if (process.env.CLIENT_URL) {
        console.log('✅ Client URL: ' + process.env.CLIENT_URL);
    }
    console.log('✅ Ready to accept authentication requests\n');
});

