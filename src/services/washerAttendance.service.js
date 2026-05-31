const { WasherMan, WasherAttendance } = require("../models");

const setAttendance = async(washerId,date,washers)=>{

    if(!washerId){
        throw new Error('washer id required');
    }

    if(!date){
        throw new Error('date required');
    }

    if(!washers || !washers.length){
        throw new Error(' no washers data received');
    }

    const formattedDate = new Date(date).toISOString().split('T')[0];

    const validIds = [];

    const washerMen = await WasherMan.findAll({
        where:{
            washerId : washerId,
            status : 'enable'
        }
    });

    for(const washer of washerMen){
        validIds.push(washer.id);
    }

    const attendance = [];

    for(const men of washers){

        if(!validIds.includes(men.id)){
            throw new Error("washermen does not belong to this washer");
        }

        if (!men.attendance || typeof men.attendance !== 'string') {
            throw new Error(`attendance missing for washerman ${men.id}`);
        }

        const status = men.attendance.trim().toUpperCase();

        if(!['PRESENT','ABSENT'].includes(status)){
            throw new Error('invalid status');
        }

        attendance.push({
            washerManId:men.id,
            attendanceDate:date,
            attendance:status
        })
    }

    await WasherAttendance.bulkCreate(attendance,{
        updateOnDuplicate:['attendance']
    });

    return "attendance updated successfully";

}

module.exports={
    setAttendance
}