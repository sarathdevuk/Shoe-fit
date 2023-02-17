const asyncHandler = require("express-async-handler")
const { get } = require("mongoose")
const Product = require("../model/productModel")
const User = require("../model/userModel")


// @get all product

const productController = {

  addProduct: asyncHandler(async (req, res) => {

    const { name, description, quantity, price } = req.body
    console.log(req.body);
    console.log(name);

    try {

      if (!name) {
        res.status(400)
        throw new Error("All fields are mandatory")
      }
      const product = await Product.create({
        name, description, quantity, price,
        image: req.files.image[0],
        sideImage: req.files.sideImage
      })
      res.status(200).json(product)

    } catch (error) {
      console.log(error);
    }


  }),

  //   addProduct : async(req, res)=> {
  //     const { name , price , description, quantity } = req.body

  //     let product =  new Product({
  //         name, price, description, quantity,
  //         image: req.files.image[0],
  //         sideImage: req.files.sideImage
  //     })
  //     await product.save()
  //     res.json(product)
  // },



  getAllProduct: asyncHandler(async (req, res) => {
    const product = await Product.find()
    res.json(product)
  }),

  getProductById: asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).lean()
    const products = await Product.find().lean()
    // console.log(product);
    if (!product) {
      res.status(404)
      throw new Error("product not found")
    }
    res.render("productPage", {product,products})
    // res.status(200).json(product)
  }),

  // updateProductById:asyncHandler(async(req,res)=>{


  // const updatedProduct= await Product.findByIdAndUpdate(req.params.id,req.body,{new:true})
  //   if(!updatedProduct){` `
  //       res.status(404)
  //       throw new Error("no Product found")
  //   }
  //   res.json(updatedProduct)

  // }),

  updateProductById: async (req, res) => {
    const _id = req.params.id
    const { name, price, description, quantity } = req.body

   const product= await Product.updateOne({ _id: _id }, {
      $set: {
        name, price, description, quantity,
        image: req.files.image[0],
        sideImage: req.files.sideImage
      },
    })
    res.json(product)
    console.log(product)
  },

  deleteProductById: asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
      res.status(404)
      throw new Error("Product  not found");
    }
    await product.remove()
    res.status(200).json(product)
  }),

  addToWishlist: asyncHandler(async(req,res)=>{
    const {id}=req.user;
    // console.log("id",id)
    const {productId}=req.body
    // console.log(req.body);
    try {
      const user=await User.findById(req.user.id);
      console.log("The user",user);
      const alreadyadded= user.wishlist.find((id)=> id.toString()===productId);  

      if(alreadyadded){
        let user = await User.findByIdAndUpdate(
          id,
          {
            $pull:{wishlist:productId},
          },
          {
            new:true
          }
        );
        res.json({user})
      }else{
        let user = await User.findByIdAndUpdate(
          id,
          {
            $push:{wishlist:productId},
          },
          {
            new:true
          }
        );
        res.json({user})
      }
    } catch (error) {
    console.log(error);    
    }


  }),
  getWishlist: asyncHandler(async(req,res)=>{
    const id=req.user;
    try {
      const {wishlist} = await User.findById(id) 
      console.log(wishlist);
      res.json(wishlist)

    } catch (error) {
      
    }
 
  

  })


}

module.exports = productController;