const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  name: {
    type: String,
    
  },
  description: {
    type: String,
    
  },
  image:{
    type :Object,

  },
  discount: {
    type: Number,
    
  },
  startDate: {
    type: Date,
    
  },
  endDate: {
    type: Date,
    
  },
  unlist :{
    type:Boolean,
    default:false,
    
  }
});


module.exports =  mongoose.model('Offer', offerSchema);
