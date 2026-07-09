const express = require('express');
const router = express.Router();
const News = require('../models/News');
const GalleryItem = require('../models/GalleryItem');
const Contact = require('../models/Contact');
const Subscriber = require('../models/Subscriber');
const Slider = require('../models/Slider');
const SectionContent = require('../models/SectionContent');
const Admission = require('../models/Admission');
const { upload, uploadLocal, isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');

// ── Helper: get the right upload middleware ────────────────
function getUploader() {
  return isCloudinaryConfigured() ? upload : uploadLocal;
}

// ══════════════════════════════════════════════════════════
//  CONTACT FORM
// ══════════════════════════════════════════════════════════

// POST /api/contact — Save contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    res.json({ success: true, message: 'Your message has been sent. Thank you!' });
  } catch (err) {
    console.error('Contact save error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

// GET /api/contacts — Get all contact submissions (admin)
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/contacts/:id — Delete a contact (admin)
router.delete('/contacts/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════
//  NEWSLETTER SUBSCRIBERS
// ══════════════════════════════════════════════════════════

// POST /api/subscribe — Save newsletter subscriber
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed!' });
    }
    const subscriber = new Subscriber({ email });
    await subscriber.save();
    res.json({ success: true, message: 'Successfully subscribed!' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again.' });
  }
});

// GET /api/subscribers — Get all subscribers (admin)
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════
//  NEWS
// ══════════════════════════════════════════════════════════

// GET /api/news — Get all news
router.get('/news', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/news — Create a news item (with optional image)
router.post('/news', (req, res) => {
  const uploader = getUploader();
  uploader.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) {
      console.error('Upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required' });
      }
      const newsData = { title, description };
      if (req.file) {
        newsData.imageUrl = isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename;
        newsData.cloudinaryId = req.file.filename || '';
      }
      const news = new News(newsData);
      await news.save();
      res.json({ success: true, message: 'News added successfully!', data: news });
    } catch (err) {
      console.error('News save error:', err);
      res.status(500).json({ success: false, message: 'Failed to add news' });
    }
  });
});

// DELETE /api/news/:id — Delete a news item
router.delete('/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    // Delete image from Cloudinary if exists
    if (news.cloudinaryId && isCloudinaryConfigured()) {
      try { await cloudinary.uploader.destroy(news.cloudinaryId); } catch (e) { /* ignore */ }
    }
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'News deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════
//  GALLERY
// ══════════════════════════════════════════════════════════

// GET /api/gallery — Get all gallery items
router.get('/gallery', async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/gallery — Upload a gallery image
router.post('/gallery', (req, res) => {
  const uploader = getUploader();
  uploader.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) {
      console.error('Upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }
    try {
      const { title, category } = req.body;
      if (!title || !category) {
        return res.status(400).json({ success: false, message: 'Title and category are required' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Image is required' });
      }
      const itemData = {
        title,
        category,
        imageUrl: isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename,
        cloudinaryId: req.file.filename || '',
      };
      const item = new GalleryItem(itemData);
      await item.save();
      res.json({ success: true, message: 'Gallery image added!', data: item });
    } catch (err) {
      console.error('Gallery save error:', err);
      res.status(500).json({ success: false, message: 'Failed to add gallery image' });
    }
  });
});

// DELETE /api/gallery/:id — Delete a gallery item
router.delete('/gallery/:id', async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });
    if (item.cloudinaryId && isCloudinaryConfigured()) {
      try { await cloudinary.uploader.destroy(item.cloudinaryId); } catch (e) { /* ignore */ }
    }
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════
//  SLIDERS
// ══════════════════════════════════════════════════════════

// GET /api/sliders — Get all sliders
router.get('/sliders', async (req, res) => {
  try {
    const items = await Slider.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/sliders — Upload a slider
router.post('/sliders', (req, res) => {
  const uploader = getUploader();
  uploader.single('media')(req, res, async (uploadErr) => {
    if (uploadErr) {
      console.error('Upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'Media upload failed' });
    }
    try {
      const { title, mediaType } = req.body;
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Media file is required' });
      }
      
      const sliderData = {
        title: title || '',
        mediaType: mediaType || 'image',
        mediaUrl: isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename,
        cloudinaryId: req.file.filename || '',
      };
      const slider = new Slider(sliderData);
      await slider.save();
      res.json({ success: true, message: 'Slider added!', data: slider });
    } catch (err) {
      console.error('Slider save error:', err);
      res.status(500).json({ success: false, message: 'Failed to add slider' });
    }
  });
});

// DELETE /api/sliders/:id — Delete a slider
router.delete('/sliders/:id', async (req, res) => {
  try {
    const item = await Slider.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Slider not found' });
    if (item.cloudinaryId && isCloudinaryConfigured()) {
      try { await cloudinary.uploader.destroy(item.cloudinaryId); } catch (e) { /* ignore */ }
    }
    await Slider.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Slider deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════
//  SECTION CONTENTS
// ══════════════════════════════════════════════════════════

// GET /api/sections — Get all sections
router.get('/sections', async (req, res) => {
  try {
    const sections = await SectionContent.find();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/sections/:id — Update a section
router.put('/sections/:id', async (req, res) => {
  try {
    const { title, description, readMoreLink } = req.body;
    const section = await SectionContent.findOneAndUpdate(
      { sectionId: req.params.id },
      { title, description, readMoreLink, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: section });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════
//  ADMIN AUTH (simple password check)
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
//  ADMISSIONS
// ══════════════════════════════════════════════════════════

// GET /api/admissions — Get all admissions (admin)
router.get('/admissions', async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admission — Submit a new admission application
router.post('/admission', (req, res) => {
  const uploader = getUploader();
  uploader.single('photo')(req, res, async (uploadErr) => {
    if (uploadErr) {
      console.error('Photo upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'Photo upload failed' });
    }
    try {
      const {
        name, fatherName, phone, motherName, houseName, homePhone,
        place, postOffice, district, pincode, dob, bloodGroup,
        educationReligious, educationSecular, guardianName, relationship, guardianPhone
      } = req.body;

      if (!name || !fatherName || !phone || !motherName || !houseName ||
          !place || !postOffice || !district || !pincode || !dob || !bloodGroup ||
          !educationReligious || !educationSecular || !guardianName || !relationship || !guardianPhone) {
        return res.status(400).json({ success: false, message: 'All required fields must be completed' });
      }

      const admissionData = {
        name, fatherName, phone, motherName, houseName, homePhone,
        place, postOffice, district, pincode, dob, bloodGroup,
        educationReligious, educationSecular, guardianName, relationship, guardianPhone
      };

      if (req.file) {
        admissionData.imageUrl = isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename;
      }

      const admission = new Admission(admissionData);
      await admission.save();
      res.json({ success: true, message: 'Admission application submitted successfully!' });
    } catch (err) {
      console.error('Admission save error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit admission application' });
    }
  });
});

// DELETE /api/admissions/:id — Delete an admission application
router.delete('/admissions/:id', async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    
    // Attempt deleting image if exists on Cloudinary
    if (admission.imageUrl && isCloudinaryConfigured()) {
      try {
        const publicId = admission.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) { /* ignore */ }
    }
    
    await Admission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admission deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

module.exports = router;
