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
const mongoose = require("mongoose")
const { response } = require("express")
const { remove } = require("../model/cartModel")

const cartController = {


  userCart: asyncHandler(async (req, res) => {
    console.log("add to cart");

    const userId = req.user;
    const productId = req.params.id;

    try {
      // Look for cart with the given user ID
      let cart = await Cart.findOne({ orderby: userId });

      if (!cart) {
        // If cart does not exist, create a new one
        cart = await new Cart({
          products: [],
          cartTotal: 0,
          orderby: userId
        }).save();
      }

      // Check if product already exists in cart
      const productObjectId = mongoose.Types.ObjectId(productId);
      const productIndex = cart.products.findIndex(product => product.product && product.product.equals(productObjectId));

      if (productIndex !== -1) {
        // Product already exists in cart, increment quantity
        cart.products[productIndex].quantity += 1;
        
      } else {
        // Product does not exist in cart, add it with quantity 1
        const product = {
          product: productId,
          quantity: 1,
        };
        const productPrice = await Product.findById(productId).select("price").exec();       
        product.price = productPrice.price;
        cart.products.push(product);
      }

      // Update cart total
      let cartTotal = 0;
      for (const product of cart.products) {
        cartTotal += product.price * product.quantity;
      }
      cart.cartTotal = cartTotal;

      await cart.save();
      res.redirect("/cart")
      // res.json(cart);
    } catch (error) {
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
      { _id: id },
      {
        $pull: { products: { product: prodId } },
      },
      {
        multi: true
      }

    );
    console.log("deleted  Product",deleteproduct);
      res.redirect("/cart")
    // res.json(deleteproduct)


  }),
  changeQuantity: asyncHandler(async (req, res) => {
    const userId = req.user;
const {  cartId, prodId, count, quantity  } = req.body;
console.log("count",count );
console.log("quantity",quantity );
try {
  const parsedCount = parseInt(count);
  console.log(parsedCount);
  const productObjectId = mongoose.Types.ObjectId(prodId);

  let cart = await Cart.findOne({ orderby: userId });

  if(count==-1&& quantity==1 ){
    console.log("inside loop");
    console.log("cartid",cart._id);
    console.log("prodId",prodId);
     const removeProduct =  await Cart.findByIdAndUpdate(cart._id,
        {
          $pull:{products:{product:prodId}}
        },{new:true} ) 
        let notRemove=false
        console.log('product removed');
        console.log( "rempovsdfdsf",removeProduct);
        res.json(notRemove)

  }else{

    const productIndex = cart.products.findIndex(product => product.product && product.product.equals(productObjectId));

    if (productIndex === -1) {
      res.status(404)
      throw new Error('Product not found');
    }
  
    cart.products[productIndex].quantity += parsedCount;
  
    const cartTotal = cart.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
      if(cart.totalAfterDiscount){
     let price = cart.products[productIndex].price*parsedCount
     cart.totalAfterDiscount += price;
     cart.totalAfterDiscount = Number(cart.totalAfterDiscount.toFixed(2));
     console.log("price",cart.totalAfterDiscount);

      }
    
    cart.cartTotal = cartTotal;
  
    const updatedCart = await Cart.findByIdAndUpdate(
      cart._id,
      { products: cart.products, cartTotal: cart.cartTotal, totalAfterDiscount:cart?.totalAfterDiscount },
      { new: true }
    );
  
    console.log('Updated cart:', updatedCart);
   let remove =false;

    res.json(updatedCart);

  }
  

 
} catch (error) {
  console.log('Error:', error.message);
  res.status(400).json({ error: error.message });
}





  }),

  applyCoupon: asyncHandler(async (req, res) => {

    const { coupon } = req.body;
    console.log(req.body);
    const id = req.user;

    try {
      const validCoupon = await Coupon.findOne({ name: coupon,unlist:false })
      
      console.log(validCoupon);
      if (!validCoupon) {
        res.render("cartpage",{error:true,message:"Invalid Coupon"})
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
      // res.json(totalAfterDiscount)
      // res.json(newCart)
      res.redirect("/cart")

      console.log(validCoupon);

    } catch (error) {
      console.log(error);
    }
  })

}


module.exports = cartController