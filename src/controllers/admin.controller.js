const userService = require('../services/user.service');
const adminService = require('../services/admin.service');
const universityService = require('../services/university.service');
const dailyEntryService = require('../services/dailyEntryService');
const chemicalService = require('../services/chemical.service');
const catalogService = require('../services/catalog.service');
const AppImageService = require('../services/appImages.service');
const washerService = require('../services/washer.service');
const orderStatusService = require('../services/orderStatus.service');
const { Order, AdminMisConfig, sequelize } = require('../models');

const getAllUsers = async(req,res)=>{
    try{

        const protocol=req.protocol;
        const host = req.get('host');
        const data = await userService.getAllUsers({protocol,host});

        return res.status(200).json({
            message:"Users fetched successfully",
            status : "true",
            data : data.users
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });
        
    }
};

const dashboardMetrics = async(req,res)=>{
    try{
        const metrics = await adminService.getDashboardMetric();

        return res.status(200).json({
            message : "Dashboard metrics fetched successfully",
            status : "true",
            data : metrics
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
};

const getOrders = async(req,res)=>{
    try{

        const orders = await adminService.getOrders();

        return res.status(200).json({
            message : "Orders fetched successfully",
            status : "true",
            data : orders
        });

    }catch(error){
        return res.status(201).json({
            error : error.message,
            status : "false"
        })
    }
}

const getSubmittedOrders = async(req,res)=>{
    try{

        const protocol = req.protocol;
        const host = req.get('host');

        const orders = await adminService.getSubmittedOrders(protocol,host);

        return res.status(200).json({
            message : "Orders fetched successfully",
            status : "true",
            data : orders
        });

    }catch(error){
        return res.status(201).json({
            error : error.message,
            status : "false"
        })
    }
}

const getOrderDetails = async(req,res)=>{
    try{

        const orderId = req.body.orderId;

        if(!orderId){
            return res.status(201).json({
                message : "orderId required",
                status : "false"
            })
        }

        const data = await adminService.getOrderDetails(orderId);

        return res.status(200).json({
            message : "order details fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){
        return res.status(201).json({
            error : error.message,
            status : "false"
        });
    }
}

const deleteUser = async(req,res)=>{

    try{

        const userId = req.body.userId;

        if(!userId){
            return res.status(201).json({
                message : "UserId required",
                status : "false"
            });
        }

        const message = await adminService.deleteUser(userId);

        return res.status(200).json({
            message : message,
            status : "true"
        })

    }catch(error){
        
        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }

}

const enableUser = async(req,res)=>{

    try{

        const userId = req.body.userId;

        if(!userId){
            return res.status(201).json({
                message : "UserId required",
                status : "false"
            });
        }

        const message = await adminService.enableUser(userId);

        return res.status(200).json({
            message : message,
            status : "true"
        })

    }catch(error){
        
        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }

}


const register=async(req,res)=>{
    try{
        const universityId = await universityService.getUniversityIdByName(req.body.universityName);

        const newUser=await userService.RegisterUser(
            universityId,
            req.body.studentId,
            req.body.name,
            req.body.mobileNumber,
            req.body.laundryNumber
        );

        return res.status(201).json({
            message:'User registered successfully',
            status:"true",
            data:newUser
        });

    }catch(error){

        return res.status(500).json({
            message:error.message,
            status:"false"
        });

    }
};

const updateUserDetails=async(req,res)=>{

    try{
        if(!req.body.userId){
            return res.status(400).json({
                message:'userId missing'
            })
        }

        if(!req.body.name && !req.body.studentId && !req.body.universityName && !req.body.mobileNumber && !req.body.laundryNumber){
            return res.status(400).json({
                message:"no input recieved"
            })
        }

        const updatedUser = await userService.updateUserDetails(req.body);
        return res.status(200).json({
            message:updatedUser,
            status:"true"
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

}

const showMis = async(req,res)=>{

    try{

        const month = req.body.month;
        const year = req.body.year;

        const data = await dailyEntryService.show(month,year);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }
}

const showChemical = async(req,res)=>{

    try{

        const month = req.body.month;
        const year = req.body.year;

        const data = await chemicalService.showChemical(month,year);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }
}

const addWasherMen = async(req,res)=>{

    try{

        let imageIndex = 0;
        let proofIndex = 0;

        const washers =
            JSON.parse(req.body.washers);

        const washerId = req.body.washerId;

        if(!washerId){
            throw new Error(
                "washer id required"
            );
        }

        if(!washers || !washers.length){
            throw new Error(
                "washer data required"
            );
        }

        const images =
            req.files.images || [];

        const idProofs =
            req.files.idProofs || [];

        const expectedImages =
            washers.filter(
                w => w.hasImage
            ).length;

        const expectedProofs =
            washers.filter(
                w => w.hasIdProof
            ).length;

        if(images.length !== expectedImages){
            throw new Error(
                'Mismatch in profile images'
            );
        }

        if(idProofs.length !== expectedProofs){
            throw new Error(
                'Mismatch in id proofs'
            );
        }

        for(const washer of washers){

            if(washer.hasImage){

                washer.image =
                    images[imageIndex].filename;

                imageIndex++;

            }else{

                washer.image = null;
            }

            if(washer.hasIdProof){

                washer.idProof =
                    idProofs[proofIndex].filename;

                proofIndex++;

            }else{

                washer.idProof = null;
            }
        }

        const message =
            await adminService.addWasherMen({
                washerId,
                washers
            });

        return res.status(200).json({
            message,
            status:"true"
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
}
const editWasherMen = async(req,res)=>{

    try{

        const washerId = req.body.washerId;

        const data =
            JSON.parse(req.body.data);

        if(
            req.files &&
            req.files.image &&
            req.files.image[0]
        ){
            data.image =
                req.files.image[0].filename;
        }

        if(
            req.files &&
            req.files.idProof &&
            req.files.idProof[0]
        ){
            data.idProof =
                req.files.idProof[0].filename;
        }

        const message =
            await adminService
            .editWasherMen(washerId,data);

        return res.status(200).json({
            message,
            status:"true"
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
}

const deleteWasherMen=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const washerManId = req.body.washerManId;

        const message = await adminService.deleteWasherMen(washerId,washerManId);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const enableWasherMen=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const washerManId = req.body.washerManId;

        const message = await adminService.enableWasherMen(washerId,washerManId);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const getWashersList=async(req,res)=>{

    try{

        const protocol=req.protocol;
        const host=req.get('host');
        const data = await adminService.getWashersList(protocol,host);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const mapOrgAndWasher=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const organizationId = req.body.organizationId;
        const organizationType = req.body.organizationType || 'UNIVERSITY';

        const message = await adminService.mapOrgAndWasher(washerId,organizationId,organizationType);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const viewMapping=async(req,res)=>{

    try{

        const data = await adminService.viewMapping();

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const getCatalogAdmin=async(req,res)=>{

    try{

        const protocol = req.protocol;
        const host = req.get('host');
        const serviceType = req.body.serviceType;

        const list = await catalogService.getCatalogAdmin(protocol,host,serviceType);

        return res.status(200).json({
            message : "catalog fetched successfully",
            status : "true",
            data : list
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }

}

const updateCatalog=async(req,res)=>{

    try{

        const catalogId = req.body.catalogId;
        const serviceType = req.body.serviceType;

        if(req.file){
            req.body.image=req.file.filename;
        }

        const message = await catalogService.updateCatalogAdmin(req.body);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}


const updateStatus=async(req,res)=>{

    try{

        const catalogId = req.body.catalogId;
        const newStatus = req.body.newStatus;


        const message = await catalogService.updatestatus(catalogId,newStatus);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}


const addProducts=async(req,res)=>{

    try{ 
        const products = JSON.parse(req.body.products);
        const expectedFiles = products.filter(p=>p.hasImage).length;

        if(!products || !products.length){
                throw new Error("product data required");
            }

        if((req.files|| []).length !== expectedFiles){
            throw new Error('mismatch between product and images');
        }

        let index = 0;

        for(const product of products){

            if(product.hasImage){

                if(!req.files[index]){
                    throw new Error('image not found for product');
                }

                product.image = req.files[index].filename;
                index++;
            }else{
                product.image=null;
            }
        }

        const message = await catalogService.addCatalogAdmin(products);

        return res.status(200).json({
            message : message,
            status : "true"
        });
    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const editImages=async(req,res)=>{

    try{
        const imageId = req.body.imageId;
        const title = req.body.title;
        const subTitle = req.body.subTitle;
        const imageUrl = req.file?.filename || null;

        const response = await AppImageService.editImages({imageId,title,subTitle,imageUrl});

        return res.status(200).json({
            message : response,
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const addBannerImage=async(req,res)=>{

    try{
        const name = req.body.name;
        const title = req.body.title;
        const subTitle = req.body.subTitle;
        const imageUrl = req.file.filename;

        const response = await adminService.addBannerImage(name,title,subTitle,imageUrl);

        return res.status(200).json({
            message : response,
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const makeBannerActive=async(req,res)=>{

    try{
        const id = req.body.id;
        const name = req.body.name;

        const response = await AppImageService.makeBannerActive(id,name);

        return res.status(200).json({
            message : response,
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const activeBannerImages=async(req,res)=>{

    try{
        const protocol = req.protocol;
        const host = req.get('host');
        
        const images = await adminService.activeBannerImages(protocol,host);

        return res.status(200).json({
            message : "images fetched successfully",
            status : "true",
            data : images
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const inactiveBannerImages=async(req,res)=>{

    try{
        const protocol = req.protocol;
        const host = req.get('host');
        
        const images = await adminService.inactiveBannerImages(protocol,host);

        return res.status(200).json({
            message : "images fetched successfully",
            status : "true",
            data : images
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const updateOrderStatus=async(req,res)=>{

    try{
        const orderId = req.body.orderId;
        const status = req.body.status;

        const message = await orderStatusService.adminOrderStatus(orderId, status);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}


const resetPasswordRequest=async(req,res)=>{

    try{

        const protocol = req.protocol;
        const host = req.get('host');

        const list = await adminService.resetPasswordRequests(protocol,host);

        return res.status(200).json({
            message : "reset password requests fetched successfully",
            status : "true",
            data : list
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }

}

const changePassword=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        const message = await adminService.changePassword(washerId,oldPassword,newPassword);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const rejectPasswordChange=async(req,res)=>{

    try{

        const washerId = req.body.washerId;

        const response = await adminService.rejectPasswordRequest(washerId);

        return res.status(200).json({
            message : response,
            status : "true"
        });
    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const viewWasherMen = async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const protocol = req.protocol;
        const host = req.get('host');

        const data = await adminService.viewWasherMen(washerId,protocol,host);

        return res.status(200).json({
            message : "washer men fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const defectedItems = async(req,res)=>{

    try{

        const data = await adminService.defectedItems();

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status:"false"
        });

    }
}

const viewDefectedDetail = async(req,res)=>{

    try{

        const orderId = req.body.orderId;
        if(!orderId){
            return res.status(201).json({
                message:"id required",
                status : "false"
            })
        }

        const check = await Order.findByPk(orderId);
        if(!check){
            return res.status(201).json({
                message:"incorrect id",
                status : "false"
            })
        }
        const protocol=req.protocol;
        const host = req.get('host');

        const data = await adminService.viewDefectedDetails(orderId,protocol,host);

        return res.status(200).json({
            message : "fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const viewSubAdminPermissions=async(req,res)=>{

    try{

        const subAdminId = req.body.subAdminId;
        const data = await adminService.viewSubAdminPermissions(subAdminId);
        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
         });


    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const listOfPermissions=async(req,res)=>{

    try{

        const data = await adminService.listOfPermissions();

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const addPermissions = async(req,res)=>{

    try{

        const subAdminId = req.body.subAdminId;
        if(!subAdminId){
            throw new Error("id required");
        }
        const permissions = req.body.permissions;
        if(!permissions || permissions.length==0){
            throw new Error("permissions required");
        }

        const message = await adminService.addPermissions(subAdminId,permissions);
        return res.status(200).json({
            message : message,
            status : "true"
        });
    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}


const createWasher = async(req,res)=>{

    try{
        const name = req.body.name;
        const loginId = req.body.loginId;
        const password = req.body.password;
        const organizationId = req.body.organizationId;
        const organizationType = "UNIVERSITY";

        const response = await washerService.createWasher(name,loginId,password,organizationId,organizationType);

        return res.status(200).json({
            message : response,
            status : "true"
        });

    }catch(error){
        return res.status(500).json({
            message : error.message,
            status:"false"
        })
    }
}

const updateMisConfig = async(req,res)=>{

    const t = await sequelize.transaction();

    try{

        const { washerId, configs } = req.body;

        if(!washerId){
            throw new Error("washer id required");
        }

        if(!configs || !Array.isArray(configs) || !configs.length){
            throw new Error("configs required");
        }

        const validTypes = [
            'ELECTRICITY_PRICE',
            'GAS_PRICE',
            'GAS_MF'
        ];

        for(const config of configs){

            if(
                !config.type ||
                config.value == null
            ){
                throw new Error("invalid config");
            }

            if(!validTypes.includes(config.type)){
                throw new Error("invalid config type");
            }

            if(Number(config.value) <= 0){
                throw new Error("invalid config value");
            }

            await AdminMisConfig.upsert({
                washerId,
                type:config.type,
                value:Number(config.value)
            },{ transaction:t });
        }

        await t.commit();

        return res.status(200).json({
            status:"true",
            message:"mis config updated"
        });

    }catch(err){

        await t.rollback();

        return res.status(500).json({
            status:"false",
            message:err.message
        });
    }
}

const getMisConfig = async(req,res)=>{

    try{

        const configs = await AdminMisConfig.findAll({
            attributes:[
                'washerId',
                'type',
                'value'
            ],
            order:[
                ['washerId','ASC'],
                ['type','ASC']
            ]
        });

        const groupedConfigs = configs.reduce((acc,item)=>{

            if(!acc[item.washerId]){
                acc[item.washerId]=[];
            }

            acc[item.washerId].push({
                type:item.type,
                value:Number(item.value)
            });

            return acc;

        },{});

        return res.status(200).json({
            status:"true",
            data:groupedConfigs
        });

    }catch(err){

        return res.status(500).json({
            status:"false",
            message:err.message
        });
    }
}

module.exports={
    getAllUsers,
    dashboardMetrics,
    getOrders,
    getOrderDetails,
    deleteUser,
    register,
    updateUserDetails,
    showMis,
    showChemical,
    addWasherMen,
    editWasherMen,
    deleteWasherMen,
    getWashersList,
    mapOrgAndWasher,
    viewMapping,
    getCatalogAdmin,
    updateCatalog,
    addProducts,
    editImages,
    getSubmittedOrders,
    activeBannerImages,
    inactiveBannerImages,
    updateOrderStatus,
    resetPasswordRequest,
    changePassword,
    viewWasherMen,
    defectedItems,
    viewDefectedDetail,
    viewSubAdminPermissions,
    listOfPermissions,
    addPermissions,
    enableUser,
    rejectPasswordChange,
    enableWasherMen,
    updateStatus,
    addBannerImage,
    makeBannerActive,
    createWasher,
    updateMisConfig,
    getMisConfig
}