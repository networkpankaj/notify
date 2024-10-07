// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
mongoose.connect('mongodb://localhost/notificationDemo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define MongoDB Schema (LeaveRequest)
const leaveRequestSchema = new mongoose.Schema({
  employeeName: String,
  startDate: Date,
  endDate: Date,
  status: String // Pending, Approved, Rejected
});
const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);


app.use(express.static(path.join(__dirname, 'public')));
// Socket.io setup
io.on('connection', (socket) => {
  console.log('A user connected');
});

// Express route to receive leave requests
app.post('/leave-request', async (req, res) => {
  // Assume form data is submitted with employeeName, startDate, endDate
  const { employeeName, startDate, endDate } = req.body;

  // Save leave request to MongoDB
  const newLeaveRequest = new LeaveRequest({
    employeeName,
    startDate,
    endDate,
    status: 'Pending'
  });
  await newLeaveRequest.save();

  // Emit socket event for notification
  io.emit('newLeaveRequest');

  res.status(200).send('Leave request submitted');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
