const express = require('express');
const router = new express.Router();
const Products = require('../models/productSchema')
const bcrypt = require("bcryptjs");
const USER = require('../models/userSchema')
const authenticate = require("../middleware/authenticate")

//get productsdata api
router.get('/getproducts', async (req, res) => {
  try {

    const productdata = await Products.find();
    //    console.log(productdata);
    res.status(201).json(productdata);
  } catch (error) {
    console.log("error" + error.message);
  }
})

//get product by collection
router.get('/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = { category:id };

    // Use the find method to retrieve the data
    Products.find(query)
    .then(data => {
      // Process the retrieved data
      res.status(201).json(data);
    })
    .catch(error => {
      // Handle the error
      console.error("error "+error.message);
    });
    // console.log
    
  }catch(error)
  {
    console.log("error "+error.message);
  }
})

// get individual detail
router.get('/productdetail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const individualData = await Products.findOne({ id: id });
    // console.log(individualDetail);
    res.status(201).json(individualData);
  } catch (error) {
    console.log("error" + error.message);
  }
});

//register data

router.post("/register",async(req,res)=>{
  // console.log(req.body);
  const {name, email, password, cpassword} = req.body;

  if(!name || !email || !password || !cpassword){
    res.status(422).json({error:"fill the all data"});
    console.log("no data available")
  }

  try{
    const preuser = await USER.findOne({email:email});

    if(preuser){
      res.status(422).json({error:"user already exist"});
    }
    else if(password !== cpassword)
    {
      res.status(422).json({error:"passwords not matched"});
    }else if(password.length < 6){
       res.status(422).json({error:"password must include atleast 6 characters"})
    }
    else{
      const finaluser = new USER({
        name, email, password, cpassword
      });

      //password hashing process


      const storedata = await finaluser.save();
      console.log(storedata);

      res.status(201).json(storedata);
    }
  }catch(error){
  console.log("Error "+error.message)
  }
})

//Login data
router.post("/login",async(req,res)=>{
  const {email, password} = req.body;

  if(!email || !password){
    res.status(400).json({error:"fill all data"})
  };

  try{

    
    const userLogin = await USER.findOne({email:email});

    if(userLogin){
      const isMatch = await bcrypt.compare(password,userLogin.password);
    //  console.log(isMatch);
    
      //token generate
      const token = await userLogin.generateAuthToken();
      // console.log(token);

      res.cookie("Amazonweb",token,{
        expires: new Date(Date.now()+ 900000),  //cookie expire in 15 min
        httpOnly:true
      })
     if(!isMatch){
      res.status(400).json({error:"Invalid credential"})
     }
     else{
      res.status(201).json(userLogin)
     }
    }else{
      res.status(400).json({error:"user not exist"});
    }
  }catch(error){
    res.status(400).json({error:"Invalid details"})
  }
});

//adding items to cart
router.post("/addCart/:id",authenticate, async(req,res)=>{
  try{
     const {id} = req.params;
     const cart = await Products.findOne({id:id});
     console.log(cart + "cart value");

     const userContact = await USER.findOne({_id:req.userID});
     console.log(userContact);
    
     if(userContact){
       const cartData = await userContact.addCartdata(cart);
       await userContact.save();
       console.log(cartData);
       res.status(201).json(userContact);
     }else{
      res.status(401).json({error:"invalid user"});
     }

  }catch(error){
    res.status(401).json({error:"invalid user"});
  }
})

module.exports = router;