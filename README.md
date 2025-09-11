# MindBridge 🧠

**Transform any topic into personalized study materials with AI-powered learning tools.**

MindBridge is a full-stack MERN application that leverages artificial intelligence to create personalized learning experiences. Generate summaries, flashcards, and interactive quizzes instantly to accelerate your learning journey.

## ✨ Features

### 🎯 Core Learning Tools
- **Smart Summaries**: Get concise, AI-generated summaries of complex topics that highlight key concepts
- **Interactive Flashcards**: Create flashcards automatically from study materials with spaced repetition
- **Dynamic Quizzes**: Test knowledge with adaptive quizzes that identify weak areas
- **Progress Tracking**: Monitor learning progress across multiple topics and sessions

### 🔐 User Management
- **Secure Authentication**: JWT-based authentication with Appwrite backend
- **User Profiles**: Personalized dashboard with learning statistics
- **Session Management**: Track study sessions and topic progress

### 🎨 Modern UI/UX
- **Neobrutalism Design**: Bold, accessible design with high contrast
- **Dark/Light Theme**: Toggle between themes for comfortable studying
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive Components**: Smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Markdown** - Markdown rendering with syntax highlighting

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Appwrite** - Backend-as-a-Service for authentication and database
- **AI Integration** - Uses Groq API for generating summaries, flashcards, and quizzes, using the "llama-3.3-70b-versatile" model 
- **JWT** - JSON Web Tokens for authentication
- **Express Validator** - Input validation and sanitization

### Development & Deployment
- **ESLint** - Code linting and formatting
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Rate Limiting** - API rate limiting protection

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Appwrite account and project
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindbridge.git
   cd mindbridge
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

#### Backend Environment (.env)
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_USERS_COLLECTION_ID=your-users-collection-id
APPWRITE_STUDY_SESSIONS_COLLECTION_ID=your-study-sessions-collection-id

# AI Provider Configuration
AI_PROVIDER=groq  
GROQ_API_KEY=your-groq-api-key

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment (.env)
Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

### Database Setup (Appwrite)

1. Create an Appwrite project
2. Set up the following collections:
   - **Users Collection**: Store user profiles
   - **Study Sessions Collection**: Track learning sessions
3. Configure authentication settings
4. Set up proper permissions for collections

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
mindbridge/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   └── app.js          # Express app setup
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔄 How It Works

1. **Input Your Topic**: Enter any concept, subject, or question you need help understanding
2. **AI Creates Materials**: Advanced AI generates personalized summaries, flashcards, and quizzes
3. **Learn Your Way**: Choose your preferred study method and track your progress

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### AI Generation
- `POST /api/ai/summary` - Generate topic summary
- `POST /api/ai/flashcards` - Generate flashcards
- `POST /api/ai/quiz` - Generate quiz questions
- `POST /api/ai/explanation` - Get topic explanation

### User Data
- `POST /api/user/study-session` - Record study session
- `GET /api/user/dashboard/:userId` - Get dashboard data
- `GET /api/user/topic/:topicId/sessions` - Get topic sessions
- `PUT /api/user/topic/:topicId/quiz` - Update quiz results

## 🚀 Deployment

### Backend Deployment (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds

### Frontend Deployment (Appwrite Sites)
1. Connect your repository to Appwrite Sites
2. Set environment variables in Appwrite Sites dashboard
3. Deploy with automatic builds

## 🌟 Purpose

This project is made as a submission for the Appwrite Sites hackathon, and is an MVP. It is a learning platform that uses AI to generate personalized materials for students, and track their progress.


## 🙏 Acknowledgments

- **Appwrite** - Backend-as-a-Service platform
- **Groq API** - AI language models
- **Tailwind CSS** - Styling framework
- **Lucide** - Icon library
- **React** - Frontend library
- **React Router** - Routing library
- **React Query** - Data fetching library
- **React Markdown** - Markdown rendering library
- **neobrutalism.dev** - Amazing neobrutalistic components for UI, based on shadcn components


**Made with ❤️ for learners everywhere**