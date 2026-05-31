const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { User } = require("./user.model");

const LoggedOutUser=sequelize.define('LoggedOutUser',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    userId:{
        type:DataTypes.INTEGER,
        unique:true,
        references:{
            model : User,
            key : 'id'
        }
    },
    isLoggedOut:{
        type:DataTypes.ENUM('0','1'),
        allowNull:false
    }
},{
    tableName:'loggedOutUser',
    timestamps:true
});

module.exports={
    LoggedOutUser
}