const cartService = require('../services/cart.service');
const catalogService = require('../services/catalog.service');

const addToCart=async(req,res)=>{

    const userId = req.body.userId;
    const productId = req.body.productId;

    if(!userId || !productId){
        return res.status(201).json({
            message:"userId/productId missing",
            status:"false"
        })
    }

    try{

        await cartService.addToCart(userId,productId);

        return res.status(200).json({
            message:"Item added to Cart",
            status:"true"
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        })
    }

};

const reduceFromCart=async(req,res)=>{

    const userId = req.body.userId;
    const productId = req.body.productId;

    if(!userId || !productId){
        return res.status(201).json({
            message:"userId/productId missing",
            status:"false"
        })
    }

    try{

        await cartService.reduceFromCart(userId,productId);
        
        return res.status(200).json({
            message:"Cart Updated",
            status:"true"
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        })
    }

};

const deleteFromCart=async(req,res)=>{

    const userId = req.body.userId;
    const productId = req.body.productId;

    if(!userId || !productId){
        return res.status(201).json({
            message:"userId/productId missing",
            status:"false"
        })
    }

    try{

        await cartService.deleteFromCart(userId,productId);
        
        return res.status(200).json({
            message:"Item deleted",
            status:"true"
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        })
    }

};

const viewCart=async(req,res)=>{
	
    try{
        const userId=req.body.userId;
        if(!userId){
            return res.status(201).json({
                message:"Invalid userId",
                status:"false"
            })
        }

        const serviceType = req.body.serviceType;
        const protocol = req.protocol;
        const host = req.get('host');
        const cart = await cartService.viewCart(userId,serviceType,protocol,host);
        return res.status(200).json({
            message:"cart fetched successfully",
            status:"true",
            data:cart
        })
    }catch(error){
		return res.status(201).json({
			message : error.message,
            status : "false"
		});
    }
}

const makingCart = async(req,res)=>{
    try{
        const serviceType = req.body.serviceType;

        if(!req.body.userId){
            return res.status(201).json({
                message : "userId missing",
                status : "false"
            });
        }
        console.log(req.body.userId);

        if(!serviceType || (serviceType != "laundry" && serviceType != "paidLaundry" &&serviceType != "drycleaning" && serviceType != "ironing")){
            return res.status(201).json({
                message : "Invalid service type",
                status : "false"
            });
        }

        const validProductIds = await catalogService.getCatalogIds(serviceType);
        console.log(validProductIds);
        console.log('catalog ids fetched');
        for(const item of req.body.items){
            if(!item.productId || (item.quantity<0)){
                return res.status(201).json({
                    message : "Invalid items format",
                    status : "false"
                });
            }
            if(!validProductIds.includes(item.productId)){
                return res.status(201).json({
                    message : `Invalid productId ${item.productId}`,
                    status : "false"
                });
            }
        }
        console.log("calling service");
        const message = await cartService.makingCart(req.body);

        return res.status(200).json({
            message : message,
            status : "true",
            serviceType : serviceType
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}


module.exports={
    addToCart,
    reduceFromCart,
    deleteFromCart,
    viewCart,
    makingCart
};