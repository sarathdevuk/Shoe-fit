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
    try {
      const category = await Category.find().lean()
      res.status(200).render("admin/categoryManagement",{category})
    } catch (error) {
      
    }
   

  }),
  getCategoryById: asyncHandler(async (req, res) => {
    try {
      const category = await Category.findById(req.params.id).lean()
      console.log( "category",category);
      res.status(200).render("editAddress",{category})
    } catch (error) {
      res.status(404)
      throw new Error("no category")
    }
  }),
  updateCategoryById: asyncHandler(async (req, res) => {
    console.log(req.body);
    try {
      const alreadyExist = await Category.find({name:req.body.name})
      if(alreadyExist){
        res.render("admin/editAddress",{error:true ,message: "Category already Exist",category:true})
      }

      const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
      }, {
        new: true
      })
      console.log("catr",category);

      res.redirect("/admin/category");
      
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }
     
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