const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Washer } = require("./washer.model");

const AdminMisConfig = sequelize.define('AdminMisConfig',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    type:{
        type:DataTypes.ENUM('ELECTRICITY_PRICE','GAS_PRICE','GAS_MF'),
        allowNull:false
    },
    value:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    },
    washerId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Washer,
            key:'id'
        }
    }
},{
    tableName:'adminMisConfig',
    timestamps:true,
    indexes:[
        {
            unique:true,
            fields:['washerId','type']
        }
    ]
})

module.exports={
    AdminMisConfig
}