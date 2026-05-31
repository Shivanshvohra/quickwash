const { AppImages } = require("../models");

const editImages=async({imageId,title,subTitle,imageUrl})=>{
    if(!imageId){
        throw new Error('image id required');
    }

    const check = await AppImages.findOne({
        where :{
            id : imageId,
            status : 'active'
        }
    })
    if(!check){
        throw new Error("no such image found");
    }

    let updateClause = {}

    if(title){
        updateClause.title=title
    }

    if(subTitle){
        updateClause.subTitle=subTitle
    }

    if(imageUrl){
        updateClause.image=imageUrl
    }

    await check.update(updateClause);

    return "updated successfully";
}

const makeBannerActive=async(id,name)=>{

    if(!id || !name){
        throw new Error('incomplete inputs');
    }

    if(!['outer_1','outer_2','outer_3','inner_1','inner_2','inner_3'].includes(name)){
        throw new Error('incorrect name');
    }

    const check = await AppImages.findOne({
        where : {
            id,
            status : 'inactive'
        }
    });

    if(!check){
        throw new Error('image not found');
    }

    const previousBanner = await AppImages.findOne({
        where : {
            name,
            status : 'active'
        }
    });

    await previousBanner.update({
        status : 'inactive'
    })

    await check.update({
        name:name,
        status : 'active'
    })

    return "banner activated successfully";
}

const fetchAllImages=async(protocol,host)=>{

    const images = await AppImages.findAll({
        where : {
            status : 'active'
        },
        order:[['name','ASC']]
    });
    const formattedUrl = `${protocol}://${host}/uploads/`;

    const formattedImages = images.map(image=>{
        return {
            id:image.id,
            name:image.name,
            image:formattedUrl+image.image,
            title:image.title?image.title:"N/A",
            subTitle:image.subTitle?image.subTitle:"N/A"
        }
    })
    return formattedImages;
}

module.exports={
    editImages,
    fetchAllImages,
    makeBannerActive
}