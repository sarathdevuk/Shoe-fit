const mongoose= require("mongoose");
const categorySchema = mongoose.Schema({
  name: {
      type: String,
      required: true,
      unique:true,
  },
  unlist:{
    type:String,
    default:false
  }
})

module.exports = mongoose.model('Category', categorySchema);