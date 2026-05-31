const Organization = require('../models/index').Organization;

const getUniversityIdByName = async (name) => {
    if (!name) {
        throw new Error("University name is required");
    }

    const uni = await Organization.findOne({
        where : {
            name : name,
            type : 'UNIVERSITY'
        }
    })

    if(!uni){
        throw new Error("univerisities not found");
    }

    return uni ? uni.id : null;
};

const getAllUniversities=async()=>{
    const universities= await Organization.findAll({
        where : {
            type : 'UNIVERSITY'
        },
        attributes:['name','id']
    })
    return universities;
}

const getListOfUniversities=async(type)=>{

    if(!type){
        throw new Error('type required');
    }

    const formattedType = type.trim().toUpperCase();

    if(!['UNIVERSITY','HOSPITAL'].includes(formattedType)){
        throw new Error('incorrect type');
    }

    const universities = await Organization.findAll({
        where : {
            type : formattedType
        },
        attributes : ['id','name']
    });

    return universities;

}

module.exports={
    getUniversityIdByName,
    getAllUniversities,
    getListOfUniversities
};