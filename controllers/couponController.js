const Coupon = require("../model/couponModel")
const asyncHandler = require("express-async-handler")

const couponController={
  
 createCoupon: asyncHandler(async(req,res)=>{
  try {
    const newCoupon = await Coupon.create(req.body)
    res.json(newCoupon);
  } catch (error) {
    throw new Error(error)
  }
}),
 getAllCoupon: asyncHandler(async(req,res)=>{
  try {
    const coupons = await Coupon.find()
    res.json(coupons);
  } catch (error) {
    throw new Error(error)
  }
}),
 updateCoupon: asyncHandler(async(req,res)=>{

  try {
    const coupon = await Coupon.findById(req.params.id)
    if(!coupon){
      res.status(404);
      throw new Error("No such coupon found")
    }
    const updatedCoupons = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true})
    res.json(updatedCoupons);
  } catch (error) {
    throw new Error(error)
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

}
module.exports = couponController;
