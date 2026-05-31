const User = require('../models').User;
const crypto = require('crypto');
const { getUniversityIdByName } = require('./university.service');
const { Op } = require('sequelize');
const { Order, Catalog, Defect, LoggedOutUser, UserLimitPackage, OrderItem, LimitPackage } = require('../models');
const Organization = require('../models/index').Organization;
const logOutService = require('../services/loggedOutUser.service');
const easeBuzzService = require('../services/easeBuzz.service');

const RegisterUser=async(universityId,studentId,name,mobileNumber,laundryNumber)=>{

    if(!universityId || !studentId || !name || !mobileNumber || !laundryNumber){
        throw new error("All Inputs required");
    }

    const existingUser = await User.findOne({
        where:{
            studentId:studentId,
            status : 'enable'
        }
    });

    if(existingUser){
        throw new Error("User already Exists with given studentId");
    }

    const existingUserMobile = await User.findOne({
        where:{
            mobileNumber:mobileNumber,
            status : 'enable'
        }
    });

    if(existingUserMobile){
        throw new Error("User already Exists with given mobileNumber");
    }

    const existingUserLaundry = await User.findOne({
        where:{
            laundryNumber:laundryNumber,
            status : 'enable'
        }
    });

    if(existingUserLaundry){
        throw new Error("User already Exists with given laundryNumber");
    }

    const newUser = await User.create({
        organizationId : universityId,
        organizationType : 'UNIVERSITY',
        studentId,
        name,
        mobileNumber,
        laundryNumber,
        oneTimePassword:null
    });

    const formatted=newUser.toJSON();
    delete formatted.createdAt;
    delete formatted.oneTimePassword;
    
    const formattedData = {
        id: formatted.id,
        universityId: formatted.organizationId,
        studentId: formatted.studentId,
        name: formatted.name,
        mobileNumber: formatted.mobileNumber,
        laundryNumber: formatted.laundryNumber
    };

    return formattedData;
};

