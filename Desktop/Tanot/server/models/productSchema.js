const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const productSchema = new mongoose.Schema(
  {
   id:{
    type: String,
    required: true
  },
   url:Array,
   title:String,
   price:[
     {mrp:Number},
     {price:Number},
     {discount:String}
   ],
   discount:String,
   category:String,
   description:String
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Products", productSchema);