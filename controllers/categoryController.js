const asyncHandler = require("express-async-handler")
const Category = require("../model/categoryModel")


const categoryController = {

  createCategory: asyncHandler(async (req, res) => {
    console.log("cat req:", req.body)
    const { name } = req.body
    const alreadyExist =await Category.find({name})
   if(alreadyExist){
      if(alreadyExist){
        res.render("admin/addCategory",{error:true ,message: "Category already Exist"})
      }

   }
    const category = await Category.create({ name })
    console.log(category);
    res.redirect("/admin/category")
  }),

  getAllCategory: asyncHandler(async (req, res) => {
    try {
      const category = await Category.find().lean()
      console.log("asdfsaf",category);
      res.status(200).render("admin/categoryManagement",{category})
    } catch (error) {
      
    }
   

  }),
  getCategoryById: asyncHandler(async (req, res) => {
    try {
      const category = await Category.findById(req.params.id).lean()
      
      res.status(200).render("editAddress",{category})
    } catch (error) {
      res.status(404)
      throw new Error("no category")
    }
  }),
  getAddCategory: (req,res)=>{
    res.render("admin/addCategory")
  },
  updateCategoryById: asyncHandler(async (req, res) => {
    
    try {

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
  }),
  unlistCategory: asyncHandler(async(req,res)=>{

    try {
          
    const category = await Category.findByIdAndUpdate(req.params.id,
      {
        $set:{unlist:true}
      })
     
      res.redirect("/admin/category")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("cant update")
    }

  }),
  listCategory: asyncHandler(async(req,res)=>{

    try {
          
    const category = await Category.findByIdAndUpdate(req.params.id,
      {
        $set:{unlist:false}
      },{new:true})
      console.log("lisdt",category);
      res.redirect("/admin/category")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("cant update")
    }

  }),




}


module.exports = categoryController