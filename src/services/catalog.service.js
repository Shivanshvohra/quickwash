const { Cart } = require('../models');
const Sequelize = require('../config/sequelize');
const { Op, where } = require('sequelize');

const Catalog=require('../models').Catalog;
const userService = require('./user.service');

const getCatalog=async (userId,rawType,protocol,host,rawProductType)=>{
    if(!rawType){
        throw new Error("Type is required");
    }
    if(!userId){
        throw new Error("userId is required");
    }
    const type = rawType.trim().toLowerCase();

    if((type==='laundry' || type==='paidlaundry') && !rawProductType){
        throw new Error("product type required");
    }
    const productType = rawProductType? rawProductType.trim().toUpperCase():null;
    let whereCondition = {};
    console.log("reached");
    if(type==='laundry' || type==='paidlaundry'){
        whereCondition.serviceType = 'laundry'

    }else if(type==="drycleaning"){
        whereCondition.serviceType = type

    }else if(type==="ironing"){
        whereCondition.serviceType = type
    }else{
        throw new Error("Invalid type");
    }
    console.log("reached");
    if(type==='laundry' || type==='paidlaundry'){
        if(productType==='MEN'){
            whereCondition.productType = {
                [Op.in] : ['MEN','UNISEX']
            }
        }else if(productType==='WOMEN'){
            whereCondition.productType = {
                [Op.in] : ['WOMEN','UNISEX']
            }
        }else{
            throw new Error('invalid product type');
        }
    }

    whereCondition.status='active';

    const catalog = await Catalog.findAll({
        where : whereCondition,
        attributes:['id', 'name', 'image', 'price']
    });

    const cartItems = await Cart.findAll({
        where: {
            userId,
            serviceType: type
        },
        attributes: ['productId', 'categoryId', 'quantity']
    });

    const cartMap = new Map();
    cartItems.forEach(item => {
        const categoryId = item.categoryId?item.categoryId:null;
        const key = `${item.productId}_${categoryId}`;
        cartMap.set(key, item.quantity);
    });

    let totalCartValue = 0;
    let totalItemsAdded = 0;

    const rawBaseUrl = `${protocol}://${host}`;
    const formattedBaseUrl = rawBaseUrl + '/uploads/';

    let categoryId = null;

    if(type==='laundry' || type==='paidlaundry'){
        categoryId = productType === 'MEN' ? 1 : 2;
    }
    let price = 0;

    const formattedCatalog = catalog.map(item => {

        const key = `${item.id}_${categoryId}`;
        const quantity = cartMap.get(key) || 0;

        if(type!=='laundry'){
            price = item.price || 0;
        }
        const totalAmount = price * quantity;

        totalCartValue += totalAmount;
        totalItemsAdded += quantity;

        return {
            productId: item.id,
            name: item.name,
            image: formattedBaseUrl + item.image,
            price: price,
            itemCount: quantity,
            categoryId 
        };
    });

    let remainingLimit = null;

    if(type==='laundry'){
        remainingLimit = await userService.getRemainingLimit(userId);
    }

    return {
        items : formattedCatalog,
        totalCartValue,
        totalItemsAdded,
        remainingLimit
    };
};

const getCatalogIdByName=async(name)=>{
    if(!name){
        throw new Error("name is required");
    }

    const catalogId = await Catalog.findOne({
        where:{
            name : name
        }
    });

    if(!catalogId){
        throw new Error("Invalid name");
    }

    return catalogId.id;
};

const getCatalogIds=async(serviceType)=>{

    if(serviceType!=="drycleaning" && serviceType!=="laundry" && serviceType!=="paidLaundry" && serviceType!=="ironing"){
        throw new Error("invalid service type");
    }

    console.log(serviceType);

    let servicetype = null;

    if(serviceType==="laundry" || serviceType==="paidLaundry"){
        servicetype='laundry';
    }else{
        servicetype=serviceType
    }

    const catalog = await Catalog.findAll({
        where : {
            serviceType:servicetype
        }
    });

    console.log(catalog);

    const catalogIds = [];

    for(const item of catalog){
        catalogIds.push(item.id);
    }

    return catalogIds;
}

