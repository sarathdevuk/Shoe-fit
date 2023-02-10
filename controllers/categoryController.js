const asyncHandler = require("express-async-handler")
const Category = require("../model/categoryModel")


const categoryController = {

  createCategory: asyncHandler(async (req, res) => {
    console.log("cat req:", req.body)
    const { name } = req.body
    if (!name) {
      res.status(400);
      throw new Error("All fields are mandatory");
    }
    const category = await Category.create({
      name: req.body.name,
    })
    res.status(201).json(category)
  }),

  getAllCategory: asyncHandler(async (req, res) => {
    const cat = await Category.find();
    res.status(200).json(cat)

  }),
  getCategoryById: asyncHandler(async (req, res) => {
    try {
      const category = await Category.findById(req.params.id)
      res.status(200).json(category)
    } catch (error) {
      res.status(400)
      throw new Error("no category")
    }
  }),
  updateCategoryById: asyncHandler(async (req, res) => {

    const category = await Category.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
    }, {
      new: true
    })

    if (!category){
      res.status(404)
      throw new Error("no category found ")
    }
    res.json(category); 


  }),
  
  deleteCategoryById: asyncHandler(async(req,res)=>{
    const category = await Category.findById(req.params.id)

    if(!category){
      res.status(404)
      throw new Error("Category  not found");
    }
    await category.remove()
    res.status(200).json(category)
  })




}


module.exports = categoryController