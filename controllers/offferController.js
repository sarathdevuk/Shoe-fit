const asyncHandler = require("express-async-handler");
const Offer = require("../model/offerModel");

const offerController = {
  addOffer: asyncHandler(async (req,res)=> {
    // res.json({msg: "its working"})
      const{name,description,discount,startDate,endDate} = req.body

    const offer = new Offer({
      name,
      description,
      discount,
      startDate,
      endDate,
    });
  
    try {
      const savedOffer = await offer.save();
      res.status(201).json(savedOffer);
    } catch (err) {
      res.status(400).json(err);
    }
  }),

  updateOffer: asyncHandler(async (req,res)=> {
    // res.json({msg: "its working"})
      // const{name,description,discount,startDate,endDate} = req.body
try {
  
  const offer = await Offer.findById(req.params.id)
  console.log(offer);
  const updatedOffer = await Offer.findByIdAndUpdate(offer._id,req.body,{new:true})
  res.status(200).json(updatedOffer)
} catch (error) {
  console.log(error);
}

  }),
  deleteOffer: asyncHandler(async(req,res)=>{
    // res.json({mesf: "done"})
    try {
      const deletedOffer = await offer.remove(req.params.id)
      res.status(200).json(deletedOffer)
    } catch (error) {
      console.log(error);
    }

  })
}

module.exports = offerController;