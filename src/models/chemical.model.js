const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Washer } = require("./washer.model");
const { ChemicalList } = require("./chemicalList.model");

const Chemical = sequelize.define('Chemical',{
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
            key:'id'
        }
    },
    month:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    year:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    chemicalId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model : ChemicalList,
            key:'id'
        }
    },
    pricePerUnit: {
        type: DataTypes.DECIMAL(10,3),
        allowNull: false
    },
    openingBalance:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    },
    received:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    },
    consumed:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    }
},{
    tableName : 'chemical',
    timestamps : true,
    indexes:[
        {
            unique : true,
            fields :['month','year','washerId','chemicalId']
        }
    ]
});

module.exports={
    Chemical
}