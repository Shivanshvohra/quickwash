const subAdminService = require('../services/subAdmin.service');
const orderService = require('../services/order.service');
const { SubAdmin } = require('../models/subAdmin.model');
const { Organization } = require('../models/organization.model');
const { Order } = require('../models');

const login = async(req,res)=>{
    try{

        const {loginId,password,organizationId,organizationType} = req.body;

        const data = await subAdminService.login(Number(loginId),password,Number(organizationId),organizationType);

        return res.status(200).json({
            message : data,
            status : "true"
        })

    }catch(error){
        return res.status(400).json({
            message : error.message,
            status : "false"
        })
    }
}

const getAllOrders = async(req,res)=>{
    try{

        const id = req.body.subAdminId;
        const data = await subAdminService.getAllOrders(id);

        return res.status(200).json({
            message : data,
            status : "true"
        })

    }catch(error){
        return res.status(400).json({
            message : error.message,
            status : "false"
        })
    }
}

const getOrderDetails = async(req,res)=>{

    try{

        const orderId = req.body.orderId;
        const id = req.body.subAdminId;

        const data = await subAdminService.getOrderDetails(orderId,id);

        return res.status(200).json({
            message : "order details fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(400).json({
            message : error.message,
            status : "false"
        })

    }

}

const deleteUser = async(req,res)=>{

    try{

        const userId = req.body.userId;

        const message =  await subAdminService.deleteUser(userId);

        return res.status(200).json({
            message,
            status : "true"
        });

    }catch(error){

        return res.status(400).json({
            message : error.message,
            status : "false"
        });

    }
}

const registerUser = async(req,res)=>{

    try{

        const {univeristyName,studentId,name,mobileNumber,laundryNumber} = req.body;

        const data = await subAdminService.registerUser(univeristyName,studentId,name,mobileNumber,laundryNumber);

        return res.status(200).json({
            message : "user created successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(400).json({
            message : error.message,
            status : "false"
        });

    }
}

const updateUser=async(req,res)=>{

    try{

        const data = await subAdminService.updateUser(req.body);

        return res.status(200).json({
            message : "user updated successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(400).json({
            message : error.message,
            status : "false"
        });

    }

}

const getAllUsers=async(req,res)=>{

    try{
        const id = req.body.subAdminId;

        const data = await subAdminService.getAllUsers(id);

        return res.status(200).json({
            message:"Users fetched successfully",
            status : "true",
            data : data.users,
            nextCursor : data.nextCursor
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }

}

const getDashboardMetric=async(req,res)=>{

    try{

        const id = req.body.subAdminId;

        const metrics = await subAdminService.getDashboardMetric(id);

        return res.status(200).json({
            message : "Dashboard metrics fetched successfully",
            status : "true",
            data : metrics
        });

    }catch(error){

        return res.status(400).json({
            message : error.message,
            status : "false"
        });

    }
}


const getSubmittedOrders = async(req,res)=>{
    try{
        const status = req.query.status || 'SUBMITTED';
        if(!['SUBMITTED','PICKED','COMPLETED'].includes(status)){
            return res.status(201).json({
                message : "invalid status",
                status : "false"
            });
        }
        const subAdminId = req.body.subAdminId;

        const subAdmin = await SubAdmin.findByPk(subAdminId);

        if(!subAdmin){
            throw new Error("incorrect id");
        }

        const organizationId = subAdmin.organizationId;
        const organizationType = subAdmin.organizationType;

        const orders = await orderService.getSubmittedOrders({status,organizationId,organizationType});

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

const defectedItems = async(req,res)=>{

    try{
        const subAdminId = req.body.subAdminId;
        if(!subAdminId){
            return res.status(201).json({
                message:"id required",
                status : "false"
            })
        }

        const check = await SubAdmin.findByPk(subAdminId);
        if(!check){
            return res.status(201).json({
                message:"incorrect id",
                status : "false"
            })
        }
        const organizationId = check.organizationId;
        const organizationType = check.organizationType;

        const data = await subAdminService.defectedItems(organizationId,organizationType);

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

        const data = await subAdminService.viewDefectedDetails(orderId,protocol,host);

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



module.exports={
    login,
    getAllOrders,
    getOrderDetails,
    deleteUser,
    registerUser,
    updateUser,
    getAllUsers,
    getDashboardMetric,
    getSubmittedOrders,
    updateOrderStatus,
    defectedItems,
    viewDefectedDetail
}
