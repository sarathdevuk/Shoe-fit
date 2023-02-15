const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
});


module.exports =  mongoose.model('Offer', offerSchema);
