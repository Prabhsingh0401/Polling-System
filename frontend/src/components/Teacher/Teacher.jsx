import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setPoll } from "../../redux/pollSlice";
import PollResults from "../PollResult/PollResult";

const BACKEND_URL = "https://polling-system-txvu.onrender.com";
const socket = io(BACKEND_URL);

const Teacher = () => {
    const dispatch = useDispatch();
    const poll = useSelector((state) => state.poll);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [pollActive, setPollActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("connecting");
    const [pollDuration, setPollDuration] = useState(30);
    const [remainingTime, setRemainingTime] = useState(null);
    const [connectedStudents, setConnectedStudents] = useState([]);
    const [allStudentsAnswered, setAllStudentsAnswered] = useState(false);

    useEffect(() => {
        // Handle connection events
        socket.on("connect", () => {
            console.log("Teacher connected to server with ID:", socket.id);
            setConnectionStatus("connected");
            socket.emit("join", { role: "teacher" });
            
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
            setOptions(["", "", "", ""]);
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

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = [...options];
            newOptions.splice(index, 1);
            setOptions(newOptions);
        }
    };

    const createPoll = () => {
        // Filter out empty options
        const validOptions = options.filter(opt => opt.trim() !== "");
        
        if (question.trim() && validOptions.length >= 2) {
            const pollData = { 
                question, 
                options: validOptions,
                type: "mcq",
                duration: pollDuration 
            };
            
            console.log("Creating MCQ poll with data:", pollData);
            socket.emit("createPoll", pollData);
        }
    };

    // REMOVED DUPLICATE EVENT LISTENER - This was causing issues
    // socket.on("pollCreated", (newPoll) => { ... });

    const endPoll = () => {
        console.log("Ending poll");
        socket.emit("endPoll");
    };

    const forceBroadcast = () => {
        console.log("Forcing broadcast of current poll");
        socket.emit("forceBroadcast");
    };

    const createNewPoll = () => {
        socket.emit("endPoll");
        setQuestion("");
        setOptions(["", "", "", ""]);
        setPollActive(false);
        setAllStudentsAnswered(false);
    };

    const kickStudent = (studentId) => {
        if (window.confirm(`Are you sure you want to remove ${studentId} from the classroom?`)) {
            console.log(`Attempting to kick student: ${studentId}`);
            socket.emit("kickStudent", studentId);
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
        <div className="flex flex-col justify-center min-h-screen bg-black p-4">
            <div className="w-full max-w-10xl bg-black shadow-lg text-white rounded-lg p-6 flex">
            <div>
            <div className="flex w-50 items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 
             text-white font-medium rounded-full shadow-md mb-8">
                    <span className="text-lg text-white">✨</span>
                    <span className="text-lg">Intervue Poll</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-green-400">Teacher Dashboard</h2>
                    <div className="flex space-x-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : "bg-red-500"}`}></span>
                        <span className="text-sm text-gray-500">{connectionStatus === "connected" ? "Connected" : "Disconnected"}</span>
                    </div>
                </div>
                
                {!pollActive ? (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Create a New MCQ Poll</h3>
                        <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Enter your question"
                                className="w-full px-4 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-800"
                            />
                        </div>
                        
                        {/* Second cell - Options */}
                        <div>
                            <h4 className="text-md font-medium mb-2">Answer Choices:</h4>
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <div className="flex-grow mr-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className="w-full px-4 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-800"
                                        />
                                    </div>
                                    {options.length > 2 && (
                                        <button 
                                            onClick={() => removeOption(index)}
                                            className="p-2 text-red-400 hover:text-red-600">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            {options.length < 6 && (
                                <button 
                                    onClick={addOption}
                                    className="mt-2 px-4 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition">
                                    + Add Option
                                </button>
                            )}
                        </div>
                        
                        {/* Third cell - Poll Duration */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Poll Duration (seconds):
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="300"
                                value={pollDuration}
                                onChange={(e) => setPollDuration(Math.max(10, Math.min(300, parseInt(e.target.value) || 30)))}
                                className="w-full px-4 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-800"
                            />
                        </div>
                        
                        {/* Fourth cell - Start Poll button */}
                        <div className="col-span-2">
                            <button 
                                onClick={createPoll}
                                disabled={!question.trim() || options.filter(opt => opt.trim() !== "").length < 2}
                                className={`w-full px-6 py-1 ${!question.trim() || options.filter(opt => opt.trim() !== "").length < 2 ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-400 hover:bg-green-600'} text-white rounded-lg transition`}>
                                Start Poll
                            </button>
                        </div>
                    </div>
                    </div>
                ) : (
                    <div className="mt-6 w-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Live MCQ Poll</h3>
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
                            <div className="mb-4 p-2 bg-blue-900 rounded-lg text-center">
                                <span className="text-blue-200 font-medium">Time remaining: {remainingTime}s</span>
                            </div>
                        )}
                        
                        <div className="p-4 bg-gray-800 rounded-lg mb-4">
                            <div className="text-lg font-medium">{poll.question}</div>
                            
                            {poll.options && poll.options.length > 0 ? (
                                <div className="mt-3 grid grid-cols-1 gap-2">
                                    {poll.options.map((option, index) => (
                                        <div key={index} className="p-3 bg-gray-700 rounded-md">
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-3 p-2 bg-yellow-800 rounded-md text-yellow-300">
                                    No options available
                                </div>
                            )}
                        </div>
                        
                        <PollResults poll={poll} />

                        {allStudentsAnswered && (
                            <div className="mt-6 bg-green-900 p-4 rounded-lg">
                                <p className="text-green-300 font-medium mb-2">All students have answered! 🎉</p>
                                <button 
                                    onClick={createNewPoll}
                                    className="w-full px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                    Create a New Question
                                </button>
                            </div>
                        )}
                    </div>
                )}
                </div>
                
                {/* Connected Students Section */}
                <div>
                <div className="mt-8 ml-20 w-[46vw] pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium">Connected Students ({connectedStudents.length})</h3>
                        <button 
                            onClick={getStudentList}
                            className="px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 text-sm">
                            Refresh
                        </button>
                    </div>
                    
                    {connectedStudents.length > 0 ? (
                        <div className="bg-gray-800 rounded-lg p-3">
                            <ul className="divide-y divide-gray-700">
                                {connectedStudents.map((student, index) => (
                                    <li key={index} className="py-1 flex justify-between items-center">
                                        <span className="font-medium">{student}</span>
                                        <button
                                            onClick={() => kickStudent(student)}
                                            className="px-2 py-1 bg-red-900 text-red-200 rounded hover:bg-red-800 text-xs">
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
        </div>
    );
};

export default Teacher;