const getCatalogIdsbyCategory=async(category)=>{

    if(category!=="MEN" && category!=="WOMEN"){
        throw new Error("invalid category type");
    }

    const catalog = await Catalog.findAll({
        where : {
            productType : {
                [Op.in] : [category,'UNISEX']
            }
        }
    });

    const catalogIds = [];

    for(const item of catalog){
        catalogIds.push(item.id);
    }

    return catalogIds;
}

const getCatalogAdmin=async(protocol,host,serviceType)=>{

    if(!protocol){
        throw new Error("protocol required");
    }

    if(!host){
        throw new Error("host required");
    }

    if(!serviceType){
        throw new Error("service type required");
    }

    if(!['laundry','drycleaning','ironing'].includes(serviceType)){
        throw new Error('incorrect service type');
    }

    const baseUrl = `${protocol}://${host}/uploads/`;

    const catalogs = await Catalog.findAll({
        where : {
            serviceType : serviceType
        }
    });

    const formattedCatalog = catalogs.map(c=>{
        return {
            id:c.id,
            name:c.name,
            price:c.price,
            image : baseUrl + c.image,
            productType : c.productType,
            serviceType : c.serviceType,
            status:c.status
        }
    })

    return formattedCatalog;
}

const updateCatalogAdmin = async(data)=>{

    if(!data.catalogId){
        throw new Error('id required');
    }

    if(!data.serviceType){
        throw new Error(
            'service type required'
        );
    }

    if(
        ![
            'laundry',
            'drycleaning',
            'ironing'
        ].includes(data.serviceType)
    ){
        throw new Error(
            'invalid service type'
        );
    }

    const product = await Catalog.findOne({
        where:{
            id:data.catalogId,
            serviceType:data.serviceType
        }
    });

    if(!product){
        throw new Error('invalid details');
    }

    const updateClause = {};

    if(data.name){
        updateClause.name = data.name;
    }

    if(data.image){
        updateClause.image = data.image;
    }

    if(data.price !== undefined){
        updateClause.price = data.price;
    }

    if(
        data.serviceType === 'laundry'
    ){

        if(data.productType){

            updateClause.productType =
                data.productType.toUpperCase();
        }

    }else{

        updateClause.productType =
            'UNISEX';
    }

    await product.update(updateClause);

    return "updated successfully";
}

const addCatalogAdmin = async(products)=>{

    if(!products || !products.length){
        throw new Error(
            'products required'
        );
    }

    const data = [];

    for(const product of products){

        if(
            !product.name ||
            !product.serviceType ||
            product.price === undefined
        ){
            throw new Error(
                'details missing'
            );
        }

        if(
            ![
                'laundry',
                'drycleaning',
                'ironing'
            ].includes(
                product.serviceType
            )
        ){
            throw new Error(
                'invalid service type'
            );
        }

        let productType = 'UNISEX';

        if(
            product.serviceType ===
            'laundry'
        ){

            if(!product.productType){

                throw new Error(
                    'product type required for laundry'
                );
            }

            productType =
                product.productType
                .toUpperCase();
        }

        data.push({

            name:product.name,

            image:product.image,

            productType,

            serviceType:
                product.serviceType
                .toLowerCase(),

            price:Number(product.price)

        });
    }

    await Catalog.bulkCreate(data);

    return "added successfully";
}

const updatestatus=async(catalogId,newStatus)=>{

    if(!catalogId || !newStatus){
        throw new Error('inputs required');
    }

    if(!['active','inactive'].includes(newStatus)){
        throw new Error("incorrect status");
    }


    const item = await Catalog.findByPk(catalogId);

    if(!item){
        throw new Error ( "incorrect item");
    }

    await item.update({
        status : newStatus
    });

    return "updated successfully";
}


module.exports={
    getCatalog,
    getCatalogIdByName,
    getCatalogIds,
    getCatalogIdsbyCategory,
    getCatalogAdmin,
    updateCatalogAdmin,
    addCatalogAdmin,
    updatestatus
};
