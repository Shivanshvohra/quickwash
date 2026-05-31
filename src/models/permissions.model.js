const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Menu = sequelize.define('Menu',{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    status:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:1
    }
},{
    tableName:'Menu',
    timestamps:true
})

module.exports={
    Menu
}