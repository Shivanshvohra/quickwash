const {DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');
const { Category } = require('./category.model');
const Catalog = require("./catalog.model").Catalog;
const User = require("./user.model").User;

const Cart = sequelize.define('Cart',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    productId:{
        type:DataTypes.INTEGER,
        references:{
            model:Catalog,
            key:'id'
        }
    },
    categoryId:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    userId:{
        type:DataTypes.INTEGER,
        references:{
            model:User,
            key:'id'
        }
    },
    quantity:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    serviceType:{
        type:DataTypes.ENUM('laundry','paidLaundry','drycleaning','ironing'),
        allowNull:false
    }
},{
    tableName:'cart',
    timestamps:true
});

module.exports={
    Cart
};