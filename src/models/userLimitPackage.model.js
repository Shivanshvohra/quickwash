const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = require('./user.model').User;
const LimitPackage = require('./limitPackages.model').LimitPackage;

const UserLimitPackage = sequelize.define('UserLimitPackage', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },

    packageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: LimitPackage,
            key: 'id'
        }
    },

    extraLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    paymentStatus: {
        type: DataTypes.ENUM(
            'PENDING',
            'SUCCESS',
            'FAILED'
        ),
        defaultValue: 'PENDING'
    },

    transactionToken: {
        type: DataTypes.STRING,
        allowNull: true,
        unique:true
    },

    paymentMode: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {
    tableName: 'user_limit_packages',
    timestamps: true
});

module.exports = {
    UserLimitPackage
};