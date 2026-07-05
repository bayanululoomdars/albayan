# AL BAYAN MEDIA — Muttichira Bayanul Uloom Dars

A modern, professional website and web application for **Muttichira Bayanul Uloom Dars**, a prominent Islamic educational institution.

## 🚀 Features

- **Modern UI/UX**: Professional glassmorphism design, smooth animations, and responsive layout.
- **Dynamic Content**: Latest News and Gallery sections are dynamic and can be updated without touching the code.
- **Admin Panel**: Secure backend interface to manage news, upload gallery images, and view contact messages.
- **Cloudinary Integration**: Automatic image optimization and hosting for gallery uploads.
- **MongoDB Database**: Securely stores all dynamic content and form submissions.
- **Docker Support**: Easy deployment and containerization out of the box.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Bootstrap 4
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Storage**: Cloudinary
- **Deployment**: Docker ready

## 💻 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A MongoDB cluster (Atlas or local)
- Cloudinary Account

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` file is configured with the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SESSION_SECRET=your_secret_key
   ADMIN_PASSWORD=your_admin_password
   PORT=3000
   ```

3. **Start the Server**
   ```bash
   npm run dev
   # or
   npm start
   ```

4. **Access the App**
   - Website: `http://localhost:3000`
   - Admin Panel: `http://localhost:3000/admin.html`

## 🐳 Docker Deployment

To run the application using Docker:

```bash
docker-compose up --build -d
```

## 📝 License
© Copyright AL BAYAN MEDIA WING. All Rights Reserved.
