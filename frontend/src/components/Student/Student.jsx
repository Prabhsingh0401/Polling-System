import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setPoll } from "../../redux/pollSlice";
import PollResults from "../PollResult/PollResult";

const BACKEND_URL = "https://polling-system-txvu.onrender.com";
const socket = io(BACKEND_URL);

const Student = () => {
    const dispatch = useDispatch();
    const poll = useSelector((state) => state.poll);
    
    const [name, setName] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [selectedOption, setSelectedOption] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("connecting");
    const [remainingTime, setRemainingTime] = useState(null);
    const [kicked, setKicked] = useState(false);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Student connected to server with ID:", socket.id);
            setConnectionStatus("connected");
            
            if (name) {
                socket.emit("join", { role: "student", name });
                console.log(`Re-joining as student: ${name}`);
            }
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            setConnectionStatus("disconnected");
        });

        // Poll events
        socket.on("pollCreated", (newPoll) => {
            console.log("Student received new poll:", newPoll);
            
            if (newPoll && newPoll.question) {
                dispatch(setPoll(newPoll));
                setSubmitted(false);
                setSelectedOption("");
                
                // Handle poll timer if available
                if (newPoll.duration) {
                    setRemainingTime(newPoll.duration);
                }
            } else {
                console.error("Received invalid poll data:", newPoll);
            }
        });

        socket.on("pollUpdated", (updatedPoll) => {
            console.log("Poll updated:", updatedPoll);
            dispatch(setPoll(updatedPoll));
        });

        socket.on("pollResults", (finalPoll) => {
            console.log("Poll ended with results:", finalPoll);
            dispatch(setPoll(finalPoll));
            setRemainingTime(null);
        });

        socket.on("pollTimeUpdate", (timeRemaining) => {
            setRemainingTime(timeRemaining);
        });

        socket.on("kicked", () => {
            console.log("You have been kicked from the classroom");
            setKicked(true);
            socket.disconnect();
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
            socket.off("kicked");
            socket.off("error");
            clearInterval(timerInterval);
        };
    }, [dispatch, name, remainingTime]);

    const handleJoin = () => {
        if (nameInput.trim()) {
            const studentName = nameInput.trim();
            setName(studentName);
            console.log(`Joining as student: ${studentName}`);
            socket.emit("join", { role: "student", name: studentName });
        }
    };

    const submitAnswer = () => {
        if (selectedOption && name) {
            console.log("Submitting answer:", { studentId: name, answer: selectedOption });
            socket.emit("submitAnswer", { studentId: name, answer: selectedOption });
            setSubmitted(true);
        }
    };

    if (kicked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
                <div className="w-full max-w-2xl bg-black shadow-lg rounded-lg p-6">
                    <div className="text-red-500 text-3xl font-medium text-center mb-4">
                        You have been removed from the classroom by the teacher.
                    </div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                        Rejoin with different name
                    </button>
                </div>
            </div>
        );
    }

    if (connectionStatus === "disconnected") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-white">
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
            {!name ? (
                <div className="w-full max-w-3xl flex flex-col justify-center items-center bg-black shadow-lg rounded-lg p-6 text-white">
                   <div className="flex w-50 items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 
                            text-white font-medium rounded-full shadow-md mb-8">
                        <span className="text-lg text-white">✨</span>
                        <span className="text-lg">Intervue Poll</span>
                    </div> 
                    <h2 className="text-4xl font-semibold text-center mb-4">Let's get started</h2>
                    <p className="text-center mb-8">If you are a student, you will be able to submit your answers, participate in live polls, and see how your responses compare with your classmates</p>
                    <div className="flex flex-col items-center w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        <button 
                            onClick={handleJoin} 
                            disabled={!nameInput.trim()}
                            className={`mt-4 w-full px-6 py-2 ${!nameInput.trim() ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'} text-white rounded-lg transition`}>
                            Join
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-2xl bg-gray-900 text-white shadow-lg rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Student View</h2>
                        <div className="flex items-center space-x-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : "bg-red-500"}`}></span>
                            <span className="text-sm text-gray-300">{name}</span>
                        </div>
                    </div>

                    {poll.question ? (
                        <div>
                            {remainingTime !== null && remainingTime > 0 && (
                                <div className="mb-3 p-2 bg-blue-400 rounded-lg text-center">
                                    <span className="text-white font-medium">Time remaining: {remainingTime}s</span>
                                </div>
                            )}
                            
                            {submitted ? (
                                <div>
                                    <div className="mb-4 p-3 bg-gray-600 rounded-lg text-white">
                                        <div className="text-lg font-semibold text-white">Question: {poll.question}</div>
                                        <div className="mt-2 text-white">Your answer: <span className="font-medium">{selectedOption}</span></div>
                                        <div className="text-sm text-green-500 mt-1">Answer submitted successfully</div>
                                    </div>
                                    <PollResults poll={poll} />
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">{poll.question}</h3>
                                    
                                    {poll.options && poll.options.length > 0 ? (
                                        <div className="space-y-2 mt-3 mb-4">
                                            {poll.options.map((option, index) => (
                                                <div 
                                                    key={index}
                                                    onClick={() => setSelectedOption(option)}
                                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                        selectedOption === option 
                                                        ? 'bg-blue-500 border-blue-700 text-white' 
                                                        : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-5 h-5 mr-3 rounded-full border flex items-center justify-center ${
                                                            selectedOption === option 
                                                            ? 'border-white bg-white' 
                                                            : 'border-gray-400'
                                                        }`}>
                                                            {selectedOption === option && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                                        </div>
                                                        <span className={selectedOption === option ? 'font-medium' : ''}>{option}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Your Answer"
                                            value={selectedOption}
                                            onChange={(e) => setSelectedOption(e.target.value)}
                                            className="w-full px-4 py-2 mt-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 text-white"
                                            onKeyPress={(e) => e.key === 'Enter' && selectedOption.trim() && submitAnswer()}
                                        />
                                    )}
                                    
                                    <button 
                                        onClick={submitAnswer} 
                                        disabled={!selectedOption}
                                        className={`mt-4 w-full px-6 py-2 ${!selectedOption ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'} text-white rounded-lg transition`}>
                                        Submit
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-white text-lg">Waiting for teacher to start a poll...</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Student;