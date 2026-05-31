const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const feedbackController = require('../controllers/feedback.controller');
const defectController = require('../controllers/defect.controller');
const upload = require('../config/multer');
const logInMiddleware = require('../config/loginMiddleware').loginMiddleware;

router.post('/register',userController.register);
router.post('/send-otp',userController.sendOtp);
router.post('/resend-otp',userController.resendOtp);
router.post('/loginAndVerify-otp',userController.verifyOtp);

router.post('/update',upload.single('image'),logInMiddleware,userController.updateUserDetails);
// router.post('/feedback',logInMiddleware,feedbackController.addFeedback);
router.post('/status',logInMiddleware,defectController.updateDefectStatus);
router.post('/getOrderStatus',logInMiddleware,userController.getOrderStatus);
router.post('/info',logInMiddleware,userController.getUserInfo);
router.post('/defectedHistory',logInMiddleware,userController.getDefectedHistory);

router.post('/nonWashable',logInMiddleware,userController.getNonWashable); ///only for sample use

router.post('/addIssue',logInMiddleware,userController.addIssue);
router.post('/logout',logInMiddleware,userController.logoutUI);
// router.post('/issueHistory',logInMiddleware,userController.issueHistory); TODO : modfiy later
router.post('/confirmation',logInMiddleware,userController.orderConfirmation);
router.get('/images',userController.fetchAllImages);
router.get('/packages',userController.getPackages);
router.post('/purchase-packages',logInMiddleware,userController.purchasePackage);
router.post('/list_items',logInMiddleware,userController.getItemsInOrder);

router.post('/issueHistory',userController.issueHistory);
router.post('/issueDetails',logInMiddleware,userController.issueDetails);

module.exports = router;