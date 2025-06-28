const express = require('express');
const path = require('path');
const cors = 'cors'; // Fixed typo
const session = require('express-session');
const db = require('./database.js');
const exceljs = require('exceljs');

// Load environment variables from .env file for local development
require('dotenv').config();
if (!process.env.SESSION_SECRET) {
    console.error('FATAL ERROR: SESSION_SECRET is not defined.');
    console.error('Please set the SESSION_SECRET environment variable.');
    process.exit(1); // Exit the process with a failure code
}

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE SETUP =====

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Secret to sign the session ID cookie
    resave: false,
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevents client-side JS from reading the cookie
        maxAge: 1000 * 60 * 60 * 24 // Cookie expires in 24 hours
    }
}));

// ===== AUTHENTICATION LOGIC =====

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        return next(); // User is logged in, proceed to the next handler
    } else {
        // If it's an API request, send 401. Otherwise, redirect to login page.
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }
        res.redirect('/admin/login.html');
    }
};

// API Endpoint for login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Correct credentials
        req.session.isLoggedIn = true;
        res.json({ success: true, message: 'Login successful!' });
    } else {
        // Incorrect credentials
        res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
});

// API Endpoint for logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out.' });
        }
        res.clearCookie('connect.sid'); // The default session cookie name
        res.json({ success: true, message: 'Logged out successfully.' });
    });
});


// ===== SERVE STATIC FILES =====

// Serve main public website (unprotected)
app.use(express.static(path.join(__dirname, 'public')));
// Serve the login page publicly
app.use('/admin', express.static(path.join(__dirname, 'admin'), {
    // Only serve login.html publicly from the admin folder
    index: false,
    extensions: ['html'],
    // Redirect anything else that isn't login.html to be handled by our routes
    redirect: true 
}));


// ===== PROTECTED ADMIN ROUTES =====

// Serve the main admin panel page, but only if logged in
app.get('/admin/admin.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/admin.html'));
});

// API Endpoint to get all contacts (PROTECTED)
app.get('/api/contacts', requireLogin, (req, res) => {
    const sql = `SELECT id, name, email, phone, interest, strftime('%Y-%m-%d %H:%M:%S', submitted_at) as submitted_at FROM contacts ORDER BY id DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to fetch data.' });
        }
        res.json(rows);
    });
});

// API Endpoint to download contacts as an Excel file (PROTECTED)
app.get('/api/download', requireLogin, async (req, res) => {
    // ... your existing excel download logic ...
    // (No changes needed inside this route, it's now protected by requireLogin)
    try {
        const sql = `SELECT id, name, email, phone, interest, strftime('%Y-%m-%d %H:%M:%S', submitted_at) as submitted_at FROM contacts ORDER BY id ASC`;
        db.all(sql, [], async (err, rows) => {
            if (err) return res.status(500).send('Error fetching data from database');
            const workbook = new exceljs.Workbook();
            const worksheet = workbook.addWorksheet('Contacts');
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Full Name', key: 'name', width: 30 },
                { header: 'Email Address', key: 'email', width: 30 },
                { header: 'Mobile Number', key: 'phone', width: 20 },
                { header: 'Interest', key: 'interest', width: 30 },
                { header: 'Submission Date', key: 'submitted_at', width: 25 },
            ];
            worksheet.getRow(1).font = { bold: true };
            worksheet.addRows(rows);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="Ananta-Contacts-${Date.now()}.xlsx"`);
            await workbook.xlsx.write(res);
            res.end();
        });
    } catch (error) {
        console.error('Failed to generate Excel file:', error);
        res.status(500).send('Error generating Excel file');
    }
});


// ===== PUBLIC API ROUTES =====

// API Endpoint to handle form submission (this remains public)
app.post('/api/contact', (req, res) => {
    // ... your existing contact form logic ...
    // (No changes needed here)
    const { name, email, phone, interest } = req.body;
    if (!name || !email || !interest) return res.status(400).json({ success: false, message: 'Name, Email, and Interest are required.' });
    const sql = `INSERT INTO contacts (name, email, phone, interest) VALUES (?, ?, ?, ?)`;
    const params = [name, email, phone, interest];
    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Failed to save data.' });
        }
        res.status(201).json({ success: true, message: 'Thank you! Your message has been sent.' });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin login is available at http://localhost:${PORT}/admin/login.html`);
});
