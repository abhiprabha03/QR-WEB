const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const cors = require("cors");

// Environment variables - in production, use environment variables for these values
const port = process.env.PORT || 9090;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key';

// Middleware setup
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cors()); // Enable CORS

// Session configuration
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/home/sign-up');
    }
    next();
}

// Middleware to check if user is already logged in
function redirectIfAuthenticated(req, res, next) {
    if (req.session.user) {
        return res.redirect('/home/sign-up/welcome');
    }
    next();
}

// Route handlers
// Home page
app.get("/home", (req, res) => {
    res.render("index");
});

// Upgrade page
app.get("/home/upgrade", (req, res) => {
    res.render("upgrade");
});

// Sign-up page
app.get("/home/sign-up", redirectIfAuthenticated, (req, res) => {
    res.render("signup");
});

// QR codes page (protected route)
app.get("/home/qr-codes", isAuthenticated, (req, res) => {
    res.send("You can customize QR codes here");
});

// Search results page
app.get("/home/searched-results", (req, res) => {
    const query = req.query.q || '';
    res.render("search-results", { query });
});

// Settings page (protected route)
app.get("/home/settings", isAuthenticated, (req, res) => {
    res.send("Choose your settings");
});

// Welcome page (protected route)
app.get("/home/sign-up/welcome", isAuthenticated, (req, res) => {
    res.render("welcome", { user: req.session.user });
});

// Store user data in session
app.post('/store-user', (req, res) => {
    try {
        if (!req.body.user) {
            return res.status(400).json({
                success: false,
                message: 'No user data provided'
            });
        }

        // Store user data in session
        req.session.user = {
            uid: req.body.user.uid,
            email: req.body.user.email,
            displayName: req.body.user.displayName,
            photoURL: req.body.user.photoURL,
            createdAt: new Date()
        };

        res.status(200).json({
            success: true,
            message: 'User stored successfully'
        });
    } catch (error) {
        console.error('Error storing user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error logging out'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler - Keep this as the last route
app.use((req, res) => {
    res.status(404).render('404', { url: req.url });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});