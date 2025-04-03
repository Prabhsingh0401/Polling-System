import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import pollRoutes from "./routes/pollRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
});

app.use(cors());
app.use(express.json());
app.use("/api/polls", pollRoutes);

let activePoll = null;
let studentResponses = {};
let connectedUsers = { students: 0, teachers: 0 };
let userRoles = {};
let studentNames = [];  


setInterval(() => {
    io.emit("ping", { time: new Date().toISOString() });
    console.log(`Ping sent to ${io.engine.clientsCount} clients`);
}, 10000);

const emitStats = () => {
    io.emit("stats", {
        connectedStudents: connectedUsers.students,
        connectedTeachers: connectedUsers.teachers,
        responseCount: Object.keys(studentResponses).length
    });
};

const broadcastCurrentPoll = () => {
    if (activePoll) {
        console.log(`Broadcasting current poll to all clients`);
        io.emit("pollCreated", activePoll);
    }
};

const broadcastStudentList = () => {
    const teacherSockets = Object.keys(userRoles).filter(id => userRoles[id].role === "teacher");
    teacherSockets.forEach(id => {
        io.to(id).emit("studentList", studentNames);
    });
};

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    if (activePoll) {
        console.log(`Sending active poll to new client ${socket.id}`);
        socket.emit("pollCreated", activePoll);
    }

    socket.on("requestDebug", () => {
        socket.emit("debugInfo", {
            socketId: socket.id,
            activePoll,
            connectedClients: io.engine.clientsCount,
            yourRole: userRoles[socket.id] || "unknown",
            studentNames
        });
    });

    socket.on("join", (data) => {
        console.log(`Client ${socket.id} joined as ${data.role}`, data);
        userRoles[socket.id] = data;
        
        if (data.role === "student") {
            connectedUsers.students++;
            
            if (data.name && !studentNames.includes(data.name)) {
                studentNames.push(data.name);
                
                Object.keys(userRoles).forEach(id => {
                    if (userRoles[id].role === "teacher") {
                        io.to(id).emit("studentJoined", data.name);
                    }
                });
            }
        } else if (data.role === "teacher") {
            connectedUsers.teachers++;
            socket.emit("studentList", studentNames);
        }
        
        if (activePoll) {
            console.log(`Sending current poll to ${data.role} who just joined`);
            socket.emit("pollCreated", activePoll);
        }
        
        emitStats();
    });

    socket.on("requestStudentList", () => {
        console.log(`Teacher ${socket.id} requested student list`);
        socket.emit("studentList", studentNames);
    });

    socket.on("createPoll", (data) => {
        if (!activePoll) {
            console.log(`Teacher ${socket.id} created poll:`, data);
            activePoll = { 
                question: data.question, 
                duration: data.duration,
                responses: {} 
            };
            studentResponses = {}; 
            
            io.emit("pollCreated", activePoll);
            console.log(`Poll created and emitted to ${io.engine.clientsCount} clients`);
            
            if (data.duration) {
                setTimeout(() => {
                    if (activePoll && activePoll.question === data.question) {
                        console.log(`Poll "${data.question}" ended automatically after ${data.duration} seconds`);
                        io.emit("pollResults", activePoll);
                        activePoll = null;
                        studentResponses = {};
                        emitStats();
                    }
                }, data.duration * 1000);
                
                let timeRemaining = data.duration;
                const timeInterval = setInterval(() => {
                    timeRemaining--;
                    if (timeRemaining <= 0 || !activePoll) {
                        clearInterval(timeInterval);
                    } else {
                        io.emit("pollTimeUpdate", timeRemaining);
                    }
                }, 1000);
            }
            
            emitStats();
        } else {
            socket.emit("error", { message: "A poll is already active" });
        }
    });

    socket.on("submitAnswer", (data) => {
        console.log(`Received answer from ${data.studentId}: "${data.answer}"`);
        
        if (!activePoll) {
            console.log("No active poll for this answer");
            socket.emit("error", { message: "No active poll" });
            return;
        }
        
        if (data.studentId && data.answer && !studentResponses[data.studentId]) {
            console.log(`Student ${data.studentId} submitted answer: ${data.answer}`);
            
            activePoll.responses[data.answer] = (activePoll.responses[data.answer] || 0) + 1;
            
            studentResponses[data.studentId] = true;
            
            io.emit("pollUpdated", activePoll);
            emitStats();
        } else if (studentResponses[data.studentId]) {
            console.log(`Student ${data.studentId} already submitted an answer`);
            socket.emit("error", { message: "You have already submitted an answer" });
        }
    });

    socket.on("endPoll", () => {
        if (activePoll) {
            console.log(`Teacher ${socket.id} ended poll`);
            io.emit("pollResults", activePoll);
            activePoll = null;
            studentResponses = {};
            emitStats();
        } else {
            socket.emit("error", { message: "No active poll to end" });
        }
    });

    socket.on("forceBroadcast", () => {
        if (userRoles[socket.id] && userRoles[socket.id].role === "teacher") {
            console.log("Teacher forced broadcast of current poll");
            broadcastCurrentPoll();
        }
    });

    socket.on("kickStudent", (studentId) => {
        if (userRoles[socket.id] && userRoles[socket.id].role === "teacher") {
            console.log(`Teacher kicked student: ${studentId}`);
            
            let studentSocketId = null;
            Object.keys(userRoles).forEach(id => {
                if (userRoles[id].role === "student" && userRoles[id].name === studentId) {
                    studentSocketId = id;
                }
            });
            
            if (studentSocketId) {
                io.to(studentSocketId).emit("kicked");
                
                studentNames = studentNames.filter(name => name !== studentId);
                
                broadcastStudentList();
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        
        const role = userRoles[socket.id];
        if (role) {
            if (role.role === "student") {
                connectedUsers.students = Math.max(0, connectedUsers.students - 1);
                
                if (role.name && studentNames.includes(role.name)) {
                    studentNames = studentNames.filter(name => name !== role.name);
                    
                    Object.keys(userRoles).forEach(id => {
                        if (userRoles[id].role === "teacher") {
                            io.to(id).emit("studentLeft", role.name);
                        }
                    });
                }
            } else if (role.role === "teacher") {
                connectedUsers.teachers = Math.max(0, connectedUsers.teachers - 1);
            }
        }
        
        delete userRoles[socket.id];
        emitStats();
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
    console.log('Server shutting down');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default server;