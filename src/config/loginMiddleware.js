const { LoggedOutUser, User } = require("../models");
const { loggedOut } = require("../services/loggedOutUser.service");

const loginMiddleware = async(req,res,next)=>{

    try{
        console.log('reached midlleware');
        const userId = req.body.userId;

        if(!userId){
            return res.status(201).json({
                message : "user id required",
                status : "false"
            })
        }

        const loggedOut = await LoggedOutUser.findOne({
            where:{
                userId : userId
            }
        });

        if(loggedOut){
            if(loggedOut.isLoggedOut === '0'){
                return res.status(201).json({
                    message : "log in required",
                    status : "false"
                })
            }

        }

        const disabled = await User.findOne({
            where : {
                id : userId,
                status : 'disable'
            }
        })

        if(disabled){
            return res.status(201).json({
                message : "user disabled",
                status : "false"
            });
        }

        next();

    }catch(error){
        console.log("middleware threw error");
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }

}

module.exports = {
    loginMiddleware
}