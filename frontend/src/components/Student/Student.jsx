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
    const [answer, setAnswer] = useState("");
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
                setAnswer("");
                
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
        if (answer.trim() && name) {
            console.log("Submitting answer:", { studentId: name, answer });
            socket.emit("submitAnswer", { studentId: name, answer: answer.trim() });
            setSubmitted(true);
        }
    };

    if (kicked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                    <div className="text-red-500 font-medium text-center mb-4">
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
            {!name ? (
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-bold text-center mb-4">Join Classroom</h2>
                    <div className="flex flex-col items-center">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        <button 
                            onClick={handleJoin} 
                            disabled={!nameInput.trim()}
                            className={`mt-4 w-full px-6 py-2 ${!nameInput.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition`}>
                            Join
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Student View</h2>
                        <div className="flex items-center space-x-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : "bg-red-500"}`}></span>
                            <span className="text-sm text-gray-500">{name}</span>
                        </div>
                    </div>

                    {poll.question ? (
                        <div>
                            {remainingTime !== null && remainingTime > 0 && (
                                <div className="mb-3 p-2 bg-blue-50 rounded-lg text-center">
                                    <span className="text-blue-700 font-medium">Time remaining: {remainingTime}s</span>
                                </div>
                            )}
                            
                            {submitted ? (
                                <div>
                                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                        <div className="text-lg font-semibold text-gray-800">Your answer: {answer}</div>
                                        <div className="text-sm text-green-500">Answer submitted successfully</div>
                                    </div>
                                    <PollResults poll={poll} />
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{poll.question}</h3>
                                    <input
                                        type="text"
                                        placeholder="Your Answer"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        className="w-full px-4 py-2 mt-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onKeyPress={(e) => e.key === 'Enter' && answer.trim() && submitAnswer()}
                                    />
                                    <button 
                                        onClick={submitAnswer} 
                                        disabled={!answer.trim()}
                                        className={`mt-4 w-full px-6 py-2 ${!answer.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition`}>
                                        Submit
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-gray-500 text-lg">Waiting for teacher to start a poll...</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Student;