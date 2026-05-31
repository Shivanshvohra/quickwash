const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { Organization } = require('./organization.model');

const Washer = sequelize.define('Washer',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:true
    },
    loginId:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
	image:{
        type:DataTypes.STRING,
        allowNull:true
    },
    organizationId:{
        type:DataTypes.INTEGER,
        references:{
            model : Organization,
            key : 'id'
        }
    },
    organizationType:{
        type:DataTypes.ENUM('UNIVERSITY','HOSPITAL')
    }
},{
    tableName:'washers',
    timestamps:true
});

module.exports={
    Washer
}