const feedbackService = require('../services/feedback.service');

const addFeedback=async(req,res)=>{

    try{
        if(!req.body.userId){
            return res.status(201).json({
                message:"userId not recieved",
                status:"false"
            })
        }

        if(!req.body.rating){
            return res.status(201).json({
                message:"rating not recieved",
                status:"false"
            })
        }

        const addFeedback = await feedbackService.addFeedback(req.body.userId,req.body.rating,req.body.description);

        return res.status(200).json({
            message:addFeedback,
            status : "true"
        })

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

};

module.exports={
    addFeedback
}