const mongoose = require("mongoose"); // Erase if already required
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = process.env.KEY;
// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error ("not valid Email address")
        }
    }
  },
  password:{
  type:String,
  required:true,
  minlength: 6
  },
  cpassword:{
    type:String,
    required:true,
    minlength: 6
    },
  tokens : [
    {
        token : {
            type:String,
            required:true
        }
    }
  ],
  carts : Array
});

//Export the model
userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,12);
        this.cpassword = await bcrypt.hash(this.cpassword,12);
    }
   
    next();
})


//token generate process
userSchema.methods.generateAuthToken = async function(){
  try{
    let token = jwt.sign({_id:this._id},secretKey);
    this.tokens = [{token: token}];
    await this.save();
    return token;
  }catch(error){
    console.log(error);
  }
}

// add tocart data
userSchema.methods.addCartdata = async function(cart){
  try{
   this.carts = this.carts.concat(cart);
   await this.save();
   return this.carts;
  }catch(error){
   console.log(error);
  }
}

const USER = new mongoose.model("USER", userSchema);

module.exports = USER;