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

## Application visuals
![image](https://github.com/user-attachments/assets/d389dbe7-cfcd-4718-9b64-0441b5cdb4bf)
![image](https://github.com/user-attachments/assets/e0d2f9ef-b824-4385-9ef8-90a27b96516b)
![image](https://github.com/user-attachments/assets/92f8beca-cc15-4da0-965e-3b38fc521156)
![image](https://github.com/user-attachments/assets/68d09ca8-c51d-448a-a32f-d99332e52a23)
![image](https://github.com/user-attachments/assets/0733a995-24f4-4fb4-a69f-8ae7d0ae37b7)
![image](https://github.com/user-attachments/assets/895fbd91-4e38-4e77-ac92-3f0be1b008f3)
![image](https://github.com/user-attachments/assets/f9906d76-d47b-4e7a-a5b1-fe85828cf490)

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

