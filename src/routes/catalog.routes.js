const express = require('express');
const router=express.Router();
const catalogController=require('../controllers/catalog.controller');

const logInMiddleware = require('../config/loginMiddleware').loginMiddleware;

router.post('/catalog',logInMiddleware,catalogController.getCatalog);

module.exports=router;