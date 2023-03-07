const asyncHandler = require("express-async-handler")
const Product = require("../model/productModel")
const User = require("../model/userModel")
const Category = require("../model/categoryModel")


// @get all product

const productController = {

  addProduct: asyncHandler(async (req, res) => {

    const { name, description, quantity, price, mrp, category } = req.body
    console.log(req.body);
    console.log(name);

    try {

      if (!name) {
        res.status(400)
        throw new Error("All fields are mandatory")
      }
      const product = await Product.create({
        name, description, quantity, price, mrp, category,
        image: req.files.image[0],
        sideImage: req.files.sideImage
      })
      // console.log(product);
      res.status(200)
      res.redirect("/admin/product")
      // res.json(product)
    } catch (error) {
      res.status(404)
      console.log(error);
    }


  }),

  getAddProductPage: (async (req, res) => {
    const category = await Category.find().lean()
    res.render("admin/addProduct", { category })
  }),
  getEditProduct: (async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).lean()
      const category = await Category.find().lean()

      res.render("admin/editProduct", { product, category })
    } catch (error) {
      res.status(404)
      console.log(error);
    }

  }),

  getAllProduct: asyncHandler(async (req, res) => {
    try {
      const products = await Product.find().lean()
      res.render("admin/productManagement", { products })
    } catch (error) {
      res.status(404)
      throw new Error("The page not Found")
    }


  }),

  getProductById: asyncHandler(async (req, res) => {

    try {
      const product = await Product.findById(req.params.id).lean()
      const products = await Product.find().lean()

      if (!product) {
        res.status(404)
        throw new Error("product not found")
      }
      res.render("productPage", { product, products })
    } catch (error) {
      res.status(404)
      throw new Error("The products not found")
    }


  }),


  updateProductById: async (req, res) => {
    const _id = req.params.id
    const { name, price, description, quantity, mrp, category } = req.body
    console.log("imgbhjbj", req.files.image );
    try {
      const product = await Product.updateOne({ _id: _id }, {
        $set: {
          name, price, description, quantity, mrp, category,
          image: req.files?.image?.[0],
          sideImage: req.files?.sideImage
        },
      })

      res.redirect("/admin/product")
    }
    catch (error) {
      res.status(404)
      console.log(error);
      // throw new Error("Cant update product")
    }
  },

  unlistProduct: asyncHandler(async (req, res) => {
    try {
      const _id = req.params.id
       await Product.findByIdAndUpdate(_id, { $set: { unlist: true } },)
      res.redirect("/admin/product")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("Page not found")
    }
  }),
  listProduct: asyncHandler(async (req, res) => {
    try {
      const _id = req.params.id
       await Product.findByIdAndUpdate(_id, { $set: { unlist: false } },)
      res.redirect("/admin/product")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("Page not found")
    }
  }),

  deleteProductById: asyncHandler(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
      if (!product) {
        res.status(404)
        throw new Error("Product  not found");
      }
      await product.remove()
      res.status(200).json(product)
    } catch (error) {
      res.status(404)
      throw new Error("")
    }
  }),

  addToWishlist: asyncHandler(async (req, res) => {
    const id = req.user;
    const prodId = req.params.id

    try {
      const user = await User.findById(id);
      const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);

      if (alreadyadded) {
        let user = await User.findByIdAndUpdate(
          id,
          {
            $pull: { wishlist: prodId },
          },
          {
            new: true
          }
        );
        let status = false
        res.json(status)
        // res.redirect('bac'k)

      } else {
        let user = await User.findByIdAndUpdate(
          id,
          {
            $push: { wishlist: prodId },
          },
          {
            new: true
          }
        );
        const status = true
        res.json(status)
        // res.redirect('back')
      }
    } catch (error) {
      res.status(404)
      throw new Error(error)
    }


  }),
  getWishlist: asyncHandler(async (req, res) => {
    const id = req.user;
    try {
      const { wishlist } = await User.findOne({ _id: id }, { wishlist: 1 })
      console.log("wishlsit ", wishlist);

      const wishItem = wishlist.map((Item) => {
        return Item
      })
      // console.log("wish",wishItem);
      const products = await Product.find({ _id: { $in: wishItem } }).lean()

      res.render("wishlist", { products })

    } catch (error) {
      res.status(404)
      console.log(error);
    }

  }),
  deleteWishlist: asyncHandler(async (req, res) => {
    const id = req.user;
    const prodId = req.params.id

    try {
      const user = await User.findById(id);
      const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);

      if (alreadyadded) {
        let user = await User.findByIdAndUpdate(
          id,
          {
            $pull: { wishlist: prodId },
          },
          {
            new: true
          });

        res.redirect('back')
      }
    } catch (error) {
      console.log(error);
    }

  }),



}
module.exports = productController;