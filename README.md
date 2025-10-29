# 👗 Fashion Fit - AI-Powered Wardrobe Management

<div align="center">

![Fashion Fit](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Express](https://img.shields.io/badge/Express-5-gray?style=for-the-badge&logo=express)

**An intelligent fashion management platform powered by custom AI computer vision and machine learning**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Documentation](#-documentation)

</div>

---

## 🎯 Overview

Fashion Fit is a full-stack web application that revolutionizes wardrobe management through AI-powered clothing detection, categorization, and personalized outfit recommendations. Built with modern technologies, it combines **custom computer vision**, **real-time image processing**, and **machine learning** to provide users with intelligent styling assistance.

### Key Highlights

- 🧠 **Custom AI Model**: Built-in computer vision system for clothing detection (no expensive API calls needed!)
- 📸 **Real-Time Detection**: Smart camera with automatic clothing recognition
- 🌍 **11 Languages**: Full internationalization support
- 🎨 **AI Styling**: Get personalized outfit recommendations powered by OpenAI
- 📊 **Analytics Dashboard**: Track your wardrobe and style insights
- 🔐 **Secure Auth**: Google OAuth integration

---

## ✨ Features

### 🎥 Smart Camera System
- Real-time clothing detection using custom computer vision
- Automatic categorization (shirt, pants, dress, etc.)
- Color detection and style analysis
- Bounding box visualization
- Click-to-save items to wardrobe

### 🤖 AI-Powered Recommendations
- Personalized outfit combinations
- Weather-based suggestions
- Occasion-aware styling
- Style preference learning
- Rating and feedback system

### 👔 Wardrobe Management
- Upload and organize clothing items
- Category-based filtering
- Color and style search
- Image upload with Cloudinary integration
- Wear tracking and analytics

### 💬 AI Fashion Stylist
- Chat-based styling assistant
- Context-aware recommendations
- Style tips and advice

### 🌐 Internationalization
- Support for 11 languages (EN, ES, FR, DE, IT, PT, RU, ZH, JA, KO, AR, HI)
- Dynamic language switching
- Persistent user preferences

### 📱 Dashboard
- Style statistics and insights
- Recent activity tracking
- Quick actions
- Weather-based outfit suggestions

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (Turbopack)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **API Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Passport.js (Google OAuth 2.0)
- **File Upload**: Multer + Cloudinary
- **Validation**: JWT tokens

### AI & ML
- **Custom Computer Vision**: Pixel analysis, HSV color detection
- **OpenAI Integration**: GPT-4 for smart tags and recommendations
- **Hybrid System**: Local AI + on-demand API enhancement

### DevOps & Tools
- **Package Manager**: npm
- **Development**: Nodemon, concurrently
- **Environment**: dotenv
- **Version Control**: Git

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials
- OpenAI API key (optional, for enhanced features)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fashion-fit.git
cd fashion-fit
```

2. **Backend Setup**
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Environment Variables

#### Backend (.env)
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_ENABLE_SMART_CAMERA=false
```

---

## 📁 Project Structure

```
fashion-fit/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, error handling
│   │   └── services/        # External service integrations
│   ├── server.js            # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services & AI models
│   │   └── public/         # Static assets
│   └── package.json
│
└── docs-system/            # Comprehensive documentation
```

---

## 📚 Documentation

Comprehensive documentation is available in the `docs-system/` folder:

- [Smart Camera System](./docs-system/SMART_CAMERA_SYSTEM.md)
- [Custom AI Model](./docs-system/CUSTOM_AI_MODEL.md)
- [Real Computer Vision](./docs-system/REAL_COMPUTER_VISION.md)
- [Hybrid AI System](./docs-system/HYBRID_AI_SYSTEM.md)
- [Troubleshooting Guide](./docs-system/SMART_CAMERA_TROUBLESHOOTING.md)

---

## 🎨 Key Features Explained

### Custom Computer Vision AI

Our custom AI model (`CustomClothingAI`) performs real image analysis:
- **Pixel Analysis**: Direct canvas pixel inspection
- **HSV Color Detection**: Accurate color identification
- **Shape Recognition**: Aspect ratio and region detection
- **Confidence Scoring**: Intelligent matching algorithm

### Hybrid AI System

- **Free Detection**: Local computer vision for basic categorization
- **Smart Enhancement**: Optional OpenAI integration for advanced tags
- **Cost Optimized**: Minimal API calls, maximum value

### Internationalization

- Custom `useTranslations` hook
- 11 language support
- Fallback to English for missing translations
- Persistent language preferences

---

## 🔒 Security

- Environment variables for sensitive data
- JWT token authentication
- OAuth 2.0 for social login
- MongoDB connection security
- CORS configuration
- Secure session management

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

Built with ❤️ as a portfolio project showcasing:
- Full-stack development capabilities
- AI/ML integration expertise
- Modern web development practices
- Production-ready code quality

---

## 🌟 Acknowledgments

- OpenAI for GPT API
- Next.js team for the amazing framework
- Framer Motion for smooth animations
- All contributors and open-source libraries used

---

<div align="center">

**Made with ⚡ Next.js, 🧠 Custom AI, and 💚 Open Source**

⭐ Star this repo if you find it helpful!

</div>

