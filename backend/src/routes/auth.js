const express = require('express');
const router = express.Router();
const { login, register, getProfile, updateProfile } = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/register', auth, adminOnly, register); // Only admins can register new users

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
