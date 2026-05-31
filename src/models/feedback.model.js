const {DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user.model').User;

const Feedback = sequelize.define('Feedback',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    rating:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    userId:{
        type:DataTypes.INTEGER,
        references:{
            model:User,
            key:"id"
        }
    }
},{
    tableName:'feedback'
});

module.exports={
    Feedback
}