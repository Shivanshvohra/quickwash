const { Op, where, literal, col } = require('sequelize');
const { Order, OrderItem, Cart, Catalog, Defect, Orderstatus, Washermapper, User, Payment, sequelize, Organization, SubAdmin} = require('../models');
const Sequelize = require("../config/sequelize");
const generateAndSaveReceipt = require('../config/generateReceipt');
const { buildReceiptPayload } = require('../config/buildReceiptPayload');
const userService = require('../services/user.service');
const catalogService = require('../services/catalog.service');

const checkout = async (userId, serviceType, paymentMethod, t) => {

    const user = await Cart.findOne({
        where:{userId,serviceType}
    });

    if(!user){
        throw new Error("cart not found");
    }

    const userr = await User.findByPk(userId,{ transaction: t });

    if (!userr.organizationId || userr.organizationType!=='UNIVERSITY') {
        throw new Error("User not linked to any university");
    }

    const universityId = userr.organizationId;
    const organizationType = userr.organizationType

    const washer = await Washermapper.findOne({
        where:{
            organizationId : universityId,
            organizationType : organizationType
        },
        transaction : t
    });

    if(!washer){
        throw new Error('no washer found');
    }

    const washerId = washer.washerId;

    if(![
            'laundry',
            'paidLaundry',
            'drycleaning',
            'ironing'
        ].includes(serviceType)){
        throw new Error("Invalid service type");
    }

    const cartItems = await Cart.findAll({
        where: { 
            userId,
            serviceType
        },
        include: [{
            model: Catalog,
            attributes: ['id', 'price','name']
        }],
        transaction: t
    });

    if (!cartItems.length) {
        throw new Error("Cart is empty");
    }

    let totalAmount = 0;

    let totalFreeLaundryLimit = 0 ;

    if(serviceType==='laundry'){
        cartItems.forEach(item=>{
            totalFreeLaundryLimit+=item.quantity;
        })
    }

    const remainingLimit = await userService.getRemainingLimit(userId);

    if(serviceType==='laundry' && (remainingLimit<totalFreeLaundryLimit)){
        throw new Error('laundry limit exceeded')
    }
    
    const order = await Order.create({
        userId,
        serviceType,
        totalAmount: 0,
        washerId : washerId,
        organizationId : universityId,
        organizationType : organizationType
    },{transaction: t});

    const itemsSummary = [];


    for (const item of cartItems) {

        let price = 0;

        if(serviceType!=='laundry'){
            price = item.Catalog.price || 0;
        }

        const itemTotal = price * item.quantity;

        totalAmount += itemTotal;

        await OrderItem.create({
            orderId: order.id,
            productId: item.productId,
            categoryId: item.categoryId,
            quantity: item.quantity,
            priceAtTime: price
        },{transaction: t});

        itemsSummary.push({
            productId : item.productId,
            productName : item.Catalog.name,
            quantity : item.quantity,
            price : price,
            itemTotal : itemTotal
        });
    }

    await order.update({ totalAmount },{transaction: t});

    if(serviceType==="laundry"){
        await Payment.create({
            orderId : order.id,
            paymentMethod : 'N/A',
            status : 'SUCCESS'
        },{
            transaction : t
        });
    }else{
        if(!['ONLINE','COD'].includes(paymentMethod)){
            throw new Error('incorrect payment method');
        }

        if(paymentMethod==='COD'){
            await Payment.create({
                orderId : order.id,
                paymentMethod : 'COD',
                status : 'PENDING'
            },{
                transaction:t
            });
        }else{
            await Payment.create({
                orderId : order.id,
                paymentMethod : 'ONLINE',
                status : 'PENDING'
            },{
                transaction:t
            });
        }
    }

    return {
        orderId : order.id,
        totalAmount : totalAmount,
        items : itemsSummary
    };
};

const updatePaymentStatusAndGenerateReceipt=async(orderId,paymentMethod,paymentStatus)=>{

    if(!orderId){
        throw new Error("order id needed");
    }

    if(!['PENDING','SUCCESS','FAILED'].includes(paymentStatus)){
        throw new Error("incorrect payment status");
    }

    const order = await Order.findByPk(orderId);

    if(!order){
        throw new Error('incorrect order id');
    }

    const payment = await Payment.findOne({
        where:{ orderId },
        order:[['createdAt','DESC']]
    });

    await payment.update({
        paymentMethod : paymentMethod,
        status : paymentStatus
    });

    if (
        paymentStatus === "SUCCESS" 
    ) {
        const payload = await buildReceiptPayload(order);
        await generateAndSaveReceipt(payload);
    }

    return order;
}




