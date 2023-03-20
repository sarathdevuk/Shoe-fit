

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

    try {
      const cart = await Cart.findOne({ orderby: id }).populate('products.product').lean()

      if (req.session.invalidCoupon) {

        res.render("cartpage", { error: true, message: "Invalid Coupon", cart })
        req.session.invalidCoupon = null
      } else if (req.session.expired) {

        res.render("cartpage", { error: true, message: "Coupon Expired", cart })
        req.session.expired = null
      } else if (req.session.outOfStock) {
        console.log(req.session.outOfStockProducts[0]);
        res.render("cartpage",
          {
            err: true,
            outOfStock: req.session.outOfStockProducts[0],
            message: "Out Of stock", cart
          })
        req.session.outOfStock = null
        req.session.outOfStockProducts = null
      } else
        res.render("cartpage", { cart })
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }
  }),

  deleteCartItem: asyncHandler(async (req, res) => {

    try {
      const cart = await Cart.findOne({ orderby: req.user });

      const removedProduct = cart.products.find(product => product.product == req.params.id);

      let discount = cart.totalAfterDiscount ? 100 * (cart.cartTotal - cart.totalAfterDiscount) / cart.cartTotal : 0

      console.log("Your answer is", discount);

      const updatedCartTotal = cart.cartTotal - (removedProduct.price * removedProduct.quantity);

      let updatedTotalAfterDiscount = cart.totalAfterDiscount ? (updatedCartTotal - (updatedCartTotal * discount) / 100).toFixed(2) : cart.totalAfterDiscount

      console.log(updatedCartTotal);
      // const updatedTotalAfterDiscount = cart.totalAfterDiscount ? (cart.totalAfterDiscount - cart.cartTotal - ((removedProduct.price * removedProduct.quantity) )/100): cart.totalAfterDiscount;

      const updatedCart = await Cart.findByIdAndUpdate(
        cart._id,
        {
          $set: {
            cartTotal: updatedCartTotal,
            totalAfterDiscount: updatedTotalAfterDiscount
          },
          $pull: {
            products: { product: removedProduct.product }
          }
        },
        { new: true }
      );

      console.log(updatedCart);

      res.redirect("/cart")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")

    }

  }),
  changeQuantity: asyncHandler(async (req, res) => {
    const userId = req.user;
    const { cartId, prodId, count, quantity } = req.body;

    console.log("count", prodId);
    console.log("quantity", quantity);
    try {
      const parsedCount = parseInt(count);
      console.log(parsedCount);
      const productObjectId = mongoose.Types.ObjectId(prodId);

      let cart = await Cart.findOne({ orderby: userId });

      if (count == -1 && quantity == 1) {

        let notRemove = false
        res.json(notRemove)

      } else {

        const productIndex = cart.products.findIndex(product => product.product && product.product.equals(productObjectId));

        if (productIndex === -1) {
          res.status(404)
          throw new Error('Product not found');
        }

        cart.products[productIndex].quantity += parsedCount;

        const cartTotal = cart.products.reduce((total, product) => {
          return total + (product.price * product.quantity);
        }, 0);
        if (cart.totalAfterDiscount) {
          let price = cart.products[productIndex].price * parsedCount

          let discount = 100 * (cart.cartTotal - cart.totalAfterDiscount) / cart.cartTotal

          cart.totalAfterDiscount = (cartTotal - (cartTotal * discount) / 100).toFixed(2)


          cart.totalAfterDiscount = Number(cart.totalAfterDiscount.toFixed(2));
          console.log(" disc price", cart.totalAfterDiscount);

        }

        cart.cartTotal = cartTotal;

        const updatedCart = await Cart.findByIdAndUpdate(
          cart._id,
          { products: cart.products, cartTotal: cart.cartTotal, totalAfterDiscount: cart?.totalAfterDiscount },
          { new: true }
        );

        console.log('Updated cart:', updatedCart);
        let remove = false;

        res.json(updatedCart);

      }



    } catch (error) {
      console.log('Error:', error.message);
      res.status(404).json({ error: error.message });
    }





  }),

  applyCoupon: asyncHandler(async (req, res) => {

    const { coupon } = req.body;
    console.log(req.body);
    const id = req.user;

    try {
      const validCoupon = await Coupon.findOne({ name: coupon, unlist: false })
      console.log(validCoupon);
      if (!validCoupon) {
        req.session.invalidCoupon = true;
        res.redirect("/cart")
        throw new Error("invalid")
      }
      const currentDate = new Date();
      const expirationDate = new Date(validCoupon.expiry);
      if (expirationDate < currentDate) {
       
        req.session.expired = true
        res.redirect("/cart")
        throw new Error("expired")
      }
     
      req.session.discount=validCoupon.discount;

      const { cartTotal, products } = await Cart.findOne({
        orderby: id,
      }).populate("products.product")


      let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2)


      let x = 100 * (cartTotal - totalAfterDiscount) / cartTotal


      const newCart = await Cart.findOneAndUpdate({ orderby: id }, { totalAfterDiscount }, { new: true })

      console.log(newCart);

      res.redirect("/cart")



    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }
  }),
  emptyCart: asyncHandler(async (req, res) => {
    try {
      const id = req.user
      const cart = await Cart.findOne({ orderby: id })
      cart.remove()
      res.redirect("/cart")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }
  }),

  applyWallet: asyncHandler(async (req, res) => {
    try {
      const userId = req.user;
      const { wallet } = req.body;
      
      const [user, cart] = await Promise.all([
        User.findById(userId, { wallet: 1 }),
        Cart.findOne({ orderby: userId })
      ]);
    
      const total = cart.totalAfterDiscount || cart.cartTotal;
      const newCartTotal = total - wallet;
    
      if (wallet > user.wallet) {
        req.session.noWallet = true;
        return res.redirect('/checkout');
      }
    
      if (wallet > total) {
        req.session.walletHigh = true;
        return res.redirect('/checkout');
      }
    
      cart.totalAfterDiscount = newCartTotal;
      cart.walletAmount = wallet ;
      await cart.save();
    
      user.wallet -= wallet;
      await user.save();
    
      res.redirect('back');
    
    }
     catch(error) {
    console.error(error)
    res.status(404)
    throw new Error("Error With Your Wallet")

  }

})

}


module.exports = cartController