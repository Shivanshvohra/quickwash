const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order.controller');
const logInMiddleware = require('../config/loginMiddleware').loginMiddleware;

router.post('/order-checkout', logInMiddleware,orderController.checkout);

router.post('/order-payment-method', logInMiddleware,orderController.selectPaymentMethod);

router.post('/order-clear-cart', logInMiddleware,orderController.clearCart);

router.post('/update-order',logInMiddleware,orderController.updateOrder);

router.post('/update-order-catalog',logInMiddleware,orderController.updateOrderCatalog);


module.exports = router;