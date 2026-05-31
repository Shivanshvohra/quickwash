const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Washer } = require("./washer.model");
const { WasherMan } = require("./washerMan.model");
//{
//   "washerId": 10,
//   "date": "2026-04-30"
// }
const WasherAttendance = sequelize.define('WasherAttendance',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    washerManId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model : WasherMan,
            key : 'id'
        }
    },
    attendance:{
        type:DataTypes.STRING,
        allowNull:false
    },
    attendanceDate:{
        type:DataTypes.DATEONLY,
        allowNull:false
    }
},{
    tableName:'washerAttendance',
    timestamps:true
})

module.exports={
    WasherAttendance
}