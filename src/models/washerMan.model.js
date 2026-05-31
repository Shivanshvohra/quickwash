const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Washer } = require("./washer.model");


const WasherMan = sequelize.define('WasherMan',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    washerId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model : Washer,
            key : 'id'
        }
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    image:{
        type:DataTypes.STRING
    },
    status:{
        type:DataTypes.ENUM('enable','disable'),
        defaultValue:'enable'
    },
    idProof:{
        type:DataTypes.STRING,
        allowNull:true
    }
},{
    tableName:'washerMan',
    timestamps:true
});

module.exports={
    WasherMan
}