const clearCart = async (userId,serviceType) => {

    await Cart.destroy({
        where: { 
            userId,
            serviceType
        }
    });

    return;
};

const getTransactionHistory=async(userId,filter)=>{

    let whereClause = {userId};

    const parsedFilter = Number(filter);

    if(filter!="null" && filter!=null && ![7,15,30].includes(parsedFilter)){
        throw new Error('invalid filter');
    }

    let allowedDate;
    if([7,15,30].includes(parsedFilter)){
        allowedDate = new Date();
        allowedDate.setDate(allowedDate.getDate()-parsedFilter);
        whereClause.createdAt={
            [Op.gte]:allowedDate
        };
    }

    const orders = await Order.findAll({
    where: whereClause,
    attributes: {
        include: [
        [
            Sequelize.literal(`(
            SELECT status
            FROM orderstatus os
            WHERE os.orderId = Order.id
            ORDER BY os.createdAt DESC
            LIMIT 1
            )`),
            'latestStatus'
        ]
        ]
    },
    include: [{
        model: OrderItem,
        attributes: ['quantity']
    },{
        model : Payment,
        attributes :['paymentMethod'],
        required:true,
        where : {
            [Op.not]: [
                    {
                        paymentMethod: 'ONLINE',
                        status: 'FAILED'
                    }
                ]
        }
    }],
    order: [['createdAt', 'DESC']]
    });

    return orders.map(order=>{

        const totalQuantity=order.OrderItems.reduce(
            (sum,item)=>sum+item.quantity,
            0
        );

        const date = new Date(order.createdAt);

        const onlyDate= date.toLocaleDateString('en-GB',{
            day:'2-digit',
            month:'short',
            year:'numeric'
        });

        const onlyTime= date.toLocaleTimeString('en-US',{
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });

        

        return {
            orderId: order.id,
            date: onlyDate,
            time: onlyTime,
            totalQuantity: totalQuantity,
            status : order.get('latestStatus'),
            serviceType:order.serviceType,
            paymentMethod:(order.Payment.paymentMethod==='N/A')?"Prepaid":order.Payment.paymentMethod,
            totalAmount:(order.totalAmount!==0)?order.totalAmount:'N/A'
        };

    });

};

