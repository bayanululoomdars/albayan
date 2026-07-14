const express = require('express');
const router = express.Router();
const News = require('../models/News');
const GalleryItem = require('../models/GalleryItem');
const Contact = require('../models/Contact');
const Subscriber = require('../models/Subscriber');
const Slider = require('../models/Slider');
const SectionContent = require('../models/SectionContent');
const Admission = require('../models/Admission');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Story = require('../models/Story');
const HomeSettings = require('../models/HomeSettings');
const { OAuth2Client } = require('google-auth-library');
const { upload, uploadLocal, isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');

// Use a placeholder or real Client ID
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1014169622543-placeholder.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

// GET /api/auth/google/client-id
router.get('/auth/google/client-id', (req, res) => {
  res.json({ clientId: CLIENT_ID });
});

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
//  AUTH
// ══════════════════════════════════════════════════════════

router.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, name, email, picture } = payload;

    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = new User({ googleId: sub, name, email, picture });
      await user.save();
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// ══════════════════════════════════════════════════════════
//  GALLERY
// ══════════════════════════════════════════════════════════

// GET /api/gallery — Get all gallery items
router.get('/gallery', async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 }).populate('likes', 'name').populate('comments.user', 'name picture');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/gallery — Upload a gallery image or video
router.post('/gallery', (req, res) => {
  const uploader = getUploader();
  uploader.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) {
      console.error('Upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'Media upload failed' });
    }
    try {
      const { title, category, mediaType, mediaUrl, description, hashtags } = req.body;
      if (!title || !category) {
        return res.status(400).json({ success: false, message: 'Title and category are required' });
      }
      
      const itemData = {
        title,
        category,
        mediaType: mediaType || 'image',
        description: description || '',
        hashtags: hashtags ? hashtags.split(',').map(h => h.trim()).filter(h => h) : []
      };

      if (req.file) {
        itemData.imageUrl = isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename;
        itemData.cloudinaryId = req.file.filename || '';
      } else if (mediaType === 'video' && mediaUrl) {
        itemData.imageUrl = mediaUrl; // Store external URL here
      } else {
         return res.status(400).json({ success: false, message: 'Image/Video file or Video URL is required' });
      }

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

// POST /api/gallery/:id/like — Toggle Like
router.post('/gallery/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID required' });
    
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const index = item.likes.indexOf(userId);
    if (index === -1) {
      item.likes.push(userId); // Like
    } else {
      item.likes.splice(index, 1); // Dislike
    }
    await item.save();
    res.json({ success: true, likes: item.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/gallery/:id/comment — Add Comment
router.post('/gallery/:id/comment', async (req, res) => {
  try {
    const { userId, text } = req.body;
    if (!userId || !text) return res.status(400).json({ success: false, message: 'User ID and text required' });

    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.comments.push({ user: userId, text });
    await item.save();
    
    const populatedItem = await GalleryItem.findById(req.params.id).populate('comments.user', 'name picture');
    res.json({ success: true, comments: populatedItem.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/gallery/:id/comment/:commentId — Delete Comment
router.delete('/gallery/:id/comment/:commentId', async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.comments = item.comments.filter(c => c._id.toString() !== req.params.commentId);
    await item.save();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/sections/:id — Delete a section
router.delete('/sections/:id', async (req, res) => {
  try {
    await SectionContent.findOneAndDelete({ sectionId: req.params.id });
    res.json({ success: true, message: 'Section hidden successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════
//  ADMIN AUTH (simple password check)
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
//  ADMISSIONS
// ══════════════════════════════════════════════════════════

// GET /api/settings/admission — Get admission status
router.get('/settings/admission', async (req, res) => {
  try {
    let setting = await Settings.findOne({ key: 'isAdmissionOpen' });
    if (!setting) {
      setting = new Settings({ key: 'isAdmissionOpen', value: true });
      await setting.save();
    }
    res.json({ isOpen: setting.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/settings/admission — Update admission status
router.post('/settings/admission', async (req, res) => {
  try {
    const { isOpen } = req.body;
    let setting = await Settings.findOne({ key: 'isAdmissionOpen' });
    if (!setting) {
      setting = new Settings({ key: 'isAdmissionOpen', value: isOpen });
    } else {
      setting.value = isOpen;
    }
    await setting.save();
    res.json({ success: true, isOpen: setting.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admissions — Get all admissions (admin)
router.get('/admissions', async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admission — Submit simplified admission (5 fields only)
router.post('/admission', async (req, res) => {
  try {
    const { name, dob, fatherName, motherName, phone } = req.body;
    if (!name || !fatherName || !motherName || !phone) {
      return res.status(400).json({ success: false, message: 'Name, Father Name, Mother Name, and Phone are required' });
    }
    const admission = new Admission({ name, dob: dob || '', fatherName, motherName, phone });
    await admission.save();
    res.json({ success: true, message: 'Admission application submitted successfully!' });
  } catch (err) {
    console.error('Admission save error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit admission application' });
  }
});

// GET /api/settings/poster — Get admission poster URL
router.get('/settings/poster', async (req, res) => {
  try {
    let setting = await Settings.findOne({ key: 'admissionPosterUrl' });
    res.json({ posterUrl: setting ? setting.value : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/settings/poster — Upload admission poster
router.post('/settings/poster', (req, res) => {
  const uploader = getUploader();
  uploader.single('poster')(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(500).json({ success: false, message: 'Poster upload failed' });
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const posterUrl = isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename;
      let setting = await Settings.findOne({ key: 'admissionPosterUrl' });
      if (!setting) {
        setting = new Settings({ key: 'admissionPosterUrl', value: posterUrl });
      } else {
        setting.value = posterUrl;
      }
      await setting.save();
      res.json({ success: true, posterUrl });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
});

// GET /api/settings/admission-banner — Get admission banner text settings
router.get('/settings/admission-banner', async (req, res) => {
  try {
    let titleSetting = await Settings.findOne({ key: 'admissionBannerTitle' });
    let contentSetting = await Settings.findOne({ key: 'admissionBannerContent' });
    res.json({
      title: titleSetting ? titleSetting.value : '',
      content: contentSetting ? contentSetting.value : ''
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/settings/admission-banner — Update admission banner text settings
router.post('/settings/admission-banner', async (req, res) => {
  try {
    const { title, content } = req.body;
    // Save title
    let titleSetting = await Settings.findOne({ key: 'admissionBannerTitle' });
    if (!titleSetting) {
      titleSetting = new Settings({ key: 'admissionBannerTitle', value: title || '' });
    } else {
      titleSetting.value = title || '';
    }
    await titleSetting.save();
    // Save content
    let contentSetting = await Settings.findOne({ key: 'admissionBannerContent' });
    if (!contentSetting) {
      contentSetting = new Settings({ key: 'admissionBannerContent', value: content || '' });
    } else {
      contentSetting.value = content || '';
    }
    await contentSetting.save();
    res.json({ success: true, title: titleSetting.value, content: contentSetting.value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/settings/poster — Remove admission poster
router.delete('/settings/poster', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'admissionPosterUrl' });
    if (setting) {
      // Try to delete from Cloudinary if applicable
      if (isCloudinaryConfigured() && setting.value) {
        try {
          const publicId = setting.value.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (e) { /* ignore */ }
      }
      setting.value = null;
      await setting.save();
    }
    res.json({ success: true, message: 'Poster removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/settings/gallery-categories — Get custom categories
router.get('/settings/gallery-categories', async (req, res) => {
  try {
    let setting = await Settings.findOne({ key: 'galleryCategories' });
    if (!setting) {
      setting = new Settings({ key: 'galleryCategories', value: ['Programme', 'Collections', 'Design'] });
      await setting.save();
    }
    res.json({ categories: setting.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/settings/gallery-categories — Add a category
router.post('/settings/gallery-categories', async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ success: false, message: 'Category name required' });
    let setting = await Settings.findOne({ key: 'galleryCategories' });
    if (!setting) {
      setting = new Settings({ key: 'galleryCategories', value: ['Programme', 'Collections', 'Design'] });
    }
    if (!setting.value.includes(category)) setting.value.push(category);
    setting.markModified('value');
    await setting.save();
    res.json({ success: true, categories: setting.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/settings/gallery-categories/:name — Remove a category
router.delete('/settings/gallery-categories/:name', async (req, res) => {
  try {
    let setting = await Settings.findOne({ key: 'galleryCategories' });
    if (!setting) return res.status(404).json({ message: 'Not found' });
    setting.value = setting.value.filter(c => c !== req.params.name);
    setting.markModified('value');
    await setting.save();
    res.json({ success: true, categories: setting.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

// GET /api/settings/burda — Get Burda Team image URL
router.get('/settings/burda', async (req, res) => {
  try {
    let setting = await Settings.findOne({ key: 'burdaTeamImageUrl' });
    res.json({ imageUrl: setting ? setting.value : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/settings/burda — Upload Burda Team image
router.post('/settings/burda', (req, res) => {
  const uploader = getUploader();
  uploader.single('burda')(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(500).json({ success: false, message: 'Upload failed' });
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const imageUrl = isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename;
      let setting = await Settings.findOne({ key: 'burdaTeamImageUrl' });
      if (!setting) {
        setting = new Settings({ key: 'burdaTeamImageUrl', value: imageUrl });
      } else {
        setting.value = imageUrl;
      }
      await setting.save();
      res.json({ success: true, imageUrl });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
});

// GET /api/stories — Get active (non-expired) stories
router.get('/stories', async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/stories/all — Get ALL stories including expired (admin)
router.get('/stories/all', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/stories — Upload a story
router.post('/stories', (req, res) => {
  const uploader = getUploader();
  uploader.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(500).json({ success: false, message: 'Upload failed' });
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'Image required' });
      const imageUrl = isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename;
      const daysActive = parseInt(req.body.daysActive) || 1;
      const story = new Story({
        title: req.body.title || '',
        imageUrl,
        cloudinaryId: req.file.filename || '',
        daysActive
      });
      await story.save();
      res.json({ success: true, data: story });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
});

// DELETE /api/stories/:id
router.delete('/stories/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.cloudinaryId && isCloudinaryConfigured()) {
      try { await cloudinary.uploader.destroy(story.cloudinaryId); } catch (e) {}
    }
    await Story.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/gallery/:id/pin — Toggle pin status
router.post('/gallery/:id/pin', async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.pinned = !item.pinned;
    await item.save();
    res.json({ success: true, pinned: item.pinned });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/home-settings
router.get('/home-settings', async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (!settings) {
      settings = new HomeSettings();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/home-settings — Update home settings
router.post('/home-settings', async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (!settings) settings = new HomeSettings();
    const fields = ['statsStudents', 'statsUstads', 'statsYears', 'statsAlumni',
      'principalName', 'principalTitle', 'principalBio',
      'footerMudarrisName', 'footerMudarrisTitle', 'footerMudarrisDetail'];
    fields.forEach(f => { if (req.body[f] !== undefined) settings[f] = req.body[f]; });
    settings.updatedAt = Date.now();
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/home-settings/principal-image — Upload principal image
router.post('/home-settings/principal-image', (req, res) => {
  const uploader = getUploader();
  uploader.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(500).json({ success: false, message: 'Upload failed' });
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
      const imageUrl = isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename;
      let settings = await HomeSettings.findOne();
      if (!settings) settings = new HomeSettings();
      settings.principalImageUrl = imageUrl;
      await settings.save();
      res.json({ success: true, imageUrl });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
});

// POST /api/home-settings/assistant — Add assistant mudarris
router.post('/home-settings/assistant', (req, res) => {
  const uploader = getUploader();
  uploader.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(500).json({ success: false, message: 'Upload failed' });
    try {
      const { name, role } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Name required' });
      let settings = await HomeSettings.findOne();
      if (!settings) settings = new HomeSettings();
      const assistant = { name, role: role || 'Assistant Mudarris' };
      if (req.file) {
        assistant.imageUrl = isCloudinaryConfigured() ? req.file.path : '/img/uploads/' + req.file.filename;
        assistant.cloudinaryId = req.file.filename || '';
      }
      settings.assistantMudarris.push(assistant);
      await settings.save();
      res.json({ success: true, data: settings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
});

// DELETE /api/home-settings/assistant/:id — Delete assistant
router.delete('/home-settings/assistant/:id', async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (!settings) return res.status(404).json({ message: 'Not found' });
    settings.assistantMudarris = settings.assistantMudarris.filter(
      a => a._id.toString() !== req.params.id
    );
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/home-settings/branch — Add branch
router.post('/home-settings/branch', async (req, res) => {
  try {
    const { name, location, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    let settings = await HomeSettings.findOne();
    if (!settings) settings = new HomeSettings();
    settings.branches.push({ name, location: location || '', description: description || '' });
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/home-settings/branch/:id — Delete branch
router.delete('/api/home-settings/branch/:id', async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (!settings) return res.status(404).json({ message: 'Not found' });
    settings.branches = settings.branches.filter(
      b => b._id.toString() !== req.params.id
    );
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
