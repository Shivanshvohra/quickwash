const { Organization, SubAdmin} = require("../models");
const orderService = require('./order.service');
const universityService = require('./university.service');
const userService = require('../services/user.service');
const defectService = require('../services/defect.service');
const { Op } = require("sequelize");

const login = async(loginId,password,organizationId,organizationType)=>{

        if(!loginId || !password || !organizationId || !organizationType){
            throw new Error("inputs required");
        }

        const subAdmin = await SubAdmin.findOne({
            where : {
                loginId
            }
        });

        if (!subAdmin) {
            throw new Error("SubAdmin not found");
        }

        console.log(subAdmin.password);

        if((loginId!=subAdmin.loginId)||(password!=subAdmin.password)){
            throw new Error("Invalid input");
        }

        const org = await Organization.findOne({
            where:{
                id : organizationId,
                type : organizationType
            }
        });

        if(!org){
            throw new Error("incorrect org");
        }

        await subAdmin.update({
            organizationId,
            organizationType
        })

        return "details updated successfully";

}

const getAllOrders = async(id)=>{

    if(!id){
        throw new Error("sub admin id required");
    }

    const subAdmin = await SubAdmin.findOne({
        where : {
            id
        }
    });

    const organizationId = subAdmin.organizationId;
    const organizationType = subAdmin.organizationType;

    const org = await Organization.findOne({
        where : {
            id : subAdmin.organizationId,
            type : subAdmin.organizationType
        }
    });

    if(!org){
        throw new Error("incorrect org");
    }


    return await orderService.getAllOrders({organizationId,organizationType});
}

const getOrderDetails = async(orderId,id)=>{
    return orderService.getOrderDetailsAdmin({orderId,id});
}

const deleteUser = async(userId)=>{

    return await orderService.deleteUser(userId);

}

const registerUser = async(univeristyName,studentId,name,mobileNumber,laundryNumber)=>{

    if(!univeristyName || !studentId || !name || !mobileNumber || !laundryNumber){
        throw new Error("inputs required");
    }

    const uni = await universityService.getUniversityIdByName(univeristyName);

    if(!uni){
        throw new Error("incorrect university name");
    }

    const findUser = await User.findOne({
        where : {
            [Op.or]:[
                { studentId : studentId },
                { mobileNumber : mobileNumber }
            ]
        }
    })

    if(findUser){
        throw new Error("user already exists");
    }

    const newUser = await userService.RegisterUser(
        uni,
        studentId,
        name,
        mobileNumber,
        laundryNumber
    );

    const data = {
        id : newUser.id,
        universityId : newUser.organizationId,
        studentId : newUser.organizationId,
        name : newUser.name,
        mobileNumber : newUser.mobileNumber,
        laundryNumber : newUser.laundryNumber
    }

    return data;
    
}

const updateUser=async(data)=>{

    const userId = data.userId;

    if(!userId){
        throw new Error("user id required");
    }

    if(data.length == 1){
        throw new Error("inputs required");
    }

    const returnData = await userService.updateUserDetails(data);

    return returnData;
}

const getAllUsers = async(id)=>{

    const subAdmin = await SubAdmin.findByPk(id);

    const organizationId = subAdmin.organizationId;
    const organizationType = subAdmin.organizationType;

    const data = await userService.getAllUsers({organizationId,organizationType});

    return data;

}

const getDashboardMetric = async(id)=>{

    if(!id){
        throw new Error("input missing");
    }

    const subAdmin = await SubAdmin.findByPk(id);

    const organizationId = subAdmin.organizationId;
    const organizationtype = subAdmin.organizationType;

    if(!organizationId || !organizationtype){
        throw new Error("org inputs missing");
    }
    console.log("reached");
    const data = await orderService.getDashboardMetric({organizationId,organizationtype});

    return data;
}

const defectedItems = async(organizationId,organizationType)=>{
    return await defectService.defectedItems({organizationId,organizationType});
}

const viewDefectedDetails=async(orderId,protocol,host)=>{
    return await defectService.viewDefectDetails(orderId,protocol,host);
}



module.exports={
    login,
    getAllOrders,
    getOrderDetails,
    deleteUser,
    registerUser,
    updateUser,
    getAllUsers,
    getDashboardMetric,
    defectedItems,
    viewDefectedDetails
}