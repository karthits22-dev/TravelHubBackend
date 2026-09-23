// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// require('dotenv').config();

// const userRoutes = require('./routes/userRoute');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Database Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB Connected Successfully');
//   })
//   .catch((err) => {
//     console.log('MongoDB Connection Error:', err);
//   });

// // Routes
// app.get('/', (req, res) => {
//   res.send('Backend Running');
// });

// app.use('/api/users', userRoutes);

// // Server Start
// app.listen(process.env.PORT || 5000, () => {
//   console.log(`Server running on port ${process.env.PORT || 5000}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();
const twilio = require("twilio");

const userRoutes = require('./Routes/userRoute');
const authRoutes = require('./Routes/auth');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function createService() {
  try {
    const service = await client.verify.v2.services.create({
      friendlyName: "My React Native OTP",
    });

    console.log("Service created!");
    console.log("Service SID:", service.sid);

  } catch (error) {
    console.error(error);
  }
}

createService();

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.log('MongoDB Connection Error:', err);
  });

// Routes
app.get('/', (req, res) => {
  res.send('Backend Running');
});

app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes);


// Create HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join chat room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);

    console.log(
      `Socket ${socket.id} joined room: ${roomId}`
    );
  });

  // Send message
  socket.on('sendMessage', (data) => {
    console.log('Message received:', data);

    io.to(data.roomId).emit('receiveMessage', {
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      createdAt: new Date(),
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Server Start
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});