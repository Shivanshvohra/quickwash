const { Order, Defect, Orderstatus,User, sequelize, OrderItem, Catalog, Payment, Organization, Washermapper, Washer, AppImages, PasswordChange, SubAdmin, SubAdminPermissions, SubMenu, Menu, WasherMan} = require('../models');
const { Op } = require('sequelize');
const orderService = require('./order.service');
const washerManService = require('./washerMan.service');
const washerService = require('../services/washer.service');
const defectService = require('../services/defect.service');

const getDashboardMetric = async()=>{

    const data = await orderService.getDashboardMetric();

    return data;
}; 

const getOrders = async()=>{
    return orderService.getAllOrders();
}

const getSubmittedOrders=async(protocol,host)=>{
    return orderService.submittedOrders({protocol,host});
}

const getOrderDetails = async(orderId)=>{
    return orderService.getOrderDetailsAdmin({orderId});
}

const deleteUser = async(userId)=>{

    return await orderService.deleteUser(userId);

}

const enableUser = async(userId)=>{

    return await orderService.enableUser(userId);

}

const addWasherMen=async({washerId,washers}={})=>{
    console.log(washerId);
    console.log(washers);

    return washerManService.addWasherMenAdmin({washerId,washers});
}

const editWasherMen=async(washerId,data)=>{

    return washerManService.editWasherMen({washerId,data});
}

const deleteWasherMen=async(washerId,washerManId)=>{

    return washerManService.deleteWasherMen({washerId,washerManId});
}

const enableWasherMen=async(washerId,washerManId)=>{

    return washerManService.enableWasherMen({washerId,washerManId});
}

const getWashersList=async(protocol,host)=>{
    return washerService.getAllWasherAdmin(protocol,host);
}

const mapOrgAndWasher=async(washerId,organizationId,organizationType)=>{

    if(!washerId){
        throw new Error('washer id required');
    }

    if(!organizationId){
        throw new Error('org id required');
    }

    if(!organizationType){
        throw new Error('org type required');
    }

    const washerCheck = await Washer.findByPk(washerId);

    if(!washerCheck){
        throw new Error('incorrect washer id');
    }

    const orgCheck = await Organization.findByPk(organizationId);

    if(!orgCheck){
        throw new Error('incorrect org id');
    }

    if(orgCheck.type!==organizationType){
        throw new Error("incorrect type");
    }

    await Washermapper.upsert({
        organizationId:organizationId,
        organizationType:organizationType,
        washerId:washerId
    });

    return "mapped successfully";
}
//TODO:check type reference
const viewMapping = async()=>{

    const mapping = await Washermapper.findAll({
        include:[{
            model : Organization,
            key:'id',
            attributes:['name']
        },{
            model : Washer,
            key:'id',
            attributes:['loginId','name']
        }]
    });

    const formattedMapping = mapping.map(map=>{
        return {
            washerName:map.Washer.name,
            organizationName:map.Organization.name,
            organizationType:map.organizationType
        }
    });

    return formattedMapping;
}


const activeBannerImages=async(protocol,host)=>{

    const images = await AppImages.findAll({
        where : {
            status : 'active'
        },
        order:[['name','ASC']]
    })

    const baseUrl = `${protocol}://${host}/uploads/`;
    
    const formattedImages = images.map(image=>{
        return {
            id:image.id,
            name:image.name,
            image:baseUrl+image.image,
            title:image.title,
            subTitle:image.subTitle,
            status:image.status
        }
    })

    return formattedImages;
}

const inactiveBannerImages=async(protocol,host)=>{

    const images = await AppImages.findAll({
        where : {
            status : 'inactive'
        },
        order:[['name','ASC']]
    })

    const baseUrl = `${protocol}://${host}/uploads/`;
    
    const formattedImages = images.map(image=>{
        return {
            id:image.id,
            name:image.name,
            image:baseUrl+image.image,
            title:image.title,
            subTitle:image.subTitle,
            status:image.status
        }
    })

    return formattedImages;
}