const generateAndSaveOtp=async(mobileNumber)=>{

    if(!mobileNumber){
        throw new Error("mobile number required");
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const user = await User.findOne({
        where:{
            mobileNumber : mobileNumber
        }
    });

    if(!user){
        throw new Error("User with given mobile number does not exist");
    }

    await User.update({
        oneTimePassword:otp
    },{
        where:{mobileNumber}
    });

    return otp;
};

const getUserOtp=async(mobileNumber)=>{

    if(!mobileNumber){
        throw new Error("mobile number required");
    }

    const actualOtp=await User.findOne({
        where:{
            mobileNumber
        }
    });

    if(!actualOtp){
        throw new Error("user not found");
    }

    return mobileNumber ? actualOtp.oneTimePassword : null;
}

const deleteUserOtp=async(mobileNumber)=>{

    if(!mobileNumber){
        throw new Error("mobile number required");
    }

    await User.update({
        oneTimePassword:null
    },{
        where:{mobileNumber}
    });

    return "OTP deleted successfully";
}

const getUserDetailsByMobile=async(mobileNumber)=>{

    if(!mobileNumber){
        throw new Error("mobile number required");
    }

    const userDetails=await User.findOne({
        where:{mobileNumber},
        attributes:{exclude:['oneTimePassword']}
    });

    if(!userDetails){
        throw new Error("User not found");
    }

    return userDetails;
}

const updateUserDetails=async(data)=>{

    const updatedField={};

    if(data.name){
        updatedField.name=data.name
    }
    if(data.studentId){
        updatedField.studentId=data.studentId
    }
    if(data.mobileNumber){
        updatedField.mobileNumber=data.mobileNumber
    }
    if (data.laundryNumber){
        updatedField.laundryNumber=data.laundryNumber
    }
    if(data.universityName){
        const universityId = await getUniversityIdByName(data.universityName);
        updatedField.organizationId=universityId,
        updatedField.organizationType='UNIVERSITY'
    }
    if(data.image){
        updatedField.image=data.image
    }

    const user = await User.findOne({
        where:{
            id:data.userId
        }
    });

    if(!user){
        throw new Error("User not found");
    }

    const updatedUser=await User.update(updatedField,{
        where:{
            id:data.userId
        }
    })

    return "Profile updated Succesfully";
};

const getAllUsers = async({organizationId,organizationType,protocol,host}={})=>{

    const whereCondition = {};


    if (organizationId && organizationType) {
        whereCondition.organizationId = organizationId;
        whereCondition.organizationType = organizationType;
    }

    const baseUrl = `${protocol}://${host}/uploads/`;

    const users = await User.findAll({
        where:whereCondition,
        attributes:{
            exclude : ['oneTimePassword']
        },
        include:[{
            model : Organization,
            attributes : ['name','type']
        }],
        order:[['createdAt','DESC']]
    });


    const formattedUsers = users.map(user=>{

        const date = new Date(user.createdAt);

        const onlyDate = date.toLocaleDateString('en-GB',{
            day : '2-digit',
            month : 'short',
            year : 'numeric'
        });

        const onlyTime= date.toLocaleTimeString('en-US',{
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });

        return {
            userId : user.id,
            universityId : user.organizationId,
            universityName : user.Organization.name,
            studentId : user.studentId,
            name : user.name,
            image : user.image?(baseUrl+user.image):null,
            mobileNumber : user.mobileNumber,
            laundryNumber : user.laundryNumber,
            registrationDate : onlyDate,
            registrationTime : onlyTime,
            status : user.status
        }
    });

    return {
        users:formattedUsers
    }
}

const getUserInfo = async(userId,protocol,host)=>{

    if(!userId){
        throw new Error("UserId required");
    }

    const user = await User.findOne({
        where:{
            id : userId
        },
        attributes:{
            exclude:['oneTimePassword','createdAt']
        },
        include : [{
            model : Organization,
            attributes : ['name','monthlyFreeLaundryLimit']
        }]
    });


    if(!user){
        throw new Error("Incorrect UserId");
    }

    const remainingLimit = await getRemainingLimit(userId);
    const totalFreeLaundryLimit =user.Organization.monthlyFreeLaundryLimit

    const formattedBaseUrl = `${protocol}://${host}/uploads/`;

    const data = {
        id : user.id,
        universityId : user.organizationId,
        studentId : user.studentId,
        name : user.name,
        mobileNumber : user.mobileNumber,
        laundryNumber : user.laundryNumber,
        University: {
            name : user.Organization.name
        },
        image : formattedBaseUrl + user.image || null,
        remainingLimit:remainingLimit,
        totalFreeLaundryLimit:totalFreeLaundryLimit
    }

    return data;
}

const getDefectedHistory = async(userId,status,protocol,host)=>{

    if(!userId){
        throw new Error("user id required");
    }

    if(typeof userId !== 'number'){
        throw new Error("incorrect type of user id");
    }

    if(status!=='approved' && status !=='denied'){
        throw new Error("incorrect status");
    }

    const decision = status.trim().toUpperCase();

    const list = await Defect.findAll({
        where:{
            decision : decision
        },
        include:[{
            model : Order,
            where : {
                userId : userId
            },
            attributes : ['createdAt']
        },{
            model : Catalog,
            attributes:['name']
        }]
    });

    const baseUrl = `${protocol}://${host}/uploads/`

    const formattedList=list.map(item=>{

        const onlyDate = item.Order.createdAt.toLocaleDateString('en-GB',{
            day : '2-digit',
            month : 'short',
            year : 'numeric'
        });

        const onlyTime = item.Order.createdAt.toLocaleTimeString('en-US',{
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });

        return {
            date : onlyDate,
            time : onlyTime,
            productName : item.Catalog.name,
            description : item.issueDescription,
            image : baseUrl + item.image
        }
    });

    return formattedList;

}


const getNonWashable = async(userId)=>{

    if(!userId){
        throw new Error("user id required");
    }

    if(typeof userId !== 'number'){
        throw new Error("incorrect type of user id");
    }

    const list = await Defect.findAll({

        include:[{
            model : Order,
            where : {
                userId : userId
            },
            attributes : ['createdAt', 'userId'],
			 include: [
                    {
                        model: User, 
                        attributes: ['laundryNumber']
                    }
                ]
        },{
            model : Catalog,
            attributes:['name']
        }]
    });

    const formattedList=list.map(item=>{

        const onlyDate = item.Order.createdAt.toLocaleDateString('en-GB',{
            day : '2-digit',
            month : 'short',
            year : 'numeric'
        });

        const onlyTime = item.Order.createdAt.toLocaleTimeString('en-US',{
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });
		
		 

        return {
            date : onlyDate,
            time : onlyTime,
			orderId : item.orderId,
			laundryNumber: item.Order.User.laundryNumber,
            productName : item.Catalog.name,
            description : item.issueDescription,
        }
    });

    return formattedList;

}

const logoutUI=async(userId)=>{

    if(!userId){
        throw new Error("user id required");
    }

    const user = await User.findOne({
        where : {
            id : userId
        }
    });

    if(!user){
        throw new Error("user does not exist");
    }

    const data = logOutService.loggedOut(userId);

    return 'user logged out successfully';
}

const getRemainingLimit=async(userId)=>{

    if(!userId){
        throw new Error('user id required');
    }

    const user = await User.findOne({
        where : {
            id : userId
        },
        include:[{
            model:Organization,
            attributes:['monthlyFreeLaundryLimit']
        }]
    })

    const activePackages = await UserLimitPackage.findAll({
        where:{
            userId,
            paymentStatus:'SUCCESS',
            expiresAt:{
                [Op.gt]: new Date()
            }
        },
        attributes:['extraLimit']
    });

    let extraLimit = 0;

    activePackages.forEach(pkg=>{
        extraLimit += pkg.extraLimit;
    });

    const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    const orders = await Order.findAll({
        where:{
            userId,
            serviceType:'laundry',
            createdAt:{
                [Op.gte]: monthStart
            }
        },
        include:[{
            model:OrderItem,
            attributes:['quantity']
        }]
    });

    let usedLimit = 0;

    orders.forEach(order=>{
        order.OrderItems.forEach(item=>{
            usedLimit += item.quantity;
        });
    });

    const totalLimit = user.Organization.monthlyFreeLaundryLimit + extraLimit;

    const remainingLimit = Math.max(totalLimit - usedLimit,0);

    return remainingLimit;
}

const getPackages=async()=>{

    const packages = await LimitPackage.findAll();

    const formattedPackages = packages.map(package=>{
        return {
            id:package.id,
            name:package.name,
            extraLimit:package.extraLimit,
            price:package.price,
            validityDays:package.validityDays
        }
    })

    return formattedPackages;
}

const purchasePackage=async(userId,packageId)=>{

    if(!userId || !packageId){
        throw new Error("incorrect input");
    }

    const user = await User.findOne({
        where : {
            id:userId,
            status:'enable'
        }
    })

    if(!user){
        throw new Error("incorrect details");
    }

    const selectedPackage = await LimitPackage.findOne({
        where : {
            id:packageId,
            status:'active'
        }
    });

    if(!selectedPackage){
        throw new Error("incorrect details");
    }

    const order = await UserLimitPackage.create({
        userId,
        packageId,
        extraLimit:selectedPackage.extraLimit,
        expiresAt:null
    });
    const txnid = `QW_${order.id}_${Date.now()}`;
    await order.update({
        transactionToken:txnid
    })

    const gatewayResponse = await easeBuzzService.createPaymentSessionpackages({
        orderId:order.id,
        amount:selectedPackage.price,
        name:user.name,
        phone:user.mobileNumber,
        txnid:txnid
    });

    const accessKey = gatewayResponse.accessKey;

    return accessKey;

}


module.exports={
    RegisterUser,
    generateAndSaveOtp,
    getUserOtp,
    deleteUserOtp,
    getUserDetailsByMobile,
    updateUserDetails,
    getAllUsers,
    getUserInfo,
    getDefectedHistory,
    logoutUI,
    getRemainingLimit,
    getPackages,
    purchasePackage,
	getNonWashable
};