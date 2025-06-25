# 🤖 PyBot — AI Powered Python Learning Companion

**PyBot** is an AI-powered voice and chat assistant built to support users in learning Python through natural and interactive conversations, improving resumes with AI-guided suggestions and insights and preparing for interviews with tailored questions and voice-based mock sessions. Powered by **Next.js**, **Flask**, **Appwrite**, **Google Gemini** & **Vapi**, PyBot provides real-time, intelligent responses via both text and voice, creating an engaging and accessible learning experience.

![PyBot](https://github.com/user-attachments/assets/4f5b93a1-0617-439c-b9ba-066478c255c4)

## ⚙️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-indigo?style=for-the-badge)
![MagicUI](https://img.shields.io/badge/MagicUI-pink?style=for-the-badge)
![Vapi](https://img.shields.io/badge/Vapi-50C878?style=for-the-badge)

## 🎞️ Demo Video

https://github.com/user-attachments/assets/8d2e44f0-7d85-42b4-b01e-4a4aeccdc7d7

## 🚀 Features

- 🎙️ Voice-based DSA interview simulation using Vapi
- 💬 Text chat responses supported by Google Gemini
- ✍️ Real-time transcription and response analysis
- 📊 Personalized dashboard, quizzes (along with progress tracking) & resume analysis
- ✅ Appwrite-based authentication with email verification
- 🔐 Secure storage of user progress and data

## 📁 Project Structure

```
pybot/
├── frontend/         
│   ├── app/          
│   ├── components/
│   ├── lib/         
│   └── public/
├── backend/         
│   ├── app.py
│   └── utils/
└── README.md
```

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/devikaharshey/pybot.git
cd pybot
```

### 2. Set Up Appwrite

- Create a project at [Appwrite Cloud](https://appwrite.io)
- Enable Email/Password Authentication
- Configure Email Verification URL:  
  `https://pybot-ecru.vercel.app/verify`
- Copy your **Project ID** and **API Endpoint**

### 3. Configure Environment Variables

#### `frontend/.env.local`

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
```

#### `backend/.env`

```env
VAPI_API_KEY=your_vapi_key
```

### 4. Run Locally

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## ✨ Deployment

- **Frontend**: Vercel  
- **Backend**: Any Flask-compatible host (e.g., Render, Railway)  
- **Database/Auth**: [Appwrite Cloud](https://cloud.appwrite.io)

## 🤝 Contributing

Contributions, feature requests, and bug reports are welcome!  
Feel free to fork the project and open a pull request.

## 📜 License

MIT © [Devika Harshey](https://github.com/devikaharshey)
