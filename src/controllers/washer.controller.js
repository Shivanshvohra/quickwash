const washerService = require('../services/washer.service');
const orderstatusService = require('../services/orderStatus.service');
const { sequelize } = require('../models');
const issueService = require('../services/issue.service');
const dailyEntryService = require('../services/dailyEntryService');
const chemicalService = require('../services/chemical.service');

const loginWasher=async(req,res)=>{

    try{
        const loginId = (req.body.loginId).trim();

        const password = (req.body.password).trim();


        if(!loginId || !password){
            return res.status(400).json({
                message:"id and password required"
            });
        }

        const data = await washerService.loginWasher(loginId,password);

        return res.status(200).json({
            message:"logged in successfully",
            status:"true",
            data : data
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

};

const updateOrderstatus=async(req,res)=>{
    try{

        const orderId = req.body.orderId;
        const status = req.body.status.toUpperCase();

        if(!orderId || !status){
            return res.status(400).json({
                message:"inputs missing"
            })
        }

        const update = await orderstatusService.updateOrderstatus(orderId,status);

        return res.status(200).json({
            message : update,
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
}

const getOrderHistory = async(req,res)=>{
    try{

        const washerId = req.body.washerId;

        const data = await washerService.getOrders(washerId);

        return res.status(200).json({
            message : "orders fetched succesfully",
            status : "true",
            data : data
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const getOrderDetails = async (req,res)=>{
    try{
        const washerId = req.body.washerId;

        const orderId = req.body.orderId;

        const protocol = req.protocol;

        const host = req.get('host');

        const data = await washerService.getOrderDetails(washerId,orderId,protocol,host);

        return res.status(200).json({
            message : "order details fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const addIssue=async(req,res)=>{
    try{
        const {orderId,productId,description,washerId} = req.body;
        const submittedByType = 'WASHER';

        await issueService.addIssue(orderId,productId,description,submittedByType,washerId);

        return res.status(200).json({
            message : "issue raised successfully",
            status : "true"
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
};

const addEntry = async(req,res)=>{
    const t = await sequelize.transaction();

    try{
        await dailyEntryService.addEntry(req.body,t);
        await t.commit();
        return res.status(200).json({
            message:"entry added",
            status:"true"
        })
    }catch(error){
        await t.rollback();

        return res.status(201).json({
            message : error.message,
            status : false
        })
    }
};

const lastDaysOpening = async(req,res)=>{

    try{

        const washerId = req.body.washerId;

        const date = req.body.date;

        const data = await dailyEntryService.lastDaysOpening(washerId,date);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}


const addChemicals = async(req,res)=>{

    try{

        await chemicalService.addChemicals(req.body);

        return res.status(200).json({
            message : "list updated successfully",
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }

}

const issueHistory=async(req,res)=>{

    try{

        const id = req.body.washerId;

        const data = await issueService.issueHistory(id,"WASHER");

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const issueDetails=async(req,res)=>{

    try{

        const orderId = req.body.orderId;

        const washerId = req.body.washerId;

        const protocol = req.protocol;

        const host = req.get('host');

        const data = await issueService.issueDetailsWasher(orderId,washerId,protocol,host);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const getWashers=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const Date = req.body.Date

        const result = await washerService.getWashers(washerId,Date);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            //data : data
			total_present: result.total_present,
			total_absent: result.total_absent,
			data: result.data 
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }

}

const setAttendance=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const washers = req.body.washers;
        const date = req.body.date;

        const message = await washerService.setAttendance(washerId,date,washers);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });

    }

}

const getListOfUniversities=async(req,res)=>{

    try{

        const type = req.body.type;

        const data = await washerService.getListOfUniversities(type);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });

    }
}

const washerInfo=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
		const protocol=req.protocol;
        const host = req.get('host');

        const data = await washerService.getWasherInfo(washerId, protocol, host);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const getItemsInOrder=async(req,res)=>{

    try{

        const orderId = req.body.orderId;

        const data = await washerService.getItemsInOrder(orderId);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const lastChemicalOpening=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const month = req.body.month;
        const year = req.body.year;

        const data = await washerService.lastChemicalOpening(washerId,month,year);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}


const logoutUIWasher=async(req,res)=>{

    try{
        const washerId = req.body.washerId;
        const message = await washerService.logoutUIWasher(washerId);
        return res.status(200).json({
            message : message,
            status : "true"
        })
    }catch(error){  
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }

}

const getDefectedWasherHistory=async(req,res)=>{
    try{
        const washerId = req.body.washerId;
        const status = req.body.status;
        const protocol=req.protocol;
        const host = req.get('host');
        const normalizedstatus = status.trim().toLowerCase();

        const data = await washerService.getDefectedWasherHistory(washerId,normalizedstatus,protocol,host);
        return res.status(200).json({
            message : "data fetched succesfully",
            status : "true",
            data : data
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}



const updateWasherProfile=async(req,res)=>{

    try{
        if(!req.body.washerId){
            return res.status(201).json({
                message:'washerId missing'
            })
        }

        if(!req.body.name){
            return res.status(201).json({
                message:'name missing'
            })
        }

        if(req.file){
            const image = req.file.filename;
            req.body.image = image;
        }

        const updatedWasher = await washerService.updateWasherProfile(req.body);
        return res.status(200).json({
            message:updatedWasher,
            status:"true"
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

}

const resetPassword=async(req,res)=>{

    try{

        const washerId = req.body.washerId;

        const message = await washerService.resetPassword(washerId);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const chemicalDropdown=async(req,res)=>{

    try{

        const data = await chemicalService.chemicalDropdown();

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const getOrdersList=async(req,res)=>{

    try{

        const laundryBagNumber = req.body.laundryBagNumber;

        const data = await washerService.getOrdersList(laundryBagNumber);

        return res.status(200).json({
            message : "list fetched succesfully",
            status:"true",
            data:data
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}



module.exports={
    loginWasher,
    updateOrderstatus,
    getOrderHistory,
    getOrderDetails,
    addIssue,
    addEntry,
    addChemicals,
    issueHistory,
    issueDetails,
    getWashers,
    setAttendance,
    lastDaysOpening,
    getListOfUniversities,
    washerInfo,
    getItemsInOrder,
    lastChemicalOpening,
	logoutUIWasher,
	getDefectedWasherHistory,
	updateWasherProfile,
    resetPassword,
    chemicalDropdown,
    getOrdersList
}