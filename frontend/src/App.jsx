import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Teacher from "./components/Teacher/Teacher";
import Student from "./components/Student/Student";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Classroom Polling App</h1>
        
        <div className="flex flex-col gap-4">
          <Link
            to="/teacher"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium"
          >
            I'm a Teacher
          </Link>
          
          <Link
            to="/student"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-medium"
          >
            I'm a Student
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