// const { request } = require("express");
// const asyncHandler = require("express-async-handler")
// const Cart = require("../model/cartModel")
// const Product = require("../model/productModel")


// const cartController = {
//   addToCart: async (req, res) => {
//     const { productId } = req.body;
// const quantity = Number.parseInt(req.body.quantity)

//     try {
//       let cart = await Cart.findOne().populate({
//         path: "items.productId",
//         select: "name price total"

//       })

//       let productDetails = await Product.findById(productId)
//       if (!productDetails) {
//         res.status(500).json({ type: "not Found", message: "Invalid request" })
//       }

//       //--If Cart Exists ----
//       if (cart) {
//         //---- Check if index exists ----
//         const indexFound = cart.items.findIndex(item => item.productId.id == productId);
//         //------This removes an item from the the cart if the quantity is set to zero, We can use this method to remove an item from the list  -------
//         if (indexFound !== -1 && quantity <= 0) {
//           cart.items.splice(indexFound, 1);
//           if (cart.items.length == 0) {
//             cart.subTotal = 0;
//           } else {
//             cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
//           }
//         }

//         //----------Check if product exist, just add the previous quantity with the new quantity and update the total price-------
//         else if (indexFound !== -1) {
//           cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
//           cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
//           cart.items[indexFound].price = productDetails.price
//           cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
//         }
//         //----Check if quantity is greater than 0 then add item to items array ----
//         else if (quantity > 0) {
//           cart.items.push({
//             productId: productId,
//             quantity: quantity,
//             price: productDetails.price,
//             total: parseInt(productDetails.price * quantity)
//           })
//           cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
//         }
//         //----If quantity of price is 0 throw the error -------
//         else {
//           res.status(400).json({
//             type: "Invalid",
//             message: "Invalid request"
//           })
//         }
//         let data = await cart.save();
//         res.status(200).json({
//           type: "success",
//           mgs: "Process successful",
//           data: data
//         })
//       }
//       //------------ This creates a new cart and then adds the item to the cart that has been created------------
//       else {
//         const cartData = {
//           items: [{
//             productId: productId,
//             quantity: quantity,
//             total: parseInt(productDetails.price * quantity),
//             price: productDetails.price
//           }],
//           subTotal: parseInt(productDetails.price * quantity)
//         }
//         cart = await Cart.create(cartData)

//         res.json(cart);
//       }

//     } catch (error) {
//       console.log(error);
//       res.status(400).json({
//         type: "invalid",
//         message: "Something Went Wrong"
//       })


//     }

//   },
//   getAllCart: async (req, res) => {

//     try {
//       const cart = await Cart.find()
//       res.status(200).json(cart)

//     } catch (error) {
//       res.status(500)
//       res.json({
//         type: "not found",
//         message: "invalid request"

//       })
//     }

//   },
//   deleteCart: async (req, res) => {
//   try {
//     let cart = await Cart.findOne().populate({
//       path: "items.productId",
//       select: "name price total"

//     })

//     cart.items = [];
//     let data = await cart.save();
//     res.status(200).json({
//       type: "success",
//       mgs: "Cart has been emptied",
//       data: data
//     })
//   } catch (error) {
//     console.log(error);
//   }

//   }

// }


// module.exports = cartController;

const asyncHandler = require("express-async-handler")
const Cart = require("../model/cartModel")
const Product = require("../model/productModel")
const User = require("../model/userModel")
const Coupon = require("../model/couponModel")


const cartController = {


  userCart: asyncHandler(async (req, res) => {
    // res.render("cartpage")
    const id = req.user;
    // res.json(id)
    const cart = req.body;

    console.log("req.body", req.body);

    try {
      let products = []
      const user = await User.findById(id)
      // alreadyExistCart= await Cart.findOne({orderby :user._id})
      // console.log("no items in cart",alreadyExistCart)

      // if(alreadyExistCart){
      //    alreadyExistCart.remove();
      // }


      // console.log("inside loop");
      let object = {};
      console.log(cart.id);
      object.product = cart.id;
      object.quantity = Number.parseInt(cart.quantity)
      object.color = cart.color;
      let getPrice = await Product.findById(cart.id).select('price').exec()
      console.log("get price", getPrice);
      object.price = getPrice.price;
      // console.log("objexcft",object);
      products.push(object)


      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        console.log("product price", products[i].price);
        console.log("product quantity", products[i].quantity);
        cartTotal = cartTotal + products[i].price * products[i].quantity
      }
      console.log("cartTotal", cartTotal);
      let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user._id
      }).save();
      // res.json(newCart)
      console.log(newCart);

      res.redirect("/cart")
      if (!products) {
        res.status(404)
        throw new Error("No products")
      }

    } catch (error) {
      // throw new Error(error)
      console.log(error);

    }
  }),
  getUserCart: asyncHandler(async (req, res) => {
    console.log("get cart");
    const id = req.user;
    console.log(req.user)
    try {
      const cart = await Cart.findOne({ orderby: id }).populate('products.product').lean()
      console.log("cart ", cart);
      // res.json(cart)
      res.render("cartpage", { cart })
    } catch (error) {
      res.send(error)
      throw new Error(error)
    }
  }),
  emptyCart: asyncHandler(async (req, res) => {
    const { id } = req.user;
    try {
      const cart = await Cart.findOne({ orderby: id })
      await Cart.remove()
      // await cart.remove()

      res.json(cart)

    } catch (error) {
      throw new Error(error)
    }
  }),
  deleteCartItem: asyncHandler(async (req, res) => {
    console.log("dlt cart Itm");
    const id = req.user
    const prodId = req.params.id
    const cart = await Cart.findOne({ orderby: id })
    console.log(cart);

    let deleteproduct = await Cart.updateOne(
      {_id: id},
      {
        $pull: {products:{product:prodId}},
      },
      {
        multi:true
      }
   
    );
    res.json(deleteproduct)


  }),
  applyCoupon: asyncHandler(async (req, res) => {

    const { coupon } = req.body;

    const id = req.user;

    try {
      const validCoupon = await Coupon.findOne({ name: coupon })
      console.log("1st");
      console.log(validCoupon);
      if (!validCoupon) {
        res.status(404)
        throw new Error("invalid coupon")
      }

      const { cartTotal, products } = await Cart.findOne({
        orderby: id,
      }).populate("products.product")
      console.log("its total ", cartTotal);

      let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2)
      console.log("total after disc", totalAfterDiscount)

      const newCart = await Cart.findOneAndUpdate({ orderby: id }, { totalAfterDiscount }, { new: true })

      console.log(newCart);
      res.json(totalAfterDiscount)
      // res.json(newCart)

      console.log(validCoupon);

    } catch (error) {
      console.log(error);
    }
  })

}


module.exports = cartController