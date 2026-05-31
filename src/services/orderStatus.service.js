const { Order } = require('../models/order.model');

const Orderstatus = require('../models/index').Orderstatus;

const createOrderStatus=async(orderId,userId, t)=>{

    if(!orderId || !userId){
        throw new Error("orderId and userId required");
    }

    if(typeof orderId !=="number"){
        throw new Error("Incorrect type");
    }

    if(typeof userId !=="number"){
        throw new Error("Incorrect type");
    }

    const orderStatus = await Orderstatus.create({
        orderId,
        userId
    },{transaction: t});

    return "created succesfully";
}

const updateOrderstatus=async(orderId,status)=>{

    if(!orderId || !status){
        throw new Error("inputs missing")
    }

    if(typeof orderId !== "number"){
        throw new Error("Incorrect type");
    }

    if(status !== 'COMPLETED'){
        throw new Error("invalid status");
    }

    const order = await Order.findOne({
        where:{
            id : orderId
        }
    });

    if(!order){
        throw new Error("Incorrect input");
    }

    const UserId = order.userId;

    const create = await Orderstatus.create({
        orderId : orderId,
        userId : UserId,
        status : status
    })

    return "status updated"
};

const getOrderStatus=async(userId,orderId)=>{

    if(!userId || !orderId){
        throw new Error("inputs missing");
    }

    if(typeof orderId !=="number"){
        throw new Error("Incorrect type");
    }

    if(typeof userId !=="number"){
        throw new Error("Incorrect type");
    }

    const order = await Orderstatus.findOne({
        where:{
            userId : userId,
            orderId : orderId
        },
        order: [['createdAt','DESC']]
    });

    if(!order){
        throw new Error("Incorrect inputs");
    }

    return order.status;
};

const adminOrderStatus=async(orderId,status)=>{

    if(!orderId || !status){
        throw new Error("inputs missing");
    }

    if(!['SUBMITTED','DENIED'].includes(status.trim().toUpperCase())){
        throw new Error("invalid status");
    }

    const order = await Order.findByPk(orderId);

    if(!order){
        throw new Error("Incorrect order id");
    }

    await Orderstatus.create({
        orderId,
        userId : order.userId,
        status : status.trim().toUpperCase()
    });

    return "status updated";
}

module.exports={
    updateOrderstatus,
    getOrderStatus,
    createOrderStatus,
    adminOrderStatus
}