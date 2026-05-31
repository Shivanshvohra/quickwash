// const express = require('express');
// const router = express.Router();
// const subAdminController = require('../controllers/subAdmin.controller');
// const { checkPermissionMiddleware } = require('../config/checkPermission');


// router.post('/login', subAdminController.login);

// router.post('/metrics',checkPermissionMiddleware('DASHBOARD'),admin.getDashboardMetric);
// router.get('/dashboardOrders',checkPermissionMiddleware('DASHBOARD'),subAdminController.getSubmittedOrders);
// router.post('/updateOrderStatus',checkPermissionMiddleware('DASHBOARD'),subAdminController.updateOrderStatus);


// router.post('/orders',checkPermissionMiddleware('ORDERS'),subAdminController.getAllOrders);
// router.post('/details',checkPermissionMiddleware('ORDERS'),subAdminController.getOrderDetails);


// router.post('/delete',checkPermissionMiddleware('USER_MANAGEMENT','USERS'),subAdminController.deleteUser);
// router.post('/registerNewUser',checkPermissionMiddleware('USER_MANAGEMENT','USERS'),subAdminController.registerUser);
// router.post('/updateUser',checkPermissionMiddleware('USER_MANAGEMENT','USERS'),subAdminController.updateUser);
// router.post('/users',checkPermissionMiddleware('USER_MANAGEMENT','USERS'),subAdminController.getAllUsers);


// router.post('/defectedItems',checkPermissionMiddleware('DEFECTS'),subAdminController.defectedItems);
// router.post('/defectDetails',checkPermissionMiddleware('DEFECTS'),subAdminController.viewDefectedDetail);

// module.exports = router;
