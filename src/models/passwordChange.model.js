const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Washer = require('./index').Washer;

const PasswordChange = sequelize.define('PasswordChange',{
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
        status:{
            type:DataTypes.ENUM('REQUESTED','CHANGED','REJECTED'),
            allowNull:false,
            defaultValue: 'REQUESTED'
        }
},{
    tableName : 'passwordChange',
    timestamps : true
})

module.exports={
    PasswordChange
}