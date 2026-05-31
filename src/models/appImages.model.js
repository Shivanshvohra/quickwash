const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");


const AppImages = sequelize.define('AppImages',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.ENUM(
            'outer_1',
            'outer_2',
            'outer_3',
            'inner_1',
            'inner_2',
            'inner_3'
        ),
        allowNull:false
    },
    image:{
        type:DataTypes.STRING,
        allowNull:true
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    subTitle:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('active','inactive'),
        allowNull:false,
        defaultValue:'active'
    }
},{
    tableName:'appImages',
    timestamps:true
});

module.exports={
    AppImages
}

