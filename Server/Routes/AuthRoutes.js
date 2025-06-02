const express = require('express');
const { registerUserController, loginController } = require('../Controller/AuthController');
const Graph = require('../Controller/Graph');

const router = express.Router();

// Auth routes
router.post('/register', registerUserController);
router.post('/login', loginController);

// Route finding endpoint
router.post('/find-routes', Graph);

module.exports = router;