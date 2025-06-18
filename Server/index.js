const express = require("express");
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRouter = require('./Routes/AuthRoutes');
const {protect} = require('./Middleware/AuthMiddleware');

dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.mongodb)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Routes
app.use('/api/auth', authRouter);

app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`[Server] Server is running on port ${PORT}`);
});