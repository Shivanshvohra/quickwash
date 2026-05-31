const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');
const { Order } = require('./order.model');
const { Catalog } = require('./catalog.model');

const Issue = sequelize.define('Issue',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    orderId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Order,
            key:'id'
        }
    },
    productId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Catalog,
            key:'id'
        }
    },
    quantity:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    issueDescription:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    submittedByType:{
        type:DataTypes.ENUM('USER','WASHER'),
        allowNull:false
    },
    submittedById:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('PENDING','APPROVED','DENIED'),
        allowNull:false,
        defaultValue:'PENDING'
    }
},{
    tableName : 'issues',
    timestamps : true
});

module.exports = {
    Issue
}