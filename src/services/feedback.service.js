const Feedback = require('../models').Feedback;

const addFeedback=async(userId,rating,description)=>{

    if(!userId || !rating){
        throw new Error("userId and rating required");
    }

    if(typeof userId !== "number"){
        throw new Error("incorrect type");
    }

    const createField = {
        userId:userId
    };

    if(rating){
        createField.rating=rating;
    }

    if(description){
        createField.description=description;
    }

    await Feedback.create(createField);

    return "Details updated successfully";

};

module.exports={
    addFeedback
}