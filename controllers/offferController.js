const asyncHandler = require("express-async-handler");
const Offer = require("../model/offerModel");

const offerController = {
  addOffer: asyncHandler(async (req,res)=> {
   console.log("added offer",  req.body);
   console.log("adder",  req.files.image[0]);


    try {
      const{name,description} = req.body
      
    const offer = new Offer({
      name,
      description,
      image: req.files.image[0],
    });
  
      const savedOffer = await offer.save();
      console.log(savedOffer);
      console.log("saved");
      res.redirect("/admin/offer")
     
    } catch (err) {
      console.log(err);
      res.status(404)
      throw new Error("not found")
    }
  }),

  getOffer: asyncHandler(async (req,res)=>{
    try {

      const offer = await Offer.find().lean()
      console.log(offer);
      res.render("admin/bannerManagement",{offer})
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }

  }),
  getAddOffer: asyncHandler(async (req,res)=>{
      res.render("admin/addBanner")

  }),
  getEditOffer: asyncHandler(async (req,res)=>{
    try {
      const offer = await Offer.findById(req.params.id).lean()

      console.log(offer);
      res.render("admin/editBanner",{offer})

    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    } 

  }),


  updateOffer: asyncHandler(async (req,res)=> {

  const{name,description,discount,startDate,endDate} = req.body
      const id = req.params.id
try {
 
  const updatedOffer = await Offer.updateOne({_id:id},
    {$set:
      { name:name, description,
        image: req.files?.image?.[0],
      }
    })

  console.log(updatedOffer);
  res.redirect("/admin/offer")
  
  
} catch (error) {
  console.log(error);
  res.status(404)
  throw new Error("not found");

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

  }),
  listOffer: asyncHandler(async(req,res)=>{
      
    try {
          
    const offer = await Offer.findByIdAndUpdate(req.params.id,
      {
        $set:{unlist:false}
      },{new:true})
    
      res.redirect("/admin/offer")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("cant update")
    }
  
  }),
  unlistOffer: asyncHandler(async(req,res)=>{
    try {        
    const offer = await Offer.findByIdAndUpdate(req.params.id,
      {
        $set:{unlist:true}
      },{new:true})

      res.redirect("/admin/offer")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("cant update")
    }
  }),

}


module.exports = offerController;