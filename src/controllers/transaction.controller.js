const orderService = require('../services/order.service');

const getTransactionHistory=async(req,res)=>{

    try{

        const userId = req.body.userId;

        const filter = req.body.filter;

        if(!userId){
            return res.status(201).json({
                message:'userId missing',
                status : "false"
            })
        };

        const data =  await orderService.getTransactionHistory(userId,filter);

        return res.status(200).json({
            message:"Transaction history fetched successfully",
            status:"true",
            data:data
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });

    }
};

const getOrderDetails=async(req,res)=>{

    try{

        if(!req.body.userId || !req.body.orderId){
            return res.status(201).json({
                message:"userId/orderId missing",
                status:"false"
            });
        }
        const protocol = req.protocol;
        const host = req.get('host');
        const data =  await orderService.getOrderDetails(req.body.userId,req.body.orderId,protocol,host);

        return res.status(200).json({
            message:"order details fetched successfully",
            status:"true",
            data:data
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

}

module.exports={
    getTransactionHistory,
    getOrderDetails
}
