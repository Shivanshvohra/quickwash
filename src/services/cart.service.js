const { Op } = require('sequelize');

const Catalog = require('../models').Catalog;
const User = require('../models').User;
const Cart = require('../models').Cart;
const catalogService = require('../services/catalog.service');
const userService = require('../services/user.service');

const addToCart=async(userId,productId)=>{

    if(!userId || !productId){
        throw new Error("userId and productId required");
    }

    if(typeof productId !=="number"){
        throw new Error("Incorrect type");
    }

    if(typeof userId !=="number"){
        throw new Error("Incorrect type");
    }

    const product = await Catalog.findByPk(productId);

    if(!product){
        throw new Error("Invalid productId");
    }

    let existingItem = await Cart.findOne({
        where:{
            userId,
            productId
        }
    });

    if(!existingItem){
        existingItem = await Cart.create({
            userId,
            productId
        })
    }

    existingItem.quantity+=1;
    await existingItem.save();

    return "Items added";

};

const deleteFromCart=async(userId,productId)=>{

    if(!userId || !productId){
        throw new Error("userId and productId required");
    }

    if(typeof productId !=="number"){
        throw new Error("Incorrect type");
    }

    if(typeof userId !=="number"){
        throw new Error("Incorrect type");
    }

    const item = await Cart.findAll({
        where:{
            userId,
            productId
        }
    });

    if(item.length === 0){
        throw new Error("userId/productId invalid");
    }

    await Cart.destroy({
        where:{
            userId,
            productId
        }
    });

    return "Item deleted Succesfully";
};

const reduceFromCart=async(userId,productId)=>{

    if(!userId || !productId){
        throw new Error("userId/productId missing");
    }

    if(typeof productId !=="number"){
        throw new Error("Incorrect type");
    }

    if(typeof userId !=="number"){
        throw new Error("Incorrect type");
    }

    const existingItem = await Cart.findOne({
        where:{
            userId,
            productId
        }
    });

    if(!existingItem){
        throw new Error("incorrect userId/productId");
    }

    if(existingItem.quantity>1){
        existingItem.quantity-=1;
        await existingItem.save();
        return;
    }else if(existingItem.quantity==1){
        await Cart.destroy({
            where:{
                userId,
                productId
            }
        });
        return;
    }else{
        throw new Error("Incorrect quantity");
    }

};

const viewCart = async (userId, serviceType, protocol, host) => {

    if (!userId) throw new Error("userId required");
    if (typeof userId !== "number") throw new Error("Incorrect type");

    if (!['laundry','paidLaundry', 'drycleaning','ironing'].includes(serviceType)) {
        throw new Error("incorrect service type");
    }

    const cart = await Cart.findAll({
        where: { userId, serviceType },
        include: [{
            model: Catalog,
            attributes: ['name', 'price', 'image']
        }]
    });

    if (cart.length === 0) {
        throw new Error("cart is empty");
    }

    let totalCartValue = 0;
    let totalItems = 0;

    const formattedBaseUrl = `${protocol}://${host}/uploads/`;

    // 🔥 GROUP BY productId
    const grouped = new Map();

    for (const item of cart) {
        const key = item.productId;

        if (!grouped.has(key)) {
            grouped.set(key, {
                productId: item.productId,
                name: item.Catalog.name,
                image: formattedBaseUrl + item.Catalog.image,
                price: item.Catalog.price,
                quantity: 0
            });
        }

        const existing = grouped.get(key);

        existing.quantity += item.quantity;
    }

    const formattedCart = Array.from(grouped.values()).map(item => {
        const totalPrice = item.quantity * item.price;

        totalCartValue += totalPrice;
        totalItems += item.quantity;

        return {
            productId: item.productId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
            totalPrice
        };
    });

    return {
        serviceType,
        items: formattedCart,
        totalAmount: totalCartValue,
        totalItems
    };
};

const makingCart = async (data) => {
    const items = data.items;
    const userId = data.userId;
    const serviceType = data.serviceType;

    if (!userId || typeof userId !== "number") {
        throw new Error("Invalid userId");
    }

    if (!["laundry","paidLaundry", "drycleaning","ironing"].includes(serviceType)) {
        throw new Error("Invalid serviceType");
    }

    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error("User not found");
    }



    const upsertItems = [];
    const deleteConditions = [];

    const catOneValid = await catalogService.getCatalogIdsbyCategory('MEN');
    const catTwoValid = await catalogService.getCatalogIdsbyCategory('WOMEN');

    for (const item of items) {
        const { productId, categoryId, quantity } = item;

        if(serviceType !== 'laundry' && serviceType!== 'paidLaundry' && categoryId != null){
            throw new Error("categoryId not allowed");
        }

        if ((serviceType==='laundry' || serviceType==='paidLaundry') && categoryId==null) {
            throw new Error("categoryId required");
        }

        if((serviceType==='laundry' || serviceType==='paidLaundry') && categoryId!=1 && categoryId!=2){
            throw new Error("incorrect category id");
        }


        const product = await Catalog.findByPk(productId);
        if (!product) {
            throw new Error(`Invalid productId ${productId}`);
        }
        
        if(serviceType==='laundry' || serviceType==='paidLaundry'){
            if(product.serviceType!=='laundry'){
                throw new Error("Invalid product for this service type");
            }
        }else{
            if (serviceType !== product.serviceType) {
                throw new Error("Invalid product for this service type");
            }
        }

        if (quantity < 0) {
            throw new Error("Quantity cannot be negative");
        }

        if(serviceType==='laundry' || serviceType==='paidLaundry'){
            if(categoryId == 1){
                if(!catOneValid.includes(item.productId)){
                    throw new Error('invalid category id');
                }
            }else{
                if(!catTwoValid.includes(item.productId)){
                    throw new Error('invalid category id');
                }
            }
        }

        if (quantity === 0) {
            if(serviceType!=='laundry' && serviceType!=='paidLaundry'){
                const existing = await Cart.findOne({
                    where : {
                        userId,
                        productId,
                        serviceType,
                        categoryId:null
                    }
                })

                if(existing){
                    await existing.destroy();
                }

            }else{
                deleteConditions.push({
                    productId,
                    categoryId
                });
            }  
        } else {

            if(serviceType!=='laundry' && serviceType!=='paidLaundry'){
                const existing = await Cart.findOne({
                    where : {
                        userId,
                        productId,
                        serviceType,
                        categoryId:null
                    }
                })

                if(existing){
                    if(quantity>0){
                        await existing.update({
                            quantity:quantity
                        })
                    }else{
                        await existing.destroy();
                    }

                }else{
                    upsertItems.push({
                        userId,
                        productId,
                        categoryId,
                        quantity,
                        serviceType
                    });
                }

            }else{
                upsertItems.push({
                    userId,
                    productId,
                    categoryId,
                    quantity,
                    serviceType
                });
            }

        }
    }

    // UPSERT
    if (upsertItems.length) {
        await Cart.bulkCreate(upsertItems, {
            updateOnDuplicate: ['quantity']
        });
    }

    // DELETE (handle composite key)
    if (deleteConditions.length) {
        await Cart.destroy({
            where: {
                userId,
                serviceType,
                [Op.or]: deleteConditions.map(item => ({
                    productId: item.productId,
                    categoryId: item.categoryId
                }))
            }
        });
    }

    return "Cart updated successfully";
};

module.exports={
    addToCart,
    deleteFromCart,
    reduceFromCart,
    viewCart,
    makingCart
};