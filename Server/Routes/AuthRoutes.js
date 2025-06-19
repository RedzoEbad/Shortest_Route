const express = require('express');
const router = express.Router();
const { registerUserController, loginController } = require('../Controller/AuthController');
const Graph = require('../Controller/Graph');

// Auth routes
router.post('/register', registerUserController);
router.post('/login', loginController);

// Route finding endpoint
router.post('/find-routes', async (req, res) => {
  try {
    await Graph(req, res);
  } catch (error) {
    console.error('[AuthRoutes] Error in find-routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;