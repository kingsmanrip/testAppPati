const { Location, TimeEntry } = require('../models');
const { Op } = require('sequelize');

const createLocation = async (req, res, next) => {
    try {
        const { name, address, city, state, zipCode, notes } = req.body;
        
        const location = await Location.create({
            name,
            address,
            city,
            state,
            zipCode,
            notes
        });

        res.status(201).json({
            status: 'success',
            data: {
                location
            }
        });
    } catch (error) {
        next(error);
    }
};

const getLocations = async (req, res, next) => {
    try {
        const { active } = req.query;
        const where = {};

        if (active !== undefined) {
            where.isActive = active === 'true';
        }

        const locations = await Location.findAll({
            where,
            order: [['name', 'ASC']]
        });

        res.json({
            status: 'success',
            data: {
                locations
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateLocation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, address, city, state, zipCode, isActive, notes } = req.body;

        const location = await Location.findByPk(id);
        if (!location) {
            return res.status(404).json({
                status: 'error',
                message: 'Location not found'
            });
        }

        // Update fields
        if (name) location.name = name;
        if (address) location.address = address;
        if (city) location.city = city;
        if (state) location.state = state;
        if (zipCode) location.zipCode = zipCode;
        if (notes !== undefined) location.notes = notes;
        if (isActive !== undefined) location.isActive = isActive;

        await location.save();

        res.json({
            status: 'success',
            data: {
                location
            }
        });
    } catch (error) {
        next(error);
    }
};

const getLocationStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const where = {
            locationId: id
        };

        if (startDate && endDate) {
            where.clockIn = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const timeEntries = await TimeEntry.findAll({
            where,
            attributes: [
                [sequelize.fn('SUM', sequelize.col('totalHours')), 'totalHours'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalEntries']
            ]
        });

        res.json({
            status: 'success',
            data: {
                stats: timeEntries[0]
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLocation,
    getLocations,
    updateLocation,
    getLocationStats
};
