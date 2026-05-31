const { sequelize, Order, Payment, User, Orderstatus } = require('../models');
const orderService = require('../services/order.service');
const orderstatusService = require('../services/orderStatus.service');
const generateAndSaveReceipt = require('../config/generateReceipt');
const {buildReceiptPayload} = require("../config/buildReceiptPayload");
const easeBuzzService = require('../services/easeBuzz.service');

const checkout = async (req, res) => {
    const { userId, serviceType, paymentMethod } = req.body;

    if (!userId || !serviceType) {
        return res.status(201).json({
            message: "userId and serviceType are required",
            status: "false"
        });
    }

    const t = await sequelize.transaction();

    let data;
    let orderId;

    try {
        data = await orderService.checkout(userId, serviceType, paymentMethod, t);

        orderId = data.orderId;

        await orderstatusService.createOrderStatus(orderId, userId, t);

        await t.commit();

    } catch (error) {
        await t.rollback();

        return res.status(201).json({
            message: error.message,
            status: "false"
        });
    }

    try {
        if (paymentMethod !== 'ONLINE') {

            const order = await Order.findByPk(orderId);

            const payload = await buildReceiptPayload(order);

            generateAndSaveReceipt(payload)
                .catch(err => console.error("Receipt error:", err));
        }

    } catch (err) {
        console.error("Post-commit error:", err);
    }

    try {

        if(
            (serviceType === 'drycleaning'||serviceType === 'paidLaundry'||serviceType === 'ironing')
            &&
            paymentMethod === 'ONLINE'
        ){

            const user = await User.findByPk(userId);

            const gatewayResponse =
                await easeBuzzService.createPaymentSession({
                    orderId,
                    amount: data.totalAmount,
                    name: user.name,
                    phone: user.mobileNumber
                });

            data.accessKey =
                gatewayResponse.accessKey;

            const payment = await Payment.findOne({
                where: { orderId }
            });

            await payment.update({
                transactionToken:
                    gatewayResponse.txnid
            });
        }else{
            await orderService.clearCart(userId, serviceType);
            data.accessKey=null;
        }

    } catch (err) {

        console.error(
            'Easebuzz Error:',
            err.message
        );

        return res.status(500).json({
            message:
                'Order created but payment session failed',
            status: false
        });
    }

    return res.status(200).json({
        message : "order fetched",
        status : "true",
        data:data
    });
};

const paymentSuccess = async(req,res)=>{

    try{

        console.log('SUCCESS RESPONSE');
        console.log(req.body);

        const {txnid,status,mode}=req.body;

        const payment = await Payment.findOne({
            where : {
                transactionToken:txnid
            }
        })

        if(!payment){
            return res.status(404).send('Payment not found');
        }

        if(payment.status === 'SUCCESS'){
            return res.send('Already processed');
        }

        await payment.update({
            paymentMethod:'ONLINE',
            status : 'SUCCESS'
        })

        await orderService.updatePaymentStatusAndGenerateReceipt(
            payment.orderId,
            'ONLINE',
            'SUCCESS'
        )

        const order = await Order.findByPk(
            payment.orderId
        );

        const payload =
            await buildReceiptPayload(order);

        generateAndSaveReceipt(payload)
            .catch(err =>
                console.error(
                    "Receipt error:",
                    err
                )
            );

        await orderService.clearCart(order.userId, order.serviceType);
        return res.send('success');
    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const paymentStatus=async(req,res)=>{

    try{

        const orderId = req.body.orderId;

        const payment = await Payment.findOne({
            where:{
                orderId
            },
            order:[['createdAt','DESC']]
        })

        if (!payment) {
            return res.status(404).json({
                message: 'Payment not found',
                status: false
            });
        }

        return res.status(200).json({
            orderId,
            paymentStatus: payment.status,
            paymentMethod: payment.paymentMethod
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}


const paymentFailure = async(req,res)=>{

    try{

        console.log('FAILURE RESPONSE');
        console.log(req.body);
        
        const {txnid}=req.body;

        const payment = await Payment.findOne({
            where : {
                transactionToken:txnid
            }
        })

        if(!payment){
            return res.status(404).send('Payment not found');
        }

        if(payment.status === 'FAILED' || payment.status === 'SUCCESS'){
            return res.send('Already processed');
        }

        const order = await Order.findByPk(payment.orderId);

        await payment.update({
            status : 'FAILED'
        })


        await Orderstatus.create({
            orderId:payment.orderId,
            userId:order.userId,
            status:'FAILED'
        })

        return res.send('failed');

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const selectPaymentMethod = async (req, res) => {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
        return res.status(201).json({
            message: "orderId and paymentMethod are required",
            status:"false"
        });
    }

    try {
        const order = await orderService.selectPaymentMethod(orderId, paymentMethod);

        return res.status(200).json({
            message: "Payment method selected",
            data: order
        });

    } catch (error) {
        return res.status(201).json({
            message: error.message,
            status: "false"
        });
    }
};


const clearCart = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(201).json({
            message: "userId is required",
            status:"false"
        });
    }

    try {
        await orderService.clearCart(userId);

        return res.status(200).json({
            message: "Cart cleared successfully"
        });

    } catch (error) {
        return res.status(201).json({
            message: error.message,
            status : "false"
        });
    }
};

const updateOrder = async(req,res)=>{
    try{
        const userId = req.body.userId;
        const orderId = req.body.orderId;
        const items = req.body.items;

        const response = await orderService.updateOrder(userId,orderId,items);

        return res.status(200).json({
            message : response,
            status : 'true'
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status:"false"
        });
    }
}

const updateOrderCatalog = async(req,res)=>{
    try{
        const userId = req.body.userId;
        const orderId = req.body.orderId;

        const response = await orderService.updateOrderCatalog(userId,orderId);

        return res.status(200).json({
            message : "catalog fetched successfully",
            status : 'true',
            data : response
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status:"false"
        });
    }
}


module.exports = {
    checkout,
    selectPaymentMethod,
    clearCart,
    paymentFailure,
    paymentSuccess,
    paymentStatus,
    updateOrder,
    updateOrderCatalog
};