const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");


const ChemicalList = sequelize.define('ChemicalList', {
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    price:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    }
},{
    tableName : 'chemicalList',
    timestamps : true
});

module.exports={
    ChemicalList
}