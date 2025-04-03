import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Teacher from "./components/Teacher/Teacher";
import Student from "./components/Student/Student";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="rounded-lg p-6 flex flex-col items-center justify-center">
      <div className="flex w-50 items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 
             text-white font-medium rounded-full shadow-md mb-8">
        <span className="text-lg text-white">✨</span>
        <span className="text-lg">Intervue Poll</span>
      </div>
      <h1 className="text-6xl font-semibold text-center mb-5 bg-gradient-to-r from-blue-400 via-green-500 to-blue-800 
                    bg-clip-text text-transparent animate-gradient">
        Welcome to the Live Polling System
      </h1>
        <p className="text-center mb-8 text-white text-2xl">Please select the role which best decribes you to begin with live polling system</p>
        <div className="flex flex-row gap-6 items-center justify-center">
          <Link
            to="/teacher"
            className="relative w-80 h-24 flex flex-col justify-center px-5 border-2 rounded-lg 
                      text-white font-medium transition-all duration-300 hover:scale-105"
            style={{
              borderImage: "linear-gradient(90deg, #4facfe, #00f2fe) 1",
              borderImageSlice: 1,
            }}
          >
            <span className="text-lg font-semibold">I'm a Teacher</span>
            <span className="text-sm text-gray-300">Create and manage polls to engage students in real time.</span>
          </Link>

          <Link
            to="/student"
            className="relative w-80 h-24 flex flex-col justify-center px-5 border-2 rounded-lg 
                      text-white font-medium transition-all duration-300 hover:scale-105"
            style={{
              borderImage: "linear-gradient(90deg, #42e695, #3bb2b8) 1",
              borderImageSlice: 1,
            }}
          >
            <span className="text-lg font-semibold">I'm a Student</span>
            <span className="text-sm text-gray-300">Join live polls and provide instant feedback on lessons.</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/student" element={<Student />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;