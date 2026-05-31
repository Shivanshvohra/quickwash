const {
    SubAdminPermissions,
    Permissions,
    SubMenu
} = require("../models");

const checkPermissionMiddleware = (
    requiredPermission,
    requiredSubMenuPermission = null
) => {

    return async (req, res, next) => {

        try {

            const subAdminId = req.body.subAdminId;

            if(!subAdminId){
                return res.status(201).json({
                    message : "id required",
                    status : "false"
                })
            }

            const whereClause = {
                subAdminId
            };

            const include = [
                {
                    model: Permissions,
                    where: {
                        name: requiredPermission
                    }
                }
            ];

            // If submenu permission is required
            if(requiredSubMenuPermission){

                include.push({
                    model: SubMenu,
                    where:{
                        name: requiredSubMenuPermission
                    }
                });
            }

            const permission = await SubAdminPermissions.findOne({
                where: whereClause,
                include
            });

            if (!permission) {

                return res.status(403).json({
                    message: "Permission denied",
                    success: false
                });
            }

            next();

        } catch (error) {

            return res.status(500).json({
                message: error.message,
                success: false
            });
        }
    };
};

module.exports = {
    checkPermissionMiddleware
};