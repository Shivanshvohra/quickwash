const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Order = require('./order.model').Order;
const User = require('./user.model').User;

const Orderstatus = sequelize.define('Orderstatus',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    orderId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Order,
            key:'id'
        },
        onDelete:'CASCADE'
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:User,
            key:'id'
        },
        onDelete:'CASCADE'
    },
    status:{
        type:DataTypes.ENUM('INITIATED','ISSUE','SUBMITTED','COMPLETED','DENIED','FAILED'),
        defaultValue:'INITIATED'
    }
},{
    tableName:'orderStatus',
    timestamps:true
});

module.exports={
    Orderstatus
}