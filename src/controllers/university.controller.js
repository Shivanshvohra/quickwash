const universityService=require('../services/university.service');

const getAllUniversities=async(req,res)=>{
    try{
        const universities=await universityService.getAllUniversities();
        res.status(200).json({
            message:'Universities retrieved successfully',
            data:universities
        });
    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
};

module.exports={
    getAllUniversities
}