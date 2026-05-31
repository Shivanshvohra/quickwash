const express = require('express');
const router = express.Router();
const washerController = require('../controllers/washer.controller');
const defectController = require('../controllers/defect.controller');
const upload = require('../config/multer');

router.post('/login',washerController.loginWasher);
router.post('/defect',upload.single('image'),defectController.addDefects);
router.post('/updateOrderstatus',washerController.updateOrderstatus);
router.post('/fetch',defectController.fetchApprovals);
router.post('/history',washerController.getOrderHistory);
router.post('/details',washerController.getOrderDetails);
router.post('/addIssue',washerController.addIssue);
router.post('/addEntry',washerController.addEntry);
router.post('/addChemical',washerController.addChemicals);
router.post('/issueHistory',washerController.issueHistory);
router.post('/issueDetails',washerController.issueDetails);
router.post('/getwashers',washerController.getWashers);
router.post('/setAttendance',washerController.setAttendance);
router.post('/lastDay',washerController.lastDaysOpening);
router.post('/universities',washerController.getListOfUniversities);
router.post('/Info',washerController.washerInfo);
router.post('/items',washerController.getItemsInOrder);
router.post('/lastChemicalOpening',washerController.lastChemicalOpening);
router.post('/washer_logout',washerController.logoutUIWasher);
router.post('/defect_washer_history',washerController.getDefectedWasherHistory);
router.post('/reset_password',washerController.resetPassword);
router.get('/chemical_dropdown',washerController.chemicalDropdown);
router.post('/list_orderid',washerController.getOrdersList);


router.post('/update_washer_profile',upload.single('image'),washerController.updateWasherProfile);

module.exports=router;