const sequelize = require('../config/sequelize');
const SubMenu = require('../models/subMenu.model').SubMenu;
const Issue = require('./issue.model').Issue;
const User = require('./user.model').User;
const Organization = require('./organization.model').Organization;
const Catalog = require('./catalog.model').Catalog;
const Cart = require('./cart.model').Cart;
const Order = require('./order.model').Order;
const OrderItem = require('./orderItem.model').OrderItem;
const Feedback = require('./feedback.model').Feedback;
const Washer = require('./washer.model').Washer;
const Defect = require('./defect.model').Defect;
const Orderstatus = require('./orderStatus.model').Orderstatus;
const Washermapper = require('./washerMapper.model').Washermapper;
const Payment = require('./payment.model').Payment;
const DailyEntry = require('./dailyEntry.model').DailyEntry;
const ElectricityLogs = require('./electricityLogs.model').ElectricityLogs;
const GasLogs = require('./gasLogs.model').GasLogs;
const { AdminMisConfig } = require("../models/adminMisConfig.model");
const { WasherAttendance } = require('./washerAttendance.model');
const { WasherMan } = require('./washerMan.model');
const SubAdmin = require('./subAdmin.model').SubAdmin;
const { Menu } = require('./permissions.model');
const { SubAdminPermissions } = require('./subAdminPermissions.model');
const { UserLimitPackage } = require('./userLimitPackage.model');
const { LimitPackage } = require('./limitPackages.model');
const Chemical = require('./chemical.model').Chemical;
const LoggedOutUser = require('../models/loggedOutUser.model').LoggedOutUser;
const Category = require('../models/category.model').Category;
const AppImages = require('./appImages.model').AppImages;
const ChemicalList = require('./chemicalList.model').ChemicalList;
const PasswordChange = require('./passwordChange.model').PasswordChange;

Washer.hasMany(AdminMisConfig,{
    foreignKey:'washerId'
});

AdminMisConfig.belongsTo(Washer,{
    foreignKey:'washerId'
});

Organization.hasOne(Washermapper, { foreignKey: 'organizationId' });
Washermapper.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(User, { foreignKey: 'organizationId' });
User.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(Washer, { foreignKey: 'organizationId' });
Washer.belongsTo(Organization, { foreignKey: 'organizationId' });


Organization.hasMany(Order, { foreignKey: 'organizationId' });
Order.belongsTo(Organization, { foreignKey: 'organizationId' });

Washer.hasMany(DailyEntry, { foreignKey: 'washerId' });
DailyEntry.belongsTo(Washer, { foreignKey: 'washerId' });

DailyEntry.hasOne(ElectricityLogs, { foreignKey: 'entryId' });
ElectricityLogs.belongsTo(DailyEntry, { foreignKey: 'entryId' });

DailyEntry.hasOne(GasLogs, { foreignKey: 'entryId' });
GasLogs.belongsTo(DailyEntry, { foreignKey: 'entryId' });

Cart.belongsTo(Catalog, { foreignKey: 'productId' });
Catalog.hasMany(Cart, { foreignKey: 'productId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Catalog.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Catalog, { foreignKey: 'productId' });

User.hasMany(Feedback,{ foreignKey:'userId'});
Feedback.belongsTo(User,{ foreignKey:'userId'});

Order.hasMany(Defect,{foreignKey:'orderId'});
Defect.belongsTo(Order,{foreignKey:'orderId'});

Washer.hasMany(Defect,{foreignKey:'washerId'});
Defect.belongsTo(Washer,{foreignKey:'washerId'});

Order.hasMany(Orderstatus, { foreignKey: 'orderId' });
Orderstatus.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Orderstatus, { foreignKey: 'userId' });
Orderstatus.belongsTo(User, { foreignKey: 'userId' });

Catalog.hasMany(Defect, { foreignKey: 'itemId' });
Defect.belongsTo(Catalog, { foreignKey: 'itemId' });

Washer.hasMany(Order, { foreignKey: 'washerId' });
Order.belongsTo(Washer, { foreignKey: 'washerId' });

Washer.hasMany(Washermapper, { foreignKey: 'washerId' });
Washermapper.belongsTo(Washer, { foreignKey: 'washerId' });

Order.hasOne(Payment, { foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Catalog.hasMany(Issue, { foreignKey: 'productId' });
Issue.belongsTo(Catalog, { foreignKey: 'productId' });

Order.hasMany(Issue, { foreignKey: 'orderId' });
Issue.belongsTo(Order, { foreignKey: 'orderId' });

Washer.hasMany(Chemical, { foreignKey: 'washerId' });
Chemical.belongsTo(Washer, { foreignKey: 'washerId' });

LoggedOutUser.belongsTo(User,{foreignKey:'userId'});
User.hasOne(LoggedOutUser,{foreignKey:'userId'});

Washer.hasMany(WasherMan,{foreignKey:'washerId'});
WasherMan.belongsTo(Washer,{foreignKey:'washerId'});

WasherMan.hasMany(WasherAttendance,{foreignKey:'washerManId'});
WasherAttendance.belongsTo(WasherMan,{foreignKey:'washerManId'});

Chemical.belongsTo(ChemicalList,{foreignKey:'chemicalId'});
ChemicalList.hasMany(Chemical,{foreignKey:'chemicalId'});

Washer.hasMany(PasswordChange, {
    foreignKey: 'washerId'
});

PasswordChange.belongsTo(Washer, {
    foreignKey: 'washerId'
});

SubAdmin.hasMany(SubAdminPermissions, {
    foreignKey: 'subAdminId'
});

SubAdminPermissions.belongsTo(SubAdmin, {
    foreignKey: 'subAdminId'
});

Menu.hasMany(SubAdminPermissions, {
    foreignKey: 'menuId'
});

SubAdminPermissions.belongsTo(Menu, {
    foreignKey: 'menuId'
});

Menu.hasMany(SubMenu,{
    foreignKey:'menuId'
});

SubMenu.belongsTo(Menu,{
    foreignKey:'menuId'
});


SubMenu.hasMany(SubAdminPermissions,{
    foreignKey:'subMenuId'
});

SubAdminPermissions.belongsTo(SubMenu,{
    foreignKey:'subMenuId'
});

User.hasMany(UserLimitPackage,{
    foreignKey:'userId'
});

UserLimitPackage.belongsTo(User,{
    foreignKey:'userId'
});

LimitPackage.hasMany(UserLimitPackage,{
    foreignKey:'packageId'
});

UserLimitPackage.belongsTo(LimitPackage,{
    foreignKey:'packageId'
});

module.exports = {
    sequelize,
    User,
    Organization,
    Catalog,
    Cart,
    Order,
    OrderItem,
    Feedback,
    Washer,
    Defect,
    Orderstatus,
    Washermapper,
    Payment,
    Issue,
    DailyEntry,
    ElectricityLogs,
    GasLogs,
    AdminMisConfig,
    Chemical,
    LoggedOutUser,
    SubAdmin,
    Category,
    WasherAttendance,
    WasherMan,
    AppImages,
    ChemicalList,
    PasswordChange,
    SubAdmin,
    Menu,
    SubAdminPermissions,
    SubMenu,
    LimitPackage,
    UserLimitPackage
};