const getOrderDetails=async(userId,orderId,protocol,host)=>{

    if(!userId || !orderId){
        throw new Error("userId and orderId required");
    }

    if(typeof orderId !=="number"){
        throw new Error("Incorrect type");
    }

    if(typeof userId !=="number"){
        throw new Error("Incorrect type");
    }

    const order = await Order.findOne({
        where:{
            userId : userId,
            id : orderId
        }
    });

    if(!order){
        throw new Error("no order");
    }

    const orderWithStatus = await Orderstatus.findAll({
        where:{
            userId : userId,
            orderId : orderId
        },
        order:[['createdAt','DESC']]
    });

    const currentStepStatus = orderWithStatus[0].status;
    let currentStepNumber;
    if(currentStepStatus==='INITIATED' || currentStepStatus==='DENIED'){
        currentStepNumber=1;
    }else if(currentStepStatus==='SUBMITTED'){
        currentStepNumber=2;
    }else if(currentStepStatus==='ISSUE'){
        currentStepNumber=3;
    }else{
        currentStepNumber=4;
    }

    const date = new Date(order.createdAt);

    const onlyDate = date.toLocaleDateString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric'
    });

    const onlyTime = date.toLocaleTimeString('en-US',{
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    });

    let pickedAt = null;
    let completedAt = null;

    for(const s of orderWithStatus){

        if(s.status==='PICKED'){
            pickedAt=new Date(s.createdAt);
        }

        if(s.status==='COMPLETED'){
            completedAt=new Date(s.createdAt);
        }

    }

    const pickedOnlyDate = pickedAt?pickedAt.toLocaleDateString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric'
    }):"NA";

    const pickedOnlyTime = pickedAt?pickedAt.toLocaleTimeString('en-US',{
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    }):"NA";

    const completedOnlyDate = completedAt?completedAt.toLocaleDateString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric'
    }):"NA";

    const completedOnlyTime = completedAt?completedAt.toLocaleTimeString('en-US',{
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    }):"NA";

    const count = await OrderItem.sum('quantity',{
        where:{
            orderId : orderId
        }
    });

    const items=await OrderItem.findAll({
        where:{
            orderId : orderId
        },
        include:[{
            model:Catalog,
            attributes:['name','image']
        }]
    });

    if(!count || !items){
        throw new Error("no items");
    }


    const defectedList = await Defect.findAll({
        where:{
            orderId:orderId,
            decision:'PENDING'
        },
        include:{
            model : Catalog,
            attributes : ['name']
        }
    });

    const defectedProductIds = new Set(
        defectedList.map(defect => defect.itemId)
    );

    const rawBaseUrl = `${protocol}://${host}`;
    const formattedBaseUrl = rawBaseUrl + '/uploads/';

    const formattedDefectedList = defectedList.map(item=>{
        return {
            defect_id:item.id,
            productId:item.itemId,
            issueDescription: item.Catalog.name + ": " + item.issueDescription,
            itemImage:formattedBaseUrl + item.image,
            decision:item.decision
        };
    });

    const grouped = new Map();

    for(const item of items){

        const key = item.productId;

        if(!grouped.has(key)){

            grouped.set(key,{
                productId: item.productId,
                name : item.Catalog.name,
                image : formattedBaseUrl + item.Catalog.image,
                quantity : 0,
                defectedStatus : defectedProductIds.has(item.productId)
            })
        }

        const existing = grouped.get(key);

        existing.quantity +=item.quantity

    }

    const formattedItems = Array.from(grouped.values()).map(item=>{
        return {
            productId : item.productId,
            name : item.name,
            image : item.image,
            quantity : item.quantity,
            defectedStatus : defectedProductIds.has(item.productId)
        }
    });

    const length = formattedDefectedList.length;
    let status = null;
    if(length==0){
        status=false;
    }else{
        status=true;
    }

    return {
        orderStatus : {
            currentStep : currentStepNumber
        },
        details:{
            date : onlyDate,
            time : onlyTime,
            orderId : orderId,
            totalQuantity : count
        },
        clothes: formattedItems,
        defectedClothes:{
            status:status,
            data:formattedDefectedList
        },
        statusTimeline:{
            pickedUpDate : pickedOnlyDate,
            pickedUpTime : pickedOnlyTime,
            completedDate : completedOnlyDate,
            completedTime : completedOnlyTime
        },
        receipt_url : formattedBaseUrl + order.receipt_url
    };

};

const orderConfirmation=async(orderId)=>{

    if(!orderId){
        throw new Error("order id required");
    }

    const data = await Order.findOne({
        where : {
            id : orderId
        },
        include:[{
            model : Payment,
            attributes : ['status','paymentMethod']
        }]
    });

    const onlyDate = data.createdAt.toLocaleDateString('en-GB',{
        day : '2-digit',
        month : 'short',
        year : 'numeric'
    });

    const formattedData = {
        orderId : orderId,
        date : onlyDate,
        paymentStatus : data.Payments[0].status,
        paymentMethod : data.Payments[0].paymentMethod
    }

    return formattedData;
}

