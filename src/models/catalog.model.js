const {DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');

const Catalog = sequelize.define('Catalog',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    price:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    image:{
        type:DataTypes.STRING(255)
    },
    productType:{
        type:DataTypes.ENUM('MEN','WOMEN','UNISEX'),
        allowNull:false
    },
    serviceType:{
        type:DataTypes.ENUM('laundry','drycleaning','ironing'),
        allowNull : false
    },
    status:{
        type:DataTypes.ENUM('active','inactive'),
        allowNull : false,
        defaultValue:'active'
    }
},{
    tableName:'catalog',
    timestamps:false
});

module.exports={
    Catalog
};