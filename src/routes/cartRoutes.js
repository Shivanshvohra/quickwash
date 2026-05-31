const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const logInMiddleware = require('../config/loginMiddleware').loginMiddleware;


router.use((req, res, next) => {
  console.log("🔥")
  console.log(req.method, req.url);
  next();
});
router.post('/add',logInMiddleware,cartController.addToCart);
router.post('/delete',logInMiddleware,cartController.deleteFromCart);
router.post('/reduce',logInMiddleware,cartController.reduceFromCart);
router.post('/view-cart',logInMiddleware,cartController.viewCart);
router.post('/cartCreation',logInMiddleware,cartController.makingCart);

module.exports=router;