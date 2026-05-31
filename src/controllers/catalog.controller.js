const catalogService=require('../services/catalog.service');

const getCatalog=async(req,res)=>{
    try{
        const type = req.body.type;
        if(!type){
            return res.status(201).json({
                message:"Type required",
                status:"false"
            })
        }
        const userId = req.body.userId;
        if(!userId){
            return res.status(201).json({
                message:"userId required",
                status:"false"
            })
        }
        const productType = req.body.productType;
        const protocol = req.protocol;
        const host = req.get('host');
        const catalog = await catalogService.getCatalog(userId,type,protocol,host,productType);
        res.status(200).json({
            message:'Catalog retrieved successfully',
            status:"true",
            data:catalog
        });
    }catch(error){
        res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
};

module.exports={
    getCatalog
};