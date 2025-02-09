const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Location extends Model {
        static associate(models) {
            Location.hasMany(models.TimeEntry, {
                foreignKey: 'locationId',
                as: 'timeEntries'
            });
        }
    }

    Location.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        zipCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Location',
        timestamps: true
    });

    return Location;
};
