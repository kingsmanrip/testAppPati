const express = require('express');
const router = express.Router();
const {
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    getCurrentTimeEntry,
    getTimeEntries
} = require('../controllers/timeEntryController');

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/break/start', startBreak);
router.post('/break/end', endBreak);
router.get('/current', getCurrentTimeEntry);
router.get('/', getTimeEntries);

module.exports = router;
