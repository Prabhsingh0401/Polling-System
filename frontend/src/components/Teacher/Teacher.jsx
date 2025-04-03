import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setPoll } from "../../redux/pollSlice";
import PollResults from "../PollResult/PollResult";

// Create the socket connection outside the component
const BACKEND_URL = "https://polling-system-txvu.onrender.com";
const socket = io(BACKEND_URL);

const Teacher = () => {
    const dispatch = useDispatch();
    const poll = useSelector((state) => state.poll);
    const [question, setQuestion] = useState("");
    const [pollActive, setPollActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("connecting");
    const [pollDuration, setPollDuration] = useState(30); // Default 30 seconds
    const [remainingTime, setRemainingTime] = useState(null);
    const [connectedStudents, setConnectedStudents] = useState([]);
    const [allStudentsAnswered, setAllStudentsAnswered] = useState(false);

    useEffect(() => {
        // Handle connection events
        socket.on("connect", () => {
            console.log("Teacher connected to server with ID:", socket.id);
            setConnectionStatus("connected");
            socket.emit("join", { role: "teacher" });
            
            // Request student list immediately upon connection
            socket.emit("requestStudentList");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            setConnectionStatus("disconnected");
        });

        // Poll events
        socket.on("pollCreated", (newPoll) => {
            console.log("Teacher received pollCreated event:", newPoll);
            dispatch(setPoll(newPoll));
            setPollActive(true);
            setAllStudentsAnswered(false);
            
            if (newPoll.duration) {
                setRemainingTime(newPoll.duration);
            }
        });

        socket.on("pollUpdated", (updatedPoll) => {
            console.log("Poll updated:", updatedPoll);
            dispatch(setPoll(updatedPoll));
            
            // Check if all students have answered
            if (updatedPoll.responses && connectedStudents.length > 0) {
                const answeredCount = Object.keys(updatedPoll.responses).length;
                if (answeredCount >= connectedStudents.length && answeredCount > 0) {
                    setAllStudentsAnswered(true);
                }
            }
        });

        socket.on("pollResults", (finalPoll) => {
            console.log("Poll ended with results:", finalPoll);
            dispatch(setPoll(finalPoll));
            setPollActive(false);
            setRemainingTime(null);
            setQuestion("");
        });

        socket.on("pollTimeUpdate", (timeRemaining) => {
            setRemainingTime(timeRemaining);
        });

        socket.on("studentList", (students) => {
            console.log("Received student list:", students);
            setConnectedStudents(students);
        });

        socket.on("studentJoined", (student) => {
            console.log("Student joined:", student);
            setConnectedStudents(prev => [...prev, student]);
        });

        socket.on("studentLeft", (student) => {
            console.log("Student left:", student);
            setConnectedStudents(prev => prev.filter(s => s !== student));
        });

        socket.on("studentKicked", (studentId) => {
            console.log("Student kicked confirmation:", studentId);
            setConnectedStudents(prev => prev.filter(s => s !== studentId));
        });

        socket.on("error", (error) => {
            console.error("Server error:", error);
            alert(error.message);
        });

        // Timer countdown
        let timerInterval;
        if (remainingTime && remainingTime > 0) {
            timerInterval = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timerInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // Cleanup function
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("pollCreated");
            socket.off("pollUpdated");
            socket.off("pollResults");
            socket.off("pollTimeUpdate");
            socket.off("studentList");
            socket.off("studentJoined");
            socket.off("studentLeft");
            socket.off("studentKicked");
            socket.off("error");
            clearInterval(timerInterval);
        };
    }, [dispatch, remainingTime, connectedStudents.length]);

    const createPoll = () => {
        if (question.trim()) {
            console.log("Creating poll:", question);
            socket.emit("createPoll", { question, duration: pollDuration });
        }
    };

    const endPoll = () => {
        console.log("Ending poll");
        socket.emit("endPoll");
    };

    const forceBroadcast = () => {
        console.log("Forcing broadcast of current poll");
        socket.emit("forceBroadcast");
    };

    const createNewPoll = () => {
        // End current poll and reset state
        socket.emit("endPoll");
        setQuestion("");
        setPollActive(false);
        setAllStudentsAnswered(false);
    };

    const kickStudent = (studentId) => {
        if (window.confirm(`Are you sure you want to remove ${studentId} from the classroom?`)) {
            console.log(`Attempting to kick student: ${studentId}`);
            socket.emit("kickStudent", studentId);
            // The actual removal will happen when we receive the studentKicked confirmation
        }
    };

    const getStudentList = () => {
        console.log("Requesting student list");
        socket.emit("requestStudentList");
    };

    if (connectionStatus === "disconnected") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                    <div className="text-red-500 font-medium text-center mb-4">
                        Disconnected from server.
                    </div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                        Reconnect
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-blue-700">Teacher Dashboard</h2>
                    <div className="flex space-x-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : "bg-red-500"}`}></span>
                        <span className="text-sm text-gray-500">{connectionStatus === "connected" ? "Connected" : "Disconnected"}</span>
                    </div>
                </div>
                
                {!pollActive ? (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Create a New Poll</h3>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Enter your question"
                                className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Poll Duration (seconds):
                                </label>
                                <input
                                    type="number"
                                    min="10"
                                    max="300"
                                    value={pollDuration}
                                    onChange={(e) => setPollDuration(Math.max(10, Math.min(300, parseInt(e.target.value) || 30)))}
                                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <button 
                                onClick={createPoll}
                                disabled={!question.trim()}
                                className={`mt-4 px-6 py-2 ${!question.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition`}>
                                Start Poll
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Live Poll</h3>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={forceBroadcast} 
                                    className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm">
                                    Resend Poll
                                </button>
                                <button 
                                    onClick={endPoll} 
                                    className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm">
                                    End Poll
                                </button>
                            </div>
                        </div>
                        
                        {remainingTime !== null && (
                            <div className="mb-4 p-2 bg-blue-50 rounded-lg text-center">
                                <span className="text-blue-700 font-medium">Time remaining: {remainingTime}s</span>
                            </div>
                        )}
                        
                        <div className="p-4 bg-gray-50 rounded-lg mb-4">
                            <div className="text-lg font-medium">{poll.question}</div>
                        </div>
                        
                        <PollResults poll={poll} />

                        {allStudentsAnswered && (
                            <div className="mt-6 bg-green-50 p-4 rounded-lg">
                                <p className="text-green-700 font-medium mb-2">All students have answered! 🎉</p>
                                <button 
                                    onClick={createNewPoll}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                    Create a New Question
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Connected Students Section */}
                <div className="mt-8 pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium">Connected Students ({connectedStudents.length})</h3>
                        <button 
                            onClick={getStudentList}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
                            Refresh
                        </button>
                    </div>
                    
                    {connectedStudents.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <ul className="divide-y divide-gray-200">
                                {connectedStudents.map((student, index) => (
                                    <li key={index} className="py-2 flex justify-between items-center">
                                        <span className="font-medium">{student}</span>
                                        <button
                                            onClick={() => kickStudent(student)}
                                            className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs">
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-3">No students connected</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Teacher;