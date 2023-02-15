const asyncHandler = require("express-async-handler");
const { findById } = require("../model/orderModel");
const uniqid = require("uniqid")
const Order = require('../model/orderModel')
const User = require('../model/userModel')
const Cart = require('../model/cartModel')
const Product = require('../model/productModel')

// const orderController={
//     addOrder:async(req,res)=>{

//       const{customer,items,paymentStatus,status}=req.body;
//       const order = await Order.create({
//               customer,items,paymentStatus,status
//       })

//         res.json(order)
//     },
//     getOrders:async(req,res)=>{
//       const order = await Order.find()
//       res.json({order})
//     },
//     getOrderbyId:async(req,res)=>{
//       try {
//         const order = await Order.findById(req.params.id)
//         res.status(200).json(order)
//       } catch (error) {
//         res.status(400)
//         res.json({message: "not found"})
        
//       }
//     } ,    
//     editOrder:async(req,res)=>{
//       const{customer,items,paymentStatus,status}=req.body;
//       const order = await Order.findByIdAndUpdate(req.params.id,{
//               customer,items,paymentStatus,status,
//       },{
//         new:true
//       })
      
//       res.json(order)
//       res.json({message:"edit"})

//     }

// }


const orderController= {
  createOrder: asyncHandler(async(req,res)=>{
    const {COD , couponApplied } = req.body
    const {id}=req.user;
    if(!COD){
      res.status(404)
      throw new Error("Create Cash order failed")
    }
    try {
    const user = await User.findById(id)
    let userCart = await Cart.findOne({orderby:id})
    // console.log(userCart);
    let finalAmount = 0;
    if(couponApplied&& userCart.totalAfterDiscount ){
      finalAmount = userCart.totalAfterDiscount
       
    }else{
      finalAmount = userCart.cartTotal
    }
    console.log("final amt",finalAmount);
    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id:uniqid(),
        method: "COD",
        amount: finalAmount,
        status: "Cash on Delivery",

        created:Date.now(),
        currency:"Rupees",
      },
      orderStatus:"Cash on Delivery",
      orderby:user._id

    })
    newOrder.save();

    // console.log(newOrder);
    // let update = userCart.products.map((item)=>{
    //   return{
    //     updateOne:{
    //       filter: {_id: item.product._id},
    //       update:{$inc : {quantity: -item.count, sold: +item.count } }
    //     },
    //   };
    // });
    // console.log("updated",update);
    
    // const updated = await Product.bulkWrite(update,{})
    res.json({message:"success"})
    // console.log(updated); 

    } catch (error) {
      console.log(error);
    }
  }),
  getOrder:asyncHandler(async(req,res)=>{
    const {id}=req.user;

    try {
      const order = await Order.findOne({orderby:id}).populate('products.product').exec()
    } catch (error) {
      console.log(error);
    }

       res.json(order)

  }),
  updateOrder:asyncHandler(async(req,res)=>{
    const {status}=req.body
    const{id}=req.params

    const updatedOrder = await Order.findByIdAndUpdate(id,
      {
        orderStatus:status,
      paymentIntent: {
        status:status,
      }
    },
      {new:true})

    res.json(updatedOrder)



  })

}


module.exports= orderController;