const getAllOrders=async({organizationId,organizationType}={})=>{
    let whereClause = {};

    if (organizationId && organizationType) {
        console.log("called from subadmin");
        whereClause = {
            [Op.and]: [
                where(col('Order.organizationId'), organizationId),
                where(col('Order.organizationType'), organizationType)
            ]
        };
    }


    console.log("reached");
    const orders = await Order.findAll({
        where : whereClause,
        include : [{
            model : User,
            attributes : ['name','laundryNumber']
        },{
            model : OrderItem,
            attributes : ['quantity']
        },{
            model : Orderstatus,
            attributes : ['status'],
            order : [['createdAt','DESC']],
            limit : 1
        },{
            model : Payment,
            attributes : ['status']
        }],
        order : [['createdAt','DESC']]
    })

    console.log("reached");
    const formattedOrders = orders.map(order=>{
        const quantity = order.OrderItems.reduce((total,item)=>total + item.quantity,0) || 0;

        const date = new Date(order.createdAt);

        const onlyDate = date.toLocaleDateString('en-GB',{
            day:'2-digit',
            month:'short',
            year:'numeric'
        });

        const onlyTime = date.toLocaleTimeString('en-US',{
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });

        return {
            orderId : order.id,
            userName : order.User.name,
            laundryNumber : order.User.laundryNumber,
            count : quantity,
            paymentStatus : order.Payment? order.Payment.status : null,
            orderStatus : order.Orderstatuses?.[0]?.status || null,
            date : onlyDate,
            time : onlyTime,
            service : order.serviceType
        }

    })

    console.log("reached");
    return formattedOrders;
}


const getOrderDetailsAdmin = async({orderId,id}={})=>{


    if(!orderId){
        throw new Error("orderId required");
    }

    if(typeof orderId !== "number"){
        throw new Error("incorrect type");
    }

    let whereClause = {};

    if(id){
        const subadmin = await SubAdmin.findOne({
            where : {
                id : id
            }
        })

        if (!subadmin) {
            throw new Error("SubAdmin not found");
        }

        const order = await Order.findOne({where:{
            id : orderId
        }})

        if (!order) {
            throw new Error("Order not found");
        }

        if((order.organizationId!=subadmin.organizationId)||(order.organizationType!=subadmin.organizationType)){
            throw new Error("order does not belong to selected org");
        }

        whereClause = {
            id : orderId,
            organizationId : subadmin.organizationId,
            organizationType : subadmin.organizationType
        }
    }else{
        whereClause = {
            id : orderId
        }
    }

    const order = await Order.findOne({
        where:whereClause,
        attributes: {
            include: [
            [
                sequelize.literal(`(
                SELECT status
                FROM orderstatus os
                WHERE os.orderId = Order.id
                ORDER BY os.createdAt DESC
                LIMIT 1
                )`),
                'latestStatus'
            ]
            ]
        },
        include:[{
            model : OrderItem,
            attributes : ['quantity']
        },{
            model : User,
            attributes : ['name','mobileNumber','laundryNumber','organizationId']
        },{
            model:Payment,
            attributes:['transactionToken','status','paymentMethod'],
            separate: true,
            order:[['createdAt','DESC']]
        }]
    })

    if(!order){
        throw new Error("Invalid orderId");
    }

    const payment = order.Payments?.[0];


    const university = await Organization.findOne({
        where:{
            id : order.User.organizationId,
            type : 'UNIVERSITY'
        }
    })

    const universityName = university.name;

    const items = await OrderItem.findAll({
        where:{
            orderId : orderId
        },
        include:[{
            model : Catalog,
            attributes : ['name']
        }]
    });

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    const formattedItems = items.map(item=>{
        return {
            productName : item.Catalog.name,
            quantity : item.quantity
        }
    })

    const defects = await Defect.findAll({
        where:{
            orderId : orderId
        },
        include:[{
            model:Catalog,
            attributes:['name']
        }]
    });

    const defectMap = {};

    defects.forEach(defect => {
        const productId = defect.itemId

        if(!defectMap[productId]){
            defectMap[productId]={
                productId : productId,
                productName : defect.Catalog.name,
                issues : []
            }
        }

        defectMap[productId].issues.push(defect.issueDescription);
    });

    const defectedItems = Object.values(defectMap);

    const finalDefectedItems = defectedItems.length > 0 ? defectedItems : null;

    const date = new Date(order.createdAt);

    const onlyDate = date.toLocaleDateString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric'
    });

    const onlyTime = date.toLocaleTimeString('en-US',{
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    });

    const orderWithStatus = await Orderstatus.findAll({
        where : {
            orderId : orderId
        }
    });

    let submittedAt;
    let completedAt;
    let pickedAt;
    for(const s of orderWithStatus){
        if(s.status==='SUBMITTED'){
            submittedAt=new Date(s.createdAt);
        }
        if(s.status==='COMPLETED'){
            completedAt=new Date(s.createdAt);
        }
        if(s.status==='PICKED'){
            pickedAt=new Date(s.createdAt);
        }
    }

    const submittedAtTime = submittedAt?submittedAt.toLocaleDateString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric'
    }): null;

    const pickedAtTime = pickedAt?pickedAt.toLocaleDateString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric'
    }): null;

    const completedAtTime = completedAt?completedAt.toLocaleDateString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric'
    }): null;

    return {
        orderSummary:{
            orderId : order.id,
            date : onlyDate,
            time : onlyTime,
            status : order.get('latestStatus'),
            count : totalQuantity
        },
        userInformation:{
            name : order.User.name,
            mobileNumber : order.User.mobileNumber,
            universityName : universityName,
            laundryNumber : order.User.laundryNumber,
        },
        clothesList:formattedItems,
        defectedItems:finalDefectedItems,
        paymentDetails:{
            method : payment?.paymentMethod || null,
            amount : order.totalAmount,
            paymentStatus : payment?.status || null,
            transactionToken : payment?.transactionToken || null
        },
        timelineSection:{
            orderPlaced : submittedAtTime,
            orderPicked : pickedAtTime,
            orderCompleted : completedAtTime
        }
    }
}

