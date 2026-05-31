const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { DailyEntry } = require('./dailyEntry.model');

const ElectricityLogs = sequelize.define('ElectricityLogs',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    entryId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:DailyEntry,
            key:'id'
        }
    },
    opening:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    },
    closing:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    },
    consumedUnits:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    },
    pricePerUnitAtTime:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    },
    cost:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false,
    }
},{
    tableName:'electricityLogs',
    timestamps:true,
    indexes:[
            {
                unique : true,
                fields :['entryId']
            }
        ]
});

module.exports={
    ElectricityLogs
}