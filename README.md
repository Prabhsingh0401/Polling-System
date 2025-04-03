# Live Polling System

## Overview
The **Live Polling System**  allows teachers to create and manage polls, while students can join and participate in them instantly. Built using **React, Node.js, Express, and Socket.io**

## Features
### For Teachers:
- Create live polls and share them with students
- View real-time poll results
- Display Results simultanously

### For Students:
- Join active polls using the application
- Submit responses in real-time
- View poll results after submission

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS, React Router
- **Backend:** Node.js, Express, Socket.io
- **Deployment:** Vercel (Frontend), Render (Backend)

## Installation & Setup
### Prerequisites:
Make sure you have **Node.js** and **npm** installed.

### Clone the Repository:
```bash
git clone https://github.com/yourusername/live-polling-system.git
cd live-polling-system
```

### Backend Setup:
```bash
cd backend
npm install
npm run dev
```
The server will run on `http://localhost:3000`.

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
The React app will be available at `http://localhost:5173`.

## Usage
1. Open the application and select your role (**Teacher** or **Student**).
2. Teachers can create and manage polls.
3. Students can join polls and submit responses.
4. Real-time updates are shown using WebSockets.

