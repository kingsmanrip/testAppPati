const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const User = require('./User')(sequelize);
const TimeEntry = require('./TimeEntry')(sequelize);
const Location = require('./Location')(sequelize);

// Initialize associations
Object.values(sequelize.models).forEach(model => {
    if (model.associate) {
        model.associate(sequelize.models);
    }
});

module.exports = {
    sequelize,
    User,
    TimeEntry,
    Location
};
