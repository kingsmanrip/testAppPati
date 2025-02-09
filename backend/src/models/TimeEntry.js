const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class TimeEntry extends Model {
        static associate(models) {
            TimeEntry.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
            TimeEntry.belongsTo(models.Location, {
                foreignKey: 'locationId',
                as: 'location'
            });
        }
    }

    TimeEntry.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        locationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        clockIn: {
            type: DataTypes.DATE,
            allowNull: false
        },
        clockOut: {
            type: DataTypes.DATE,
            allowNull: true
        },
        breakStart: {
            type: DataTypes.DATE,
            allowNull: true
        },
        breakEnd: {
            type: DataTypes.DATE,
            allowNull: true
        },
        breakDuration: {
            type: DataTypes.INTEGER, // in minutes
            allowNull: true
        },
        totalHours: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('active', 'completed', 'modified'),
            defaultValue: 'active'
        }
    }, {
        sequelize,
        modelName: 'TimeEntry',
        timestamps: true,
        hooks: {
            beforeSave: (timeEntry) => {
                if (timeEntry.clockOut && timeEntry.clockIn) {
                    let totalMinutes = (new Date(timeEntry.clockOut) - new Date(timeEntry.clockIn)) / 1000 / 60;
                    
                    // Subtract break time if exists
                    if (timeEntry.breakDuration) {
                        // If break is more than 30 minutes, only deduct 30 minutes
                        const deductibleBreak = Math.min(timeEntry.breakDuration, 30);
                        totalMinutes -= deductibleBreak;
                    }
                    
                    timeEntry.totalHours = (totalMinutes / 60).toFixed(2);
                }
            }
        }
    });

    return TimeEntry;
};