const deleteUser = async(userId)=>{

    if(!userId){
        throw new Error("userId required");
    }

    if(typeof userId !== "number"){
        throw new Error("incorrect type");
    }

    const user = await User.findOne({
        where : {
            id : userId,
            status : 'enable'
        }
    });

    if(!user){
        throw new Error('Incorrect userId');
    }

    await user.update({
        status : 'disable'
    });

    return "User deleted successfully"
}

const enableUser = async(userId)=>{

    if(!userId){
        throw new Error("userId required");
    }

    if(typeof userId !== "number"){
        throw new Error("incorrect type");
    }

    const user = await User.findOne({
        where : {
            id : userId,
            status : 'disable'
        }
    });

    if(!user){
        throw new Error('Incorrect userId');
    }

    await user.update({
        status : 'enable'
    });

    return "User restored successfully"
}

const getDashboardMetric = async({organizationId,organizationType}={})=>{

    const whereCondition = {};

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    whereCondition.createdAt = {
        [Op.between] : [startOfDay, endOfDay]
    }

    if(organizationId && organizationType){
        whereCondition.organizationId = organizationId,
        whereCondition.organizationType = organizationType
    }

    const result = await Order.findAll({
        where : whereCondition,
        attributes : [
            [sequelize.literal('COUNT(DISTINCT `Order`.`id`)'),'totalOrders'],
            [
                sequelize.literal(`
                    COUNT(DISTINCT CASE 
                    WHEN \`Orderstatuses\`.\`status\` = 'COMPLETED'
                    THEN \`Order\`.\`id\`
                    END)
                `),
                'completedOrders'
            ],
            [
                sequelize.literal(`
                    COUNT(DISTINCT CASE 
                    WHEN \`Defects\`.\`decision\` = 'PENDING'
                    THEN \`Order\`.\`id\`
                    END)
                `),
                'pendingApprovalOrders'
            ]
        ],
        include:[{
            model : Orderstatus,
            attributes : [],
            required : false
        },{
            model : Defect,
            attributes : [],
            required : false
        }],
        raw : true
    });

    return result;
  
};

