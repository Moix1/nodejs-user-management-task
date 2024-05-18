const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const csvRoutes = require('./src/routes/csv');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = 'mongodb://localhost:27017/badriTaskDB'; // Replace with your actual MongoDB URI
const JWT_SECRET = 'asjhahj888';  // Replace with your actual secret key

app.use(express.json());
app.use(cookieParser());

// Configure CORS to allow requests from your frontend origin
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/csv', csvRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
