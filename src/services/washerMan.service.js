const { Op } = require("sequelize");
const { WasherMan, WasherAttendance, Washer } = require("../models");

const washerMen = async(washerId,date)=>{

    if(!washerId){
        throw new Error('washer id required');
    }

    if(!date){
        throw new Error('date required');
    }

    if(typeof washerId !== 'number'){
        throw new Error('washer type incorrect');
    }

    const washers = await WasherMan.findAll({
        where : {
            washerId : washerId
        }
    });

    const ids = [];

    for(const washer of washers){
        ids.push(washer.id);
    }

    if(!washers.length){
        throw new Error("no washer men assigned");
    }

    const washerAttendance = await WasherAttendance.findAll({
        where : {
            washerManId : {
                [Op.in] : ids
            },
            attendanceDate : date
        }
    })

    const map = new Map();

    for(const washerMen of washerAttendance){
        map.set(washerMen.washerManId,washerMen.attendance);
    }

    let total_present = 0;
    let total_absent = 0;
	
    const formattedWashers = washers.map(washer=>{
        const status = map.get(washer.id) || null;
		
		const normalizedStatus = status ? status.toUpperCase() : null;

		if (normalizedStatus === 'PRESENT') {
			total_present++;
		} else if (normalizedStatus === 'ABSENT') {
			total_absent++;
		}

        return {
            washerManId:washer.id,
            name:washer.name,
            image:washer.image,
            status:status
        }
    });
	
	formattedWashers.total_present = total_present;
	formattedWashers.total_absent = total_absent;
	
    //return formattedWashers;
	return {
    total_present,
    total_absent,
    data: formattedWashers
};
}

const addWasherMenAdmin = async({washerId,washers}={})=>{

    if(!washerId){
        throw new Error("washer id required");
    }

    console.log(washers);

    if(!washers || !washers.length){
        throw new Error("washers data required");
    }

    const check = Washer.findByPk(washerId);

    if(!check){
        throw new Error('incorrect washer id');
    }

    const data = [];

    for(const washer of washers){

        if(!washer.name){
            throw new Error('name missing');
        }

        data.push({
            washerId:washerId,
            name:washer.name,
            image:washer.image || null,
            idProof:washer.idProof || null
        })
        
    }

    await WasherMan.bulkCreate(data);

    return "added successfully";
}

const editWasherMen = async({washerId,data}={})=>{

    if(!washerId){
        throw new Error("washer id required");
    }

    if(!data){
        throw new Error("data required");
    }
    console.log(data);

    const washerMen = await WasherMan.findOne({
        where:{
            id : data.washerManId,
            washerId:washerId
        }
    });

    if(!washerMen){
        throw new Error("invalid details");
    }

    const updateClause = {};

    if(data.name){
        updateClause.name=data.name;
    }

    if(data.image){
        updateClause.image=data.image;
    }

    if(data.idProof){
        updateClause.idProof = data.idProof;
    }

    await washerMen.update(updateClause);

    return "editted successfully";
}

const deleteWasherMen = async({washerId,washerManId}={})=>{

    if(!washerId){
        throw new Error('washer id required');
    }

    if(!washerManId){
        throw new Error('washer men id required');
    }

    const check = await WasherMan.findOne({
        where : {
            id:washerManId,
            washerId:washerId,
            status :'enable'
        }
    });

    if(!check){
        throw new Error('no washer men found');
    }

    await check.update({
        status : 'disable'
    });

    return "deleted successfully";
}

const enableWasherMen = async({washerId,washerManId}={})=>{

    if(!washerId){
        throw new Error('washer id required');
    }

    if(!washerManId){
        throw new Error('washer men id required');
    }

    const check = await WasherMan.findOne({
        where : {
            id:washerManId,
            washerId:washerId,
            status :'disable'
        }
    });

    if(!check){
        throw new Error('no washer men found');
    }

    await check.update({
        status : 'enable'
    });

    return "deleted successfully";
}



const viewWasherMen = async(washerId)=>{
    if(!washerId){
        throw new Error('washer id required');
    }

    const check = await Washer.findOne({
        where : {
            id:washerId,
        }
    });

    if(!check){
        throw new Error('incorrect id');
    }

    const list = await WasherMan.findAll({
        where : {
            washerId:washerId,
            status : 'enable'
        }
    });


    return list;
}

module.exports={
    washerMen,
    addWasherMenAdmin,
    editWasherMen,
    deleteWasherMen,
    viewWasherMen,
    enableWasherMen
}