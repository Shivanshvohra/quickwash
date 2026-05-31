const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Order = require('./index').Order;
const Washer = require('./index').Washer;
const Catalog = require('./index').Catalog;

const Defect = sequelize.define('Defect',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    washerId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Washer,
            key:'id'
        },
        onDelete:'CASCADE'
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
    itemId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Catalog,
            key:'id'
        }
    },
    issueDescription:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    image:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    decision:{
        type:DataTypes.ENUM('PENDING','APPROVED','DENIED'),
        allowNull:false,
        defaultValue:'PENDING'
    }
},{
    tableName:'defects',
    timestamps:true
});

module.exports={
    Defect
}