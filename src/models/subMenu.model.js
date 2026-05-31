const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Menu } = require("./permissions.model");

const SubMenu = sequelize.define('SubMenu',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    menuId:{
        type:DataTypes.INTEGER,
        references:{
            model : Menu,
            key : 'id'
        },
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:1
    }
},{
    tableName:'subMenu',
    timestamps:true,
    indexes:[
        {
            unique:true,
            fields:['menuId','name']
        }
    ]
})

module.exports={
    SubMenu
}