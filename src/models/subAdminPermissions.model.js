const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { SubAdmin } = require("./subAdmin.model");
const { Menu } = require("./permissions.model");
const { SubMenu } = require("./subMenu.model");

const SubAdminPermissions = sequelize.define('SubAdminPermissions',{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    subAdminId:{
        type:DataTypes.INTEGER,
        references:{
            model : SubAdmin,
            key: 'id'
        },
        allowNull:false
    },
    menuId:{
        type:DataTypes.INTEGER,
        references:{
            model : Menu,
            key: 'id'
        },
        allowNull:false
    },
    subMenuId:{
        type:DataTypes.INTEGER,
        references:{
            model : SubMenu,
            key : 'id'
        },
        allowNull:true
    },
    status:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:1
    }
},{
    tableName:'subAdminPermissions',
    timestamps:true,
    indexes:[
        {
            unique:true,
            fields:['subAdminId','menuId','subMenuId']
        }
    ]
})

module.exports={
    SubAdminPermissions
}