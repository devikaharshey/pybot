# 🤖 PyBot – AI Voice & Chat Assistant

**PyBot** is an AI-powered voice and chat assistant built with a Flask + Python backend and a sleek Next.js frontend. It uses **OpenRouter** for natural language responses and **Vapi** for voice interactivity. Data is managed with **Appwrite**, making the app fully modern, scalable, and serverless-ready.
![image](https://github.com/user-attachments/assets/b7d031c0-54eb-4093-ad7a-98f0435ef752)

## ⚙️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge\&logo=next.js\&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge\&logo=flask\&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge\&logo=python\&logoColor=white)
![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge\&logo=appwrite\&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-blueviolet?style=for-the-badge)
![Vapi](https://img.shields.io/badge/Vapi-Voice%20Agent-yellowgreen?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge\&logo=tailwind-css\&logoColor=white)
![MagicUI](https://img.shields.io/badge/MagicUI%20?style=for-the-badge\&logo=magicui\&labelColor=pink)
![Vercel](https://img.shields.io/badge/Vercel-000?style=for-the-badge\&logo=vercel\&logoColor=white)

## 📦 Features

* ✅ **Conversational AI** via OpenRouter
* 🔊 **Real-time Voice Agent** using Vapi
* 📡 **Backend-frontend integration** via REST APIs
* 💾 **Cloud-native storage** with Appwrite
* 🚀 **Deploy-ready** with separate frontend & backend structure

## ▶️ How to Use It?

1. **Open the app** in your browser at <a href="https://pybot-ecru.vercel.app/">https://pybot-ecru.vercel.app/</a>.
2. Type a message in the chatbox to start a conversation with the AI.
3. Click the **voice button** to interact with PyBot using your microphone.

## 🗂️ Project Structure

```
pybot/
├── backend/             # Flask backend
│   ├── pybot.py
│   ├── requirements.txt
│   └── ...
├── frontend/            # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── public/
│   └── ...
```

## 🚀 Getting Started

### 📦 Clone the Repository

```bash
git clone https://github.com/your-username/pybot.git
cd pybot
```

### 🔧 Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # or source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
python pybot.py
```

### 🖼️ Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Now open [http://localhost:3000](http://localhost:3000) to interact with PyBot.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
