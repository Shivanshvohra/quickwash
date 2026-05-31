const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Organization } = require("./organization.model");


const SubAdmin = sequelize.define('SubAdmin',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
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
    tableName:'subadmin',
    timestamps:true
});

module.exports={
    SubAdmin
}