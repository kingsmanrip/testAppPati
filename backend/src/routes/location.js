const express = require('express');
const router = express.Router();
const {
    createLocation,
    getLocations,
    updateLocation,
    getLocationStats
} = require('../controllers/locationController');
const { adminOnly } = require('../middleware/auth');

router.post('/', adminOnly, createLocation);
router.get('/', getLocations);
router.put('/:id', adminOnly, updateLocation);
router.get('/:id/stats', getLocationStats);

module.exports = router;
