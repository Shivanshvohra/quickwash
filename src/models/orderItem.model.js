const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { Category } = require('./category.model');
const Catalog = require('./catalog.model').Catalog;
const Order = require('./order.model').Order;

const OrderItem = sequelize.define('OrderItem',{
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
    productId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Catalog,
            key:'id'
        }
    },
    categoryId:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    quantity:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    priceAtTime:{
        type:DataTypes.INTEGER,
        allowNull:true
    }
},{
    tableName:'order_items',
    timestamps:true
});

module.exports = {
    OrderItem
};