const addBannerImage = async(name,title,subTitle,image)=>{

    if(!name || !image || !title || !subTitle){
        throw new Error("incomplete inputs");
    }

    if(!['outer_1','outer_2','outer_3','inner_1','inner_2','inner_3'].includes(name)){
        throw new Error('incorrect name');
    }

    const existingBanner = await AppImages.findOne({
        where : {
            name,
            status : 'active'
        }
    })

    await existingBanner.update({
        status : 'inactive'
    });

    await AppImages.create({
        name,
        title,
        subTitle,
        image,
        status : 'active'
    })

    return "image updated succesfully";
}

const resetPasswordRequests=async(protocol,host)=>{

    const list = await PasswordChange.findAll({
        where:{
            status : 'REQUESTED'
        },
        include:[{
            model : Washer,
            attributes:['id','name','image','loginId','password','organizationId'],
            include:[{
                model : Organization,
                attributes:['name']
            }]
        }]
    })

    const baseUrl = `${protocol}://${host}/uploads/`;

    const formattedList = list.map(item=>{

            const onlyDate = item.createdAt.toLocaleDateString('en-GB',{
                day : '2-digit',
                month : 'short',
                year : 'numeric'
            });

            const onlyTime = item.createdAt.toLocaleTimeString('en-US',{
                hour:'2-digit',
                minute:'2-digit',
                hour12:true
            });

        return {

            name : item.Washer.name,
            requestId : item.id,
            washerId : item.Washer.id,
            oldPassword : item.Washer.password,
            organizationName : item.Washer.Organization.name,
            image : baseUrl + item.Washer.image,
            date : onlyDate,
            time : onlyTime 
        }
    })

    return formattedList;
}

const changePassword=async(washerId,oldPassword,newPassword)=>{

    if(!washerId || !oldPassword || !newPassword){
            throw new Error('washer id, old password and new password are required');
        }

    const check = await PasswordChange.findOne({
        where : {
            washerId : washerId,
            status : 'REQUESTED'
        },
        order : [['createdAt','DESC']]
    })

    if(!check){
        throw new Error('no pending request found');
    }

    const washer = await Washer.findByPk(washerId);

    if(washer.password !== oldPassword){
        throw new Error('password is incorrect');
    }

    washer.password = newPassword;
    await washer.save();

    check.status = 'CHANGED';
    await check.save();

    return "password changed successfully";

}

const rejectPasswordRequest=async(washerId)=>{
    if(!washerId){
        throw new Error("washer id required");
    }

    const check = await Washer.findByPk(washerId);

    if(!check){
        throw new Error('washer does not exist');
    }

    const passwordChangeRequest = await PasswordChange.findOne({
        where : {
            washerId : washerId,
            status : 'REQUESTED'
        }
    })

    if(!passwordChangeRequest){
        throw new Error("no request recieved for password change");
    }

    await passwordChangeRequest.update({
        status:'REJECTED'
    });

    return "password change request denied successfully";
}

const defectedItems = async()=>{
    return await defectService.defectedItems();
}

const viewDefectedDetails=async(orderId,protocol,host)=>{
    return await defectService.viewDefectDetails(orderId,protocol,host);
}

const viewSubAdminPermissions=async(subAdminId)=>{

    if (!subAdminId){
        throw new Error("id required");
    }

    const check = await SubAdmin.findByPk(subAdminId);

    if (!check){
        throw new Error("uincorrect id");
    }

    const permissions = await SubAdminPermissions.findAll({
        where:{
            subAdminId:subAdminId,
            status:1
        },
        include:[{
            model : Menu,
            attributes:['name','id']
        },{
            model : SubMenu,
            attributes:['menuId','name','id']
        }]
    });

    const formattedPermissions = [];

    const menuMap = {};

    permissions.forEach(permission => {

        const menuId = permission.menuId;

        if(!menuMap[menuId]){

            menuMap[menuId] = {
                id: permission.Menu.id,
                menu: permission.Menu.name
            };

            if(permission.SubMenu){

                menuMap[menuId].subMenus = [];
            }

            formattedPermissions.push(menuMap[menuId]);
        }

        if(permission.SubMenu){

            if(!menuMap[menuId].subMenus){
                menuMap[menuId].subMenus = [];
            }

            menuMap[menuId].subMenus.push({
                id: permission.SubMenu.id,
                menuId:permission.SubMenu.menuId,
                name: permission.SubMenu.name
            });
        }
    });

    return formattedPermissions;
}

