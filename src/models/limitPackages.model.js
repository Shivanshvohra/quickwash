const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const LimitPackage = sequelize.define('LimitPackage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    extraLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    validityDays: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }

}, {
    tableName: 'limit_packages',
    timestamps: true
});

module.exports = {
    LimitPackage
};