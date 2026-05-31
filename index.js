const express = require('express');

const app = express();
const cors = require('cors');
const userRoutes = require('./src/routes/user.routes');

const universityRoutes = require('./src/routes/university.routes');

const catalogRoutes= require('./src/routes/catalog.routes');

const cartRoutes=require('./src/routes/cartRoutes');

const orderRoutes = require('./src/routes/order.routes');

const transactionRoutes = require('./src/routes/transaction.routes');

const washerRoutes = require('./src/routes/washer.routes');

const { sequelize } = require('./src/models/index');

const adminRoutes = require('./src/routes/admin.routes');

const subAdminRoutes = require('./src/routes/subAdmin.routes');

const logInMiddleware = require('./src/config/loginMiddleware').loginMiddleware;

const path = require('path');

const orderController = require('./src/controllers/order.controller');

const userController = require('./src/controllers/user.controller');

require('dotenv').config();
 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log("🔥")
  console.log(req.method, req.url);
  next();
});

app.use('/users',universityRoutes);

app.use('/users',userRoutes);

app.use('/users',catalogRoutes);

app.use('/users',cartRoutes);

app.use('/users', orderRoutes);

app.use('/users',transactionRoutes);

app.use('/washer',washerRoutes);

app.use('/admin', adminRoutes);

app.post('/payment-success',orderController.paymentSuccess);
app.post('/payment-failure',orderController.paymentFailure);
app.post('/payment-verify',orderController.paymentStatus);
app.post('/payment-package',userController.paymentPackage);
// app.use('/subAdmin', subAdminRoutes);
 
const port = process.env.PORT || 8020;

(async () => {

    try {

        await sequelize.authenticate();

        console.log('DB connected');
 
        app.listen(process.env.PORT, () => {

            console.log(`Server is running on port ${port}`);

        });
 
    } catch (err) {

        console.error('DB connection failed', err);

    }

})();
 
 