const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { Order } = require('./order.model');

const Payment = sequelize.define('Payment',{
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
        }
    },
    transactionToken:{
        type:DataTypes.STRING,
        allowNull:true,
        unique:true
    },
    status:{
        type:DataTypes.STRING,
        defaultValue:'PENDING'
    },
    paymentMethod:{
        type:DataTypes.STRING
    }
},{
    tableName:'payments',
    timestamps:true
});

module.exports={
    Payment
}