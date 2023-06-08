const Products = require("./models/productSchema")
const productdata = require("./constants/productsData")

const DefaultData = async()=>{
    try{
    //   await Products.deleteMany({});
    //   const storeData = await Products.insertMany(productdata);
    //   Products.collection().find()
    }
    catch(error){
       console.log("error is"+error.message);
    }
}

module.exports = DefaultData;