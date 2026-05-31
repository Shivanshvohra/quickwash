const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { Washer } = require('./washer.model');

const DailyEntry = sequelize.define('DailyEntry',{
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
        }
    },
    date:{
        type:DataTypes.DATEONLY,
        allowNull:false
        //date is in iso format("2026-04-01")
    },
    totalLoadKg:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    }
},{
    tableName:'dailyEntry',
    timestamps:true,
    indexes:[
        {
            unique : true,
            fields :['washerId','date']
        }
    ]
})

module.exports = {
    DailyEntry
}