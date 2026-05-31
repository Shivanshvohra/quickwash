const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { Washer } = require('./washer.model');
const { Organization } = require('./organization.model');
const User = require('./user.model').User;

const Order = sequelize.define('Order',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:User,
            key:'id'
        }
    },
    totalAmount:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    serviceType:{
        type:DataTypes.ENUM('laundry','drycleaning','paidLaundry','ironing'),
        allowNull:false
    },
    washerId : {
        type : DataTypes.INTEGER,
        references : {
            model : Washer,
            key : 'id'
        }
    },
    organizationId:{
        type:DataTypes.INTEGER,
        allowNull:true,
        references: {
            model: Organization,
            key: 'id'
        }
    },
    organizationType:{
        type:DataTypes.ENUM('UNIVERSITY','HOSPITAL'),
        allowNull:true
    },
    receipt_url:{
        type:DataTypes.STRING
    }
},{
    tableName:'orders',
    timestamps:true,
    indexes: [
        {
        fields: ['organizationId', 'organizationType']
        }
    ]
});

module.exports = {
    Order
};