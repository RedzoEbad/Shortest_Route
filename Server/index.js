const express = require("express");
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const router = require('./Routes/AuthRoutes');
const {protect} = require('./Middleware/AuthMiddleware');

dotenv.config();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.mongodb).then(()=>{console.log("MonogoDb connected ")}).catch(err => console.log(err));
app.use('/api/auth' , router);
app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));