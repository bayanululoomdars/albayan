require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ─────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Page Routes ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(['/latest-news', '/lastest-news', '/lastest news', '/latestnews'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'news.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/admission', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admission.html'));
});

app.get(['/about', '/about-us', '/about us', '/about  us'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get(['/contact', '/contact-us', '/contact us'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── Connect to MongoDB & Start Server ──────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    app.listen(PORT, () => {
      console.log(`🚀 AL BAYAN server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    // Start server anyway so static site works
    app.listen(PORT, () => {
      console.log(`⚠️  Server running WITHOUT database at http://localhost:${PORT}`);
    });
  });
