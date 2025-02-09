const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const timeEntryRoutes = require('./timeEntry');
const locationRoutes = require('./location');
const { auth } = require('../middleware/auth');

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/time-entries', auth, timeEntryRoutes);
router.use('/locations', auth, locationRoutes);

module.exports = router;
