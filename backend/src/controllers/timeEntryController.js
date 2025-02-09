const { TimeEntry, Location } = require('../models');
const { Op } = require('sequelize');

const clockIn = async (req, res, next) => {
    try {
        const { locationId } = req.body;
        
        // Check if user already has an active time entry
        const activeEntry = await TimeEntry.findOne({
            where: {
                userId: req.user.id,
                clockOut: null,
                status: 'active'
            }
        });

        if (activeEntry) {
            return res.status(400).json({
                status: 'error',
                message: 'You already have an active time entry'
            });
        }

        // Create new time entry
        const timeEntry = await TimeEntry.create({
            userId: req.user.id,
            locationId,
            clockIn: new Date(),
            status: 'active'
        });

        res.status(201).json({
            status: 'success',
            data: {
                timeEntry
            }
        });
    } catch (error) {
        next(error);
    }
};

const clockOut = async (req, res, next) => {
    try {
        const { notes } = req.body;

        // Find active time entry
        const timeEntry = await TimeEntry.findOne({
            where: {
                userId: req.user.id,
                clockOut: null,
                status: 'active'
            }
        });

        if (!timeEntry) {
            return res.status(404).json({
                status: 'error',
                message: 'No active time entry found'
            });
        }

        // Update time entry
        timeEntry.clockOut = new Date();
        timeEntry.status = 'completed';
        if (notes) timeEntry.notes = notes;
        
        await timeEntry.save();

        res.json({
            status: 'success',
            data: {
                timeEntry
            }
        });
    } catch (error) {
        next(error);
    }
};

const startBreak = async (req, res, next) => {
    try {
        // Find active time entry
        const timeEntry = await TimeEntry.findOne({
            where: {
                userId: req.user.id,
                clockOut: null,
                status: 'active'
            }
        });

        if (!timeEntry) {
            return res.status(404).json({
                status: 'error',
                message: 'No active time entry found'
            });
        }

        if (timeEntry.breakStart && !timeEntry.breakEnd) {
            return res.status(400).json({
                status: 'error',
                message: 'Break already started'
            });
        }

        timeEntry.breakStart = new Date();
        await timeEntry.save();

        res.json({
            status: 'success',
            data: {
                timeEntry
            }
        });
    } catch (error) {
        next(error);
    }
};

const endBreak = async (req, res, next) => {
    try {
        // Find active time entry
        const timeEntry = await TimeEntry.findOne({
            where: {
                userId: req.user.id,
                clockOut: null,
                status: 'active',
                breakStart: { [Op.not]: null },
                breakEnd: null
            }
        });

        if (!timeEntry) {
            return res.status(404).json({
                status: 'error',
                message: 'No active break found'
            });
        }

        timeEntry.breakEnd = new Date();
        
        // Calculate break duration in minutes
        const breakDuration = Math.round(
            (new Date(timeEntry.breakEnd) - new Date(timeEntry.breakStart)) / 1000 / 60
        );
        timeEntry.breakDuration = breakDuration;

        await timeEntry.save();

        res.json({
            status: 'success',
            data: {
                timeEntry
            }
        });
    } catch (error) {
        next(error);
    }
};

const getCurrentTimeEntry = async (req, res, next) => {
    try {
        const timeEntry = await TimeEntry.findOne({
            where: {
                userId: req.user.id,
                clockOut: null,
                status: 'active'
            },
            include: [{
                model: Location,
                as: 'location'
            }]
        });

        res.json({
            status: 'success',
            data: {
                timeEntry
            }
        });
    } catch (error) {
        next(error);
    }
};

const getTimeEntries = async (req, res, next) => {
    try {
        const { startDate, endDate, userId } = req.query;
        const where = {};

        // Date range filter
        if (startDate && endDate) {
            where.clockIn = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // User filter (admin only)
        if (userId && req.user.role === 'admin') {
            where.userId = userId;
        } else {
            where.userId = req.user.id;
        }

        const timeEntries = await TimeEntry.findAll({
            where,
            include: [{
                model: Location,
                as: 'location'
            }],
            order: [['clockIn', 'DESC']]
        });

        res.json({
            status: 'success',
            data: {
                timeEntries
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    getCurrentTimeEntry,
    getTimeEntries
};
