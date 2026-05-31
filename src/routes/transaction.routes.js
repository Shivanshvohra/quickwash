const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const logInMiddleware = require('../config/loginMiddleware').loginMiddleware;

router.post('/transactions',logInMiddleware,transactionController.getTransactionHistory);
router.post('/transaction-details',logInMiddleware,transactionController.getOrderDetails);

module.exports=router;