const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ where: { username, isActive: true } });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            status: 'success',
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const { username, password, firstName, lastName, role } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            role: role || 'employee'
        });

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json({
            status: 'success',
            data: {
                user: userResponse
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res) => {
    const userResponse = req.user.toJSON();
    delete userResponse.password;
    
    res.json({
        status: 'success',
        data: {
            user: userResponse
        }
    });
};

const updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;

        // If updating password
        if (currentPassword && newPassword) {
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Current password is incorrect'
                });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            status: 'success',
            data: {
                user: userResponse
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    register,
    getProfile,
    updateProfile
};
