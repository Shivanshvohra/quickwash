const Defect = require('../models/index').Defect;
const { Catalog } = require('../models/catalog.model');
const { Order } = require('../models/order.model');
const { User } = require('../models/user.model');
const { Washer } = require('../models/washer.model');
const catalogService = require('../services/catalog.service');
const Orderstatus = require('../models/index').Orderstatus;

const addDefects=async(washerId,orderId,itemName,issueDescription,image)=>{

    if(!washerId || !orderId || !itemName || !issueDescription || !image){
        throw new Error("information missing");
    }

    const catalogId = await catalogService.getCatalogIdByName(itemName);

    if(!catalogId){
        throw new Error("invalid item name");
    };

    const order = await Order.findOne({
        where : {
            id : orderId
        }
    });

    if(!order){
        throw new Error("Invalid orderId");
    }

    await Defect.create({
        washerId,
        orderId,
        itemId : catalogId,
        issueDescription,
        image
    });

    await Orderstatus.create({
        orderId,
        userId:order.userId,
        status:'ISSUE'
    });

    return "defect added and order status updated to issue";
};

const updateDefectStatus=async(orderId,defectId,decision)=>{

    if(!orderId || !defectId || !decision){
        throw new error("information missing");
    }

    if(typeof defectId !== "number"){
        throw new Error("Incorrect type");
    }

    if(typeof orderId !== "number"){
        throw new Error("Incorrect type");
    }

    const defect = await Defect.findOne({
        where:{
            id:defectId,
            orderId : orderId
        }
    });

    if(!defect){
        throw new Error("incorrect inputs");
    }

    await Defect.update({
            decision : decision
        },{
            where:{
                id : defectId,
                orderId : orderId
            }
    });

    return "status updated";
}

const fetchPreviousApprovals = async(studentId,protocol,host)=>{

    if(!studentId){
        throw new Error("studentId required");
    }

    if(typeof studentId !== "number"){
        throw new Error("incorrect type");
    }

    const defects = await Defect.findAll({
        where:{
            decision : 'APPROVED'
        },
        include:[{
            model : Order
        },{
            model:Catalog,
            attributes:['name']
        },{
            model : User,
            where:{
                studentId:studentId
            }
        }],
        order: [['createdAt','DESC']]
    });

    if(!defects){
        throw new Error("no defects found");
    }

    if(!protocol || !host){
        throw new Error("protocol or host missing");
    }

    const baseUrl = `${protocol}://${host}/uploads/`;

    const defectsMapped = defects.map(defect=>{
        return {
            defectId : defect.id,
            washerId : defect.washerId,
            orderId : defect.orderId,
            itemId : defect.itemId,
            itemName : defect.Catalog.name,
            userId : defect.Order.userId,
            studentId : defect.User.studentId,
            issueDescription : defect.issueDescription,
            image : baseUrl + defect.image
        }
    })

    return defectsMapped;
}

const defectedItems = async({organizationId,organizationType}={})=>{

    let whereClause = {};

    if(organizationId && organizationType){
        whereClause={
            organizationId,
            organizationType
        }
    }

    const list = await Defect.findAll({
        include:[{
            model : Order,
            attributes:['userId'],
            where:whereClause
        },{
            model : Washer,
            attributes:['name']
        }]
    })

    const groupedDefects = {};

    list.forEach(defect => {

        const orderId = defect.orderId;

        if (!groupedDefects[orderId]) {

            groupedDefects[orderId] = {
                defectId:defect.id,
                washerId: defect.washerId,
                washerName: defect.Washer.name,
                orderId: defect.orderId,
                userId: defect.Order.userId,
                totalDefectedQuantity: 0
            };
        }

        groupedDefects[orderId].totalDefectedQuantity += 1;
    });

    return Object.values(groupedDefects);
}

const viewDefectDetails=async(orderId,protocol,host)=>{

    if(!orderId){  
        throw new Error("order id required");
    }

    const list = await Defect.findAll({
        where : {
            orderId : orderId
        },
        include:[{
            model : Catalog,
            attributes:['name']
        },{
            model : Washer,
            attributes:['name']
        },{
            model : Order,
            attributes:['userId']
        }]
    });

    const baseUrl = `${protocol}://${host}/uploads/`;

    const formattedList = list.map(defect=>{
        const onlyDate = defect.createdAt.toLocaleDateString('en-GB',{
                day : '2-digit',
                month : 'short',
                year : 'numeric'
            });

            const onlyTime = defect.createdAt.toLocaleTimeString('en-US',{
                hour:'2-digit',
                minute:'2-digit',
                hour12:true
            });
        return {
            washerName : defect.Washer.name,
            washerId : defect.washerId,
            userId : defect.Order.userId,
            itemName : defect.Catalog.name,
            status : defect.decision,
            issueDescription : defect.issueDescription,
            image : baseUrl + defect.image,
            date : onlyDate,
            time : onlyTime
        }
    })

    return formattedList;
}

module.exports={
    addDefects,
    updateDefectStatus,
    fetchPreviousApprovals,
    defectedItems,
    viewDefectDetails
}