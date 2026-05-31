const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const universityController = require("../controllers/university.controller");
const upload = require('../config/multer');
const multer = require('multer');

router.get('/metrics',adminController.dashboardMetrics);
router.get('/dashboardOrders',adminController.getSubmittedOrders);
router.post('/updateOrderStatus',adminController.updateOrderStatus);

router.get('/orders',adminController.getOrders);
router.post('/orderDetails',adminController.getOrderDetails);

router.get('/users',adminController.getAllUsers);
router.post('/deleteUser',adminController.deleteUser);
router.post('/enableUser',adminController.enableUser);
router.post('/registerUser',adminController.register);
router.post('/updateUser',adminController.updateUserDetails);

router.get('/washersList',adminController.getWashersList);
router.post('/viewWasherMen',adminController.viewWasherMen);
router.post(
    '/addWasherMen',
    upload.fields([
        { name:'images'},
        { name:'idProofs'}
    ]),
    adminController.addWasherMen
);
router.post('/editWasherMen',upload.fields([
    { name:'image', maxCount:1 },
    { name:'idProof', maxCount:1 }
]),adminController.editWasherMen);
router.post('/deleteWasherMen',adminController.deleteWasherMen);
router.post('/enableWasherMen',adminController.enableWasherMen);

router.get('/defectedItems',adminController.defectedItems);
router.post('/defectDetails',adminController.viewDefectedDetail);

router.post('/showMis',adminController.showMis);
router.post('/showChemical',adminController.showChemical);

router.post('/mapping',adminController.mapOrgAndWasher);
router.get('/viewMapping',adminController.viewMapping);

router.post('/catalog',adminController.getCatalogAdmin);
router.post('/updateCatalog',upload.single('image'),adminController.updateCatalog);
router.post('/addCatalog',upload.array('images'),adminController.addProducts);
router.post('/update_status',adminController.updateStatus);

router.post('/editImage',upload.single('image'),adminController.editImages);
router.get('/active_bannerImages',adminController.activeBannerImages);
router.get('/inactive_bannerImages',adminController.inactiveBannerImages);
router.post('/add_bannerImage',upload.single('image'),adminController.addBannerImage);
router.post('/activate_banner',adminController.makeBannerActive);

router.get('/reset_password_requests',adminController.resetPasswordRequest);
router.post('/change_password',adminController.changePassword);
router.post('/reject_password_request',adminController.rejectPasswordChange);

router.post('/permissions',adminController.viewSubAdminPermissions);
router.get('/list_permissions',adminController.listOfPermissions);
router.post('/add_permissions',adminController.addPermissions);

router.get('/universities',universityController.getAllUniversities);
router.post('/create_washer',adminController.createWasher);

router.post('/updateMisConfig',adminController.updateMisConfig);
router.get('/getMisConfig',adminController.getMisConfig);

module.exports = router;