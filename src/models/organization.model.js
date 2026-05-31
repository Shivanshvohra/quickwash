const {DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');

const Organization = sequelize.define('Organization',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    type:{
        type:DataTypes.ENUM('UNIVERSITY','HOSPITAL'),
        allowNull:false,
        defaultValue:'UNIVERSITY'
    },
    monthlyFreeLaundryLimit:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    }
},{
    tableName:'organization',
    timestamps:true,
    indexes:[
        {
            unique : true,
            fields : ['name','type']
        }
    ]
});

module.exports = {
    Organization
};
