const { Sequelize } = require("sequelize");
const { Chemical } = require("../models/chemical.model");
const dailyEntryService = require('../services/dailyEntryService');
const { ChemicalList, Washer } = require("../models");

const addChemicals = async(data)=>{
    const { month, year, washerId, chemicals } = data;

    if(!month){
        throw new Error("month required");
    }
    if(!year){  
        throw new Error("year required");
    }
    if(!washerId){
        throw new Error("washer id required");
    }
    if(!chemicals || !Array.isArray(chemicals) || chemicals.length === 0){
        throw new Error("chemicals array required");
    }

    const washerCheck = await Washer.findByPk(washerId);

    if(!washerCheck){
        throw new Error("Washer does not exist");
    }

    const set = new Set();

    for(const chemical of chemicals){
        const {chemicalId, openingBalance,received,consumed}=chemical;

        if(!chemicalId){
            throw new Error("chemical id required");
        }

        const chemicalCheck = await ChemicalList.findByPk(chemicalId);

        if(!chemicalCheck){
            throw new Error("Chemical does not exist");
        }

        if(set.has(chemicalId)){
            throw new Error(`Chemical ${chemicalCheck.name} is duplicated`);
        }
        set.add(chemicalId);

        if(
            openingBalance < 0 ||
            received < 0 ||
            consumed < 0
        ){
            throw new Error(`Negative values not allowed`);
        }
        
        if(consumed>(openingBalance+received)){
            throw new Error(`Consumed quantity for chemical ${chemicalCheck.name} incorrect`);
        }

        await Chemical.upsert({
            month,
            year,
            washerId,
            chemicalId,
            openingBalance,
            received,
            consumed,
            pricePerUnit : chemicalCheck.price
        });
    }

    return "updated chemical details successfully";
}

const showChemical=async(month,year)=>{
    if(!month){
        throw new Error("month required");
    }

    if(!year){
        throw new Error("month required");
    }

    const totalLoad = await dailyEntryService.getTotalLoad(month,year);

    const data = await Chemical.findAll({
        where:{
            month : month,
            year : year
        },
        attributes:[

            [Sequelize.fn('SUM',Sequelize.col('openingBalance')),'openingBalance'],
            [Sequelize.fn('SUM',Sequelize.col('received')),'received'],
            [Sequelize.fn('SUM',Sequelize.col('consumed')),'consumed'],
            [
                Sequelize.fn(
                    'SUM',
                    Sequelize.literal('consumed * pricePerUnit')
                ),
                'totalAmount'
            ]
        ],
        include:[{
            model : ChemicalList,
            attributes:['name']
        }],
        group:['ChemicalList.name']
    })

    const formattedData = data.map(row=>{
        const openingBalance = Number(row.get('openingBalance')) || 0;
        const received = Number(row.get('received')) || 0;
        const consumed = Number(row.get('consumed')) || 0;
        const total = openingBalance+received;
        const totalAmount = Number(row.get('totalAmount')) || 0;
        const closingStock = openingBalance+received-consumed;
        const perKgCost = Number((totalAmount/totalLoad).toFixed(3));
        const price = Number((totalAmount/consumed).toFixed(3));
        return {
            chemicalName : row.ChemicalList.name,
            price:price,
            openingBalance:openingBalance,
            chemicalReceived:received,
            total:total,
            chemicalConsumed:consumed,
            chemicalClosingStock:closingStock,
            totalAmount:totalAmount,
            perKgCost:perKgCost
        }
    })

    return formattedData;
}

const chemicalDropdown=async()=>{

    const chemicals = await ChemicalList.findAll();

    const formattedChemicals = chemicals.map(chemical=>{
        return {
            id : chemical.id,
            name : chemical.name
        }
    });
    return formattedChemicals;
};

module.exports={
    addChemicals,
    showChemical,
    chemicalDropdown
}