const listOfPermissions=async()=>{

    const permissions = await Menu.findAll({
        include:[{
            model : SubMenu
        }]
    });

    const formattedPermissions = [];

    const menuMap = {};

    permissions.forEach(permission => {

        const menuId = permission.id;

        if(!menuMap[menuId]){

            menuMap[menuId] = {
                
                id: permission.id,
                menu: permission.name
            };

            if(permission.SubMenus.length>0){

                menuMap[menuId].subMenus = [];
            }

            formattedPermissions.push(menuMap[menuId]);
        }

        if(permission.SubMenus.length>0){

            if(!menuMap[menuId].subMenus){
                menuMap[menuId].subMenus = [];
            }

            for ( const submenu of permission.SubMenus){
                menuMap[menuId].subMenus.push({
                    id: submenu.id,
                    menuId:submenu.menuId,
                    name: submenu.name
                });
            }


        }
    });

    return formattedPermissions;

}

const addPermissions=async(subAdminId,permissions)=>{

    if(!subAdminId){
        throw new Error('id required');
    }

    const check = await SubAdmin.findByPk(subAdminId);

    if(!check){
        throw new Error('incorrect id');
    }

    const BulkCreate=[];
    for(const permission of permissions){

        if(permission.subMenuIds){
            const check = await Menu.findByPk(permission.menuId);
            if(!check){
                throw new Error("incorrect id");
            }

            for(const submenuid of permission.subMenuIds){
                const check = await SubMenu.findByPk(submenuid);
                if(!check){
                    throw new Error("incorrect id");
                }
                if(check.menuId !== permission.menuId){
                    throw new Error("incorrect id");
                }
                BulkCreate.push({
                    subAdminId:subAdminId,
                    menuId:permission.menuId,
                    subMenuId:submenuid,
                    status:1
                })
            }
        }else{

            const check = await Menu.findByPk(permission.menuId);
            if(!check){
                throw new Error("incorrect id");
            }

            const existing = await SubAdminPermissions.findOne({
                where : {
                    subAdminId:subAdminId,
                    menuId:permission.menuId,
                    subMenuId:null
                }
            })

            if(existing){
                existing.status=1;
                await existing.save();
            }else {
                BulkCreate.push({
                    subAdminId:subAdminId,
                    menuId:permission.menuId,
                    status :1
                })
            }

        }

    }

    await SubAdminPermissions.bulkCreate(BulkCreate,{
        updateOnDuplicate:[
            'status',
            'updatedAt'
        ]
    });

    return "permissions added successfully";
}

const viewWasherMen=async(washerId,protocol,host)=>{

        if(!washerId){
            throw new Error("id required");
        }

        const check = await Washer.findByPk(washerId);
        if(!check){
            throw new Error('invalid id');
        }

        const list = await WasherMan.findAll({
            where : {
                washerId
            }
        });

        const baseUrl = `${protocol}://${host}/uploads/`

        const formattedList = list.map(data=>{
            return{
                id:data.id,
                washerId:data.washerId,
                name:data.name,
                image: data.image ? baseUrl+data.image : null,
                idProof: data.idProof ? baseUrl+data.idProof : null,
                status:data.status
            }
        })

        return formattedList;

}


module.exports = {
    getDashboardMetric,
    getOrders,
    getOrderDetails,
    deleteUser,
    addWasherMen,
    editWasherMen,
    deleteWasherMen,
    getWashersList,
    mapOrgAndWasher,
    viewMapping,
    getSubmittedOrders,
    resetPasswordRequests,
    changePassword,
    defectedItems,
    viewDefectedDetails,
    viewSubAdminPermissions,
    listOfPermissions,
    addPermissions,
    viewWasherMen,
    enableUser,
    rejectPasswordRequest,
    enableWasherMen,
    activeBannerImages,
    inactiveBannerImages,
    addBannerImage
}
