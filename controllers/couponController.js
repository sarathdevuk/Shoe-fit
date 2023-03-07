const Coupon = require("../model/couponModel")
const asyncHandler = require("express-async-handler")

const couponController={
 
getAddCoupon: asyncHandler(async(req,res)=>{
    res.render("admin/addCoupon")
}),

 createCoupon: asyncHandler(async(req,res)=>{

  
  try {
    const newCoupon = await Coupon.create(req.body)
    
    console.log(newCoupon);
    res.redirect("/admin/coupon")
  } catch (error) {
    if(error.code==11000){
      res.render("admin/addCoupon", {error:true, message:"The Coupon Already Exist..!"})
    }else{
      console.log(error);
      res.status(404)
      throw new Error("Not Found")
    }
   
  }
}),
 getAllCoupon: asyncHandler(async(req,res)=>{
  try {
    const coupon = await Coupon.find().lean()
    for (const i of coupon) {
      i.expiry=new Date(i.expiry).toLocaleDateString()
    }

    res.render("admin/couponManagement",{coupon})
  } catch (error) {
    throw new Error(error)
  }
}),
getEditCoupon:asyncHandler(async(req,res)=>{
try {
  const coupon = await Coupon.findById(req.params.id).lean()
  console.log("coupon",coupon);
  res.render("admin/editCoupon",{coupon})
} catch (error) {
  console.log(error);
  res.status(404)
  throw new Error("Page not Found")
}
}),
 updateCoupon: asyncHandler(async(req,res)=>{

  try {
    const coupon = await Coupon.findById(req.params.id)
    if(!coupon){
      res.status(404);
      throw new Error("No such coupon found")
    }
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true})
      console.log("updated",updatedCoupon);
   res.redirect("/admin/coupon")

  } catch (error) {
    if(error.code==11000){
      res.render("admin/addCoupon", {error:true, message:"The Coupon Already Exist..!"})
    }else{
      console.log(error);
      res.status(404)
      throw new Error("Not Found")
    }
  }
}),deleteCoupon: asyncHandler(async(req,res)=>{
  try {
    const coupon = await Coupon.findById(req.params.id)
    if(!coupon){
      res.status(404)
      throw new Error("404 no coupon found")
    }
    await coupon.remove();
    res.status(20).json(coupon);
  } catch (error) {
    throw new Error(error)
  }
}),
listCoupon: asyncHandler(async(req,res)=>{

  try {
        
  const coupon = await Coupon.findByIdAndUpdate(req.params.id,
    {
      $set:{unlist:false}
    },{new:true})
    console.log("lisdt",coupon);
    res.redirect("/admin/Coupon")
  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("cant update")
  }

}),
unlistCoupon: asyncHandler(async(req,res)=>{
  console.log("unlistCoupon");
  try {        
  const coupon = await Coupon.findByIdAndUpdate(req.params.id,
    {
      $set:{unlist:true}
    },{new:true})
    console.log("list",coupon);
    res.redirect("/admin/Coupon")
  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("cant update")
  }
}),



}
module.exports = couponController;
