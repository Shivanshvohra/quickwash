const LoggedOutUser = require("../models/index").LoggedOutUser;

const loggedOut=async(userId)=>{
    if(!userId){
        throw new Error("user id required");
    }

    await LoggedOutUser.upsert({
        userId : userId,
        isLoggedOut : '0'
    })

    return;
}

const loggedIn=async(userId)=>{
    if(!userId){
        throw new Error("user id required");
    }

    await LoggedOutUser.upsert({
        userId : userId,
        isLoggedOut : '1'
    })

    return;
}

module.exports={
    loggedOut,
    loggedIn
}