const submittedOrders=async({organizationId,organizationType,protocol,host}={})=>{

    let whereClause = {};
    if(organizationId && organizationType){
        whereClause = {
            organizationId : organizationId,
            organizationType : organizationType
        }
    }

    const orders = await Order.findAll({
        where : whereClause,
        include : [{
            model : User,
            attributes : ['name','laundryNumber']
        },{
            model : OrderItem,
            attributes : ['quantity']
        },{
            model : Orderstatus,
            attributes : ['status','createdAt'],
            order: [['createdAt','DESC']],
            required:true
        },{
            model : Payment,
            attributes : ['status']
        }],
        order : [['createdAt','DESC']]
    })

    if(orders.length==0){
        throw new Error('all order are in processing');
    }

    const baseUrl = `${protocol}://${host}/uploads/`;

    const formattedOrders = orders.map(order=>{

        const quantity = order.OrderItems.reduce((total,item)=>total + item.quantity,0) || 0;

        const date = new Date(order.createdAt);

        const onlyDate = date.toLocaleDateString('en-GB',{
            day:'2-digit',
            month:'short',
            year:'numeric'
        });

        const onlyTime = date.toLocaleTimeString('en-US',{
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });

        return {
            orderId : order.id,
            userName : order.User.name,
            laundryNumber : order.User.laundryNumber,
            count : quantity,
            service : order.serviceType,
            paymentStatus : order.Payment?order.Payment.status:null,
            orderStatus:
                order.Orderstatuses
                ?.sort(
                (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
                )?.[0]?.status || null,
            date : onlyDate,
            time : onlyTime,
            receipt_url:order.receipt_url? baseUrl+order.receipt_url:null
        }

    })

    return formattedOrders;
}

const getItemsInOrder=async(orderId)=>{

    const items = await OrderItem.findAll({
        where:{
            orderId:orderId
        },
        attributes: ['productId'],
        include:[{
            model : Catalog,
            attributes : ['name']
        }],
        group:['productId']
    })

    if(!items.length){
        throw new Error("no items in this order");
    }

    const formattedItems = items.map(item=>{
        return {
            name : item.Catalog.name,
            id: item.productId
        }
    });
    
    return formattedItems;
}



const updateOrder = async (userId, orderId, items) => {

    const t = await sequelize.transaction();

    try {

        if (!userId) {
            throw new Error('user id required');
        }

        const userCheck = await User.findByPk(userId, {
            transaction: t
        });

        if (!userCheck) {
            throw new Error('invalid user id');
        }

        if (!orderId) {
            throw new Error('order id required');
        }

        const orderCheck = await Order.findOne({
            where: {
                id: orderId,
                userId
            },
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT status
                            FROM orderstatus os
                            WHERE os.orderId = Order.id
                            ORDER BY os.createdAt DESC
                            LIMIT 1
                        )`),
                        'latestStatus'
                    ]
                ]
            },
            include: [{
                model: Payment,
                attributes: ['paymentMethod']
            }, {
                model: Orderstatus,
                attributes: []
            }],
            transaction: t
        });

        if (!orderCheck) {
            throw new Error('invalid order id');
        }

        if (orderCheck.get('latestStatus') !== 'INITIATED') {
            throw new Error(
                'orders can only be modified at initiated stage'
            );
        }

        if (orderCheck.paymentMethod === 'ONLINE') {
            throw new Error(
                'online orders can not be modified'
            );
        }

        if (!items || !items.length) {
            throw new Error('items required');
        }

        const serviceType = orderCheck.serviceType;

        const upsertItems = [];
        const deleteConditions = [];

        const catOneValid =
            await catalogService.getCatalogIdsbyCategory('MEN');

        const catTwoValid =
            await catalogService.getCatalogIdsbyCategory('WOMEN');

        // previous laundry quantity
        let previousLaundryItems = 0;

        if (serviceType === 'laundry') {

            previousLaundryItems =
                await OrderItem.sum('quantity', {
                    where: { orderId },
                    transaction: t
                }) || 0;
        }

        for (const item of items) {

            const {
                productId,
                categoryId,
                quantity
            } = item;

            if (!productId) {
                throw new Error('product id required');
            }

            if (quantity == null || quantity < 0) {
                throw new Error('invalid quantity');
            }

            // category validations
            if (
                serviceType !== 'laundry' &&
                serviceType !== 'paidLaundry' &&
                categoryId != null
            ) {
                throw new Error('categoryId not allowed');
            }

            if (
                (serviceType === 'laundry' ||
                serviceType === 'paidLaundry') &&
                categoryId == null
            ) {
                throw new Error('categoryId required');
            }

            if (
                (serviceType === 'laundry' ||
                serviceType === 'paidLaundry') &&
                categoryId != 1 &&
                categoryId != 2
            ) {
                throw new Error('incorrect category id');
            }

            // product validation
            const product = await Catalog.findByPk(productId, {
                transaction: t
            });

            if (!product) {
                throw new Error(
                    `invalid product id ${productId}`
                );
            }

            // service type validation
            if (
                serviceType === 'laundry' ||
                serviceType === 'paidLaundry'
            ) {

                if (product.serviceType !== 'laundry') {
                    throw new Error(
                        'invalid product for this service type'
                    );
                }

            } else {

                if (product.serviceType !== serviceType) {
                    throw new Error(
                        'invalid product for this service type'
                    );
                }
            }

            // category validation
            if (
                serviceType === 'laundry' ||
                serviceType === 'paidLaundry'
            ) {

                if (categoryId == 1) {

                    if (!catOneValid.includes(productId)) {
                        throw new Error('invalid category id');
                    }

                } else {

                    if (!catTwoValid.includes(productId)) {
                        throw new Error('invalid category id');
                    }
                }
            }

            // DELETE
            if (quantity === 0) {

                if (
                    serviceType !== 'laundry' &&
                    serviceType !== 'paidLaundry'
                ) {

                    const existing =
                        await OrderItem.findOne({
                            where: {
                                orderId,
                                productId,
                                categoryId: null
                            },
                            transaction: t
                        });

                    if (existing) {
                        await existing.destroy({
                            transaction: t
                        });
                    }

                } else {

                    deleteConditions.push({
                        productId,
                        categoryId
                    });
                }

            } else {

                // UPSERT
                if (
                    serviceType !== 'laundry' &&
                    serviceType !== 'paidLaundry'
                ) {

                    const existing =
                        await OrderItem.findOne({
                            where: {
                                orderId,
                                productId,
                                categoryId: null
                            },
                            transaction: t
                        });

                    if (existing) {

                        await existing.update({
                            quantity
                        }, {
                            transaction: t
                        });

                    } else {

                        upsertItems.push({
                            orderId,
                            productId,
                            categoryId: null,
                            quantity,
                            priceAtTime: product.price || 0
                        });
                    }

                } else {

                    upsertItems.push({
                        orderId,
                        productId,
                        categoryId,
                        quantity,
                        priceAtTime:
                            serviceType === 'laundry'
                                ? 0
                                : product.price || 0
                    });
                }
            }
        }

        // bulk upsert
        if (upsertItems.length) {

            await OrderItem.bulkCreate(
                upsertItems,
                {
                    updateOnDuplicate: [
                        'quantity',
                        'priceAtTime'
                    ],
                    transaction: t
                }
            );
        }

        // bulk delete
        if (deleteConditions.length) {

            await OrderItem.destroy({
                where: {
                    orderId,
                    [Op.or]: deleteConditions.map(item => ({
                        productId: item.productId,
                        categoryId: item.categoryId
                    }))
                },
                transaction: t
            });
        }

        // updated order items
        const updatedOrderItems =
            await OrderItem.findAll({
                where: {
                    orderId
                },
                include: [{
                    model: Catalog,
                    attributes: ['price']
                }],
                transaction: t
            });

        if (!updatedOrderItems.length) {
            throw new Error(
                'order must contain atleast one item'
            );
        }

        // laundry limit validation
        if (serviceType === 'laundry') {

            let totalLaundryItems = 0;

            updatedOrderItems.forEach(item => {
                totalLaundryItems += item.quantity;
            });

            const remainingLimit =
                await userService.getRemainingLimit(userId);

            const actualRemaining =
                remainingLimit + previousLaundryItems;

            if (totalLaundryItems > actualRemaining) {
                throw new Error('laundry limit exceeded');
            }
        }

        // total amount calculation
        let totalAmount = 0;

        for (const item of updatedOrderItems) {

            let itemPrice = 0;

            if (serviceType !== 'laundry') {
                itemPrice = item.Catalog.price || 0;
            }

            totalAmount +=
                itemPrice * item.quantity;

            await item.update({
                priceAtTime: itemPrice
            }, {
                transaction: t
            });
        }

        // update order amount
        await orderCheck.update({
            totalAmount
        }, {
            transaction: t
        });

        // update payment
        if (serviceType !== 'laundry') {

            const payment = await Payment.findOne({
                where: { orderId },
                transaction: t
            });

            if (
                payment &&
                payment.paymentMethod === 'COD'
            ) {

                await payment.update({
                    amount: totalAmount
                }, {
                    transaction: t
                });
            }
        }

        await t.commit();

        return 'order updated successfully';

    } catch (error) {

        await t.rollback();
        throw error;
    }
};


const updateOrderCatalog = async (userId, orderId) => {

    if (!userId || !orderId) {
        throw new Error('incorrect data');
    }

    const orderCheck = await Order.findOne({
        where: {
            id: orderId,
            userId
        },
        attributes: {
            include: [
                [
                    Sequelize.literal(`(
                        SELECT status
                        FROM orderstatus os
                        WHERE os.orderId = Order.id
                        ORDER BY os.createdAt DESC
                        LIMIT 1
                    )`),
                    'latestStatus'
                ]
            ]
        },
        include: [{
            model: Payment,
            attributes: ['paymentMethod']
        }, {
            model: Orderstatus,
            attributes: []
        }]
    });

    if (!orderCheck) {
        throw new Error('invalid order id');
    }

    if (orderCheck.get('latestStatus') !== 'INITIATED') {
        throw new Error(
            'orders can only be modified at initiated stage'
        );
    }

    if (
        orderCheck.Payment &&
        orderCheck.Payment.paymentMethod === 'ONLINE'
    ) {
        throw new Error(
            'online orders can not be modified'
        );
    }

    // existing order items
    const items = await OrderItem.findAll({
        where: {
            orderId
        }
    });

    // catalog fetch
    const catalog = await Catalog.findAll({
        where: {
            serviceType: (
                orderCheck.serviceType === 'paidLaundry'
                    ? 'laundry'
                    : orderCheck.serviceType
            ),
            status: 'active'
        },
        attributes: [
            'id',
            'name',
            'price',
            'image',
            'productType',
            'serviceType'
        ]
    });

    // quantity map
    const quantityMap = {};

    items.forEach(item => {

        const key =
            `${item.productId}_${item.categoryId}`;

        quantityMap[key] = item.quantity;
    });

    // flattened catalog
    const flattenedCatalog = [];

    for (const product of catalog) {

        // laundry / paidLaundry
        if (
            orderCheck.serviceType === 'laundry' ||
            orderCheck.serviceType === 'paidLaundry'
        ) {

            // MEN + UNISEX -> MEN ROW
            if (
                product.productType === 'MEN' ||
                product.productType === 'UNISEX'
            ) {

                const key = `${product.id}_1`;

                flattenedCatalog.push({
                    productId: product.id,
                    categoryId: 1,
                    name: product.name,
                    image: product.image,
                    price: (
                        orderCheck.serviceType === 'laundry'
                            ? 0
                            : product.price
                    ),
                    quantity: quantityMap[key] || 0
                });
            }

            // WOMEN + UNISEX -> WOMEN ROW
            if (
                product.productType === 'WOMEN' ||
                product.productType === 'UNISEX'
            ) {

                const key = `${product.id}_2`;

                flattenedCatalog.push({
                    productId: product.id,
                    categoryId: 2,
                    name: product.name,
                    image: product.image,
                    price: (
                        orderCheck.serviceType === 'laundry'
                            ? 0
                            : product.price
                    ),
                    quantity: quantityMap[key] || 0
                });
            }

        } else {

            // drycleaning / ironing
            const key = `${product.id}_null`;

            flattenedCatalog.push({
                productId: product.id,
                categoryId: null,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: quantityMap[key] || 0
            });
        }
    }

    // totals
    let totalItems = 0;
    let totalAmount = 0;

    flattenedCatalog.forEach(item => {

        totalItems += item.quantity;

        totalAmount += (
            item.quantity * item.price
        );
    });

    // editable limit for frontend validation
    let editableLimit = null;

    if (orderCheck.serviceType === 'laundry') {

        const remainingLimit =
            await userService.getRemainingLimit(userId);

        editableLimit =
            remainingLimit + totalItems;
    }

    return {
        orderId: orderCheck.id,
        serviceType: orderCheck.serviceType,
        totalItems,
        totalAmount,
        remainingLimit:editableLimit,
        catalog: flattenedCatalog
    };
};

module.exports = {
    checkout,
    updatePaymentStatusAndGenerateReceipt,
    clearCart,
    getTransactionHistory,
    getOrderDetails,
    orderConfirmation,
    getAllOrders,
    getOrderDetailsAdmin,
    deleteUser,
    getDashboardMetric,
    submittedOrders,
    getItemsInOrder,
    enableUser,
    updateOrder,
    updateOrderCatalog
};