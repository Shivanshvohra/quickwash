const {DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');
const { Washer } = require('./washer.model');
const { Organization } = require('./organization.model');

const Washermapper = sequelize.define('Washermapper',{
    id:{
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    washerId:{
        type:DataTypes.INTEGER,
        allowNull : false,
        references:{
            model:Washer,
            key:'id'
        }
    },
    organizationId:{
        type:DataTypes.INTEGER,
        allowNull : false,
        references: {
            model: Organization,
            key: 'id'
        }
    },
    organizationType:{
        type:DataTypes.ENUM('UNIVERSITY','HOSPITAL'),
        allowNull:false,
        defaultValue:'UNIVERSITY'
    }
},{
    tableName : 'washerMapper',
    timestamps : true,
    indexes:[
        {
            unique:true,
            fields:['organizationId','organizationType']
        }
    ]
});

module.exports={
    Washermapper
}